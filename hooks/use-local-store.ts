import { useSyncExternalStore } from "react";

/** Store mínimo sobre `localStorage`, para uso com `useSyncExternalStore`. */
export type LocalStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
};

export const createLocalStore = <T>(key: string, empty: T): LocalStore<T> => {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = empty;

  const notify = () => listeners.forEach((listener) => listener());

  const getSnapshot = (): T => {
    const raw = window.localStorage.getItem(key);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw === null ? empty : (JSON.parse(raw) as T);
    } catch {
      cachedValue = empty;
    }
    return cachedValue;
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) notify();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0)
        window.removeEventListener("storage", onStorage);
    };
  };

  const set = (next: T) => {
    window.localStorage.setItem(key, JSON.stringify(next));
    notify();
  };

  return { subscribe, getSnapshot, getServerSnapshot: () => empty, set };
};

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
