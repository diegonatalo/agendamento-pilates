import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackupScreen } from "@/components/backup-screen";
import { buildBackup, type StudioData } from "@/lib/backup";
import { createEmptyStudent } from "@/lib/students";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const student = { ...createEmptyStudent("a", "2026-01-10"), name: "Ana" };

const fileOf = (data: StudioData) =>
  new File([JSON.stringify(buildBackup(data, "2026-11-09T12:00:00.000Z"))], "b.json", {
    type: "application/json",
  });

const read = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");

describe("BackupScreen", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("avisa que o arquivo tem dados sensíveis e que ainda não há backup", () => {
    render(<BackupScreen />);
    expect(screen.getByText(/dados de saúde e contato/)).toBeInTheDocument();
    expect(screen.getByText("Você ainda não fez nenhum backup.")).toBeInTheDocument();
  });

  it("baixa o backup com os dados atuais e registra a data", async () => {
    window.localStorage.setItem(STORAGE_KEYS.students, JSON.stringify([student]));
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
    render(<BackupScreen />);

    await user.click(screen.getByRole("button", { name: "Baixar backup" }));

    expect(click).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(await blob!.text());
    expect(saved).toMatchObject({ app: "agenda-pilates", version: 2 });
    expect(saved.data.students).toHaveLength(1);
    expect(saved.data.students[0].name).toBe("Ana");
    expect(read(STORAGE_KEYS.lastBackup)).toBe("2026-11-09");
    expect(screen.getByText("Último backup: 09/11/2026.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Backup baixado/);
  });

  it("restaura um backup válido só depois de confirmar", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.students,
      JSON.stringify([{ ...student, id: "old", name: "Antiga" }]),
    );
    const data: StudioData = {
      plans: [{ id: "p1", name: "2x por semana", weeklyClasses: 2, amount: 280 }],
      slots: [{ id: "s1", weekday: 1, startTime: "08:00" }],
      students: [student],
      bookings: [],
      blockedPeriods: [],
      payments: [],
    };
    const user = userEvent.setup();
    render(<BackupScreen />);

    await user.upload(screen.getByLabelText(/Arquivo de backup/), fileOf(data));
    expect(await screen.findByText(/1 alunos, 1 planos,\s+1 horários/)).toBeInTheDocument();
    expect(read(STORAGE_KEYS.students)[0].name).toBe("Antiga");

    await user.click(screen.getByRole("button", { name: "Substituir dados atuais" }));

    expect(read(STORAGE_KEYS.students)).toEqual([student]);
    expect(read(STORAGE_KEYS.slots)).toEqual(data.slots);
    expect(read(STORAGE_KEYS.plans)).toEqual(data.plans);
    expect(screen.getByRole("status")).toHaveTextContent("Backup restaurado.");
  });

  it("cancelar não altera os dados atuais", async () => {
    window.localStorage.setItem(STORAGE_KEYS.students, JSON.stringify([student]));
    const data: StudioData = {
      plans: [],
      slots: [],
      students: [],
      bookings: [],
      blockedPeriods: [],
      payments: [],
    };
    const user = userEvent.setup();
    render(<BackupScreen />);
    await user.upload(screen.getByLabelText(/Arquivo de backup/), fileOf(data));
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(read(STORAGE_KEYS.students)).toEqual([student]);
    expect(screen.queryByRole("button", { name: "Substituir dados atuais" })).not.toBeInTheDocument();
  });

  it("recusa um arquivo inválido sem mexer nos dados", async () => {
    window.localStorage.setItem(STORAGE_KEYS.students, JSON.stringify([student]));
    const user = userEvent.setup();
    render(<BackupScreen />);
    await user.upload(
      screen.getByLabelText(/Arquivo de backup/),
      new File(["não é json"], "x.json", { type: "application/json" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("O arquivo não é um JSON válido."),
    );
    expect(read(STORAGE_KEYS.students)).toEqual([student]);
  });
});
