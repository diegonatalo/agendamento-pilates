"use client";

import Link from "next/link";
import { AuthForm, type AuthMode } from "@/components/auth-form";
import { CARD } from "@/components/form-styles";
import { PublicShell } from "@/components/landing/landing-page";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, safeRedirect, type SignUpInput } from "@/lib/auth-form";
import { RETURN_PARAM, paths } from "@/lib/paths";

const COPY = {
  "sign-in": {
    title: "Entrar",
    lead: "A agenda, os alunos e as mensalidades do estúdio em qualquer aparelho.",
    switchText: "Ainda não tem conta?",
    switchLabel: "Criar conta",
    switchHref: paths.signUp,
  },
  "sign-up": {
    title: "Criar conta",
    lead: "Grátis. Os dados do estúdio ficam salvos na sua conta.",
    switchText: "Já tem conta?",
    switchLabel: "Entrar",
    switchHref: paths.signIn,
  },
} as const;

/** Lido só no envio, para a página não depender da URL ao renderizar. */
const returnTo = () => safeRedirect(new URLSearchParams(window.location.search).get(RETURN_PARAM));

const send = async (mode: AuthMode, values: SignUpInput) => {
  const { error } =
    mode === "sign-up"
      ? await authClient.signUp.email(values)
      : await authClient.signIn.email({ email: values.email, password: values.password });
  if (error) return authErrorMessage(error);
  // navegação completa: o app abre do zero, já com os dados da conta
  window.location.assign(returnTo());
  return null;
};

export const AuthScreen = ({ mode }: { mode: AuthMode }) => {
  const copy = COPY[mode];
  return (
    <PublicShell>
      <main id="conteudo" className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10 sm:py-16">
        <div className={`${CARD} p-5 sm:p-7`}>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mb-6 mt-1 text-sm text-pretty text-muted">{copy.lead}</p>
          <AuthForm mode={mode} onSubmit={(values) => send(mode, values).catch(() => authErrorMessage(null))} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          {copy.switchText}{" "}
          <Link href={copy.switchHref} className="rounded font-semibold text-primary underline underline-offset-2">
            {copy.switchLabel}
          </Link>
        </p>
      </main>
    </PublicShell>
  );
};
