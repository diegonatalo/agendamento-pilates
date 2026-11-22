"use client";

import { useId, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { BUTTON_PRIMARY, FOCUS_RING } from "@/components/form-styles";
import {
  PASSWORD_MIN,
  hasErrors,
  validateSignIn,
  validateSignUp,
  type FieldErrors,
  type SignUpInput,
} from "@/lib/auth-form";
import { cn } from "@/lib/cn";

export type AuthMode = "sign-in" | "sign-up";

type Props = {
  mode: AuthMode;
  /** Envia o formulário; devolve a mensagem de erro, ou `null` quando deu certo. */
  onSubmit: (values: SignUpInput) => Promise<string | null>;
};

const COPY = {
  "sign-in": { submit: "Entrar", pending: "Entrando…" },
  "sign-up": { submit: "Criar conta", pending: "Criando conta…" },
} as const;

const EYE = "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z";
const EYE_OFF =
  "M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2";

const noSubscribe = () => () => {};

export const AuthForm = ({ mode, onSubmit }: Props) => {
  const id = useId();
  const [values, setValues] = useState<SignUpInput>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<SignUpInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const signUp = mode === "sign-up";

  const change = (field: keyof SignUpInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // a mensagem some assim que a pessoa corrige o campo
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const found: FieldErrors<SignUpInput> = signUp ? validateSignUp(values) : validateSignIn(values);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) {
      const first = (["name", "email", "password"] as const).find((f) => found[f]);
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setPending(true);
    const message = await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    // quando dá certo a tela navega; o botão fica em "Entrando…" até lá
    if (message) {
      setFormError(message);
      setPending(false);
    }
  };

  // `post` e o botão desligado até hidratar: antes do JavaScript carregar, o envio
  // nativo (GET por padrão) poria a senha na URL, no histórico e nos logs.
  return (
    <form method="post" noValidate onSubmit={submit} className="flex flex-col gap-4">
      {signUp && (
        <AuthField
          id={`${id}-name`}
          label="Nome"
          error={errors.name}
          input={{ type: "text", autoComplete: "name", value: values.name, onChange: change("name") }}
        />
      )}
      <AuthField
        id={`${id}-email`}
        label="E-mail"
        error={errors.email}
        input={{
          type: "email",
          autoComplete: "email",
          inputMode: "email",
          value: values.email,
          onChange: change("email"),
        }}
      />
      <AuthField
        id={`${id}-password`}
        label="Senha"
        hint={signUp ? `Pelo menos ${PASSWORD_MIN} caracteres.` : undefined}
        error={errors.password}
        input={{
          type: showPassword ? "text" : "password",
          autoComplete: signUp ? "new-password" : "current-password",
          value: values.password,
          onChange: change("password"),
        }}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className={cn(
              "grid size-10 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg",
              FOCUS_RING,
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={showPassword ? EYE_OFF : EYE} />
            </svg>
          </button>
        }
      />

      {formError && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-soft-fg">
          {formError}
        </p>
      )}

      <button type="submit" disabled={!hydrated || pending} className={cn(BUTTON_PRIMARY, "mt-1 w-full text-base")}>
        {pending ? COPY[mode].pending : COPY[mode].submit}
      </button>
    </form>
  );
};

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  input: {
    type: string;
    autoComplete: string;
    inputMode?: "email";
    value: string;
    onChange: (value: string) => void;
  };
  trailing?: ReactNode;
};

const AuthField = ({ id, label, hint, error, input, trailing }: FieldProps) => {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg border bg-surface pr-1 shadow-xs focus-within:outline-2 focus-within:outline-primary",
          error ? "border-danger" : "border-line-strong",
        )}
      >
        <input
          id={id}
          name={id.split("-").pop()}
          type={input.type}
          autoComplete={input.autoComplete}
          inputMode={input.inputMode}
          value={input.value}
          onChange={(e) => input.onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-base outline-none"
        />
        {trailing}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
