import Link from "next/link";
import { PublicShell } from "@/components/landing/public-shell";
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
      summary={`O ${SITE_NAME} guarda os dados de quem usa o app e dos clientes dele num banco de dados ligado à conta. Esta página diz o que é guardado, onde, quem consegue ler e como apagar.`}
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                A grade de horários, os bloqueios (feriados e férias), os planos, o ramo do negócio e as
                configurações, a agenda e os pagamentos. E, de cada cliente (aluno, paciente ou cliente, conforme o
                ramo): nome, telefone, data de nascimento, data de início, horários fixos, mensalidade, objetivos,
                pontos de atenção, anotações e, nos ramos que usam, a <strong>ficha de saúde</strong>{" "}
                (lesões e condições, cirurgias, restrições de movimento, liberação médica e contato de emergência).
              </p>
              <p>
                Da conta: nome, e-mail e a senha, guardada só como hash (não dá para ler a senha de volta). De cada
                login: o endereço IP e o navegador usado. Para limitar tentativas de login, também um contador por
                endereço IP, que não fica ligado à conta.
              </p>
              <p>
                Tudo fica num banco de dados Postgres no <strong>Neon</strong>, em São Paulo. No navegador ficam o
                cookie de sessão e a preferência de tema claro ou escuro.
              </p>
            </>
          ),
        },
        {
          id: "quem-consegue-ler",
          title: "Quem consegue ler",
          content: (
            <>
              <p>No app, cada conta vê apenas os próprios dados, e para entrar é preciso o e-mail e a senha dela.</p>
              <p>
                Fora do app, <strong>quem mantém o {SITE_NAME}</strong> (Diego Natalo) administra o banco e a hospedagem
                e tecnicamente consegue ler tudo o que é cadastrado, inclusive anotações e fichas de saúde. Os dados{" "}
                <strong>não têm criptografia de ponta a ponta</strong>. Se o seu trabalho exige que ninguém além de
                você possa ler, não registre essas informações aqui.
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
                os clientes é o profissional ou o negócio dono da conta, que é o responsável por esses dados
                (controlador) e precisa de uma base legal para tratá-los, como o consentimento específico do cliente.
                Psicólogos seguem também as regras do seu conselho sobre registro e sigilo.
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
                o necessário para atender com segurança; e apague a ficha de quem deixou de ser cliente.
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
                que registra dados técnicos de acesso (como IP e navegador) para entregar as páginas. Os dois recebem os
                dados para o app funcionar.
              </p>
              <p>
                O banco fica no Brasil, mas o servidor que lê e grava os dados roda nos <strong>Estados Unidos</strong>.
                Ou seja, os dados, inclusive os de saúde, <strong>passam por fora do Brasil</strong> (transferência
                internacional, art. 33 da LGPD).
              </p>
              <p>
                O botão de WhatsApp na ficha só abre o WhatsApp com o número do cliente; nada é enviado sem você mandar.
              </p>
              <p>
                O único cookie é o de <strong>sessão</strong>, necessário para manter a conta logada. Não usamos
                estatísticas de visita nem propaganda.
              </p>
            </>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Apague a ficha do cliente na própria tela de fichas. Para apagar tudo, use <strong>Excluir conta</strong>{" "}
              na aba Conta: a conta e os dados dela saem do app e do banco na hora, e você não consegue
              recuperá-los. Cópias podem continuar por um tempo no histórico de recuperação do Neon e em cópias de
              segurança feitas para manutenção. O contador de tentativas por IP não é apagado com a conta.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              Pedidos de clientes sobre os próprios dados devem ir ao profissional ou negócio que os atende, que tem acesso às fichas. Dúvidas sobre
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
      summary={`As regras para usar o ${SITE_NAME}. Ao usar o app, você concorda com elas.`}
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-e",
          title: `O que é o ${SITE_NAME}`,
          content: (
            <p>
              Um app gratuito de agenda e fichas para quem atende com hora marcada (estúdios, personal, professores particulares, psicólogos e barbearias), mantido por Diego Natalo como
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
          title: "Os dados dos clientes são responsabilidade de quem usa o app",
          content: (
            <p>
              Quem usa o app é quem cadastra e usa os dados dos clientes, inclusive os de saúde. Cabe a essa pessoa
              ou negócio informar os clientes, obter o consentimento quando a lei exigir (veja o{" "}
              <Link href="/termos/consentimento" className={linkClass}>
                modelo de termo
              </Link>
              ), manter a senha da conta em segredo e atender os pedidos dos clientes sobre os próprios dados.
            </p>
          ),
        },
        {
          id: "nao-e-orientacao",
          title: "Não é prontuário nem orientação de saúde",
          content: (
            <p>
              A ficha é um registro de apoio para os atendimentos. Ela não substitui avaliação médica nem
              fisioterapêutica, nem é prontuário.
            </p>
          ),
        },
        {
          id: "seus-dados",
          title: "Exclusão da conta",
          content: (
            <p>
              Os dados ficam na sua conta. Excluir a conta apaga todos eles para sempre, sem como recuperar.
              Detalhes em{" "}
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

/** Modelo de termo de consentimento do cliente, para o profissional imprimir e colher a assinatura. */
export const ConsentPage = () => (
  <PublicShell>
    <main id="conteudo" className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 print:py-0">
      <div className="mb-8 flex flex-col gap-3 rounded-xl bg-warn-soft p-4 text-sm text-warn-soft-fg print:hidden">
        <p>
          <strong>Modelo para imprimir.</strong> Ele é um ponto de partida e não substitui orientação jurídica:
          revise com um advogado antes de usar e ajuste a lista de dados ao seu ramo. Preencha o seu nome (ou o do
          negócio) e o prazo de guarda.
        </p>
        <div>
          <PrintButton />
        </div>
      </div>

      <h1 className="font-display text-2xl font-semibold">Termo de consentimento para tratamento de dados de saúde</h1>

      <div className="mt-6 flex flex-col gap-4 leading-7 wrap-anywhere">
        <Blank label="Eu," />
        <Blank label="CPF" />
        <p>
          autorizo ______________________________________ (nome e CNPJ/CPF do profissional ou do negócio) a registrar e usar os dados
          abaixo <strong>somente</strong> para planejar e acompanhar os meus atendimentos com segurança:
        </p>
        <ul className="list-disc pl-6">
          <li>nome, telefone e data de nascimento;</li>
          <li>lesões, condições de saúde, cirurgias e restrições de movimento que eu informar;</li>
          <li>se tenho liberação médica para a prática;</li>
          <li>nome e telefone de um contato de emergência;</li>
          <li>objetivos, pontos de atenção e a evolução ao longo dos atendimentos.</li>
        </ul>
        <p>Fui informado(a) de que:</p>
        <ol className="list-decimal pl-6">
          <li>
            os dados ficam no sistema {SITE_NAME}, na conta do profissional, protegida por senha, e são processados
            também pelos serviços que hospedam o sistema;
          </li>
          <li>
            além de quem me atende, quem mantém o sistema {SITE_NAME} consegue tecnicamente ler esses dados, que não
            têm criptografia de ponta a ponta;
          </li>
          <li>
            <strong>os dados são processados também fora do Brasil, nos Estados Unidos</strong>, e eu concordo com essa
            transferência;
          </li>
          <li>
            posso pedir a qualquer momento para ver, corrigir ou apagar os meus dados e revogar esta autorização,
            falando com quem me atende;
          </li>
          <li>os dados serão apagados quando eu deixar de ser atendido(a), em até ____ meses depois do último atendimento.</li>
        </ol>
        <Blank label="Local e data:" />
        <Blank label="Assinatura:" />
        <Blank label="Se menor de idade, assinatura do responsável:" />
      </div>
    </main>
  </PublicShell>
);
