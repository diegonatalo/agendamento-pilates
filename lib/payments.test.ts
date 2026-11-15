import { describe, expect, it } from "vitest";
import {
  addMonths,
  dueDateOf,
  formatCurrency,
  formatMonth,
  isBilledIn,
  monthOf,
  paymentStatus,
  removePaymentsOfStudent,
  setPayment,
  summarizeMonth,
} from "@/lib/payments";
import { createEmptyStudent } from "@/lib/students";
import type { MonthlyFee, MonthlyPayment, Plan, Student } from "@/types/pilates";

function fee(customAmount: number, dueDay: number): MonthlyFee {
  return { planId: null, customAmount, dueDay };
}

const student = (id: string, overrides: Partial<Student> = {}): Student => ({
  ...createEmptyStudent(id, "2026-01-10"),
  name: `Aluno ${id}`,
  monthlyFee: fee(200, 5),
  ...overrides,
});

const paid = (
  studentId: string,
  month: string,
  amount = 200,
): MonthlyPayment => ({
  studentId,
  month,
  paid: true,
  paidAt: `${month}-03`,
  amount,
});

describe("meses", () => {
  it("extrai o mês de uma data", () => {
    expect(monthOf("2026-11-09")).toBe("2026-11");
  });

  it("soma e subtrai meses atravessando o ano", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-11", 0)).toBe("2026-11");
    expect(addMonths("2026-03", 12)).toBe("2027-03");
  });

  it("formata o nome do mês", () => {
    expect(formatMonth("2026-11")).toBe("novembro de 2026");
    expect(formatMonth("2027-03")).toBe("março de 2027");
  });
});

describe("formatCurrency", () => {
  it("usa o formato brasileiro", () => {
    expect(formatCurrency(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});

describe("dueDateOf", () => {
  it("monta a data de vencimento", () => {
    expect(dueDateOf("2026-11", 5)).toBe("2026-11-05");
  });

  it("dia 31 em mês curto cai no último dia", () => {
    expect(dueDateOf("2026-02", 31)).toBe("2026-02-28");
    expect(dueDateOf("2028-02", 31)).toBe("2028-02-29");
    expect(dueDateOf("2026-04", 31)).toBe("2026-04-30");
  });
});

describe("isBilledIn", () => {
  it("cobra aluno ativo com mensalidade a partir do mês de início", () => {
    expect(isBilledIn(student("a"), "2026-01")).toBe(true);
    expect(isBilledIn(student("a"), "2026-11")).toBe(true);
    expect(isBilledIn(student("a"), "2025-12")).toBe(false);
  });

  it("não cobra inativo nem quem não tem mensalidade", () => {
    expect(isBilledIn(student("a", { active: false }), "2026-11")).toBe(false);
    expect(isBilledIn(student("a", { monthlyFee: null }), "2026-11")).toBe(false);
  });
});

describe("paymentStatus", () => {
  const month = "2026-11";

  it("pendente antes e no dia do vencimento", () => {
    expect(paymentStatus(student("a"), month, [], "2026-11-01")).toBe("pending");
    expect(paymentStatus(student("a"), month, [], "2026-11-05")).toBe("pending");
  });

  it("atrasado depois do vencimento", () => {
    expect(paymentStatus(student("a"), month, [], "2026-11-06")).toBe("overdue");
  });

  it("mês passado sem pagamento está atrasado; mês futuro, pendente", () => {
    expect(paymentStatus(student("a"), "2026-10", [], "2026-11-09")).toBe("overdue");
    expect(paymentStatus(student("a"), "2026-12", [], "2026-11-09")).toBe("pending");
  });

  it("pago quando há registro daquele mês, mesmo atrasado", () => {
    expect(
      paymentStatus(student("a"), month, [paid("a", month)], "2026-11-20"),
    ).toBe("paid");
  });

  it("pagamento de outro mês ou de outro aluno não conta", () => {
    const payments = [paid("a", "2026-10"), paid("b", month)];
    expect(paymentStatus(student("a"), month, payments, "2026-11-01")).toBe("pending");
  });

  it("não cobrado quando não há mensalidade", () => {
    expect(
      paymentStatus(student("a", { monthlyFee: null }), month, [], "2026-11-20"),
    ).toBe("not-billed");
  });
});

describe("summarizeMonth", () => {
  const month = "2026-11";

  it("soma cobrados, pagos, atrasados e valores", () => {
    const students = [
      student("a"),
      student("b", { monthlyFee: fee(300, 10) }),
      student("c", { monthlyFee: fee(100, 28) }),
      student("d", { monthlyFee: null }),
      student("e", { active: false }),
    ];
    const summary = summarizeMonth(students, [], month, [paid("b", month, 300)], "2026-11-15");
    expect(summary).toEqual({
      billed: 3,
      paid: 1,
      overdue: 1,
      expected: 600,
      received: 300,
    });
  });

  it("zera quando ninguém é cobrado", () => {
    expect(summarizeMonth([student("a", { monthlyFee: null })], [], month, [], "2026-11-15")).toEqual({
      billed: 0,
      paid: 0,
      overdue: 0,
      expected: 0,
      received: 0,
    });
  });

  it("usa o valor gravado no pagamento e o preço atual do plano para quem falta", () => {
    const plans: Plan[] = [{ id: "p2", name: "2x", weeklyClasses: 2, amount: 300 }];
    const onPlan: MonthlyFee = { planId: "p2", customAmount: null, dueDay: 5 };
    const students = [
      student("a", { monthlyFee: onPlan }),
      student("b", { monthlyFee: onPlan }),
    ];
    // Ana pagou 280 antes do reajuste para 300.
    const summary = summarizeMonth(students, plans, month, [paid("a", month, 280)], "2026-11-15");
    expect(summary).toMatchObject({ paid: 1, received: 280, expected: 580 });
  });
});

describe("setPayment", () => {
  it("marcar como pago grava a data e o valor", () => {
    expect(setPayment([], "a", "2026-11", true, "2026-11-09", 250)).toEqual([
      { studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-09", amount: 250 },
    ]);
  });

  it("marcar de novo não duplica e atualiza a data", () => {
    const result = setPayment([paid("a", "2026-11")], "a", "2026-11", true, "2026-11-20", 200);
    expect(result).toHaveLength(1);
    expect(result[0].paidAt).toBe("2026-11-20");
  });

  it("desfazer apaga só aquele mês daquele aluno", () => {
    const list = [paid("a", "2026-11"), paid("a", "2026-10"), paid("b", "2026-11")];
    const result = setPayment(list, "a", "2026-11", false, "2026-11-20", 200);
    expect(result.map((p) => `${p.studentId}:${p.month}`)).toEqual(["a:2026-10", "b:2026-11"]);
  });
});

describe("removePaymentsOfStudent", () => {
  it("remove todos os pagamentos do aluno", () => {
    const list = [paid("a", "2026-11"), paid("a", "2026-10"), paid("b", "2026-11")];
    expect(removePaymentsOfStudent(list, "a")).toEqual([paid("b", "2026-11")]);
  });
});
