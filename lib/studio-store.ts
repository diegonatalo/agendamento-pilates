import { countChanges, diffStudio, type StudioChanges, type StudioState } from "@/lib/studio-changes";

/** `conflict`: another device changed the same data, and nothing of the batch was saved. */
export type SaveResult = "saved" | "conflict";

/** Where each change goes. In the app it is the `saveChanges` Server Action. */
export type SaveChanges = (changes: StudioChanges) => Promise<SaveResult | void>;

export type SyncStatus = { saving: boolean; failed: boolean; conflict: boolean };

/**
 * The account's data in memory, saved in the background. `update` changes the
 * screen at once and sends only what changed; saves go one after another, in
 * the order they happened, so a later change never lands before an earlier one.
 * If a save fails the status says so, and the next visit reloads from the database.
 */
export const createStudioStore = (initial: StudioState, save: SaveChanges) => {
  let state = initial;
  let status: SyncStatus = { saving: false, failed: false, conflict: false };
  let pending = 0;
  let queue: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());

  const setStatus = (next: SyncStatus) => {
    if (next.saving === status.saving && next.failed === status.failed && next.conflict === status.conflict) return;
    status = next;
    notify();
  };

  const update = (change: (current: StudioState) => StudioState) => {
    const next = change(state);
    const changes = diffStudio(state, next);
    state = next;
    notify();
    if (countChanges(changes) === 0) return;
    pending += 1;
    setStatus({ ...status, saving: true });
    queue = queue
      .then(() => save(changes))
      .then((result) => {
        if (result === "conflict") status = { ...status, conflict: true };
      })
      .catch((error: unknown) => {
        console.error(error);
        status = { ...status, failed: true };
      })
      .finally(() => {
        pending -= 1;
        setStatus({ ...status, saving: pending > 0 });
        notify();
      });
  };

  return {
    getState: () => state,
    getStatus: () => status,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update,
    /** Resolves when every change made so far has been saved (or failed). */
    flush: () => queue,
  };
};

export type StudioStore = ReturnType<typeof createStudioStore>;
