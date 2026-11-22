import { isStudent } from "@/lib/studio-validation";
import { CONFLICT, pick, same } from "@/lib/three-way";
import type { Student } from "@/types/pilates";

/** Applies what was added and removed to the saved list. Items are never edited in place. */
const mergeList = <T>(base: T[], next: T[], current: T[], key: (item: T) => string): T[] => {
  const before = new Set(base.map(key));
  const after = new Set(next.map(key));
  const present = new Set(current.map(key));
  const kept = current.filter((item) => !before.has(key(item)) || after.has(key(item)));
  const added = next.filter((item) => !before.has(key(item)) && !present.has(key(item)));
  return [...kept, ...added];
};

const FIELDS = ["name", "phone", "birthDate", "startedAt", "active", "attention", "goals", "monthlyFee"] as const;
const HEALTH = ["injuries", "surgeries", "restrictions", "medicalClearance", "emergencyContact"] as const;

/**
 * What to save when a record was edited on a screen that may be out of date.
 *
 * - `base`: what the screen had before the edit (absent for a new record);
 * - `next`: what the screen sent;
 * - `current`: what is saved now (absent if it was deleted).
 *
 * Only what the screen changed is applied, so another device's edits stay.
 * Returns `null` when that cannot be done without losing one of the edits.
 */
export const mergeStudent = (
  base: Student | undefined,
  next: Student,
  current: Student | undefined,
): Student | null => {
  if (!current) return base ? null : next;
  if (!base) return same(next, current) ? current : null;

  const merged: Record<string, unknown> = { ...current };
  for (const key of FIELDS) {
    const value = pick<unknown>(base[key], next[key], current[key]);
    if (value === CONFLICT) return null;
    merged[key] = value;
  }
  const health: Record<string, unknown> = { ...current.health };
  for (const key of HEALTH) {
    const value = pick<unknown>(base.health[key], next.health[key], current.health[key]);
    if (value === CONFLICT) return null;
    health[key] = value;
  }
  merged.health = health;
  merged.slotIds = mergeList(base.slotIds, next.slotIds, current.slotIds, (id) => id);
  merged.evolution = mergeList(base.evolution, next.evolution, current.evolution, (note) => note.id);

  // two valid edits together can pass a limit
  return isStudent(merged) ? (merged as Student) : null;
};
