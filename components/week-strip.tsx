import { cn } from "@/lib/cn";
import { addDays, formatDayMonth, startOfWeek, weekdayOf } from "@/lib/dates";
import { WEEKDAY_LABELS } from "@/lib/slots";
import type { DateKey } from "@/types/pilates";

type Props = {
  selected: DateKey;
  today: DateKey;
  /** Quantidade de aulas por data, para o resumo de cada dia. */
  countFor: (date: DateKey) => number;
  onSelect: (date: DateKey) => void;
};

export const WeekStrip = ({ selected, today, countFor, onSelect }: Props) => {
  const start = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <ul className="grid grid-cols-7 gap-1">
      {days.map((date) => {
        const count = countFor(date);
        const label = WEEKDAY_LABELS[weekdayOf(date)];
        const isSelected = date === selected;
        return (
          <li key={date}>
            <button
              type="button"
              aria-pressed={isSelected}
              aria-current={date === today ? "date" : undefined}
              aria-label={`${label}, ${formatDayMonth(date)}, ${count} ${count === 1 ? "aula" : "aulas"}`}
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-h-16 w-full flex-col items-center justify-center rounded-md border text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-400",
                isSelected
                  ? "border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
                date === today && !isSelected && "border-teal-700 dark:border-teal-400",
              )}
            >
              <span aria-hidden="true">{label.slice(0, 3)}</span>
              <span aria-hidden="true" className="text-base font-semibold">
                {date.slice(8)}
              </span>
              <span aria-hidden="true" className={count === 0 ? "opacity-40" : ""}>
                {count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
