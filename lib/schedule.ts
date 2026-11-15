import { CLASS_CAPACITY } from "@/lib/constants";
import { creditBalance } from "@/lib/credits";
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
  /** Registro de presença; `null` para aluno fixo ainda sem marcação. */
  bookingId: string | null;
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
      bookingId: booking?.id ?? null,
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
      bookingId: booking.id,
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

/** Só dá para encaixar alguém em dia sem bloqueio e com vaga livre. */
export const canAddToSession = (session: Session): boolean =>
  session.blockedBy === null && session.vacancies > 0;

/** Alunos ativos com crédito que ainda não têm lugar nesta sessão. */
export const eligibleForMakeup = (
  session: Session,
  students: Student[],
  bookings: Booking[],
): { student: Student; credits: number }[] => {
  const present = new Set(session.attendees.map((a) => a.student?.id));
  return students
    .filter((s) => s.active && !present.has(s.id))
    .map((student) => ({ student, credits: creditBalance(student.id, bookings) }))
    .filter((entry) => entry.credits > 0);
};

type SessionTarget = { slotId: string; date: DateKey };

/** Marca uma reposição. Ignora se o aluno já tem registro naquela sessão. */
export const addMakeup = (
  bookings: Booking[],
  target: SessionTarget & { studentId: string },
  newId: string,
): Booking[] => {
  const duplicated = bookings.some(
    (b) =>
      b.slotId === target.slotId &&
      b.date === target.date &&
      b.studentId === target.studentId,
  );
  if (duplicated) return bookings;
  return [
    ...bookings,
    {
      id: newId,
      slotId: target.slotId,
      date: target.date,
      kind: "makeup",
      status: "scheduled",
      studentId: target.studentId,
      guestName: null,
    },
  ];
};

export const addTrial = (
  bookings: Booking[],
  target: SessionTarget & { guestName: string },
  newId: string,
): Booking[] => [
  ...bookings,
  {
    id: newId,
    slotId: target.slotId,
    date: target.date,
    kind: "trial",
    status: "scheduled",
    studentId: null,
    guestName: target.guestName.trim(),
  },
];

/** Muda o status de um registro (reposição ou experimental). */
export const setBookingStatus = (
  bookings: Booking[],
  bookingId: string,
  status: BookingStatus,
): Booking[] =>
  bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));

/** Apaga um registro; apagar uma reposição devolve o crédito. */
export const removeBooking = (
  bookings: Booking[],
  bookingId: string,
): Booking[] => bookings.filter((b) => b.id !== bookingId);

export const validateGuestName = (name: string): string | null =>
  name.trim() ? null : "Informe o nome de quem vai fazer a aula experimental.";

export const removeBookingsOfStudent = (
  bookings: Booking[],
  studentId: string,
): Booking[] => bookings.filter((b) => b.studentId !== studentId);

/**
 * Ao excluir um horário, apaga só as sessões que ainda não aconteceram. O que
 * já passou fica como histórico e continua valendo no saldo de reposições:
 * aula desmarcada segue gerando crédito e reposição feita segue consumindo.
 * Uma reposição futura apagada devolve o crédito. Hoje conta como passado se
 * já tem presença, falta ou desmarcação registrada.
 */
export const removeUpcomingBookingsOfSlot = (
  bookings: Booking[],
  slotId: string,
  today: DateKey,
): Booking[] =>
  bookings.filter(
    (b) =>
      b.slotId !== slotId ||
      b.date < today ||
      (b.date === today && b.status !== "scheduled"),
  );

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
