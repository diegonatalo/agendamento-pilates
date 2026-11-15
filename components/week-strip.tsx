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
    <ul className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((date) => {
        const count = countFor(date);
        const label = WEEKDAY_LABELS[weekdayOf(date)];
        const isSelected = date === selected;
        const isToday = date === today;
        return (
          <li key={date}>
            <button
              type="button"
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${label}, ${formatDayMonth(date)}, ${count} ${count === 1 ? "aula" : "aulas"}`}
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl border text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isSelected
                  ? "border-fg bg-fg text-bg"
                  : "border-line bg-surface hover:border-line-strong",
                isToday && !isSelected && "border-primary",
              )}
            >
              <span aria-hidden="true" className="font-medium uppercase tracking-wide opacity-80">
                {label.slice(0, 3)}
              </span>
              <span aria-hidden="true" className="font-display text-lg font-semibold leading-none">
                {date.slice(8)}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 size-1.5 rounded-full",
                  count === 0
                    ? "bg-transparent"
                    : isSelected
                      ? "bg-accent"
                      : "bg-primary",
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
