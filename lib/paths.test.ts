import { describe, expect, it } from "vitest";
import { paths, signInPath } from "@/lib/paths";

describe("signInPath", () => {
  it("guarda a página de origem para voltar depois de entrar", () => {
    expect(signInPath("/app/alunos?x=1")).toBe("/entrar?de=%2Fapp%2Falunos%3Fx%3D1");
  });

  it("sem origem, ou vindo do início do app, é só a tela de entrar", () => {
    expect(signInPath()).toBe(paths.signIn);
    expect(signInPath("/app")).toBe(paths.signIn);
  });
});
