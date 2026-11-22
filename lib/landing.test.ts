import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BUSINESS_ORDER } from "@/lib/business";
import { AUDIENCES, FAQ, FEATURES, SCREENSHOT, STEPS } from "@/lib/landing";
import { PHOTOS } from "@/lib/landing-photos";

describe("landing", () => {
  it("os prints existem em public/ e estão em WebP", () => {
    for (const src of [SCREENSHOT.light, SCREENSHOT.dark]) {
      expect(src).toMatch(/^\/landing\/.+\.webp$/);
      expect(existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
    }
  });

  it("tem 3 passos, de 3 a 6 recursos e de 3 a 5 perguntas, sem títulos repetidos", () => {
    expect(STEPS).toHaveLength(3);
    expect(FEATURES.length).toBeGreaterThanOrEqual(3);
    expect(FEATURES.length).toBeLessThanOrEqual(6);
    expect(FAQ.length).toBeGreaterThanOrEqual(3);
    expect(FAQ.length).toBeLessThanOrEqual(5);
    for (const titles of [STEPS.map((s) => s.title), FEATURES.map((f) => f.title), FAQ.map((f) => f.question)]) {
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("cada foto está no projeto, em WebP leve, com descrição, autor e origem", () => {
    for (const photo of Object.values(PHOTOS)) {
      expect(photo.src).toMatch(/^\/landing\/photos\/.+\.webp$/);
      const file = path.join(process.cwd(), "public", photo.src);
      expect(existsSync(file), photo.src).toBe(true);
      expect(statSync(file).size, photo.src).toBeLessThan(250 * 1024);
      expect(photo.alt.length, photo.src).toBeGreaterThan(20);
      expect(photo.author, photo.src).not.toBe("");
      expect(photo.source, photo.src).toMatch(/^https:\/\/unsplash\.com\/photos\//);
    }
  });

  it("todo ramo tem foto, e toda foto aparece em um ramo", () => {
    for (const audience of AUDIENCES) expect(audience.photos.length, audience.type).toBeGreaterThan(0);
    expect(AUDIENCES.flatMap((audience) => audience.photos).sort()).toEqual(Object.keys(PHOTOS).sort());
  });

  it("tem um cartão para cada ramo, na ordem do app", () => {
    expect(AUDIENCES.map((a) => a.type)).toEqual(BUSINESS_ORDER);
  });
});
