import { describe, expect, it } from "vitest";
import {
  BACKUP_APP,
  BACKUP_VERSION,
  buildBackup,
  countBackup,
  parseBackup,
  type StudioData,
} from "@/lib/backup";
import { createEmptyStudent } from "@/lib/students";

const data: StudioData = {
  settings: { sessionMinutes: 50, breakMinutes: 10, capacity: 4 },
  plans: [{ id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 200 }],
  slots: [{ id: "s1", weekday: 1, startTime: "08:00" }],
  students: [
    {
      ...createEmptyStudent("a", "2026-01-10"),
      name: "Ana",
      slotIds: ["s1"],
      birthDate: "1990-05-01",
      monthlyFee: { planId: "p1", customAmount: null, dueDay: 5 },
      evolution: [{ id: "n1", date: "2026-02-01", text: "Melhorou" }],
    },
  ],
  bookings: [
    {
      id: "b1",
      slotId: "s1",
      date: "2026-11-09",
      kind: "trial",
      status: "present",
      studentId: null,
      guestName: "Visitante",
    },
  ],
  blockedPeriods: [
    { id: "p1", startDate: "2026-12-24", endDate: "2026-12-25", reason: "Natal" },
  ],
  payments: [
    { studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-02", amount: 200 },
  ],
};

const roundTrip = () => JSON.stringify(buildBackup(data, "2026-11-09T12:00:00.000Z"));

describe("buildBackup", () => {
  it("identifica o app, a versão e a data", () => {
    const backup = buildBackup(data, "2026-11-09T12:00:00.000Z");
    expect(backup).toMatchObject({
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: "2026-11-09T12:00:00.000Z",
      data,
    });
  });
});

describe("parseBackup", () => {
  it("aceita o que o próprio app exporta, sem perder dados", () => {
    const result = parseBackup(roundTrip());
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.backup.data).toEqual(data);
  });

  it("aceita um backup com listas vazias", () => {
    const empty: StudioData = {
      settings: { sessionMinutes: 60, breakMinutes: 0, capacity: 3 },
      plans: [],
      slots: [],
      students: [],
      bookings: [],
      blockedPeriods: [],
      payments: [],
    };
    expect(parseBackup(JSON.stringify(buildBackup(empty, "x"))).ok).toBe(true);
  });

  it("recusa texto que não é JSON", () => {
    expect(parseBackup("{quebrado")).toEqual({
      ok: false,
      error: "O arquivo não é um JSON válido.",
    });
  });

  it("recusa JSON de outro app ou de outro formato", () => {
    for (const text of ["[]", "null", '{"app":"outro","data":{}}', '{"foo":1}']) {
      expect(parseBackup(text)).toEqual({
        ok: false,
        error: "Este arquivo não é um backup do Encaixe.",
      });
    }
  });

  it("recusa outra versão", () => {
    const text = JSON.stringify({ ...buildBackup(data, "x"), version: 99 });
    expect(parseBackup(text)).toEqual({
      ok: false,
      error: "Esta versão de backup não é suportada.",
    });
  });

  it("recusa backup sem uma das listas", () => {
    const broken = JSON.parse(roundTrip());
    delete broken.data.payments;
    expect(parseBackup(JSON.stringify(broken))).toMatchObject({
      ok: false,
      error: expect.stringContaining("pagamentos"),
    });
  });

  it("recusa registros com campos inválidos e diz qual seção", () => {
    const cases: [string, (b: ReturnType<typeof JSON.parse>) => void][] = [
      ["horários", (b) => (b.data.slots[0].startTime = "25:00")],
      ["horários", (b) => (b.data.slots[0].weekday = 9)],
      ["alunos", (b) => (b.data.students[0].name = 42)],
      ["alunos", (b) => delete b.data.students[0].health],
      ["configurações", (b) => (b.data.settings.capacity = "3")],
      ["configurações", (b) => delete b.data.settings],
      ["planos", (b) => (b.data.plans[0].amount = "x")],
      ["alunos", (b) => (b.data.students[0].monthlyFee = { amount: 200, dueDay: 5 })],
      ["alunos", (b) => (b.data.students[0].monthlyFee.planId = null)],
      ["presenças", (b) => (b.data.bookings[0].status = "talvez")],
      ["datas bloqueadas", (b) => delete b.data.blockedPeriods[0].reason],
      ["pagamentos", (b) => (b.data.payments[0].paid = "sim")],
      ["pagamentos", (b) => delete b.data.payments[0].amount],
    ];
    for (const [section, mutate] of cases) {
      const backup = JSON.parse(roundTrip());
      mutate(backup);
      const result = parseBackup(JSON.stringify(backup));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain(section);
    }
  });
});

describe("countBackup", () => {
  it("conta cada lista", () => {
    expect(countBackup(data)).toEqual({
      plans: 1,
      students: 1,
      slots: 1,
      bookings: 1,
      blockedPeriods: 1,
      payments: 1,
    });
  });
});
