import Link from "next/link";
import { DISPLAY, SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";

const LINK = "rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";

export const Privacy = () => (
  <section aria-labelledby="titulo-privacidade" className="bg-primary-soft text-primary-soft-fg">
    <div className={cn(SECTION, "py-16 sm:py-20")}>
      <h2 id="titulo-privacidade" className="text-sm font-semibold tracking-[0.18em] uppercase">
        Privacidade
      </h2>
      <p className={cn(DISPLAY, "mt-4 max-w-4xl text-3xl font-semibold leading-tight text-balance sm:text-4xl")}>
        Os dados dos seus clientes ficam na sua conta, protegidos por senha e sem cookies de rastreamento.
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
        <Link href="/privacidade" className={LINK}>
          Política de privacidade
        </Link>
        <Link href="/termos/consentimento" className={LINK}>
          Modelo de termo de consentimento
        </Link>
      </div>
    </div>
  </section>
);
