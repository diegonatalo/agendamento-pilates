"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import { BUTTON_PRIMARY, CARD, FOCUS_RING, INPUT_CLASS } from "@/components/form-styles";
import { cn } from "@/lib/cn";
import {
  generateGrid,
  startTimesFor,
  validateWorkHours,
  type SlotCandidate,
  type WorkHours,
} from "@/lib/slot-generator";
import { WEEKDAY_LABELS, WEEKDAY_ORDER, type SlotTiming } from "@/lib/slots";
import type { ClassSlot, Weekday } from "@/types/pilates";

type Props = {
  timing: SlotTiming;
  existing: ClassSlot[];
  /** Cria os horários e devolve quantos foram criados. */
  onCreate: (candidates: SlotCandidate[]) => number;
};

const PAUSE_DEFAULT = { start: "12:00", end: "14:00" };

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const SlotGeneratorSection = ({ timing, existing, onCreate }: Props) => {
  const [weekdays, setWeekdays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("20:00");
  const [hasPause, setHasPause] = useState(false);
  const [pause, setPause] = useState(PAUSE_DEFAULT);
  const [message, setMessage] = useState<string | null>(null);

  const hours: WorkHours = { weekdays, start, end, pause: hasPause ? pause : null };
  const problem = validateWorkHours(hours);
  const grid = problem ? null : generateGrid(hours, timing, existing);
  const times = problem ? [] : startTimesFor(hours, timing);
  const count = grid?.toCreate.length ?? 0;

  const toggleDay = (day: Weekday) => {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    );
    setMessage(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!grid || count === 0) return;
    const created = onCreate(grid.toCreate);
    setMessage(`${plural(created, "horário criado", "horários criados")}.`);
  };

  return (
    <section aria-labelledby="generator-title" className={`${CARD} flex flex-col gap-4 p-4 sm:p-5`}>
      <div>
        <h2 id="generator-title" className="text-lg font-semibold">
          Montar grade pelo expediente
        </h2>
        <p className="text-sm text-muted">
          Informe os dias e o horário de funcionamento; o app cria os horários.
          Horários já cadastrados são mantidos.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium">Dias de atendimento</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_ORDER.map((day) => {
              const on = weekdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "min-h-11 min-w-14 rounded-lg border px-3 text-sm font-medium",
                    FOCUS_RING,
                    on
                      ? "border-fg bg-fg text-bg"
                      : "border-line bg-surface text-muted hover:text-fg",
                  )}
                >
                  <span aria-hidden="true">{WEEKDAY_LABELS[day].slice(0, 3)}</span>
                  <span className="sr-only">{WEEKDAY_LABELS[day]}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
          <Field label="Abre às">
            <input
              type="time"
              className={INPUT_CLASS}
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setMessage(null);
              }}
            />
          </Field>
          <Field label="Fecha às">
            <input
              type="time"
              className={INPUT_CLASS}
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setMessage(null);
              }}
            />
          </Field>
        </div>

        <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-5 accent-primary"
            checked={hasPause}
            onChange={(e) => {
              setHasPause(e.target.checked);
              setMessage(null);
            }}
          />
          Pausa (almoço)
        </label>
        {hasPause ? (
          <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
            <Field label="Pausa das">
              <input
                type="time"
                className={INPUT_CLASS}
                value={pause.start}
                onChange={(e) => setPause({ ...pause, start: e.target.value })}
              />
            </Field>
            <Field label="Até">
              <input
                type="time"
                className={INPUT_CLASS}
                value={pause.end}
                onChange={(e) => setPause({ ...pause, end: e.target.value })}
              />
            </Field>
          </div>
        ) : null}

        <div aria-live="polite" className="rounded-lg bg-surface-2 px-3.5 py-3 text-sm">
          {problem ? (
            <p className="text-danger">{problem}</p>
          ) : times.length === 0 ? (
            <p>Nenhum horário cabe nesse expediente.</p>
          ) : (
            <>
              <p>
                <strong>{plural(times.length, "horário", "horários")} por dia:</strong>{" "}
                {times.join(", ")}.
              </p>
              <p className="mt-1 text-muted">
                {count > 0
                  ? `Serão criados ${plural(count, "horário", "horários")}.`
                  : "Todos esses horários já existem."}
                {count > 0 && grid && grid.skipped.length > 0
                  ? ` ${plural(grid.skipped.length, "horário cai", "horários caem")} sobre horários já cadastrados e não ${grid.skipped.length === 1 ? "será criado" : "serão criados"}.`
                  : ""}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={BUTTON_PRIMARY} disabled={count === 0}>
            {count > 0 ? `Criar ${plural(count, "horário", "horários")}` : "Criar horários"}
          </button>
          {message ? (
            <p role="status" className="text-sm font-medium text-primary">
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
};
