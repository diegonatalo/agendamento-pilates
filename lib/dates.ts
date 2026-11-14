import type { DateKey } from "@/types/pilates";

const pad = (value: number): string => String(value).padStart(2, "0");

/** Data local no formato `YYYY-MM-DD` (sem passar por UTC). */
export const toDateKey = (date: Date): DateKey =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
