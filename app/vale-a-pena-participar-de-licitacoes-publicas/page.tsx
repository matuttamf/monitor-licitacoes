import Link from 'next/link'
import type { Metadata } from 'next'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'
import { MobileMenu } from '@/components/MobileMenu'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/vale-a-pena-participar-de-licitacoes-publicas`

export const metadata: Metadata = {
  title: 'Vale a Pena Participar de Licitações Públicas? A Verdade Nua e Crua',
  description:
    'Vale a pena participar de licitações públicas para pequenas empresas? Dados reais, quanto o governo paga, se MEI pode participar e o que ninguém te conta sobre licitações.',
  keywords: [
    'vale a pena participar de licitações públicas',
    'vale a pena participar de licitações públicas para pequenas empresas',
    'licitações públicas vale a pena',
    'licitações para pequenas empresas',
    'como participar de licitação',
    'vantagens de participar de licitação',
    'licitação para iniciantes',
    'MEI pode participar de licitação',
    'dificuldades licitação pública',
    'licitações públicas como funciona',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Vale a Pena Participar de Licitações Públicas? A Verdade Nua e Crua',
    description: 'O governo gasta R$2 trilhões por ano. Pequenas empresas têm acesso — mas há armadilhas que ninguém conta. Leia antes de decidir.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vale a Pena Participar de Licitações Públicas?',
    description: 'Dados reais, mitos derrubados e o que fazer para ganhar o primeiro contrato com o governo.',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Vale a Pena Participar de Licitações Públicas para Pequenas Empresas?',
  description: 'Análise honesta sobre vantagens, desvantagens, requisitos e estratégias para pequenas empresas participarem de licitações públicas no Brasil.',
  author: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  inLanguage: 'pt-BR',
  datePublished: `${new Date().getFullYear()}-01-01`,
  dateModified: '2026-06-21',
  keywords: 'vale a pena participar de licitações públicas, licitações para pequenas empresas, MEI licitação, como participar de licitação',
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Vale a pena participar de licitações públicas para pequenas empresas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, vale muito a pena. O governo federal, estadual e municipal compra de todos os setores e é obrigado por lei a dar preferência a micro e pequenas empresas em empates. Além disso, o governo sempre paga — elimina o risco de inadimplência. O desafio é monitorar os editais a tempo e ter a documentação regularizada. Com planejamento, qualquer pequena empresa pode participar.',
      },
    },
    {
      '@type': 'Question',
      name: 'MEI pode participar de licitações públicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. MEI pode participar de licitações de até R$80.000 por contrato. A Lei Complementar 123/2006 garante tratamento favorecido: direito de empate ficto (cobrir preço até 10% maior), prazo extra para regularizar documentação e cotas reservadas em itens divisíveis. O único limite é o faturamento anual do próprio MEI (R$81.000), que pode ser atingido com um único contrato grande.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quais documentos são necessários para participar de licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Os principais documentos exigidos são: CNPJ ativo, Certidão Negativa de Débitos Federais (CND), Certidão de FGTS, Certidão de Débitos Trabalhistas (CNDT), Certidão Negativa Estadual e Municipal, e documentação de habilitação jurídica (contrato social ou certificado MEI). Alguns editais exigem também atestado de capacidade técnica.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quanto tempo leva para receber após ganhar uma licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende do contrato. Em compras simples (pregão eletrônico com entrega imediata), o pagamento sai em 30 a 60 dias após a entrega e emissão da nota fiscal. Contratos de execução continuada pagam mensalmente. O governo tem prazo legal de 30 dias para pagar — atrasos acima disso geram correção monetária obrigatória.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual a maior dificuldade para pequenas empresas nas licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A maior dificuldade é a informação a tempo. Editais têm prazo médio de 8 dias úteis entre publicação e sessão. Empresas que ficam sabendo tarde não têm tempo de preparar uma proposta competitiva. A segunda dificuldade é a documentação: certidões vencem e precisam ser renovadas regularmente. Monitorar editais automaticamente e manter a documentação atualizada resolve 80% dos problemas.',
      },
    },
    {
      '@type': 'Question',
      name: 'Precisa de experiência anterior para participar de licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na maioria das licitações, não. Pregões eletrônicos de menor valor e compras simples não exigem atestado de capacidade técnica. Para contratos de obras, serviços especializados ou valores mais altos, pode ser exigido comprovante de experiência prévia. Uma estratégia comum é começar por contratos menores para acumular atestados e depois disputar contratos maiores.',
      },
    },
  ],
}

export default function ValeApenaPagina() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[64px] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl border-b border-[#F0EDE8]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-[8px] bg-[#6B0F1A] flex items-center justify-center font-black text-[11px] text-[#C9A65A] shrink-0">ML</div>
          <span className="font-semibold text-sm text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavArticlesDropdown />
          <Link href="/assinar" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Planos</Link>
          <Link href="/login" className="hidden md:block px-3 py-2 text-sm text-[#6B7280] no-underline">Entrar</Link>
          <Link href="/cadastro" className="hidden md:block px-4 py-2 text-sm font-semibold bg-[#6B0F1A] text-white no-underline rounded-lg">Começar grátis</Link>
          <MobileMenu />
        </div>
      </header>

      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[680px] mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <span>Licitações</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Análise honesta</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Vale a pena participar de licitações públicas para pequenas empresas?
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            Resposta direta: <strong>sim — e mais do que a maioria imagina.</strong> O governo brasileiro gasta mais de <strong>R$2 trilhões por ano</strong> em compras públicas. A lei obriga preferência para micro e pequenas empresas. O comprador público nunca deixa de pagar. Mas há pontos que ninguém conta — e que fazem muita gente desistir antes de tentar.
          </p>

          {/* Índice */}
          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste artigo</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#o-tamanho-do-mercado', 'O tamanho do mercado que você está ignorando'],
                ['#vantagens', 'Por que valer a pena: as vantagens reais'],
                ['#dificuldades', 'As dificuldades que ninguém conta'],
                ['#mei-pequenas', 'MEI e pequenas empresas têm benefícios extras por lei'],
                ['#quanto-paga', 'Quanto o governo paga e em quanto tempo'],
                ['#como-comecar', 'Como começar sem experiência anterior'],
                ['#documentos', 'Documentação: o que você precisa ter em dia'],
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
          <section id="o-tamanho-do-mercado" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              O tamanho do mercado que você está ignorando
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Existe um cliente no Brasil que nunca fecha as portas, nunca atrasa porque "o caixa está curto" e é obrigado por lei a comprar de forma competitiva e transparente. Esse cliente é o <strong>poder público</strong> — governo federal, estaduais, municipais, autarquias, estatais.
            </p>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Os números são difíceis de ignorar:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { n: 'R$2 tri', d: 'Gastos anuais em compras públicas no Brasil' },
                { n: '5.570', d: 'Municípios comprando todos os dias' },
                { n: '+200 mil', d: 'Editais publicados por mês no país' },
                { n: '30 dias', d: 'Prazo máximo de pagamento por lei' },
                { n: '25%', d: 'Dos contratos federais são com MPE' },
                { n: '0%', d: 'De inadimplência — o governo sempre paga' },
              ].map(({ n, d }) => (
                <div key={n} className="p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8] text-center">
                  <div className="text-2xl font-black text-[#6B0F1A] mb-1">{n}</div>
                  <div className="text-xs text-[#6B7280] leading-snug">{d}</div>
                </div>
              ))}
            </div>
            <p className="text-base text-[#4a4a4d] leading-relaxed">
              Qualquer empresa que venda produto ou serviço tem potencial de faturar com o governo. Desde impressoras e canetas até obras de infraestrutura e serviços de saúde — tudo passa por licitação.
            </p>
          </section>

          {/* Seção 2 */}
          <section id="vantagens" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Por que vale a pena: as vantagens reais
            </h2>
            <ul className="space-y-4 mb-6">
              {[
                {
                  t: 'O governo nunca dá calote',
                  d: 'Diferente de clientes privados, o poder público é obrigado a pagar. Atrasos acima de 30 dias geram correção monetária automática. Inadimplência do governo é raríssima — e, quando ocorre, é judicializada rapidamente.',
                },
                {
                  t: 'Contratos recorrentes e previsíveis',
                  d: 'Muitos contratos são de 12 meses renováveis por até 5 anos. Isso é receita previsível que permite planejamento de equipe, estoque e fluxo de caixa — algo que cliente privado raramente oferece.',
                },
                {
                  t: 'Volume de compras distribuído ao longo do ano',
                  d: 'Ao contrário da sazonalidade do mercado privado, licitações acontecem o ano todo, em todos os estados e municípios. Há sempre uma janela aberta em algum lugar do país.',
                },
                {
                  t: 'Concorrência menor do que parece',
                  d: 'A maioria das empresas nem sabe que existe aquela licitação. Quem monitora ativamente tem vantagem real: já tem a proposta pronta enquanto os concorrentes ainda estão descobrindo que o edital existe.',
                },
                {
                  t: 'Processo 100% digital',
                  d: 'Pregões eletrônicos acontecem online. Você pode disputar um contrato com a Prefeitura de Manaus sem sair de São Paulo. A digitalização abriu o mercado público para empresas de qualquer lugar do país.',
                },
              ].map(({ t, d }) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#6B0F1A] text-lg font-black shrink-0 leading-tight">✓</span>
                  <div>
                    <strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>
                    {d}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Seção 3 */}
          <section id="dificuldades" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              As dificuldades que ninguém conta
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Seria desonesto falar só das vantagens. Existem três dificuldades reais — e cada uma tem solução:
            </p>
            <div className="space-y-4 mb-6">
              {[
                {
                  prob: 'Dificuldade 1: Descobrir o edital a tempo',
                  solucao: 'Editais ficam abertos em média 8 dias úteis. Quem fica sabendo tarde não tem tempo de preparar proposta. Solução: monitorar automaticamente em vez de buscar manualmente.',
                },
                {
                  prob: 'Dificuldade 2: Documentação sempre em dia',
                  solucao: 'Certidões vencem. Uma certidão expirada inabilita a empresa mesmo que tenha o menor preço. Solução: criar um calendário de vencimentos e renovar proativamente.',
                },
                {
                  prob: 'Dificuldade 3: Entender o edital',
                  solucao: 'Editais têm linguagem jurídica e requisitos técnicos específicos. Para iniciantes, os primeiros editais parecem intimidadores. Solução: começar por editais simples (compra de produtos) antes de disputar serviços complexos.',
                },
              ].map(({ prob, solucao }) => (
                <div key={prob} className="p-4 rounded-xl border border-[#F0EDE8] bg-[#FAF6F0]">
                  <div className="font-bold text-[#6B0F1A] text-sm mb-1">{prob}</div>
                  <div className="text-sm text-[#4a4a4d] leading-relaxed">
                    <strong className="text-[#1A1A1C]">Solução: </strong>{solucao.replace('Solução: ', '')}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>A boa notícia:</strong> as três dificuldades acima são logísticas, não técnicas. Nenhuma delas exige capital, porte empresarial ou conhecimento jurídico profundo para ser resolvida.
            </div>
          </section>

          {/* Seção 4 */}
          <section id="mei-pequenas" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              MEI e pequenas empresas têm benefícios extras por lei
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A Lei Complementar 123/2006 (Estatuto Nacional da Microempresa e Empresa de Pequeno Porte) criou um conjunto de vantagens específicas para MEI, ME e EPP nas licitações públicas. Se sua empresa se enquadra, você tem <strong>direito a tratamento preferencial</strong> — e poucos sabem disso.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                { t: 'Empate ficto', d: 'Se uma ME ou EPP oferecer preço até 10% acima do menor lance, ela tem direito a cobrir a oferta e ganhar a licitação. Isso muda completamente a dinâmica da disputa.' },
                { t: 'Prazo para regularizar documentação', d: 'MPE pode ser declarada vencedora mesmo com certidões irregulares, desde que regularize em 5 dias úteis após a declaração de vencedor.' },
                { t: 'Cotas reservadas', d: 'Em itens divisíveis de compras comuns, a lei exige que 25% do objeto seja licitado exclusivamente entre ME e EPP. Menos concorrência garantida por lei.' },
                { t: 'Licitações exclusivas', d: 'Contratos de até R$80.000 podem ser licitados exclusivamente para ME e EPP — sem concorrência de grandes empresas.' },
              ].map(({ t, d }) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#C9A65A] font-black text-base shrink-0 mt-0.5">★</span>
                  <div>
                    <strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>
                    {d}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Seção 5 */}
          <section id="quanto-paga" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Quanto o governo paga e em quanto tempo
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Uma das maiores dúvidas de quem está entrando no mercado público é: o governo realmente paga? E quando?
            </p>
            <div className="space-y-3 mb-6">
              {[
                { q: 'O governo sempre paga?', r: 'Sim. O poder público tem obrigação legal de honrar os contratos. Municípios pequenos podem atrasar ocasionalmente, mas o pagamento é garantido por lei. Inadimplência definitiva é excepcionalíssima.' },
                { q: 'Em quanto tempo?', r: 'O prazo legal é 30 dias após a entrega do produto ou serviço e emissão da nota fiscal. Órgãos federais tendem a pagar dentro desse prazo. Municipais variam mais.' },
                { q: 'O que acontece se atrasar?', r: 'Atraso acima de 30 dias gera correção monetária automática pelo IPCA e juros moratórios. Você pode cobrar por carta ou notificação e o pagamento é obrigatório.' },
                { q: 'Contratos mensais pagam todo mês?', r: 'Sim. Contratos de prestação de serviços continuados (limpeza, segurança, TI) têm medição mensal e pagamento em até 30 dias da medição. É receita recorrente previsível.' },
              ].map(({ q, r }) => (
                <details key={q} className="border border-[#F0EDE8] rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 cursor-pointer font-semibold text-sm text-[#1A1A1C] list-none flex items-center justify-between gap-2">
                    {q}
                    <span className="text-[#6B0F1A] text-lg shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[#4a4a4d] leading-relaxed border-t border-[#F0EDE8] pt-3">
                    {r}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA intermediário */}
          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Comece hoje</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              Monitore editais do seu segmento — 7 dias grátis
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              Cadastre as palavras-chave do que você vende e receba alertas de licitações novas por e-mail e Telegram.
            </p>
            <Link href="/cadastro" className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Criar conta gratuita →
            </Link>
          </div>

          {/* Seção 6 */}
          <section id="como-comecar" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como começar sem experiência anterior
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A maioria das pessoas acha que precisa contratar um despachante, um advogado ou fazer um curso caro antes de participar da primeira licitação. Não precisa. O roteiro para o primeiro contrato é mais simples do que parece:
            </p>
            <ol className="space-y-4 mb-6">
              {[
                { t: 'Regularize a documentação básica', d: 'CNPJ ativo, certidões negativas atualizadas (CND Federal, FGTS, CNDT, Estadual, Municipal). Leva 1 a 2 dias e a maioria é gratuita. Crie um calendário de vencimento.' },
                { t: 'Cadastre no SICAF', d: 'O Sistema de Cadastro Unificado de Fornecedores é o cadastro federal. Permite participar de pregões no Compras.gov.br sem enviar documentos em cada licitação.' },
                { t: 'Comece por produtos simples', d: 'Material de escritório, limpeza, alimentação — itens que sua empresa já vende. Editais de produtos têm menos exigências técnicas e são ideais para acumular experiência.' },
                { t: 'Monitore editais de R$20.000 a R$80.000', d: 'Nessa faixa, os editais costumam ser exclusivos para ME e EPP. Menos concorrência, exigências menores, processo mais rápido.' },
                { t: 'Participe como ouvinte antes de dar o primeiro lance', d: 'Nos pregões eletrônicos, você pode entrar como espectador. Acompanhe 2 ou 3 sessões antes de disputar — entenda o ritmo, os lances e as táticas.' },
              ].map(({ t, d }, i) => (
                <li key={t} className="flex gap-4 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="w-7 h-7 rounded-full bg-[#6B0F1A] text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>
                    {d}
                  </div>
                </li>
              ))}
            </ol>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Dica prática:</strong> o primeiro contrato é sempre o mais difícil de conseguir — não pela competição, mas pela insegurança. Depois do primeiro, o processo vira rotina. A maioria das empresas que entram no mercado público não saem mais.
            </div>
          </section>

          {/* Seção 7 */}
          <section id="documentos" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Documentação: o que você precisa ter em dia
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A documentação é o maior vilão de quem está começando. Não porque seja difícil de obter — mas porque as certidões vencem e precisam ser renovadas. Veja o que você precisa e com que frequência renovar:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F0]">
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Documento</th>
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Validade</th>
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Onde emitir</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['CND Federal (SRF)', '180 dias', 'Receita Federal'],
                    ['CRF – FGTS', '30 dias', 'Caixa Econômica'],
                    ['CNDT – Trabalhista', '180 dias', 'TST'],
                    ['Certidão Estadual', '60–180 dias', 'Sefaz do estado'],
                    ['Certidão Municipal', '60–180 dias', 'Prefeitura'],
                    ['Contrato Social / MEI', 'Sem vencimento', 'Junta Comercial / DREI'],
                  ].map(([doc, val, onde]) => (
                    <tr key={doc} className="border-b border-[#F0EDE8]">
                      <td className="px-4 py-3 text-[#1A1A1C] font-medium">{doc}</td>
                      <td className="px-4 py-3 text-[#4a4a4d]">{val}</td>
                      <td className="px-4 py-3 text-[#4a4a4d]">{onde}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              Leia o guia completo:{' '}
              <Link href="/documentos-para-habilitacao-em-licitacoes" className="text-[#6B0F1A] no-underline hover:underline font-semibold">
                Documentos para habilitação em licitações →
              </Link>
            </p>
          </section>

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
                { href: '/como-ganhar-primeiro-contrato-publico', label: 'Como ganhar o primeiro contrato público' },
                { href: '/documentos-para-habilitacao-em-licitacoes', label: 'Documentos para habilitação em licitações' },
                { href: '/guia-modalidades-licitacao', label: 'Guia de modalidades de licitação' },
                { href: '/como-monitorar-licitacoes', label: 'Como monitorar licitações públicas' },
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
