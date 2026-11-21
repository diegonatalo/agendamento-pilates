import { createSlots, createStudent, expect, saved, signUpByApi, test } from "./fixtures";

test("baixa o backup e restaura os dados numa conta nova", async ({ page, browser, baseURL }, testInfo) => {
  await createSlots(page);
  await createStudent(page, "Bruno Backup");

  await page.goto("/app/conta");
  await expect(page.getByText("Você ainda não fez nenhum backup.")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("checkbox", { name: /Entendi que o arquivo tem dados de saúde/ })
      .check()
      .then(() => page.getByRole("button", { name: "Baixar backup" }).click()),
  ]);
  expect(download.suggestedFilename()).toMatch(/^encaixe-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  await expect(page.getByText(/^Último backup:/)).toBeVisible();

  // Outra conta, num navegador limpo: começa sem nenhum dado.
  const other = await browser.newContext({ baseURL });
  const fresh = await other.newPage();
  await signUpByApi(fresh.request, baseURL!);
  await fresh.goto("/app/alunos");
  await expect(fresh.getByText("Nenhum aluno cadastrado ainda.")).toBeVisible();

  await fresh.goto("/app/conta");
  await fresh.getByLabel("Arquivo de backup (.json)").setInputFiles(file);
  await expect(fresh.getByText(/1 alunos/)).toBeVisible();
  await fresh.getByRole("button", { name: "Substituir dados atuais" }).click();
  await expect(fresh.getByRole("main").getByRole("status")).toHaveText("Backup restaurado.");
  await saved(fresh);

  // Recarrega do banco: os dados restaurados ficaram na conta nova.
  await fresh.goto("/app/alunos");
  await expect(fresh.getByText("Bruno Backup")).toBeVisible();
  await other.close();
});

test("recusa um arquivo que não é backup", async ({ page }) => {
  await page.goto("/app/conta");
  await page.getByLabel("Arquivo de backup (.json)").setInputFiles({
    name: "qualquer.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"nada": true}'),
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "não é um backup do Encaixe" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Substituir dados atuais" })).toHaveCount(0);
});
