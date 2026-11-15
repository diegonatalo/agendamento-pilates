import { cn } from "@/lib/cn";
import { formatCurrency, type PaymentStatus } from "@/lib/payments";
import { formatSlotShort } from "@/lib/slots";
import type { ClassSlot, Student } from "@/types/pilates";

type Props = {
  student: Student;
  slots: ClassSlot[];
  credits: number;
  status: PaymentStatus;
  onOpen: () => void;
  onTogglePaid: () => void;
};

const STATUS_LABEL = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };

const STATUS_TONE = {
  paid: "border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950",
  pending: "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
  overdue: "border-red-700 bg-red-700 text-white dark:border-red-500 dark:bg-red-500 dark:text-zinc-950",
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-400";

export const StudentRow = ({
  student,
  slots,
  credits,
  status,
  onOpen,
  onTogglePaid,
}: Props) => {
  const studentSlots = slots.filter((slot) => student.slotIds.includes(slot.id));
  const fee = student.monthlyFee;

  return (
    <li className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-zinc-200 p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
          FOCUS,
        )}
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{student.name}</span>
          {!student.active ? (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              Inativo
            </span>
          ) : null}
          {credits > 0 ? (
            <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs text-teal-950">
              {credits} {credits === 1 ? "reposição" : "reposições"}
            </span>
          ) : null}
          {student.attention.trim() ? (
            <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs text-amber-950">
              Atenção
            </span>
          ) : null}
        </span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {studentSlots.length > 0
            ? studentSlots.map(formatSlotShort).join(" · ")
            : "Sem horário fixo"}
        </span>
        {fee ? (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatCurrency(fee.amount)} · vence dia {fee.dueDay}
          </span>
        ) : null}
      </button>
      {status !== "not-billed" ? (
        <button
          type="button"
          onClick={onTogglePaid}
          className={cn(
            "min-h-11 min-w-24 rounded-lg border px-3 text-sm font-medium",
            STATUS_TONE[status],
            FOCUS,
          )}
        >
          {STATUS_LABEL[status]}{" "}
          <span className="sr-only">
            {status === "paid"
              ? `— desfazer pagamento de ${student.name}`
              : `— marcar mensalidade de ${student.name} como paga`}
          </span>
        </button>
      ) : null}
    </li>
  );
};
