import {
  isValidTime,
  minutesToTime,
  slotsOverlap,
  timeToMinutes,
  WEEKDAY_ORDER,
  type SlotTiming,
} from "@/lib/slots";
import type { ClassSlot, TimeOfDay, Weekday } from "@/types/pilates";

/** Expediente do estúdio nos dias escolhidos. */
export type WorkHours = {
  weekdays: Weekday[];
  start: TimeOfDay;
  end: TimeOfDay;
  /** Pausa sem aulas no meio do expediente, como o almoço. */
  pause: { start: TimeOfDay; end: TimeOfDay } | null;
};

export type SlotCandidate = Pick<ClassSlot, "weekday" | "startTime">;

export type GeneratedGrid = {
  /** Horários novos, em ordem de dia e hora. */
  toCreate: SlotCandidate[];
  /** Horários que cairiam sobre um horário já cadastrado. */
  skipped: SlotCandidate[];
};

/** Devolve a mensagem de erro, ou `null` se o expediente é válido. */
export const validateWorkHours = (hours: WorkHours): string | null => {
  if (hours.weekdays.length === 0) return "Escolha pelo menos um dia.";
  if (!isValidTime(hours.start) || !isValidTime(hours.end))
    return "Informe o início e o fim do expediente.";
  if (timeToMinutes(hours.end) <= timeToMinutes(hours.start))
    return "O fim do expediente deve ser depois do início.";
  const { pause } = hours;
  if (pause) {
    if (!isValidTime(pause.start) || !isValidTime(pause.end))
      return "Informe o início e o fim da pausa.";
    if (timeToMinutes(pause.end) <= timeToMinutes(pause.start))
      return "O fim da pausa deve ser depois do início.";
    if (
      timeToMinutes(pause.start) < timeToMinutes(hours.start) ||
      timeToMinutes(pause.end) > timeToMinutes(hours.end)
    )
      return "A pausa deve ficar dentro do expediente.";
  }
  return null;
};

/** Inícios das sessões que cabem inteiras no expediente, respeitando a pausa. */
export const startTimesFor = (hours: WorkHours, timing: SlotTiming): TimeOfDay[] => {
  const end = timeToMinutes(hours.end);
  const pause = hours.pause
    ? { start: timeToMinutes(hours.pause.start), end: timeToMinutes(hours.pause.end) }
    : null;
  const step = timing.sessionMinutes + timing.breakMinutes;
  const times: TimeOfDay[] = [];
  let t = timeToMinutes(hours.start);
  while (t + timing.sessionMinutes <= end) {
    // Sessão que encostaria na pausa recomeça logo depois dela.
    if (pause && t < pause.end && t + timing.sessionMinutes > pause.start) {
      t = pause.end;
      continue;
    }
    times.push(minutesToTime(t));
    t += step;
  }
  return times;
};

/**
 * Monta a grade do expediente. Nunca remove nada: o que cairia sobre um
 * horário existente é listado em `skipped`.
 */
export const generateGrid = (
  hours: WorkHours,
  timing: SlotTiming,
  existing: ClassSlot[],
): GeneratedGrid => {
  const times = startTimesFor(hours, timing);
  const days = WEEKDAY_ORDER.filter((day) => hours.weekdays.includes(day));
  const grid: GeneratedGrid = { toCreate: [], skipped: [] };
  for (const weekday of days) {
    for (const startTime of times) {
      const candidate = { weekday, startTime };
      const clash = existing.some((slot) => slotsOverlap(slot, candidate, timing));
      (clash ? grid.skipped : grid.toCreate).push(candidate);
    }
  }
  return grid;
};
