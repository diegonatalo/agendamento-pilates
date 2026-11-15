import { BUTTON_SECONDARY } from "@/components/form-styles";
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
}: Props) => (
  <section
    aria-labelledby="payments-title"
    className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
  >
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="payments-title" className="text-lg font-semibold capitalize">
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nenhum aluno com mensalidade neste mês.
      </p>
    ) : (
      <p className="text-sm">
        {summary.paid} de {summary.billed} pagas ·{" "}
        {formatCurrency(summary.received)} de {formatCurrency(summary.expected)}
        {summary.overdue > 0 ? (
          <strong className="text-red-700 dark:text-red-400">
            {" "}
            · {summary.overdue} em atraso
          </strong>
        ) : null}
      </p>
    )}

    <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
      <input
        type="checkbox"
        className="size-5 accent-teal-700"
        checked={onlyUnpaid}
        onChange={(e) => onOnlyUnpaidChange(e.target.checked)}
      />
      Mostrar só pendentes
    </label>
  </section>
);
