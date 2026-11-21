import { AccountSection } from "@/components/account-section";
import { BackupScreen } from "@/components/backup-screen";

/** Conta (sair e excluir) e backup em arquivo, na aba "Conta". */
export const AccountScreen = () => (
  <main className="flex flex-col gap-8">
    <h1 className="text-3xl font-semibold">Conta</h1>
    <AccountSection />
    <BackupScreen />
  </main>
);
