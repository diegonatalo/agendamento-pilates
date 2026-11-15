"use client";

import { useState, type ChangeEvent } from "react";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
} from "@/components/form-styles";
import { useStudio } from "@/hooks/use-studio";
import {
  buildBackup,
  countBackup,
  parseBackup,
  type BackupFile,
} from "@/lib/backup";
import { formatDateBr, toDateKey } from "@/lib/dates";

const downloadJson = (filename: string, content: string) => {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const BackupScreen = () => {
  const {
    ready,
    slots,
    students,
    bookings,
    blockedPeriods,
    payments,
    lastBackup,
    restoreData,
    recordBackup,
  } = useStudio();
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const now = new Date();
    const backup = buildBackup(
      { slots, students, bookings, blockedPeriods, payments },
      now.toISOString(),
    );
    const today = toDateKey(now);
    downloadJson(
      `agenda-pilates-${today}.json`,
      JSON.stringify(backup, null, 2),
    );
    recordBackup(today);
    setError(null);
    setMessage("Backup baixado. Guarde o arquivo em um lugar seguro.");
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const result = parseBackup(await file.text());
    // Permite escolher o mesmo arquivo de novo depois.
    input.value = "";
    setMessage(null);
    if (result.ok) {
      setError(null);
      setPending(result.backup);
    } else {
      setPending(null);
      setError(result.error);
    }
  };

  const confirmRestore = () => {
    if (!pending) return;
    restoreData(pending.data);
    setPending(null);
    setMessage("Backup restaurado.");
  };

  const counts = pending ? countBackup(pending.data) : null;

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Backup</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Os dados ficam só neste navegador. Limpar os dados do navegador ou
          trocar de aparelho apaga tudo, então baixe um backup com frequência.
        </p>
      </header>

      <section
        aria-labelledby="export-title"
        className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <h2 id="export-title" className="text-lg font-semibold">
          Baixar backup
        </h2>
        <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
          <strong>Atenção:</strong> o arquivo contém dados de saúde e contato
          dos alunos, sem criptografia. Guarde em local seguro e não envie por
          canais abertos.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {!ready
            ? " "
            : lastBackup
              ? `Último backup: ${formatDateBr(lastBackup)}.`
              : "Você ainda não fez nenhum backup."}
        </p>
        <div>
          <button
            type="button"
            className={BUTTON_PRIMARY}
            onClick={handleExport}
            disabled={!ready}
          >
            Baixar backup
          </button>
        </div>
      </section>

      <section
        aria-labelledby="restore-title"
        className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <h2 id="restore-title" className="text-lg font-semibold">
          Restaurar backup
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Restaurar <strong>substitui</strong> todos os dados atuais pelos do
          arquivo.
        </p>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Arquivo de backup (.json)
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="text-sm file:mr-3 file:min-h-11 file:rounded-md file:border file:border-zinc-300 file:bg-transparent file:px-4 file:text-sm file:font-medium dark:file:border-zinc-700"
          />
        </label>

        {counts && pending ? (
          <div className="flex flex-col gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-sm">
              Backup de {formatDateBr(pending.exportedAt.slice(0, 10))}:{" "}
              {counts.students} alunos, {counts.slots} horários,{" "}
              {counts.bookings} presenças, {counts.blockedPeriods} datas
              bloqueadas e {counts.payments} pagamentos.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={BUTTON_DANGER}
                onClick={confirmRestore}
              >
                Substituir dados atuais
              </button>
              <button
                type="button"
                className={BUTTON_SECONDARY}
                onClick={() => setPending(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm font-medium text-teal-800 dark:text-teal-300">
          {message}
        </p>
      ) : null}
    </main>
  );
};
