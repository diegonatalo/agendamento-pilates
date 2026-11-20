import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CARD, BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/form-styles";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { FAQ, FEATURES, HERO, SCREENSHOT, STEPS, type FeatureIcon } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

/** Traços de 24x24 (mesmo estilo dos ícones do menu). */
const ICON_PATHS: Record<FeatureIcon, string> = {
  calendar: "M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  users:
    "M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1a4 4 0 0 0-3-3.9M15 4.2a3.5 3.5 0 0 1 0 6.6",
  health: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10ZM9 11h6M12 8v6",
  money: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01",
  block: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5.6 5.6l12.8 12.8",
  backup: "M12 3v12M7 10l5 5 5-5M5 21h14",
};

const FeatureGlyph = ({ icon }: { icon: FeatureIcon }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-6 text-primary"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={ICON_PATHS[icon]} />
  </svg>
);

const SECTION = "mx-auto w-full max-w-5xl px-4";
const H2 = "font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl";

/** Topo das páginas fora do app (landing e páginas legais). */
export const PublicHeader = () => (
  <header className="sticky top-0 z-20 border-b border-line bg-bg print:hidden">
    <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
      <Logo />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link href="/app" className={BUTTON_PRIMARY}>
          Abrir a agenda
        </Link>
      </div>
    </div>
  </header>
);

/** Moldura das páginas fora do app: topo, conteúdo e rodapé comum. */
export const PublicShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-full flex-col">
    <PublicHeader />
    {children}
    {/* Fora da impressão, para o termo de consentimento sair limpo. */}
    <div className="print:hidden">
      <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
    </div>
  </div>
);

/** Página inicial: apresenta a Agenda Pilates e leva ao app (`/app`). */
export const LandingPage = () => (
  <PublicShell>
    <main id="conteudo" className="flex flex-1 flex-col gap-20 pb-20">
      <section className={`${SECTION} flex flex-col gap-10 pt-12 sm:pt-16`} aria-labelledby="titulo">
        <div className="flex max-w-3xl flex-col gap-5">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">{HERO.kicker}</p>
          <h1 id="titulo" className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {HERO.title}
          </h1>
          <p className="text-lg text-pretty text-muted">{HERO.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={BUTTON_PRIMARY}>
              Abrir a agenda
            </Link>
            <a href="#como-funciona" className={BUTTON_SECONDARY}>
              Ver como funciona
            </a>
          </div>
          <p className="text-sm text-muted">{HERO.note}</p>
        </div>
        <div className={`${CARD} overflow-hidden`}>
          <Image
            src={SCREENSHOT.light}
            alt={SCREENSHOT.alt}
            width={1280}
            height={800}
            priority
            sizes="(min-width: 1024px) 992px, 100vw"
            className="block h-auto w-full dark:hidden"
          />
          <Image
            src={SCREENSHOT.dark}
            alt={SCREENSHOT.alt}
            width={1280}
            height={800}
            priority
            sizes="(min-width: 1024px) 992px, 100vw"
            className="hidden h-auto w-full dark:block"
          />
        </div>
      </section>

      <section id="como-funciona" className={`${SECTION} scroll-mt-20`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={H2}>
          Como funciona
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`${CARD} flex flex-col gap-3 p-5`}>
              <span className="grid size-9 place-items-center rounded-lg bg-primary-soft font-semibold text-primary-soft-fg">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={SECTION} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={H2}>
          Feito para a rotina do estúdio
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className={`${CARD} flex flex-col gap-2 p-5`}>
              <FeatureGlyph icon={feature.icon} />
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={SECTION} aria-labelledby="titulo-privacidade">
        <div className="flex flex-col gap-3 rounded-2xl bg-primary-soft p-8 text-primary-soft-fg">
          <h2 id="titulo-privacidade" className={H2}>
            Dados de saúde pedem cuidado
          </h2>
          <p className="max-w-2xl text-pretty">
            As fichas ficam só no navegador do estúdio: não há conta, servidor nem cookies de rastreamento. Como
            são dados de saúde, use um computador só do estúdio, guarde o backup com cuidado e peça o{" "}
            <Link href="/termos/consentimento" className="font-semibold underline underline-offset-2">
              termo de consentimento
            </Link>{" "}
            de cada aluno. Detalhes na{" "}
            <Link href="/privacidade" className="font-semibold underline underline-offset-2">
              política de privacidade
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={SECTION} aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={H2}>
          Perguntas frequentes
        </h2>
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question} className={`${CARD} p-5`}>
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-2 text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${SECTION} text-center`} aria-labelledby="titulo-final">
        <h2 id="titulo-final" className={H2}>
          Comece pela grade de horários
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">Em poucos minutos a semana do estúdio está montada.</p>
        <Link href="/app/horarios" className={`${BUTTON_PRIMARY} mt-6`}>
          Montar a grade
        </Link>
      </section>
    </main>
  </PublicShell>
);
