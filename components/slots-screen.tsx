"use client";

import { useState, type FormEvent } from "react";
import { BlockedPeriodsSection } from "@/components/blocked-periods-section";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  INPUT_CLASS,
  LINK_BUTTON,
} from "@/components/form-styles";
import { SlotDayTabs } from "@/components/slot-day-tabs";
import { SlotGeneratorSection } from "@/components/slot-generator-section";
import { SlotWeekTable } from "@/components/slot-week-table";
import { StudioSettingsSection } from "@/components/studio-settings-section";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useStudio } from "@/hooks/use-studio";
import { formatMinutes } from "@/lib/settings";
import { WEEKDAY_LABELS, WEEKDAY_ORDER, weekdaysOf } from "@/lib/slots";
import type { Weekday } from "@/types/pilates";

export const SlotsScreen = () => {
  const {
    ready,
    slots,
    students,
    settings,
    saveSettings,
    addSlot,
    addSlots,
    removeSlot,
  } = useStudio();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [weekday, setWeekday] = useState<Weekday>(1);
  const [startTime, setStartTime] = useState("08:00");
  const [error, setError] = useState<string | null>(null);
  const [singleOpen, setSingleOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState<Weekday | null>(null);
  const [configToggled, setConfigToggled] = useState<boolean | null>(null);
  // Quem chega sem grade monta tudo de uma vez: a configuração fica aberta
  // até sair da tela. Quem já tem grade vê a grade primeiro.
  const [startedEmpty, setStartedEmpty] = useState<boolean | null>(null);
  if (ready && startedEmpty === null) setStartedEmpty(slots.length === 0);

  const hasSlots = slots.length > 0;
  const configOpen = !hasSlots || (configToggled ?? startedEmpty ?? false);
  const day = pickedDay ?? weekdaysOf(slots)[0] ?? 1;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problem = addSlot({ weekday, startTime });
    setError(problem);
    if (!problem) setPickedDay(weekday);
  };

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Horários</h1>
            <p className="text-muted">
              Grade semanal fixa. Cada sessão dura{" "}
              {formatMinutes(settings.sessionMinutes)} e comporta até{" "}
              {settings.capacity} alunos.
            </p>
          </div>
          {ready && hasSlots ? (
            <button
              type="button"
              className={BUTTON_SECONDARY}
              aria-expanded={configOpen}
              aria-controls="slot-config"
              onClick={() => setConfigToggled(!configOpen)}
            >
              {configOpen ? "Fechar configuração" : "Configurar grade"}
            </button>
          ) : null}
        </header>

        {ready && configOpen ? (
          <div id="slot-config" className="flex flex-col gap-6">
            <StudioSettingsSection settings={settings} onSave={saveSettings} />
            <SlotGeneratorSection
              timing={settings}
              existing={slots}
              onCreate={addSlots}
            />

            {/* Exceções fora do expediente, como uma aula às 06:30 só na terça. */}
            <div>
              <button
                type="button"
                className={LINK_BUTTON}
                aria-expanded={singleOpen}
                aria-controls="single-slot"
                onClick={() => {
                  setSingleOpen((open) => !open);
                  setError(null);
                }}
              >
                {singleOpen ? "Fechar horário avulso" : "Adicionar horário avulso"}
              </button>
              <p className="mt-1 text-xs text-muted">
                Para exceções fora do expediente, como uma aula às 06:30 só na
                terça.
              </p>
            </div>

            {singleOpen ? (
              <form
                id="single-slot"
                onSubmit={handleSubmit}
                aria-label="Adicionar um horário avulso"
                className={`${CARD} flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:p-5`}
              >
                <Field label="Dia da semana">
                  <select
                    className={INPUT_CLASS}
                    value={weekday}
                    onChange={(e) => setWeekday(Number(e.target.value) as Weekday)}
                  >
                    {WEEKDAY_ORDER.map((option) => (
                      <option key={option} value={option}>
                        {WEEKDAY_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Início">
                  <input
                    type="time"
                    className={INPUT_CLASS}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Field>
                <button type="submit" className={BUTTON_PRIMARY}>
                  Adicionar horário
                </button>
              </form>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        {!ready ? null : !hasSlots ? (
          <EmptyState title="Nenhum horário cadastrado ainda.">
            Monte a grade pelo expediente acima para criar os horários da semana.
          </EmptyState>
        ) : (
          <section aria-labelledby="grid-title" className="flex flex-col gap-3">
            <h2 id="grid-title" className="text-xl font-semibold">
              Grade da semana
            </h2>
            {isDesktop ? (
              <SlotWeekTable
                slots={slots}
                students={students}
                settings={settings}
                onRemove={removeSlot}
              />
            ) : (
              <SlotDayTabs
                slots={slots}
                students={students}
                settings={settings}
                day={day}
                onDayChange={setPickedDay}
                onRemove={removeSlot}
              />
            )}
          </section>
        )}
      </div>

      <BlockedPeriodsSection />
    </main>
  );
};
