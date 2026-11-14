import { useSyncExternalStore } from "react";
import type { LocalStore } from "@/hooks/local-store";

const subscribeNever = () => () => {};

/** Lê o store e informa `ready` só depois da hidratação (evita piscar "vazio"). */
export const useLocalStore = <T>(store: LocalStore<T>) => {
  const data = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  return { data, ready };
};
