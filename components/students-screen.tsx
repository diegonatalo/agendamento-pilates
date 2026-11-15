"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { BUTTON_PRIMARY, CARD, INPUT_CLASS } from "@/components/form-styles";
import { PaymentToolbar } from "@/components/payment-toolbar";
import { StudentForm } from "@/components/student-form";
import { StudentRow } from "@/components/student-row";
import { cn } from "@/lib/cn";
import { useStudio } from "@/hooks/use-studio";
import { useToday } from "@/hooks/use-today";
import { creditBalance } from "@/lib/credits";
import { toDateKey } from "@/lib/dates";
import { newId } from "@/lib/ids";
import { monthOf, paymentStatus, summarizeMonth } from "@/lib/payments";
import { createEmptyStudent } from "@/lib/students";
import type { Student } from "@/types/pilates";

export const StudentsScreen = () => {
  const {
    ready,
    slots,
    students,
    bookings,
    payments,
    saveStudent,
    removeStudent,
    markPayment,
    plans,
  } = useStudio();
  const today = useToday();
  const [creating, setCreating] = useState<Student | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  const [onlyUnpaid, setOnlyUnpaid] = useState(false);

  const month = pickedMonth ?? (today ? monthOf(today) : null);
  const current =
    creating ?? students.find((student) => student.id === selectedId) ?? null;

  const close = () => {
    setCreating(null);
    setSelectedId(null);
  };

  const startCreating = () =>
    setCreating(createEmptyStudent(newId(), toDateKey(new Date())));

  const statusOf = (student: Student) =>
    month && today
      ? paymentStatus(student, month, payments, today)
      : "not-billed";

  const visible = students.filter((student) => {
    if (!student.name.toLowerCase().includes(query.trim().toLowerCase()))
      return false;
    if (!onlyUnpaid) return true;
    const status = statusOf(student);
    return status === "pending" || status === "overdue";
  });

  if (current) {
    return (
      <main>
        <StudentForm
          key={current.id}
          initial={current}
          isNew={creating !== null}
          slots={slots}
          plans={plans}
          students={students}
          credits={creditBalance(current.id, bookings)}
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
    <main className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Alunos</h1>
          <p className="text-muted">Fichas, horários fixos e mensalidades.</p>
        </div>
        <button type="button" className={BUTTON_PRIMARY} onClick={startCreating}>
          Novo aluno
        </button>
      </header>

      {month && today ? (
        <PaymentToolbar
          month={month}
          summary={summarizeMonth(students, plans, month, payments, today)}
          onlyUnpaid={onlyUnpaid}
          onMonthChange={setPickedMonth}
          onOnlyUnpaidChange={setOnlyUnpaid}
        />
      ) : null}

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
        <EmptyState title="Nenhum aluno cadastrado ainda.">
          Toque em “Novo aluno” para criar a primeira ficha.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            onlyUnpaid && !query.trim()
              ? "Nenhuma mensalidade pendente neste mês."
              : "Nenhum aluno encontrado."
          }
        />
      ) : (
        <ul className={cn(CARD, "flex flex-col divide-y divide-line p-1.5")}>
          {visible.map((student) => {
            const status = statusOf(student);
            return (
              <StudentRow
                key={student.id}
                student={student}
                slots={slots}
                plans={plans}
                credits={creditBalance(student.id, bookings)}
                status={status}
                onOpen={() => setSelectedId(student.id)}
                onTogglePaid={() =>
                  month &&
                  today &&
                  markPayment(student.id, month, status !== "paid", today)
                }
              />
            );
          })}
        </ul>
      )}
    </main>
  );
};
