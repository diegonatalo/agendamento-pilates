import type { Browser, Page } from "@playwright/test";
import { expect, saved, test } from "./fixtures";

// Planos e configurações com a mesma conta em dois aparelhos.

const warning = (page: Page) => page.getByRole("alert").filter({ hasText: "mudou em outro aparelho" });

const secondDevice = async (page: Page, browser: Browser, baseURL: string, url: string) => {
  const context = await browser.newContext({ baseURL, storageState: await page.context().storageState() });
  const other = await context.newPage();
  await other.goto(url);
  return { context, other };
};

const name = (page: Page) => page.getByLabel("Nome", { exact: true });
const amount = (page: Page) => page.getByLabel("Mensalidade (R$)");

const addPlan = async (page: Page) => {
  await page.goto("/app/planos");
  await name(page).fill("Plano dos dois aparelhos");
  await amount(page).fill("200");
  await page.getByRole("button", { name: "Adicionar plano" }).click();
  await saved(page);
};

const editPlan = async (page: Page) => {
  await page.getByRole("button", { name: /Editar plano/ }).click();
  await expect(name(page)).toHaveValue("Plano dos dois aparelhos");
};

const savePlan = (page: Page) => page.getByRole("button", { name: "Salvar plano" }).click();

test("mudar o nome do plano numa tela desatualizada mantém o preço que o outro salvou", async ({ page, browser, baseURL }) => {
  await addPlan(page);
  const { context, other } = await secondDevice(page, browser, baseURL!, "/app/planos");
  await editPlan(other);

  await editPlan(page);
  await amount(page).fill("250");
  await savePlan(page);
  await saved(page);

  await name(other).fill("Plano renomeado");
  await savePlan(other);
  await saved(other);

  await page.reload();
  await page.getByRole("button", { name: /Editar plano/ }).click();
  await expect(name(page)).toHaveValue("Plano renomeado");
  await expect(amount(page)).toHaveValue("250");
  await context.close();
});

test("o mesmo preço mudado nos dois avisa em vez de sobrescrever", async ({ page, browser, baseURL }) => {
  await addPlan(page);
  const { context, other } = await secondDevice(page, browser, baseURL!, "/app/planos");
  await editPlan(other);

  await editPlan(page);
  await amount(page).fill("250");
  await savePlan(page);
  await saved(page);

  await amount(other).fill("300");
  await savePlan(other);
  await expect(warning(other)).toBeVisible();

  await page.reload();
  await editPlan(page);
  await expect(amount(page)).toHaveValue("250");
  await context.close();
});

test("plano apagado num aparelho não volta pelo outro", async ({ page, browser, baseURL }) => {
  await addPlan(page);
  const { context, other } = await secondDevice(page, browser, baseURL!, "/app/planos");
  await editPlan(other);

  await page.getByRole("button", { name: /Excluir plano/ }).click();
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();
  await saved(page);

  await amount(other).fill("300");
  await savePlan(other);
  await expect(warning(other)).toBeVisible();

  await page.reload();
  await expect(page.getByText("Nenhum plano cadastrado ainda.")).toBeVisible();
  await context.close();
});

test("mudar a duração numa tela desatualizada mantém as vagas que o outro salvou", async ({ page, browser, baseURL }) => {
  await page.goto("/app/horarios");
  const capacity = (device: Page) => device.getByLabel("Alunos por horário");
  const duration = (device: Page) => device.getByLabel(/^Duração de cada/);
  await expect(capacity(page)).toBeVisible();
  const { context, other } = await secondDevice(page, browser, baseURL!, "/app/horarios");
  await expect(capacity(other)).toBeVisible();

  const save = async (device: Page) => {
    await device.getByRole("button", { name: "Salvar configurações" }).click();
    await saved(device);
  };
  await capacity(page).fill("9");
  await save(page);
  await duration(other).fill("75");
  await save(other);

  await page.reload();
  await expect(capacity(page)).toHaveValue("9");
  await expect(duration(page)).toHaveValue("75");
  await context.close();
});
