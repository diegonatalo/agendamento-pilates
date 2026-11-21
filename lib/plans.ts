import type { MonthlyFee, Plan, Student } from "@/types/pilates";

export type PlanDraft = Pick<Plan, "name" | "weeklyClasses" | "amount">;

/** Devolve a mensagem de erro, ou `null` se o plano pode ser salvo. */
export const validatePlan = (
  draft: PlanDraft,
  plans: Plan[],
  editingId: string | null = null,
): string | null => {
  const name = draft.name.trim();
  if (!name) return "Informe o nome do plano.";
  const duplicated = plans.some(
    (p) =>
      p.id !== editingId &&
      p.name.trim().toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"),
  );
  if (duplicated) return "Já existe um plano com esse nome.";
  if (
    !Number.isInteger(draft.weeklyClasses) ||
    draft.weeklyClasses < 1 ||
    draft.weeklyClasses > 7
  )
    return "A frequência deve ficar entre 1 e 7 vezes por semana.";
  if (!Number.isFinite(draft.amount) || draft.amount <= 0)
    return "Informe um valor de mensalidade maior que zero.";
  return null;
};

/** Do plano com menos aulas para o com mais; empate pelo valor. */
export const sortPlans = (plans: Plan[]): Plan[] =>
  [...plans].sort(
    (a, b) => a.weeklyClasses - b.weeklyClasses || a.amount - b.amount,
  );

export const findPlan = (
  planId: string | null,
  plans: Plan[],
): Plan | null => plans.find((p) => p.id === planId) ?? null;

/** Valor cobrado do aluno hoje, ou `null` se não há como saber. */
export const feeAmount = (fee: MonthlyFee, plans: Plan[]): number | null =>
  fee.customAmount ?? findPlan(fee.planId, plans)?.amount ?? null;

/** Alunos que usam o plano, ativos ou não. */
export const studentsOnPlan = (planId: string, students: Student[]): Student[] =>
  students.filter((s) => s.monthlyFee?.planId === planId);

/**
 * Quantos horários fixos o aluno tem além do que o plano permite
 * (0 quando está dentro do plano ou não tem plano).
 */
export const slotsOverPlan = (student: Student, plans: Plan[]): number => {
  const plan = findPlan(student.monthlyFee?.planId ?? null, plans);
  if (!plan) return 0;
  return Math.max(0, student.slotIds.length - plan.weeklyClasses);
};

/** Por exemplo `2x por semana`. */
export const formatWeeklyClasses = (count: number): string =>
  `${count}x por semana`;
