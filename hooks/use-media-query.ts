import { useSyncExternalStore } from "react";

/** Breakpoint `md` do Tailwind. */
export const DESKTOP_QUERY = "(min-width: 48rem)";

/**
 * Se a media query casa. No servidor e antes da hidratação é `false`,
 * então a primeira pintura é sempre a versão de celular (mobile-first).
 */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
