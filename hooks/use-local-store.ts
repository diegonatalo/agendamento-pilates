import { useSyncExternalStore } from "react";

/** Store mínimo sobre `localStorage`, para uso com `useSyncExternalStore`. */
export type LocalStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  /** Devolve `false` se o navegador recusou gravar (modo privado, armazenamento cheio). */
  set: (next: T) => boolean;
};

export const createLocalStore = <T>(key: string, empty: T): LocalStore<T> => {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = empty;
  // Valor que o navegador recusou gravar: continua valendo nesta visita.
  let unsavedRaw: string | undefined;

  const notify = () => listeners.forEach((listener) => listener());

  const readRaw = (): string | null => {
    if (unsavedRaw !== undefined) return unsavedRaw;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const getSnapshot = (): T => {
    const raw = readRaw();
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

  const set = (next: T): boolean => {
    const raw = JSON.stringify(next);
    let saved = true;
    try {
      window.localStorage.setItem(key, raw);
      unsavedRaw = undefined;
    } catch {
      unsavedRaw = raw;
      saved = false;
    }
    notify();
    return saved;
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
