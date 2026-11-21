/** Telas de conta, fora do app. O app mora em `/app`; a landing fica em `/`. */
export const paths = {
  home: "/app",
  signIn: "/entrar",
  signUp: "/cadastro",
} as const;

/** Parâmetro com a página para onde voltar depois de entrar. */
export const RETURN_PARAM = "de";

/** Link para entrar que traz a pessoa de volta para `from` depois. */
export const signInPath = (from?: string) =>
  from && from !== paths.home
    ? `${paths.signIn}?${RETURN_PARAM}=${encodeURIComponent(from)}`
    : paths.signIn;
