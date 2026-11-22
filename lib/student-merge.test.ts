import { describe, expect, it } from "vitest";
import { mergeStudent } from "@/lib/student-merge";
import { createEmptyStudent } from "@/lib/students";
import { LIMITS } from "@/lib/studio-validation";
import type { Student } from "@/types/pilates";

const base: Student = { ...createEmptyStudent("a", "2026-01-01"), name: "Ana", slotIds: ["s1"] };
const note = (id: string) => ({ id, date: "2026-11-22", text: `nota ${id}` });

describe("mergeStudent", () => {
  it("junta campos diferentes mudados em dois aparelhos", () => {
    const merged = mergeStudent(base, { ...base, goals: "costas" }, { ...base, phone: "11 91234-5678" });
    expect(merged).toEqual({ ...base, goals: "costas", phone: "11 91234-5678" });
  });

  it("junta campos diferentes da ficha de saúde", () => {
    const next = { ...base, health: { ...base.health, surgeries: "joelho" } };
    const current = { ...base, health: { ...base.health, injuries: "ombro" } };
    expect(mergeStudent(base, next, current)?.health).toEqual({ ...base.health, injuries: "ombro", surgeries: "joelho" });
  });

  it("não escolhe entre dois valores do mesmo campo", () => {
    expect(mergeStudent(base, { ...base, goals: "A" }, { ...base, goals: "B" })).toBeNull();
    const health = (injuries: string) => ({ ...base, health: { ...base.health, injuries } });
    expect(mergeStudent(base, health("A"), health("B"))).toBeNull();
  });

  it("o mesmo valor nos dois não é conflito", () => {
    const edited = { ...base, goals: "igual" };
    expect(mergeStudent(base, edited, edited)).toEqual(edited);
  });

  it("notas e horários de cada aparelho ficam", () => {
    const next = { ...base, slotIds: ["s1", "s2"], evolution: [note("n1")] };
    const current = { ...base, slotIds: ["s1", "s3"], evolution: [note("n2")] };
    const merged = mergeStudent(base, next, current);
    expect(merged?.slotIds).toEqual(["s1", "s3", "s2"]);
    expect(merged?.evolution).toEqual([note("n2"), note("n1")]);
  });

  it("remove só o que a tela removeu e não traz de volta o que o outro removeu", () => {
    const before = { ...base, slotIds: ["s1", "s2"], evolution: [note("n1"), note("n2")] };
    const next = { ...before, slotIds: ["s2"], evolution: [note("n2")] };
    const current = { ...before, slotIds: ["s1"], evolution: [note("n1")] };
    const merged = mergeStudent(before, next, current);
    expect(merged?.slotIds).toEqual([]);
    expect(merged?.evolution).toEqual([]);
  });

  it("a ordem das chaves do banco não vira conflito", () => {
    const fee = { planId: "p1", customAmount: null, dueDay: 5 };
    const before = { ...base, monthlyFee: fee };
    const current = { ...base, monthlyFee: { dueDay: 5, planId: "p1", customAmount: null } };
    const next = { ...base, monthlyFee: { ...fee, dueDay: 10 } };
    expect(mergeStudent(before, next, current)?.monthlyFee?.dueDay).toBe(10);
  });

  it("não recria uma ficha apagada", () => {
    expect(mergeStudent(base, { ...base, goals: "costas" }, undefined)).toBeNull();
  });

  it("cria a ficha nova e aceita só o reenvio idêntico", () => {
    expect(mergeStudent(undefined, base, undefined)).toEqual(base);
    expect(mergeStudent(undefined, base, base)).toEqual(base);
    expect(mergeStudent(undefined, base, { ...base, name: "Outra" })).toBeNull();
  });

  it("recusa quando a soma das duas edições passa do limite", () => {
    const ids = (prefix: string) =>
      Array.from({ length: LIMITS.slotsPerStudent - 1 }, (_, i) => `${prefix}${i}`);
    const next = { ...base, slotIds: ["s1", ...ids("x")] };
    const current = { ...base, slotIds: ["s1", ...ids("y")] };
    expect(mergeStudent(base, next, current)).toBeNull();
  });
});
