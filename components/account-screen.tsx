import { AccountSection } from "@/components/account-section";

/** Aba "Conta": quem está logado, sair e excluir a conta. */
export const AccountScreen = () => (
  <main className="flex flex-col gap-8">
    <h1 className="text-3xl font-semibold">Conta</h1>
    <AccountSection />
  </main>
);
