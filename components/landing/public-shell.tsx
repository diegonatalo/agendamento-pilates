import Link from "next/link";
import type { ReactNode } from "react";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/form-styles";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { SOURCE_URL } from "@/lib/site";

/** Topo das páginas fora do app (landing, login e páginas legais). */
const PublicHeader = () => (
  <header className="sticky top-0 z-20 border-b border-line bg-bg print:hidden">
    <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
      <Logo />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link href="/entrar" className={`${BUTTON_SECONDARY} whitespace-nowrap`}>
          Entrar
        </Link>
        {/* No celular o hero já traz o mesmo link logo abaixo. */}
        <Link href="/app" className={`${BUTTON_PRIMARY} whitespace-nowrap max-sm:hidden`}>
          Abrir a agenda
        </Link>
      </div>
    </div>
  </header>
);

/** Moldura das páginas fora do app: topo, conteúdo e rodapé comum. */
export const PublicShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-full flex-col">
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-30 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg focus:outline-2 focus:outline-offset-2 focus:outline-primary print:hidden"
    >
      Pular para o conteúdo
    </a>
    <PublicHeader />
    {children}
    {/* Fora da impressão, para o termo de consentimento sair limpo. */}
    <div className="print:hidden">
      <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
    </div>
  </div>
);
