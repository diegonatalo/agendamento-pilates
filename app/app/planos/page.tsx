import type { Metadata } from "next";
import { PlansScreen } from "@/components/plans-screen";

export const metadata: Metadata = { title: "Planos" };

export default function Page() {
  return <PlansScreen />;
}
