import { describe, expect, it } from "vitest";
import { breaksPlans, mergeBookings, mergePayment, mergeRows, mergeSettings } from "@/lib/studio-merge";
import { createEmptyStudent } from "@/lib/students";
import type { Booking, ClassSlot, MonthlyPayment, Plan, Student, StudioSettings } from "@/types/pilates";

const plan: Plan = { id: "p", name: "2x", weeklyClasses: 2, amount: 200 };
const settings: StudioSettings = { businessType: "pilates", sessionMinutes: 50, breakMinutes: 10, capacity: 3 };
const payment: MonthlyPayment = { studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-05", amount: 200 };
const booking: Booking = {
  id: "b1",
  slotId: "s",
  date: "2026-11-23",
  kind: "regular",
  status: "present",
  studentId: "a",
  guestName: null,
};
const student = (planId: string | null): Student => ({
  ...createEmptyStudent("a", "2026-01-01"),
  monthlyFee: planId ? { planId, customAmount: null, dueDay: 5 } : null,
});

describe("mergeRows", () => {
  const byId = (row: Plan) => row.id;

  it("junta o nome de um e o preço do outro", () => {
    const merged = mergeRows([{ ...plan, name: "Duas vezes" }], [plan], [{ ...plan, amount: 250 }], byId);
    expect(merged).toEqual([{ ...plan, name: "Duas vezes", amount: 250 }]);
  });

  it("plano apagado não volta e preços diferentes são conflito", () => {
    expect(mergeRows([{ ...plan, amount: 300 }], [plan], [], byId)).toBeNull();
    expect(mergeRows([{ ...plan, amount: 300 }], [plan], [{ ...plan, amount: 250 }], byId)).toBeNull();
  });
});

describe("mergeSettings", () => {
  it("junta a duração de um e as vagas do outro", () => {
    const merged = mergeSettings(settings, { ...settings, sessionMinutes: 75 }, { ...settings, capacity: 9 }, []);
    expect(merged).toEqual({ ...settings, sessionMinutes: 75, capacity: 9 });
  });

  it("não deixa a grade que o outro criou ficar sobreposta", () => {
    const slots: ClassSlot[] = [
      { id: "1", weekday: 1, startTime: "08:00" },
      { id: "2", weekday: 1, startTime: "09:00" },
    ];
    expect(mergeSettings(settings, { ...settings, sessionMinutes: 75 }, settings, slots)).toBeNull();
    expect(mergeSettings(settings, { ...settings, capacity: 5 }, settings, slots)?.capacity).toBe(5);
  });
});

describe("mergePayment", () => {
  it("marcar pago de novo não troca a data nem o valor que o outro salvou", () => {
    expect(mergePayment(undefined, { ...payment, paidAt: "2026-11-22", amount: 300 }, payment)).toBe(payment);
  });

  it("marcar o que ninguém marcou salva", () => {
    expect(mergePayment(undefined, payment, undefined)).toEqual(payment);
  });
});

describe("mergeBookings", () => {
  it("a mesma presença marcada nos dois fica uma vez", () => {
    expect(mergeBookings([{ ...booking, id: "b2" }], [], [booking])).toEqual([]);
  });

  it("presenças diferentes do mesmo aluno na mesma aula são conflito", () => {
    expect(mergeBookings([{ ...booking, id: "b2", status: "absent" }], [], [booking])).toBeNull();
  });

  it("mudar a presença que a tela já conhecia salva", () => {
    const absent: Booking = { ...booking, status: "absent" };
    expect(mergeBookings([absent], [booking], [booking])).toEqual([absent]);
  });

  it("presença desfeita no outro aparelho não volta", () => {
    expect(mergeBookings([{ ...booking, status: "absent" }], [booking], [])).toBeNull();
  });
});

describe("breaksPlans", () => {
  it("não apaga o plano que outro aparelho pôs numa ficha", () => {
    expect(breaksPlans(["p"], [student("p")], [], [], [])).toBe(true);
  });

  it("não escolhe um plano que outro aparelho apagou", () => {
    expect(breaksPlans([], [student("p")], [], [student("p")], [student(null)])).toBe(true);
  });

  it("deixa salvar o que está coerente", () => {
    expect(breaksPlans([], [student("p")], [plan], [student("p")], [student(null)])).toBe(false);
  });
});
