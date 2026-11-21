import type { Metadata } from "next";
import { SlotsScreen } from "@/components/slots-screen";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export const metadata: Metadata = { title: "Horários" };

export default function Page() {
  return <SlotsScreen />;
}
