import "server-only";
import { eq } from "drizzle-orm";
import { DEFAULT_SETTINGS } from "@/lib/constants";
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
import type { StudioState } from "@/lib/studio-changes";
import {
  blockedFromRow,
  bookingFromRow,
  paymentFromRow,
  planFromRow,
  settingsFromRow,
  settingsToRow,
  slotFromRow,
  studentFromRow,
} from "./rows";

/**
 * Everything the app shows, for one account. On the first visit it creates the
 * settings row; `onConflictDoNothing` keeps two tabs opened at once from
 * creating it twice.
 */
export async function loadStudio(userId: string): Promise<StudioState> {
  await db.insert(studioSettings).values(settingsToRow(userId, DEFAULT_SETTINGS)).onConflictDoNothing();
  const [settingsRows, planRows, slotRows, studentRows, bookingRows, blockedRows, paymentRows] =
    await Promise.all([
      db.select().from(studioSettings).where(eq(studioSettings.userId, userId)),
      db.select().from(plans).where(eq(plans.userId, userId)),
      db.select().from(slots).where(eq(slots.userId, userId)),
      db.select().from(students).where(eq(students.userId, userId)),
      db.select().from(bookings).where(eq(bookings.userId, userId)),
      db.select().from(blockedPeriods).where(eq(blockedPeriods.userId, userId)),
      db.select().from(payments).where(eq(payments.userId, userId)),
    ]);
  const settings = settingsRows[0];
  return {
    settings: settings ? settingsFromRow(settings) : DEFAULT_SETTINGS,
    lastBackup: settings?.lastBackup ?? null,
    plans: planRows.map(planFromRow),
    slots: slotRows.map(slotFromRow),
    students: studentRows.map(studentFromRow),
    bookings: bookingRows.map(bookingFromRow),
    blockedPeriods: blockedRows.map(blockedFromRow),
    payments: paymentRows.map(paymentFromRow),
  };
}
