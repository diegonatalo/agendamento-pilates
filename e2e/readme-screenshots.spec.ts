import type { Page } from "@playwright/test";
import { PASSWORD, expect, saved, test } from "./fixtures";

// Gera os prints do README em docs/screenshots/, com um estúdio de pilates fictício.
// O `shots` do readme-kit não serve aqui porque não faz login. Fica fora da suíte normal:
// rode com `README_SHOTS=1 pnpm test:e2e e2e/readme-screenshots.spec.ts` e depois o `build` do readme-kit.
test.skip(!process.env.README_SHOTS, "só com README_SHOTS=1");
test.use({
  colorScheme: "light",
  viewport: { width: 1440, height: 900 },
  // Os campos de data seguem o idioma do navegador, não o `locale` da página.
  launchOptions: { args: ["--lang=pt-BR", "--accept-lang=pt-BR"], env: { ...process.env, LANG: "pt_BR.UTF-8" } as Record<string, string> },
});

const DIR = "docs/screenshots";

/** Segunda de manhã, depois do dia 10: a agenda cheia e quem não pagou aparece em atraso. */
const NOW = new Date("2026-11-23T09:30:00-03:00");

const PLANS = [
  { frequency: "1", price: "180" },
  { frequency: "2", price: "280" },
  { frequency: "3", price: "360" },
];

type Sample = { name: string; slots: string[]; paid: boolean; attention?: string };

/** O plano de cada um é o número de horários fixos. */
const STUDENTS: Sample[] = [
  { name: "Ana Clara Mendes", slots: ["Terça, 08:00", "Sábado, 09:00"], paid: false },
  { name: "Beatriz Lima", slots: ["Segunda, 08:00", "Quarta, 08:00"], paid: true },
  { name: "Carlos Ferreira", slots: ["Segunda, 09:00"], paid: true, attention: "Evitar flexão profunda do joelho." },
  {
    name: "Fernanda Souza",
    slots: ["Segunda, 18:00", "Terça, 18:00", "Quinta, 18:00"],
    paid: true,
    attention: "Pausas mais longas entre as séries.",
  },
  {
    name: "Helena Prado",
    slots: ["Segunda, 07:00", "Quarta, 07:00"],
    paid: true,
    attention: "Sem roll up. Preferir variações com apoio na coluna.",
  },
  {
    name: "Juliana Castro",
    slots: ["Segunda, 08:00", "Quinta, 08:00"],
    paid: true,
    attention: "Sem apoio sobre as mãos por enquanto.",
  },
  { name: "Lucas Andrade", slots: ["Terça, 07:00", "Quinta, 07:00"], paid: false },
  { name: "Marina Okada", slots: ["Segunda, 08:00", "Sexta, 07:00"], paid: true },
  { name: "Patrícia Nunes", slots: ["Segunda, 18:00", "Quarta, 18:00"], paid: true },
  { name: "Rafael Monteiro", slots: ["Segunda, 07:00"], paid: true, attention: "Cuidado com agachamento profundo." },
  { name: "Sofia Martins", slots: ["Segunda, 19:00", "Quarta, 19:00"], paid: false },
  { name: "Thiago Ribeiro", slots: ["Terça, 18:00", "Quinta, 18:00", "Sexta, 18:00"], paid: false },
];

const addPlans = async (page: Page) => {
  await page.goto("/app/planos");
  for (const { frequency, price } of PLANS) {
    await page.getByLabel("Nome", { exact: true }).fill(`${frequency}x por semana`);
    await page.getByLabel("Aulas por semana").selectOption(frequency);
    await page.getByLabel("Mensalidade (R$)").fill(price);
    await page.getByRole("button", { name: "Adicionar plano" }).click();
    await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("");
  }
  await saved(page);
};

const addSlots = async (page: Page) => {
  await page.goto("/app/horarios");
  const create = page.getByRole("button", { name: /^Criar \d+ horários?$/ });

  // Segunda a sexta, de manhã e no fim do dia.
  await page.getByRole("checkbox", { name: "Pausa (almoço)" }).check();
  await page.getByLabel("Pausa das").fill("10:00");
  await page.locator("#slot-config").getByLabel("Até", { exact: true }).fill("17:00");
  await create.click();
  await saved(page);

  // Sábado, só de manhã.
  await page.getByRole("checkbox", { name: "Pausa (almoço)" }).uncheck();
  const days = page.getByRole("group", { name: "Dias de atendimento" });
  for (const day of ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]) {
    await days.getByRole("button", { name: day }).click();
  }
  await page.getByLabel("Abre às").fill("08:00");
  await page.getByLabel("Fecha às").fill("10:00");
  await create.click();
  await saved(page);

  await page.getByLabel("De", { exact: true }).fill("2026-12-24");
  await page.getByLabel(/^Até\s*Deixe vazio/).fill("2026-12-26");
  await page.getByLabel("Motivo").fill("Natal");
  await page.getByRole("button", { name: "Bloquear datas" }).click();
  await saved(page);
};

const addStudents = async (page: Page) => {
  await page.goto("/app/alunos");
  for (const { name, slots, attention } of STUDENTS) {
    await page.getByRole("button", { name: "Novo aluno" }).click();
    await page.getByLabel("Nome", { exact: true }).fill(name);
    const fixed = page.getByRole("group", { name: "Horários fixos" });
    for (const slot of slots) await fixed.getByRole("checkbox", { name: new RegExp(`^${slot}`) }).check();
    if (attention) await page.getByLabel(/Exercícios com desconforto/).fill(attention);
    await page.getByRole("checkbox", { name: "Cobrar mensalidade" }).check();
    const plan = PLANS[slots.length - 1];
    // O rótulo envolve o select, então o texto das opções entraria num getByLabel exato.
    const planSelect = page.getByRole("group", { name: "Mensalidade" }).getByRole("combobox");
    const option = planSelect.locator("option", { hasText: `${plan.frequency}x por semana` });
    await planSelect.selectOption((await option.getAttribute("value"))!);
    await page.getByLabel("Dia de vencimento").fill("10");
    await page.getByRole("button", { name: "Salvar aluno" }).click();
    await expect(page.getByRole("heading", { name: "Alunos", level: 1 })).toBeVisible();
  }
  for (const { name, paid } of STUDENTS) {
    if (paid) await page.getByRole("button", { name: `marcar mensalidade de ${name} como paga` }).click();
  }
  await saved(page);
};

const markAttendance = async (page: Page) => {
  await page.goto("/app");
  for (const name of ["Helena Prado", "Rafael Monteiro"]) {
    await page.getByRole("button", { name: `Presente — ${name}` }).click();
  }
  await saved(page);
};

const capture = async (page: Page, path: string, heading: string, file: string) => {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${DIR}/${file}.png`, animations: "disabled" });
};

test("prints do README", async ({ page, browser, baseURL }) => {
  test.setTimeout(180_000);
  await page.clock.setFixedTime(NOW);

  await addPlans(page);
  await addSlots(page);
  await addStudents(page);
  await markAttendance(page);

  await capture(page, "/app", "Agenda", "agenda");
  await capture(page, "/app/alunos", "Alunos", "alunos");
  await capture(page, "/app/horarios", "Horários", "horarios");

  const phone = await browser.newContext({
    baseURL,
    storageState: await page.context().storageState(),
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });
  const phonePage = await phone.newPage();
  await phonePage.clock.setFixedTime(NOW);
  await capture(phonePage, "/app", "Agenda", "agenda-celular");
  await capture(phonePage, "/app/alunos", "Alunos", "alunos-celular");
  await phone.close();

  // A conta só existe para os prints: não fica sobrando no banco de desenvolvimento.
  await page.goto("/app/conta");
  await page.getByRole("button", { name: "Excluir conta" }).click();
  await page.getByLabel("Sua senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Excluir para sempre" }).click();
  await expect(page).toHaveURL("/");
});
