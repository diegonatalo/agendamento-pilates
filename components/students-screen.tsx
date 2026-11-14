"use client";

import { useState } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_PRIMARY,
  INPUT_CLASS,
} from "@/components/form-styles";
import { StudentForm } from "@/components/student-form";
import { useStudio } from "@/hooks/use-studio";
import { toDateKey } from "@/lib/dates";
import { newId } from "@/lib/ids";
import { formatSlotShort } from "@/lib/slots";
import { createEmptyStudent } from "@/lib/students";
import type { Student } from "@/types/pilates";

export const StudentsScreen = () => {
  const { ready, slots, students, saveStudent, removeStudent } = useStudio();
  const [creating, setCreating] = useState<Student | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const current =
    creating ?? students.find((student) => student.id === selectedId) ?? null;

  const close = () => {
    setCreating(null);
    setSelectedId(null);
  };

  const startCreating = () =>
    setCreating(createEmptyStudent(newId(), toDateKey(new Date())));

  const visible = students.filter((student) =>
    student.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (current) {
    return (
      <main>
        <StudentForm
          key={current.id}
          initial={current}
          isNew={creating !== null}
          slots={slots}
          students={students}
          onSave={(student) => {
            saveStudent(student);
            close();
          }}
          onCancel={close}
          onDelete={(studentId) => {
            removeStudent(studentId);
            close();
          }}
        />
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alunos</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Fichas e horários fixos.
          </p>
        </div>
        <button type="button" className={BUTTON_PRIMARY} onClick={startCreating}>
          Novo aluno
        </button>
      </header>

      {students.length > 0 ? (
        <Field label="Buscar por nome">
          <input
            type="search"
            className={INPUT_CLASS}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>
      ) : null}

      {!ready ? null : students.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum aluno cadastrado ainda.
        </p>
      ) : visible.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum aluno encontrado.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((student) => {
            const studentSlots = slots.filter((slot) =>
              student.slotIds.includes(slot.id),
            );
            return (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(student.id)}
                  className="flex w-full flex-col gap-1 rounded-lg border border-zinc-200 p-3 text-left hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus-visible:outline-teal-400"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{student.name}</span>
                    {!student.active ? (
                      <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                        Inativo
                      </span>
                    ) : null}
                    {student.attention.trim() ? (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs text-amber-950">
                        Atenção
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {studentSlots.length > 0
                      ? studentSlots.map(formatSlotShort).join(" · ")
                      : "Sem horário fixo"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};
