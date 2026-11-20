import type { Metadata } from "next";
import { PrivacyPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "A Agenda Pilates guarda os dados dos alunos só no navegador do estúdio. Veja o que fica guardado e os cuidados com dados de saúde.",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return <PrivacyPage />;
}
