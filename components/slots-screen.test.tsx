import { screen } from "@testing-library/react";
import { renderStudio, resetStudio, savedChanges, seed, stored } from "@/components/studio-test-utils";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SlotsScreen } from "@/components/slots-screen";
import { createEmptyStudent } from "@/lib/students";

const addSlot = async (
  user: ReturnType<typeof userEvent.setup>,
  weekday: string,
  time: string,
) => {
  // O formulário avulso fica recolhido; abre na primeira vez.
  const toggle = screen.queryByRole("button", { name: "Adicionar horário avulso" });
  if (toggle) await user.click(toggle);
  await user.selectOptions(screen.getByLabelText("Dia da semana"), weekday);
  const input = screen.getByLabelText("Início");
  await user.clear(input);
  await user.type(input, time);
  await user.click(screen.getByRole("button", { name: "Adicionar horário" }));
};

describe("SlotsScreen", () => {
  beforeEach(() => resetStudio());

  it("mostra o estado vazio", () => {
    renderStudio(<SlotsScreen />);
    expect(screen.getByText("Nenhum horário cadastrado ainda.")).toBeInTheDocument();
  });

  it("o horário avulso fica recolhido até ser aberto", async () => {
    const user = userEvent.setup();
    renderStudio(<SlotsScreen />);
    const toggle = screen.getByRole("button", { name: "Adicionar horário avulso" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Dia da semana")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Fechar horário avulso" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByLabelText("Dia da semana")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar horário avulso" }));
    expect(screen.queryByLabelText("Dia da semana")).not.toBeInTheDocument();
  });

  it("adiciona um horário e persiste", async () => {
    const user = userEvent.setup();
    renderStudio(<SlotsScreen />);
    await addSlot(user, "Terça", "09:00");

    expect(screen.getByText("09:00 às 10:00")).toBeInTheDocument();
    expect(screen.getByText("0/3 alunos fixos")).toBeInTheDocument();
    const saved = stored("slots");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ weekday: 2, startTime: "09:00" });
  });

  it("recusa um horário que conflita com outro", async () => {
    const user = userEvent.setup();
    renderStudio(<SlotsScreen />);
    await addSlot(user, "Terça", "09:00");
    await addSlot(user, "Terça", "09:30");

    expect(screen.getByRole("alert")).toHaveTextContent(/Conflita/);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("remove um horário só depois de confirmar", async () => {
    const user = userEvent.setup();
    renderStudio(<SlotsScreen />);
    await addSlot(user, "Quinta", "18:00");

    await user.click(screen.getByRole("button", { name: /Remover/ }));
    expect(screen.getByText("18:00 às 19:00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar remoção" }));

    expect(screen.queryByText("18:00 às 19:00")).not.toBeInTheDocument();
  });

  describe("configurações do estúdio", () => {
    it("salva duração, intervalo e capacidade e atualiza a tela", async () => {
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);
      const duration = screen.getByLabelText("Duração da sessão (min)");
      await user.clear(duration);
      await user.type(duration, "50");
      await user.selectOptions(screen.getByLabelText("Intervalo entre sessões"), "10");
      const capacity = screen.getByLabelText("Alunos por turma");
      await user.clear(capacity);
      await user.type(capacity, "4");
      await user.click(screen.getByRole("button", { name: "Salvar configurações" }));

      expect(screen.getByRole("status")).toHaveTextContent("Configurações salvas.");
      expect(screen.getByText(/Cada sessão dura 50 min e comporta até 4 alunos/)).toBeInTheDocument();
      expect(
        stored("settings"),
      ).toEqual({ sessionMinutes: 50, breakMinutes: 10, capacity: 4 });
    });

    it("não salva duração que sobrepõe horários existentes", async () => {
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);
      await addSlot(user, "Segunda", "08:00");
      await addSlot(user, "Segunda", "09:00");
      const duration = screen.getByLabelText("Duração da sessão (min)");
      await user.clear(duration);
      await user.type(duration, "90");
      await user.click(screen.getByRole("button", { name: "Salvar configurações" }));

      expect(screen.getAllByRole("alert").at(-1)).toHaveTextContent(/sobrepostos/);
      expect(savedChanges().some((changes) => changes.settings)).toBe(false);
    });
  });

  describe("montar grade pelo expediente", () => {
    const setTime = async (
      user: ReturnType<typeof userEvent.setup>,
      label: string,
      value: string,
    ) => {
      const input = screen.getByLabelText(label);
      await user.clear(input);
      await user.type(input, value);
    };

    it("mostra a prévia e cria os horários dos dias escolhidos", async () => {
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);
      // Só segunda e quarta: desmarca terça, quinta e sexta.
      for (const day of ["Terça", "Quinta", "Sexta"])
        await user.click(screen.getByRole("button", { name: day, pressed: true }));
      await setTime(user, "Abre às", "07:00");
      await setTime(user, "Fecha às", "10:00");

      expect(screen.getByText(/3 sessões por dia:/).parentElement).toHaveTextContent("07:00, 08:00, 09:00");
      await user.click(screen.getByRole("button", { name: "Criar 6 horários" }));

      expect(screen.getByRole("status")).toHaveTextContent("6 horários criados.");
      const saved = stored("slots");
      expect(saved.map((s: { weekday: number; startTime: string }) => `${s.weekday} ${s.startTime}`)).toEqual([
        "1 07:00",
        "1 08:00",
        "1 09:00",
        "3 07:00",
        "3 08:00",
        "3 09:00",
      ]);
      expect(screen.getByText("Todos esses horários já existem.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Criar horários" })).toBeDisabled();
    });

    it("respeita a pausa e mantém horários já cadastrados", async () => {
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);
      await addSlot(user, "Segunda", "11:00");
      for (const day of ["Terça", "Quarta", "Quinta", "Sexta"])
        await user.click(screen.getByRole("button", { name: day, pressed: true }));
      await setTime(user, "Abre às", "10:00");
      await setTime(user, "Fecha às", "15:00");
      await user.click(screen.getByRole("checkbox", { name: "Pausa sem aulas (almoço)" }));
      await setTime(user, "Pausa das", "12:00");
      await setTime(user, "Até", "13:00");

      expect(screen.getByText(/4 sessões por dia:/).parentElement).toHaveTextContent("10:00, 11:00, 13:00, 14:00");
      expect(screen.getByText(/1 horário cai sobre horários já cadastrados/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Criar 3 horários" }));

      const saved = stored("slots");
      expect(saved).toHaveLength(4);
    });

    it("avisa quando o expediente é inválido", async () => {
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);
      await setTime(user, "Abre às", "18:00");
      await setTime(user, "Fecha às", "08:00");

      expect(screen.getByText("O fim do expediente deve ser depois do início.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Criar horários" })).toBeDisabled();
    });
  });

  describe("grade já montada", () => {
    const seedGrid = () => {
      seed("slots", [
          { id: "mon7", weekday: 1, startTime: "07:00" },
          { id: "fri8", weekday: 5, startTime: "08:00" },
        ]);
      seed("students", [
          { ...createEmptyStudent("a", "2026-01-01"), name: "Ana", slotIds: ["fri8"] },
        ]);
    };

    it("mostra a grade primeiro e recolhe a configuração", async () => {
      seedGrid();
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);

      const toggle = screen.getByRole("button", { name: "Configurar grade" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByLabelText("Duração da sessão (min)")).not.toBeInTheDocument();

      await user.click(toggle);
      expect(screen.getByLabelText("Duração da sessão (min)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Fechar configuração" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("mostra um dia por vez nas abas", async () => {
      seedGrid();
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);

      expect(screen.getByRole("tab", { name: /Segunda/ })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("07:00 às 08:00")).toBeInTheDocument();
      expect(screen.queryByText("08:00 às 09:00")).not.toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: /Sexta/ }));
      expect(screen.getByText("08:00 às 09:00")).toBeInTheDocument();
      expect(screen.getByText("1/3 alunos fixos · Ana")).toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: /Sábado/ }));
      expect(screen.getByText(/Nenhum horário no\s+sábado/)).toBeInTheDocument();
    });

    it("navega entre as abas pelo teclado", async () => {
      seedGrid();
      const user = userEvent.setup();
      renderStudio(<SlotsScreen />);

      await user.click(screen.getByRole("tab", { name: /Segunda/ }));
      await user.keyboard("{ArrowRight}");
      const tuesday = screen.getByRole("tab", { name: /Terça/ });
      expect(tuesday).toHaveAttribute("aria-selected", "true");
      expect(tuesday).toHaveFocus();
      await user.keyboard("{End}");
      expect(screen.getByRole("tab", { name: /Domingo/ })).toHaveFocus();
    });

    describe("no computador", () => {
      const original = window.matchMedia;
      beforeEach(() => {
        window.matchMedia = ((query: string) => ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        })) as unknown as typeof window.matchMedia;
      });
      afterEach(() => {
        window.matchMedia = original;
      });

      it("mostra a semana numa tabela e detalha o horário escolhido", async () => {
        seedGrid();
        const user = userEvent.setup();
        renderStudio(<SlotsScreen />);

        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Segunda" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Sexta" })).toBeInTheDocument();
        expect(screen.queryByRole("tablist")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Sexta, 08:00: 1 de 3 alunos" }));
        expect(screen.getByRole("region", { name: "Horário selecionado" })).toHaveTextContent(
          "Sexta, 08:00 às 09:00",
        );
        expect(screen.getByText("1/3 alunos fixos: Ana")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Remover horário de Sexta/ }));
        await user.click(screen.getByRole("button", { name: "Confirmar remoção" }));
        const saved = stored("slots");
        expect(saved.map((s: { id: string }) => s.id)).toEqual(["mon7"]);
        expect(screen.queryByRole("region", { name: "Horário selecionado" })).not.toBeInTheDocument();
      });
    });
  });

  it("mantém o histórico do horário removido e apaga as sessões futuras", async () => {
    const slot = { id: "s1", weekday: 4, startTime: "18:00" };
    const entry = (id: string, date: string) => ({
      id,
      slotId: slot.id,
      date,
      kind: "regular",
      status: "cancelled",
      studentId: "a",
      guestName: null,
    });
    seed("slots", [slot]);
    seed("bookings", [entry("past", "2000-01-06"), entry("future", "2999-01-03")]);
    const user = userEvent.setup();
    renderStudio(<SlotsScreen />);

    await user.click(screen.getByRole("button", { name: /Remover/ }));
    await user.click(screen.getByRole("button", { name: "Confirmar remoção" }));

    const saved = stored("bookings");
    expect(saved.map((b: { id: string }) => b.id)).toEqual(["past"]);
  });
});
