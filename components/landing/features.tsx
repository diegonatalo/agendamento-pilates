import { H2, SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";
import { FEATURES, type FeatureIcon } from "@/lib/landing";

/** Traços de 24x24 (mesmo estilo dos ícones do menu). */
const ICON_PATHS: Record<FeatureIcon, string> = {
  calendar: "M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  users:
    "M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1a4 4 0 0 0-3-3.9M15 4.2a3.5 3.5 0 0 1 0 6.6",
  health: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10ZM9 11h6M12 8v6",
  money: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01",
  block: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5.6 5.6l12.8 12.8",
  devices:
    "M4 5h12a1 1 0 0 1 1 1v8H3V6a1 1 0 0 1 1-1ZM1 17h17M19 9h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z",
};

export const Features = () => (
  <section aria-labelledby="titulo-recursos" className={cn(SECTION, "py-20 sm:py-28")}>
    <h2 id="titulo-recursos" className={cn(H2, "max-w-2xl")}>
      Menos caderno, mais atendimento
    </h2>
    {/* O vão de 1px sobre o fundo `line` desenha a grade, como a de uma agenda. */}
    <ul className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <li key={feature.title} className="bg-surface p-7 sm:p-8">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-8 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={ICON_PATHS[feature.icon]} />
          </svg>
          <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
          <p className="mt-2 text-pretty text-muted">{feature.text}</p>
        </li>
      ))}
    </ul>
  </section>
);
