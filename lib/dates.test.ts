import { describe, expect, it } from "vitest";
import { toDateKey } from "@/lib/dates";

describe("toDateKey", () => {
  it("formata a data local com zeros à esquerda", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("usa o dia local, não o UTC", () => {
    expect(toDateKey(new Date(2026, 11, 31, 23, 30))).toBe("2026-12-31");
  });
});
