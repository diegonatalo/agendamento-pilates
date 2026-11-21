import { screen, waitFor } from "@testing-library/react";
import { renderStudio, resetStudio, seed, stored, type StudioKey } from "@/components/studio-test-utils";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackupScreen } from "@/components/backup-screen";
import { buildBackup, type StudioData } from "@/lib/backup";
import { createEmptyStudent } from "@/lib/students";

const student = { ...createEmptyStudent("a", "2026-01-10"), name: "Ana" };

const fileOf = (data: StudioData) =>
  new File([JSON.stringify(buildBackup(data, "2026-11-09T12:00:00.000Z"))], "b.json", {
    type: "application/json",
  });

const read = (key: StudioKey) => stored(key);

describe("BackupScreen", () => {
  beforeEach(() => {
    resetStudio();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("avisa que o arquivo tem dados sensíveis e que ainda não há backup", () => {
    renderStudio(<BackupScreen />);
    expect(screen.getByText(/dados de saúde e contato/)).toBeInTheDocument();
    expect(screen.getByText("Você ainda não fez nenhum backup.")).toBeInTheDocument();
  });

  it("só libera o download depois de confirmar o aviso de dados de saúde", async () => {
    const user = userEvent.setup();
    renderStudio(<BackupScreen />);
    const download = screen.getByRole("button", { name: "Baixar backup" });
    await waitFor(() => expect(screen.getByText("Você ainda não fez nenhum backup.")).toBeInTheDocument());
    expect(download).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /Entendi que o arquivo tem dados de saúde/ }));
    expect(download).toBeEnabled();
  });

  it("baixa o backup com os dados atuais e registra a data", async () => {
    seed("students", [student]);
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((b: Blob | MediaSource) => {
      blob = b as Blob;
      return "blob:fake";
    });
    URL.revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const user = userEvent.setup();
    renderStudio(<BackupScreen />);

    await user.click(screen.getByRole("checkbox", { name: /Entendi que o arquivo tem dados de saúde/ }));
    await user.click(screen.getByRole("button", { name: "Baixar backup" }));

    expect(click).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(await blob!.text());
    expect(saved).toMatchObject({ app: "agenda-pilates", version: 3 });
    expect(saved.data.students).toHaveLength(1);
    expect(saved.data.students[0].name).toBe("Ana");
    expect(read("lastBackup")).toBe("2026-11-09");
    expect(screen.getByText("Último backup: 09/11/2026.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Backup baixado/);
  });

  it("restaura um backup válido só depois de confirmar", async () => {
    seed("students", [{ ...student, id: "old", name: "Antiga" }]);
    const data: StudioData = {
      settings: { sessionMinutes: 60, breakMinutes: 0, capacity: 3 },
      plans: [{ id: "p1", name: "2x por semana", weeklyClasses: 2, amount: 280 }],
      slots: [{ id: "s1", weekday: 1, startTime: "08:00" }],
      students: [student],
      bookings: [],
      blockedPeriods: [],
      payments: [],
    };
    const user = userEvent.setup();
    renderStudio(<BackupScreen />);

    await user.upload(screen.getByLabelText(/Arquivo de backup/), fileOf(data));
    expect(await screen.findByText(/1 alunos, 1 planos,\s+1 horários/)).toBeInTheDocument();
    expect(read("students")[0].name).toBe("Antiga");

    await user.click(screen.getByRole("button", { name: "Substituir dados atuais" }));

    expect(read("students")).toEqual([student]);
    expect(read("slots")).toEqual(data.slots);
    expect(read("plans")).toEqual(data.plans);
    expect(read("settings")).toEqual(data.settings);
    expect(screen.getByRole("status")).toHaveTextContent("Backup restaurado.");
  });

  it("cancelar não altera os dados atuais", async () => {
    seed("students", [student]);
    const data: StudioData = {
      settings: { sessionMinutes: 60, breakMinutes: 0, capacity: 3 },
      plans: [],
      slots: [],
      students: [],
      bookings: [],
      blockedPeriods: [],
      payments: [],
    };
    const user = userEvent.setup();
    renderStudio(<BackupScreen />);
    await user.upload(screen.getByLabelText(/Arquivo de backup/), fileOf(data));
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(read("students")).toEqual([student]);
    expect(screen.queryByRole("button", { name: "Substituir dados atuais" })).not.toBeInTheDocument();
  });

  it("recusa um arquivo inválido sem mexer nos dados", async () => {
    seed("students", [student]);
    const user = userEvent.setup();
    renderStudio(<BackupScreen />);
    await user.upload(
      screen.getByLabelText(/Arquivo de backup/),
      new File(["não é json"], "x.json", { type: "application/json" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("O arquivo não é um JSON válido."),
    );
    expect(read("students")).toEqual([student]);
  });
});
