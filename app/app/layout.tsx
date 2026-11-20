import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

// As telas do app mostram dados dos alunos de cada estúdio: fora da busca.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** O app (agenda, alunos, planos, horários e backup) mora em `/app`; a landing fica em `/`. */
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return <AppShell>{children}</AppShell>;
}
