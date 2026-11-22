import Image from "next/image";
import { DISPLAY, H2, SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";
import { SCREENSHOT, STEPS } from "@/lib/landing";

const SHOT_SIZES = "(min-width: 1152px) 1104px, 100vw";

export const HowItWorks = () => (
  <section id="como-funciona" aria-labelledby="titulo-como" className="scroll-mt-20 bg-forest py-20 text-cream sm:py-28">
    <div className={SECTION}>
      <h2 id="titulo-como" className={cn(H2, "max-w-2xl")}>
        Da semana em branco à <span className="text-mint">semana encaixada</span>
      </h2>
      <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
        {STEPS.map((step, index) => (
          <li key={step.title} className="border-t border-cream/25 pt-5">
            <span aria-hidden="true" className={cn(DISPLAY, "text-4xl font-semibold text-mint")}>
              {index + 1}
            </span>
            <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-pretty text-cream/75">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-14 overflow-hidden rounded-2xl border-4 border-cream/15 sm:rounded-[2rem] sm:border-8">
        <Image
          src={SCREENSHOT.light}
          alt={SCREENSHOT.alt}
          width={1280}
          height={800}
          sizes={SHOT_SIZES}
          className="block h-auto w-full dark:hidden"
        />
        <Image
          src={SCREENSHOT.dark}
          alt={SCREENSHOT.alt}
          width={1280}
          height={800}
          sizes={SHOT_SIZES}
          className="hidden h-auto w-full dark:block"
        />
      </div>
    </div>
  </section>
);
