import type { Metadata } from "next";
import { PrivacyPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "O Encaixe guarda os dados dos seus clientes na sua conta. Veja o que fica guardado, onde, e os cuidados com dados de saúde.",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return <PrivacyPage />;
}
