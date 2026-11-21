"use client";

import type { ReactNode } from "react";
import { BusinessPicker } from "@/components/business-picker";
import { CARD } from "@/components/form-styles";
import { useStudio } from "@/hooks/use-studio";

/** Na primeira visita de uma conta nova, pergunta o ramo antes de abrir o app. */
export const BusinessGate = ({ children }: { children: ReactNode }) => {
  const { settings, chooseBusiness } = useStudio();
  if (settings.businessType) return children;
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Boas-vindas ao Encaixe</h1>
        <p className="mt-2 text-muted">
          Conte qual é o seu negócio. O app usa os nomes certos (aluno, paciente ou cliente) e mostra na ficha só o que
          faz sentido para você. Dá para trocar depois na aba Conta.
        </p>
      </div>
      <div className={`${CARD} p-4 sm:p-5`}>
        <BusinessPicker legend="Qual é o seu negócio?" current={null} submitLabel="Começar" onPick={chooseBusiness} />
      </div>
    </main>
  );
};
