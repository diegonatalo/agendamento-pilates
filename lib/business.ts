import type { BusinessType, StudioSettings } from "@/types/pilates";

/**
 * Each business uses the same flow (weekly grid, fixed clients, plans, one-off
 * visits); what changes is the vocabulary and which fields the client record shows.
 * Every client noun is masculine in Portuguese (aluno, cliente, paciente), so
 * the screens can say "Novo …" and "Nenhum …" for all of them.
 */

type Noun = { one: string; many: string; One: string; Many: string };

const noun = (one: string, many: string): Noun => ({
  one,
  many,
  One: one[0].toUpperCase() + one.slice(1),
  Many: many[0].toUpperCase() + many.slice(1),
});

/** A text field of the record; `null` hides it. */
export type RecordField = { label: string; hint?: string } | null;

export type BusinessConfig = {
  type: BusinessType;
  /** Name in the picker and on the landing. */
  label: string;
  /** One line under the name in the picker. */
  description: string;
  client: Noun;
  /** Each visit in the grid: aula, treino, sessão, atendimento. */
  session: Noun;
  /** A one-off visit from someone without a record. */
  oneOff: { label: string; badge: string; nameLabel: string };
  /** The record section that uses the `health` fields; `null` hides it. */
  record: {
    legend: string;
    injuries: RecordField;
    surgeries: RecordField;
    restrictions: RecordField;
    /** Checkbox label for `medicalClearance`. */
    clearance: string | null;
  } | null;
  emergencyContact: RecordField;
  attention: { legend: string; label: string; hint: string };
  goals: RecordField;
  evolution: { legend: string; label: string };
  /** Whether the records hold health data (LGPD sensitive data notice). */
  sensitive: boolean;
  /** Suggested settings when the business is picked on an empty account. */
  defaults: Omit<StudioSettings, "businessType">;
};

const ATTENTION_HINT = "Aparece em destaque na agenda.";

export const BUSINESSES: Record<BusinessType, BusinessConfig> = {
  pilates: {
    type: "pilates",
    label: "Estúdio de pilates",
    description: "Turmas pequenas com horário fixo, reposição e ficha de saúde.",
    client: noun("aluno", "alunos"),
    session: noun("aula", "aulas"),
    oneOff: { label: "Aula experimental", badge: "Experimental", nameLabel: "Nome de quem vai fazer a aula" },
    record: {
      legend: "Saúde",
      injuries: { label: "Lesões e condições" },
      surgeries: { label: "Cirurgias" },
      restrictions: { label: "Restrições de movimento" },
      clearance: "Tem liberação médica",
    },
    emergencyContact: { label: "Contato de emergência" },
    attention: { legend: "Pontos de atenção", label: "Exercícios com desconforto e o que evitar", hint: ATTENTION_HINT },
    goals: { label: "Objetivos" },
    evolution: { legend: "Evolução", label: "Nova nota" },
    sensitive: true,
    defaults: { sessionMinutes: 60, breakMinutes: 0, capacity: 3 },
  },
  personal: {
    type: "personal",
    label: "Personal com academia particular",
    description: "Treinos individuais ou em grupo pequeno, com ficha de saúde.",
    client: noun("aluno", "alunos"),
    session: noun("treino", "treinos"),
    oneOff: { label: "Treino experimental", badge: "Experimental", nameLabel: "Nome de quem vai treinar" },
    record: {
      legend: "Saúde",
      injuries: { label: "Lesões e condições" },
      surgeries: { label: "Cirurgias" },
      restrictions: { label: "Restrições e limitações" },
      clearance: "Tem liberação médica",
    },
    emergencyContact: { label: "Contato de emergência" },
    attention: { legend: "Pontos de atenção", label: "Exercícios com desconforto e o que evitar", hint: ATTENTION_HINT },
    goals: { label: "Objetivos" },
    evolution: { legend: "Evolução", label: "Nova nota" },
    sensitive: true,
    defaults: { sessionMinutes: 60, breakMinutes: 0, capacity: 1 },
  },
  tutor: {
    type: "tutor",
    label: "Professor particular",
    description: "Aulas de idiomas, música ou reforço, com horário fixo toda semana.",
    client: noun("aluno", "alunos"),
    session: noun("aula", "aulas"),
    oneOff: { label: "Aula experimental", badge: "Experimental", nameLabel: "Nome de quem vai fazer a aula" },
    record: null,
    emergencyContact: { label: "Responsável ou contato de emergência" },
    attention: { legend: "Pontos de atenção", label: "Dificuldades e o que reforçar", hint: ATTENTION_HINT },
    goals: { label: "Objetivos (prova, viagem, repertório…)" },
    evolution: { legend: "Evolução", label: "Nova nota" },
    sensitive: false,
    defaults: { sessionMinutes: 60, breakMinutes: 0, capacity: 1 },
  },
  psychology: {
    type: "psychology",
    label: "Psicólogo",
    description: "Sessões semanais com horário fixo e anotações de cada sessão.",
    client: noun("paciente", "pacientes"),
    session: noun("sessão", "sessões"),
    oneOff: { label: "Primeira sessão", badge: "Primeira sessão", nameLabel: "Nome de quem vem" },
    record: {
      legend: "Acompanhamento",
      injuries: { label: "Demanda inicial" },
      surgeries: { label: "Medicação em uso" },
      restrictions: { label: "Acompanhamento médico ou psiquiátrico" },
      clearance: null,
    },
    emergencyContact: { label: "Contato de emergência" },
    attention: { legend: "Pontos de atenção", label: "Cuidados e combinados", hint: ATTENTION_HINT },
    goals: { label: "Objetivos terapêuticos" },
    evolution: { legend: "Anotações", label: "Nova anotação" },
    sensitive: true,
    defaults: { sessionMinutes: 50, breakMinutes: 10, capacity: 1 },
  },
  barber: {
    type: "barber",
    label: "Barbearia",
    description: "Clientes fixos, clube mensal e encaixe de quem vem avulso.",
    client: noun("cliente", "clientes"),
    session: noun("atendimento", "atendimentos"),
    oneOff: { label: "Cliente avulso", badge: "Avulso", nameLabel: "Nome do cliente" },
    record: null,
    emergencyContact: null,
    attention: { legend: "Preferências", label: "Corte, barba e produtos que prefere", hint: ATTENTION_HINT },
    goals: null,
    evolution: { legend: "Histórico", label: "Nova nota" },
    sensitive: false,
    defaults: { sessionMinutes: 30, breakMinutes: 0, capacity: 1 },
  },
};

export const BUSINESS_ORDER: BusinessType[] = ["pilates", "personal", "tutor", "psychology", "barber"];

/** Accounts from before the choice existed were all pilates studios. */
export const businessOf = (settings: Pick<StudioSettings, "businessType">): BusinessConfig =>
  BUSINESSES[settings.businessType ?? "pilates"];

/** "1 aula", "3 sessões". */
export const countOf = (count: number, word: Noun) => `${count} ${count === 1 ? word.one : word.many}`;

/** "0/1 paciente fixo", "2/3 alunos fixos": o substantivo concorda com as vagas. */
export const enrolledOf = (enrolled: number, capacity: number, client: Noun) =>
  `${enrolled}/${capacity} ${capacity === 1 ? `${client.one} fixo` : `${client.many} fixos`}`;

/** "lotada" para aula e sessão, "lotado" para treino e atendimento. */
const FULL: Record<BusinessType, string> = {
  pilates: "lotada",
  personal: "lotado",
  tutor: "lotada",
  psychology: "lotada",
  barber: "lotado",
};

/** Situação de um horário na agenda. Com uma vaga só, é livre ou ocupado. */
export const occupancyText = (occupied: number, capacity: number, business: BusinessConfig) => {
  if (capacity === 1 && occupied <= 1) return occupied === 1 ? "horário ocupado" : "horário livre";
  const vacancies = capacity - occupied;
  const rest =
    vacancies <= 0 ? FULL[business.type] : `${vacancies} ${vacancies === 1 ? "vaga livre" : "vagas livres"}`;
  return `${occupied}/${capacity} ocupadas · ${rest}`;
};

/**
 * Settings after picking a business. The suggested duration and capacity only
 * apply while the grid is empty, so a change never breaks existing slots.
 */
export const pickBusiness = (
  settings: StudioSettings,
  type: BusinessType,
  hasSlots: boolean,
): StudioSettings =>
  hasSlots ? { ...settings, businessType: type } : { ...BUSINESSES[type].defaults, businessType: type };
