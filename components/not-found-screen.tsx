import Link from "next/link";

export const NotFoundScreen = () => (
  <main className="flex flex-col items-start justify-center gap-4">
    <h1 className="text-3xl font-semibold tracking-tight">
      Página não encontrada
    </h1>
    <p className="text-zinc-600 dark:text-zinc-400">
      O endereço que você abriu não existe.
    </p>
    <Link
      href="/"
      className="rounded-md bg-zinc-900 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:focus-visible:outline-zinc-100"
    >
      Voltar para o início
    </Link>
  </main>
);
