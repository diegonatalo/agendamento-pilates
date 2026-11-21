import type { Metadata } from "next";
import { ConsentPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Termo de consentimento",
  description: "Modelo de termo de consentimento do cliente para tratamento de dados de saúde, para imprimir.",
  alternates: { canonical: "/termos/consentimento" },
};

export default function Page() {
  return <ConsentPage />;
}
