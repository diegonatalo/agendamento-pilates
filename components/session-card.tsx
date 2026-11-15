import { AddToSession } from "@/components/add-to-session";
import { LINK_BUTTON } from "@/components/form-styles";
import { cn } from "@/lib/cn";
import { CLASS_CAPACITY } from "@/lib/constants";
import type { Attendee, Session } from "@/lib/schedule";
import { endTime } from "@/lib/slots";
import type { Booking, BookingStatus, Student } from "@/types/pilates";

type Props = {
  session: Session;
  students: Student[];
  bookings: Booking[];
  onSetStatus: (attendee: Attendee, status: BookingStatus) => void;
  /** Tira uma reposição ou aula experimental da sessão. */
  onRemove: (attendee: Attendee) => void;
  onBookMakeup: (studentId: string) => void;
  onBookTrial: (guestName: string) => void;
};

type Action = "present" | "absent" | "cancelled";

const KIND_LABEL = { regular: null, makeup: "Reposição", trial: "Experimental" };

const ACTIONS: Record<Action, { label: string; tone: string }> = {
  present: {
    label: "Presente",
    tone: "border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950",
  },
  absent: {
    label: "Faltou",
    tone: "border-red-700 bg-red-700 text-white dark:border-red-500 dark:bg-red-500 dark:text-zinc-950",
  },
  cancelled: {
    label: "Desmarcou",
    tone: "border-zinc-700 bg-zinc-700 text-white dark:border-zinc-300 dark:bg-zinc-300 dark:text-zinc-950",
  },
};

const BUTTON_BASE =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-400";

/** Aluno fixo pode desmarcar; reposição e experimental são removidas. */
const actionsFor = (attendee: Attendee): Action[] =>
  attendee.kind === "regular"
    ? ["present", "absent", "cancelled"]
    : ["present", "absent"];

export const SessionCard = ({
  session,
  students,
  bookings,
  onSetStatus,
  onRemove,
  onBookMakeup,
  onBookTrial,
}: Props) => {
  const { slot, blockedBy, attendees, occupied, vacancies } = session;
  const titleId = `session-${slot.id}`;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={titleId} className="text-lg font-semibold">
          {slot.startTime} às {endTime(slot.startTime)}
        </h3>
        {blockedBy ? null : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {occupied}/{CLASS_CAPACITY} ocupadas ·{" "}
            {vacancies === 0
              ? "lotada"
              : `${vacancies} ${vacancies === 1 ? "vaga livre" : "vagas livres"}`}
          </p>
        )}
      </header>

      {blockedBy ? (
        <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-900">
          Sem aula: {blockedBy.reason}
        </p>
      ) : (
        <>
          {attendees.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Nenhum aluno neste horário.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {attendees.map((attendee) => {
                const name =
                  attendee.student?.name ??
                  attendee.guestName ??
                  "Aluno excluído";
                const kindLabel = KIND_LABEL[attendee.kind];
                const attention = attendee.student?.attention.trim();
                const canMark = attendee.kind !== "regular" || attendee.student;
                return (
                  <li
                    key={attendee.key}
                    className="flex flex-col gap-2 border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800"
                  >
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {name}
                      {kindLabel ? (
                        <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-normal dark:bg-zinc-800">
                          {kindLabel}
                        </span>
                      ) : null}
                    </p>
                    {attention ? (
                      <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
                        <strong>Atenção:</strong> {attention}
                      </p>
                    ) : null}
                    {canMark ? (
                      <div className="flex gap-2">
                        {actionsFor(attendee).map((action) => {
                          const pressed = attendee.status === action;
                          return (
                            <button
                              key={action}
                              type="button"
                              aria-pressed={pressed}
                              className={cn(
                                BUTTON_BASE,
                                pressed
                                  ? ACTIONS[action].tone
                                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
                              )}
                              // Clicar de novo no estado ativo volta para "agendado".
                              onClick={() =>
                                onSetStatus(
                                  attendee,
                                  pressed ? "scheduled" : action,
                                )
                              }
                            >
                              {ACTIONS[action].label}{" "}
                              <span className="sr-only">— {name}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    {attendee.kind !== "regular" ? (
                      <div>
                        <button
                          type="button"
                          className={LINK_BUTTON}
                          onClick={() => onRemove(attendee)}
                        >
                          {attendee.kind === "makeup"
                            ? "Cancelar reposição"
                            : "Remover aula experimental"}{" "}
                          <span className="sr-only">— {name}</span>
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          <AddToSession
            session={session}
            students={students}
            bookings={bookings}
            onBookMakeup={onBookMakeup}
            onBookTrial={onBookTrial}
          />
        </>
      )}
    </section>
  );
};
