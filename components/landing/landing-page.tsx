import { Audiences } from "@/components/landing/audiences";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PhotoCredits } from "@/components/landing/photo-credits";
import { Privacy } from "@/components/landing/privacy";
import { PublicShell } from "@/components/landing/public-shell";

/** Página inicial: apresenta o Encaixe e leva ao app (`/app`). */
export const LandingPage = () => (
  <PublicShell>
    {/* Sem overflow aqui: ele desligaria o empilhamento (`sticky`) dos cartões de cada ramo. */}
    <main id="conteudo" className="flex-1">
      <Hero />
      <Audiences />
      <HowItWorks />
      <Features />
      <Privacy />
      <Faq />
      <FinalCta />
      <PhotoCredits />
    </main>
  </PublicShell>
);
