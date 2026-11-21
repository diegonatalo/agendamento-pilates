import type { Metadata } from "next";
import { StudentsScreen } from "@/components/students-screen";

// depende da sessão (veja app/app/layout.tsx)
export const instant = false;

// O nome da aba vem do ramo (alunos, pacientes, clientes), mas o título é do servidor: fica neutro.
export const metadata: Metadata = { title: "Fichas" };

export default function Page() {
  return <StudentsScreen />;
}
