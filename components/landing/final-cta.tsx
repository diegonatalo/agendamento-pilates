import Link from "next/link";
import { Photo } from "@/components/landing/photo";
import { H2, PILL_MINT, SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";
import type { PhotoKey } from "@/lib/landing-photos";

/** Os três primeiros quadrados do logo; o quarto é o horário que se encaixa. */
const TILES: PhotoKey[] = ["barber", "music", "pilates"];

export const FinalCta = () => (
  <section aria-labelledby="titulo-final" className={cn(SECTION, "pb-12")}>
    <div className="grid items-center gap-10 rounded-[2rem] bg-forest p-6 text-cream sm:p-10 md:grid-cols-2 lg:p-16">
      {/* O logo, montado com fotos. */}
      <div aria-hidden="true" className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3">
        {TILES.map((name) => (
          <div key={name} className="relative aspect-square overflow-hidden rounded-[22%]">
            <Photo name={name} decorative sizes="(min-width: 640px) 300px, 60vw" />
          </div>
        ))}
        <div className="aspect-square rounded-[22%] bg-mint" />
      </div>
      <div>
        <h2 id="titulo-final" className={H2}>
          Falta só o seu horário
        </h2>
        <p className="mt-4 text-lg text-pretty text-cream/75">
          Crie a conta, escolha o ramo e monte a semana em poucos minutos.
        </p>
        <Link href="/cadastro" className={cn(PILL_MINT, "mt-8")}>
          Criar conta grátis
        </Link>
      </div>
    </div>
  </section>
);
