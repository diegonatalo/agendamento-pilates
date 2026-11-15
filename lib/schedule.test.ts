import { describe, expect, it } from "vitest";
import {
  addMakeup,
  addTrial,
  buildSession,
  canAddToSession,
  eligibleForMakeup,
  findBlockedPeriod,
  removeBooking,
  removeUpcomingBookingsOfSlot,
  removeBookingsOfStudent,
  sessionsForDate,
  setAttendance,
  setBookingStatus,
  sortBlockedPeriods,
  validateBlockedPeriod,
  validateGuestName,
} from "@/lib/schedule";
import { creditBalance } from "@/lib/credits";
import { createEmptyStudent } from "@/lib/students";
import type { BlockedPeriod, Booking, ClassSlot, Student } from "@/types/pilates";

// 2026-11-09 é segunda-feira.
const MONDAY = "2026-11-09";
const slot: ClassSlot = { id: "s1", weekday: 1, startTime: "08:00" };

const student = (id: string, overrides: Partial<Student> = {}): Student => ({
  ...createEmptyStudent(id, "2026-01-01"),
  name: `Aluno ${id}`,
  slotIds: ["s1"],
  ...overrides,
});

const booking = (overrides: Partial<Booking>): Booking => ({
  id: "b1",
  slotId: "s1",
  date: MONDAY,
  kind: "regular",
  status: "present",
  studentId: "a",
  guestName: null,
  ...overrides,
});

const holiday: BlockedPeriod = {
  id: "p1",
  startDate: "2026-11-09",
  endDate: "2026-11-10",
  reason: "Feriado",
};

describe("findBlockedPeriod", () => {
  it("inclui o primeiro e o último dia do período", () => {
    expect(findBlockedPeriod("2026-11-09", [holiday])).toBe(holiday);
    expect(findBlockedPeriod("2026-11-10", [holiday])).toBe(holiday);
  });

  it("devolve null fora do período", () => {
    expect(findBlockedPeriod("2026-11-08", [holiday])).toBeNull();
    expect(findBlockedPeriod("2026-11-11", [holiday])).toBeNull();
  });
});

describe("buildSession", () => {
  it("lista os alunos fixos como agendados, com vagas restantes", () => {
    const session = buildSession(slot, MONDAY, [student("a"), student("b")], [], []);
    expect(session.attendees.map((a) => a.status)).toEqual(["scheduled", "scheduled"]);
    expect(session.occupied).toBe(2);
    expect(session.vacancies).toBe(1);
  });

  it("ignora alunos inativos, de outro horário ou que começam depois da data", () => {
    const session = buildSession(
      slot,
      MONDAY,
      [
        student("a"),
        student("b", { active: false }),
        student("c", { slotIds: ["outro"] }),
        student("d", { startedAt: "2026-12-01" }),
      ],
      [],
      [],
    );
    expect(session.attendees.map((a) => a.student?.id)).toEqual(["a"]);
  });

  it("aplica a presença registrada daquela data", () => {
    const session = buildSession(
      slot,
      MONDAY,
      [student("a")],
      [booking({ status: "absent" })],
      [],
    );
    expect(session.attendees[0].status).toBe("absent");
  });

  it("não usa presença de outra data ou outro horário", () => {
    const session = buildSession(
      slot,
      MONDAY,
      [student("a")],
      [booking({ date: "2026-11-16" }), booking({ id: "b2", slotId: "s2" })],
      [],
    );
    expect(session.attendees[0].status).toBe("scheduled");
    expect(session.attendees).toHaveLength(1);
  });

  it("inclui reposição e aula experimental e conta a vaga", () => {
    const session = buildSession(
      slot,
      MONDAY,
      [student("a"), student("m", { slotIds: [] })],
      [
        booking({ id: "b2", kind: "makeup", studentId: "m", status: "scheduled" }),
        booking({
          id: "b3",
          kind: "trial",
          studentId: null,
          guestName: "Visitante",
          status: "scheduled",
        }),
      ],
      [],
    );
    expect(session.attendees.map((a) => a.kind)).toEqual(["regular", "makeup", "trial"]);
    expect(session.attendees[2].guestName).toBe("Visitante");
    expect(session.occupied).toBe(3);
    expect(session.vacancies).toBe(0);
  });

  it("quem desmarcou não ocupa vaga", () => {
    const session = buildSession(
      slot,
      MONDAY,
      [student("a")],
      [booking({ status: "cancelled" })],
      [],
    );
    expect(session.occupied).toBe(0);
    expect(session.vacancies).toBe(3);
  });

  it("em dia bloqueado não tem alunos nem vagas", () => {
    const session = buildSession(slot, MONDAY, [student("a")], [], [holiday]);
    expect(session.blockedBy).toBe(holiday);
    expect(session.attendees).toEqual([]);
    expect(session.vacancies).toBe(0);
  });
});

describe("sessionsForDate", () => {
  const slots: ClassSlot[] = [
    { id: "late", weekday: 1, startTime: "18:00" },
    { id: "early", weekday: 1, startTime: "07:00" },
    { id: "tue", weekday: 2, startTime: "07:00" },
  ];

  it("traz só os horários do dia da semana, em ordem", () => {
    const sessions = sessionsForDate(MONDAY, slots, [], [], []);
    expect(sessions.map((s) => s.slot.id)).toEqual(["early", "late"]);
  });
});

describe("setAttendance", () => {
  const target = { slotId: "s1", date: MONDAY, studentId: "a" };

  it("cria o registro quando não existe", () => {
    const result = setAttendance([], target, "present", "new");
    expect(result).toEqual([
      {
        id: "new",
        slotId: "s1",
        date: MONDAY,
        kind: "regular",
        status: "present",
        studentId: "a",
        guestName: null,
      },
    ]);
  });

  it("atualiza o registro existente sem duplicar", () => {
    const result = setAttendance([booking({})], target, "absent", "new");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "b1", status: "absent" });
  });

  it("voltar para agendado apaga o registro", () => {
    expect(setAttendance([booking({})], target, "scheduled", "new")).toEqual([]);
  });

  it("não mexe em reposição do mesmo aluno", () => {
    const makeup = booking({ id: "m", kind: "makeup" });
    const result = setAttendance([makeup], target, "present", "new");
    expect(result).toHaveLength(2);
  });

  it("não altera a lista de entrada", () => {
    const input = [booking({})];
    setAttendance(input, target, "absent", "new");
    expect(input[0].status).toBe("present");
  });
});

describe("remoção de registros", () => {
  const all = [
    booking({ id: "1", studentId: "a", slotId: "s1" }),
    booking({ id: "2", studentId: "b", slotId: "s2" }),
    booking({ id: "3", kind: "trial", studentId: null, slotId: "s1" }),
  ];

  it("remove os registros de um aluno e mantém os demais", () => {
    expect(removeBookingsOfStudent(all, "a").map((b) => b.id)).toEqual(["2", "3"]);
  });

});

describe("removeUpcomingBookingsOfSlot", () => {
  const today = "2026-11-16";
  const all = [
    booking({ id: "past", date: "2026-11-09", status: "cancelled" }),
    booking({ id: "today-done", date: today, status: "present" }),
    booking({ id: "today-open", date: today, kind: "makeup", status: "scheduled" }),
    booking({ id: "future", date: "2026-11-23", kind: "makeup", status: "scheduled" }),
    booking({ id: "other-slot", slotId: "s2", date: "2026-11-23" }),
  ];

  it("apaga só as sessões que ainda não aconteceram no horário", () => {
    expect(
      removeUpcomingBookingsOfSlot(all, "s1", today).map((b) => b.id),
    ).toEqual(["past", "today-done", "other-slot"]);
  });

  it("mantém o crédito de aula desmarcada e devolve o de reposição futura", () => {
    const bookings = [
      booking({ id: "earned", date: "2026-11-09", status: "cancelled" }),
      booking({
        id: "used",
        slotId: "s2",
        date: "2026-11-02",
        kind: "makeup",
        status: "present",
      }),
      booking({ id: "earned-2", slotId: "s2", date: "2026-11-03", status: "cancelled" }),
      booking({ id: "booked", date: "2026-11-23", kind: "makeup", status: "scheduled" }),
    ];
    expect(creditBalance("a", bookings)).toBe(0);
    const after = removeUpcomingBookingsOfSlot(bookings, "s1", today);
    expect(creditBalance("a", after)).toBe(1);
  });
});

describe("validateBlockedPeriod", () => {
  it("aceita um dia só ou um intervalo", () => {
    expect(validateBlockedPeriod("2026-11-09", "2026-11-09")).toBeNull();
    expect(validateBlockedPeriod("2026-11-09", "2026-11-12")).toBeNull();
  });

  it("recusa datas vazias ou inexistentes", () => {
    expect(validateBlockedPeriod("", "2026-11-09")).toMatch(/data inicial/);
    expect(validateBlockedPeriod("2026-02-31", "2026-03-01")).toMatch(/data inicial/);
  });

  it("recusa fim antes do início", () => {
    expect(validateBlockedPeriod("2026-11-10", "2026-11-09")).toMatch(/antes/);
  });
});

describe("canAddToSession", () => {
  it("só com vaga livre e sem bloqueio", () => {
    const open = buildSession(slot, MONDAY, [student("a")], [], []);
    expect(canAddToSession(open)).toBe(true);

    const full = buildSession(
      slot,
      MONDAY,
      [student("a"), student("b"), student("c")],
      [],
      [],
    );
    expect(canAddToSession(full)).toBe(false);

    expect(canAddToSession(buildSession(slot, MONDAY, [], [], [holiday]))).toBe(false);
  });

  it("volta a ter vaga quando um aluno desmarca", () => {
    const session = buildSession(
      slot,
      MONDAY,
      [student("a"), student("b"), student("c")],
      [booking({ status: "cancelled" })],
      [],
    );
    expect(canAddToSession(session)).toBe(true);
  });
});

describe("eligibleForMakeup", () => {
  const credit = (id: string, studentId: string): Booking =>
    booking({ id, studentId, date: "2026-11-02", status: "cancelled" });

  it("lista só alunos ativos com crédito e que não estão na sessão", () => {
    const students = [
      student("a"),
      student("b", { slotIds: [] }),
      student("c", { slotIds: [], active: false }),
      student("d", { slotIds: [] }),
    ];
    const bookings = [credit("1", "b"), credit("2", "c"), credit("3", "a")];
    const session = buildSession(slot, MONDAY, students, bookings, []);

    const result = eligibleForMakeup(session, students, bookings);
    expect(result.map((e) => [e.student.id, e.credits])).toEqual([["b", 1]]);
  });
});

describe("addMakeup", () => {
  const target = { slotId: "s1", date: MONDAY, studentId: "b" };

  it("cria uma reposição agendada", () => {
    expect(addMakeup([], target, "m1")).toEqual([
      {
        id: "m1",
        slotId: "s1",
        date: MONDAY,
        kind: "makeup",
        status: "scheduled",
        studentId: "b",
        guestName: null,
      },
    ]);
  });

  it("não duplica se o aluno já tem registro na sessão", () => {
    const existing = [booking({ studentId: "b", status: "cancelled" })];
    expect(addMakeup(existing, target, "m1")).toBe(existing);
  });
});

describe("addTrial", () => {
  it("cria uma aula experimental com o nome sem espaços nas pontas", () => {
    const [created] = addTrial(
      [],
      { slotId: "s1", date: MONDAY, guestName: "  Visitante " },
      "t1",
    );
    expect(created).toMatchObject({
      id: "t1",
      kind: "trial",
      status: "scheduled",
      studentId: null,
      guestName: "Visitante",
    });
  });
});

describe("setBookingStatus e removeBooking", () => {
  const list = [booking({ id: "1" }), booking({ id: "2", studentId: "b" })];

  it("muda só o registro indicado", () => {
    const result = setBookingStatus(list, "2", "absent");
    expect(result.map((b) => b.status)).toEqual(["present", "absent"]);
  });

  it("remove só o registro indicado", () => {
    expect(removeBooking(list, "1").map((b) => b.id)).toEqual(["2"]);
  });
});

describe("validateGuestName", () => {
  it("exige um nome", () => {
    expect(validateGuestName("   ")).toMatch(/nome/);
    expect(validateGuestName("Ana")).toBeNull();
  });
});

describe("sortBlockedPeriods", () => {
  it("ordena pela data inicial sem alterar a entrada", () => {
    const later = { ...holiday, id: "p2", startDate: "2026-12-24", endDate: "2026-12-25" };
    const input = [later, holiday];
    expect(sortBlockedPeriods(input).map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(input[0].id).toBe("p2");
  });
});
