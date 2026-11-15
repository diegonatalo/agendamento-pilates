import { describe, expect, it } from "vitest";
import { newId } from "@/lib/ids";

describe("newId", () => {
  it("gera ids únicos no formato UUID", () => {
    const ids = new Set(Array.from({ length: 50 }, newId));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
