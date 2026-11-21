import { screen } from "@testing-library/react";
import { renderStudio, resetStudio, seed, stored } from "@/components/studio-test-utils";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { PlansScreen } from "@/components/plans-screen";
import { createEmptyStudent } from "@/lib/students";
import type { Plan } from "@/types/pilates";

const savedPlans = (): Plan[] =>
  stored("plans");

const fillPlan = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  weekly: string,
  amount: string,
) => {
  const nameInput = screen.getByLabelText("Nome");
  await user.clear(nameInput);
  await user.type(nameInput, name);
  await user.selectOptions(screen.getByLabelText("Aulas por semana"), weekly);
  const amountInput = screen.getByLabelText("Mensalidade (R$)");
  await user.clear(amountInput);
  await user.type(amountInput, amount);
};

describe("PlansScreen", () => {
  beforeEach(() => resetStudio());

  it("mostra o estado vazio", () => {
    renderStudio(<PlansScreen />);
    expect(screen.getByText("Nenhum plano cadastrado ainda.")).toBeInTheDocument();
  });

  it("adiciona um plano e persiste", async () => {
    const user = userEvent.setup();
    renderStudio(<PlansScreen />);
    await fillPlan(user, "2x por semana", "2", "280");
    await user.click(screen.getByRole("button", { name: "Adicionar plano" }));

    expect(screen.getByText(/R\$\s280,00 · 0 alunos/)).toBeInTheDocument();
    expect(savedPlans()).toMatchObject([
      { name: "2x por semana", weeklyClasses: 2, amount: 280 },
    ]);
  });

  it("mostra o erro e não salva um plano sem valor", async () => {
    const user = userEvent.setup();
    renderStudio(<PlansScreen />);
    await user.type(screen.getByLabelText("Nome"), "1x por semana");
    await user.click(screen.getByRole("button", { name: "Adicionar plano" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valor/);
    expect(savedPlans()).toEqual([]);
  });

  it("edita o valor de um plano", async () => {
    seed("plans", [{ id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 180 }]);
    const user = userEvent.setup();
    renderStudio(<PlansScreen />);

    await user.click(screen.getByRole("button", { name: "Editar plano 1x por semana" }));
    expect(screen.getByLabelText("Nome")).toHaveValue("1x por semana");
    await fillPlan(user, "1x por semana", "1", "200");
    await user.click(screen.getByRole("button", { name: "Salvar plano" }));

    expect(savedPlans()).toEqual([
      { id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 200 },
    ]);
    expect(screen.getByRole("button", { name: "Adicionar plano" })).toBeInTheDocument();
  });

  it("não exclui plano que está na ficha de algum aluno", async () => {
    seed("plans", [
        { id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 180 },
        { id: "p2", name: "2x por semana", weeklyClasses: 2, amount: 280 },
      ]);
    seed("students", [
        {
          ...createEmptyStudent("a", "2026-01-01"),
          name: "Ana",
          monthlyFee: { planId: "p1", customAmount: null, dueDay: 5 },
        },
      ]);
    const user = userEvent.setup();
    renderStudio(<PlansScreen />);

    await user.click(screen.getByRole("button", { name: "Excluir plano 1x por semana" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/ficha de 1 aluno/);
    expect(savedPlans()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Excluir plano 2x por semana" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(savedPlans().map((p) => p.id)).toEqual(["p1"]);
  });
});
