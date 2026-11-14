import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalStore } from "@/hooks/local-store";

const KEY = "app:test:v1";

describe("createLocalStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("devolve o valor vazio quando não há nada salvo", () => {
    const store = createLocalStore<string[]>(KEY, []);
    expect(store.getSnapshot()).toEqual([]);
  });

  it("grava, lê e avisa os assinantes", () => {
    const store = createLocalStore<string[]>(KEY, []);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(["a"]);
    expect(store.getSnapshot()).toEqual(["a"]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("mantém a mesma referência enquanto o conteúdo não muda", () => {
    const store = createLocalStore<string[]>(KEY, []);
    store.set(["a"]);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("volta ao vazio se o JSON salvo estiver corrompido", () => {
    window.localStorage.setItem(KEY, "{quebrado");
    const store = createLocalStore<string[]>(KEY, []);
    expect(store.getSnapshot()).toEqual([]);
  });

  it("para de avisar depois de cancelar a assinatura", () => {
    const store = createLocalStore<string[]>(KEY, []);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set(["a"]);
    expect(listener).not.toHaveBeenCalled();
  });

  it("reage a mudanças vindas de outra aba", () => {
    const store = createLocalStore<string[]>(KEY, []);
    const listener = vi.fn();
    store.subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
