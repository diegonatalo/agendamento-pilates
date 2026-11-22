import { chooseBusiness, createSlots, createStudent, expect, signUpByApi, test } from "./fixtures";

// Aparelho dividido: A deixou uma aba aberta e B entrou em outra.

test("a ficha editada na aba de A não é gravada na conta de B", async ({ page, baseURL }) => {
  await createSlots(page);
  await createStudent(page, "Aluno da conta A");
  await page.getByRole("button", { name: /Aluno da conta A/ }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Aluno editado na aba A");

  await page.context().clearCookies();
  await signUpByApi(page.request, baseURL!);
  const other = await page.context().newPage();
  await chooseBusiness(other);

  await page.getByRole("button", { name: "Salvar aluno" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Não foi possível salvar" })).toBeVisible();

  await other.goto("/app/alunos");
  await expect(other.getByRole("heading", { name: "Alunos", level: 1 })).toBeVisible();
  await expect(other.getByText("Aluno editado na aba A")).toHaveCount(0);
});

test("excluir conta na aba de A não apaga a conta de B", async ({ page, baseURL }) => {
  await page.goto("/app/conta");
  await page.getByRole("button", { name: "Excluir conta" }).click();

  await page.context().clearCookies();
  await signUpByApi(page.request, baseURL!);
  const other = await page.context().newPage();
  await chooseBusiness(other);

  await page.getByRole("button", { name: "Excluir para sempre" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Outra conta entrou" })).toBeVisible();

  await other.reload();
  await expect(other.getByRole("heading", { name: "Agenda", level: 1 })).toBeVisible();
});
