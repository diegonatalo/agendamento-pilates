import type { StudioSettings } from "@/types/pilates";

/** Configuração de uma conta nova, antes de escolher o ramo. */
export const DEFAULT_SETTINGS: StudioSettings = {
  businessType: null,
  sessionMinutes: 60,
  breakMinutes: 0,
  capacity: 3,
};
