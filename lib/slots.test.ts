import { describe, expect, it } from "vitest";
import {
  endTime,
  formatSlot,
  formatSlotShort,
  isValidTime,
  slotsOverlap,
  sortSlots,
  validateNewSlot,
} from "@/lib/slots";
import type { ClassSlot } from "@/types/pilates";

const slot = (id: string, weekday: ClassSlot["weekday"], startTime: string) =>
  ({ id, weekday, startTime }) satisfies ClassSlot;

describe("isValidTime", () => {
  it("aceita HH:mm válido", () => {
    expect(isValidTime("08:00")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
  });

  it("recusa formatos e valores inválidos", () => {
    expect(isValidTime("")).toBe(false);
    expect(isValidTime("8:00")).toBe(false);
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("10:60")).toBe(false);
  });
});

describe("endTime", () => {
  it("soma 1h ao início", () => {
    expect(endTime("08:00")).toBe("09:00");
    expect(endTime("17:30")).toBe("18:30");
  });
});

describe("slotsOverlap", () => {
  it("detecta o mesmo horário no mesmo dia", () => {
    expect(slotsOverlap(slot("a", 1, "08:00"), slot("b", 1, "08:00"))).toBe(true);
  });

  it("detecta início a menos de 1h de diferença", () => {
    expect(slotsOverlap(slot("a", 1, "08:00"), slot("b", 1, "08:30"))).toBe(true);
  });

  it("permite horários seguidos (exatamente 1h de diferença)", () => {
    expect(slotsOverlap(slot("a", 1, "08:00"), slot("b", 1, "09:00"))).toBe(false);
  });

  it("ignora dias diferentes", () => {
    expect(slotsOverlap(slot("a", 1, "08:00"), slot("b", 2, "08:00"))).toBe(false);
  });
});

describe("sortSlots", () => {
  it("ordena de segunda a domingo e por hora, sem alterar a entrada", () => {
    const input = [
      slot("a", 0, "09:00"),
      slot("b", 2, "18:00"),
      slot("c", 1, "10:00"),
      slot("d", 2, "07:00"),
    ];
    expect(sortSlots(input).map((s) => s.id)).toEqual(["c", "d", "b", "a"]);
    expect(input[0].id).toBe("a");
  });
});

describe("formatSlot", () => {
  it("mostra dia e intervalo", () => {
    expect(formatSlot(slot("a", 3, "08:00"))).toBe("Quarta, 08:00 às 09:00");
  });

  it("tem forma curta", () => {
    expect(formatSlotShort(slot("a", 3, "08:00"))).toBe("Qua 08:00");
  });
});

describe("validateNewSlot", () => {
  const existing = [slot("a", 1, "08:00")];

  it("aceita um horário livre", () => {
    expect(validateNewSlot({ weekday: 1, startTime: "09:00" }, existing)).toBeNull();
  });

  it("recusa horário inválido", () => {
    expect(validateNewSlot({ weekday: 1, startTime: "" }, existing)).toMatch(
      /horário válido/,
    );
  });

  it("recusa conflito e cita o horário existente", () => {
    expect(validateNewSlot({ weekday: 1, startTime: "08:30" }, existing)).toMatch(
      /Segunda, 08:00 às 09:00/,
    );
  });
});
