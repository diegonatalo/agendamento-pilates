import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { SlotsScreen } from "@/components/slots-screen";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const addSlot = async (
  user: ReturnType<typeof userEvent.setup>,
  weekday: string,
  time: string,
) => {
  await user.selectOptions(screen.getByLabelText("Dia da semana"), weekday);
  const input = screen.getByLabelText("Início");
  await user.clear(input);
  await user.type(input, time);
  await user.click(screen.getByRole("button", { name: "Adicionar horário" }));
};

describe("SlotsScreen", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra o estado vazio", () => {
    render(<SlotsScreen />);
    expect(screen.getByText("Nenhum horário cadastrado ainda.")).toBeInTheDocument();
  });

  it("adiciona um horário e persiste", async () => {
    const user = userEvent.setup();
    render(<SlotsScreen />);
    await addSlot(user, "Terça", "09:00");

    expect(screen.getByText("09:00 às 10:00")).toBeInTheDocument();
    expect(screen.getByText("0/3 alunos fixos")).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.slots) ?? "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ weekday: 2, startTime: "09:00" });
  });

  it("recusa um horário que conflita com outro", async () => {
    const user = userEvent.setup();
    render(<SlotsScreen />);
    await addSlot(user, "Terça", "09:00");
    await addSlot(user, "Terça", "09:30");

    expect(screen.getByRole("alert")).toHaveTextContent(/Conflita/);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("remove um horário só depois de confirmar", async () => {
    const user = userEvent.setup();
    render(<SlotsScreen />);
    await addSlot(user, "Quinta", "18:00");

    await user.click(screen.getByRole("button", { name: /Remover/ }));
    expect(screen.getByText("18:00 às 19:00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar remoção" }));

    expect(screen.queryByText("18:00 às 19:00")).not.toBeInTheDocument();
  });
});
