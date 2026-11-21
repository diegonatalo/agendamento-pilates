import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { BusinessGate } from "@/components/business-gate";
import { renderStudio, resetStudio, seed, stored } from "@/components/studio-test-utils";
import { DEFAULT_SETTINGS } from "@/lib/constants";

describe("BusinessGate", () => {
  beforeEach(() => resetStudio());

  it("conta nova escolhe o ramo antes de abrir o app", async () => {
    seed("settings", DEFAULT_SETTINGS);
    renderStudio(
      <BusinessGate>
        <p>App aberto</p>
      </BusinessGate>,
    );
    expect(screen.queryByText("App aberto")).not.toBeInTheDocument();
    const start = screen.getByRole("button", { name: "Começar" });
    expect(start).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: /Psicólogo/ }));
    await userEvent.click(start);

    expect(screen.getByText("App aberto")).toBeInTheDocument();
    expect(stored("settings")).toEqual({ businessType: "psychology", sessionMinutes: 50, breakMinutes: 10, capacity: 1 });
  });

  it("conta que já escolheu abre direto", () => {
    renderStudio(
      <BusinessGate>
        <p>App aberto</p>
      </BusinessGate>,
    );
    expect(screen.getByText("App aberto")).toBeInTheDocument();
  });
});
