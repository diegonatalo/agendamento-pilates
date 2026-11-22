import { findOverlap } from "@/lib/settings";
import { mergeRecord, same } from "@/lib/three-way";
import type { Booking, ClassSlot, MonthlyPayment, Plan, Student, StudioSettings } from "@/types/pilates";

/** Merges the edited rows with the saved ones, by key. `null` when any of them is a conflict. */
export const mergeRows = <T extends object>(
  edited: T[],
  bases: T[],
  saved: T[],
  key: (row: T) => string,
  merge: (base: T | undefined, next: T, current: T | undefined) => T | null = mergeRecord,
): T[] | null => {
  const baseByKey = new Map(bases.map((row) => [key(row), row]));
  const savedByKey = new Map(saved.map((row) => [key(row), row]));
  const result: T[] = [];
  for (const next of edited) {
    const merged = merge(baseByKey.get(key(next)), next, savedByKey.get(key(next)));
    if (!merged) return null;
    result.push(merged);
  }
  return result;
};

/** Two valid edits together can make the grid overlap: that is a conflict too. */
export const mergeSettings = (
  base: StudioSettings,
  next: StudioSettings,
  current: StudioSettings,
  slots: ClassSlot[],
): StudioSettings | null => {
  const merged = mergeRecord(base, next, current);
  if (!merged) return null;
  const sameGrid = same(
    [merged.sessionMinutes, merged.breakMinutes],
    [current.sessionMinutes, current.breakMinutes],
  );
  return sameGrid || !findOverlap(slots, merged) ? merged : null;
};

/** Marking as paid what the other device already marked keeps the first date and amount. */
export const mergePayment = (
  base: MonthlyPayment | undefined,
  next: MonthlyPayment,
  current: MonthlyPayment | undefined,
): MonthlyPayment | null =>
  !base && current && current.paid === next.paid ? current : mergeRecord(base, next, current);

const attendanceOf = (booking: Booking) =>
  booking.kind === "regular" ? `${booking.slotId}|${booking.date}|${booking.studentId}` : null;

/**
 * Marking attendance creates a booking with a new id on each device. The same
 * mark is saved once; a different mark for the same student and class is a conflict.
 */
export const mergeBookings = (edited: Booking[], bases: Booking[], saved: Booking[]): Booking[] | null => {
  const merged = mergeRows(edited, bases, saved, (booking) => booking.id);
  if (!merged) return null;

  const known = new Set([...bases, ...saved].map((booking) => booking.id));
  const marks = new Map<string, Booking>();
  for (const booking of saved) {
    const attendance = attendanceOf(booking);
    if (attendance) marks.set(attendance, booking);
  }
  const result: Booking[] = [];
  for (const booking of merged) {
    const attendance = attendanceOf(booking);
    const existing = attendance && !known.has(booking.id) ? marks.get(attendance) : undefined;
    if (!existing) result.push(booking);
    else if (existing.status !== booking.status) return null;
  }
  return result;
};

/**
 * Whether the save would leave a record on a plan that does not exist: one this
 * batch removes, or one another device removed before this screen picked it.
 */
export const breaksPlans = (
  removed: string[],
  students: Student[],
  plans: Plan[],
  edited: Student[],
  bases: Student[],
): boolean => {
  const planOf = (student: Student | undefined) => student?.monthlyFee?.planId ?? null;
  const gone = new Set(removed);
  if (students.some((student) => gone.has(planOf(student) ?? ""))) return true;

  const existing = new Set(plans.map((plan) => plan.id));
  const baseById = new Map(bases.map((student) => [student.id, student]));
  return edited.some((student) => {
    const planId = planOf(student);
    return planId !== null && planId !== planOf(baseById.get(student.id)) && !existing.has(planId);
  });
};
