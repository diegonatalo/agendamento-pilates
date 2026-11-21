import { describe, expect, it } from "vitest";
import {
  blockedFromRow,
  blockedToRow,
  bookingFromRow,
  bookingToRow,
  paymentFromRow,
  paymentToRow,
  planFromRow,
  planToRow,
  slotFromRow,
  slotToRow,
  studentFromRow,
  studentToRow,
} from "@/lib/data/rows";
import { createEmptyStudent } from "@/lib/students";
import type { Student } from "@/types/pilates";

/** Simula a ida e a volta pelo banco: o que sai da linha é o que entrou. */
const roundTrip = <T, R>(item: T, toRow: (userId: string, item: T) => R, fromRow: (row: never) => T) => {
  const row = toRow("u1", item) as R & { userId: string };
  expect(row.userId).toBe("u1");
  return fromRow(row as never);
};

describe("rows", () => {
  it("cada registro volta igual do banco", () => {
    const student: Student = {
      ...createEmptyStudent("a", "2026-01-01"),
      name: "Ana",
      slotIds: ["s1"],
      evolution: [{ id: "n1", date: "2026-02-01", text: "Melhorou" }],
      monthlyFee: { planId: "p1", customAmount: null, dueDay: 5 },
    };
    expect(roundTrip(student, studentToRow, studentFromRow)).toEqual(student);

    const plan = { id: "p1", name: "2x", weeklyClasses: 2, amount: 280.5 };
    expect(roundTrip(plan, planToRow, planFromRow)).toEqual(plan);

    const slot = { id: "s1", weekday: 1 as const, startTime: "08:00" };
    expect(roundTrip(slot, slotToRow, slotFromRow)).toEqual(slot);

    const booking = {
      id: "b1",
      slotId: "s1",
      date: "2026-11-09",
      kind: "trial" as const,
      status: "scheduled" as const,
      studentId: null,
      guestName: "Rita",
    };
    expect(roundTrip(booking, bookingToRow, bookingFromRow)).toEqual(booking);

    const blocked = { id: "x", startDate: "2026-12-24", endDate: "2026-12-26", reason: "Natal" };
    expect(roundTrip(blocked, blockedToRow, blockedFromRow)).toEqual(blocked);

    const payment = { studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-05", amount: 200 };
    expect(roundTrip(payment, paymentToRow, paymentFromRow)).toEqual(payment);
  });

  it("guarda só os campos conhecidos, mesmo que o navegador mande mais", () => {
    const student = {
      ...createEmptyStudent("a", "2026-01-01"),
      extra: "não vai",
      health: { ...createEmptyStudent("a", "2026-01-01").health, extra: "não vai" },
    } as Student;
    const row = studentToRow("u1", student);
    expect(row).not.toHaveProperty("extra");
    expect(row.health).not.toHaveProperty("extra");
  });

  it("o banco devolve dinheiro como texto às vezes; vira número", () => {
    expect(planFromRow({ userId: "u", id: "p", name: "x", weeklyClasses: 1, amount: "199.90" as unknown as number }).amount).toBe(199.9);
  });
});
