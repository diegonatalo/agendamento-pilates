import Link from "next/link";
import { PublicShell } from "@/components/landing/landing-page";
import { LegalPage } from "@/components/legal-page";
import { PrintButton } from "@/components/print-button";
import { PRIVACY_EMAIL, SITE_NAME, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-22";

const linkClass = "font-semibold text-primary underline underline-offset-2";

const Contact = () => (
  <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
    {PRIVACY_EMAIL}
  </a>
);

export const PrivacyPage = () => (
  <PublicShell>
    <LegalPage
      title="Privacidade"
      summary={`O ${SITE_NAME} guarda os dados do estúdio e dos alunos num banco de dados ligado à conta do estúdio. Esta página diz o que é guardado, onde e como apagar.`}
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                A grade de horários, os bloqueios (feriados e férias), os planos, as configurações do estúdio, a
                agenda e os pagamentos. E, de cada aluno: nome, telefone, data de nascimento, data de início, horários
                fixos, mensalidade, objetivos, pontos de atenção, evolução e a <strong>ficha de saúde</strong>{" "}
                (lesões e condições, cirurgias, restrições de movimento, liberação médica e contato de emergência).
              </p>
              <p>
                Da conta do estúdio: nome, e-mail e a senha, guardada só como hash (não dá para ler a senha de volta).
              </p>
              <p>
                Tudo fica num banco de dados Postgres no <strong>Neon</strong>, ligado à conta, e só abre com o e-mail e
                a senha do estúdio. Cada conta vê apenas os próprios dados. No navegador fica só a preferência de tema
                claro ou escuro.
              </p>
            </>
          ),
        },
        {
          id: "dados-sensiveis",
          title: "Dados de saúde",
          content: (
            <>
              <p>
                Pela LGPD (art. 5º, II), dados de saúde são <strong>dados pessoais sensíveis</strong>. Quem cadastra
                os alunos é o estúdio, que é o responsável por esses dados (controlador) e precisa de uma base legal
                para tratá-los, como o consentimento específico do aluno.
              </p>
              <p>
                Para ajudar, deixamos um{" "}
                <Link href="/termos/consentimento" className={linkClass}>
                  modelo de termo de consentimento
                </Link>{" "}
                para imprimir. Ele é um ponto de partida e deve ser revisado por um advogado.
              </p>
              <p>
                Recomendações: use uma senha forte e só sua; saia da conta em aparelhos de outras pessoas; cadastre só
                o necessário para dar as aulas com segurança; e apague a ficha de quem deixou de ser aluno.
              </p>
            </>
          ),
        },
        {
          id: "terceiros",
          title: "Quem mais recebe dados",
          content: (
            <>
              <p>
                O <strong>Neon</strong>, onde fica o banco de dados, e a <strong>Vercel</strong>, a hospedagem do site,
                que registra dados técnicos de acesso (como IP e navegador) para entregar as páginas e limitar tentativas
                de login. Os dois só guardam e processam os dados para o app funcionar.
              </p>
              <p>
                O botão de WhatsApp na ficha só abre o WhatsApp com o número do aluno; nada é enviado sem você mandar.
              </p>
              <p>
                O único cookie é o de <strong>sessão</strong>, necessário para manter o estúdio logado. Não usamos
                estatísticas de visita nem propaganda.
              </p>
            </>
          ),
        },
        {
          id: "backup",
          title: "Backup",
          content: (
            <p>
              O backup leva tudo, inclusive as fichas de saúde, <strong>sem criptografia</strong>. Por isso, o app pede
              confirmação antes de baixar. Guarde o arquivo em local seguro e não envie por WhatsApp ou e-mail.
            </p>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Apague a ficha do aluno na própria tela de alunos. Para apagar tudo, use <strong>Excluir conta</strong>{" "}
              na aba Conta: a conta e todos os dados do estúdio são apagados do banco na hora. Depois disso, não há como
              recuperar, a não ser por um backup.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              Pedidos de alunos sobre os próprios dados devem ir ao estúdio, que tem acesso às fichas. Dúvidas sobre
              esta página: <Contact />.
            </p>
          ),
        },
      ]}
    />
  </PublicShell>
);

export const TermsPage = () => (
  <PublicShell>
    <LegalPage
      title="Termos de uso"
      summary={`As regras para usar o ${SITE_NAME}. Ao usar o app, o estúdio concorda com elas.`}
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-e",
          title: `O que é o ${SITE_NAME}`,
          content: (
            <p>
              Um app gratuito de agenda e cadastro de alunos para estúdios e professores com turmas fixas, mantido por Diego Natalo como
              projeto pessoal. O código é aberto, no{" "}
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                GitHub
              </a>
              .
            </p>
          ),
        },
        {
          id: "responsabilidade",
          title: "Os dados dos alunos são responsabilidade do estúdio",
          content: (
            <p>
              O estúdio é quem cadastra e usa os dados dos alunos, inclusive os de saúde. Cabe ao estúdio informar os
              alunos, obter o consentimento quando a lei exigir (veja o{" "}
              <Link href="/termos/consentimento" className={linkClass}>
                modelo de termo
              </Link>
              ), manter a senha da conta em segredo e atender os pedidos dos alunos sobre os próprios dados.
            </p>
          ),
        },
        {
          id: "nao-e-orientacao",
          title: "Não é prontuário nem orientação de saúde",
          content: (
            <p>
              A ficha de saúde é um registro de apoio para as aulas. Ela não substitui avaliação médica nem
              fisioterapêutica, nem é prontuário.
            </p>
          ),
        },
        {
          id: "seus-dados",
          title: "Backup e perda de dados",
          content: (
            <p>
              Os dados ficam na conta do estúdio. Mesmo assim, guardar um backup de vez em quando é responsabilidade
              do estúdio, e excluir a conta apaga tudo para sempre. Detalhes em{" "}
              <Link href="/privacidade" className={linkClass}>
                Privacidade
              </Link>
              .
            </p>
          ),
        },
        {
          id: "disponibilidade",
          title: "Disponibilidade",
          content: (
            <p>
              O {SITE_NAME} é oferecido &quot;como está&quot;, sem garantia de que vai funcionar sempre ou sem
              erros. Ela pode mudar ou sair do ar.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              <Contact />
            </p>
          ),
        },
      ]}
    />
  </PublicShell>
);

const Blank = ({ label }: { label: string }) => (
  <p className="flex flex-wrap items-end gap-2">
    <span>{label}</span>
    <span className="min-w-48 flex-1 border-b border-current" aria-hidden="true" />
  </p>
);

/** Modelo de termo de consentimento do aluno, para o estúdio imprimir e colher a assinatura. */
export const ConsentPage = () => (
  <PublicShell>
    <main id="conteudo" className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 print:py-0">
      <div className="mb-8 flex flex-col gap-3 rounded-xl bg-warn-soft p-4 text-sm text-warn-soft-fg print:hidden">
        <p>
          <strong>Modelo para o estúdio imprimir.</strong> Ele é um ponto de partida e não substitui orientação
          jurídica: revise com um advogado antes de usar. Preencha o nome do estúdio e o prazo de guarda.
        </p>
        <div>
          <PrintButton />
        </div>
      </div>

      <h1 className="font-display text-2xl font-semibold">Termo de consentimento para tratamento de dados de saúde</h1>

      <div className="mt-6 flex flex-col gap-4 leading-7">
        <Blank label="Eu," />
        <Blank label="CPF" />
        <p>
          autorizo o estúdio ______________________________________ (nome e CNPJ/CPF) a registrar e usar os dados
          abaixo <strong>somente</strong> para planejar e acompanhar as minhas aulas com segurança:
        </p>
        <ul className="list-disc pl-6">
          <li>nome, telefone e data de nascimento;</li>
          <li>lesões, condições de saúde, cirurgias e restrições de movimento que eu informar;</li>
          <li>se tenho liberação médica para a prática;</li>
          <li>nome e telefone de um contato de emergência;</li>
          <li>objetivos, pontos de atenção e a evolução nas aulas.</li>
        </ul>
        <p>Fui informado(a) de que:</p>
        <ol className="list-decimal pl-6">
          <li>
            os dados ficam no sistema {SITE_NAME}, na conta do estúdio, protegida por senha, e não são compartilhados
            com terceiros além dos serviços que hospedam o sistema;
          </li>
          <li>só os instrutores do estúdio têm acesso a eles;</li>
          <li>
            posso pedir a qualquer momento para ver, corrigir ou apagar os meus dados e revogar esta autorização,
            falando com o estúdio;
          </li>
          <li>os dados serão apagados quando eu deixar de ser aluno(a), em até ____ meses depois da última aula.</li>
        </ol>
        <Blank label="Local e data:" />
        <Blank label="Assinatura do(a) aluno(a):" />
        <Blank label="Se menor de idade, assinatura do responsável:" />
      </div>
    </main>
  </PublicShell>
);
