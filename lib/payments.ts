import type {
  DateKey,
  MonthKey,
  MonthlyPayment,
  Student,
} from "@/types/pilates";

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export type PaymentStatus = "not-billed" | "paid" | "pending" | "overdue";

export const monthOf = (date: DateKey): MonthKey => date.slice(0, 7);

export const addMonths = (month: MonthKey, delta: number): MonthKey => {
  const [year, number] = month.split("-").map(Number);
  const index = year * 12 + (number - 1) + delta;
  const newYear = Math.floor(index / 12);
  return `${newYear}-${String((index % 12) + 1).padStart(2, "0")}`;
};

/** Por exemplo `novembro de 2026`. */
export const formatMonth = (month: MonthKey): string => {
  const [year, number] = month.split("-").map(Number);
  return `${MONTH_NAMES[number - 1]} de ${year}`;
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

/** Vencimento no mês; dia 31 em mês curto cai no último dia. */
export const dueDateOf = (month: MonthKey, dueDay: number): DateKey => {
  const [year, number] = month.split("-").map(Number);
  const lastDay = new Date(year, number, 0).getDate();
  return `${month}-${String(Math.min(dueDay, lastDay)).padStart(2, "0")}`;
};

/** Cobra-se aluno ativo, com mensalidade, a partir do mês em que começou. */
export const isBilledIn = (student: Student, month: MonthKey): boolean =>
  student.active &&
  student.monthlyFee !== null &&
  monthOf(student.startedAt) <= month;

export const paymentStatus = (
  student: Student,
  month: MonthKey,
  payments: MonthlyPayment[],
  today: DateKey,
): PaymentStatus => {
  if (!student.monthlyFee || !isBilledIn(student, month)) return "not-billed";
  const paid = payments.some(
    (p) => p.studentId === student.id && p.month === month && p.paid,
  );
  if (paid) return "paid";
  return today > dueDateOf(month, student.monthlyFee.dueDay)
    ? "overdue"
    : "pending";
};

export type MonthSummary = {
  billed: number;
  paid: number;
  overdue: number;
  /** Soma das mensalidades dos alunos cobrados no mês. */
  expected: number;
  received: number;
};

/** Os valores usam a mensalidade atual de cada ficha. */
export const summarizeMonth = (
  students: Student[],
  month: MonthKey,
  payments: MonthlyPayment[],
  today: DateKey,
): MonthSummary => {
  const summary: MonthSummary = {
    billed: 0,
    paid: 0,
    overdue: 0,
    expected: 0,
    received: 0,
  };
  for (const student of students) {
    const status = paymentStatus(student, month, payments, today);
    if (status === "not-billed" || !student.monthlyFee) continue;
    summary.billed += 1;
    summary.expected += student.monthlyFee.amount;
    if (status === "paid") {
      summary.paid += 1;
      summary.received += student.monthlyFee.amount;
    }
    if (status === "overdue") summary.overdue += 1;
  }
  return summary;
};

/** Marcar como pago grava a data; desmarcar apaga o registro. */
export const setPayment = (
  payments: MonthlyPayment[],
  studentId: string,
  month: MonthKey,
  paid: boolean,
  today: DateKey,
): MonthlyPayment[] => {
  const others = payments.filter(
    (p) => !(p.studentId === studentId && p.month === month),
  );
  return paid
    ? [...others, { studentId, month, paid: true, paidAt: today }]
    : others;
};

export const removePaymentsOfStudent = (
  payments: MonthlyPayment[],
  studentId: string,
): MonthlyPayment[] => payments.filter((p) => p.studentId !== studentId);
