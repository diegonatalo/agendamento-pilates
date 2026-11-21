import { createContext, useContext } from "react";

/** A pessoa logada, como aparece no app (nunca a sessão em si). */
export type Account = { name: string; email: string };

export const AccountContext = createContext<Account | null>(null);

export const useAccount = () => {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount must be used inside <StudioProvider>");
  return account;
};
