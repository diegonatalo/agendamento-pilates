import type { Metadata } from "next";
import { SlotsScreen } from "@/components/slots-screen";

export const metadata: Metadata = { title: "Horários" };

export default function Page() {
  return <SlotsScreen />;
}
