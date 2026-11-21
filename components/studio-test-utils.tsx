import { render } from "@testing-library/react";
import { useContext, useEffect, type ReactElement } from "react";
import { StudioProvider } from "@/components/studio-provider";
import { StudioContext } from "@/hooks/use-studio";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { StudioChanges, StudioState } from "@/lib/studio-changes";
import type { StudioStore } from "@/lib/studio-store";

/**
 * Helpers for component tests: the screens read the studio from
 * <StudioProvider>, which here starts from `seed` and saves to memory.
 */

export type StudioKey = keyof StudioState;

const empty = (): StudioState => ({
  settings: DEFAULT_SETTINGS,
  lastBackup: null,
  plans: [],
  slots: [],
  students: [],
  bookings: [],
  blockedPeriods: [],
  payments: [],
});

let initial = empty();
let store: StudioStore | null = null;
let sent: StudioChanges[] = [];

/** Starts every test from an empty studio. */
export const resetStudio = () => {
  initial = empty();
  store = null;
  sent = [];
};

/** Data the studio already has when the screen opens. */
export const seed = (key: StudioKey, value: unknown) => {
  initial = { ...initial, [key]: value };
};

const Capture = () => {
  const current = useContext(StudioContext);
  useEffect(() => {
    store = current;
  }, [current]);
  return null;
};

export const renderStudio = (ui: ReactElement) =>
  render(
    <StudioProvider
      initialData={initial}
      account={{ name: "Pessoa de Teste", email: "teste@exemplo.test" }}
      save={async (changes) => {
        sent.push(changes);
      }}
    >
      <Capture />
      {ui}
    </StudioProvider>,
  );

/** The studio data after the test's actions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tests read any list
export const stored = (key: StudioKey): any => (store ? store.getState() : initial)[key];

/** Every batch of changes the screen sent to be saved. */
export const savedChanges = () => sent;
