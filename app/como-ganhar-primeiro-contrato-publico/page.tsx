import Link from 'next/link'
import type { Metadata } from 'next'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/como-ganhar-primeiro-contrato-publico`

export const metadata: Metadata = {
  title: 'Como Ganhar o Primeiro Contrato Público — Guia para Iniciantes 2026',
  description:
    'Passo a passo real para ganhar o primeiro contrato com o governo: documentação, como montar proposta, estratégias de lance no pregão e os erros que eliminam iniciantes antes de começar.',
  keywords: [
    'como ganhar o primeiro contrato público',
    'licitação para iniciantes',
    'como vender para prefeitura',
    'primeiro contrato governo',
    'como vender para o governo',
    'como participar de licitação pela primeira vez',
    'pregão eletrônico iniciante',
    'como ganhar licitação',
    'estratégia para licitação',
    'como montar proposta de licitação',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Como Ganhar o Primeiro Contrato Público — Guia para Iniciantes 2026',
    description: 'O roteiro que transforma a primeira licitação de uma aposta num processo estruturado. Do cadastro ao contrato assinado.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Como Ganhar o Primeiro Contrato Público',
    description: 'Passo a passo real para iniciantes: documentação, proposta, lance e estratégia no pregão eletrônico.',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Ganhar o Primeiro Contrato Público: Guia Passo a Passo para Iniciantes',
  description: 'Roteiro completo para quem nunca participou de licitação: do cadastro nos portais à assinatura do primeiro contrato com o governo.',
  author: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  inLanguage: 'pt-BR',
  datePublished: `${new Date().getFullYear()}-01-01`,
  dateModified: '2026-06-21',
  keywords: 'como ganhar primeiro contrato público, licitação para iniciantes, como vender para prefeitura, pregão eletrônico',
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quanto tempo leva para ganhar o primeiro contrato público?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Com documentação regularizada e monitoramento ativo de editais, a maioria das empresas consegue o primeiro contrato entre 30 e 90 dias. O maior fator é o volume de licitações que você acompanha — quem monitora mais editais encontra mais oportunidades e aprende mais rápido o processo.',
      },
    },
    {
      '@type': 'Question',
      name: 'É necessário contratar um despachante para participar de licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Não. Pregões eletrônicos são desenhados para que qualquer fornecedor participe sem intermediários. O processo é feito online no portal do governo. Para os primeiros editais, basta ler o edital com atenção e ter a documentação em ordem. Despachantes só fazem sentido para licitações muito complexas ou de alto valor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como saber se minha empresa tem preço competitivo para ganhar licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Antes de dar o lance, pesquise o preço estimado no edital (obrigatório por lei em alguns casos) e em plataformas como o Painel de Preços do governo federal. Compare com seu custo real. Uma margem de 5% a 15% acima do custo costuma ser competitiva em pregões de produtos. Para serviços, a referência é a tabela de preços do mercado local.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que é o SICAF e preciso me cadastrar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O SICAF (Sistema de Cadastro Unificado de Fornecedores) é o cadastro federal de fornecedores que permite participar de pregões no Compras.gov.br sem enviar documentos a cada licitação. O cadastro é feito online e é gratuito. Para licitações municipais e estaduais, pode ser necessário um cadastro específico no portal daquele ente.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferença entre pregão eletrônico e dispensa de licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O pregão eletrônico é uma modalidade de licitação com disputa pública de lances em tempo real, usada para compras de qualquer valor. A dispensa de licitação é um procedimento simplificado usado para compras de baixo valor (até R$57.350 para bens e serviços), onde o governo convida pelo menos 3 fornecedores e escolhe o menor preço sem sessão pública.',
      },
    },
  ],
}

export default function PrimeiroContratoPagina() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[64px] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl border-b border-[#F0EDE8]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-[8px] bg-[#6B0F1A] flex items-center justify-center font-black text-[11px] text-[#C9A65A] shrink-0">ML</div>
          <span className="font-semibold text-sm text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-sm text-[#6B7280] no-underline">Entrar</Link>
          <Link href="/cadastro" className="px-4 py-2 text-sm font-semibold bg-[#6B0F1A] text-white no-underline rounded-lg">Começar grátis</Link>
        </div>
      </header>

      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[680px] mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <Link href="/vale-a-pena-participar-de-licitacoes-publicas" className="text-[#6B0F1A] no-underline hover:underline">Licitações</Link>
            <span>›</span>
            <span>Primeiro contrato</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Guia para iniciantes</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Como ganhar o primeiro contrato público: o roteiro que ninguém mostra
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            Existe uma razão pela qual algumas empresas ganham licitação no primeiro mês e outras ficam tentando por dois anos sem resultado: <strong>não é sorte, é processo</strong>. Este guia mostra o roteiro exato — do cadastro ao contrato assinado — com os erros que eliminam iniciantes antes de começar.
          </p>

          {/* Índice */}
          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste guia</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#erro-fatal', 'O erro fatal que elimina 80% dos iniciantes'],
                ['#antes-de-tudo', 'Antes de tudo: os 4 pré-requisitos'],
                ['#escolher-licitacao', 'Como escolher a licitação certa para começar'],
                ['#ler-edital', 'Como ler um edital sem se perder'],
                ['#montar-proposta', 'Como montar uma proposta competitiva'],
                ['#dia-do-pregao', 'O que acontece no dia do pregão'],
                ['#estrategia-de-lance', 'Estratégia de lance: como não jogar fora a margem'],
                ['#depois-de-ganhar', 'O que acontece depois de ganhar'],
                ['#faq', 'Perguntas frequentes'],
              ].map(([href, label], i) => (
                <li key={href}>
                  <a href={href as string} className="text-[#6B0F1A] no-underline hover:underline">
                    {i + 1}. {label as string}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Seção 1 */}
          <section id="erro-fatal" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              O erro fatal que elimina 80% dos iniciantes
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A maioria das empresas que tenta entrar em licitação pela primeira vez comete um erro que ninguém fala abertamente: <strong>elas ficam esperando o edital perfeito aparecer.</strong>
            </p>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Sem monitoramento ativo, a empresa fica dependente de alguém mandar um link, de uma coincidência de estar no site certo no dia certo, ou de receber um convite por e-mail que nunca chega. Quando finalmente encontra um edital compatível, o prazo já expirou ou a sessão é amanhã.
            </p>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O resultado: a empresa participa de poucas licitações, erra nos primeiros por falta de prática, fica desanimada e desiste com a conclusão de que "licitação não funciona para mim".
            </p>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg mb-4">
              <strong>A correção é simples:</strong> monitorar ativamente. Quem acompanha 10 a 20 editais por mês aprende o processo nos primeiros 2, já participa com confiança nos seguintes e fecha o primeiro contrato em semanas — não anos.
            </div>
          </section>

          {/* Seção 2 */}
          <section id="antes-de-tudo" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Antes de tudo: os 4 pré-requisitos inegociáveis
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Sem esses 4 itens em ordem, você pode encontrar a licitação perfeita e ainda ser inabilitado antes de abrir a proposta:
            </p>
            <div className="space-y-4 mb-6">
              {[
                {
                  n: '1',
                  t: 'CNPJ ativo e sem pendências',
                  d: 'CNPJ em situação irregular na Receita Federal impede qualquer participação. Verifique no portal da Receita e regularize pendências antes de procurar editais.',
                },
                {
                  n: '2',
                  t: 'Certidões negativas em dia',
                  d: 'CND Federal, CRF (FGTS), CNDT (trabalhista), certidão estadual e municipal. Todas precisam estar válidas na data da sessão do pregão — não na data de inscrição.',
                },
                {
                  n: '3',
                  t: 'Cadastro nos portais de compras',
                  d: 'Para licitações federais: SICAF (Compras.gov.br). Para licitações municipais e estaduais: cada portal tem seu próprio cadastro. Faça o cadastro antes de encontrar o edital.',
                },
                {
                  n: '4',
                  t: 'Certificado digital (e-CNPJ)',
                  d: 'A maioria dos pregões eletrônicos exige assinatura digital para enviar proposta e dar lances. Um certificado A1 custa entre R$150 e R$300 e é válido por 1 ano.',
                },
              ].map(({ n, t, d }) => (
                <div key={t} className="flex gap-4 p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8]">
                  <div className="w-8 h-8 rounded-full bg-[#6B0F1A] text-white text-sm font-black flex items-center justify-center shrink-0">{n}</div>
                  <div>
                    <div className="font-bold text-[#1A1A1C] text-sm mb-1">{t}</div>
                    <div className="text-sm text-[#4a4a4d] leading-relaxed">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção 3 */}
          <section id="escolher-licitacao" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como escolher a licitação certa para começar
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Não é qualquer licitação que serve para o primeiro contrato. Escolha com critério:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                { t: 'Prefira itens que você já vende no mercado privado', d: 'Você já sabe o custo, o prazo de entrega e as especificações. A única novidade é o processo — não o produto.' },
                { t: 'Evite editais com exigência de atestado técnico', d: 'Para o primeiro contrato, foque em compras de material e serviços simples. Atestados são exigidos para serviços especializados e obras.' },
                { t: 'Comece por valores entre R$10.000 e R$80.000', d: 'Nessa faixa, editais costumam ser exclusivos para ME e EPP. Competição menor, processo mais simples e aprendizado mais rápido.' },
                { t: 'Prefira regiões próximas para produtos físicos', d: 'Frete é parte do custo. Para o primeiro contrato, vender para um órgão no mesmo estado reduz variáveis e facilita a entrega.' },
                { t: 'Dispensa de licitação é mais fácil que pregão', d: 'Na dispensa, o governo convida fornecedores diretamente. Sem sessão pública, sem lances em tempo real. Ideal para primeiros contratos.' },
              ].map(({ t, d }) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#C9A65A] font-black shrink-0 mt-0.5">→</span>
                  <div><strong className="text-[#1A1A1C]">{t}:</strong> {d}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Seção 4 */}
          <section id="ler-edital" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como ler um edital sem se perder
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Editais têm entre 30 e 200 páginas. Iniciantes tentam ler tudo e travam. A técnica certa é ler na ordem de importância:
            </p>
            <ol className="space-y-3 mb-6">
              {[
                { t: 'Objeto', d: 'O que o governo quer comprar. Se não é o que você vende, pare por aqui.' },
                { t: 'Habilitação', d: 'Quais documentos são exigidos. Se você não tem algum, calcule se consegue em tempo.' },
                { t: 'Prazo de entrega', d: 'Você consegue entregar dentro do prazo? Se não, nem adianta continuar.' },
                { t: 'Proposta comercial', d: 'O que precisa constar na proposta (marca, especificações, validade do preço).' },
                { t: 'Critério de julgamento', d: 'Menor preço, melhor técnica, técnica e preço? Em 95% das compras simples é menor preço.' },
                { t: 'Data e local da sessão', d: 'Para se programar e configurar o sistema no dia certo.' },
              ].map(({ t, d }, i) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-[#FAF6F0] border border-[#F0EDE8] text-[#6B0F1A] text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <div><strong className="text-[#1A1A1C]">{t}:</strong> {d}</div>
                </li>
              ))}
            </ol>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Dúvida no edital?</strong> Todo edital tem um campo de esclarecimentos onde você pode perguntar para o pregoeiro. O prazo costuma ser até 3 dias antes da sessão. Use — a resposta é enviada a todos os licitantes e vira parte do edital.
            </div>
          </section>

          {/* Seção 5 */}
          <section id="montar-proposta" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como montar uma proposta competitiva
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A proposta é o documento que define se você está apto a dar lances. Erros simples aqui causam desclassificação antes mesmo da disputa começar.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { ok: true, t: 'Atenda exatamente as especificações técnicas', d: 'Se o edital pede "papel A4 75g/m², resma com 500 folhas", não ofereça 500g ou 80g/m². Qualquer desvio é motivo de desclassificação.' },
                { ok: true, t: 'Informe marca/modelo quando solicitado', d: 'Alguns editais exigem indicação de marca ou modelo equivalente. Inclua sempre que pedido.' },
                { ok: true, t: 'Declare validade da proposta por 60 dias', d: 'É o padrão. Prazo menor pode ser recusado pelo pregoeiro.' },
                { ok: false, t: 'Não deixe campos em branco', d: 'Proposta incompleta é desclassificada. Leia todos os campos do formulário do portal.' },
                { ok: false, t: 'Não coloque o preço final já na proposta inicial', d: 'A proposta registrada no portal é só para habilitação. O preço real é dado na fase de lances. Muitos iniciantes colocam seu preço mínimo e ficam sem margem de negociação.' },
              ].map(({ ok, t, d }) => (
                <div key={t} className={`flex gap-3 p-4 rounded-xl border text-sm leading-relaxed ${ok ? 'bg-[#F0FDF4] border-[#86EFAC]' : 'bg-[#FFF1F2] border-[#FDA4AF]'}`}>
                  <span className={`font-black text-lg shrink-0 ${ok ? 'text-green-600' : 'text-red-500'}`}>{ok ? '✓' : '✗'}</span>
                  <div>
                    <strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>
                    <span className="text-[#4a4a4d]">{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção 6 */}
          <section id="dia-do-pregao" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              O que acontece no dia do pregão
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O pregão eletrônico tem fases bem definidas. Conhecer cada uma elimina o nervosismo do primeiro dia:
            </p>
            <div className="space-y-3 mb-6">
              {[
                { fase: 'Abertura', desc: 'O pregoeiro abre a sessão e analisa as propostas enviadas. Propostas que não atendem o edital são desclassificadas aqui.' },
                { fase: 'Lances', desc: 'Fase aberta onde os licitantes dão lances em tempo real, tentando oferecer o menor preço. Cada lance precisa ser menor que o anterior do concorrente.' },
                { fase: 'Negociação', desc: 'Após os lances, o pregoeiro pode negociar diretamente com o vencedor para reduzir ainda mais o preço.' },
                { fase: 'Habilitação', desc: 'O pregoeiro verifica os documentos do vencedor. Se houver problema, o segundo colocado é chamado.' },
                { fase: 'Adjudicação e homologação', desc: 'Confirmação do vencedor. Pode ser feita na mesma sessão ou em até alguns dias depois.' },
              ].map(({ fase, desc }, i) => (
                <div key={fase} className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#6B0F1A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <div className="text-[#4a4a4d] leading-relaxed">
                    <strong className="text-[#1A1A1C]">{fase}:</strong> {desc}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Dica:</strong> nos primeiros pregões, entre na sessão 30 minutos antes do horário marcado. Problemas técnicos de conexão ou de certificado digital no dia da sessão são motivo de exclusão automática.
            </div>
          </section>

          {/* Seção 7 */}
          <section id="estrategia-de-lance" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Estratégia de lance: como não jogar fora a margem
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              O erro mais comum de iniciantes é baixar o preço muito rápido por nervosismo. O resultado: ganhar o contrato sem margem de lucro — ou pior, abaixo do custo.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                { t: 'Defina seu preço-piso antes do pregão', d: 'Calcule seu custo total (produto + frete + embalagem + impostos). Esse é o valor abaixo do qual você não pode ir. Escreva numa folha antes de entrar na sessão.' },
                { t: 'Não comece no seu preço mínimo', d: 'Inicie os lances com uma margem de 15 a 20% acima do seu piso. Você vai ter espaço para dar mais lances e parecer mais agressivo para os concorrentes.' },
                { t: 'Lance em incrementos menores conforme o preço cai', d: 'Se os lances estão caindo R$50 de cada vez, dê lances de R$10. Faz o preço cair mais devagar e desanima concorrentes.' },
                { t: 'Fique atento ao empate ficto (ME/EPP)', d: 'Se você é ME ou EPP e está até 5% acima do menor lance, o sistema vai te perguntar se deseja igualar o preço. Sempre aceite se ainda estiver acima do seu custo.' },
                { t: 'Nunca dê lance abaixo do custo para "testar"', d: 'Se você ganhar, é obrigado a assinar o contrato naquele preço. Descumprir gera penalidades — inclusive suspensão temporária de licitações.' },
              ].map(({ t, d }) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#6B0F1A] font-black shrink-0 mt-0.5">→</span>
                  <div><strong className="text-[#1A1A1C]">{t}:</strong> {d}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Seção 8 */}
          <section id="depois-de-ganhar" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              O que acontece depois de ganhar
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Ganhar é só o começo. Veja o que acontece após a homologação:
            </p>
            <ol className="space-y-4 mb-6">
              {[
                { t: 'Assinatura do contrato ou emissão de empenho', d: 'O órgão envia o contrato ou a ordem de compra para assinatura (ou aceite eletrônico). Você tem prazo definido no edital para assinar — geralmente 5 dias úteis.' },
                { t: 'Entrega do produto ou execução do serviço', d: 'Cumpra rigorosamente o prazo de entrega do edital. Atrasos geram multa automática — geralmente 0,5% do valor do contrato por dia.' },
                { t: 'Recebimento provisório e definitivo', d: 'O órgão confere o que foi entregue. Recebimento provisório (imediato) e definitivo (em até 30 dias). A partir do definitivo, começa a contar o prazo de pagamento.' },
                { t: 'Emissão da nota fiscal e pagamento', d: 'Emita a NF-e corretamente (CNPJ do órgão, dados do contrato). O pagamento sai em até 30 dias — guarde o número do empenho para acompanhar.' },
                { t: 'Solicite o atestado de capacidade técnica', d: 'Após a entrega, peça ao órgão um atestado confirmando que a empresa forneceu o produto/serviço dentro das especificações. Esse documento vale ouro para futuros contratos maiores.' },
              ].map(({ t, d }, i) => (
                <li key={t} className="flex gap-4 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="w-7 h-7 rounded-full bg-[#6B0F1A] text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <div><strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>{d}</div>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA */}
          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Primeiro passo</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              Encontre editais compatíveis com o que você vende
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              Cadastre suas palavras-chave e receba alertas de novas licitações por e-mail. 7 dias grátis, sem cartão.
            </p>
            <Link href="/cadastro" className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Criar conta gratuita →
            </Link>
          </div>

          {/* FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-6">Perguntas frequentes</h2>
            <div className="space-y-3">
              {faqLd.mainEntity.map((item) => (
                <details key={item.name} className="border border-[#F0EDE8] rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 cursor-pointer font-semibold text-sm text-[#1A1A1C] list-none flex items-center justify-between gap-2">
                    {item.name}
                    <span className="text-[#6B0F1A] text-lg shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[#4a4a4d] leading-relaxed border-t border-[#F0EDE8] pt-3">
                    {item.acceptedAnswer.text}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Links relacionados */}
          <div className="border-t border-[#F0EDE8] pt-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9AA0A6] mb-4">Continue lendo</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/vale-a-pena-participar-de-licitacoes-publicas', label: 'Vale a pena participar de licitações?' },
                { href: '/documentos-para-habilitacao-em-licitacoes', label: 'Documentos para habilitação' },
                { href: '/guia-modalidades-licitacao', label: 'Guia de modalidades de licitação' },
                { href: '/como-monitorar-licitacoes', label: 'Como monitorar licitações' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8] no-underline text-sm font-semibold text-[#1A1A1C] hover:border-[#C9A65A] transition-colors">
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#F0EDE8] px-6 py-8 text-center text-xs text-[#9AA0A6]">
        <div className="flex justify-center gap-4 mb-3">
          <Link href="/privacidade" className="text-[#9AA0A6] no-underline hover:underline">Privacidade</Link>
          <Link href="/termos" className="text-[#9AA0A6] no-underline hover:underline">Termos</Link>
          <Link href="/contato" className="text-[#9AA0A6] no-underline hover:underline">Contato</Link>
          <Link href="/licitacoes-para" className="text-[#9AA0A6] no-underline hover:underline">Segmentos</Link>
        </div>
        © {new Date().getFullYear()} Monitor de Licitações — Todos os direitos reservados
      </footer>
    </div>
  )
}
