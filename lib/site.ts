/** URL do site. Para outro domínio, defina NEXT_PUBLIC_SITE_URL no build. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "Agenda Pilates";
export const SITE_DESCRIPTION =
  "Agendamento e controle de alunos para estúdio de pilates.";

/** Rotas públicas, usadas pelo sitemap. */
export const ROUTES = ["/"];
