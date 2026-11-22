import { createContext, useContext, useSyncExternalStore } from "react";
import { businessOf, countOf, pickBusiness } from "@/lib/business";
import { toDateKey } from "@/lib/dates";
import { newId } from "@/lib/ids";
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
import { validateSettings } from "@/lib/settings";
import { slotsOverlap, sortSlots, validateNewSlot } from "@/lib/slots";
import type { StudioState } from "@/lib/studio-changes";
import type { StudioStore } from "@/lib/studio-store";
import { removeSlotFromStudents, sortStudents } from "@/lib/students";
import type {
  BlockedPeriod,
  Booking,
  BookingStatus,
  BusinessType,
  ClassSlot,
  DateKey,
  MonthKey,
  Student,
  StudioSettings,
} from "@/types/pilates";

export const StudioContext = createContext<StudioStore | null>(null);

const useStudioStore = () => {
  const store = useContext(StudioContext);
  if (!store) throw new Error("useStudio must be used inside <StudioProvider>");
  return store;
};

/** Se o salvamento em segundo plano está em andamento ou falhou. */
export const useSyncStatus = () => {
  const store = useStudioStore();
  return useSyncExternalStore(store.subscribe, store.getStatus, store.getStatus);
};

/** Vocabulário e ficha do ramo da conta, para componentes que só exibem dados. */
export const useBusiness = () => {
  const store = useStudioStore();
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  return businessOf(state.settings);
};

/** Dados do estúdio e as operações que mantêm tudo coerente. */
export const useStudio = () => {
  const store = useStudioStore();
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const slots = sortSlots(state.slots);
  const students = sortStudents(state.students);
  const blockedPeriods = sortBlockedPeriods(state.blockedPeriods);
  const plans = sortPlans(state.plans);
  const settings = state.settings;

  /** Lê o estado mais recente (não o do último render) e grava o resultado. */
  const update = (change: (current: StudioState) => StudioState) => store.update(change);
  const current = () => store.getState();

  /** Escolhe o ramo; com a grade vazia, aplica também a duração e as vagas sugeridas. */
  const chooseBusiness = (type: BusinessType) =>
    update((s) => ({ ...s, settings: pickBusiness(s.settings, type, s.slots.length > 0) }));

  /** Devolve a mensagem de erro, ou `null` quando salvou. */
  const saveSettings = (next: StudioSettings) => {
    const error = validateSettings(next, current().slots);
    if (error) return error;
    update((s) => ({ ...s, settings: next }));
    return null;
  };

  /** Cria ou atualiza um plano. Devolve a mensagem de erro, ou `null`. */
  const savePlan = (draft: PlanDraft, editingId: string | null) => {
    const clean = { ...draft, name: draft.name.trim() };
    const error = validatePlan(clean, current().plans, editingId);
    if (error) return error;
    update((s) => ({
      ...s,
      plans: editingId
        ? s.plans.map((p) => (p.id === editingId ? { ...p, ...clean } : p))
        : [...s.plans, { id: newId(), ...clean }],
    }));
    return null;
  };

  /** Só exclui plano sem alunos. Devolve a mensagem de erro, ou `null`. */
  const removePlan = (planId: string) => {
    const using = studentsOnPlan(planId, current().students).length;
    if (using > 0)
      return `Este plano está na ficha de ${countOf(using, businessOf(current().settings).client)}. Troque o plano ${using === 1 ? "dele" : "deles"} antes de excluir.`;
    update((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== planId) }));
    return null;
  };

  /** Devolve a mensagem de erro, ou `null` quando adicionou. */
  const addSlot = (candidate: Pick<ClassSlot, "weekday" | "startTime">) => {
    const error = validateNewSlot(candidate, current().slots, current().settings);
    if (error) return error;
    update((s) => ({ ...s, slots: [...s.slots, { id: newId(), ...candidate }] }));
    return null;
  };

  /** Cria vários horários de uma vez, pulando os que conflitam. Devolve quantos criou. */
  const addSlots = (candidates: Pick<ClassSlot, "weekday" | "startTime">[]) => {
    const before = current().slots;
    const next = [...before];
    for (const candidate of candidates) {
      if (next.some((slot) => slotsOverlap(slot, candidate, current().settings))) continue;
      next.push({ id: newId(), ...candidate });
    }
    update((s) => ({ ...s, slots: next }));
    return next.length - before.length;
  };

  const removeSlot = (slotId: string) =>
    update((s) => ({
      ...s,
      slots: s.slots.filter((slot) => slot.id !== slotId),
      students: removeSlotFromStudents(s.students, slotId),
      bookings: removeUpcomingBookingsOfSlot(s.bookings, slotId, toDateKey(new Date())),
    }));

  const saveStudent = (student: Student) =>
    update((s) => ({
      ...s,
      students: s.students.some((x) => x.id === student.id)
        ? s.students.map((x) => (x.id === student.id ? student : x))
        : [...s.students, student],
    }));

  const removeStudent = (studentId: string) =>
    update((s) => ({
      ...s,
      students: s.students.filter((x) => x.id !== studentId),
      bookings: removeBookingsOfStudent(s.bookings, studentId),
      payments: removePaymentsOfStudent(s.payments, studentId),
    }));

  /** Ao marcar como pago, grava o valor atual da mensalidade do aluno. */
  const markPayment = (studentId: string, month: MonthKey, paid: boolean, today: DateKey) =>
    update((s) => {
      const fee = s.students.find((x) => x.id === studentId)?.monthlyFee;
      const amount = fee ? (feeAmount(fee, s.plans) ?? 0) : 0;
      return { ...s, payments: setPayment(s.payments, studentId, month, paid, today, amount) };
    });

  const setBookings = (change: (bookings: Booking[]) => Booking[]) =>
    update((s) => ({ ...s, bookings: change(s.bookings) }));

  const markAttendance = (
    target: { slotId: string; date: DateKey; studentId: string },
    status: BookingStatus,
  ) => setBookings((b) => setAttendance(b, target, status, newId()));

  const bookMakeup = (target: { slotId: string; date: DateKey; studentId: string }) =>
    setBookings((b) => addMakeup(b, target, newId()));

  const bookTrial = (target: { slotId: string; date: DateKey; guestName: string }) =>
    setBookings((b) => addTrial(b, target, newId()));

  const markBooking = (bookingId: string, status: BookingStatus) =>
    setBookings((b) => setBookingStatus(b, bookingId, status));

  const cancelBooking = (bookingId: string) => setBookings((b) => removeBooking(b, bookingId));

  /** Devolve a mensagem de erro, ou `null` quando bloqueou. */
  const addBlockedPeriod = (startDate: DateKey, endDate: DateKey, reason: string) => {
    const error = validateBlockedPeriod(startDate, endDate);
    if (error) return error;
    // Sem motivo fica vazio: a tela mostra com o nome do ramo, que pode mudar depois.
    const period: BlockedPeriod = { id: newId(), startDate, endDate, reason: reason.trim() };
    update((s) => ({ ...s, blockedPeriods: [...s.blockedPeriods, period] }));
    return null;
  };

  const removeBlockedPeriod = (periodId: string) =>
    update((s) => ({ ...s, blockedPeriods: s.blockedPeriods.filter((p) => p.id !== periodId) }));

  return {
    /** Os dados já chegam do servidor; fica para as telas que esperavam o navegador. */
    ready: true,
    settings,
    business: businessOf(settings),
    chooseBusiness,
    saveSettings,
    addSlots,
    plans,
    savePlan,
    removePlan,
    slots,
    students,
    payments: state.payments,
    markPayment,
    bookings: state.bookings,
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
