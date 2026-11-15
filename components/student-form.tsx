"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  INPUT_CLASS,
  LINK_BUTTON,
} from "@/components/form-styles";
import { CLASS_CAPACITY } from "@/lib/constants";
import { toDateKey } from "@/lib/dates";
import { newId } from "@/lib/ids";
import { formatSlot } from "@/lib/slots";
import {
  studentsInSlot,
  validateStudent,
  whatsappLink,
} from "@/lib/students";
import type { ClassSlot, Student } from "@/types/pilates";

type Props = {
  initial: Student;
  isNew: boolean;
  slots: ClassSlot[];
  /** Todos os alunos cadastrados, para calcular as vagas dos horários. */
  students: Student[];
  /** Saldo de reposições do aluno. */
  credits: number;
  onSave: (student: Student) => void;
  onCancel: () => void;
  onDelete: (studentId: string) => void;
};

const SECTION = "flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800";
const LEGEND = "px-1 text-base font-semibold";
const TEXTAREA = `${INPUT_CLASS} min-h-20`;

export const StudentForm = ({
  initial,
  isNew,
  slots,
  students,
  credits,
  onSave,
  onCancel,
  onDelete,
}: Props) => {
  const [draft, setDraft] = useState<Student>(initial);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [noteText, setNoteText] = useState("");

  const setField = <K extends keyof Student>(key: K, value: Student[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const setHealth = <K extends keyof Student["health"]>(
    key: K,
    value: Student["health"][K],
  ) =>
    setDraft((current) => ({
      ...current,
      health: { ...current.health, [key]: value },
    }));

  const toggleSlot = (slotId: string) =>
    setField(
      "slotIds",
      draft.slotIds.includes(slotId)
        ? draft.slotIds.filter((id) => id !== slotId)
        : [...draft.slotIds, slotId],
    );

  const addNote = () => {
    const text = noteText.trim();
    if (!text) return;
    setField("evolution", [
      ...draft.evolution,
      { id: newId(), date: toDateKey(new Date()), text },
    ]);
    setNoteText("");
  };

  const removeNote = (noteId: string) =>
    setField(
      "evolution",
      draft.evolution.filter((note) => note.id !== noteId),
    );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const candidate = { ...draft, name: draft.name.trim() };
    const problem = validateStudent(candidate);
    if (problem) {
      setError(problem);
      return;
    }
    onSave(candidate);
  };

  const chatLink = whatsappLink(draft.phone);
  const others = students.filter((s) => s.id !== draft.id);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {isNew ? "Novo aluno" : draft.name || "Aluno"}
        </h2>
        <button type="button" className={BUTTON_SECONDARY} onClick={onCancel}>
          Voltar
        </button>
      </div>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Dados básicos</legend>
        <Field label="Nome">
          <input
            className={INPUT_CLASS}
            value={draft.name}
            onChange={(e) => setField("name", e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Telefone (com DDD)">
          <input
            type="tel"
            className={INPUT_CLASS}
            value={draft.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </Field>
        {chatLink ? (
          <a
            href={chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_BUTTON}
          >
            Abrir conversa no WhatsApp
          </a>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data de nascimento">
            <input
              type="date"
              className={INPUT_CLASS}
              value={draft.birthDate ?? ""}
              onChange={(e) => setField("birthDate", e.target.value || null)}
            />
          </Field>
          <Field label="Início no estúdio">
            <input
              type="date"
              className={INPUT_CLASS}
              value={draft.startedAt}
              onChange={(e) => setField("startedAt", e.target.value)}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-5 accent-teal-700"
            checked={draft.active}
            onChange={(e) => setField("active", e.target.checked)}
          />
          Aluno ativo
        </label>
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Horários fixos</legend>
        <p className="text-sm">
          Créditos de reposição: <strong>{credits}</strong>
        </p>
        {slots.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Cadastre horários na aba Horários para matricular o aluno.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {slots.map((slot) => {
              const checked = draft.slotIds.includes(slot.id);
              const taken = studentsInSlot(slot.id, others).length;
              const full = taken >= CLASS_CAPACITY;
              return (
                <li key={slot.id}>
                  <label className="flex min-h-11 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-5 accent-teal-700"
                      checked={checked}
                      disabled={full && !checked}
                      onChange={() => toggleSlot(slot.id)}
                    />
                    <span>
                      {formatSlot(slot)}{" "}
                      <span className="text-zinc-600 dark:text-zinc-400">
                        ({full ? "lotado" : `${taken}/${CLASS_CAPACITY}`})
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Saúde</legend>
        <Field label="Lesões e condições">
          <textarea
            className={TEXTAREA}
            value={draft.health.injuries}
            onChange={(e) => setHealth("injuries", e.target.value)}
          />
        </Field>
        <Field label="Cirurgias">
          <textarea
            className={TEXTAREA}
            value={draft.health.surgeries}
            onChange={(e) => setHealth("surgeries", e.target.value)}
          />
        </Field>
        <Field label="Restrições de movimento">
          <textarea
            className={TEXTAREA}
            value={draft.health.restrictions}
            onChange={(e) => setHealth("restrictions", e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-5 accent-teal-700"
            checked={draft.health.medicalClearance}
            onChange={(e) => setHealth("medicalClearance", e.target.checked)}
          />
          Tem liberação médica
        </label>
        <Field label="Contato de emergência">
          <input
            className={INPUT_CLASS}
            value={draft.health.emergencyContact}
            onChange={(e) => setHealth("emergencyContact", e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Pontos de atenção</legend>
        <Field
          label="Exercícios com desconforto e o que evitar"
          hint="Aparece em destaque na sessão."
        >
          <textarea
            className={TEXTAREA}
            value={draft.attention}
            onChange={(e) => setField("attention", e.target.value)}
          />
        </Field>
        <Field label="Objetivos">
          <textarea
            className={TEXTAREA}
            value={draft.goals}
            onChange={(e) => setField("goals", e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Mensalidade</legend>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-5 accent-teal-700"
            checked={draft.monthlyFee !== null}
            onChange={(e) =>
              setField(
                "monthlyFee",
                e.target.checked ? { amount: 0, dueDay: 5 } : null,
              )
            }
          />
          Cobrar mensalidade
        </label>
        {draft.monthlyFee ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={INPUT_CLASS}
                value={draft.monthlyFee.amount}
                onChange={(e) =>
                  setField("monthlyFee", {
                    amount: e.target.valueAsNumber,
                    dueDay: draft.monthlyFee?.dueDay ?? 5,
                  })
                }
              />
            </Field>
            <Field label="Dia de vencimento">
              <input
                type="number"
                min="1"
                max="31"
                inputMode="numeric"
                className={INPUT_CLASS}
                value={draft.monthlyFee.dueDay}
                onChange={(e) =>
                  setField("monthlyFee", {
                    amount: draft.monthlyFee?.amount ?? 0,
                    dueDay: e.target.valueAsNumber,
                  })
                }
              />
            </Field>
          </div>
        ) : null}
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Evolução</legend>
        <Field label="Nova nota">
          <textarea
            className={TEXTAREA}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </Field>
        <div>
          <button type="button" className={BUTTON_SECONDARY} onClick={addNote}>
            Adicionar nota
          </button>
        </div>
        {draft.evolution.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {[...draft.evolution].reverse().map((note) => (
              <li
                key={note.id}
                className="flex items-start justify-between gap-3 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800"
              >
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {note.date.split("-").reverse().join("/")}
                  </p>
                  <p className="whitespace-pre-wrap">{note.text}</p>
                </div>
                <button
                  type="button"
                  className={LINK_BUTTON}
                  onClick={() => removeNote(note.id)}
                >
                  Remover nota
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={BUTTON_PRIMARY}>
          Salvar aluno
        </button>
        {!isNew ? (
          confirmingDelete ? (
            <>
              <button
                type="button"
                className={BUTTON_DANGER}
                onClick={() => onDelete(draft.id)}
              >
                Confirmar exclusão
              </button>
              <button
                type="button"
                className={BUTTON_SECONDARY}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className={BUTTON_SECONDARY}
              onClick={() => setConfirmingDelete(true)}
            >
              Excluir aluno
            </button>
          )
        ) : null}
      </div>
    </form>
  );
};
