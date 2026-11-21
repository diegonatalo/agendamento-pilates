import type { Metadata } from "next";
import { PlansScreen } from "@/components/plans-screen";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export const metadata: Metadata = { title: "Planos" };

export default function Page() {
  return <PlansScreen />;
}
