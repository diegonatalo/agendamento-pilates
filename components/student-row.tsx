import { Avatar } from "@/components/avatar";
import {
  BADGE_NEUTRAL,
  BADGE_PRIMARY,
  BADGE_WARN,
  CARD,
  FOCUS_RING,
} from "@/components/form-styles";
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
  paid: "border-primary bg-primary text-primary-fg",
  pending: "border-line-strong bg-surface hover:bg-surface-2",
  overdue: "border-danger bg-danger text-danger-fg",
};

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
    <li className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          CARD,
          "flex min-w-0 flex-1 items-center gap-3 p-3.5 text-left hover:bg-surface-2",
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
              {formatCurrency(fee.amount)} · vence dia {fee.dueDay}
            </span>
          ) : null}
        </span>
      </button>
      {status !== "not-billed" ? (
        <button
          type="button"
          onClick={onTogglePaid}
          className={cn(
            "min-h-11 min-w-24 rounded-xl border px-3 text-sm font-semibold",
            STATUS_TONE[status],
            FOCUS_RING,
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
