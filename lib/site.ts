/** URL do site. Para outro domínio, defina NEXT_PUBLIC_SITE_URL no build. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "Encaixe";
export const SITE_DESCRIPTION =
  "Agenda, alunos e mensalidades para estúdios e professores com turmas fixas.";

/** Rotas públicas, usadas pelo sitemap. */
/** Rotas públicas, usadas pelo sitemap. As telas do app têm dados dos alunos e ficam fora. */
export const ROUTES = ["/", "/privacidade", "/termos", "/termos/consentimento"];

/**
 * Contato para pedidos sobre dados pessoais (LGPD, art. 18), mostrado em `/privacidade`.
 * TODO: trocar pelo e-mail definitivo; o standard-kit avisa enquanto este for o provisório.
 */
export const PRIVACY_EMAIL = "contato@exemplo.com.br";

/** Repositório público, no rodapé. */
export const SOURCE_URL = "https://github.com/diegonatalo/agendamento-pilates";
