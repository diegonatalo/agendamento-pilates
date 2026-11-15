import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { findOverlap, formatMinutes, validateSettings } from "@/lib/settings";
import type { ClassSlot, StudioSettings } from "@/types/pilates";

const settings = (overrides: Partial<StudioSettings> = {}): StudioSettings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});

const slot = (id: string, weekday: ClassSlot["weekday"], startTime: string): ClassSlot => ({
  id,
  weekday,
  startTime,
});

describe("validateSettings", () => {
  it("aceita a configuração padrão", () => {
    expect(validateSettings(DEFAULT_SETTINGS, [])).toBeNull();
  });

  it("valida a duração", () => {
    expect(validateSettings(settings({ sessionMinutes: 50 }), [])).toBeNull();
    expect(validateSettings(settings({ sessionMinutes: 10 }), [])).toMatch(/duração/);
    expect(validateSettings(settings({ sessionMinutes: 200 }), [])).toMatch(/duração/);
    expect(validateSettings(settings({ sessionMinutes: 52 }), [])).toMatch(/de 5 em 5/);
    expect(validateSettings(settings({ sessionMinutes: Number.NaN }), [])).toMatch(/duração/);
  });

  it("valida o intervalo e a capacidade", () => {
    expect(validateSettings(settings({ breakMinutes: -5 }), [])).toMatch(/intervalo/);
    expect(validateSettings(settings({ capacity: 0 }), [])).toMatch(/capacidade/);
    expect(validateSettings(settings({ capacity: 2.5 }), [])).toMatch(/capacidade/);
  });

  it("recusa duração que sobrepõe horários já cadastrados", () => {
    const slots = [slot("a", 1, "08:00"), slot("b", 1, "09:00"), slot("c", 2, "08:30")];
    expect(validateSettings(settings({ sessionMinutes: 60 }), slots)).toBeNull();
    expect(validateSettings(settings({ sessionMinutes: 75 }), slots)).toMatch(
      /Seg 08:00 e Seg 09:00 ficariam sobrepostos/,
    );
    expect(validateSettings(settings({ breakMinutes: 10 }), slots)).toMatch(/sobrepostos/);
  });
});

describe("findOverlap", () => {
  it("ignora horários de dias diferentes", () => {
    expect(findOverlap([slot("a", 1, "08:00"), slot("b", 2, "08:00")], DEFAULT_SETTINGS)).toBeNull();
  });
});

describe("formatMinutes", () => {
  it("mostra minutos ou horas", () => {
    expect(formatMinutes(50)).toBe("50 min");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(90)).toBe("1h30");
  });
});
