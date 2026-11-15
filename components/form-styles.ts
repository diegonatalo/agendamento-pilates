const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const FOCUS_RING = FOCUS;

export const INPUT_CLASS = `w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-base text-fg placeholder:text-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary`;

const BUTTON_BASE = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;

export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-primary text-primary-fg shadow-sm hover:bg-primary-hover`;

export const BUTTON_SECONDARY = `${BUTTON_BASE} border border-line-strong bg-surface text-fg hover:bg-surface-2`;

export const BUTTON_DANGER = `${BUTTON_BASE} bg-danger text-danger-fg hover:bg-danger-hover`;

export const LINK_BUTTON = `rounded text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover ${FOCUS}`;

/** Cartão base das telas. */
export const CARD = "rounded-2xl border border-line bg-surface shadow-card";

/** Selo pequeno em tom suave. */
export const BADGE =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
export const BADGE_NEUTRAL = `${BADGE} bg-surface-2 text-muted`;
export const BADGE_PRIMARY = `${BADGE} bg-primary-soft text-primary-soft-fg`;
export const BADGE_WARN = `${BADGE} bg-warn-soft text-warn-soft-fg`;
export const BADGE_DANGER = `${BADGE} bg-danger-soft text-danger-soft-fg`;
