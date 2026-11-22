import type { Browser, Page } from "@playwright/test";
import { createSlots, createStudent, expect, saved, test } from "./fixtures";

// A mesma conta em dois aparelhos: o segundo abriu a ficha antes de o primeiro salvar.

const NAME = "Aluno dos dois aparelhos";

const openRecord = async (page: Page) => {
  await page.getByRole("button", { name: new RegExp(NAME) }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(NAME);
};

const secondDevice = async (page: Page, browser: Browser, baseURL: string) => {
  await createSlots(page);
  await createStudent(page, NAME);
  const context = await browser.newContext({ baseURL, storageState: await page.context().storageState() });
  const other = await context.newPage();
  await other.goto("/app/alunos");
  await openRecord(other);
  await openRecord(page);
  return { context, other };
};

const save = (page: Page) => page.getByRole("button", { name: "Salvar aluno" }).click();

test("editar outro campo num aparelho desatualizado não apaga o que o primeiro salvou", async ({ page, browser, baseURL }) => {
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await page.getByLabel("Telefone (com DDD)").fill("11 91234-5678");
  await save(page);
  await saved(page);

  await other.getByLabel("Objetivos").fill("Fortalecer as costas");
  await save(other);
  await saved(other);

  await page.reload();
  await openRecord(page);
  await expect(page.getByLabel("Telefone (com DDD)")).toHaveValue("11 91234-5678");
  await expect(page.getByLabel("Objetivos")).toHaveValue("Fortalecer as costas");
  await context.close();
});

test("o mesmo campo mudado nos dois avisa em vez de sobrescrever", async ({ page, browser, baseURL }) => {
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await page.getByLabel("Objetivos").fill("O que o primeiro salvou");
  await save(page);
  await saved(page);

  await other.getByLabel("Objetivos").fill("O que o segundo tentou");
  await save(other);
  await expect(other.getByRole("alert").filter({ hasText: "mudou em outro aparelho" })).toBeVisible();

  await page.reload();
  await openRecord(page);
  await expect(page.getByLabel("Objetivos")).toHaveValue("O que o primeiro salvou");
  await context.close();
});

test("ficha apagada num aparelho não volta pelo outro", async ({ page, browser, baseURL }) => {
  const { context, other } = await secondDevice(page, browser, baseURL!);
  await page.getByRole("button", { name: "Excluir aluno" }).click();
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();
  await saved(page);

  await other.getByLabel("Objetivos").fill("Edição numa ficha que não existe mais");
  await save(other);
  await expect(other.getByRole("alert").filter({ hasText: "mudou em outro aparelho" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Alunos", level: 1 })).toBeVisible();
  await expect(page.getByText(NAME)).toHaveCount(0);
  await context.close();
});
