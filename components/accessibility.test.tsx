import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgendaScreen } from "@/components/agenda-screen";
import { AppShell } from "@/components/app-shell";
import { BackupScreen } from "@/components/backup-screen";
import { NotFoundScreen } from "@/components/not-found-screen";
import { SlotsScreen } from "@/components/slots-screen";
import { StudentsScreen } from "@/components/students-screen";
import { createEmptyStudent } from "@/lib/students";
import { STORAGE_KEYS } from "@/lib/storage-keys";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

/** Cores e layout não são medidos no jsdom; isto cobre estrutura, nomes e rótulos. */
const violationsIn = async (container: HTMLElement) => {
  const { violations } = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`);
};

const seed = () => {
  const set = (key: string, value: unknown) =>
    window.localStorage.setItem(key, JSON.stringify(value));
  const ana = {
    ...createEmptyStudent("a", "2026-01-01"),
    name: "Ana",
    slotIds: ["s1"],
    attention: "Evitar flexão de coluna",
    monthlyFee: { planId: "p1", customAmount: null, dueDay: 5 },
  };
  const bia = { ...createEmptyStudent("b", "2026-01-01"), name: "Bia" };
  set(STORAGE_KEYS.plans, [{ id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 200 }]);
  set(STORAGE_KEYS.slots, [{ id: "s1", weekday: 1, startTime: "08:00" }]);
  set(STORAGE_KEYS.students, [ana, bia]);
  set(STORAGE_KEYS.bookings, [
    {
      id: "b1",
      slotId: "s1",
      date: "2026-11-02",
      kind: "regular",
      status: "cancelled",
      studentId: "b",
      guestName: null,
    },
  ]);
  set(STORAGE_KEYS.blockedPeriods, [
    { id: "p1", startDate: "2026-12-24", endDate: "2026-12-25", reason: "Natal" },
  ]);
};

describe("acessibilidade (axe)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    seed();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("estrutura geral com menu e link de pular", async () => {
    const { container } = render(
      <AppShell>
        <NotFoundScreen />
      </AppShell>,
    );
    expect(await violationsIn(container)).toEqual([]);
  });

  it("agenda", async () => {
    const { container } = render(<AgendaScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });

  it("agenda com o painel de encaixe aberto", async () => {
    const user = userEvent.setup();
    const { container } = render(<AgendaScreen />);
    await user.click(screen.getByRole("button", { name: /Encaixar aluno/ }));
    expect(await violationsIn(container)).toEqual([]);
  });

  it("alunos", async () => {
    const { container } = render(<StudentsScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });

  it("ficha do aluno", async () => {
    const user = userEvent.setup();
    const { container } = render(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: /^Ana/ }));
    expect(await violationsIn(container)).toEqual([]);
  });

  it("horários e datas bloqueadas", async () => {
    const { container } = render(<SlotsScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });

  it("backup", async () => {
    const { container } = render(<BackupScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });
});
