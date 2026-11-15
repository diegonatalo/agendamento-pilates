import { BUTTON_SECONDARY, CARD } from "@/components/form-styles";
import {
  addMonths,
  formatCurrency,
  formatMonth,
  type MonthSummary,
} from "@/lib/payments";
import type { MonthKey } from "@/types/pilates";

type Props = {
  month: MonthKey;
  summary: MonthSummary;
  onlyUnpaid: boolean;
  onMonthChange: (month: MonthKey) => void;
  onOnlyUnpaidChange: (value: boolean) => void;
};

export const PaymentToolbar = ({
  month,
  summary,
  onlyUnpaid,
  onMonthChange,
  onOnlyUnpaidChange,
}: Props) => {
  const percent =
    summary.billed === 0 ? 0 : Math.round((summary.paid / summary.billed) * 100);

  return (
    <section
      aria-labelledby="payments-title"
      className={`${CARD} flex flex-col gap-4 p-4 sm:p-5`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="payments-title" className="text-xl font-semibold first-letter:uppercase">
          Mensalidades de {formatMonth(month)}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={BUTTON_SECONDARY}
            onClick={() => onMonthChange(addMonths(month, -1))}
          >
            Mês anterior
          </button>
          <button
            type="button"
            className={BUTTON_SECONDARY}
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            Próximo mês
          </button>
        </div>
      </div>

      {summary.billed === 0 ? (
        <p className="text-sm text-muted">
          Nenhum aluno com mensalidade neste mês.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm">
            {summary.paid} de {summary.billed} pagas ·{" "}
            {formatCurrency(summary.received)} de{" "}
            {formatCurrency(summary.expected)}
            {summary.overdue > 0 ? (
              <strong className="text-danger">
                {" "}
                · {summary.overdue} em atraso
              </strong>
            ) : null}
          </p>
        </div>
      )}

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          className="size-5 accent-primary"
          checked={onlyUnpaid}
          onChange={(e) => onOnlyUnpaidChange(e.target.checked)}
        />
        Mostrar só pendentes
      </label>
    </section>
  );
};
