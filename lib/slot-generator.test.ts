import { describe, expect, it } from "vitest";
import {
  generateGrid,
  startTimesFor,
  validateWorkHours,
  type WorkHours,
} from "@/lib/slot-generator";
import type { ClassSlot } from "@/types/pilates";

const hours = (overrides: Partial<WorkHours> = {}): WorkHours => ({
  weekdays: [1],
  start: "07:00",
  end: "10:00",
  pause: null,
  ...overrides,
});

const hourly = { sessionMinutes: 60, breakMinutes: 0 };

describe("validateWorkHours", () => {
  it("aceita um expediente completo", () => {
    expect(validateWorkHours(hours())).toBeNull();
    expect(validateWorkHours(hours({ pause: { start: "08:00", end: "09:00" } }))).toBeNull();
  });

  it("exige pelo menos um dia e horários válidos", () => {
    expect(validateWorkHours(hours({ weekdays: [] }))).toMatch(/dia/);
    expect(validateWorkHours(hours({ start: "" }))).toMatch(/início e o fim do expediente/);
    expect(validateWorkHours(hours({ end: "07:00" }))).toMatch(/depois do início/);
  });

  it("exige pausa válida e dentro do expediente", () => {
    expect(validateWorkHours(hours({ pause: { start: "09:00", end: "08:00" } }))).toMatch(
      /fim da pausa/,
    );
    expect(validateWorkHours(hours({ pause: { start: "06:00", end: "08:00" } }))).toMatch(
      /dentro do expediente/,
    );
    expect(validateWorkHours(hours({ pause: { start: "", end: "08:00" } }))).toMatch(
      /início e o fim da pausa/,
    );
  });
});

describe("startTimesFor", () => {
  it("encaixa sessões seguidas até o fim do expediente", () => {
    expect(startTimesFor(hours(), hourly)).toEqual(["07:00", "08:00", "09:00"]);
  });

  it("não cria sessão que passaria do fechamento", () => {
    expect(startTimesFor(hours({ end: "09:30" }), hourly)).toEqual(["07:00", "08:00"]);
  });

  it("respeita duração e intervalo entre sessões", () => {
    const timing = { sessionMinutes: 50, breakMinutes: 10 };
    expect(startTimesFor(hours({ end: "09:50" }), timing)).toEqual([
      "07:00",
      "08:00",
      "09:00",
    ]);
    expect(startTimesFor(hours({ end: "08:00" }), { sessionMinutes: 45, breakMinutes: 0 })).toEqual(
      ["07:00"],
    );
  });

  it("pula a pausa e recomeça no fim dela", () => {
    const withLunch = hours({ start: "10:00", end: "16:00", pause: { start: "12:00", end: "13:30" } });
    expect(startTimesFor(withLunch, hourly)).toEqual([
      "10:00",
      "11:00",
      "13:30",
      "14:30",
    ]);
  });
});

describe("generateGrid", () => {
  it("cria os horários de cada dia, de segunda a domingo", () => {
    const grid = generateGrid(hours({ weekdays: [0, 3, 1], end: "09:00" }), hourly, []);
    expect(grid.toCreate).toEqual([
      { weekday: 1, startTime: "07:00" },
      { weekday: 1, startTime: "08:00" },
      { weekday: 3, startTime: "07:00" },
      { weekday: 3, startTime: "08:00" },
      { weekday: 0, startTime: "07:00" },
      { weekday: 0, startTime: "08:00" },
    ]);
    expect(grid.skipped).toEqual([]);
  });

  it("pula o que cairia sobre um horário existente, sem remover nada", () => {
    const existing: ClassSlot[] = [{ id: "a", weekday: 1, startTime: "08:30" }];
    const grid = generateGrid(hours(), hourly, existing);
    expect(grid.toCreate).toEqual([{ weekday: 1, startTime: "07:00" }]);
    expect(grid.skipped).toEqual([
      { weekday: 1, startTime: "08:00" },
      { weekday: 1, startTime: "09:00" },
    ]);
  });
});
