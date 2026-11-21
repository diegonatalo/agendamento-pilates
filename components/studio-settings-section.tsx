"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import { BUTTON_PRIMARY, CARD, INPUT_CLASS } from "@/components/form-styles";
import {
  BREAK_MINUTES_OPTIONS,
  CAPACITY_RANGE,
  SESSION_MINUTES_RANGE,
} from "@/lib/settings";
import { businessOf } from "@/lib/business";
import type { StudioSettings } from "@/types/pilates";

type Props = {
  /** Configurações atuais; o formulário parte delas ao montar. */
  settings: StudioSettings;
  /** Devolve a mensagem de erro, ou `null` quando salvou. */
  onSave: (settings: StudioSettings) => string | null;
};

type Draft = Record<Exclude<keyof StudioSettings, "businessType">, string>;

const toDraft = (settings: StudioSettings): Draft => ({
  sessionMinutes: String(settings.sessionMinutes),
  breakMinutes: String(settings.breakMinutes),
  capacity: String(settings.capacity),
});

/** Campo numérico vazio vira `NaN`, que a validação recusa. */
const toNumber = (value: string) => (value.trim() === "" ? Number.NaN : Number(value));

export const StudioSettingsSection = ({ settings, onSave }: Props) => {
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const business = businessOf(settings);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const change = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problem = onSave({
      businessType: settings.businessType,
      sessionMinutes: toNumber(draft.sessionMinutes),
      breakMinutes: toNumber(draft.breakMinutes),
      capacity: toNumber(draft.capacity),
    });
    setError(problem);
    setSaved(problem === null);
  };

  return (
    <section aria-labelledby="studio-title" className={`${CARD} flex flex-col gap-4 p-4 sm:p-5`}>
      <div>
        <h2 id="studio-title" className="text-lg font-semibold">
          Funcionamento
        </h2>
        <p className="text-sm text-muted">
          Valem para todos os horários, na agenda e nas fichas.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={`Duração de cada ${business.session.one} (min)`}>
            <input
              type="number"
              inputMode="numeric"
              min={SESSION_MINUTES_RANGE.min}
              max={SESSION_MINUTES_RANGE.max}
              step={SESSION_MINUTES_RANGE.step}
              className={INPUT_CLASS}
              value={draft.sessionMinutes}
              onChange={(e) => change("sessionMinutes", e.target.value)}
            />
          </Field>
          <Field label={`Intervalo entre ${business.session.many}`}>
            <select
              className={INPUT_CLASS}
              value={draft.breakMinutes}
              onChange={(e) => change("breakMinutes", e.target.value)}
            >
              {BREAK_MINUTES_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes === 0 ? "Sem intervalo" : `${minutes} min`}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`${business.client.Many} por horário`}>
            <input
              type="number"
              inputMode="numeric"
              min={CAPACITY_RANGE.min}
              max={CAPACITY_RANGE.max}
              className={INPUT_CLASS}
              value={draft.capacity}
              onChange={(e) => change("capacity", e.target.value)}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={BUTTON_PRIMARY}>
            Salvar configurações
          </button>
          {saved ? (
            <p role="status" className="text-sm font-medium text-primary">
              Configurações salvas.
            </p>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
};
