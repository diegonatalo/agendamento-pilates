import type { NextConfig } from "next";

export type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/**
 * Redirecionamentos do projeto, lidos pelo `next.config.ts` (que é igual em todos os projetos).
 * As telas saíram da raiz para `/app` quando a landing entrou em `/`.
 */
export const REDIRECTS: Redirect[] = [
  ...["/alunos", "/planos", "/horarios"].map((source) => ({
    source,
    destination: `/app${source}`,
    permanent: true,
  })),
  // O backup virou parte da tela de conta quando o app ganhou login.
  { source: "/backup", destination: "/app/conta", permanent: true },
  { source: "/app/backup", destination: "/app/conta", permanent: true },
];
