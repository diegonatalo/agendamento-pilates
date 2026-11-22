import Link from "next/link";
import { Photo } from "@/components/landing/photo";
import { DISPLAY, PILL_OUTLINE, PILL_PRIMARY, SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";
import { HERO } from "@/lib/landing";
import type { PhotoKey } from "@/lib/landing-photos";

type Slot = { photo: PhotoKey; time: string; label: string; place: string };

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

/** No celular, duas colunas de blocos iguais; a partir de `md`, uma semana com durações diferentes. */
const SLOTS: Slot[] = [
  { photo: "pilates", time: "07:00", label: "Pilates", place: "md:col-start-1 md:row-start-1 md:row-span-4" },
  { photo: "barber", time: "08:00", label: "Barbearia", place: "md:col-start-2 md:row-start-2 md:row-span-5" },
  { photo: "languages", time: "07:00", label: "Idiomas", place: "md:col-start-3 md:row-start-1 md:row-span-3" },
  { photo: "music", time: "10:00", label: "Música", place: "md:col-start-3 md:row-start-4 md:row-span-3" },
  { photo: "personal", time: "07:00", label: "Personal", place: "md:col-start-4 md:row-start-1 md:row-span-4" },
  { photo: "psychology", time: "08:00", label: "Psicologia", place: "md:col-start-5 md:row-start-2 md:row-span-4" },
];

const EMPTY_SLOTS = [
  "md:col-start-1 md:row-start-5 md:row-span-2",
  "md:col-start-2 md:row-start-1",
  "md:col-start-5 md:row-start-1",
  "md:col-start-5 md:row-start-6",
];

export const Hero = () => (
  <section aria-labelledby="titulo" className={cn(SECTION, "pb-20 pt-12 sm:pt-16")}>
    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase sm:text-sm">{HERO.kicker}</p>
    <h1
      id="titulo"
      className={cn(DISPLAY, "mt-5 text-[clamp(2.75rem,7.4vw,5.5rem)] font-semibold leading-[0.98] text-balance")}
    >
      <span className="block">Cada um no seu horário.</span>{" "}
      <span className="block text-primary">Tudo se encaixa.</span>
    </h1>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
      <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted">{HERO.subtitle}</p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Link href="/cadastro" className={PILL_PRIMARY}>
            Criar conta grátis
          </Link>
          <Link href="/app" className={PILL_OUTLINE}>
            Abrir o app
          </Link>
        </div>
        <p className="text-sm text-muted">{HERO.note}</p>
      </div>
    </div>

    <div className="mt-10 rounded-[2rem] border border-line bg-surface p-2.5 sm:mt-12 sm:p-4">
      <div aria-hidden="true" className="mb-3 hidden grid-cols-5 gap-3 pt-1 md:grid">
        {DAYS.map((day) => (
          <span key={day} className="text-center text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            {day}
          </span>
        ))}
      </div>
      <ul
        aria-label="Exemplos de quem usa o Encaixe"
        className="grid auto-rows-[5rem] grid-cols-2 gap-2 sm:auto-rows-[7rem] md:auto-rows-[4.75rem] md:grid-cols-5 md:gap-3"
      >
        {SLOTS.map((slot) => (
          <li key={slot.photo} className={cn("relative row-span-2 overflow-hidden rounded-2xl", slot.place)}>
            <Photo name={slot.photo} eager sizes="(min-width: 1152px) 420px, (min-width: 768px) 36vw, 60vw" />
            <p className="absolute inset-x-0 bottom-0 flex flex-col bg-linear-to-t from-black/85 to-transparent px-3 pb-3 pt-12 text-white">
              <span className="text-xs">{slot.time}</span>
              <span className="font-semibold">{slot.label}</span>
            </p>
          </li>
        ))}
        <li className="col-span-2 flex flex-col justify-center rounded-2xl bg-mint p-4 text-forest motion-safe:animate-fit-in md:col-span-1 md:col-start-4 md:row-span-2 md:row-start-5">
          <span className="text-xs">11:00 · horário livre</span>
          <span className={cn(DISPLAY, "text-xl font-semibold leading-tight lg:text-2xl")}>O seu se encaixa aqui</span>
        </li>
        {EMPTY_SLOTS.map((place) => (
          <li
            key={place}
            aria-hidden="true"
            className={cn("hidden rounded-2xl border border-dashed border-line-strong md:block", place)}
          />
        ))}
      </ul>
    </div>
  </section>
);
