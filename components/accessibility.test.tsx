import { screen } from "@testing-library/react";
import { renderStudio, resetStudio, seed, type StudioKey } from "@/components/studio-test-utils";
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

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

/** Cores e layout não são medidos no jsdom; isto cobre estrutura, nomes e rótulos. */
const violationsIn = async (container: HTMLElement) => {
  const { violations } = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`);
};

const seedAll = () => {
  const set = (key: StudioKey, value: unknown) =>
    seed(key, value);
  const ana = {
    ...createEmptyStudent("a", "2026-01-01"),
    name: "Ana",
    slotIds: ["s1"],
    attention: "Evitar flexão de coluna",
    monthlyFee: { planId: "p1", customAmount: null, dueDay: 5 },
  };
  const bia = { ...createEmptyStudent("b", "2026-01-01"), name: "Bia" };
  set("plans", [{ id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 200 }]);
  set("slots", [{ id: "s1", weekday: 1, startTime: "08:00" }]);
  set("students", [ana, bia]);
  set("bookings", [
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
  set("blockedPeriods", [
    { id: "p1", startDate: "2026-12-24", endDate: "2026-12-25", reason: "Natal" },
  ]);
};

describe("acessibilidade (axe)", () => {
  beforeEach(() => {
    resetStudio();
    seedAll();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("estrutura geral com menu e link de pular", async () => {
    const { container } = renderStudio(
      <AppShell>
        <NotFoundScreen />
      </AppShell>,
    );
    expect(await violationsIn(container)).toEqual([]);
  });

  it("agenda", async () => {
    const { container } = renderStudio(<AgendaScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });

  it("agenda com o painel de encaixe aberto", async () => {
    const user = userEvent.setup();
    const { container } = renderStudio(<AgendaScreen />);
    await user.click(screen.getByRole("button", { name: /Encaixar aluno/ }));
    expect(await violationsIn(container)).toEqual([]);
  });

  it("alunos", async () => {
    const { container } = renderStudio(<StudentsScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });

  it("ficha do aluno", async () => {
    const user = userEvent.setup();
    const { container } = renderStudio(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: /^Ana/ }));
    expect(await violationsIn(container)).toEqual([]);
  });

  it("horários e datas bloqueadas", async () => {
    const { container } = renderStudio(<SlotsScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });

  it("backup", async () => {
    const { container } = renderStudio(<BackupScreen />);
    expect(await violationsIn(container)).toEqual([]);
  });
});
