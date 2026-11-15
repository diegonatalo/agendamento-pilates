import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentsScreen } from "@/components/students-screen";
import { createEmptyStudent } from "@/lib/students";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { ClassSlot, MonthlyPayment, Student } from "@/types/pilates";

const seed = (slots: ClassSlot[], students: Student[]) => {
  window.localStorage.setItem(STORAGE_KEYS.slots, JSON.stringify(slots));
  window.localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
};

const slot = (id: string): ClassSlot => ({ id, weekday: 1, startTime: "08:00" });
const person = (id: string, name: string, slotIds: string[] = []): Student => ({
  ...createEmptyStudent(id, "2026-01-01"),
  name,
  slotIds,
});

describe("StudentsScreen", () => {
  beforeEach(() => window.localStorage.clear());

  it("cadastra um aluno com horário fixo e ponto de atenção", async () => {
    seed([slot("s1")], []);
    const user = userEvent.setup();
    render(<StudentsScreen />);

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
    render(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: "Novo aluno" }));
    await user.click(screen.getByRole("button", { name: "Salvar aluno" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/nome/);
    expect(window.localStorage.getItem(STORAGE_KEYS.students)).toBeNull();
  });

  it("bloqueia a matrícula em horário lotado", async () => {
    seed(
      [slot("s1")],
      [
        person("a", "Ana", ["s1"]),
        person("b", "Bia", ["s1"]),
        person("c", "Carla", ["s1"]),
        person("d", "Dani"),
      ],
    );
    const user = userEvent.setup();
    render(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: /Dani/ }));

    expect(screen.getByRole("checkbox", { name: /Segunda, 08:00/ })).toBeDisabled();
    expect(screen.getByText(/lotado/)).toBeInTheDocument();
  });

  it("mostra o saldo de reposição na lista e na ficha", async () => {
    seed([], [person("a", "Ana")]);
    window.localStorage.setItem(
      STORAGE_KEYS.bookings,
      JSON.stringify([
        {
          id: "b1",
          slotId: "s1",
          date: "2026-11-02",
          kind: "regular",
          status: "cancelled",
          studentId: "a",
          guestName: null,
        },
      ]),
    );
    const user = userEvent.setup();
    render(<StudentsScreen />);
    expect(screen.getByText("1 reposição")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ana/ }));
    expect(screen.getByText(/Créditos de reposição/)).toHaveTextContent("1");
  });

  describe("mensalidade", () => {
    const withFee = (id: string, name: string, dueDay = 5): Student => ({
      ...person(id, name),
      monthlyFee: { amount: 200, dueDay },
    });
    const savedPayments = (): MonthlyPayment[] =>
      JSON.parse(window.localStorage.getItem(STORAGE_KEYS.payments) ?? "[]");

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      // 10 de novembro de 2026: o dia 5 já passou, o dia 20 não.
      vi.setSystemTime(new Date(2026, 10, 10, 10, 0));
    });
    afterEach(() => vi.useRealTimers());

    it("mostra o resumo do mês e o status de cada aluno", () => {
      seed([], [withFee("a", "Ana", 5), withFee("b", "Bia", 20), person("c", "Carla")]);
      window.localStorage.setItem(
        STORAGE_KEYS.payments,
        JSON.stringify([{ studentId: "b", month: "2026-11", paid: true, paidAt: "2026-11-02" }]),
      );
      render(<StudentsScreen />);

      expect(
        screen.getByRole("heading", { name: "Mensalidades de novembro de 2026" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/1 de 2 pagas/)).toHaveTextContent("1 em atraso");
      expect(screen.getByRole("button", { name: /^Atrasado/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Pago/ })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /marcar mensalidade|desfazer/ })).toHaveLength(2);
    });

    it("marca como pago, persiste e desfaz", async () => {
      seed([], [withFee("a", "Ana")]);
      const user = userEvent.setup();
      render(<StudentsScreen />);

      await user.click(screen.getByRole("button", { name: /marcar mensalidade de Ana/ }));
      expect(screen.getByRole("button", { name: /desfazer pagamento de Ana/ })).toBeInTheDocument();
      expect(savedPayments()).toEqual([
        { studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-10" },
      ]);
      expect(screen.getByText(/1 de 1 pagas/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /desfazer pagamento de Ana/ }));
      expect(savedPayments()).toEqual([]);
      expect(screen.getByRole("button", { name: /^Atrasado/ })).toBeInTheDocument();
    });

    it("cada mês tem seu próprio status", async () => {
      seed([], [withFee("a", "Ana")]);
      const user = userEvent.setup();
      render(<StudentsScreen />);
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
      seed([], [withFee("a", "Ana"), withFee("b", "Bia"), person("c", "Carla")]);
      window.localStorage.setItem(
        STORAGE_KEYS.payments,
        JSON.stringify([{ studentId: "b", month: "2026-11", paid: true, paidAt: "2026-11-02" }]),
      );
      const user = userEvent.setup();
      render(<StudentsScreen />);
      await user.click(screen.getByRole("checkbox", { name: "Mostrar só pendentes" }));

      expect(screen.getByText("Ana")).toBeInTheDocument();
      expect(screen.queryByText("Bia")).not.toBeInTheDocument();
      expect(screen.queryByText("Carla")).not.toBeInTheDocument();
    });

    it("avisa quando não há pendências e quando ninguém é cobrado no mês", async () => {
      // Começou neste mês: no mês anterior ainda não é cobrada.
      seed([], [{ ...withFee("a", "Ana"), startedAt: "2026-11-01" }]);
      window.localStorage.setItem(
        STORAGE_KEYS.payments,
        JSON.stringify([{ studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-02" }]),
      );
      const user = userEvent.setup();
      render(<StudentsScreen />);
      await user.click(screen.getByRole("checkbox", { name: "Mostrar só pendentes" }));
      expect(screen.getByText("Nenhuma mensalidade pendente neste mês.")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Mês anterior" }));
      expect(screen.getByText("Nenhum aluno com mensalidade neste mês.")).toBeInTheDocument();
    });

    it("excluir o aluno apaga os pagamentos dele", async () => {
      seed([], [withFee("a", "Ana")]);
      window.localStorage.setItem(
        STORAGE_KEYS.payments,
        JSON.stringify([{ studentId: "a", month: "2026-11", paid: true, paidAt: "2026-11-02" }]),
      );
      const user = userEvent.setup();
      render(<StudentsScreen />);
      await user.click(screen.getByRole("button", { name: /^Ana/ }));
      await user.click(screen.getByRole("button", { name: "Excluir aluno" }));
      await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));

      expect(savedPayments()).toEqual([]);
    });
  });

  it("filtra a lista pelo nome", async () => {
    seed([], [person("a", "Ana"), person("b", "Beatriz")]);
    const user = userEvent.setup();
    render(<StudentsScreen />);
    await user.type(screen.getByLabelText("Buscar por nome"), "bea");

    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Beatriz")).toBeInTheDocument();
  });

  it("exclui um aluno só depois de confirmar", async () => {
    seed([], [person("a", "Ana")]);
    const user = userEvent.setup();
    render(<StudentsScreen />);
    await user.click(screen.getByRole("button", { name: /Ana/ }));
    await user.click(screen.getByRole("button", { name: "Excluir aluno" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));

    expect(screen.getByText("Nenhum aluno cadastrado ainda.")).toBeInTheDocument();
  });
});
