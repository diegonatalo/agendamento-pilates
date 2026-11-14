import { SESSION_DURATION_MINUTES } from "@/lib/constants";
import type { ClassSlot, TimeOfDay, Weekday } from "@/types/pilates";

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

const minutesToTime = (total: number): TimeOfDay => {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const endTime = (start: TimeOfDay): TimeOfDay =>
  minutesToTime(timeToMinutes(start) + SESSION_DURATION_MINUTES);

/** Duas sessões se sobrepõem se começam com menos de 1h de diferença no mesmo dia. */
export const slotsOverlap = (
  a: Pick<ClassSlot, "weekday" | "startTime">,
  b: Pick<ClassSlot, "weekday" | "startTime">,
): boolean =>
  a.weekday === b.weekday &&
  Math.abs(timeToMinutes(a.startTime) - timeToMinutes(b.startTime)) <
    SESSION_DURATION_MINUTES;

export const sortSlots = (slots: ClassSlot[]): ClassSlot[] =>
  [...slots].sort(
    (a, b) =>
      WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday) ||
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

export const formatSlot = (slot: ClassSlot): string =>
  `${WEEKDAY_LABELS[slot.weekday]}, ${slot.startTime} às ${endTime(slot.startTime)}`;

/** Forma curta para listas, por exemplo `Seg 08:00`. */
export const formatSlotShort = (slot: ClassSlot): string =>
  `${WEEKDAY_LABELS[slot.weekday].slice(0, 3)} ${slot.startTime}`;

/** Devolve a mensagem de erro, ou `null` se o horário pode ser adicionado. */
export const validateNewSlot = (
  candidate: Pick<ClassSlot, "weekday" | "startTime">,
  existing: ClassSlot[],
): string | null => {
  if (!isValidTime(candidate.startTime)) return "Informe um horário válido.";
  const clash = existing.find((slot) => slotsOverlap(slot, candidate));
  if (clash) return `Conflita com o horário de ${formatSlot(clash)}.`;
  return null;
};
