"use client";

import { useState, type FormEvent } from "react";
import { BUTTON_DANGER, BUTTON_SECONDARY, CARD, INPUT_CLASS } from "@/components/form-styles";
import { useAccount } from "@/hooks/use-account";
import { authClient } from "@/lib/auth-client";
import { ACCOUNT_HEADER, deleteErrorMessage } from "@/lib/auth-form";

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
  const [password, setPassword] = useState("");

  const closeDelete = () => {
    setConfirmingDelete(false);
    setPassword("");
  };

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

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setPending(true);
    setError(null);
    const { error } = await authClient
      .deleteUser({ password, fetchOptions: { headers: { [ACCOUNT_HEADER]: account.id } } })
      .catch(() => ({ error: { code: "NETWORK" } }));
    if (error) {
      setPending(false);
      closeDelete();
      setError(deleteErrorMessage(error.code));
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
        <form
          role="group"
          aria-labelledby="delete-title"
          onSubmit={deleteAccount}
          className="flex flex-col gap-3 rounded-xl bg-danger-soft p-4 text-danger-soft-fg"
        >
          <p id="delete-title" className="font-semibold">
            Excluir a conta e todos os dados?
          </p>
          <p className="text-sm">
            Fichas, horários, agenda, planos e pagamentos são apagados para sempre. Essa ação não
            pode ser desfeita.
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="delete-password" className="text-sm font-medium">
              Sua senha
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending || !password} className={BUTTON_DANGER}>
              Excluir para sempre
            </button>
            <button
              type="button"
              onClick={closeDelete}
              disabled={pending}
              className={BUTTON_SECONDARY}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </section>
  );
};
