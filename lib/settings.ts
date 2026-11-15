import { formatSlotShort, slotsOverlap } from "@/lib/slots";
import type { ClassSlot, StudioSettings } from "@/types/pilates";

export const SESSION_MINUTES_RANGE = { min: 15, max: 180, step: 5 } as const;
export const BREAK_MINUTES_OPTIONS = [0, 5, 10, 15, 20, 30] as const;
export const CAPACITY_RANGE = { min: 1, max: 30 } as const;

/** Primeiro par de horários que passaria a se sobrepor, ou `null`. */
export const findOverlap = (
  slots: ClassSlot[],
  settings: StudioSettings,
): [ClassSlot, ClassSlot] | null => {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slotsOverlap(slots[i], slots[j], settings)) return [slots[i], slots[j]];
    }
  }
  return null;
};

/** Devolve a mensagem de erro, ou `null` se as configurações podem ser salvas. */
export const validateSettings = (
  settings: StudioSettings,
  slots: ClassSlot[],
): string | null => {
  const { sessionMinutes, breakMinutes, capacity } = settings;
  const { min, max, step } = SESSION_MINUTES_RANGE;
  if (
    !Number.isInteger(sessionMinutes) ||
    sessionMinutes < min ||
    sessionMinutes > max ||
    sessionMinutes % step !== 0
  )
    return `A duração deve ficar entre ${min} e ${max} minutos, de ${step} em ${step}.`;
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 60)
    return "O intervalo entre sessões deve ficar entre 0 e 60 minutos.";
  if (
    !Number.isInteger(capacity) ||
    capacity < CAPACITY_RANGE.min ||
    capacity > CAPACITY_RANGE.max
  )
    return `A capacidade deve ficar entre ${CAPACITY_RANGE.min} e ${CAPACITY_RANGE.max} alunos.`;
  const overlap = findOverlap(slots, settings);
  if (overlap)
    return `Com essa duração, os horários ${formatSlotShort(overlap[0])} e ${formatSlotShort(overlap[1])} ficariam sobrepostos. Remova um deles antes.`;
  return null;
};

/** Por exemplo `50 min` ou `1h30`. */
export const formatMinutes = (total: number): string => {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, "0")}`;
};
