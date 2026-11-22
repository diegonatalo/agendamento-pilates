import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Criar conta | ${SITE_NAME}`,
  description: "Crie a sua conta grátis, escolha o seu ramo e monte a grade de horários.",
  alternates: { canonical: "/cadastro" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthScreen mode="sign-up" />;
}
