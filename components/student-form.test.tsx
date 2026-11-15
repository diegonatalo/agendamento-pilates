import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { createEmptyStudent } from "@/lib/students";
import type { ClassSlot, Plan, Student } from "@/types/pilates";
import { StudentForm } from "./student-form";

const plans: Plan[] = [
  { id: "p1", name: "1x por semana", weeklyClasses: 1, amount: 180 },
  { id: "p2", name: "2x por semana", weeklyClasses: 2, amount: 280 },
];
const slots: ClassSlot[] = [
  { id: "s1", weekday: 1, startTime: "07:00" },
  { id: "s2", weekday: 3, startTime: "07:00" },
];

const setup = (overrides: Partial<Student> = {}, props: { isNew?: boolean; plans?: Plan[] } = {}) => {
  const handlers = { onSave: vi.fn(), onCancel: vi.fn(), onDelete: vi.fn() };
  const initial = { ...createEmptyStudent("a1", "2026-03-01"), ...overrides };
  render(
    <StudentForm
      initial={initial}
      isNew={props.isNew ?? true}
      slots={slots}
      plans={props.plans ?? plans}
      settings={DEFAULT_SETTINGS}
      students={[]}
      credits={0}
      {...handlers}
    />,
  );
  return handlers;
};

const saved = (onSave: ReturnType<typeof vi.fn>) => onSave.mock.calls[0][0] as Student;
const save = () => userEvent.click(screen.getByRole("button", { name: "Salvar aluno" }));

describe("StudentForm: mensalidade", () => {
  it("ligar a cobrança escolhe o primeiro plano com vencimento no dia 5", async () => {
    const { onSave } = setup({ name: "Ana" });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    expect(screen.getByLabelText("Plano")).toHaveValue("p1");
    await save();
    expect(saved(onSave).monthlyFee).toEqual({ planId: "p1", customAmount: null, dueDay: 5 });
  });

  it("valor diferente do plano começa com o preço do plano e pode ser editado", async () => {
    const { onSave } = setup({ name: "Ana" });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    await userEvent.selectOptions(screen.getByLabelText("Plano"), "p2");
    await userEvent.click(screen.getByLabelText(/Valor diferente do plano/));
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue(280);
    fireEvent.change(screen.getByLabelText("Valor (R$)"), { target: { value: "250" } });
    await save();
    expect(saved(onSave).monthlyFee).toEqual({ planId: "p2", customAmount: 250, dueDay: 5 });
  });

  it("sem plano, exige um valor combinado", async () => {
    const { onSave } = setup({ name: "Ana" });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    await userEvent.selectOptions(screen.getByLabelText("Plano"), "");
    await save();
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha um plano ou informe o valor da mensalidade.");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("sem planos cadastrados, avisa e pede o valor", async () => {
    setup({ name: "Ana" }, { plans: [] });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    expect(screen.getByText(/Nenhum plano cadastrado/)).toBeInTheDocument();
    expect(screen.getByLabelText("Valor (R$)")).toBeInTheDocument();
  });

  it("valida o dia de vencimento", async () => {
    const { onSave } = setup({ name: "Ana" });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    fireEvent.change(screen.getByLabelText("Dia de vencimento"), { target: { value: "40" } });
    await save();
    expect(screen.getByRole("alert")).toHaveTextContent("O dia de vencimento deve estar entre 1 e 31.");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("avisa quando o aluno tem mais horários do que o plano permite", async () => {
    setup({ name: "Ana", slotIds: ["s1", "s2"] });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    expect(screen.getByText(/mas o aluno tem 2 horários fixos/)).toBeInTheDocument();
  });

  it("desligar a cobrança remove a mensalidade", async () => {
    const { onSave } = setup({ name: "Ana", monthlyFee: { planId: "p1", customAmount: null, dueDay: 10 } });
    await userEvent.click(screen.getByLabelText("Cobrar mensalidade"));
    await save();
    expect(saved(onSave).monthlyFee).toBeNull();
  });
});

describe("StudentForm: evolução, validação e exclusão", () => {
  it("adiciona notas de evolução, ignorando texto vazio, e remove", async () => {
    const { onSave } = setup({ name: "Ana" });
    await userEvent.click(screen.getByRole("button", { name: "Adicionar nota" }));
    await userEvent.type(screen.getByLabelText("Nova nota"), "  Melhorou a mobilidade  ");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar nota" }));
    expect(screen.getByLabelText("Nova nota")).toHaveValue("");
    await save();
    expect(saved(onSave).evolution).toEqual([expect.objectContaining({ text: "Melhorou a mobilidade" })]);
  });

  it("exige o nome e tira espaços antes de salvar", async () => {
    const { onSave } = setup();
    await save();
    expect(screen.getByRole("alert")).toHaveTextContent("Informe o nome do aluno.");
    await userEvent.type(screen.getByLabelText("Nome"), "  Bia  ");
    await save();
    expect(saved(onSave).name).toBe("Bia");
  });

  it("aluno existente pode ser excluído, com confirmação", async () => {
    const { onDelete } = setup({ name: "Ana" }, { isNew: false });
    expect(screen.getByRole("heading", { name: "Ana" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir aluno" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Excluir aluno" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(onDelete).toHaveBeenCalledWith("a1");
  });

  it("aluno novo não tem botão de excluir; voltar chama onCancel", async () => {
    const { onCancel } = setup();
    expect(screen.getByRole("heading", { name: "Novo aluno" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir aluno" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
