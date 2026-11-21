import { screen } from "@testing-library/react";
import { renderStudio, resetStudio, seed } from "@/components/studio-test-utils";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainNav } from "@/components/main-nav";

const pathname = vi.hoisted(() => ({ current: "/app" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("MainNav", () => {
  beforeEach(() => resetStudio());

  it("lista as cinco seções", () => {
    renderStudio(<MainNav />);
    const names = screen.getAllByRole("link").map((l) => l.textContent);
    expect(names).toEqual(["Agenda", "Alunos", "Planos", "Horários", "Conta"]);
  });

  it("marca só a seção atual", () => {
    pathname.current = "/app/alunos";
    renderStudio(<MainNav />);
    expect(screen.getByRole("link", { name: "Alunos" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Agenda" })).not.toHaveAttribute("aria-current");
  });

  it("a Agenda só é a atual na raiz", () => {
    pathname.current = "/app";
    renderStudio(<MainNav />);
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Conta" })).not.toHaveAttribute("aria-current");
  });

  it("a aba de fichas usa o nome do ramo", () => {
    seed("settings", { ...DEFAULT_SETTINGS, businessType: "psychology" });
    renderStudio(<MainNav />);
    expect(screen.getByRole("link", { name: "Pacientes" })).toHaveAttribute("href", "/app/alunos");
  });
});
