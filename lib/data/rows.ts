import type * as schema from "@/lib/db/schema";
import type {
  BlockedPeriod,
  Booking,
  ClassSlot,
  MonthlyPayment,
  Plan,
  Student,
  StudioSettings,
} from "@/types/pilates";

/**
 * Conversion between the app's records and the table rows. Each `toRow` copies
 * field by field, so nothing extra that arrived from the browser is stored.
 */

type Insert<T extends { $inferInsert: unknown }> = T["$inferInsert"];
type Select<T extends { $inferSelect: unknown }> = T["$inferSelect"];

export const settingsToRow = (userId: string, s: StudioSettings) => ({
  userId,
  businessType: s.businessType,
  sessionMinutes: s.sessionMinutes,
  breakMinutes: s.breakMinutes,
  capacity: s.capacity,
});

export const settingsFromRow = (r: Select<typeof schema.studioSettings>): StudioSettings => ({
  businessType: r.businessType,
  sessionMinutes: r.sessionMinutes,
  breakMinutes: r.breakMinutes,
  capacity: r.capacity,
});

export const planToRow = (userId: string, p: Plan): Insert<typeof schema.plans> => ({
  userId,
  id: p.id,
  name: p.name,
  weeklyClasses: p.weeklyClasses,
  amount: p.amount,
});

export const planFromRow = (r: Select<typeof schema.plans>): Plan => ({
  id: r.id,
  name: r.name,
  weeklyClasses: r.weeklyClasses,
  amount: Number(r.amount),
});

export const slotToRow = (userId: string, s: ClassSlot): Insert<typeof schema.slots> => ({
  userId,
  id: s.id,
  weekday: s.weekday,
  startTime: s.startTime,
});

export const slotFromRow = (r: Select<typeof schema.slots>): ClassSlot => ({
  id: r.id,
  weekday: r.weekday,
  startTime: r.startTime,
});

export const studentToRow = (userId: string, s: Student): Insert<typeof schema.students> => ({
  userId,
  id: s.id,
  name: s.name,
  phone: s.phone,
  birthDate: s.birthDate,
  startedAt: s.startedAt,
  active: s.active,
  slotIds: [...s.slotIds],
  health: {
    injuries: s.health.injuries,
    surgeries: s.health.surgeries,
    restrictions: s.health.restrictions,
    medicalClearance: s.health.medicalClearance,
    emergencyContact: s.health.emergencyContact,
  },
  attention: s.attention,
  goals: s.goals,
  evolution: s.evolution.map(({ id, date, text }) => ({ id, date, text })),
  monthlyFee: s.monthlyFee
    ? { planId: s.monthlyFee.planId, customAmount: s.monthlyFee.customAmount, dueDay: s.monthlyFee.dueDay }
    : null,
});

export const studentFromRow = (r: Select<typeof schema.students>): Student => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  birthDate: r.birthDate,
  startedAt: r.startedAt,
  active: r.active,
  slotIds: r.slotIds,
  health: r.health,
  attention: r.attention,
  goals: r.goals,
  evolution: r.evolution,
  monthlyFee: r.monthlyFee,
});

export const bookingToRow = (userId: string, b: Booking): Insert<typeof schema.bookings> => ({
  userId,
  id: b.id,
  slotId: b.slotId,
  date: b.date,
  kind: b.kind,
  status: b.status,
  studentId: b.studentId,
  guestName: b.guestName,
});

export const bookingFromRow = (r: Select<typeof schema.bookings>): Booking => ({
  id: r.id,
  slotId: r.slotId,
  date: r.date,
  kind: r.kind,
  status: r.status,
  studentId: r.studentId,
  guestName: r.guestName,
});

export const blockedToRow = (userId: string, b: BlockedPeriod): Insert<typeof schema.blockedPeriods> => ({
  userId,
  id: b.id,
  startDate: b.startDate,
  endDate: b.endDate,
  reason: b.reason,
});

export const blockedFromRow = (r: Select<typeof schema.blockedPeriods>): BlockedPeriod => ({
  id: r.id,
  startDate: r.startDate,
  endDate: r.endDate,
  reason: r.reason,
});

export const paymentToRow = (userId: string, p: MonthlyPayment): Insert<typeof schema.payments> => ({
  userId,
  studentId: p.studentId,
  month: p.month,
  paid: p.paid,
  paidAt: p.paidAt,
  amount: p.amount,
});

export const paymentFromRow = (r: Select<typeof schema.payments>): MonthlyPayment => ({
  studentId: r.studentId,
  month: r.month,
  paid: r.paid,
  paidAt: r.paidAt,
  amount: Number(r.amount),
});
