import { STORAGE_KEYS } from "@/lib/storage-keys";

export type Theme = "light" | "dark";

export const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

/**
 * Roda no `<head>`, antes da primeira pintura: aplica a escolha salva ou, sem
 * escolha, o tema do sistema. Evita o "flash" de tema errado.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(STORAGE_KEYS.theme)});var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
