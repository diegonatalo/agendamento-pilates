"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  INPUT_CLASS,
} from "@/components/form-styles";
import { useBusiness, useStudio } from "@/hooks/use-studio";
import { formatDateBr } from "@/lib/dates";

export const BlockedPeriodsSection = () => {
  const { ready, blockedPeriods, addBlockedPeriod, removeBlockedPeriod } =
    useStudio();
  const business = useBusiness();
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
        <h2 id="blocked-title" className="text-2xl font-semibold">
          Datas bloqueadas
        </h2>
        <p className="text-muted">
          Feriados e férias. Os {business.session.many} desses dias não acontecem e não geram
          crédito de reposição.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`${CARD} flex flex-col gap-4 p-4 sm:p-5`}
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
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {!ready ? null : blockedPeriods.length === 0 ? (
        <p className="text-muted">Nenhuma data bloqueada.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {blockedPeriods.map((period) => (
            <li
              key={period.id}
              className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-4`}
            >
              <div>
                <p className="font-semibold">
                  {period.startDate === period.endDate
                    ? formatDateBr(period.startDate)
                    : `${formatDateBr(period.startDate)} a ${formatDateBr(period.endDate)}`}
                </p>
                <p className="text-sm text-muted">{period.reason}</p>
              </div>
              <button
                type="button"
                className={BUTTON_SECONDARY}
                onClick={() => removeBlockedPeriod(period.id)}
              >
                Remover{" "}
                <span className="sr-only">bloqueio de {period.reason}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
