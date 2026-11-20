"use client";

import { BUTTON_PRIMARY } from "@/components/form-styles";

/** Abre a janela de impressão do navegador (o termo de consentimento é feito para imprimir). */
export const PrintButton = () => (
  <button type="button" className={BUTTON_PRIMARY} onClick={() => window.print()}>
    Imprimir o termo
  </button>
);
