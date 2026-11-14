import type { DateKey, Weekday } from "@/types/pilates";

const pad = (value: number): string => String(value).padStart(2, "0");

/** Data local no formato `YYYY-MM-DD` (sem passar por UTC). */
export const toDateKey = (date: Date): DateKey =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Data local à meia-noite. */
export const parseDateKey = (key: DateKey): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Aceita só datas que existem no calendário (rejeita `2026-02-31`). */
export const isValidDateKey = (key: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(key) && toDateKey(parseDateKey(key)) === key;

export const addDays = (key: DateKey, days: number): DateKey => {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

export const weekdayOf = (key: DateKey): Weekday =>
  parseDateKey(key).getDay() as Weekday;

/** Segunda-feira da semana da data. */
export const startOfWeek = (key: DateKey): DateKey =>
  addDays(key, -((weekdayOf(key) + 6) % 7));

/** `DD/MM/AAAA`. */
export const formatDateBr = (key: DateKey): string =>
  key.split("-").reverse().join("/");

/** `DD/MM`. */
export const formatDayMonth = (key: DateKey): string =>
  formatDateBr(key).slice(0, 5);
