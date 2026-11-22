"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import {
  blockedPeriods,
  bookings,
  payments,
  plans,
  slots,
  students,
  studioSettings,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { mergeStudent } from "@/lib/student-merge";
import { parseChanges, paymentKey, type StudioChanges } from "@/lib/studio-changes";
import { breaksPlans, mergeBookings, mergePayment, mergeRows, mergeSettings } from "@/lib/studio-merge";
import type { SaveResult } from "@/lib/studio-store";
import type { Student } from "@/types/pilates";
import {
  blockedFromRow,
  blockedToRow,
  bookingFromRow,
  bookingToRow,
  paymentFromRow,
  paymentToRow,
  planFromRow,
  planToRow,
  settingsFromRow,
  settingsToRow,
  slotFromRow,
  slotToRow,
  studentFromRow,
  studentToRow,
} from "./rows";

/*
 * Server Actions are public endpoints: each one checks the session again and
 * validates what arrived as `unknown`. Every write is limited to the rows of
 * the signed-in account (user_id).
 *
 * The first argument is the account the screen was loaded for. It grants nothing:
 * it only makes the action refuse when another account signed in on another tab,
 * instead of writing one person's data into the other's account.
 */

async function requireUserId(owner: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada. Entre de novo.");
  if (user.id !== owner) throw new Error("Outra conta entrou neste navegador.");
  return user.id;
}

/** Postgres accepts up to 65535 parameters per query; big restores go in chunks. */
const CHUNK = 500;
const chunks = <T>(list: T[]) =>
  Array.from({ length: Math.ceil(list.length / CHUNK) }, (_, i) => list.slice(i * CHUNK, (i + 1) * CHUNK));

/** Sets every column except the key, for `onConflictDoUpdate`. */
const excluded = (table: PgTable, columns: string[]) =>
  Object.fromEntries(columns.map((c) => [c, sql.raw(`excluded."${(table as unknown as Record<string, { name: string }>)[c].name}"`)]));

class ConflictError extends Error {}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const orConflict = <T>(value: T | null): T => {
  if (value === null) throw new ConflictError();
  return value;
};

/** The settings row stays locked, so one account's saves go one at a time. */
async function lockAccount(tx: Tx, userId: string) {
  const [row] = await tx.select().from(studioSettings).where(eq(studioSettings.userId, userId)).for("update");
  return row;
}

/**
 * The other edited rows, on top of what other devices saved. Each kind is read
 * only when the batch changes it.
 */
async function mergeOthers(tx: Tx, userId: string, { upsert, before }: StudioChanges) {
  const merged = { ...upsert };
  if (upsert.plans.length) {
    const saved = await tx.select().from(plans).where(eq(plans.userId, userId));
    merged.plans = orConflict(mergeRows(upsert.plans, before.plans, saved.map(planFromRow), (p) => p.id));
  }
  if (upsert.slots.length) {
    const saved = await tx.select().from(slots).where(eq(slots.userId, userId));
    merged.slots = orConflict(mergeRows(upsert.slots, before.slots, saved.map(slotFromRow), (s) => s.id));
  }
  if (upsert.blockedPeriods.length) {
    const saved = await tx.select().from(blockedPeriods).where(eq(blockedPeriods.userId, userId));
    merged.blockedPeriods = orConflict(
      mergeRows(upsert.blockedPeriods, before.blockedPeriods, saved.map(blockedFromRow), (b) => b.id),
    );
  }
  if (upsert.bookings.length) {
    const dates = [...new Set([...upsert.bookings, ...before.bookings].map((b) => b.date))];
    const saved = [];
    for (const part of chunks(dates))
      saved.push(...(await tx.select().from(bookings).where(and(eq(bookings.userId, userId), inArray(bookings.date, part)))));
    merged.bookings = orConflict(mergeBookings(upsert.bookings, before.bookings, saved.map(bookingFromRow)));
  }
  if (upsert.payments.length) {
    const months = [...new Set(upsert.payments.map((p) => p.month))];
    const saved = [];
    for (const part of chunks(months))
      saved.push(...(await tx.select().from(payments).where(and(eq(payments.userId, userId), inArray(payments.month, part)))));
    merged.payments = orConflict(
      mergeRows(upsert.payments, before.payments, saved.map(paymentFromRow), paymentKey, mergePayment),
    );
  }
  return merged;
}

/**
 * The records to write, on top of what other devices saved. The rows stay
 * locked until the transaction ends, so nothing changes between read and write.
 */
async function mergeStudents(tx: Tx, userId: string, edited: Student[], bases: Student[]) {
  const baseById = new Map(bases.map((s) => [s.id, s]));
  const savedById = new Map<string, Student>();
  for (const part of chunks(edited.map((s) => s.id))) {
    const rows = await tx
      .select()
      .from(students)
      .where(and(eq(students.userId, userId), inArray(students.id, part)))
      .orderBy(students.id)
      .for("update");
    for (const row of rows) savedById.set(row.id, studentFromRow(row));
  }
  return edited.map((next) => {
    const merged = mergeStudent(baseById.get(next.id), next, savedById.get(next.id));
    if (!merged) throw new ConflictError();
    return merged;
  });
}

/** Applies one batch of changes from the app, all or nothing. */
export async function saveChanges(owner: unknown, input: unknown): Promise<SaveResult> {
  const userId = await requireUserId(owner);
  const changes = parseChanges(input);
  if (!changes) throw new Error("Dados inválidos.");
  const { before, remove } = changes;

  const write = async (tx: Tx) => {
    const account = await lockAccount(tx, userId);
    const editedStudents = await mergeStudents(tx, userId, changes.upsert.students, before.students);
    const upsert = await mergeOthers(tx, userId, changes);
    if (changes.settings && before.settings) {
      if (!account) throw new ConflictError();
      const grid = await tx.select().from(slots).where(eq(slots.userId, userId));
      const merged = orConflict(
        mergeSettings(before.settings, changes.settings, settingsFromRow(account), grid.map(slotFromRow)),
      );
      await tx.update(studioSettings).set(settingsToRow(userId, merged)).where(eq(studioSettings.userId, userId));
    }

    for (const [table, ids] of [
      [plans, remove.plans],
      [slots, remove.slots],
      [students, remove.students],
      [bookings, remove.bookings],
      [blockedPeriods, remove.blockedPeriods],
    ] as const) {
      for (const part of chunks(ids))
        await tx.delete(table).where(and(eq(table.userId, userId), inArray(table.id, part)));
    }
    for (const key of remove.payments) {
      await tx
        .delete(payments)
        .where(
          and(eq(payments.userId, userId), eq(payments.studentId, key.studentId), eq(payments.month, key.month)),
        );
    }

    for (const part of chunks(upsert.plans.map((p) => planToRow(userId, p))))
      await tx
        .insert(plans)
        .values(part)
        .onConflictDoUpdate({ target: [plans.userId, plans.id], set: excluded(plans, ["name", "weeklyClasses", "amount"]) });
    for (const part of chunks(upsert.slots.map((s) => slotToRow(userId, s))))
      await tx
        .insert(slots)
        .values(part)
        .onConflictDoUpdate({ target: [slots.userId, slots.id], set: excluded(slots, ["weekday", "startTime"]) });
    for (const part of chunks(editedStudents.map((s) => studentToRow(userId, s))))
      await tx
        .insert(students)
        .values(part)
        .onConflictDoUpdate({
          target: [students.userId, students.id],
          set: excluded(students, [
            "name",
            "phone",
            "birthDate",
            "startedAt",
            "active",
            "slotIds",
            "health",
            "attention",
            "goals",
            "evolution",
            "monthlyFee",
          ]),
        });
    for (const part of chunks(upsert.bookings.map((b) => bookingToRow(userId, b))))
      await tx
        .insert(bookings)
        .values(part)
        .onConflictDoUpdate({
          target: [bookings.userId, bookings.id],
          set: excluded(bookings, ["slotId", "date", "kind", "status", "studentId", "guestName"]),
        });
    for (const part of chunks(upsert.blockedPeriods.map((b) => blockedToRow(userId, b))))
      await tx
        .insert(blockedPeriods)
        .values(part)
        .onConflictDoUpdate({
          target: [blockedPeriods.userId, blockedPeriods.id],
          set: excluded(blockedPeriods, ["startDate", "endDate", "reason"]),
        });
    for (const part of chunks(upsert.payments.map((p) => paymentToRow(userId, p))))
      await tx
        .insert(payments)
        .values(part)
        .onConflictDoUpdate({
          target: [payments.userId, payments.studentId, payments.month],
          set: excluded(payments, ["paid", "paidAt", "amount"]),
        });

    if (remove.plans.length || editedStudents.some((s) => s.monthlyFee?.planId)) {
      const [studentRows, planRows] = [
        await tx.select().from(students).where(eq(students.userId, userId)),
        await tx.select().from(plans).where(eq(plans.userId, userId)),
      ];
      const savedStudents = studentRows.map(studentFromRow);
      // a rollback of the whole batch, if it would leave a record without its plan
      if (breaksPlans(remove.plans, savedStudents, planRows.map(planFromRow), changes.upsert.students, before.students))
        throw new ConflictError();
    }
  };

  try {
    await db.transaction(write);
    return "saved";
  } catch (error) {
    if (error instanceof ConflictError) return "conflict";
    // The driver's error carries the query values (health data): only its code may be logged.
    const code = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
    console.error("saveChanges failed", typeof code === "string" ? code : "no code");
    throw new Error("Não foi possível salvar.");
  }
}
