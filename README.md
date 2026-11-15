<!-- Arquivo gerado pelo readme-kit. Não edite aqui: altere docs/readme/ e rode "readme-kit build". -->
<div align="center">

<img src="docs/assets/banner.svg" alt="Agendamento Pilates: A agenda do estúdio de pilates, feita para a instrutora. github.com/diegonatalo/agendamento-pilates. Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4" width="100%" />

<br />

<a href="https://agendamento-pilates.vercel.app"><img src="docs/assets/btn-demo.svg" alt="Abrir o app ↗" height="46" /></a>
<a href="https://github.com/diegonatalo/agendamento-pilates"><img src="docs/assets/btn-code.svg" alt="Código ↗" height="46" /></a>

<br />

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Dados](https://img.shields.io/badge/dados-s%C3%B3_no_seu_navegador-9fe02e?style=flat-square)

</div>

<br />

<div align="center">

<img src="docs/assets/h-sobre.svg" alt="01 · SOBRE: Sobre o projeto" width="100%" />

</div>

**A agenda do estúdio de pilates, feita para a instrutora.**<br />
Sistema de agendamento para um estúdio de pilates, de uso exclusivo da dona e instrutora. As turmas têm até 3 alunos por horário e cada sessão dura 1h. Ela controla a agenda, a presença, as reposições, a mensalidade e a ficha de saúde de cada aluno. Os alunos não acessam o sistema.

<br />

<div align="center">

<img src="docs/assets/h-func.svg" alt="02 · FUNCIONALIDADES: O que dá para fazer" width="100%" />

</div>

<div align="center">

<img src="docs/assets/f-01.svg" alt="Agenda por horário: Turmas de até 3 alunos, sessões de 1h, com vagas livres à vista." width="49%" />
<img src="docs/assets/f-02.svg" alt="Ficha do aluno: Saúde, lesões, pontos de atenção e evolução em um só lugar." width="49%" />
<br />
<img src="docs/assets/f-03.svg" alt="Reposição: Cada desmarcação vira crédito, sem expiração." width="49%" />
<img src="docs/assets/f-04.svg" alt="Mensalidade: Indicador de pago ou pendente por mês." width="49%" />
<br />
<img src="docs/assets/f-05.svg" alt="Backup: Exporta e restaura todos os dados em um arquivo JSON." width="49%" />
<img src="docs/assets/f-06.svg" alt="Tema claro e escuro: Segue o sistema ou a sua escolha, sem piscar ao abrir." width="49%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-stack.svg" alt="03 · STACK: Stack" width="100%" />

</div>

<div align="center">

<img src="docs/assets/stack.svg" alt="Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, ESLint 9, Vitest 5" width="100%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-run.svg" alt="04 · COMO RODAR: Rodando localmente" width="100%" />

</div>

Requer [Node.js](https://nodejs.org) e [pnpm](https://pnpm.io).

```bash
git clone https://github.com/diegonatalo/agendamento-pilates.git
cd agendamento-pilates
pnpm install
pnpm dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Gera o build de produção |
| `pnpm start` | Serve o build de produção |
| `pnpm lint` | Roda o ESLint |
| `pnpm test` | Roda os testes |
| `pnpm test:watch` | Roda os testes e reexecuta ao salvar |

### 🔑 Variáveis de ambiente

Nenhuma é necessária.

### 🧪 Testes

```bash
pnpm test
```

Cobrem a lógica em `lib/` (capacidade das turmas, conflito de horários, geração de sessões e saldo de reposição) e o comportamento dos componentes.

Para reexecutar ao salvar: `pnpm test:watch`.

<br />

<div align="center">

<img src="docs/assets/h-estrutura.svg" alt="05 · ESTRUTURA: Estrutura" width="100%" />

</div>

```text
app/              Apenas arquivos de rota
components/       Telas e componentes de interface
docs/             Fontes do README
hooks/            Estado e persistência no localStorage
lib/              Lógica pura, sem React
public/           Arquivos estáticos
types/            Tipos compartilhados do domínio
```

<br />

<div align="center">

<img src="docs/assets/h-mais.svg" alt="06 · MAIS: Mais informações" width="100%" />

</div>

### 🧠 Como funciona

| Conceito | Regra |
|---|---|
| **Turma** | Dia da semana e hora de início; até 3 alunos; 1h de duração; sem sobreposição. |
| **Sessão** | Uma turma em uma data, com a presença de cada aluno. |
| **Reposição** | Desmarcar gera 1 crédito, sem expiração; encaixar o aluno em uma vaga livre consome 1; cancelar a reposição devolve. |
| **Aula experimental** | Vaga livre para quem ainda não é aluno, só com o nome. |
| **Bloqueio** | Feriados e férias bloqueiam as sessões e não geram crédito. |
| **Mensalidade** | Cobra-se aluno ativo com valor definido, a partir do mês em que começou. Cada mês fica pago, pendente ou atrasado (depois do vencimento); dia 31 em mês curto vence no último dia. Os totais usam o valor atual da ficha. |

### 🌐 Deploy

O app é estático e não tem servidor próprio nem banco: os dados ficam no `localStorage` do navegador de quem usa. Qualquer hospedagem de Next.js serve (por exemplo a Vercel: importe o repositório e publique, sem configurar nada).

- `NEXT_PUBLIC_SITE_URL` é opcional e define o endereço usado em metadados e no sitemap; sem ela vale `http://localhost:3000`.
- O site pede `noindex`, porque é de uso pessoal da instrutora.
- Como os dados não saem do navegador, **trocar de aparelho ou limpar os dados do navegador apaga tudo**: use a aba Backup para exportar e restaurar o JSON.

### 💾 Backup

A aba **Backup** baixa um arquivo `agenda-pilates-AAAA-MM-DD.json` com horários, alunos, presenças, datas bloqueadas e pagamentos, e restaura a partir dele (substituindo os dados atuais, depois de confirmar). Arquivos de outro app, de outra versão ou incompletos são recusados sem alterar nada.

O arquivo tem dados de saúde e contato dos alunos, **sem criptografia**: guarde em local seguro.

### 🧭 Próximos passos

- [x] Setup do projeto e testes
- [x] Alunos e grade de horários
- [x] Agenda, presença e bloqueio de datas
- [x] Desmarcar, reposição e aula experimental
- [x] Mensalidade
- [x] Backup e acessibilidade
- [ ] Publicar e definir o endereço final
- [ ] Guardar o valor da mensalidade de cada mês

<br />

<div align="center">

<img src="docs/assets/h-autor.svg" alt="07 · AUTOR: Autor" width="100%" />

</div>

<div align="center">

<a href="https://diegonatalo.dev"><img src="docs/assets/btn-portfolio.svg" alt="Portfólio ↗" height="46" /></a>
<a href="https://www.linkedin.com/in/diegonatalo/"><img src="docs/assets/btn-linkedin.svg" alt="LinkedIn ↗" height="46" /></a>
<a href="https://github.com/diegonatalo"><img src="docs/assets/btn-github.svg" alt="GitHub ↗" height="46" /></a>

</div>

<br />

<div align="center">

<img src="docs/assets/footer.svg" alt="© 2026 Diego Natalo. Feito com 💚 para quem cuida do movimento dos outros" width="100%" />

</div>
