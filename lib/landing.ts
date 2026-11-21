/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

export const HERO = {
  kicker: "Para estúdios e professores com turmas fixas",
  title: "A agenda do estúdio, as fichas dos alunos e as mensalidades num lugar só.",
  subtitle:
    "Pilates, yoga, funcional ou aulas particulares: monte a grade de horários, encaixe cada aluno nas turmas fixas, acompanhe a ficha e a evolução de cada um e saiba quem está em dia com o plano.",
  note: "Grátis. Os dados ficam salvos na conta do estúdio, em qualquer aparelho.",
};

export type Step = { title: string; text: string };

export const STEPS: Step[] = [
  {
    title: "Monte a grade",
    text: "Gere os horários da semana de uma vez, com capacidade por turma, e bloqueie feriados e férias.",
  },
  {
    title: "Cadastre os alunos",
    text: "Contato, horários fixos, ficha de saúde, pontos de atenção, objetivos e plano de cada aluno.",
  },
  {
    title: "Acompanhe o dia a dia",
    text: "Veja a agenda da semana, quem vem em cada aula e quem está com a mensalidade em aberto.",
  },
];

export type FeatureIcon = "calendar" | "users" | "health" | "money" | "block" | "devices";

export type Feature = { icon: FeatureIcon; title: string; text: string };

export const FEATURES: Feature[] = [
  {
    icon: "calendar",
    title: "Agenda da semana",
    text: "As aulas de cada dia com os alunos de cada horário, e espaço para encaixar quem vai repor.",
  },
  {
    icon: "users",
    title: "Turmas fixas",
    text: "Cada aluno tem os seus horários fixos, e a grade mostra quais turmas ainda têm vaga e quais lotaram.",
  },
  {
    icon: "health",
    title: "Ficha de saúde",
    text: "Lesões, cirurgias, restrições, liberação médica, contato de emergência e a evolução ao longo do tempo.",
  },
  {
    icon: "money",
    title: "Planos e mensalidades",
    text: "Cadastre os planos do estúdio e marque os pagamentos do mês de cada aluno.",
  },
  {
    icon: "block",
    title: "Feriados e férias",
    text: "Bloqueie dias ou períodos inteiros, e a agenda já mostra o estúdio fechado.",
  },
  {
    icon: "devices",
    title: "Em qualquer aparelho",
    text: "Entre com a mesma conta no computador da recepção e no celular, e tudo aparece igual nos dois.",
  },
];

export type Screenshot = { light: string; dark: string; alt: string };

/** Prints gerados por `e2e/screenshots.spec.ts` com alunos fictícios (nunca à mão). */
export const SCREENSHOT: Screenshot = {
  light: "/landing/agenda-claro.webp",
  dark: "/landing/agenda-escuro.webp",
  alt: "Agenda do estúdio com os horários da semana e os alunos de cada aula (dados fictícios).",
};

export type Faq = { question: string; answer: string };

export const FAQ: Faq[] = [
  { question: "É grátis?", answer: "É. Não tem plano pago nem anúncio: basta criar uma conta com e-mail e senha." },
  {
    question: "Onde ficam os dados dos alunos?",
    answer:
      "Num banco de dados ligado à conta do estúdio, que só abre com o e-mail e a senha.",
  },
  {
    question: "Preciso pedir autorização aos alunos?",
    answer:
      "As fichas têm dados de saúde, que a LGPD trata como sensíveis. Use o modelo de termo de consentimento e revise com um advogado.",
  },
  {
    question: "Dá para usar em mais de um aparelho?",
    answer:
      "Dá. Entre com a mesma conta no computador da recepção e no celular, e tudo aparece igual nos dois.",
  },
];

export type Photo = { src: string; alt: string };

/** Fotos do Unsplash (licença livre), guardadas em `public/landing/`. */
export const PHOTOS = {
  studio: { src: "/landing/estudio.webp", alt: "Estúdio de pilates claro, com aparelhos de madeira e plantas." },
  student: { src: "/landing/aluna.webp", alt: "Aluna alongando sobre um reformer de pilates." },
} satisfies Record<string, Photo>;
