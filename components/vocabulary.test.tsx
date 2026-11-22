import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgendaScreen } from "@/components/agenda-screen";
import { MainNav } from "@/components/main-nav";
import { PlansScreen } from "@/components/plans-screen";
import { SlotWeekTable } from "@/components/slot-week-table";
import { SlotsScreen } from "@/components/slots-screen";
import { StudentsScreen } from "@/components/students-screen";
import { renderStudio, resetStudio, seed } from "@/components/studio-test-utils";
import { BUSINESSES, BUSINESS_ORDER } from "@/lib/business";
import { createEmptyStudent } from "@/lib/students";
import type { BusinessType, ClassSlot, Student, StudioSettings } from "@/types/pilates";

vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));

// Renderiza as telas em cada ramo e lê o que a pessoa lê: texto, rótulos e placeholders.
// Pega o que busca por palavra no código não pega, como "Os {sessions}" virando "Os aulas".

/** Começo e fim de palavra que entendem acento, ao contrário de `\b`. */
const word = (pattern: string) => new RegExp(`(?<!\\p{L})(?:${pattern})(?!\\p{L})`, "iu");

/** Palavras de outro ramo, que não podem aparecer. */
const FOREIGN: Record<BusinessType, RegExp> = {
  pilates: word("treinos?|pacientes?|clientes?"),
  personal: word("aulas?|sessão|sessões|pacientes?|clientes?|estúdio|turmas?|lotada"),
  tutor: word("treinos?|sessão|sessões|pacientes?|clientes?|estúdio"),
  psychology: word("alun[oa]s?|aulas?|treinos?|clientes?|estúdio|turmas?"),
  barber: word("alun[oa]s?|aulas?|treinos?|sessão|sessões|pacientes?|estúdio|turmas?|lotada"),
};

const WRONG_GENDER = [
  word("(?:o|os|do|dos|no|nos|um|novo|nenhum|todos os) (?:aulas?|sessão|sessões)"),
  word("(?:as|da|das|na|nas|uma|nova|nenhuma|todas as) (?:treinos?|atendimentos?|alunos?|pacientes?|clientes?)"),
];

/** "0/1 pacientes", "1 de 1 alunos". */
const WRONG_NUMBER = word("(?:\\d+/1|de 1|^1) (?:alunos|pacientes|clientes|ocupadas)");

const visibleTexts = () => {
  const texts: string[] = [];
  for (const element of document.body.querySelectorAll("*")) {
    const ownText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if (ownText) texts.push(element.textContent!.replace(/\s+/g, " ").trim());
    for (const attribute of ["aria-label", "placeholder"]) {
      const value = element.getAttribute(attribute);
      if (value) texts.push(value);
    }
  }
  return texts;
};

const expectVocabulary = (type: BusinessType) => {
  const texts = visibleTexts();
  expect(texts.length).toBeGreaterThan(0);
  const wrong = texts.filter((text) =>
    [FOREIGN[type], WRONG_NUMBER, ...WRONG_GENDER].some((pattern) => pattern.test(text)),
  );
  expect(wrong).toEqual([]);
};

const slots: ClassSlot[] = [
  { id: "s1", weekday: 1, startTime: "08:00" },
  { id: "s2", weekday: 1, startTime: "09:00" },
  { id: "s3", weekday: 1, startTime: "11:00" },
];

const person: Student = {
  ...createEmptyStudent("p1", "2026-01-01"),
  name: "Ana",
  slotIds: ["s1"],
  monthlyFee: { planId: "plan", customAmount: null, dueDay: 5 },
};

describe.each(BUSINESS_ORDER)("vocabulário: %s", (type) => {
  const settings: StudioSettings = { ...BUSINESSES[type].defaults, businessType: type };

  beforeEach(() => {
    resetStudio();
    vi.useFakeTimers({ toFake: ["Date"] });
    // Segunda-feira, 9 de novembro de 2026.
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
    seed("settings", settings);
    seed("slots", slots);
    seed("students", [person]);
    seed("plans", [{ id: "plan", name: "1x por semana", weeklyClasses: 1, amount: 200 }]);
  });
  afterEach(() => vi.useRealTimers());

  it("menu", () => {
    renderStudio(<MainNav />);
    expectVocabulary(type);
  });

  it("agenda, com avulso e formulário de encaixe aberto", () => {
    seed("bookings", [
      { id: "b1", slotId: "s3", date: "2026-11-09", kind: "trial", status: "scheduled", studentId: null, guestName: "Rui" },
    ]);
    renderStudio(<AgendaScreen />);
    expectVocabulary(type);
    fireEvent.click(screen.getAllByRole("button", { name: /^Encaixar/ })[0]);
    expectVocabulary(type);
  });

  it("agenda com o horário lotado", () => {
    seed("settings", { ...settings, capacity: 2 });
    seed("students", [person, { ...person, id: "p2", name: "Bia" }]);
    renderStudio(<AgendaScreen />);
    expectVocabulary(type);
  });

  it("agenda num dia bloqueado sem motivo", () => {
    seed("blockedPeriods", [{ id: "x", startDate: "2026-11-09", endDate: "2026-11-09", reason: "" }]);
    renderStudio(<AgendaScreen />);
    expectVocabulary(type);
  });

  it("horários, com bloqueio e configuração aberta", () => {
    renderStudio(<SlotsScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar grade" }));
    fireEvent.change(screen.getByLabelText("De"), { target: { value: "2026-12-25" } });
    // Sem motivo, para conferir o texto que entra no lugar dele.
    fireEvent.click(screen.getByRole("button", { name: "Bloquear datas" }));
    expectVocabulary(type);
  });

  it("grade da semana, com um horário selecionado", () => {
    renderStudio(<SlotWeekTable slots={slots} students={[person]} settings={settings} onRemove={() => {}} />);
    expectVocabulary(type);
    fireEvent.click(screen.getByRole("button", { name: /^Segunda, 08:00/ }));
    expectVocabulary(type);
  });

  it("fichas: lista, ficha e erro", () => {
    renderStudio(<StudentsScreen />);
    expectVocabulary(type);
    fireEvent.click(screen.getByRole("button", { name: `Novo ${BUSINESSES[type].client.one}` }));
    fireEvent.click(screen.getByRole("button", { name: `Salvar ${BUSINESSES[type].client.one}` }));
    expectVocabulary(type);
  });

  it("fichas vazias", () => {
    seed("students", []);
    renderStudio(<StudentsScreen />);
    expectVocabulary(type);
  });

  it("planos, com a recusa de excluir um plano em uso", () => {
    renderStudio(<PlansScreen />);
    fireEvent.click(screen.getByRole("button", { name: /^Excluir/ }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Este plano está na ficha de 1 ${BUSINESSES[type].client.one}. Troque o plano dele antes de excluir.`,
    );
    expectVocabulary(type);
  });
});
