"use client";

import { useId, useState, type FormEvent } from "react";
import { BUTTON_PRIMARY } from "@/components/form-styles";
import { BUSINESSES, BUSINESS_ORDER } from "@/lib/business";
import { cn } from "@/lib/cn";
import type { BusinessType } from "@/types/pilates";

type Props = {
  /** Pergunta que dá nome ao grupo de opções. */
  legend: string;
  current: BusinessType | null;
  submitLabel: string;
  onPick: (type: BusinessType) => void;
};

/** Escolha do ramo: muda o vocabulário do app e os campos da ficha. */
export const BusinessPicker = ({ legend, current, submitLabel, onPick }: Props) => {
  const id = useId();
  const [selected, setSelected] = useState<BusinessType | null>(current);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (selected) onPick(selected);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">{legend}</legend>
        {BUSINESS_ORDER.map((type) => {
          const business = BUSINESSES[type];
          const checked = selected === type;
          return (
            <label
              key={type}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 has-focus-visible:outline-2 has-focus-visible:outline-primary",
                checked ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-line bg-surface hover:bg-surface-2",
              )}
            >
              <input
                type="radio"
                name={`${id}-business`}
                value={type}
                checked={checked}
                onChange={() => setSelected(type)}
                className="mt-1 size-4 accent-[var(--primary)]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold">{business.label}</span>
                <span className={cn("text-sm", checked ? "" : "text-muted")}>{business.description}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <div>
        <button type="submit" disabled={!selected || selected === current} className={BUTTON_PRIMARY}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
