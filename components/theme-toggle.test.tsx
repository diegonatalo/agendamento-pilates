import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";
import { STORAGE_KEYS } from "@/lib/storage-keys";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("alterna para o escuro e salva a escolha", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /Alternar entre tema/ }));

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");
  });

  it("volta para o claro no segundo clique", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /Alternar entre tema/ });
    await user.click(button);
    await user.click(button);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("light");
  });

  it("parte do tema que já estava aplicado na página", async () => {
    document.documentElement.classList.add("dark");
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /Alternar entre tema/ }));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("light");
  });
});
