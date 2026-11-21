import {
  isBlocked,
  isBooking,
  isPayment,
  isPlan,
  isRec,
  isSettings,
  isSlot,
  isStudent,
} from "@/lib/studio-validation";
import type {
  BlockedPeriod,
  Booking,
  ClassSlot,
  MonthlyPayment,
  Plan,
  Student,
  StudioSettings,
} from "@/types/pilates";

/** Identificador gravado no arquivo. Fica com o nome antigo para os backups já baixados continuarem abrindo. */
export const BACKUP_APP = "agenda-pilates";
export const BACKUP_VERSION = 3;

export type StudioData = {
  settings: StudioSettings;
  plans: Plan[];
  slots: ClassSlot[];
  students: Student[];
  bookings: Booking[];
  blockedPeriods: BlockedPeriod[];
  payments: MonthlyPayment[];
};

export type BackupFile = {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: StudioData;
};

export type ParseResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; error: string };

export const buildBackup = (
  data: StudioData,
  exportedAt: string,
): BackupFile => ({
  app: BACKUP_APP,
  version: BACKUP_VERSION,
  exportedAt,
  data,
});

const SECTIONS: {
  key: Exclude<keyof StudioData, "settings">;
  label: string;
  guard: (value: unknown) => boolean;
}[] = [
  { key: "plans", label: "planos", guard: isPlan },
  { key: "slots", label: "horários", guard: isSlot },
  { key: "students", label: "alunos", guard: isStudent },
  { key: "bookings", label: "presenças", guard: isBooking },
  { key: "blockedPeriods", label: "datas bloqueadas", guard: isBlocked },
  { key: "payments", label: "pagamentos", guard: isPayment },
];

/** Lê e valida o texto de um arquivo de backup. */
export const parseBackup = (text: string): ParseResult => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido." };
  }
  if (!isRec(raw) || raw.app !== BACKUP_APP || !isRec(raw.data))
    return {
      ok: false,
      error: "Este arquivo não é um backup do Encaixe.",
    };
  if (raw.version !== BACKUP_VERSION)
    return { ok: false, error: "Esta versão de backup não é suportada." };
  if (typeof raw.exportedAt !== "string")
    return { ok: false, error: "O backup está incompleto ou corrompido." };

  const source = raw.data;
  if (!isSettings(source.settings))
    return {
      ok: false,
      error: "O backup está incompleto ou corrompido (seção de configurações).",
    };
  for (const { key, label, guard } of SECTIONS) {
    const list = source[key];
    if (!Array.isArray(list) || !list.every(guard))
      return {
        ok: false,
        error: `O backup está incompleto ou corrompido (seção de ${label}).`,
      };
  }

  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: raw.exportedAt,
      data: source as unknown as StudioData,
    },
  };
};

export const countBackup = (data: StudioData) => ({
  plans: data.plans.length,
  students: data.students.length,
  slots: data.slots.length,
  bookings: data.bookings.length,
  blockedPeriods: data.blockedPeriods.length,
  payments: data.payments.length,
});
