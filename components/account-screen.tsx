"use client";

import { AccountSection } from "@/components/account-section";
import { BusinessPicker } from "@/components/business-picker";
import { CARD } from "@/components/form-styles";
import { useStudio } from "@/hooks/use-studio";

/** Aba "Conta": quem está logado, o ramo do negócio, sair e excluir a conta. */
export const AccountScreen = () => {
  const { settings, slots, chooseBusiness } = useStudio();
  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">Conta</h1>
      <AccountSection />
      <section aria-labelledby="business-title" className={`${CARD} flex flex-col gap-3 p-4 sm:p-5`}>
        <h2 id="business-title" className="text-2xl font-semibold">
          Tipo de negócio
        </h2>
        <p className="text-sm text-muted">
          Muda os nomes no app e os campos da ficha. Nada do que já foi cadastrado é apagado.
          {slots.length > 0 ? " A duração e as vagas dos horários continuam como estão." : ""}
        </p>
        <BusinessPicker
          legend="Ramo"
          current={settings.businessType}
          submitLabel="Trocar o tipo de negócio"
          onPick={chooseBusiness}
        />
      </section>
    </main>
  );
};
