import type { Metadata } from "next";
import { StudentsScreen } from "@/components/students-screen";

export const metadata: Metadata = { title: "Alunos" };

export default function Page() {
  return <StudentsScreen />;
}
