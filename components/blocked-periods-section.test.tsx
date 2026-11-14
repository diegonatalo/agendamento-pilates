import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { BlockedPeriodsSection } from "@/components/blocked-periods-section";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { BlockedPeriod } from "@/types/pilates";

const saved = (): BlockedPeriod[] =>
  JSON.parse(window.localStorage.getItem(STORAGE_KEYS.blockedPeriods) ?? "[]");

describe("BlockedPeriodsSection", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra o estado vazio", () => {
    render(<BlockedPeriodsSection />);
    expect(screen.getByText("Nenhuma data bloqueada.")).toBeInTheDocument();
  });

  it("bloqueia um intervalo com motivo", async () => {
    const user = userEvent.setup();
    render(<BlockedPeriodsSection />);
    await user.type(screen.getByLabelText("De"), "2026-12-24");
    await user.type(screen.getByLabelText(/Até/), "2026-12-26");
    await user.type(screen.getByLabelText("Motivo"), "Natal");
    await user.click(screen.getByRole("button", { name: "Bloquear datas" }));

    expect(screen.getByText("24/12/2026 a 26/12/2026")).toBeInTheDocument();
    expect(screen.getByText("Natal")).toBeInTheDocument();
    expect(saved()[0]).toMatchObject({
      startDate: "2026-12-24",
      endDate: "2026-12-26",
      reason: "Natal",
    });
  });

  it("sem data final bloqueia só um dia, com motivo padrão", async () => {
    const user = userEvent.setup();
    render(<BlockedPeriodsSection />);
    await user.type(screen.getByLabelText("De"), "2026-11-20");
    await user.click(screen.getByRole("button", { name: "Bloquear datas" }));

    expect(screen.getByText("20/11/2026")).toBeInTheDocument();
    expect(saved()[0]).toMatchObject({ endDate: "2026-11-20", reason: "Sem aula" });
  });

  it("recusa sem data inicial e fim antes do início", async () => {
    const user = userEvent.setup();
    render(<BlockedPeriodsSection />);
    await user.click(screen.getByRole("button", { name: "Bloquear datas" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/data inicial/);

    await user.type(screen.getByLabelText("De"), "2026-11-20");
    await user.type(screen.getByLabelText(/Até/), "2026-11-10");
    await user.click(screen.getByRole("button", { name: "Bloquear datas" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/antes/);
    expect(saved()).toEqual([]);
  });

  it("remove um bloqueio", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.blockedPeriods,
      JSON.stringify([
        { id: "p1", startDate: "2026-11-20", endDate: "2026-11-20", reason: "Feriado" },
      ]),
    );
    const user = userEvent.setup();
    render(<BlockedPeriodsSection />);
    await user.click(screen.getByRole("button", { name: /Remover/ }));

    expect(screen.getByText("Nenhuma data bloqueada.")).toBeInTheDocument();
    expect(saved()).toEqual([]);
  });
});
