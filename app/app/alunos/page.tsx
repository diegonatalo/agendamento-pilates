import type { Metadata } from "next";
import { StudentsScreen } from "@/components/students-screen";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

export const metadata: Metadata = { title: "Alunos" };

export default function Page() {
  return <StudentsScreen />;
}
