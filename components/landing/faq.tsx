import { H2, SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";
import { FAQ } from "@/lib/landing";

/** `details` nativo: abre e fecha com Enter ou Espaço, sem JavaScript. */
export const Faq = () => (
  <section aria-labelledby="titulo-faq" className={cn(SECTION, "grid gap-10 py-20 sm:py-28 lg:grid-cols-[1fr_1.4fr]")}>
    <h2 id="titulo-faq" className={H2}>
      Antes de criar a sua conta
    </h2>
    <div className="divide-y divide-line border-y border-line">
      {FAQ.map((item, index) => (
        <details key={item.question} open={index === 0} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded py-4 text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden="true" className="text-2xl font-light text-primary group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 text-pretty text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  </section>
);
