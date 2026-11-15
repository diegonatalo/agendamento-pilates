import { initialsOf } from "@/lib/students";

type Props = { name: string };

/** Círculo com as iniciais; decorativo, o nome já aparece ao lado. */
export const Avatar = ({ name }: Props) => (
  <span
    aria-hidden="true"
    className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary-soft-fg"
  >
    {initialsOf(name)}
  </span>
);
