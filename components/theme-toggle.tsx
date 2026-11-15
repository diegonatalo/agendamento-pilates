"use client";

import { useEffect } from "react";
import { isTheme } from "@/lib/theme";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

const readChoice = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
};

/** Alterna claro/escuro; sem escolha salva, acompanha o sistema. */
export const ThemeToggle = () => {
  useEffect(() => {
    const query = window.matchMedia(SYSTEM_QUERY);
    const onChange = () => {
      if (readChoice() === null)
        document.documentElement.classList.toggle("dark", query.matches);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      // Sem armazenamento, o tema vale só até recarregar.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar entre tema claro e escuro"
      className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-fg hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* O ícone troca só por CSS, então não depende de estado no cliente. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="hidden size-5 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
};
