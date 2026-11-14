import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDateBr,
  formatDayMonth,
  isValidDateKey,
  parseDateKey,
  startOfWeek,
  toDateKey,
  weekdayOf,
} from "@/lib/dates";

describe("toDateKey", () => {
  it("formata a data local com zeros à esquerda", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("usa o dia local, não o UTC", () => {
    expect(toDateKey(new Date(2026, 11, 31, 23, 30))).toBe("2026-12-31");
  });
});

describe("parseDateKey", () => {
  it("é o inverso de toDateKey", () => {
    expect(toDateKey(parseDateKey("2026-03-09"))).toBe("2026-03-09");
  });
});

describe("isValidDateKey", () => {
  it("aceita datas reais", () => {
    expect(isValidDateKey("2026-02-28")).toBe(true);
    expect(isValidDateKey("2028-02-29")).toBe(true);
  });

  it("recusa formato errado e datas inexistentes", () => {
    expect(isValidDateKey("")).toBe(false);
    expect(isValidDateKey("10/11/2026")).toBe(false);
    expect(isValidDateKey("2026-02-31")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
  });
});

describe("addDays", () => {
  it("atravessa mês e ano", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("soma uma semana", () => {
    expect(addDays("2026-11-09", 7)).toBe("2026-11-16");
  });
});

describe("weekdayOf", () => {
  it("segue Date#getDay (0 = domingo)", () => {
    expect(weekdayOf("2026-11-09")).toBe(1);
    expect(weekdayOf("2026-11-15")).toBe(0);
  });
});

describe("startOfWeek", () => {
  it("volta para a segunda-feira", () => {
    expect(startOfWeek("2026-11-09")).toBe("2026-11-09");
    expect(startOfWeek("2026-11-12")).toBe("2026-11-09");
  });

  it("trata o domingo como último dia da semana", () => {
    expect(startOfWeek("2026-11-15")).toBe("2026-11-09");
  });
});

describe("formatação", () => {
  it("formata em dia/mês/ano e dia/mês", () => {
    expect(formatDateBr("2026-11-09")).toBe("09/11/2026");
    expect(formatDayMonth("2026-11-09")).toBe("09/11");
  });
});
