import { CLASS_CAPACITY } from "@/lib/constants";
import { findPlan } from "@/lib/plans";
import type { DateKey, Plan, Student } from "@/types/pilates";

export const createEmptyStudent = (id: string, today: DateKey): Student => ({
  id,
  name: "",
  phone: "",
  birthDate: null,
  startedAt: today,
  active: true,
  slotIds: [],
  health: {
    injuries: "",
    surgeries: "",
    restrictions: "",
    medicalClearance: false,
    emergencyContact: "",
  },
  attention: "",
  goals: "",
  evolution: [],
  monthlyFee: null,
});

/** Devolve a mensagem de erro, ou `null` se a ficha pode ser salva. */
export const validateStudent = (
  student: Student,
  plans: Plan[],
): string | null => {
  if (!student.name.trim()) return "Informe o nome do aluno.";
  const fee = student.monthlyFee;
  if (fee) {
    if (fee.planId !== null && !findPlan(fee.planId, plans))
      return "O plano escolhido não existe mais. Escolha outro.";
    if (fee.planId === null && fee.customAmount === null)
      return "Escolha um plano ou informe o valor da mensalidade.";
    if (
      fee.customAmount !== null &&
      (!Number.isFinite(fee.customAmount) || fee.customAmount < 0)
    )
      return "Informe um valor de mensalidade válido.";
    if (!Number.isInteger(fee.dueDay) || fee.dueDay < 1 || fee.dueDay > 31)
      return "O dia de vencimento deve estar entre 1 e 31.";
  }
  return null;
};

/** Alunos ativos matriculados no horário. */
export const studentsInSlot = (
  slotId: string,
  students: Student[],
): Student[] => students.filter((s) => s.active && s.slotIds.includes(slotId));

export const slotHasVacancy = (slotId: string, students: Student[]): boolean =>
  studentsInSlot(slotId, students).length < CLASS_CAPACITY;

/** Iniciais para o avatar: primeira e última palavra do nome. */
export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

export const sortStudents =(students: Student[]): Student[] =>
  [...students].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

/** Remove um horário da ficha de todos os alunos (ao excluir o horário). */
export const removeSlotFromStudents = (
  students: Student[],
  slotId: string,
): Student[] =>
  students.map((s) =>
    s.slotIds.includes(slotId)
      ? { ...s, slotIds: s.slotIds.filter((id) => id !== slotId) }
      : s,
  );

/** Link do WhatsApp (`wa.me`) para um telefone brasileiro, ou `null` se inválido. */
export const whatsappLink = (phone: string): string | null => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return null;
  const full =
    digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
};
