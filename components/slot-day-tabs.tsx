"use client";

import { useRef, type KeyboardEvent } from "react";
import { CARD, FOCUS_RING } from "@/components/form-styles";
import { SlotRemove } from "@/components/slot-remove";
import { businessOf } from "@/lib/business";
import { cn } from "@/lib/cn";
import {
  endTime,
  occupancyOf,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
} from "@/lib/slots";
import { studentsInSlot } from "@/lib/students";
import type { ClassSlot, Student, StudioSettings, Weekday } from "@/types/pilates";

type Props = {
  slots: ClassSlot[];
  students: Student[];
  settings: StudioSettings;
  day: Weekday;
  onDayChange: (day: Weekday) => void;
  onRemove: (slotId: string) => void;
};

const OCCUPANCY_TONE = {
  empty: "bg-surface-2 text-muted",
  open: "bg-primary-soft text-primary-soft-fg",
  full: "bg-primary text-primary-fg",
};

/** Um dia por vez: abas de segunda a domingo e a lista de horários do dia. */
export const SlotDayTabs = ({
  slots,
  students,
  settings,
  day,
  onDayChange,
  onRemove,
}: Props) => {
  const business = businessOf(settings);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const daySlots = slots.filter((slot) => slot.weekday === day);

  // Setas, Home e End movem entre as abas, como no padrão de abas do WAI-ARIA.
  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const last = WEEKDAY_ORDER.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % WEEKDAY_ORDER.length
        : event.key === "ArrowLeft"
          ? (index - 1 + WEEKDAY_ORDER.length) % WEEKDAY_ORDER.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onDayChange(WEEKDAY_ORDER[next]);
    tabs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Dias da semana"
        className="grid grid-cols-7 gap-1 rounded-xl bg-surface-2 p-1"
      >
        {WEEKDAY_ORDER.map((weekday, index) => {
          const count = slots.filter((slot) => slot.weekday === weekday).length;
          const selected = weekday === day;
          return (
            <button
              key={weekday}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`slot-tab-${weekday}`}
              aria-selected={selected}
              aria-controls="slot-day-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => onDayChange(weekday)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-medium",
                FOCUS_RING,
                selected
                  ? "bg-surface text-fg shadow-xs ring-1 ring-line"
                  : count > 0
                    ? "text-muted hover:text-fg"
                    : "text-muted/60 hover:text-fg",
              )}
            >
              <span aria-hidden="true">{WEEKDAY_LABELS[weekday].slice(0, 3)}</span>
              <span className="sr-only">{WEEKDAY_LABELS[weekday]}</span>
              <span className="text-[0.7rem] tabular-nums opacity-80">
                {count}
                <span className="sr-only"> {count === 1 ? "horário" : "horários"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="slot-day-panel"
        aria-labelledby={`slot-tab-${day}`}
      >
        {daySlots.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
            Nenhum horário {day === 0 || day === 6 ? "no" : "na"}{" "}
            {WEEKDAY_LABELS[day].toLowerCase()}.
          </p>
        ) : (
          <ul className={cn(CARD, "flex flex-col divide-y divide-line")}>
            {daySlots.map((slot) => {
              const enrolledStudents = studentsInSlot(slot.id, students);
              const enrolled = enrolledStudents.length;
              return (
                <li
                  key={slot.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums",
                        OCCUPANCY_TONE[occupancyOf(enrolled, settings.capacity)],
                      )}
                    >
                      {enrolled}/{settings.capacity}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tabular-nums">
                        {slot.startTime} às {endTime(slot.startTime, settings.sessionMinutes)}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {enrolled}/{settings.capacity} {business.client.many} fixos
                        {enrolled > 0
                          ? ` · ${enrolledStudents.map((s) => s.name).join(", ")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <SlotRemove slot={slot} enrolled={enrolled} onRemove={onRemove} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
