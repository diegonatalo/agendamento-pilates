import { AddToSession } from "@/components/add-to-session";
import { Avatar } from "@/components/avatar";
import {
  BADGE_NEUTRAL,
  BADGE_PRIMARY,
  CARD,
  FOCUS_RING,
  LINK_BUTTON,
} from "@/components/form-styles";
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
  present: { label: "Presente", tone: "bg-primary text-primary-fg shadow-xs" },
  absent: { label: "Faltou", tone: "bg-danger text-danger-fg shadow-xs" },
  cancelled: {
    label: "Desmarcou",
    tone: "bg-surface text-fg shadow-xs ring-1 ring-line-strong",
  },
};

/** Aluno fixo pode desmarcar; reposição e experimental são removidas. */
const actionsFor = (attendee: Attendee): Action[] =>
  attendee.kind === "regular"
    ? ["present", "absent", "cancelled"]
    : ["present", "absent"];

/** Uma bolinha por vaga: cheia se ocupada. Decorativo; o texto diz o mesmo. */
const Pips = ({ occupied }: { occupied: number }) => (
  <span aria-hidden="true" className="flex gap-1">
    {Array.from({ length: CLASS_CAPACITY }, (_, i) => (
      <span
        key={i}
        className={cn(
          "h-1.5 w-4 rounded-full",
          i < occupied ? "bg-primary" : "bg-line-strong",
        )}
      />
    ))}
  </span>
);

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
      className={cn(CARD, "flex flex-col gap-4 p-4 sm:p-5", blockedBy && "bg-surface-2 shadow-none")}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 id={titleId} className="font-display text-lg font-semibold">
          {slot.startTime} às {endTime(slot.startTime)}
        </h3>
        {blockedBy ? null : (
          <div className="flex items-center gap-2">
            <Pips occupied={occupied} />
            <p className="text-sm text-muted">
              {occupied}/{CLASS_CAPACITY} ocupadas ·{" "}
              {vacancies === 0
                ? "lotada"
                : `${vacancies} ${vacancies === 1 ? "vaga livre" : "vagas livres"}`}
            </p>
          </div>
        )}
      </header>

      {blockedBy ? (
        <p className="text-sm font-medium text-muted">
          Sem aula: {blockedBy.reason}
        </p>
      ) : (
        <>
          {attendees.length === 0 ? (
            <p className="text-sm text-muted">Nenhum aluno neste horário.</p>
          ) : (
            <ul className="flex flex-col gap-4">
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
                    className="flex flex-col gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={name} />
                      <p className="flex min-w-0 flex-wrap items-center gap-2 font-semibold">
                        <span className="break-words">{name}</span>
                        {kindLabel ? (
                          <span
                            className={
                              attendee.kind === "makeup"
                                ? BADGE_PRIMARY
                                : BADGE_NEUTRAL
                            }
                          >
                            {kindLabel}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    {attention ? (
                      <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn-soft-fg">
                        <strong>Atenção:</strong> {attention}
                      </p>
                    ) : null}
                    {canMark ? (
                      <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
                        {actionsFor(attendee).map((action) => {
                          const pressed = attendee.status === action;
                          return (
                            <button
                              key={action}
                              type="button"
                              aria-pressed={pressed}
                              className={cn(
                                "inline-flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium",
                                FOCUS_RING,
                                pressed
                                  ? ACTIONS[action].tone
                                  : "text-muted hover:bg-surface hover:text-fg",
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
