import { Avatar } from "@/components/avatar";
import {
  BADGE_NEUTRAL,
  BADGE_PRIMARY,
  BADGE_WARN,
  FOCUS_RING,
} from "@/components/form-styles";
import { cn } from "@/lib/cn";
import { formatCurrency, type PaymentStatus } from "@/lib/payments";
import { feeAmount, findPlan } from "@/lib/plans";
import { formatSlotShort } from "@/lib/slots";
import type { ClassSlot, Plan, Student } from "@/types/pilates";

type Props = {
  student: Student;
  slots: ClassSlot[];
  plans: Plan[];
  credits: number;
  status: PaymentStatus;
  onOpen: () => void;
  onTogglePaid: () => void;
};

const STATUS_LABEL = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };

/** Pílula de status; o botão em volta mantém a área de toque de 44px. */
const STATUS_TONE = {
  paid: "bg-primary-soft text-primary-soft-fg",
  pending: "bg-surface-2 text-muted group-hover:text-fg",
  overdue: "bg-danger-soft text-danger-soft-fg",
};

const STATUS_DOT = {
  paid: "bg-primary",
  pending: "bg-line-strong",
  overdue: "bg-danger",
};

export const StudentRow = ({
  student,
  slots,
  plans,
  credits,
  status,
  onOpen,
  onTogglePaid,
}: Props) => {
  const studentSlots = slots.filter((slot) => student.slotIds.includes(slot.id));
  const fee = student.monthlyFee;

  return (
    <li className="flex items-center gap-2 pr-2">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 rounded-lg p-3 text-left hover:bg-surface-2",
          FOCUS_RING,
        )}
      >
        <Avatar name={student.name} />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="break-words font-semibold">{student.name}</span>
            {!student.active ? <span className={BADGE_NEUTRAL}>Inativo</span> : null}
            {credits > 0 ? (
              <span className={BADGE_PRIMARY}>
                {credits} {credits === 1 ? "reposição" : "reposições"}
              </span>
            ) : null}
            {student.attention.trim() ? (
              <span className={BADGE_WARN}>Atenção</span>
            ) : null}
          </span>
          <span className="text-sm text-muted">
            {studentSlots.length > 0
              ? studentSlots.map(formatSlotShort).join(" · ")
              : "Sem horário fixo"}
          </span>
          {fee ? (
            <span className="text-sm text-muted">
              {[
                findPlan(fee.planId, plans)?.name ?? "Valor combinado",
                formatCurrency(feeAmount(fee, plans) ?? 0),
                `vence dia ${fee.dueDay}`,
              ].join(" · ")}
            </span>
          ) : null}
        </span>
      </button>
      {status !== "not-billed" ? (
        <button
          type="button"
          onClick={onTogglePaid}
          className={cn(
            "group inline-flex min-h-11 items-center rounded-full",
            FOCUS_RING,
          )}
        >
          <span
            className={cn(
              "inline-flex min-w-24 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              STATUS_TONE[status],
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", STATUS_DOT[status])}
            />
            {STATUS_LABEL[status]}
          </span>{" "}
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
