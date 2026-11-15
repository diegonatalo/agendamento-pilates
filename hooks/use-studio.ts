import { createLocalStore, useLocalStore } from "@/hooks/use-local-store";
import { newId } from "@/lib/ids";
import { removePaymentsOfStudent, setPayment } from "@/lib/payments";
import {
  addMakeup,
  addTrial,
  removeBooking,
  removeBookingsOfSlot,
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
  Student,
} from "@/types/pilates";

const slotsStore = createLocalStore<ClassSlot[]>(STORAGE_KEYS.slots, []);
const studentsStore = createLocalStore<Student[]>(STORAGE_KEYS.students, []);
const bookingsStore = createLocalStore<Booking[]>(STORAGE_KEYS.bookings, []);
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
  const slotsState = useLocalStore(slotsStore);
  const studentsState = useLocalStore(studentsStore);
  const bookingsState = useLocalStore(bookingsStore);
  const blockedState = useLocalStore(blockedStore);
  const paymentsState = useLocalStore(paymentsStore);
  const slots = sortSlots(slotsState.data);
  const students = sortStudents(studentsState.data);
  const blockedPeriods = sortBlockedPeriods(blockedState.data);

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
    bookingsStore.set(removeBookingsOfSlot(bookingsState.data, slotId));
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

  const markPayment = (
    studentId: string,
    month: MonthKey,
    paid: boolean,
    today: DateKey,
  ) =>
    paymentsStore.set(
      setPayment(paymentsState.data, studentId, month, paid, today),
    );

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
      slotsState.ready &&
      studentsState.ready &&
      bookingsState.ready &&
      blockedState.ready &&
      paymentsState.ready,
    slots,
    students,
    payments: paymentsState.data,
    markPayment,
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
