import { Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/lib/cn";

/** Fonte de título só da landing; o app continua em Geist. */
const display = Bricolage_Grotesque({ subsets: ["latin"] });

export const DISPLAY = display.className;
export const SECTION = "mx-auto w-full max-w-6xl px-4 sm:px-6";
export const H2 = cn(DISPLAY, "text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl");

const PILL =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4";

export const PILL_PRIMARY = cn(PILL, "bg-primary text-primary-fg hover:bg-primary-hover focus-visible:outline-primary");
export const PILL_OUTLINE = cn(PILL, "border border-line-strong text-fg hover:bg-surface-2 focus-visible:outline-primary");
/** Para fundos verde-escuros, iguais nos dois temas. */
export const PILL_MINT = cn(PILL, "bg-mint text-forest hover:bg-cream focus-visible:outline-mint");
