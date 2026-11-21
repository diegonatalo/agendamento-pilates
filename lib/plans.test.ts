import { describe, expect, it } from "vitest";
import {
  feeAmount,
  findPlan,
  formatWeeklyClasses,
  slotsOverPlan,
  sortPlans,
  studentsOnPlan,
  validatePlan,
} from "@/lib/plans";
import { createEmptyStudent } from "@/lib/students";
import type { MonthlyFee, Plan, Student } from "@/types/pilates";

const plan = (id: string, weeklyClasses: number, amount: number): Plan => ({
  id,
  name: `${weeklyClasses}x por semana`,
  weeklyClasses,
  amount,
});

const plans = [plan("p2", 2, 280), plan("p1", 1, 180), plan("p3", 3, 360)];

const student = (id: string, overrides: Partial<Student> = {}): Student => ({
  ...createEmptyStudent(id, "2026-01-01"),
  name: `Aluno ${id}`,
  ...overrides,
});

const fee = (planId: string | null, customAmount: number | null): MonthlyFee => ({
  planId,
  customAmount,
  dueDay: 5,
});

describe("validatePlan", () => {
  const draft = { name: "4x por semana", weeklyClasses: 4, amount: 420 };

  it("aceita um plano completo", () => {
    expect(validatePlan(draft, plans)).toBeNull();
  });

  it("exige nome e recusa nome repetido, sem diferenciar maiúsculas", () => {
    expect(validatePlan({ ...draft, name: "  " }, plans)).toMatch(/nome/);
    expect(validatePlan({ ...draft, name: "2X POR SEMANA" }, plans)).toMatch(/Já existe/);
  });

  it("permite manter o próprio nome ao editar", () => {
    expect(validatePlan({ ...draft, name: "2x por semana" }, plans, "p2")).toBeNull();
  });

  it("valida aulas por semana e valor", () => {
    expect(validatePlan({ ...draft, weeklyClasses: 0 }, plans)).toMatch(/frequência/);
    expect(validatePlan({ ...draft, weeklyClasses: 8 }, plans)).toMatch(/frequência/);
    expect(validatePlan({ ...draft, weeklyClasses: 1.5 }, plans)).toMatch(/frequência/);
    expect(validatePlan({ ...draft, amount: 0 }, plans)).toMatch(/valor/);
    expect(validatePlan({ ...draft, amount: Number.NaN }, plans)).toMatch(/valor/);
  });
});

describe("sortPlans", () => {
  it("ordena por aulas por semana e depois pelo valor", () => {
    const list = [...plans, { ...plan("p2b", 2, 250), name: "2x promocional" }];
    expect(sortPlans(list).map((p) => p.id)).toEqual(["p1", "p2b", "p2", "p3"]);
  });
});

describe("feeAmount", () => {
  it("usa o preço atual do plano", () => {
    expect(feeAmount(fee("p2", null), plans)).toBe(280);
  });

  it("o valor combinado vale mais que o do plano", () => {
    expect(feeAmount(fee("p2", 250), plans)).toBe(250);
    expect(feeAmount(fee(null, 150), plans)).toBe(150);
  });

  it("é desconhecido sem plano válido e sem valor combinado", () => {
    expect(feeAmount(fee("sumiu", null), plans)).toBeNull();
    expect(findPlan("sumiu", plans)).toBeNull();
  });
});

describe("studentsOnPlan e slotsOverPlan", () => {
  const ana = student("a", { monthlyFee: fee("p2", null), slotIds: ["s1", "s2", "s3"] });
  const bia = student("b", { monthlyFee: fee("p2", null), slotIds: ["s1"], active: false });
  const caio = student("c", { monthlyFee: fee(null, 200), slotIds: ["s1", "s2"] });

  it("lista quem usa o plano, inclusive inativos", () => {
    expect(studentsOnPlan("p2", [ana, bia, caio]).map((s) => s.id)).toEqual(["a", "b"]);
  });

  it("conta os horários além do plano", () => {
    expect(slotsOverPlan(ana, plans)).toBe(1);
    expect(slotsOverPlan(bia, plans)).toBe(0);
    expect(slotsOverPlan(caio, plans)).toBe(0);
  });

  it("formata a frequência", () => {
    expect(formatWeeklyClasses(2)).toBe("2x por semana");
  });
});
