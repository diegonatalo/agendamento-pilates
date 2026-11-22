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
import { parseChanges } from "@/lib/studio-changes";
import type { SaveResult } from "@/lib/studio-store";
import type { Student } from "@/types/pilates";
import {
  blockedToRow,
  bookingToRow,
  paymentToRow,
  planToRow,
  settingsToRow,
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
  const { upsert, remove } = changes;

  const write = async (tx: Tx) => {
    const editedStudents = await mergeStudents(tx, userId, upsert.students, changes.baseStudents);
    if (changes.settings) {
      await tx
        .update(studioSettings)
        .set(settingsToRow(userId, changes.settings))
        .where(eq(studioSettings.userId, userId));
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
