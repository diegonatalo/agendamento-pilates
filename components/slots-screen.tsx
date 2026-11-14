"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  INPUT_CLASS,
} from "@/components/form-styles";
import { useStudio } from "@/hooks/use-studio";
import { CLASS_CAPACITY } from "@/lib/constants";
import { endTime, WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/slots";
import { studentsInSlot } from "@/lib/students";
import type { Weekday } from "@/types/pilates";

export const SlotsScreen = () => {
  const { ready, slots, students, addSlot, removeSlot } = useStudio();
  const [weekday, setWeekday] = useState<Weekday>(1);
  const [startTime, setStartTime] = useState("08:00");
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(addSlot({ weekday, startTime }));
  };

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Horários</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Grade semanal fixa. Cada horário dura 1h e comporta até{" "}
          {CLASS_CAPACITY} alunos.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-end dark:border-zinc-800"
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
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!ready ? null : slots.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum horário cadastrado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {WEEKDAY_ORDER.map((day) => {
            const daySlots = slots.filter((slot) => slot.weekday === day);
            if (daySlots.length === 0) return null;
            return (
              <section key={day} aria-labelledby={`day-${day}`}>
                <h2 id={`day-${day}`} className="mb-2 text-lg font-semibold">
                  {WEEKDAY_LABELS[day]}
                </h2>
                <ul className="flex flex-col gap-2">
                  {daySlots.map((slot) => {
                    const enrolled = studentsInSlot(slot.id, students).length;
                    const confirming = confirmingId === slot.id;
                    return (
                      <li
                        key={slot.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                      >
                        <div>
                          <p className="font-medium">
                            {slot.startTime} às {endTime(slot.startTime)}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {enrolled}/{CLASS_CAPACITY} alunos fixos
                          </p>
                        </div>
                        {confirming ? (
                          <div className="flex flex-col gap-2 sm:items-end">
                            <p className="text-sm">
                              {enrolled > 0
                                ? `Remover o horário e desvincular ${enrolled} aluno(s)?`
                                : "Remover este horário?"}
                            </p>
                            <div className="flex gap-2">
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
                          <button
                            type="button"
                            className={BUTTON_SECONDARY}
                            onClick={() => setConfirmingId(slot.id)}
                          >
                            Remover
                            <span className="sr-only">
                              {" "}
                              horário de {WEEKDAY_LABELS[day]} às {slot.startTime}
                            </span>
                          </button>
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
    </main>
  );
};
