import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/form-styles";

export const NotFoundScreen = () => (
  <main className="flex flex-col items-center gap-5 px-4 py-16 text-center">
    <LogoMark className="size-16" />
    <h1 className="text-3xl font-semibold">Página não encontrada</h1>
    <p className="max-w-sm text-muted">
      O endereço que você abriu não existe.
    </p>
    <div className="flex flex-wrap justify-center gap-3">
      <Link href="/app" className={BUTTON_PRIMARY}>
        Abrir a agenda
      </Link>
      <Link href="/" className={BUTTON_SECONDARY}>
        Voltar para o início
      </Link>
    </div>
  </main>
);
