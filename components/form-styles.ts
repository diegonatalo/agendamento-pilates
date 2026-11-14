const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-400";

export const INPUT_CLASS = `w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${FOCUS}`;

const BUTTON_BASE = `inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${FOCUS}`;

export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400`;

export const BUTTON_SECONDARY = `${BUTTON_BASE} border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800`;

export const BUTTON_DANGER = `${BUTTON_BASE} bg-red-700 text-white hover:bg-red-800 dark:bg-red-500 dark:text-zinc-950 dark:hover:bg-red-400`;

export const LINK_BUTTON = `text-sm font-medium text-teal-700 underline underline-offset-2 dark:text-teal-400 ${FOCUS}`;
