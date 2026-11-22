import { Photo } from "@/components/landing/photo";
import { DISPLAY, H2, SECTION } from "@/components/landing/styles";
import { BUSINESSES, type BusinessConfig } from "@/lib/business";
import { cn } from "@/lib/cn";
import { AUDIENCES } from "@/lib/landing";
import type { BusinessType } from "@/types/pilates";

/** Cada ramo com a sua cor, igual nos dois temas: são cartões, como fichas coloridas. */
const TONES: Record<BusinessType, string> = {
  pilates: "bg-sage text-forest",
  personal: "bg-forest text-cream",
  tutor: "bg-butter text-forest",
  psychology: "bg-mist text-forest",
  barber: "bg-espresso text-cream",
};

/** Até três campos de verdade da ficha daquele ramo, vindos de `lib/business.ts`. */
const recordPreview = (business: BusinessConfig) =>
  [business.record?.injuries?.label, business.attention.label, business.goals?.label, business.evolution.legend]
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);

const RecordCard = ({ business }: { business: BusinessConfig }) => (
  <div
    aria-hidden="true"
    className="absolute bottom-4 left-4 hidden w-60 max-w-[calc(100%-2rem)] rounded-2xl bg-white p-4 text-forest shadow-xl md:block"
  >
    <p className="text-sm font-semibold">Novo {business.client.one}</p>
    <ul className="mt-2 divide-y divide-forest/10">
      {recordPreview(business).map((label) => (
        <li key={label} className="truncate py-1.5 text-xs text-forest/75">
          {label}
        </li>
      ))}
    </ul>
  </div>
);

export const Audiences = () => (
  <section id="para-quem" aria-labelledby="titulo-para-quem" className="scroll-mt-20 py-20 sm:py-28">
    <div className={SECTION}>
      <div className="grid gap-5 md:grid-cols-2 md:items-end md:gap-14">
        <h2 id="titulo-para-quem" className={H2}>
          O app fala a língua do seu negócio
        </h2>
        <p className="text-lg text-pretty text-muted">
          Você escolhe o ramo ao criar a conta. Aluno, paciente ou cliente: os nomes e a ficha mudam junto com ele.
        </p>
      </div>

      {/* A partir de `md`, os cartões se empilham ao rolar, como horários se encaixando. */}
      <ul className="mt-12 flex flex-col gap-5 md:mt-16 md:gap-8">
        {AUDIENCES.map(({ type, text, photos }, index) => {
          const business = BUSINESSES[type];
          return (
            <li key={type} className="md:sticky" style={{ top: `${5.5 + index * 0.75}rem` }}>
              <article
                className={cn("grid overflow-hidden rounded-[2rem] md:h-[27rem] md:grid-cols-[1fr_1.2fr]", TONES[type])}
              >
                <div className="flex flex-col justify-center gap-5 p-6 sm:p-9 lg:p-12">
                  <h3 className={cn(DISPLAY, "text-3xl font-semibold leading-[1.05] text-balance lg:text-5xl")}>
                    {business.label}
                  </h3>
                  <p className="text-pretty lg:text-lg">{text}</p>
                  <ul aria-label="Como o app chama" className="flex flex-wrap gap-2 text-sm font-medium">
                    {[business.client.many, business.session.many, business.oneOff.label.toLowerCase()].map((word) => (
                      <li key={word} className="rounded-full border border-current/30 px-3 py-1">
                        {word}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={cn(
                    "relative order-first grid h-64 gap-1 sm:h-80 md:order-none md:h-auto md:min-h-0",
                    photos.length > 1 ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  {photos.map((name) => (
                    <div key={name} className="relative overflow-hidden">
                      <Photo name={name} sizes="(min-width: 1152px) 620px, (min-width: 768px) 55vw, 100vw" />
                    </div>
                  ))}
                  <RecordCard business={business} />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);
