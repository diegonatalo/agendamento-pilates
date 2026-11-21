import { screen } from "@testing-library/react";
import { renderStudio, resetStudio, savedChanges, seed, stored } from "@/components/studio-test-utils";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentsScreen } from "@/components/students-screen";
import { createEmptyStudent } from "@/lib/students";
import type { ClassSlot, MonthlyPayment, Student } from "@/types/pilates";

const seedStudio = (slots: ClassSlot[], students: Student[]) => {
  seed("slots", slots);
  seed("students", students);
};

const slot = (id: string): ClassSlot => ({ id, weekday: 1, startTime: "08:00" });
const person = (id: string, name: string, slotIds: string[] = []): Student => ({
  ...createEmptyStudent(id, "2026-01-01"),
  name,
  slotIds,
});

describe("StudentsScreen", () => {
  beforeEach(() => resetStudio());

  it("cadastra um aluno com horário fixo e ponto de atenção", async () => {
    seedStudio([slot("s1")], []);
    const user = userEvent.setup();
    renderStudio(<StudentsScreen />);

    await user.click(screen.getByRole("button", { name: "Novo aluno" }));
    await user.type(screen.getByLabelText("Nome"), "Marina");
    await user.type(
      screen.getByLabelText(/Exercícios com desconforto/),
      "Evitar flexão de coluna",
    );
    await user.click(screen.getByRole("checkbox", { name: /Segunda, 08:00/ }));
    await user.click(screen.getByRole("button", { name: "Salvar aluno" }));

    expect(screen.getByText("Marina")).toBeInTheDocument();
    expect(screen.getByText("Atenção")).toBeInTheDocument();
    expect(screen.getByText("Seg 08:00")).toBeInTheDocument();
  });

  it("não salva sem nome", async () => {
    const user = userEvent.setup();
    renderStudio(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: "Novo aluno" }));
    await user.click(screen.getByRole("button", { name: "Salvar aluno" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/nome/);
    expect(savedChanges()).toEqual([]);
  });

  it("bloqueia a matrícula em horário lotado", async () => {
    seedStudio(
      [slot("s1")],
      [
        person("a", "Ana", ["s1"]),
        person("b", "Bia", ["s1"]),
        person("c", "Carla", ["s1"]),
        person("d", "Dani"),
      ],
    );
    const user = userEvent.setup();
    renderStudio(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: /Dani/ }));

    expect(screen.getByRole("checkbox", { name: /Segunda, 08:00/ })).toBeDisabled();
    expect(screen.getByText(/lotado/)).toBeInTheDocument();
  });

  it("mostra o saldo de reposição na lista e na ficha", async () => {
    seedStudio([], [person("a", "Ana")]);
    seed("bookings", [
        {
          id: "b1",
          slotId: "s1",
          date: "2026-11-02",
          kind: "regular",
          status: "cancelled",
          studentId: "a",
          guestName: null,
        },
      ]);
    const user = userEvent.setup();
    renderStudio(<StudentsScreen />);
    expect(screen.getByText("1 reposição")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ana/ }));
    expect(screen.getByText(/Créditos de reposição/)).toHaveTextContent("1");
  });

  describe("mensalidade", () => {
    const withFee = (id: string, name: string, dueDay = 5): Student => ({
      ...person(id, name),
      monthlyFee: { planId: null, customAmount: 200, dueDay },
    });
    const savedPayments = (): MonthlyPayment[] =>
      stored("payments");

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      // 10 de novembro de 2026: o dia 5 já passou, o dia 20 não.
      vi.setSystemTime(new Date(2026, 10, 10, 10, 0));
    });
    afterEach(() => vi.useRealTimers());

    it("mostra o resumo do mês e o status de cada aluno", () => {
      seedStudio([], [withFee("a", "Ana", 5), withFee("b", "Bia", 20), person("c", "Carla")]);
      seed("payments", [{ studentId: "b", month: "2026-11", paid: true, paidAt: "2026-11-02", amount: 200 }]);
      renderStudio(<StudentsScreen />);

      expect(
        screen.getByRole("heading", { name: "Mensalidades de novembro de 2026" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/1 de 2 pagas/)).toHaveTextContent("1 em atraso");
      expect(screen.getByRole("button", { name: /^Atrasado/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Pago/ })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /marcar mensalidade|desfazer/ })).toHaveLength(2);
    });

    it("marca como pago, persiste e desfaz", async () => {
      seedStudio([], [withFee("a", "Ana")]);
      const user = userEvent.setup();
      renderStudio(<StudentsScreen />);

      await user.click(screen.getByRole("button", { name: /marcar mensalidade de Ana/ }));
      expect(screen.getByRole("button", { name: /desfazer pagamento de Ana/ })).toBeInTheDocument();
      expect(savedPayments()).toEqual([
        { studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-10", amount: 200 },
      ]);
      expect(screen.getByText(/1 de 1 pagas/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /desfazer pagamento de Ana/ }));
      expect(savedPayments()).toEqual([]);
      expect(screen.getByRole("button", { name: /^Atrasado/ })).toBeInTheDocument();
    });

    it("cada mês tem seu próprio status", async () => {
      seedStudio([], [withFee("a", "Ana")]);
      const user = userEvent.setup();
      renderStudio(<StudentsScreen />);
      await user.click(screen.getByRole("button", { name: /marcar mensalidade de Ana/ }));

      await user.click(screen.getByRole("button", { name: "Próximo mês" }));
      expect(
        screen.getByRole("heading", { name: "Mensalidades de dezembro de 2026" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Pendente/ })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Mês anterior" }));
      expect(screen.getByRole("button", { name: /^Pago/ })).toBeInTheDocument();
    });

    it("filtra só os pendentes", async () => {
      seedStudio([], [withFee("a", "Ana"), withFee("b", "Bia"), person("c", "Carla")]);
      seed("payments", [{ studentId: "b", month: "2026-11", paid: true, paidAt: "2026-11-02", amount: 200 }]);
      const user = userEvent.setup();
      renderStudio(<StudentsScreen />);
      await user.click(screen.getByRole("checkbox", { name: "Mostrar só pendentes" }));

      expect(screen.getByText("Ana")).toBeInTheDocument();
      expect(screen.queryByText("Bia")).not.toBeInTheDocument();
      expect(screen.queryByText("Carla")).not.toBeInTheDocument();
    });

    it("avisa quando não há pendências e quando ninguém é cobrado no mês", async () => {
      // Começou neste mês: no mês anterior ainda não é cobrada.
      seedStudio([], [{ ...withFee("a", "Ana"), startedAt: "2026-11-01" }]);
      seed("payments", [{ studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-02", amount: 200 }]);
      const user = userEvent.setup();
      renderStudio(<StudentsScreen />);
      await user.click(screen.getByRole("checkbox", { name: "Mostrar só pendentes" }));
      expect(screen.getByText("Nenhuma mensalidade pendente neste mês.")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Mês anterior" }));
      expect(screen.getByText("Nenhum aluno com mensalidade neste mês.")).toBeInTheDocument();
    });

    describe("com planos", () => {
      const twice = { id: "p2", name: "2x por semana", weeklyClasses: 2, amount: 280 };
      const savedStudents = (): Student[] =>
        stored("students");

      beforeEach(() =>
        seed("plans", [twice]),
      );

      it("cadastra o aluno no plano e grava o valor do plano ao pagar", async () => {
        seedStudio([], []);
        const user = userEvent.setup();
        renderStudio(<StudentsScreen />);

        await user.click(screen.getByRole("button", { name: "Novo aluno" }));
        await user.type(screen.getByLabelText("Nome"), "Marina");
        await user.click(screen.getByRole("checkbox", { name: "Cobrar mensalidade" }));
        expect(screen.getByLabelText("Plano")).toHaveValue("p2");
        expect(screen.queryByLabelText("Valor (R$)")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Salvar aluno" }));

        expect(savedStudents()[0].monthlyFee).toEqual({
          planId: "p2",
          customAmount: null,
          dueDay: 5,
        });
        expect(screen.getByText(/2x por semana · R\$\s280,00 · vence dia 5/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /marcar mensalidade de Marina/ }));
        expect(savedPayments()[0].amount).toBe(280);
      });

      it("aceita valor diferente do plano", async () => {
        seedStudio([], [{ ...person("a", "Ana"), monthlyFee: { planId: "p2", customAmount: null, dueDay: 5 } }]);
        const user = userEvent.setup();
        renderStudio(<StudentsScreen />);

        await user.click(screen.getByRole("button", { name: /^Ana/ }));
        await user.click(screen.getByRole("checkbox", { name: /Valor diferente do plano/ }));
        const amount = screen.getByLabelText("Valor (R$)");
        expect(amount).toHaveValue(280);
        await user.clear(amount);
        await user.type(amount, "250");
        await user.click(screen.getByRole("button", { name: "Salvar aluno" }));

        expect(savedStudents()[0].monthlyFee).toMatchObject({ planId: "p2", customAmount: 250 });
      });

      it("avisa quando o aluno tem mais horários que o plano", async () => {
        const slots = [slot("s1"), slot("s2"), slot("s3")];
        seedStudio(slots, [
          {
            ...person("a", "Ana", ["s1", "s2", "s3"]),
            monthlyFee: { planId: "p2", customAmount: null, dueDay: 5 },
          },
        ]);
        const user = userEvent.setup();
        renderStudio(<StudentsScreen />);
        await user.click(screen.getByRole("button", { name: /^Ana/ }));

        expect(screen.getByText(/plano dá direito a 2x por semana, mas o aluno tem 3 horários/)).toBeInTheDocument();
      });
    });

    it("excluir o aluno apaga os pagamentos dele", async () => {
      seedStudio([], [withFee("a", "Ana")]);
      seed("payments", [{ studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-02", amount: 200 }]);
      const user = userEvent.setup();
      renderStudio(<StudentsScreen />);
      await user.click(screen.getByRole("button", { name: /^Ana/ }));
      await user.click(screen.getByRole("button", { name: "Excluir aluno" }));
      await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));

      expect(savedPayments()).toEqual([]);
    });
  });

  it("filtra a lista pelo nome", async () => {
    seedStudio([], [person("a", "Ana"), person("b", "Beatriz")]);
    const user = userEvent.setup();
    renderStudio(<StudentsScreen />);
    await user.type(screen.getByLabelText("Buscar por nome"), "bea");

    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Beatriz")).toBeInTheDocument();
  });

  it("exclui um aluno só depois de confirmar", async () => {
    seedStudio([], [person("a", "Ana")]);
    const user = userEvent.setup();
    renderStudio(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: /Ana/ }));
    await user.click(screen.getByRole("button", { name: "Excluir aluno" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));

    expect(screen.getByText("Nenhum aluno cadastrado ainda.")).toBeInTheDocument();
  });
});
