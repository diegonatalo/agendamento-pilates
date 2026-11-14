import { CLASS_CAPACITY } from "@/lib/constants";
import { isValidDateKey, weekdayOf } from "@/lib/dates";
import { sortSlots } from "@/lib/slots";
import type {
  BlockedPeriod,
  Booking,
  BookingKind,
  BookingStatus,
  ClassSlot,
  DateKey,
  Student,
} from "@/types/pilates";

export type Attendee = {
  key: string;
  kind: BookingKind;
  status: BookingStatus;
  /** `null` para aula experimental ou aluno que já foi excluído. */
  student: Student | null;
  guestName: string | null;
};

export type Session = {
  slot: ClassSlot;
  date: DateKey;
  blockedBy: BlockedPeriod | null;
  attendees: Attendee[];
  /** Alunos que ocupam vaga (quem desmarcou não ocupa). */
  occupied: number;
  vacancies: number;
};

export const findBlockedPeriod = (
  date: DateKey,
  periods: BlockedPeriod[],
): BlockedPeriod | null =>
  periods.find((p) => p.startDate <= date && date <= p.endDate) ?? null;

/**
 * Monta uma sessão: os alunos fixos do horário (ativos e já iniciados na data)
 * mais as presenças registradas para aquela data. Sem registro, o aluno fixo
 * está `scheduled`. Em dia bloqueado a sessão fica sem alunos.
 */
export const buildSession = (
  slot: ClassSlot,
  date: DateKey,
  students: Student[],
  bookings: Booking[],
  periods: BlockedPeriod[],
): Session => {
  const blockedBy = findBlockedPeriod(date, periods);
  if (blockedBy) {
    return {
      slot,
      date,
      blockedBy,
      attendees: [],
      occupied: 0,
      vacancies: 0,
    };
  }

  const dayBookings = bookings.filter(
    (b) => b.slotId === slot.id && b.date === date,
  );
  const attendees: Attendee[] = [];

  for (const student of students) {
    if (
      !student.active ||
      !student.slotIds.includes(slot.id) ||
      student.startedAt > date
    )
      continue;
    const booking = dayBookings.find(
      (b) => b.kind === "regular" && b.studentId === student.id,
    );
    attendees.push({
      key: `regular:${student.id}`,
      kind: "regular",
      status: booking?.status ?? "scheduled",
      student,
      guestName: null,
    });
  }

  for (const booking of dayBookings) {
    const alreadyListed =
      booking.kind === "regular" &&
      attendees.some((a) => a.student?.id === booking.studentId);
    if (alreadyListed) continue;
    attendees.push({
      key: `booking:${booking.id}`,
      kind: booking.kind,
      status: booking.status,
      student: students.find((s) => s.id === booking.studentId) ?? null,
      guestName: booking.guestName,
    });
  }

  const occupied = attendees.filter((a) => a.status !== "cancelled").length;
  return {
    slot,
    date,
    blockedBy: null,
    attendees,
    occupied,
    vacancies: Math.max(0, CLASS_CAPACITY - occupied),
  };
};

/** Sessões do dia, em ordem de horário. */
export const sessionsForDate = (
  date: DateKey,
  slots: ClassSlot[],
  students: Student[],
  bookings: Booking[],
  periods: BlockedPeriod[],
): Session[] =>
  sortSlots(slots.filter((slot) => slot.weekday === weekdayOf(date))).map(
    (slot) => buildSession(slot, date, students, bookings, periods),
  );

type AttendanceTarget = {
  slotId: string;
  date: DateKey;
  studentId: string;
};

/**
 * Registra a presença de um aluno fixo. Voltar para `scheduled` apaga o
 * registro, já que "agendado" é o estado padrão.
 */
export const setAttendance = (
  bookings: Booking[],
  target: AttendanceTarget,
  status: BookingStatus,
  newId: string,
): Booking[] => {
  const index = bookings.findIndex(
    (b) =>
      b.kind === "regular" &&
      b.slotId === target.slotId &&
      b.date === target.date &&
      b.studentId === target.studentId,
  );
  if (status === "scheduled") {
    return index < 0 ? bookings : bookings.filter((_, i) => i !== index);
  }
  if (index >= 0) {
    return bookings.map((b, i) => (i === index ? { ...b, status } : b));
  }
  return [
    ...bookings,
    {
      id: newId,
      slotId: target.slotId,
      date: target.date,
      kind: "regular",
      status,
      studentId: target.studentId,
      guestName: null,
    },
  ];
};

export const removeBookingsOfStudent = (
  bookings: Booking[],
  studentId: string,
): Booking[] => bookings.filter((b) => b.studentId !== studentId);

export const removeBookingsOfSlot = (
  bookings: Booking[],
  slotId: string,
): Booking[] => bookings.filter((b) => b.slotId !== slotId);

/** Devolve a mensagem de erro, ou `null` se o período pode ser bloqueado. */
export const validateBlockedPeriod = (
  startDate: string,
  endDate: string,
): string | null => {
  if (!isValidDateKey(startDate) || !isValidDateKey(endDate))
    return "Informe a data inicial e a final.";
  if (endDate < startDate)
    return "A data final não pode ser antes da inicial.";
  return null;
};

export const sortBlockedPeriods = (periods: BlockedPeriod[]): BlockedPeriod[] =>
  [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
