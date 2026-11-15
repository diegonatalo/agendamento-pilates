import { describe, expect, it } from "vitest";
import {
  createEmptyStudent,
  initialsOf,
  removeSlotFromStudents,
  slotHasVacancy,
  sortStudents,
  studentsInSlot,
  validateStudent,
  whatsappLink,
} from "@/lib/students";
import type { Student } from "@/types/pilates";

const student = (id: string, overrides: Partial<Student> = {}): Student => ({
  ...createEmptyStudent(id, "2026-01-01"),
  name: `Aluno ${id}`,
  ...overrides,
});

describe("createEmptyStudent", () => {
  it("começa ativo, sem horários e com a data de início", () => {
    const created = createEmptyStudent("x", "2026-05-10");
    expect(created).toMatchObject({
      id: "x",
      active: true,
      slotIds: [],
      startedAt: "2026-05-10",
      monthlyFee: null,
    });
  });
});

describe("validateStudent", () => {
  it("exige nome", () => {
    expect(validateStudent(student("a", { name: "  " }))).toMatch(/nome/);
  });

  it("aceita aluno sem mensalidade", () => {
    expect(validateStudent(student("a"))).toBeNull();
  });

  it("valida o valor e o dia de vencimento", () => {
    const withFee = (amount: number, dueDay: number) =>
      student("a", { monthlyFee: { amount, dueDay } });
    expect(validateStudent(withFee(200, 5))).toBeNull();
    expect(validateStudent(withFee(Number.NaN, 5))).toMatch(/valor/);
    expect(validateStudent(withFee(-1, 5))).toMatch(/valor/);
    expect(validateStudent(withFee(200, 0))).toMatch(/vencimento/);
    expect(validateStudent(withFee(200, 32))).toMatch(/vencimento/);
    expect(validateStudent(withFee(200, 1.5))).toMatch(/vencimento/);
  });
});

describe("vagas por horário", () => {
  const students = [
    student("a", { slotIds: ["s1"] }),
    student("b", { slotIds: ["s1"] }),
    student("c", { slotIds: ["s1"], active: false }),
    student("d", { slotIds: ["s2"] }),
  ];

  it("conta só alunos ativos matriculados", () => {
    expect(studentsInSlot("s1", students).map((s) => s.id)).toEqual(["a", "b"]);
  });

  it("tem vaga abaixo de 3 alunos e não tem com 3", () => {
    expect(slotHasVacancy("s1", students)).toBe(true);
    const full = [...students, student("e", { slotIds: ["s1"] })];
    expect(slotHasVacancy("s1", full)).toBe(false);
  });
});

describe("sortStudents", () => {
  it("ordena por nome sem diferenciar acento", () => {
    const sorted = sortStudents([
      student("1", { name: "Zélia" }),
      student("2", { name: "Ana" }),
      student("3", { name: "Álvaro" }),
    ]);
    expect(sorted.map((s) => s.name)).toEqual(["Álvaro", "Ana", "Zélia"]);
  });
});

describe("removeSlotFromStudents", () => {
  it("tira o horário só de quem o tinha", () => {
    const result = removeSlotFromStudents(
      [student("a", { slotIds: ["s1", "s2"] }), student("b", { slotIds: ["s2"] })],
      "s1",
    );
    expect(result.map((s) => s.slotIds)).toEqual([["s2"], ["s2"]]);
  });
});

describe("whatsappLink", () => {
  it("adiciona o código do Brasil e ignora a pontuação", () => {
    expect(whatsappLink("(11) 91234-5678")).toBe("https://wa.me/5511912345678");
  });

  it("mantém o 55 quando já informado", () => {
    expect(whatsappLink("+55 11 91234-5678")).toBe("https://wa.me/5511912345678");
  });

  it("devolve null para telefone curto ou vazio", () => {
    expect(whatsappLink("")).toBeNull();
    expect(whatsappLink("1234")).toBeNull();
  });
});

describe("initialsOf", () => {
  it("usa a primeira e a última palavra do nome", () => {
    expect(initialsOf("Ana Beatriz de Albuquerque Montenegro")).toBe("AM");
    expect(initialsOf("maria silva")).toBe("MS");
  });

  it("nome de uma palavra tem uma inicial", () => {
    expect(initialsOf("Ana")).toBe("A");
  });

  it("ignora espaços sobrando e cobre nome vazio", () => {
    expect(initialsOf("  Ana   Lima ")).toBe("AL");
    expect(initialsOf("   ")).toBe("?");
  });
});
