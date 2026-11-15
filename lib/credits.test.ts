import { describe, expect, it } from "vitest";
import { creditBalance } from "@/lib/credits";
import type { Booking } from "@/types/pilates";

let counter = 0;
const booking = (overrides: Partial<Booking>): Booking => ({
  id: `b${++counter}`,
  slotId: "s1",
  date: "2026-11-02",
  kind: "regular",
  status: "cancelled",
  studentId: "a",
  guestName: null,
  ...overrides,
});

describe("creditBalance", () => {
  it("começa em zero", () => {
    expect(creditBalance("a", [])).toBe(0);
  });

  it("ganha 1 crédito por aula fixa desmarcada", () => {
    const bookings = [booking({}), booking({ date: "2026-11-09" })];
    expect(creditBalance("a", bookings)).toBe(2);
  });

  it("faltar ou ir à aula não gera crédito", () => {
    const bookings = [booking({ status: "absent" }), booking({ status: "present" })];
    expect(creditBalance("a", bookings)).toBe(0);
  });

  it("consome 1 crédito por reposição marcada, mesmo se ainda não aconteceu", () => {
    const bookings = [
      booking({}),
      booking({}),
      booking({ kind: "makeup", status: "scheduled" }),
    ];
    expect(creditBalance("a", bookings)).toBe(1);
  });

  it("reposição em que faltou também consome o crédito", () => {
    const bookings = [booking({}), booking({ kind: "makeup", status: "absent" })];
    expect(creditBalance("a", bookings)).toBe(0);
  });

  it("reposição cancelada devolve o crédito", () => {
    const bookings = [booking({}), booking({ kind: "makeup", status: "cancelled" })];
    expect(creditBalance("a", bookings)).toBe(1);
  });

  it("não deixa o saldo ficar negativo", () => {
    expect(creditBalance("a", [booking({ kind: "makeup", status: "scheduled" })])).toBe(0);
  });

  it("separa o saldo por aluno e ignora aula experimental", () => {
    const bookings = [
      booking({ studentId: "a" }),
      booking({ studentId: "b" }),
      booking({ studentId: "b" }),
      booking({ kind: "trial", studentId: null, status: "scheduled" }),
    ];
    expect(creditBalance("a", bookings)).toBe(1);
    expect(creditBalance("b", bookings)).toBe(2);
  });
});
