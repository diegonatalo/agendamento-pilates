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
import { parseChanges } from "@/lib/studio-changes";
import {
  blockedToRow,
  bookingToRow,
  paymentToRow,
  planToRow,
  settingsToRow,
  slotToRow,
  studentToRow,
} from "./rows";

/*
 * Server Actions are public endpoints: each one checks the session again and
 * validates what arrived as `unknown`. Every write is limited to the rows of
 * the signed-in account (user_id).
 */

async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada. Entre de novo.");
  return user.id;
}

/** Postgres accepts up to 65535 parameters per query; big restores go in chunks. */
const CHUNK = 500;
const chunks = <T>(list: T[]) =>
  Array.from({ length: Math.ceil(list.length / CHUNK) }, (_, i) => list.slice(i * CHUNK, (i + 1) * CHUNK));

/** Sets every column except the key, for `onConflictDoUpdate`. */
const excluded = (table: PgTable, columns: string[]) =>
  Object.fromEntries(columns.map((c) => [c, sql.raw(`excluded."${(table as unknown as Record<string, { name: string }>)[c].name}"`)]));

/** Applies one batch of changes from the app, all or nothing. */
export async function saveChanges(input: unknown) {
  const userId = await requireUserId();
  const changes = parseChanges(input);
  if (!changes) throw new Error("Dados inválidos.");
  const { upsert, remove } = changes;

  await db.transaction(async (tx) => {
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
    for (const part of chunks(upsert.students.map((s) => studentToRow(userId, s))))
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
  });
}
