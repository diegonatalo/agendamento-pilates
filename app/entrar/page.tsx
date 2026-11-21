import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Entrar | ${SITE_NAME}`,
  description: "Entre na conta do estúdio para ver a agenda, os alunos e as mensalidades.",
  alternates: { canonical: "/entrar" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthScreen mode="sign-in" />;
}
