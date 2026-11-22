import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { countChanges, diffStudio, emptyChanges, parseChanges, type StudioState } from "@/lib/studio-changes";
import { LIMITS } from "@/lib/studio-validation";
import { createEmptyStudent } from "@/lib/students";

const base: StudioState = {
  settings: DEFAULT_SETTINGS,
  plans: [{ id: "p1", name: "1x", weeklyClasses: 1, amount: 200 }],
  slots: [
    { id: "s1", weekday: 1, startTime: "08:00" },
    { id: "s2", weekday: 2, startTime: "09:00" },
  ],
  students: [{ ...createEmptyStudent("a", "2026-01-01"), name: "Ana", slotIds: ["s1"] }],
  bookings: [],
  blockedPeriods: [],
  payments: [{ studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-05", amount: 200 }],
};

describe("diffStudio", () => {
  it("sem mudança, não manda nada", () => {
    expect(countChanges(diffStudio(base, { ...base }))).toBe(0);
  });

  it("manda só as linhas novas, editadas e removidas", () => {
    const next: StudioState = {
      ...base,
      slots: [{ ...base.slots[0], startTime: "08:30" }, { id: "s3", weekday: 3, startTime: "10:00" }],
    };
    const changes = diffStudio(base, next);
    expect(changes.upsert.slots.map((s) => s.id)).toEqual(["s1", "s3"]);
    expect(changes.remove.slots).toEqual(["s2"]);
    expect(countChanges(changes)).toBe(3);
  });

  it("uma cópia igual não conta como edição", () => {
    const next = { ...base, students: base.students.map((s) => ({ ...s })) };
    expect(countChanges(diffStudio(base, next))).toBe(0);
  });

  it("pagamentos são identificados pelo aluno e pelo mês", () => {
    const changes = diffStudio(base, { ...base, payments: [] });
    expect(changes.remove.payments).toEqual([{ studentId: "a", month: "2026-11" }]);
  });

  it("manda como a ficha editada era antes, e nada disso para a ficha nova", () => {
    const edited = { ...base.students[0], goals: "costas" };
    const created = { ...base.students[0], id: "b" };
    const changes = diffStudio(base, { ...base, students: [edited, created] });
    expect(changes.upsert.students).toEqual([edited, created]);
    expect(changes.baseStudents).toEqual(base.students);
  });

  it("inclui as configurações só quando mudam", () => {
    const changes = diffStudio(base, { ...base, settings: { ...DEFAULT_SETTINGS, capacity: 5 } });
    expect(changes.settings?.capacity).toBe(5);
    expect(diffStudio(base, base).settings).toBeUndefined();
  });
});

describe("parseChanges", () => {
  it("aceita o que o diff produz", () => {
    const changes = diffStudio({ ...base, slots: [], students: [] }, base);
    expect(parseChanges(JSON.parse(JSON.stringify(changes)))).toEqual(changes);
  });

  it("recusa formato inválido", () => {
    expect(parseChanges(null)).toBeNull();
    expect(parseChanges({ upsert: {}, remove: {} })).toBeNull();
    const bad = emptyChanges();
    (bad.upsert.slots as unknown[]).push({ id: "x", weekday: 9, startTime: "08:00" });
    expect(parseChanges(bad)).toBeNull();
  });

  it("recusa a versão anterior ausente, inválida ou sem edição", () => {
    const changes = emptyChanges();
    expect(parseChanges({ ...changes, baseStudents: undefined })).toBeNull();
    expect(parseChanges({ ...changes, baseStudents: base.students })).toBeNull();
    changes.upsert.students.push(base.students[0]);
    expect(parseChanges({ ...changes, baseStudents: [{ id: "a" }] })).toBeNull();
  });

  it("recusa texto longo demais e lotes grandes demais", () => {
    const long = emptyChanges();
    long.upsert.students.push({ ...base.students[0], name: "x".repeat(LIMITS.shortText + 1) });
    expect(parseChanges(long)).toBeNull();

    const huge = emptyChanges();
    huge.remove.bookings = Array.from({ length: LIMITS.recordsPerSave + 1 }, (_, i) => `b${i}`);
    expect(parseChanges(huge)).toBeNull();
  });

  it("recusa configurações fora do formato", () => {
    expect(parseChanges({ ...emptyChanges(), settings: { capacity: "3" } })).toBeNull();
    expect(parseChanges({ ...emptyChanges(), settings: DEFAULT_SETTINGS })).not.toBeNull();
  });
});
