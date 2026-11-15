"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/field";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  INPUT_CLASS,
} from "@/components/form-styles";
import {
  canAddToSession,
  eligibleForMakeup,
  validateGuestName,
  type Session,
} from "@/lib/schedule";
import type { Booking, Student } from "@/types/pilates";

type Props = {
  session: Session;
  students: Student[];
  bookings: Booking[];
  onBookMakeup: (studentId: string) => void;
  onBookTrial: (guestName: string) => void;
};

type Mode = "makeup" | "trial";

/** Encaixa uma reposição ou uma aula experimental em uma vaga livre. */
export const AddToSession = ({
  session,
  students,
  bookings,
  onBookMakeup,
  onBookTrial,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("makeup");
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!canAddToSession(session)) return null;

  const eligible = eligibleForMakeup(session, students, bookings);
  const studentId =
    eligible.find((e) => e.student.id === chosenId)?.student.id ??
    eligible[0]?.student.id;
  const idBase = `add-${session.slot.id}`;

  const close = () => {
    setOpen(false);
    setError(null);
    setGuestName("");
    setChosenId(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "makeup") {
      if (!studentId) return;
      onBookMakeup(studentId);
    } else {
      const problem = validateGuestName(guestName);
      if (problem) {
        setError(problem);
        return;
      }
      onBookTrial(guestName);
    }
    close();
  };

  if (!open) {
    return (
      <div>
        <button
          type="button"
          className={BUTTON_SECONDARY}
          onClick={() => setOpen(true)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Encaixar aluno{" "}
          <span className="sr-only">às {session.slot.startTime}</span>
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl bg-surface-2 p-4"
    >
      <fieldset className="flex flex-wrap gap-x-5 gap-y-1">
        <legend className="mb-1 text-sm font-semibold">Tipo de aula</legend>
        {(
          [
            ["makeup", "Reposição"],
            ["trial", "Aula experimental"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="radio"
              name={`${idBase}-mode`}
              className="size-5 accent-primary"
              checked={mode === value}
              onChange={() => {
                setMode(value);
                setError(null);
              }}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {mode === "makeup" ? (
        eligible.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhum aluno com crédito de reposição.
          </p>
        ) : (
          <Field label="Aluno">
            <select
              className={INPUT_CLASS}
              value={studentId}
              onChange={(e) => setChosenId(e.target.value)}
            >
              {eligible.map(({ student, credits }) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({credits}{" "}
                  {credits === 1 ? "crédito" : "créditos"})
                </option>
              ))}
            </select>
          </Field>
        )
      ) : (
        <Field label="Nome de quem vai fazer a aula">
          <input
            className={INPUT_CLASS}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            autoComplete="off"
          />
        </Field>
      )}

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={BUTTON_PRIMARY}
          disabled={mode === "makeup" && eligible.length === 0}
        >
          Encaixar
        </button>
        <button type="button" className={BUTTON_SECONDARY} onClick={close}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
