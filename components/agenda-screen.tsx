"use client";

import Link from "next/link";
import { useState } from "react";
import { BUTTON_SECONDARY, LINK_BUTTON } from "@/components/form-styles";
import { SessionCard } from "@/components/session-card";
import { WeekStrip } from "@/components/week-strip";
import { useStudio } from "@/hooks/use-studio";
import { useToday } from "@/hooks/use-today";
import { addDays, formatDateBr, weekdayOf } from "@/lib/dates";
import { sessionsForDate } from "@/lib/schedule";
import { WEEKDAY_LABELS } from "@/lib/slots";

export const AgendaScreen = () => {
  const {
    ready,
    slots,
    students,
    bookings,
    blockedPeriods,
    markAttendance,
    markBooking,
    cancelBooking,
    bookMakeup,
    bookTrial,
  } = useStudio();
  const today = useToday();
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? today;

  if (!ready || !selected || !today) {
    return (
      <main>
        <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
      </main>
    );
  }

  const sessionsOf = (date: string) =>
    sessionsForDate(date, slots, students, bookings, blockedPeriods);
  const sessions = sessionsOf(selected);

  return (
    <main className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Presença e vagas por horário.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={BUTTON_SECONDARY}
            onClick={() => setPicked(addDays(selected, -7))}
          >
            Semana anterior
          </button>
          <button
            type="button"
            className={BUTTON_SECONDARY}
            onClick={() => setPicked(addDays(selected, 7))}
          >
            Próxima semana
          </button>
        </div>
      </header>

      <WeekStrip
        selected={selected}
        today={today}
        countFor={(date) => sessionsOf(date).length}
        onSelect={setPicked}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {WEEKDAY_LABELS[weekdayOf(selected)]}, {formatDateBr(selected)}
          {selected === today ? " (hoje)" : ""}
        </h2>
        {selected !== today ? (
          <button
            type="button"
            className={LINK_BUTTON}
            onClick={() => setPicked(null)}
          >
            Ir para hoje
          </button>
        ) : null}
      </div>

      {slots.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Cadastre os horários na aba{" "}
          <Link href="/horarios" className={LINK_BUTTON}>
            Horários
          </Link>{" "}
          para ver a agenda.
        </p>
      ) : sessions.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Sem aulas neste dia.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.slot.id}
              session={session}
              students={students}
              bookings={bookings}
              onSetStatus={(attendee, status) => {
                if (attendee.kind === "regular" && attendee.student) {
                  markAttendance(
                    {
                      slotId: session.slot.id,
                      date: session.date,
                      studentId: attendee.student.id,
                    },
                    status,
                  );
                } else if (attendee.bookingId) {
                  markBooking(attendee.bookingId, status);
                }
              }}
              onRemove={(attendee) => {
                if (attendee.bookingId) cancelBooking(attendee.bookingId);
              }}
              onBookMakeup={(studentId) =>
                bookMakeup({
                  slotId: session.slot.id,
                  date: session.date,
                  studentId,
                })
              }
              onBookTrial={(guestName) =>
                bookTrial({
                  slotId: session.slot.id,
                  date: session.date,
                  guestName,
                })
              }
            />
          ))}
        </div>
      )}
    </main>
  );
};
