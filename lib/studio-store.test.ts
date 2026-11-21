import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { StudioChanges, StudioState } from "@/lib/studio-changes";
import { createStudioStore } from "@/lib/studio-store";

const initial: StudioState = {
  settings: DEFAULT_SETTINGS,
  plans: [],
  slots: [],
  students: [],
  bookings: [],
  blockedPeriods: [],
  payments: [],
};

const slot = (id: string) => ({ id, weekday: 1 as const, startTime: "08:00" });

describe("createStudioStore", () => {
  it("muda a tela na hora e salva só o que mudou", async () => {
    const save = vi.fn(async () => {});
    const store = createStudioStore(initial, save);
    store.update((s) => ({ ...s, slots: [slot("s1")] }));
    expect(store.getState().slots).toHaveLength(1);
    expect(store.getStatus().saving).toBe(true);
    await store.flush();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]).toEqual([expect.objectContaining({ upsert: expect.objectContaining({ slots: [slot("s1")] }) })]);
    expect(store.getStatus()).toEqual({ saving: false, failed: false });
  });

  it("não chama o servidor quando nada mudou", async () => {
    const save = vi.fn(async () => {});
    const store = createStudioStore(initial, save);
    store.update((s) => ({ ...s }));
    await store.flush();
    expect(save).not.toHaveBeenCalled();
  });

  it("salva uma mudança de cada vez, na ordem em que aconteceram", async () => {
    const order: string[] = [];
    let release: () => void = () => {};
    const save = vi.fn((changes: StudioChanges) => {
      const id = changes.upsert.slots[0]?.id ?? changes.remove.slots[0];
      order.push(`start ${id}`);
      return id === "s1"
        ? new Promise<void>((resolve) => {
            release = () => {
              order.push("end s1");
              resolve();
            };
          })
        : Promise.resolve();
    });
    const store = createStudioStore(initial, save);
    store.update((s) => ({ ...s, slots: [slot("s1")] }));
    store.update((s) => ({ ...s, slots: [...s.slots, slot("s2")] }));
    await Promise.resolve();
    expect(order).toEqual(["start s1"]);
    release();
    await store.flush();
    expect(order).toEqual(["start s1", "end s1", "start s2"]);
  });

  it("avisa quando um salvamento falha", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createStudioStore(initial, async () => {
      throw new Error("sem rede");
    });
    store.update((s) => ({ ...s, slots: [slot("s1")] }));
    await store.flush();
    expect(store.getStatus()).toEqual({ saving: false, failed: true });
    error.mockRestore();
  });

  it("avisa quem está ouvindo", () => {
    const store = createStudioStore(initial, async () => {});
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    store.update((s) => ({ ...s, slots: [slot("s1")] }));
    expect(listener).toHaveBeenCalled();
    stop();
    listener.mockClear();
    store.update((s) => ({ ...s, slots: [] }));
    expect(listener).not.toHaveBeenCalled();
  });
});
