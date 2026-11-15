"use client";

import { useState, type FormEvent } from "react";
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
import { formatCurrency } from "@/lib/payments";
import { formatWeeklyClasses, studentsOnPlan } from "@/lib/plans";
import type { Plan } from "@/types/pilates";

type Draft = { name: string; weeklyClasses: string; amount: string };

const EMPTY: Draft = { name: "", weeklyClasses: "2", amount: "" };

const toDraft = (plan: Plan): Draft => ({
  name: plan.name,
  weeklyClasses: String(plan.weeklyClasses),
  amount: String(plan.amount),
});

export const PlansScreen = () => {
  const { ready, plans, students, savePlan, removePlan } = useStudio();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const reset = () => {
    setDraft(EMPTY);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problem = savePlan(
      {
        name: draft.name,
        weeklyClasses: Number(draft.weeklyClasses),
        amount: draft.amount.trim() === "" ? Number.NaN : Number(draft.amount),
      },
      editingId,
    );
    if (problem) {
      setError(problem);
      return;
    }
    reset();
  };

  const startEditing = (plan: Plan) => {
    setDraft(toDraft(plan));
    setEditingId(plan.id);
    setError(null);
    setConfirmingId(null);
  };

  const handleRemove = (planId: string) => {
    setError(removePlan(planId));
    setConfirmingId(null);
    if (editingId === planId) reset();
  };

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold">Planos</h1>
        <p className="text-muted">
          Os planos do estúdio. Na ficha de cada aluno você escolhe o plano, e
          o valor pago fica registrado em cada mês.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className={`${CARD} flex flex-col gap-4 p-4 sm:p-5`}
        noValidate
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Editar plano" : "Novo plano"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <Field label="Nome">
            <input
              className={INPUT_CLASS}
              value={draft.name}
              placeholder="Ex.: 2x por semana"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              autoComplete="off"
            />
          </Field>
          <Field label="Aulas por semana">
            <select
              className={INPUT_CLASS}
              value={draft.weeklyClasses}
              onChange={(e) =>
                setDraft({ ...draft, weeklyClasses: e.target.value })
              }
            >
              {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                <option key={count} value={count}>
                  {count}x
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mensalidade (R$)">
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className={INPUT_CLASS}
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            />
          </Field>
        </div>
        {editingId ? (
          <p className="text-sm text-muted">
            Mudar o valor reajusta todos os alunos do plano a partir de agora.
            Meses já pagos mantêm o valor que foi pago.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            {editingId ? "Salvar plano" : "Adicionar plano"}
          </button>
          {editingId ? (
            <button type="button" className={BUTTON_SECONDARY} onClick={reset}>
              Cancelar edição
            </button>
          ) : null}
        </div>
      </form>

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {!ready ? null : plans.length === 0 ? (
        <EmptyState title="Nenhum plano cadastrado ainda.">
          Cadastre os planos que o estúdio oferece, como 1x, 2x ou 3x por
          semana.
        </EmptyState>
      ) : (
        <ul className={`${CARD} flex flex-col divide-y divide-line p-1.5`}>
          {plans.map((plan) => {
            const enrolled = studentsOnPlan(plan.id, students).length;
            const confirming = confirmingId === plan.id;
            return (
              <li
                key={plan.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold break-words">{plan.name}</p>
                  <p className="text-sm text-muted">
                    {[
                      // O nome costuma já ser a frequência; não repete.
                      plan.name === formatWeeklyClasses(plan.weeklyClasses)
                        ? null
                        : formatWeeklyClasses(plan.weeklyClasses),
                      formatCurrency(plan.amount),
                      `${enrolled} ${enrolled === 1 ? "aluno" : "alunos"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {confirming ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm">Excluir este plano?</p>
                    <button
                      type="button"
                      className={BUTTON_DANGER}
                      onClick={() => handleRemove(plan.id)}
                    >
                      Confirmar exclusão
                    </button>
                    <button
                      type="button"
                      className={BUTTON_SECONDARY}
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={BUTTON_SECONDARY}
                      onClick={() => startEditing(plan)}
                    >
                      Editar <span className="sr-only">plano {plan.name}</span>
                    </button>
                    <button
                      type="button"
                      className={BUTTON_SECONDARY}
                      onClick={() => setConfirmingId(plan.id)}
                    >
                      Excluir <span className="sr-only">plano {plan.name}</span>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};
