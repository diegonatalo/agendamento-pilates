import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isTheme, THEME_INIT_SCRIPT } from "@/lib/theme";

const runScript = () => new Function(THEME_INIT_SCRIPT)();

const mockSystemDark = (dark: boolean) => {
  window.matchMedia = vi.fn(
    (query: string) =>
      ({ matches: dark, media: query }) as unknown as MediaQueryList,
  );
};

describe("isTheme", () => {
  it("aceita só claro e escuro", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe("THEME_INIT_SCRIPT", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });
  afterEach(() => vi.restoreAllMocks());

  it("usa a chave padrão de storage do tema", () => {
    expect(THEME_INIT_SCRIPT).toContain("app:theme:v1");
  });

  it("aplica o escuro quando é a escolha salva, mesmo com o sistema claro", () => {
    mockSystemDark(false);
    window.localStorage.setItem(STORAGE_KEYS.theme, "dark");
    runScript();
    expect(document.documentElement).toHaveClass("dark");
  });

  it("aplica o claro quando é a escolha salva, mesmo com o sistema escuro", () => {
    mockSystemDark(true);
    document.documentElement.classList.add("dark");
    window.localStorage.setItem(STORAGE_KEYS.theme, "light");
    runScript();
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("sem escolha salva, segue o sistema", () => {
    mockSystemDark(true);
    runScript();
    expect(document.documentElement).toHaveClass("dark");

    mockSystemDark(false);
    runScript();
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("ignora valor salvo inválido e segue o sistema", () => {
    mockSystemDark(true);
    window.localStorage.setItem(STORAGE_KEYS.theme, "azul");
    runScript();
    expect(document.documentElement).toHaveClass("dark");
  });
});
