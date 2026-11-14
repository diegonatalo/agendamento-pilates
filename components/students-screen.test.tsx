import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { StudentsScreen } from "@/components/students-screen";
import { createEmptyStudent } from "@/lib/students";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { ClassSlot, Student } from "@/types/pilates";

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
