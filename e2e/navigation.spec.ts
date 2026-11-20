import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/app", heading: "Agenda" },
  { path: "/app/alunos", heading: "Alunos" },
  { path: "/app/horarios", heading: "Horários" },
  { path: "/app/planos", heading: "Planos" },
  { path: "/app/backup", heading: "Backup" },
];

for (const { path, heading } of PAGES) {
  test(`abre ${path} sem erros no console`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("endereço desconhecido mostra a página 404", async ({ page }) => {
  const response = await page.goto("/nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  await page.getByRole("link", { name: "Abrir a agenda" }).click();
  await expect(page.getByRole("heading", { name: "Agenda", level: 1 })).toBeVisible();
});

const collectErrors = (page: import("@playwright/test").Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

test("a página inicial apresenta o app e leva à agenda", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/agenda do estúdio/);
  await page.getByRole("main").getByRole("link", { name: "Abrir a agenda" }).click();
  await expect(page).toHaveURL("/app");
  await expect(page.getByRole("heading", { name: "Agenda", level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("os endereços antigos redirecionam para /app", async ({ request }) => {
  for (const path of ["/alunos", "/planos", "/horarios", "/backup"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(response.headers().location, path).toBe(`/app${path}`);
  }
});

for (const { path, heading } of [
  { path: "/privacidade", heading: "Privacidade" },
  { path: "/termos", heading: "Termos de uso" },
]) {
  test(`abre ${path} pelo rodapé sem erros no console`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: heading }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("o termo de consentimento abre pela tela de alunos", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/app/alunos");
  await page.getByRole("link", { name: "termo de consentimento" }).click();
  await expect(page).toHaveURL("/termos/consentimento");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Termo de consentimento/);
  await expect(page.getByRole("button", { name: "Imprimir o termo" })).toBeVisible();
  expect(errors).toEqual([]);
});
