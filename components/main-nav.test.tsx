import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainNav } from "@/components/main-nav";

const pathname = vi.hoisted(() => ({ current: "/app" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("MainNav", () => {
  it("lista as cinco seções", () => {
    render(<MainNav />);
    const names = screen.getAllByRole("link").map((l) => l.textContent);
    expect(names).toEqual(["Agenda", "Alunos", "Planos", "Horários", "Backup"]);
  });

  it("marca só a seção atual", () => {
    pathname.current = "/app/alunos";
    render(<MainNav />);
    expect(screen.getByRole("link", { name: "Alunos" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Agenda" })).not.toHaveAttribute("aria-current");
  });

  it("a Agenda só é a atual na raiz", () => {
    pathname.current = "/app";
    render(<MainNav />);
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Backup" })).not.toHaveAttribute("aria-current");
  });
});
