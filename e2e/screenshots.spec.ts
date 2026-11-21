import { createSlots, createStudent, test } from "./fixtures";

// Gera os prints da landing em public/landing/, com alunos fictícios. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");

const STUDENTS = ["Ana Lima", "Bruno Costa", "Carla Souza"];

for (const scheme of ["light", "dark"] as const) {
  test(`print da agenda (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: scheme });
    await createSlots(page);
    for (const name of STUDENTS) await createStudent(page, name);
    await page.goto("/app");
    // Os alunos de exemplo ficam no primeiro horário da grade (segunda-feira) a partir de hoje.
    await page.getByRole("button", { name: "Próxima semana" }).click();
    await page.getByRole("button", { name: /^segunda/i }).first().click();
    await page.waitForTimeout(1_000);
    const name = scheme === "light" ? "agenda-claro" : "agenda-escuro";
    await page.screenshot({ path: `public/landing/${name}.png` });
  });
}
