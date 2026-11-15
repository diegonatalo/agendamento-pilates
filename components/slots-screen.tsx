"use client";

import { useState, type FormEvent } from "react";
import { BlockedPeriodsSection } from "@/components/blocked-periods-section";
import { SlotGeneratorSection } from "@/components/slot-generator-section";
import { StudioSettingsSection } from "@/components/studio-settings-section";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  INPUT_CLASS,
} from "@/components/form-styles";
import { useStudio } from "@/hooks/use-studio";
import { formatMinutes } from "@/lib/settings";
import { endTime, WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/slots";
import { studentsInSlot } from "@/lib/students";
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
  const [weekday, setWeekday] = useState<Weekday>(1);
  const [startTime, setStartTime] = useState("08:00");
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(addSlot({ weekday, startTime }));
  };

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold">Horários</h1>
          <p className="text-muted">
            Grade semanal fixa. Cada sessão dura{" "}
            {formatMinutes(settings.sessionMinutes)} e comporta até{" "}
            {settings.capacity} alunos.
          </p>
        </header>

        {ready ? (
          <>
            <StudioSettingsSection settings={settings} onSave={saveSettings} />
            <SlotGeneratorSection
              timing={settings}
              existing={slots}
              onCreate={addSlots}
            />
          </>
        ) : null}

        <form
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
              {WEEKDAY_ORDER.map((day) => (
                <option key={day} value={day}>
                  {WEEKDAY_LABELS[day]}
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

        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}

        {!ready ? null : slots.length === 0 ? (
          <EmptyState title="Nenhum horário cadastrado ainda.">
            Adicione o primeiro horário para montar a grade da semana.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-6">
            {WEEKDAY_ORDER.map((day) => {
              const daySlots = slots.filter((slot) => slot.weekday === day);
              if (daySlots.length === 0) return null;
              return (
                <section key={day} aria-labelledby={`day-${day}`}>
                  <h2 id={`day-${day}`} className="mb-3 text-2xl font-semibold">
                    {WEEKDAY_LABELS[day]}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {daySlots.map((slot) => {
                      const enrolled = studentsInSlot(slot.id, students).length;
                      const confirming = confirmingId === slot.id;
                      return (
                        <li
                          key={slot.id}
                          className={`${CARD} flex flex-col gap-3 p-4`}
                        >
                          <div>
                            <p className="font-display text-lg font-semibold">
                              {slot.startTime} às{" "}
                              {endTime(slot.startTime, settings.sessionMinutes)}
                            </p>
                            <p className="text-sm text-muted">
                              {enrolled}/{settings.capacity} alunos fixos
                            </p>
                          </div>
                          {confirming ? (
                            <div className="flex flex-col gap-2">
                              <p className="text-sm">
                                {enrolled > 0
                                  ? `Remover o horário e desvincular ${enrolled} aluno(s)?`
                                  : "Remover este horário?"}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className={BUTTON_DANGER}
                                  onClick={() => {
                                    removeSlot(slot.id);
                                    setConfirmingId(null);
                                  }}
                                >
                                  Confirmar remoção
                                </button>
                                <button
                                  type="button"
                                  className={BUTTON_SECONDARY}
                                  onClick={() => setConfirmingId(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <button
                                type="button"
                                className={BUTTON_SECONDARY}
                                onClick={() => setConfirmingId(slot.id)}
                              >
                                Remover
                                <span className="sr-only">
                                  {" "}
                                  horário de {WEEKDAY_LABELS[day]} às{" "}
                                  {slot.startTime}
                                </span>
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BlockedPeriodsSection />
    </main>
  );
};
