import { SITE_NAME } from "@/lib/site";

export const HomeScreen = () => (
  <main className="flex flex-col justify-center gap-2">
    <h1 className="text-3xl font-semibold tracking-tight">{SITE_NAME}</h1>
    <p className="text-zinc-600 dark:text-zinc-400">Em construção.</p>
  </main>
);
