import { createLocalStore, useLocalStore } from "@/hooks/use-local-store";
import { toDateKey } from "@/lib/dates";
import { newId } from "@/lib/ids";
import type { StudioData } from "@/lib/backup";
import { removePaymentsOfStudent, setPayment } from "@/lib/payments";
import {
  feeAmount,
  sortPlans,
  studentsOnPlan,
  validatePlan,
  type PlanDraft,
} from "@/lib/plans";
import {
  addMakeup,
  addTrial,
  removeBooking,
  removeUpcomingBookingsOfSlot,
  removeBookingsOfStudent,
  setAttendance,
  setBookingStatus,
  sortBlockedPeriods,
  validateBlockedPeriod,
} from "@/lib/schedule";
import { sortSlots, validateNewSlot } from "@/lib/slots";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { removeSlotFromStudents, sortStudents } from "@/lib/students";
import type {
  BlockedPeriod,
  Booking,
  BookingStatus,
  ClassSlot,
  DateKey,
  MonthKey,
  MonthlyPayment,
  Plan,
  Student,
} from "@/types/pilates";

const plansStore = createLocalStore<Plan[]>(STORAGE_KEYS.plans, []);
const slotsStore = createLocalStore<ClassSlot[]>(STORAGE_KEYS.slots, []);
const studentsStore = createLocalStore<Student[]>(STORAGE_KEYS.students, []);
const bookingsStore = createLocalStore<Booking[]>(STORAGE_KEYS.bookings, []);
const lastBackupStore = createLocalStore<DateKey | null>(
  STORAGE_KEYS.lastBackup,
  null,
);
const paymentsStore = createLocalStore<MonthlyPayment[]>(
  STORAGE_KEYS.payments,
  [],
);
const blockedStore = createLocalStore<BlockedPeriod[]>(
  STORAGE_KEYS.blockedPeriods,
  [],
);

/** Dados do estúdio e as operações que mantêm tudo coerente. */
export const useStudio = () => {
  const plansState = useLocalStore(plansStore);
  const slotsState = useLocalStore(slotsStore);
  const studentsState = useLocalStore(studentsStore);
  const bookingsState = useLocalStore(bookingsStore);
  const blockedState = useLocalStore(blockedStore);
  const paymentsState = useLocalStore(paymentsStore);
  const lastBackupState = useLocalStore(lastBackupStore);
  const slots = sortSlots(slotsState.data);
  const students = sortStudents(studentsState.data);
  const blockedPeriods = sortBlockedPeriods(blockedState.data);
  const plans = sortPlans(plansState.data);

  /** Cria ou atualiza um plano. Devolve a mensagem de erro, ou `null`. */
  const savePlan = (draft: PlanDraft, editingId: string | null) => {
    const clean = { ...draft, name: draft.name.trim() };
    const error = validatePlan(clean, plansState.data, editingId);
    if (error) return error;
    plansStore.set(
      editingId
        ? plansState.data.map((p) => (p.id === editingId ? { ...p, ...clean } : p))
        : [...plansState.data, { id: newId(), ...clean }],
    );
    return null;
  };

  /** Só exclui plano sem alunos. Devolve a mensagem de erro, ou `null`. */
  const removePlan = (planId: string) => {
    const using = studentsOnPlan(planId, studentsState.data).length;
    if (using > 0)
      return `Este plano está na ficha de ${using} ${using === 1 ? "aluno" : "alunos"}. Troque o plano deles antes de excluir.`;
    plansStore.set(plansState.data.filter((p) => p.id !== planId));
    return null;
  };

  /** Devolve a mensagem de erro, ou `null` quando adicionou. */
  const addSlot = (candidate: Pick<ClassSlot, "weekday" | "startTime">) => {
    const error = validateNewSlot(candidate, slotsState.data);
    if (error) return error;
    slotsStore.set([...slotsState.data, { id: newId(), ...candidate }]);
    return null;
  };

  const removeSlot = (slotId: string) => {
    slotsStore.set(slotsState.data.filter((slot) => slot.id !== slotId));
    studentsStore.set(removeSlotFromStudents(studentsState.data, slotId));
    bookingsStore.set(
      removeUpcomingBookingsOfSlot(
        bookingsState.data,
        slotId,
        toDateKey(new Date()),
      ),
    );
  };

  const saveStudent = (student: Student) => {
    const exists = studentsState.data.some((s) => s.id === student.id);
    studentsStore.set(
      exists
        ? studentsState.data.map((s) => (s.id === student.id ? student : s))
        : [...studentsState.data, student],
    );
  };

  const removeStudent = (studentId: string) => {
    studentsStore.set(studentsState.data.filter((s) => s.id !== studentId));
    bookingsStore.set(removeBookingsOfStudent(bookingsState.data, studentId));
    paymentsStore.set(removePaymentsOfStudent(paymentsState.data, studentId));
  };

  /** Substitui todos os dados pelos do backup. */
  const restoreData = (data: StudioData) => {
    plansStore.set(data.plans);
    slotsStore.set(data.slots);
    studentsStore.set(data.students);
    bookingsStore.set(data.bookings);
    blockedStore.set(data.blockedPeriods);
    paymentsStore.set(data.payments);
  };

  const recordBackup = (date: DateKey) => lastBackupStore.set(date);

  /** Ao marcar como pago, grava o valor atual da mensalidade do aluno. */
  const markPayment = (
    studentId: string,
    month: MonthKey,
    paid: boolean,
    today: DateKey,
  ) => {
    const fee = studentsState.data.find((s) => s.id === studentId)?.monthlyFee;
    const amount = fee ? (feeAmount(fee, plansState.data) ?? 0) : 0;
    paymentsStore.set(
      setPayment(paymentsState.data, studentId, month, paid, today, amount),
    );
  };

  const markAttendance = (
    target: { slotId: string; date: DateKey; studentId: string },
    status: BookingStatus,
  ) =>
    bookingsStore.set(
      setAttendance(bookingsState.data, target, status, newId()),
    );

  const bookMakeup = (target: {
    slotId: string;
    date: DateKey;
    studentId: string;
  }) => bookingsStore.set(addMakeup(bookingsState.data, target, newId()));

  const bookTrial = (target: {
    slotId: string;
    date: DateKey;
    guestName: string;
  }) => bookingsStore.set(addTrial(bookingsState.data, target, newId()));

  const markBooking = (bookingId: string, status: BookingStatus) =>
    bookingsStore.set(setBookingStatus(bookingsState.data, bookingId, status));

  const cancelBooking = (bookingId: string) =>
    bookingsStore.set(removeBooking(bookingsState.data, bookingId));

  /** Devolve a mensagem de erro, ou `null` quando bloqueou. */
  const addBlockedPeriod = (
    startDate: DateKey,
    endDate: DateKey,
    reason: string,
  ) => {
    const error = validateBlockedPeriod(startDate, endDate);
    if (error) return error;
    blockedStore.set([
      ...blockedState.data,
      {
        id: newId(),
        startDate,
        endDate,
        reason: reason.trim() || "Sem aula",
      },
    ]);
    return null;
  };

  const removeBlockedPeriod = (periodId: string) =>
    blockedStore.set(blockedState.data.filter((p) => p.id !== periodId));

  return {
    ready:
      plansState.ready &&
      slotsState.ready &&
      studentsState.ready &&
      bookingsState.ready &&
      blockedState.ready &&
      paymentsState.ready,
    plans,
    savePlan,
    removePlan,
    slots,
    students,
    payments: paymentsState.data,
    lastBackup: lastBackupState.data,
    markPayment,
    restoreData,
    recordBackup,
    bookings: bookingsState.data,
    blockedPeriods,
    addSlot,
    removeSlot,
    saveStudent,
    removeStudent,
    markAttendance,
    bookMakeup,
    bookTrial,
    markBooking,
    cancelBooking,
    addBlockedPeriod,
    removeBlockedPeriod,
  };
};
