import { DEFAULT_SETTINGS } from "@/lib/constants";
import type {
  ClassSlot,
  StudioSettings,
  TimeOfDay,
  Weekday,
} from "@/types/pilates";

/** O que define o tamanho de um horário na grade. */
export type SlotTiming = Pick<StudioSettings, "sessionMinutes" | "breakMinutes">;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

/** Ordem de exibição: segunda a domingo. */
export const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidTime = (time: TimeOfDay): boolean =>
  TIME_PATTERN.test(time);

export const timeToMinutes = (time: TimeOfDay): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (total: number): TimeOfDay => {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const endTime = (
  start: TimeOfDay,
  sessionMinutes: number = DEFAULT_SETTINGS.sessionMinutes,
): TimeOfDay => minutesToTime(timeToMinutes(start) + sessionMinutes);

/**
 * Duas sessões do mesmo dia conflitam se a segunda começa antes de a primeira
 * terminar somada ao intervalo entre sessões.
 */
export const slotsOverlap = (
  a: Pick<ClassSlot, "weekday" | "startTime">,
  b: Pick<ClassSlot, "weekday" | "startTime">,
  timing: SlotTiming = DEFAULT_SETTINGS,
): boolean =>
  a.weekday === b.weekday &&
  Math.abs(timeToMinutes(a.startTime) - timeToMinutes(b.startTime)) <
    timing.sessionMinutes + timing.breakMinutes;

export const sortSlots = (slots: ClassSlot[]): ClassSlot[] =>
  [...slots].sort(
    (a, b) =>
      WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday) ||
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

export const formatSlot = (
  slot: Pick<ClassSlot, "weekday" | "startTime">,
  sessionMinutes: number = DEFAULT_SETTINGS.sessionMinutes,
): string =>
  `${WEEKDAY_LABELS[slot.weekday]}, ${slot.startTime} às ${endTime(slot.startTime, sessionMinutes)}`;

/** Forma curta para listas, por exemplo `Seg 08:00`. */
export const formatSlotShort = (
  slot: Pick<ClassSlot, "weekday" | "startTime">,
): string =>
  `${WEEKDAY_LABELS[slot.weekday].slice(0, 3)} ${slot.startTime}`;

/** Devolve a mensagem de erro, ou `null` se o horário pode ser adicionado. */
export const validateNewSlot = (
  candidate: Pick<ClassSlot, "weekday" | "startTime">,
  existing: ClassSlot[],
  timing: SlotTiming = DEFAULT_SETTINGS,
): string | null => {
  if (!isValidTime(candidate.startTime)) return "Informe um horário válido.";
  const clash = existing.find((slot) => slotsOverlap(slot, candidate, timing));
  if (clash)
    return `Conflita com o horário de ${formatSlot(clash, timing.sessionMinutes)}.`;
  return null;
};

export type Occupancy = "empty" | "open" | "full";

/** Situação de um horário pela quantidade de alunos fixos. */
export const occupancyOf = (enrolled: number, capacity: number): Occupancy =>
  enrolled === 0 ? "empty" : enrolled >= capacity ? "full" : "open";

/** Todos os inícios de horário da semana, sem repetir, em ordem. */
export const startTimesOf = (slots: ClassSlot[]): TimeOfDay[] =>
  [...new Set(slots.map((slot) => slot.startTime))].sort(
    (a, b) => timeToMinutes(a) - timeToMinutes(b),
  );

/** Dias que têm pelo menos um horário, de segunda a domingo. */
export const weekdaysOf = (slots: ClassSlot[]): Weekday[] =>
  WEEKDAY_ORDER.filter((day) => slots.some((slot) => slot.weekday === day));
