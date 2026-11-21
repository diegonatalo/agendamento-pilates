import { LogoMark } from "@/components/logo";

/** Enquanto o servidor confere a sessão e carrega os dados da conta. */
export const AppLoading = () => (
  <div role="status" className="grid min-h-dvh place-items-center text-muted">
    <div className="flex flex-col items-center gap-3">
      <LogoMark className="size-12 animate-pulse" />
      <span className="text-sm font-medium">Carregando a agenda…</span>
    </div>
  </div>
);
