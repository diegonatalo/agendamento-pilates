import type { Metadata } from "next";
import { AccountScreen } from "@/components/account-screen";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export const metadata: Metadata = { title: "Conta" };

export default function Page() {
  return <AccountScreen />;
}
