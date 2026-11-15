"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  INPUT_CLASS,
  LINK_BUTTON,
} from "@/components/form-styles";
import { toDateKey } from "@/lib/dates";
import { newId } from "@/lib/ids";
import { formatCurrency } from "@/lib/payments";
import { findPlan, formatWeeklyClasses, slotsOverPlan } from "@/lib/plans";
import { formatSlot } from "@/lib/slots";
import {
  studentsInSlot,
  validateStudent,
  whatsappLink,
} from "@/lib/students";
import type {
  ClassSlot,
  MonthlyFee,
  Plan,
  Student,
  StudioSettings,
} from "@/types/pilates";

type Props = {
  initial: Student;
  isNew: boolean;
  slots: ClassSlot[];
  plans: Plan[];
  settings: StudioSettings;
  /** Todos os alunos cadastrados, para calcular as vagas dos horários. */
  students: Student[];
  /** Saldo de reposições do aluno. */
  credits: number;
  onSave: (student: Student) => void;
  onCancel: () => void;
  onDelete: (studentId: string) => void;
};

const SECTION = `${CARD} flex flex-col gap-4 p-4 sm:p-5`;
const LEGEND = "px-1 font-display text-lg font-semibold";
const TEXTAREA = `${INPUT_CLASS} min-h-20`;

export const StudentForm = ({
  initial,
  isNew,
  slots,
  plans,
  settings,
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

  const fee = draft.monthlyFee;
  const selectedPlan = findPlan(fee?.planId ?? null, plans);
  const overPlan = slotsOverPlan(draft, plans);

  const setFee = (changes: Partial<MonthlyFee>) =>
    setDraft((current) =>
      current.monthlyFee
        ? { ...current, monthlyFee: { ...current.monthlyFee, ...changes } }
        : current,
    );

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
    const problem = validateStudent(candidate, plans);
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
        <h2 className="text-2xl font-semibold">
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
            className="size-5 accent-primary"
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
          <p className="text-sm text-muted">
            Cadastre horários na aba Horários para matricular o aluno.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {slots.map((slot) => {
              const checked = draft.slotIds.includes(slot.id);
              const taken = studentsInSlot(slot.id, others).length;
              const full = taken >= settings.capacity;
              return (
                <li key={slot.id}>
                  <label className="flex min-h-11 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-5 accent-primary"
                      checked={checked}
                      disabled={full && !checked}
                      onChange={() => toggleSlot(slot.id)}
                    />
                    <span>
                      {formatSlot(slot, settings.sessionMinutes)}{" "}
                      <span className="text-muted">
                        ({full ? "lotado" : `${taken}/${settings.capacity}`})
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
            className="size-5 accent-primary"
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
            className="size-5 accent-primary"
            checked={fee !== null}
            onChange={(e) =>
              setField(
                "monthlyFee",
                e.target.checked
                  ? {
                      planId: plans[0]?.id ?? null,
                      customAmount: null,
                      dueDay: 5,
                    }
                  : null,
              )
            }
          />
          Cobrar mensalidade
        </label>
        {fee ? (
          <>
            {plans.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhum plano cadastrado. Cadastre os planos na aba Planos ou
                informe um valor combinado abaixo.
              </p>
            ) : (
              <Field label="Plano">
                <select
                  className={INPUT_CLASS}
                  value={fee.planId ?? ""}
                  onChange={(e) =>
                    setFee({
                      planId: e.target.value || null,
                      customAmount: e.target.value ? null : fee.customAmount,
                    })
                  }
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {formatCurrency(plan.amount)}
                    </option>
                  ))}
                  <option value="">Sem plano (valor combinado)</option>
                </select>
              </Field>
            )}
            {selectedPlan ? (
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-5 accent-primary"
                  checked={fee.customAmount !== null}
                  onChange={(e) =>
                    setFee({
                      customAmount: e.target.checked ? selectedPlan.amount : null,
                    })
                  }
                />
                Valor diferente do plano (desconto ou valor combinado)
              </label>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {fee.customAmount !== null || !selectedPlan ? (
                <Field label="Valor (R$)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                    value={
                      fee.customAmount === null || Number.isNaN(fee.customAmount)
                        ? ""
                        : fee.customAmount
                    }
                    onChange={(e) =>
                      setFee({ customAmount: e.target.valueAsNumber })
                    }
                  />
                </Field>
              ) : null}
              <Field label="Dia de vencimento">
                <input
                  type="number"
                  min="1"
                  max="31"
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  value={Number.isNaN(fee.dueDay) ? "" : fee.dueDay}
                  onChange={(e) => setFee({ dueDay: e.target.valueAsNumber })}
                />
              </Field>
            </div>
            {selectedPlan && overPlan > 0 ? (
              <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn-soft-fg">
                Este plano dá direito a{" "}
                {formatWeeklyClasses(selectedPlan.weeklyClasses)}, mas o aluno
                tem {draft.slotIds.length} horários fixos.
              </p>
            ) : null}
          </>
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
                className="flex items-start justify-between gap-3 border-t border-line pt-3 text-sm"
              >
                <div>
                  <p className="text-xs text-muted">
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
        <p role="alert" className="text-sm font-medium text-danger">
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
