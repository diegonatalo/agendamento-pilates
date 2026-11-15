import { isValidTime } from "@/lib/slots";
import type {
  BlockedPeriod,
  Booking,
  ClassSlot,
  MonthlyPayment,
  Student,
} from "@/types/pilates";

export const BACKUP_APP = "agenda-pilates";
export const BACKUP_VERSION = 1;

export type StudioData = {
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

type Rec = Record<string, unknown>;

const isRec = (value: unknown): value is Rec =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === "string";
const isNullableStr = (value: unknown): boolean =>
  value === null || isStr(value);
const isStrArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every(isStr);
const isOneOf = (value: unknown, options: readonly string[]): boolean =>
  isStr(value) && options.includes(value);

const isSlot = (v: unknown): boolean =>
  isRec(v) &&
  isStr(v.id) &&
  Number.isInteger(v.weekday) &&
  (v.weekday as number) >= 0 &&
  (v.weekday as number) <= 6 &&
  isStr(v.startTime) &&
  isValidTime(v.startTime);

const isStudent = (v: unknown): boolean => {
  if (!isRec(v)) return false;
  const health = v.health;
  const fee = v.monthlyFee;
  return (
    isStr(v.id) &&
    isStr(v.name) &&
    isStr(v.phone) &&
    isNullableStr(v.birthDate) &&
    isStr(v.startedAt) &&
    typeof v.active === "boolean" &&
    isStrArray(v.slotIds) &&
    isRec(health) &&
    isStr(health.injuries) &&
    isStr(health.surgeries) &&
    isStr(health.restrictions) &&
    typeof health.medicalClearance === "boolean" &&
    isStr(health.emergencyContact) &&
    isStr(v.attention) &&
    isStr(v.goals) &&
    Array.isArray(v.evolution) &&
    v.evolution.every(
      (n) => isRec(n) && isStr(n.id) && isStr(n.date) && isStr(n.text),
    ) &&
    (fee === null ||
      (isRec(fee) &&
        typeof fee.amount === "number" &&
        typeof fee.dueDay === "number"))
  );
};

const isBooking = (v: unknown): boolean =>
  isRec(v) &&
  isStr(v.id) &&
  isStr(v.slotId) &&
  isStr(v.date) &&
  isOneOf(v.kind, ["regular", "makeup", "trial"]) &&
  isOneOf(v.status, ["scheduled", "present", "absent", "cancelled"]) &&
  isNullableStr(v.studentId) &&
  isNullableStr(v.guestName);

const isBlocked = (v: unknown): boolean =>
  isRec(v) &&
  isStr(v.id) &&
  isStr(v.startDate) &&
  isStr(v.endDate) &&
  isStr(v.reason);

const isPayment = (v: unknown): boolean =>
  isRec(v) &&
  isStr(v.studentId) &&
  isStr(v.month) &&
  typeof v.paid === "boolean" &&
  isNullableStr(v.paidAt);

const SECTIONS: {
  key: keyof StudioData;
  label: string;
  guard: (value: unknown) => boolean;
}[] = [
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
      error: "Este arquivo não é um backup do Agenda Pilates.",
    };
  if (raw.version !== BACKUP_VERSION)
    return { ok: false, error: "Esta versão de backup não é suportada." };
  if (!isStr(raw.exportedAt))
    return { ok: false, error: "O backup está incompleto ou corrompido." };

  const source = raw.data;
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
  students: data.students.length,
  slots: data.slots.length,
  bookings: data.bookings.length,
  blockedPeriods: data.blockedPeriods.length,
  payments: data.payments.length,
});
