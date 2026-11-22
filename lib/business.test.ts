import { describe, expect, it } from "vitest";
import { BUSINESSES, BUSINESS_ORDER, businessOf, countOf, enrolledOf, occupancyText, pickBusiness } from "@/lib/business";
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

describe("occupancyText", () => {
  it("com uma vaga, o horário é livre ou ocupado", () => {
    expect(occupancyText(0, 1, BUSINESSES.psychology)).toBe("horário livre");
    expect(occupancyText(1, 1, BUSINESSES.barber)).toBe("horário ocupado");
  });

  it("com mais vagas, conta as livres e concorda com o ramo quando lota", () => {
    expect(occupancyText(1, 3, BUSINESSES.pilates)).toBe("1/3 ocupadas · 2 vagas livres");
    expect(occupancyText(2, 3, BUSINESSES.pilates)).toBe("2/3 ocupadas · 1 vaga livre");
    expect(occupancyText(3, 3, BUSINESSES.pilates)).toBe("3/3 ocupadas · lotada");
    expect(occupancyText(2, 2, BUSINESSES.personal)).toBe("2/2 ocupadas · lotado");
  });

  it("depois de reduzir as vagas, continua lotado em vez de mostrar vaga negativa", () => {
    expect(occupancyText(3, 2, BUSINESSES.barber)).toBe("3/2 ocupadas · lotado");
    expect(occupancyText(2, 1, BUSINESSES.psychology)).toBe("2/1 ocupadas · lotada");
  });
});

describe("enrolledOf", () => {
  it("concorda com o número de vagas", () => {
    expect(enrolledOf(0, 1, BUSINESSES.psychology.client)).toBe("0/1 paciente fixo");
    expect(enrolledOf(1, 3, BUSINESSES.pilates.client)).toBe("1/3 alunos fixos");
  });
});
