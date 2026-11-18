"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/form-styles";

type ErrorScreenProps = {
  error: unknown;
  retry: () => void;
};

export const ErrorScreen = ({ error, retry }: ErrorScreenProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-col items-center gap-5 py-16 text-center">
      <LogoMark className="size-16" />
      <h1 className="text-3xl font-semibold">Algo deu errado</h1>
      <p className="max-w-sm text-muted">
        Esta tela encontrou um erro inesperado. Tente de novo ou volte para o início.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className={BUTTON_PRIMARY}>
          Tentar de novo
        </button>
        <Link href="/" className={BUTTON_SECONDARY}>
          Voltar para o início
        </Link>
      </div>
    </main>
  );
};
