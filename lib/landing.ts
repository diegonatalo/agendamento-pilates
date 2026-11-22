/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

import type { PhotoKey } from "@/lib/landing-photos";
import type { BusinessType } from "@/types/pilates";

export const HERO = {
  kicker: "Para quem atende com hora marcada",
  subtitle:
    "Do pilates à barbearia, da aula de violão à terapia: a agenda da semana, a ficha de cada pessoa e as mensalidades num lugar só.",
  note: "Grátis. Os dados ficam salvos na sua conta, em qualquer aparelho.",
};

export type Audience = { type: BusinessType; text: string; photos: PhotoKey[] };

/**
 * Um cartão por ramo, na ordem de `BUSINESS_ORDER`. O nome vem de `lib/business.ts`;
 * o texto diz como o app se adapta, sem prometer o que ele ainda não faz.
 */
export const AUDIENCES: Audience[] = [
  {
    type: "pilates",
    photos: ["pilates"],
    text: "Turmas pequenas com vagas por horário, reposição de aula, aula experimental e ficha de saúde de cada aluno.",
  },
  {
    type: "personal",
    photos: ["personal"],
    text: "Treinos individuais ou em dupla, horário fixo na semana, ficha de saúde e evolução de cada aluno.",
  },
  {
    type: "tutor",
    photos: ["languages", "music"],
    text: "Aulas de idiomas, música ou reforço, com o contato do responsável, as dificuldades e os objetivos de cada aluno.",
  },
  {
    type: "psychology",
    photos: ["psychology"],
    text: "Sessões com horário fixo e intervalo entre elas, demanda inicial e anotações com data na ficha de cada paciente.",
  },
  {
    type: "barber",
    photos: ["barber"],
    text: "Clientes fixos da semana, clube mensal, encaixe de quem vem avulso e as preferências de corte de cada um.",
  },
];

export type Step = { title: string; text: string };

export const STEPS: Step[] = [
  {
    title: "Escolha o seu ramo",
    text: "O app passa a falar em alunos, pacientes ou clientes, e a ficha mostra só o que faz sentido para você.",
  },
  {
    title: "Monte a grade",
    text: "Gere os horários da semana de uma vez, com duração e vagas por horário, e bloqueie feriados e férias.",
  },
  {
    title: "Acompanhe o dia a dia",
    text: "Veja quem vem em cada horário, marque a presença e saiba quem está com a mensalidade em aberto.",
  },
];

export type FeatureIcon = "calendar" | "users" | "health" | "money" | "block" | "devices";

export type Feature = { icon: FeatureIcon; title: string; text: string };

export const FEATURES: Feature[] = [
  {
    icon: "calendar",
    title: "Agenda da semana",
    text: "Os horários de cada dia com quem vem em cada um, e espaço para encaixar uma reposição ou alguém avulso.",
  },
  {
    icon: "users",
    title: "Horário fixo",
    text: "Cada cliente tem os seus horários na semana, e a grade mostra o que ainda tem vaga e o que lotou.",
  },
  {
    icon: "health",
    title: "Ficha do seu jeito",
    text: "Saúde para o pilates e o personal, acompanhamento para o psicólogo, preferências para a barbearia.",
  },
  {
    icon: "money",
    title: "Planos e mensalidades",
    text: "Cadastre os seus planos mensais e marque o pagamento do mês de cada cliente.",
  },
  {
    icon: "block",
    title: "Feriados e férias",
    text: "Bloqueie dias ou períodos inteiros, e a agenda já mostra o dia fechado.",
  },
  {
    icon: "devices",
    title: "Em qualquer aparelho",
    text: "Entre com a mesma conta no computador e no celular, e tudo aparece igual nos dois.",
  },
];

export type Screenshot = { light: string; dark: string; alt: string };

/** Prints gerados por `e2e/screenshots.spec.ts` com alunos fictícios (nunca à mão). */
export const SCREENSHOT: Screenshot = {
  light: "/landing/agenda-claro.webp",
  dark: "/landing/agenda-escuro.webp",
  alt: "Agenda com os horários da semana e quem vem em cada um (dados fictícios de um estúdio de pilates).",
};

export type Faq = { question: string; answer: string };

export const FAQ: Faq[] = [
  { question: "É grátis?", answer: "É. Não tem plano pago nem anúncio: basta criar uma conta com e-mail e senha." },
  {
    question: "Serve para o meu negócio?",
    answer:
      "Serve para quem atende em horário marcado, com clientes que voltam toda semana. O cliente ainda não marca sozinho por um link: quem agenda é você.",
  },
  {
    question: "Onde ficam os dados dos clientes?",
    answer:
      "Num banco de dados em São Paulo, ligado à sua conta e processado por um servidor nos Estados Unidos. No app, cada conta vê só os próprios dados. Quem mantém o Encaixe administra o banco e tecnicamente consegue ler o que está nele.",
  },
  {
    question: "Preciso pedir autorização aos clientes?",
    answer:
      "Se a ficha tem dados de saúde, sim: a LGPD trata esses dados como sensíveis. Use o modelo de termo de consentimento e revise com um advogado.",
  },
  {
    question: "Dá para trocar de ramo depois?",
    answer: "Dá, na aba Conta. Os nomes e a ficha mudam, e nada do que já foi cadastrado é apagado.",
  },
];
