import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StudioProvider } from "@/components/studio-provider";
import { saveChanges } from "@/lib/data/actions";
import { loadStudio } from "@/lib/data/queries";
import { paths } from "@/lib/paths";
import { getCurrentUser } from "@/lib/session";

/**
 * Confere a sessão e carrega os dados do estúdio antes de abrir o app. Fica
 * dentro de um <Suspense> no layout, porque lê os cookies da requisição.
 */
export const SignedInApp = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  // cookie velho ou sessão expirada: o proxy deixou passar, aqui não
  if (!user) redirect(paths.signIn);
  const data = await loadStudio(user.id);
  return (
    <AppShell>
      <StudioProvider initialData={data} account={{ name: user.name, email: user.email }} save={saveChanges}>
        {children}
      </StudioProvider>
    </AppShell>
  );
};
