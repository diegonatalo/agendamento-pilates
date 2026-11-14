import { cn } from "@/lib/cn";
import { CLASS_CAPACITY } from "@/lib/constants";
import type { Attendee, Session } from "@/lib/schedule";
import { endTime } from "@/lib/slots";
import type { BookingStatus } from "@/types/pilates";

type Props = {
  session: Session;
  onMark: (studentId: string, status: BookingStatus) => void;
};

const KIND_LABEL = { regular: null, makeup: "Reposição", trial: "Experimental" };

const STATUS_LABEL: Record<BookingStatus, string> = {
  scheduled: "Agendado",
  present: "Presente",
  absent: "Faltou",
  cancelled: "Desmarcou",
};

const STATUS_BUTTON =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-400";

const ActionButton = ({
  attendee,
  status,
  tone,
  onMark,
}: {
  attendee: Attendee;
  status: "present" | "absent";
  tone: string;
  onMark: Props["onMark"];
}) => {
  const pressed = attendee.status === status;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        STATUS_BUTTON,
        pressed
          ? tone
          : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
      )}
      // Clicar de novo no estado ativo volta para "agendado".
      onClick={() =>
        attendee.student &&
        onMark(attendee.student.id, pressed ? "scheduled" : status)
      }
    >
      {STATUS_LABEL[status]}
      <span className="sr-only"> — {attendee.student?.name}</span>
    </button>
  );
};

export const SessionCard = ({ session, onMark }: Props) => {
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
      ) : attendees.length === 0 ? (
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
                  {attendee.status === "cancelled" ? (
                    <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400">
                      {STATUS_LABEL.cancelled}
                    </span>
                  ) : null}
                </p>
                {attention ? (
                  <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
                    <strong>Atenção:</strong> {attention}
                  </p>
                ) : null}
                {attendee.kind === "regular" && attendee.student ? (
                  <div className="flex gap-2">
                    <ActionButton
                      attendee={attendee}
                      status="present"
                      tone="border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950"
                      onMark={onMark}
                    />
                    <ActionButton
                      attendee={attendee}
                      status="absent"
                      tone="border-red-700 bg-red-700 text-white dark:border-red-500 dark:bg-red-500 dark:text-zinc-950"
                      onMark={onMark}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
