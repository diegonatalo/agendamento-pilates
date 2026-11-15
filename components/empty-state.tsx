import type { ReactNode } from "react";

type Props = {
  title: string;
  children?: ReactNode;
};

/** Estado vazio: ícone suave, título e uma frase de orientação. */
export const EmptyState = ({ title, children }: Props) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 21c1-7 4-11 7-11s6 4 7 11M12 10V4M9 7l3-3 3 3" />
      </svg>
    </span>
    <p className="font-display text-lg font-semibold">{title}</p>
    {children ? <div className="text-sm text-muted">{children}</div> : null}
  </div>
);
