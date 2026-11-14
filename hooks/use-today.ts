import { useSyncExternalStore } from "react";
import { toDateKey } from "@/lib/dates";
import type { DateKey } from "@/types/pilates";

const subscribeNever = () => () => {};

/** Data de hoje, ou `null` antes da hidratação (não usa `Date` no render do servidor). */
export const useToday = (): DateKey | null => {
  const today = useSyncExternalStore(
    subscribeNever,
    () => toDateKey(new Date()),
    () => "",
  );
  return today || null;
};
