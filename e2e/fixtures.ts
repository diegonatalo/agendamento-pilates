import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";

export const PASSWORD = "senha-de-teste-123";

/** E-mail único por teste: cada um começa com uma conta nova e vazia. */
export const uniqueEmail = () =>
  `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@exemplo.test`;

/**
 * Cria uma conta pela API do Better Auth. A resposta já traz o cookie de
 * sessão, que fica no contexto do navegador do teste.
 */
export const signUpByApi = async (request: APIRequestContext, baseURL: string, email = uniqueEmail()) => {
  const response = await request.post("/api/auth/sign-up/email", {
    data: { name: "Estúdio de Teste", email, password: PASSWORD },
    headers: { origin: baseURL },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return email;
};

/**
 * Testes do app: cada um roda com uma conta nova, já logada. Para testar sem
 * login, use o `test` do próprio Playwright.
 */
export const test = base.extend({
  page: async ({ page, baseURL }, provide) => {
    await signUpByApi(page.request, baseURL!);
    await provide(page);
  },
});

export { expect };

/** Espera as mudanças chegarem ao banco (o app marca com `data-saving` o que ainda está salvando). */
export const saved = (page: Page) => expect(page.locator("[data-saving]")).toHaveCount(0);

/** Cria a grade com os valores padrão do gerador e espera ela chegar ao banco. */
export const createSlots = async (page: Page) => {
  await page.goto("/app/horarios");
  const create = page.getByRole("button", { name: /^Criar \d+ horários?$/ });
  await expect(create).toBeEnabled();
  await create.click();
  await expect(page.getByRole("main").getByRole("status")).toBeVisible();
  await saved(page);
};

/** Cadastra um aluno só com o nome, matriculado no primeiro horário da grade. */
export const createStudent = async (page: Page, name: string) => {
  await page.goto("/app/alunos");
  await page.getByRole("button", { name: "Novo aluno" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await page.getByRole("group", { name: "Horários fixos" }).getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByRole("heading", { name: "Alunos", level: 1 })).toBeVisible();
  await saved(page);
};
