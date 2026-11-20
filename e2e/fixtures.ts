import { expect, type Page } from "@playwright/test";

/** Cria a grade com os valores padrão do gerador e devolve quantos horários surgiram. */
export const createSlots = async (page: Page) => {
  await page.goto("/app/horarios");
  const create = page.getByRole("button", { name: /^Criar \d+ horários?$/ });
  await expect(create).toBeEnabled();
  await create.click();
  await expect(page.getByRole("status")).toBeVisible();
};

/** Cadastra um aluno só com o nome, matriculado no primeiro horário da grade. */
export const createStudent = async (page: Page, name: string) => {
  await page.goto("/app/alunos");
  await page.getByRole("button", { name: "Novo aluno" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await page
    .getByRole("group", { name: "Horários fixos" })
    .getByRole("checkbox")
    .first()
    .check();
  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByRole("heading", { name: "Alunos", level: 1 })).toBeVisible();
};
