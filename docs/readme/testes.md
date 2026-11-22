### 🧪 Testes

```bash
pnpm test
```

Cobrem a lógica em `lib/` (vagas por horário, conflito e geração de horários, vocabulário por ramo e saldo de reposição) e o comportamento dos componentes.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium e percorrem os fluxos inteiros com uma conta nova por teste: criar a conta, entrar e sair, senha errada, e-mail repetido, isolamento entre contas e excluir a conta; montar a grade, cadastrar um aluno e recarregar; e abrir todas as páginas sem erros. Usam o banco do `.env.local` (no CI, um Postgres descartável).

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```

Os prints deste README vêm de `e2e/readme-screenshots.spec.ts`, que cria uma conta com dados fictícios, fotografa as telas e exclui a conta. Para refazer, num terminal bash, rode o comando abaixo e depois o `build` do readme-kit:

```bash
README_SHOTS=1 pnpm test:e2e e2e/readme-screenshots.spec.ts
```
