import { expect, test } from "@playwright/test";
import { createSlots, createStudent } from "./fixtures";

test("cadastra um aluno num horário e mantém depois de recarregar", async ({ page }) => {
  await createSlots(page);
  await createStudent(page, "Ana Teste");

  const list = page.getByRole("list").filter({ hasText: "Ana Teste" });
  await expect(list).toBeVisible();

  await page.reload();
  await expect(page.getByText("Ana Teste")).toBeVisible();

  // A ficha guarda o horário marcado.
  await page.getByRole("button", { name: /Ana Teste/ }).click();
  await expect(
    page.getByRole("group", { name: "Horários fixos" }).getByRole("checkbox").first(),
  ).toBeChecked();
});

test("não salva aluno sem nome", async ({ page }) => {
  await page.goto("/app/alunos");
  await page.getByRole("button", { name: "Novo aluno" }).click();
  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByText("Informe o nome do aluno.")).toBeVisible();
});
