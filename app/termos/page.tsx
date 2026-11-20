import type { Metadata } from "next";
import { TermsPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "As regras para usar a Agenda Pilates. Os dados dos alunos são responsabilidade do estúdio.",
  alternates: { canonical: "/termos" },
};

export default function Page() {
  return <TermsPage />;
}
