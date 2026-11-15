"use client";

import { useState } from "react";
import {
  BUTTON_DANGER,
  BUTTON_SECONDARY,
} from "@/components/form-styles";
import { WEEKDAY_LABELS } from "@/lib/slots";
import type { ClassSlot } from "@/types/pilates";

type Props = {
  slot: ClassSlot;
  /** Alunos fixos que perdem o horário ao remover. */
  enrolled: number;
  onRemove: (slotId: string) => void;
};

/** Botão "Remover" que pede confirmação antes. */
export const SlotRemove = ({ slot, enrolled, onRemove }: Props) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        className={BUTTON_SECONDARY}
        onClick={() => setConfirming(true)}
      >
        Remover{" "}
        <span className="sr-only">
          horário de {WEEKDAY_LABELS[slot.weekday]} às {slot.startTime}
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {enrolled > 0
          ? `Remover o horário e desvincular ${enrolled} ${enrolled === 1 ? "aluno" : "alunos"}?`
          : "Remover este horário?"}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON_DANGER}
          onClick={() => onRemove(slot.id)}
        >
          Confirmar remoção
        </button>
        <button
          type="button"
          className={BUTTON_SECONDARY}
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
