"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { StudioContext, useSyncStatus } from "@/hooks/use-studio";
import { AccountContext, type Account } from "@/hooks/use-account";
import type { StudioState } from "@/lib/studio-changes";
import { createStudioStore, type SaveChanges } from "@/lib/studio-store";

type Props = {
  initialData: StudioState;
  account: Account;
  /** Onde cada mudança é gravada. No app, a Server Action; nos testes, um dublê. */
  save: SaveChanges;
  children: ReactNode;
};

const noopSubscribe = () => () => {};

/**
 * Os dados chegam do servidor já carregados. As telas ainda são desenhadas só
 * no navegador porque várias dependem da data de hoje: no servidor (e na
 * hidratação) sai vazio, e o HTML sempre coincide.
 */
export const StudioProvider = ({ initialData, account: initialAccount, save, children }: Props) => {
  const [store] = useState(() => createStudioStore(initialData, save));
  // congelada junto com o store: os dados e o dono deles andam juntos
  const [account] = useState(initialAccount);
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) return null;
  return (
    <AccountContext value={account}>
      <StudioContext value={store}>
        <SyncNotice />
        {children}
      </StudioContext>
    </AccountContext>
  );
};

/** Avisa quando algo não foi salvo e segura a aba enquanto há mudança a caminho. */
const SyncNotice = () => {
  const { saving, failed, conflict } = useSyncStatus();

  useEffect(() => {
    if (!saving) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saving]);

  return (
    <>
      {/* Marca para os testes E2E esperarem o banco. */}
      {saving && <span data-saving hidden />}
      {conflict && (
        <div role="alert" className="fixed inset-x-3 top-3 z-40 mx-auto max-w-lg rounded-xl bg-danger px-4 py-3 text-sm font-medium text-danger-fg shadow-card">
          A ficha mudou em outro aparelho, e a sua última alteração não foi salva. Copie o que você escreveu e{" "}
          <button type="button" onClick={() => window.location.reload()} className="underline underline-offset-2">
            recarregue a página
          </button>
          .
        </div>
      )}
      {failed && !conflict && (
        <div role="alert" className="fixed inset-x-3 top-3 z-40 mx-auto max-w-lg rounded-xl bg-danger px-4 py-3 text-sm font-medium text-danger-fg shadow-card">
          Não foi possível salvar a última mudança: a conexão falhou ou outra conta entrou neste
          navegador. Verifique e{" "}
          <button type="button" onClick={() => window.location.reload()} className="underline underline-offset-2">
            recarregue a página
          </button>
          .
        </div>
      )}
    </>
  );
};
