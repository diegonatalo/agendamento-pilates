"use client";

import { useState } from "react";
import { BUTTON_DANGER, BUTTON_SECONDARY, CARD } from "@/components/form-styles";
import { useAccount } from "@/hooks/use-account";
import { authClient } from "@/lib/auth-client";

/**
 * Navegação completa de propósito, não `router.push`: descarta o store e o
 * cache do roteador, para nada da conta ficar na memória da aba depois de sair.
 */
const leave = () => window.location.assign(new URL("/", window.location.origin));

export const AccountSection = () => {
  const account = useAccount();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const signOut = async () => {
    setPending(true);
    setError(null);
    const { error } = await authClient.signOut().catch(() => ({ error: true }));
    if (error) {
      setPending(false);
      setError("Não foi possível sair. Verifique sua conexão e tente de novo.");
      return;
    }
    leave();
  };

  const deleteAccount = async () => {
    setPending(true);
    setError(null);
    const { error } = await authClient.deleteUser().catch(() => ({ error: { code: "NETWORK" } }));
    if (error) {
      setPending(false);
      setConfirmingDelete(false);
      setError(
        typeof error === "object" && error.code === "SESSION_EXPIRED"
          ? "Por segurança, saia e entre de novo antes de excluir a conta."
          : "Não foi possível excluir a conta. Tente de novo.",
      );
      return;
    }
    leave();
  };

  return (
    <section aria-labelledby="account-title" className={`${CARD} flex flex-col gap-4 p-4 sm:p-5`}>
      <h2 id="account-title" className="text-2xl font-semibold">
        Sua conta
      </h2>
      <div className="min-w-0">
        <p className="truncate font-semibold">{account.name}</p>
        <p className="truncate text-sm text-muted">{account.email}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={signOut} disabled={pending} className={BUTTON_SECONDARY}>
          Sair
        </button>
        {!confirmingDelete && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
            className={`${BUTTON_SECONDARY} text-danger`}
          >
            Excluir conta
          </button>
        )}
      </div>
      {confirmingDelete && (
        <div role="group" aria-labelledby="delete-title" className="flex flex-col gap-3 rounded-xl bg-danger-soft p-4 text-danger-soft-fg">
          <p id="delete-title" className="font-semibold">
            Excluir a conta e todos os dados?
          </p>
          <p className="text-sm">
            Alunos, fichas de saúde, horários, agenda, planos e pagamentos são apagados para sempre. Essa ação não
            pode ser desfeita.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={deleteAccount} disabled={pending} className={BUTTON_DANGER}>
              Excluir para sempre
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={pending}
              className={BUTTON_SECONDARY}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </section>
  );
};
