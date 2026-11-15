import type { Booking } from "@/types/pilates";

/**
 * Saldo de reposições do aluno, sem expiração: cada aula fixa desmarcada gera
 * 1 crédito e cada reposição marcada consome 1. Reposição desmarcada devolve o
 * crédito. Dias bloqueados não geram registro, logo não geram crédito.
 */
export const creditBalance = (
  studentId: string,
  bookings: Booking[],
): number => {
  const mine = bookings.filter((b) => b.studentId === studentId);
  const earned = mine.filter(
    (b) => b.kind === "regular" && b.status === "cancelled",
  ).length;
  const used = mine.filter(
    (b) => b.kind === "makeup" && b.status !== "cancelled",
  ).length;
  return Math.max(0, earned - used);
};
