import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export const Field = ({ label, hint, children }: Props) => (
  <label className="flex flex-col gap-1 text-sm font-medium">
    <span>{label}</span>
    {children}
    {hint ? (
      <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400">
        {hint}
      </span>
    ) : null}
  </label>
);
