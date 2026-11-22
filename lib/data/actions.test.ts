import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyStudent } from "@/lib/students";
import { emptyChanges } from "@/lib/studio-changes";

const transaction = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ db: { transaction } }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => ({ id: "u1" }) }));

import { saveChanges } from "./actions";
import { studentToRow } from "./rows";

const base = { ...createEmptyStudent("a", "2026-01-01"), name: "Ana" };

beforeEach(() => {
  transaction.mockReset();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("saveChanges", () => {
  it("não leva os valores da ficha para o erro nem para o log", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("Failed query: insert\nparams: hérnia de disco", { cause: { code: "40001" } });
    transaction.mockRejectedValue(failure);

    const error = await saveChanges("u1", emptyChanges()).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain("hérnia");
    expect((error as Error).cause).toBeUndefined();
    const logged = log.mock.calls.flat().map(String).join(" ");
    expect(logged).not.toContain("hérnia");
    expect(logged).toContain("40001");
  });

  it("devolve conflito sem gravar quando o campo mudou no banco", async () => {
    const insert = vi.fn();
    const locked = [studentToRow("u1", { ...base, goals: "do outro aparelho" })];
    const select = () => ({ from: () => ({ where: () => ({ orderBy: () => ({ for: async () => locked }) }) }) });
    transaction.mockImplementation((run: (tx: unknown) => unknown) => run({ select, insert }));

    const changes = emptyChanges();
    changes.upsert.students.push({ ...base, goals: "deste aparelho" });
    changes.baseStudents.push(base);

    expect(await saveChanges("u1", changes)).toBe("conflict");
    expect(insert).not.toHaveBeenCalled();
  });
});
