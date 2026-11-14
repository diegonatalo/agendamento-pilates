/** Data no formato `YYYY-MM-DD`. */
export type DateKey = string;
/** Hora no formato `HH:mm`. */
export type TimeOfDay = string;
/** Mês no formato `YYYY-MM`. */
export type MonthKey = string;
/** 0 = domingo ... 6 = sábado, igual a `Date#getDay`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Horário fixo da grade semanal. A duração e a capacidade vêm de `lib/constants.ts`. */
export type ClassSlot = {
  id: string;
  weekday: Weekday;
  startTime: TimeOfDay;
};

export type EvolutionNote = {
  id: string;
  date: DateKey;
  text: string;
};

export type Student = {
  id: string;
  name: string;
  phone: string;
  birthDate: DateKey | null;
  startedAt: DateKey;
  active: boolean;
  /** Horários fixos semanais do aluno. */
  slotIds: string[];
  health: {
    injuries: string;
    surgeries: string;
    restrictions: string;
    medicalClearance: boolean;
    emergencyContact: string;
  };
  /** Exercícios com desconforto e o que evitar; aparece em destaque na sessão. */
  attention: string;
  goals: string;
  evolution: EvolutionNote[];
  monthlyFee: { amount: number; dueDay: number } | null;
};

export type BookingKind = "regular" | "makeup" | "trial";
export type BookingStatus = "scheduled" | "present" | "absent" | "cancelled";

/** Presença de um aluno em uma sessão (turma em uma data). */
export type Booking = {
  id: string;
  slotId: string;
  date: DateKey;
  kind: BookingKind;
  status: BookingStatus;
  /** Preenchido quando `kind` é `regular` ou `makeup`. */
  studentId: string | null;
  /** Nome de quem faz aula experimental, sem cadastro. */
  guestName: string | null;
};

/** Período sem aula (feriado, férias). Não gera crédito de reposição. */
export type BlockedPeriod = {
  id: string;
  startDate: DateKey;
  endDate: DateKey;
  reason: string;
};

export type MonthlyPayment = {
  studentId: string;
  month: MonthKey;
  paid: boolean;
  paidAt: DateKey | null;
};
