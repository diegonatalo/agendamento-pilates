import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CARD, BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/form-styles";
import { Logo, LogoMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { FAQ, FEATURES, HERO, PHOTOS, SCREENSHOT, STEPS, type FeatureIcon } from "@/lib/landing";
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
        <Link href="/entrar" className={`${BUTTON_SECONDARY} whitespace-nowrap`}>
          Entrar
        </Link>
        {/* No celular o hero já traz o mesmo link logo abaixo. */}
        <Link href="/app" className={`${BUTTON_PRIMARY} whitespace-nowrap max-sm:hidden`}>
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
    <main id="conteudo" className="flex flex-1 flex-col">
      <section className="relative overflow-hidden" aria-labelledby="titulo">
        {/* Círculo suave atrás da foto, como o ponto do logo. */}
        <div
          className="pointer-events-none absolute -right-32 top-10 size-[34rem] rounded-full bg-primary-soft opacity-70"
          aria-hidden="true"
        />
        <div className={`${SECTION} relative grid items-center gap-12 py-14 sm:py-20 md:grid-cols-[1.1fr_1fr]`}>
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">{HERO.kicker}</p>
            <h1
              id="titulo"
              className="font-display text-4xl font-light leading-[1.1] tracking-tight text-balance sm:text-5xl"
            >
              A agenda do estúdio, <span className="font-semibold text-primary">no seu ritmo.</span>
            </h1>
            <p className="text-lg text-pretty text-muted">{HERO.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/cadastro" className={`${BUTTON_PRIMARY} rounded-full px-6`}>
                Criar conta grátis
              </Link>
              <a href="#como-funciona" className={`${BUTTON_SECONDARY} rounded-full px-6`}>
                Ver como funciona
              </a>
            </div>
            <p className="text-sm text-muted">{HERO.note}</p>
          </div>
          {/* Foto em arco, como o arco do logo e os do próprio estúdio. */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-t-full rounded-b-[2rem] border-8 border-surface shadow-card">
              <Image
                src={PHOTOS.studio.src}
                alt={PHOTOS.studio.alt}
                width={1600}
                height={1067}
                priority
                sizes="(min-width: 768px) 384px, 100vw"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            <div className={`${CARD} absolute -bottom-6 -left-6 flex items-center gap-3 px-4 py-3 max-sm:left-2`}>
              <LogoMark className="size-8" />
              <div className="text-sm leading-tight">
                <p className="font-semibold">Segunda, 07:00</p>
                <p className="text-muted">3 de 3 vagas ocupadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-20 border-y border-line bg-surface py-20"
        aria-labelledby="titulo-como"
      >
        <div className={SECTION}>
          <h2 id="titulo-como" className={`${H2} text-center`}>
            Como funciona
          </h2>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-3">
            {/* Linha que liga os passos, no desktop. */}
            <span
              className="absolute left-[16.6%] right-[16.6%] top-5 hidden h-px bg-line-strong md:block"
              aria-hidden="true"
            />
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative flex flex-col items-center gap-3 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-primary font-semibold text-primary-fg ring-8 ring-surface">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="max-w-xs text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${SECTION} py-20`} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={H2}>
          Feito para a rotina do estúdio
        </h2>
        <div className={`${CARD} mt-8 overflow-hidden`}>
          <Image
            src={SCREENSHOT.light}
            alt={SCREENSHOT.alt}
            width={1280}
            height={800}
            sizes="(min-width: 1024px) 992px, 100vw"
            className="block h-auto w-full dark:hidden"
          />
          <Image
            src={SCREENSHOT.dark}
            alt={SCREENSHOT.alt}
            width={1280}
            height={800}
            sizes="(min-width: 1024px) 992px, 100vw"
            className="hidden h-auto w-full dark:block"
          />
        </div>
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft">
                <FeatureGlyph icon={feature.icon} />
              </span>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted">{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-primary-soft text-primary-soft-fg" aria-labelledby="titulo-privacidade">
        <div className={`${SECTION} grid items-center gap-10 py-16 md:grid-cols-[1fr_1.3fr]`}>
          <Image
            src={PHOTOS.student.src}
            alt={PHOTOS.student.alt}
            width={1600}
            height={1067}
            sizes="(min-width: 768px) 420px, 100vw"
            className="aspect-[4/3] w-full rounded-[2rem] object-cover"
          />
          <div className="flex flex-col gap-4">
            <h2 id="titulo-privacidade" className={H2}>
              Dados de saúde pedem cuidado
            </h2>
            <p className="text-pretty">
              As fichas ficam na conta do estúdio, protegidas por senha, e cada conta vê só os próprios alunos. Sem
              cookies de rastreamento nem propaganda. Como são dados de saúde, use uma senha forte, guarde o backup
              com cuidado e peça o termo de consentimento de cada aluno.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <Link href="/termos/consentimento" className="underline underline-offset-4">
                Modelo de termo de consentimento
              </Link>
              <Link href="/privacidade" className="underline underline-offset-4">
                Política de privacidade
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${SECTION} py-20`} aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={H2}>
          Perguntas frequentes
        </h2>
        <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question} className="border-l-2 border-primary pl-5">
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-2 text-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${SECTION} pb-20`} aria-labelledby="titulo-final">
        <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-primary px-6 pb-14 pt-20 text-center text-primary-fg">
          <h2 id="titulo-final" className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Comece pela <span className="font-semibold">grade de horários</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md opacity-85">Em poucos minutos a semana do estúdio está montada.</p>
          <Link
            href="/app/horarios"
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary-fg px-6 font-semibold text-primary hover:opacity-90"
          >
            Montar a grade
          </Link>
        </div>
      </section>
    </main>
  </PublicShell>
);
