import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgendaScreen } from "@/components/agenda-screen";
import { createEmptyStudent } from "@/lib/students";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { BlockedPeriod, Booking, ClassSlot, Student } from "@/types/pilates";

// Segunda-feira, 9 de novembro de 2026.
const TODAY = "2026-11-09";

const slot: ClassSlot = { id: "s1", weekday: 1, startTime: "08:00" };

const person = (id: string, name: string, overrides: Partial<Student> = {}): Student => ({
  ...createEmptyStudent(id, "2026-01-01"),
  name,
  slotIds: ["s1"],
  ...overrides,
});

const seed = (data: {
  slots?: ClassSlot[];
  students?: Student[];
  bookings?: Booking[];
  blocked?: BlockedPeriod[];
}) => {
  const set = (key: string, value: unknown) =>
    window.localStorage.setItem(key, JSON.stringify(value));
  set(STORAGE_KEYS.slots, data.slots ?? []);
  set(STORAGE_KEYS.students, data.students ?? []);
  set(STORAGE_KEYS.bookings, data.bookings ?? []);
  set(STORAGE_KEYS.blockedPeriods, data.blocked ?? []);
};

describe("AgendaScreen", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("orienta a cadastrar horários quando não há nenhum", () => {
    render(<AgendaScreen />);
    expect(screen.getByRole("link", { name: "Horários" })).toBeInTheDocument();
  });

  it("mostra as sessões de hoje com alunos e vagas livres", () => {
    seed({ slots: [slot], students: [person("a", "Ana"), person("b", "Bia")] });
    render(<AgendaScreen />);

    expect(screen.getByRole("heading", { name: /Segunda, 09\/11\/2026 \(hoje\)/ })).toBeInTheDocument();
    expect(screen.getByText("08:00 às 09:00")).toBeInTheDocument();
    expect(screen.getByText(/2\/3 ocupadas · 1 vaga livre/)).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bia")).toBeInTheDocument();
  });

  it("destaca o ponto de atenção do aluno", () => {
    seed({
      slots: [slot],
      students: [person("a", "Ana", { attention: "Evitar rotação de coluna" })],
    });
    render(<AgendaScreen />);
    expect(screen.getByText(/Evitar rotação de coluna/)).toBeInTheDocument();
  });

  it("marca presença, alterna para falta e volta ao padrão, persistindo", async () => {
    seed({ slots: [slot], students: [person("a", "Ana")] });
    const user = userEvent.setup();
    render(<AgendaScreen />);

    const present = screen.getByRole("button", { name: /Presente/ });
    const absent = screen.getByRole("button", { name: /Faltou/ });
    expect(present).toHaveAttribute("aria-pressed", "false");

    await user.click(present);
    expect(present).toHaveAttribute("aria-pressed", "true");
    let saved: Booking[] = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.bookings) ?? "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ date: TODAY, slotId: "s1", studentId: "a", status: "present" });

    await user.click(absent);
    expect(absent).toHaveAttribute("aria-pressed", "true");
    expect(present).toHaveAttribute("aria-pressed", "false");

    await user.click(absent);
    expect(absent).toHaveAttribute("aria-pressed", "false");
    saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.bookings) ?? "[]");
    expect(saved).toEqual([]);
  });

  it("mostra a presença já registrada naquela data", () => {
    seed({
      slots: [slot],
      students: [person("a", "Ana")],
      bookings: [
        {
          id: "b1",
          slotId: "s1",
          date: TODAY,
          kind: "regular",
          status: "absent",
          studentId: "a",
          guestName: null,
        },
      ],
    });
    render(<AgendaScreen />);
    expect(screen.getByRole("button", { name: /Faltou/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("mostra dia bloqueado sem alunos nem botões de presença", () => {
    seed({
      slots: [slot],
      students: [person("a", "Ana")],
      blocked: [{ id: "p1", startDate: TODAY, endDate: TODAY, reason: "Feriado" }],
    });
    render(<AgendaScreen />);

    expect(screen.getByText("Sem aula: Feriado")).toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Presente/ })).not.toBeInTheDocument();
  });

  it("navega entre os dias da semana e volta para hoje", async () => {
    seed({
      slots: [slot, { id: "s2", weekday: 3, startTime: "18:00" }],
      students: [person("a", "Ana")],
    });
    const user = userEvent.setup();
    render(<AgendaScreen />);

    await user.click(screen.getByRole("button", { name: /Quarta, 11\/11, 1 aula/ }));
    expect(screen.getByText("18:00 às 19:00")).toBeInTheDocument();
    expect(screen.queryByText("08:00 às 09:00")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir para hoje" }));
    expect(screen.getByText("08:00 às 09:00")).toBeInTheDocument();
  });

  it("avança para a próxima semana", async () => {
    seed({ slots: [slot], students: [person("a", "Ana")] });
    const user = userEvent.setup();
    render(<AgendaScreen />);

    await user.click(screen.getByRole("button", { name: "Próxima semana" }));
    expect(screen.getByRole("heading", { name: /Segunda, 16\/11\/2026/ })).toBeInTheDocument();
    const strip = screen.getAllByRole("list")[0];
    expect(within(strip).getAllByRole("button")).toHaveLength(7);
  });

  it("diz que não há aulas em um dia sem horário", async () => {
    seed({ slots: [slot], students: [] });
    const user = userEvent.setup();
    render(<AgendaScreen />);

    await user.click(screen.getByRole("button", { name: /Terça, 10\/11, 0 aulas/ }));
    expect(screen.getByText("Sem aulas neste dia.")).toBeInTheDocument();
  });
});
