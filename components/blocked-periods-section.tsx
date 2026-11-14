"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  INPUT_CLASS,
} from "@/components/form-styles";
import { useStudio } from "@/hooks/use-studio";
import { formatDateBr } from "@/lib/dates";

export const BlockedPeriodsSection = () => {
  const { ready, blockedPeriods, addBlockedPeriod, removeBlockedPeriod } =
    useStudio();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problem = addBlockedPeriod(startDate, endDate || startDate, reason);
    setError(problem);
    if (!problem) {
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  };

  return (
    <section aria-labelledby="blocked-title" className="flex flex-col gap-4">
      <div>
        <h2 id="blocked-title" className="text-lg font-semibold">
          Datas bloqueadas
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Feriados e férias. As aulas desses dias não acontecem e não geram
          crédito de reposição.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="De">
            <input
              type="date"
              className={INPUT_CLASS}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="Até" hint="Deixe vazio para bloquear só um dia.">
            <input
              type="date"
              className={INPUT_CLASS}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Motivo">
          <input
            className={INPUT_CLASS}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Feriado, férias..."
          />
        </Field>
        <div>
          <button type="submit" className={BUTTON_PRIMARY}>
            Bloquear datas
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!ready ? null : blockedPeriods.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhuma data bloqueada.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blockedPeriods.map((period) => (
            <li
              key={period.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium">
                  {period.startDate === period.endDate
                    ? formatDateBr(period.startDate)
                    : `${formatDateBr(period.startDate)} a ${formatDateBr(period.endDate)}`}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {period.reason}
                </p>
              </div>
              <button
                type="button"
                className={BUTTON_SECONDARY}
                onClick={() => removeBlockedPeriod(period.id)}
              >
                Remover
                <span className="sr-only"> bloqueio de {period.reason}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
