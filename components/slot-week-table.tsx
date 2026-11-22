"use client";

import { useState } from "react";
import { CARD, FOCUS_RING } from "@/components/form-styles";
import { SlotRemove } from "@/components/slot-remove";
import { businessOf, countOf, enrolledOf } from "@/lib/business";
import { cn } from "@/lib/cn";
import {
  endTime,
  occupancyOf,
  startTimesOf,
  WEEKDAY_LABELS,
  weekdaysOf,
} from "@/lib/slots";
import { studentsInSlot } from "@/lib/students";
import type { ClassSlot, Student, StudioSettings } from "@/types/pilates";

type Props = {
  slots: ClassSlot[];
  students: Student[];
  settings: StudioSettings;
  onRemove: (slotId: string) => void;
};

const CELL_TONE = {
  empty: "border-line bg-surface text-muted hover:border-line-strong",
  open: "border-transparent bg-primary-soft text-primary-soft-fg hover:ring-1 hover:ring-primary",
  full: "border-transparent bg-primary text-primary-fg hover:bg-primary-hover",
};

/** A semana inteira: dias nas colunas, horários nas linhas. */
export const SlotWeekTable = ({ slots, students, settings, onRemove }: Props) => {
  const business = businessOf(settings);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const days = weekdaysOf(slots);
  const times = startTimesOf(slots);
  const selected = slots.find((slot) => slot.id === selectedId) ?? null;
  const selectedStudents = selected ? studentsInSlot(selected.id, students) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className={cn(CARD, "overflow-x-auto p-2")}>
        <table className="w-full border-separate border-spacing-1 text-sm">
          <caption className="sr-only">
            Grade da semana: {business.client.many} fixos em cada horário
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-20 text-left text-xs font-medium text-muted">
                <span className="sr-only">Início</span>
              </th>
              {days.map((day) => (
                <th key={day} scope="col" className="pb-1 text-xs font-medium text-muted">
                  <span aria-hidden="true">{WEEKDAY_LABELS[day].slice(0, 3)}</span>
                  <span className="sr-only">{WEEKDAY_LABELS[day]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <th scope="row" className="pr-2 text-left text-xs font-medium tabular-nums text-muted">
                  {time}
                </th>
                {days.map((day) => {
                  const slot = slots.find((s) => s.weekday === day && s.startTime === time);
                  if (!slot) return <td key={day} aria-label="Sem horário" />;
                  const enrolled = studentsInSlot(slot.id, students).length;
                  const isSelected = slot.id === selectedId;
                  return (
                    <td key={day}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${WEEKDAY_LABELS[day]}, ${time}: ${enrolled} de ${countOf(settings.capacity, business.client)}`}
                        onClick={() => setSelectedId(isSelected ? null : slot.id)}
                        className={cn(
                          "flex h-9 w-full items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
                          FOCUS_RING,
                          CELL_TONE[occupancyOf(enrolled, settings.capacity)],
                          isSelected && "ring-2 ring-fg ring-offset-1 ring-offset-surface",
                        )}
                      >
                        {enrolled}/{settings.capacity}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-line bg-surface" /> Sem {business.client.many}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary-soft" /> Com vaga
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary" /> Lotado
        </span>
      </div>

      {selected ? (
        <section
          aria-label="Horário selecionado"
          className={cn(CARD, "flex flex-wrap items-start justify-between gap-4 p-4")}
        >
          <div className="min-w-0">
            <p className="font-semibold tabular-nums">
              {WEEKDAY_LABELS[selected.weekday]}, {selected.startTime} às{" "}
              {endTime(selected.startTime, settings.sessionMinutes)}
            </p>
            <p className="text-sm text-muted">
              {enrolledOf(selectedStudents.length, settings.capacity, business.client)}
              {selectedStudents.length > 0
                ? `: ${selectedStudents.map((s) => s.name).join(", ")}`
                : ""}
            </p>
          </div>
          <SlotRemove
            key={selected.id}
            slot={selected}
            enrolled={selectedStudents.length}
            onRemove={(slotId) => {
              onRemove(slotId);
              setSelectedId(null);
            }}
          />
        </section>
      ) : (
        <p className="text-sm text-muted">
          Clique num horário para ver os {business.client.many} fixos ou removê-lo.
        </p>
      )}
    </div>
  );
};
