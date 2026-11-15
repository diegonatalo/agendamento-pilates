import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = { children: ReactNode };

export const AppShell = ({ children }: Props) => (
  <>
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-30 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg focus:outline-2 focus:outline-offset-2 focus:outline-primary"
    >
      Pular para o conteúdo
    </a>
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <MainNav />
        <ThemeToggle />
      </div>
    </header>
    <div
      id="conteudo"
      tabIndex={-1}
      className="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-6 focus:outline-none md:pb-10 md:pt-8"
    >
      {children}
    </div>
  </>
);
