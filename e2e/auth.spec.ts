import { expect, test } from "@playwright/test";
import { PASSWORD, chooseBusiness, createSlots, createStudent, saved, signUpByApi, uniqueEmail } from "./fixtures";

const title = (page: import("@playwright/test").Page, name: string) =>
  page.getByRole("heading", { name, level: 1 });

const signIn = async (page: import("@playwright/test").Page, email: string, password = PASSWORD) => {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
};

test("sem login, o app manda para entrar e volta para a página pedida depois", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await chooseBusiness(page);
  await page.context().clearCookies();

  await page.goto("/app/alunos");
  await expect(page).toHaveURL("/entrar?de=%2Fapp%2Falunos");
  await signIn(page, email);
  await expect(page).toHaveURL("/app/alunos");
  await expect(title(page, "Alunos")).toBeVisible();
});

test("cria a conta pela tela, os dados ficam na conta e voltam ao entrar de novo", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Estúdio da Ana");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL("/app");
  await expect(title(page, "Boas-vindas ao Encaixe")).toBeVisible();
  await chooseBusiness(page);

  await createSlots(page);
  await createStudent(page, "Aluna da Ana");

  await page.goto("/app/conta");
  await expect(page.getByText(email)).toBeVisible();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/app");
  await expect(page).toHaveURL("/entrar");

  await signIn(page, email);
  await expect(page).toHaveURL("/app");
  await page.goto("/app/alunos");
  await expect(page.getByText("Aluna da Ana")).toBeVisible();
});

test("senha errada mostra o erro e não entra", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();
  await page.goto("/entrar");
  await signIn(page, email, "senha-errada-000");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
  await expect(page).toHaveURL("/entrar");
});

test("não cria duas contas com o mesmo e-mail", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await page.context().clearCookies();
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Outro estúdio");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Já existe uma conta com esse e-mail");
});

test("uma conta não vê os alunos de outra", async ({ browser, baseURL }) => {
  const ana = await browser.newContext({ baseURL });
  const anaPage = await ana.newPage();
  await signUpByApi(anaPage.request, baseURL!);
  await chooseBusiness(anaPage);
  await createSlots(anaPage);
  await createStudent(anaPage, "Só da Ana");

  const bia = await browser.newContext({ baseURL });
  const biaPage = await bia.newPage();
  await signUpByApi(biaPage.request, baseURL!);
  await chooseBusiness(biaPage);
  await biaPage.goto("/app/alunos");
  await expect(biaPage.getByText("Nenhum aluno cadastrado ainda.")).toBeVisible();
  await expect(biaPage.getByText("Só da Ana")).toHaveCount(0);

  await ana.close();
  await bia.close();
});

test("excluir a conta apaga tudo e não deixa entrar de novo", async ({ page, baseURL }) => {
  const email = await signUpByApi(page.request, baseURL!);
  await chooseBusiness(page);
  await createSlots(page);
  await createStudent(page, "Aluna que some");
  await page.goto("/app/conta");
  await page.getByRole("button", { name: "Excluir conta" }).click();
  await page.getByLabel("Sua senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Excluir para sempre" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/entrar");
  await signIn(page, email);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("E-mail ou senha incorretos.");
});

test("o ramo escolhido muda os nomes do app e fica salvo na conta", async ({ page, baseURL }) => {
  await signUpByApi(page.request, baseURL!);
  await chooseBusiness(page, /Psicólogo/);
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Pacientes" }).click();
  await expect(title(page, "Pacientes")).toBeVisible();

  await page.goto("/app/conta");
  await page.getByRole("radio", { name: /Barbearia/ }).check();
  await page.getByRole("button", { name: "Trocar o tipo de negócio" }).click();
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Clientes" })).toBeVisible();

  await saved(page);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Clientes" })).toBeVisible();
});

test("excluir a conta com a senha errada não apaga nada", async ({ page, baseURL }) => {
  await signUpByApi(page.request, baseURL!);
  await page.goto("/app/conta");
  await page.getByRole("button", { name: "Excluir conta" }).click();
  await page.getByLabel("Sua senha").fill("senha-errada-123");
  await page.getByRole("button", { name: "Excluir para sempre" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Senha incorreta. A conta não foi excluída.");

  await page.reload();
  await expect(page.getByRole("button", { name: "Excluir conta" })).toBeVisible();
});
