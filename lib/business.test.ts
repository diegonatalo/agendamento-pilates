import { describe, expect, it } from "vitest";
import { BUSINESSES, BUSINESS_ORDER, businessOf, countOf, pickBusiness } from "@/lib/business";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { validateSettings } from "@/lib/settings";

describe("business", () => {
  it("lista os cinco ramos, cada um com o próprio tipo", () => {
    expect(BUSINESS_ORDER).toHaveLength(5);
    for (const type of BUSINESS_ORDER) expect(BUSINESSES[type].type).toBe(type);
  });

  it("as configurações sugeridas de cada ramo são válidas", () => {
    for (const type of BUSINESS_ORDER) {
      expect(validateSettings({ ...BUSINESSES[type].defaults, businessType: type }, []), type).toBeNull();
    }
  });

  it("conta sem ramo escolhido usa o vocabulário de pilates", () => {
    expect(businessOf(DEFAULT_SETTINGS).client.Many).toBe("Alunos");
    expect(businessOf({ businessType: "psychology" }).client.Many).toBe("Pacientes");
    expect(businessOf({ businessType: "barber" }).session.many).toBe("atendimentos");
  });

  it("conta no singular e no plural", () => {
    const { session } = BUSINESSES.psychology;
    expect(countOf(1, session)).toBe("1 sessão");
    expect(countOf(3, session)).toBe("3 sessões");
  });

  it("ao escolher o ramo com a grade vazia, aplica a duração e as vagas sugeridas", () => {
    expect(pickBusiness(DEFAULT_SETTINGS, "psychology", false)).toEqual({
      businessType: "psychology",
      sessionMinutes: 50,
      breakMinutes: 10,
      capacity: 1,
    });
  });

  it("com horários já criados, só troca o ramo", () => {
    const current = { ...DEFAULT_SETTINGS, businessType: "pilates" as const };
    expect(pickBusiness(current, "barber", true)).toEqual({ ...current, businessType: "barber" });
  });
});
