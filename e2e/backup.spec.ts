import { expect, test } from "@playwright/test";
import { createSlots, createStudent } from "./fixtures";

test("baixa o backup, apaga tudo e restaura os dados", async ({ page }, testInfo) => {
  await createSlots(page);
  await createStudent(page, "Bruno Backup");

  await page.goto("/backup");
  await expect(page.getByText("Você ainda não fez nenhum backup.")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Baixar backup" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^agenda-pilates-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  await expect(page.getByText(/^Último backup:/)).toBeVisible();

  // Simula trocar de aparelho: o navegador fica sem nenhum dado.
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/alunos");
  await expect(page.getByText("Nenhum aluno cadastrado ainda.")).toBeVisible();

  await page.goto("/backup");
  await page.getByLabel("Arquivo de backup (.json)").setInputFiles(file);
  await expect(page.getByText(/1 alunos/)).toBeVisible();
  await page.getByRole("button", { name: "Substituir dados atuais" }).click();
  await expect(page.getByRole("status")).toHaveText("Backup restaurado.");

  await page.goto("/alunos");
  await expect(page.getByText("Bruno Backup")).toBeVisible();
});

test("recusa um arquivo que não é backup", async ({ page }) => {
  await page.goto("/backup");
  await page.getByLabel("Arquivo de backup (.json)").setInputFiles({
    name: "qualquer.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"nada": true}'),
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "não é um backup do Agenda Pilates" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Substituir dados atuais" })).toHaveCount(0);
});
