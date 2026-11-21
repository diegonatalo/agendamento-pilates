import { isValidDateKey } from "@/lib/dates";
import { isValidTime } from "@/lib/slots";

/**
 * Checks for each record of the studio. They read `unknown`, because the
 * backup file and the Server Actions accept anything, and enforce size limits
 * so a single request cannot fill the database.
 */

export const LIMITS = {
  shortText: 120,
  phone: 40,
  longText: 4000,
  slotsPerStudent: 50,
  evolutionNotes: 1000,
  /** Records in one save (a backup restore sends everything at once). */
  recordsPerSave: 20000,
  amount: 1_000_000,
} as const;

type Rec = Record<string, unknown>;

export const isRec = (value: unknown): value is Rec =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStr = (value: unknown, max: number = LIMITS.longText): value is string =>
  typeof value === "string" && value.length <= max;
const isId = (value: unknown): value is string => isStr(value, LIMITS.shortText) && value.length > 0;
const isNullableId = (value: unknown): boolean => value === null || isId(value);
const isDate = (value: unknown): boolean => typeof value === "string" && isValidDateKey(value);
const isNullableDate = (value: unknown): boolean => value === null || isDate(value);
const isMonth = (value: unknown): boolean => typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const isAmount = (value: unknown): boolean =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= LIMITS.amount;
const isIntIn = (value: unknown, min: number, max: number): boolean =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
const isOneOf = (value: unknown, options: readonly string[]): boolean =>
  typeof value === "string" && options.includes(value);

export const isSettings = (v: unknown): boolean =>
  isRec(v) &&
  isIntIn(v.sessionMinutes, 1, 600) &&
  isIntIn(v.breakMinutes, 0, 600) &&
  isIntIn(v.capacity, 1, 1000);

export const isPlan = (v: unknown): boolean =>
  isRec(v) &&
  isId(v.id) &&
  isStr(v.name, LIMITS.shortText) &&
  isIntIn(v.weeklyClasses, 0, 100) &&
  isAmount(v.amount);

export const isSlot = (v: unknown): boolean =>
  isRec(v) &&
  isId(v.id) &&
  isIntIn(v.weekday, 0, 6) &&
  typeof v.startTime === "string" &&
  isValidTime(v.startTime);

export const isStudent = (v: unknown): boolean => {
  if (!isRec(v)) return false;
  const health = v.health;
  const fee = v.monthlyFee;
  return (
    isId(v.id) &&
    isStr(v.name, LIMITS.shortText) &&
    isStr(v.phone, LIMITS.phone) &&
    isNullableDate(v.birthDate) &&
    isDate(v.startedAt) &&
    typeof v.active === "boolean" &&
    Array.isArray(v.slotIds) &&
    v.slotIds.length <= LIMITS.slotsPerStudent &&
    v.slotIds.every(isId) &&
    isRec(health) &&
    isStr(health.injuries) &&
    isStr(health.surgeries) &&
    isStr(health.restrictions) &&
    typeof health.medicalClearance === "boolean" &&
    isStr(health.emergencyContact, LIMITS.shortText) &&
    isStr(v.attention) &&
    isStr(v.goals) &&
    Array.isArray(v.evolution) &&
    v.evolution.length <= LIMITS.evolutionNotes &&
    v.evolution.every((n) => isRec(n) && isId(n.id) && isDate(n.date) && isStr(n.text)) &&
    (fee === null ||
      (isRec(fee) &&
        isNullableId(fee.planId) &&
        (fee.customAmount === null || isAmount(fee.customAmount)) &&
        (fee.planId !== null || fee.customAmount !== null) &&
        isIntIn(fee.dueDay, 1, 31)))
  );
};

export const isBooking = (v: unknown): boolean =>
  isRec(v) &&
  isId(v.id) &&
  isId(v.slotId) &&
  isDate(v.date) &&
  isOneOf(v.kind, ["regular", "makeup", "trial"]) &&
  isOneOf(v.status, ["scheduled", "present", "absent", "cancelled"]) &&
  isNullableId(v.studentId) &&
  (v.guestName === null || isStr(v.guestName, LIMITS.shortText));

export const isBlocked = (v: unknown): boolean =>
  isRec(v) &&
  isId(v.id) &&
  isDate(v.startDate) &&
  isDate(v.endDate) &&
  isStr(v.reason, LIMITS.shortText);

export const isPayment = (v: unknown): boolean =>
  isRec(v) &&
  isId(v.studentId) &&
  isMonth(v.month) &&
  typeof v.paid === "boolean" &&
  isNullableDate(v.paidAt) &&
  isAmount(v.amount);

export const isPaymentKey = (v: unknown): boolean => isRec(v) && isId(v.studentId) && isMonth(v.month);

export const isIdValue = isId;
export const isDateValue = isDate;
