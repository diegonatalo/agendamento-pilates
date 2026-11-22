import {
  LIMITS,
  isBlocked,
  isBooking,
  isIdValue,
  isPayment,
  isPaymentKey,
  isPlan,
  isRec,
  isSettings,
  isSlot,
  isStudent,
} from "@/lib/studio-validation";
import type {
  BlockedPeriod,
  Booking,
  ClassSlot,
  MonthKey,
  MonthlyPayment,
  Plan,
  Student,
  StudioSettings,
} from "@/types/pilates";

/** Everything the app keeps for one account. */
export type StudioState = {
  settings: StudioSettings;
  plans: Plan[];
  slots: ClassSlot[];
  students: Student[];
  bookings: Booking[];
  blockedPeriods: BlockedPeriod[];
  payments: MonthlyPayment[];
};

export type PaymentKey = { studentId: string; month: MonthKey };

/** Rows to write and to delete, per table. Lists keep the shape of `StudioState`. */
export type StudioChanges = {
  settings?: StudioSettings;
  /** How each edited record was before the edit: the server saves only what changed since. */
  baseStudents: Student[];
  upsert: {
    plans: Plan[];
    slots: ClassSlot[];
    students: Student[];
    bookings: Booking[];
    blockedPeriods: BlockedPeriod[];
    payments: MonthlyPayment[];
  };
  remove: {
    plans: string[];
    slots: string[];
    students: string[];
    bookings: string[];
    blockedPeriods: string[];
    payments: PaymentKey[];
  };
};

type ListKey = keyof StudioChanges["upsert"];

const LIST_KEYS: ListKey[] = ["plans", "slots", "students", "bookings", "blockedPeriods", "payments"];

export const paymentKey = (p: PaymentKey) => `${p.studentId}|${p.month}`;

const keyOf = (list: ListKey, item: unknown): string =>
  list === "payments" ? paymentKey(item as PaymentKey) : (item as { id: string }).id;

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

export const emptyChanges = (): StudioChanges => ({
  baseStudents: [],
  upsert: { plans: [], slots: [], students: [], bookings: [], blockedPeriods: [], payments: [] },
  remove: { plans: [], slots: [], students: [], bookings: [], blockedPeriods: [], payments: [] },
});

/** What changed from `prev` to `next`: new and edited rows, and rows that are gone. */
export const diffStudio = (prev: StudioState, next: StudioState): StudioChanges => {
  const changes = emptyChanges();
  if (!same(prev.settings, next.settings)) changes.settings = next.settings;
  for (const list of LIST_KEYS) {
    if (prev[list] === next[list]) continue;
    const before = new Map<string, unknown>(prev[list].map((item) => [keyOf(list, item), item]));
    const seen = new Set<string>();
    for (const item of next[list]) {
      const key = keyOf(list, item);
      seen.add(key);
      const old = before.get(key);
      if (old !== undefined && same(old, item)) continue;
      (changes.upsert[list] as unknown[]).push(item);
      if (list === "students" && old !== undefined) changes.baseStudents.push(old as Student);
    }
    for (const [key, item] of before) {
      if (seen.has(key)) continue;
      if (list === "payments") {
        const { studentId, month } = item as MonthlyPayment;
        changes.remove.payments.push({ studentId, month });
      } else (changes.remove[list] as string[]).push(key);
    }
  }
  return changes;
};

export const countChanges = (changes: StudioChanges): number =>
  (changes.settings ? 1 : 0) +
  LIST_KEYS.reduce((sum, list) => sum + changes.upsert[list].length + changes.remove[list].length, 0);

const UPSERT_GUARDS: Record<ListKey, (value: unknown) => boolean> = {
  plans: isPlan,
  slots: isSlot,
  students: isStudent,
  bookings: isBooking,
  blockedPeriods: isBlocked,
  payments: isPayment,
};

/**
 * Reads changes that arrived from the browser. Returns `null` when anything
 * is malformed or the batch is too large; nothing is saved in that case.
 */
export const parseChanges = (input: unknown): StudioChanges | null => {
  if (!isRec(input) || !isRec(input.upsert) || !isRec(input.remove)) return null;
  const { upsert, remove } = input;
  if (input.settings !== undefined && !isSettings(input.settings)) return null;
  let total = 0;
  for (const list of LIST_KEYS) {
    const added = upsert[list];
    const gone = remove[list];
    if (!Array.isArray(added) || !Array.isArray(gone)) return null;
    total += added.length + gone.length;
    if (total > LIMITS.recordsPerSave) return null;
    if (!added.every(UPSERT_GUARDS[list])) return null;
    if (!gone.every(list === "payments" ? isPaymentKey : isIdValue)) return null;
  }
  const { baseStudents } = input;
  if (!Array.isArray(baseStudents) || baseStudents.length > (upsert.students as unknown[]).length) return null;
  if (!baseStudents.every(isStudent)) return null;
  return input as unknown as StudioChanges;
};
