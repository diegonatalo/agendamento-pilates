### 🌐 Deploy

O app é estático e não tem servidor próprio nem banco: os dados ficam no `localStorage` do navegador de quem usa. Qualquer hospedagem de Next.js serve (por exemplo a Vercel: importe o repositório e publique, sem configurar nada).

- `NEXT_PUBLIC_SITE_URL` é opcional e define o endereço usado em metadados e no sitemap; sem ela vale `http://localhost:3000`.
- O site pede `noindex`, porque é de uso pessoal da instrutora.
- Como os dados não saem do navegador, **trocar de aparelho ou limpar os dados do navegador apaga tudo**: use a aba Backup para exportar e restaurar o JSON.
