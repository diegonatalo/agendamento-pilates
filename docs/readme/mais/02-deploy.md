### 🌐 Deploy

Na Vercel, com o banco Postgres do Neon ligado pela integração da Vercel (ela cria a `DATABASE_URL` e a `DATABASE_URL_UNPOOLED`).

- Defina `BETTER_AUTH_SECRET` em Settings > Environment Variables, com um valor só da produção.
- O script `vercel-build` aplica as migrações pendentes (`drizzle-kit migrate`) antes do build. A Vercel só publica a `main` (`vercel.json`).
- As funções rodam em São Paulo (`gru1`), junto do banco: é escolhido em Settings > Functions > Function Regions, na Vercel, e vale a partir do deploy seguinte. Se mudar, atualize a política de privacidade.
- `NEXT_PUBLIC_SITE_URL` é opcional e define o endereço usado em metadados e no sitemap; sem ela vale `https://dn-encaixe.vercel.app`.
- O app logado (`/app`) e a API pedem `noindex` e ficam fora do `robots.txt`.
