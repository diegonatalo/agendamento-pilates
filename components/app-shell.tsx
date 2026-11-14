import type { ReactNode } from "react";
import { MainNav } from "@/components/main-nav";

type Props = { children: ReactNode };

export const AppShell = ({ children }: Props) => (
  <>
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-20 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-zinc-900 focus:outline-2 focus:outline-teal-600"
    >
      Pular para o conteúdo
    </a>
    <MainNav />
    <div
      id="conteudo"
      tabIndex={-1}
      className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 md:pb-8"
    >
      {children}
    </div>
  </>
);
