import Link from 'next/link'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Monitorar Licitações Públicas — Guia Completo 2026',
  description:
    'Guia atualizado 2026: como monitorar licitações públicas no Brasil — PNCP, ComprasNet, BLL, portais estaduais. Aprenda palavras-chave para buscar editais, receber alertas e nunca perder um pregão eletrônico.',
  keywords: [
    'como monitorar licitações', 'monitorar licitações públicas', 'consultar licitações abertas',
    'acompanhar licitações do dia', 'onde encontrar licitações públicas', 'plataforma de licitação gratuita',
    'como buscar licitações', 'palavras-chave para licitações', 'buscar editais de licitação',
    'empresas que participam de licitações', 'pregão eletrônico PNCP', 'PNCP licitações',
    'ComprasNet licitações', 'alerta de licitações', 'como participar de licitações',
    'licitações para MEI', 'licitações para pequenas empresas',
  ],
  alternates: { canonical: 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes' },
  openGraph: {
    title: 'Como Monitorar Licitações Públicas — Guia Completo 2026',
    description: 'Guia passo a passo para monitorar licitações do PNCP, ComprasNet e BLL. Inclui palavras-chave por segmento.',
    url: 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes',
    type: 'article',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Monitorar Licitações Públicas no Brasil — Guia Completo 2026',
  description: 'Guia passo a passo para monitorar licitações públicas: PNCP, ComprasNet, BLL, portais estaduais e municipais. Inclui palavras-chave por segmento.',
  author: { '@type': 'Organization', name: 'Monitor de Licitações', url: 'https://monitordelicitacoes.com.br' },
  publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: 'https://monitordelicitacoes.com.br' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes' },
  inLanguage: 'pt-BR',
  datePublished: `${new Date().getFullYear()}-01-01`,
  dateModified: '2026-06-21',
  keywords: 'como monitorar licitações, como buscar licitações, palavras-chave licitações, consultar licitações abertas, pregão eletrônico, PNCP, ComprasNet',
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Onde encontrar licitações públicas abertas hoje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Os principais portais são o PNCP (Portal Nacional de Contratações Públicas), ComprasNet (Compras.gov.br), BLL (Bolsa de Licitações) e portais estaduais como BEC-SP e LicitaNet. Plataformas de monitoramento como o Monitor de Licitações consolidam todos esses portais em um único painel.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quais palavras-chave usar para buscar licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use termos técnicos que descrevam o produto ou serviço que você oferece. Exemplos: empresa de TI → "desenvolvimento de sistema", "suporte técnico", "notebooks"; limpeza → "serviços de limpeza", "conservação predial"; construção → "obra civil", "pavimentação", "reforma predial". Evite termos genéricos como "serviços" — prefira nomes técnicos do produto.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como receber alertas automáticos de licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cadastre palavras-chave do que você vende em uma plataforma de monitoramento. O sistema rastreia PNCP, ComprasNet e portais estaduais automaticamente e envia alertas por e-mail, Telegram ou WhatsApp quando novos editais compatíveis são publicados. O processo leva menos de 5 minutos para configurar.',
      },
    },
    {
      '@type': 'Question',
      name: 'MEI pode participar de licitações públicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. MEI pode participar de licitações de até R$80.000. A Lei Complementar 123/2006 garante tratamento favorecido: direito de empate ficto (cobrir preço que seja até 10% maior), prazo extra para regularizar documentação e cotas reservadas em itens divisíveis.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferença entre PNCP e ComprasNet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O PNCP (Portal Nacional de Contratações Públicas) é o novo portal oficial criado pela Nova Lei de Licitações (Lei 14.133/2021) e é obrigatório para contratações acima dos limites legais. O ComprasNet (Compras.gov.br) é o sistema federal mais antigo, ainda ativo com grande volume de pregões federais. Ambos coexistem e publicam editais diferentes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Com quantos dias de antecedência devo monitorar licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Quanto antes, melhor. O prazo mínimo legal entre publicação e sessão é de 8 dias úteis para pregão eletrônico e 3 dias para dispensa eletrônica. Quem recebe o alerta no dia da publicação tem o dobro do tempo para analisar o edital e preparar uma proposta competitiva.',
      },
    },
  ],
}

export default function ComoMonitorarLicitacoes() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Header simples */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[64px] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl border-b border-[#F0EDE8]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-[8px] bg-[#6B0F1A] flex items-center justify-center font-black text-[11px] text-[#C9A65A] shrink-0">ML</div>
          <span className="font-semibold text-sm text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavArticlesDropdown />
          <Link href="/assinar" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Planos</Link>
          <Link href="/login" className="px-3 py-2 text-sm text-[#6B7280] no-underline">Entrar</Link>
          <Link href="/cadastro" className="px-4 py-2 text-sm font-semibold bg-[#6B0F1A] text-white no-underline rounded-lg">Começar grátis</Link>
        </div>
      </header>

      {/* Artigo */}
      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[680px] mx-auto">

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <span>Guia</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Guia completo</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Como monitorar licitações públicas no Brasil — guia passo a passo
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            O governo federal gasta mais de R$2 trilhões por ano em licitações públicas. A maioria das empresas perde contratos não por falta de capacidade — por falta de informação a tempo. Este guia explica como monitorar editais de forma eficiente: dos portais oficiais às palavras-chave certas para cada segmento.
          </p>

          {/* Índice */}
          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste guia</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#onde-encontrar', 'Onde encontrar licitações públicas no Brasil'],
                ['#como-consultar', 'Como consultar licitações abertas hoje'],
                ['#palavras-chave', 'Como escolher palavras-chave para buscar licitações'],
                ['#alerta-automatico', 'Como receber alertas automáticos de licitações'],
                ['#pregao-eletronico', 'Pregão eletrônico: como não perder o prazo'],
                ['#mei-pequenas', 'Licitações para MEI e pequenas empresas'],
                ['#plataforma-gratuita', 'Plataforma de monitoramento gratuita'],
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
          <section id="onde-encontrar" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Onde encontrar licitações públicas no Brasil
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O governo federal centraliza a maioria das licitações no <strong>PNCP — Portal Nacional de Contratações Públicas</strong> (<a href="https://www.gov.br/pncp" target="_blank" rel="noopener noreferrer" className="text-[#6B0F1A] no-underline underline decoration-dotted">pncp.gov.br</a>), criado pela Lei 14.133/2021. Mas o PNCP sozinho não cobre tudo: parte dos editais — especialmente de municípios menores e estatais — é publicada em outros portais.
            </p>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">Os principais portais a monitorar:</p>
            <ul className="space-y-3 mb-6">
              {[
                { n: 'PNCP', d: 'Portal oficial do Governo Federal. Obrigatório para contratações acima dos limites da Nova Lei de Licitações (Lei 14.133/2021).' },
                { n: 'ComprasNet (Compras.gov.br)', d: 'Sistema de compras federal (SIASG). Ainda ativo com grande volume de pregões federais.' },
                { n: 'BLL — Bolsa de Licitações', d: 'Muito usado por municípios e estatais. Editais publicados aqui frequentemente não aparecem no PNCP.' },
                { n: 'Portais estaduais', d: 'BEC-SP, LicitaNet, e-Licitações-RJ, SEAD-BA e dezenas de outros — cada estado tem o seu.' },
                { n: 'Diário Oficial', d: 'Avisos de licitação e dispensas publicados nos DOs federal, estaduais e municipais.' },
                { n: 'Portais de estatais', d: 'Petrobras, Caixa, Correios, Eletrobras e SABESP publicam em sistemas próprios.' },
              ].map(({ n, d }) => (
                <li key={n} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#6B0F1A] font-bold shrink-0 mt-0.5">→</span>
                  <span><strong className="text-[#1A1A1C]">{n}:</strong> {d}</span>
                </li>
              ))}
            </ul>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              Monitorar todos esses portais manualmente consome 2 a 3 horas por dia — e ainda assim você pode perder editais no portal que não verificou naquele dia.
            </div>
          </section>

          {/* Seção 2 */}
          <section id="como-consultar" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como consultar licitações abertas hoje
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Há dois caminhos para consultar os editais abertos no momento:
            </p>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-3">
              <strong className="text-[#1A1A1C]">1. Acesso direto ao PNCP.</strong> No portal você filtra por modalidade (pregão, concorrência, dispensa), UF, órgão e intervalo de datas. É gratuito e sem cadastro, mas exige pesquisa manual repetitiva em cada portal separado.
            </p>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              <strong className="text-[#1A1A1C]">2. Plataforma de monitoramento integrada.</strong> Ferramentas como o Monitor de Licitações centralizam PNCP, ComprasNet, BLL e portais estaduais num único painel de busca. Você informa o produto ou serviço que vende e o sistema retorna os editais compatíveis de qualquer portal.
            </p>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Atenção ao prazo:</strong> editais têm vida média de 5 dias úteis no PNCP. Quem consulta manualmente uma vez por semana já perdeu a maioria das oportunidades antes de vê-las.
            </div>
          </section>

          {/* Seção 3 — NOVA */}
          <section id="palavras-chave" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como escolher palavras-chave para buscar licitações
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A qualidade das palavras-chave que você cadastra determina quais editais você encontra. Termos genéricos trazem muito ruído; termos muito específicos fazem você perder oportunidades. O equilíbrio certo é usar <strong>nomes técnicos do produto ou serviço</strong> como aparecem nos editais públicos.
            </p>

            <h3 className="text-base font-bold text-[#1A1A1C] mb-3">Exemplos por segmento</h3>
            <div className="space-y-4 mb-6">
              {[
                {
                  seg: 'Tecnologia e TI',
                  termos: ['desenvolvimento de sistema', 'suporte técnico', 'notebooks', 'licença de software', 'infraestrutura de TI', 'segurança da informação'],
                },
                {
                  seg: 'Limpeza e conservação',
                  termos: ['serviços de limpeza', 'conservação predial', 'coleta de resíduos', 'desinsetização', 'higienização'],
                },
                {
                  seg: 'Construção civil',
                  termos: ['obra civil', 'pavimentação', 'reforma predial', 'construção de escola', 'drenagem'],
                },
                {
                  seg: 'Saúde',
                  termos: ['material hospitalar', 'medicamento', 'equipamento médico', 'insumo farmacêutico', 'serviço laboratorial'],
                },
                {
                  seg: 'Alimentação',
                  termos: ['gêneros alimentícios', 'merenda escolar', 'refeições coletivas', 'PNAE', 'buffet'],
                },
                {
                  seg: 'Material de escritório',
                  termos: ['material de expediente', 'papel A4', 'cartucho de impressora', 'toner', 'material de papelaria'],
                },
              ].map(({ seg, termos }) => (
                <div key={seg} className="p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#6B0F1A] mb-2">{seg}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {termos.map(t => (
                      <span key={t} className="text-xs px-2 py-1 rounded-md bg-white border border-[#E8E4DC] text-[#4a4a4d]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-base font-bold text-[#1A1A1C] mb-3">Regras para boas palavras-chave</h3>
            <ul className="space-y-2.5 mb-6">
              {[
                ['Use o nome técnico do produto', 'Escreva como o comprador público escreveria no edital. "Oxímetro de pulso" rende mais resultados do que "equipamento médico".'],
                ['Evite termos genéricos', '"Serviços" ou "fornecimento" como única palavra-chave traz todo tipo de edital sem filtro útil.'],
                ['Use variações e sinônimos', 'Cadastre "notebook" e também "computador portátil" — diferentes órgãos usam termos diferentes para o mesmo produto.'],
                ['Inclua o CATMAT/CATSER quando souber', 'O código de material ou serviço do Comprasnet garante precisão máxima na busca.'],
                ['Combine com filtro de região', 'Palavras-chave precisas + região correta = zero ruído, apenas oportunidades reais.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#6B0F1A] font-bold shrink-0 mt-0.5">✓</span>
                  <span><strong className="text-[#1A1A1C]">{t}:</strong> {d}</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              O Monitor de Licitações permite cadastrar até 20 palavras-chave por conta, com filtro de região por estado ou macrorregião. O sistema cruza os termos com o objeto dos editais em tempo real.
            </div>

            {/* Link para páginas de segmento */}
            <p className="text-sm text-[#4a4a4d] mt-4">
              Veja guias detalhados por segmento com exemplos de palavras-chave:{' '}
              <Link href="/licitacoes-para" className="text-[#6B0F1A] no-underline hover:underline font-semibold">
                Licitações por segmento →
              </Link>
            </p>
          </section>

          {/* Seção 4 */}
          <section id="alerta-automatico" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Como receber alertas automáticos de licitações
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A forma mais eficiente de monitorar licitações é configurar alertas automáticos. O processo é simples e leva menos de 5 minutos:
            </p>
            <ol className="space-y-4 mb-6">
              {[
                { t: 'Cadastre as palavras-chave do que você vende', d: 'Informe os produtos, serviços ou materiais que sua empresa fornece — ex: "cadeiras ergonômicas", "serviço de TI", "material de limpeza". Você pode cadastrar até 20 termos.' },
                { t: 'O sistema monitora todos os portais automaticamente', d: 'A plataforma rastreia PNCP, ComprasNet, BLL e portais estaduais em tempo real, cruzando os objetos dos editais com os seus termos.' },
                { t: 'Você recebe o alerta no canal que preferir', d: 'E-mail, Telegram ou WhatsApp — assim que um edital compatível é publicado, a notificação chega sem precisar acessar nenhum portal.' },
              ].map(({ t, d }, i) => (
                <li key={t} className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <div className="text-sm text-[#4a4a4d] leading-relaxed">
                    <strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>
                    {d}
                  </div>
                </li>
              ))}
            </ol>

            {/* CTA inline discreto */}
            <div className="border border-[#E8E4DC] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1A1A1C] mb-0.5">Configure seus alertas gratuitamente</p>
                <p className="text-xs text-[#9AA0A6]">7 dias grátis · Sem cartão · Cancele quando quiser</p>
              </div>
              <Link href="/cadastro" className="shrink-0 px-5 py-2.5 rounded-lg bg-[#6B0F1A] text-white text-sm font-semibold no-underline text-center">
                Começar grátis →
              </Link>
            </div>
          </section>

          {/* Seção 5 */}
          <section id="pregao-eletronico" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Pregão eletrônico: como não perder o prazo
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O <strong>pregão eletrônico</strong> representa mais de 70% das contratações públicas no Brasil. A Nova Lei de Licitações estabelece prazos mínimos entre a publicação do edital e a sessão pública:
            </p>
            <ul className="space-y-2 mb-5 text-sm text-[#4a4a4d]">
              {[
                ['8 dias úteis', 'pregão eletrônico para bens e serviços comuns'],
                ['25 dias úteis', 'concorrência eletrônica'],
                ['3 dias úteis', 'dispensa eletrônica'],
              ].map(([prazo, label]) => (
                <li key={prazo} className="flex gap-3">
                  <strong className="text-[#1A1A1C] shrink-0">{prazo}:</strong>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Na prática, a maioria dos pregões no PNCP tem janela próxima ao prazo mínimo — o que torna cada dia de atraso na descoberta do edital diretamente prejudicial à qualidade da proposta. Quem recebe o alerta no dia da publicação tem o dobro do tempo para analisar o edital, calcular custos e verificar a concorrência.
            </p>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              Empresas que monitoram manualmente (consultando portais uma vez por semana) chegam a editais com menos de 3 dias úteis restantes — tempo insuficiente para proposta competitiva na maioria dos casos.
            </div>
          </section>

          {/* Seção 6 */}
          <section id="mei-pequenas" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Licitações para MEI e pequenas empresas
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A Lei Complementar 123/2006 garante tratamento diferenciado para <strong>ME, MEI e EPP</strong> nas licitações públicas. São vantagens legais que as grandes empresas não têm:
            </p>
            <ul className="space-y-2.5 mb-5">
              {[
                ['Licitações exclusivas para ME/EPP', 'Itens de até R$80.000 podem ser reservados exclusivamente para micro e pequenas empresas.'],
                ['Direito de empate ficto', 'Se sua proposta for até 10% maior que a mais barata, você tem prioridade para cobrir o preço.'],
                ['Prazo extra para regularizar documentação', '5 dias úteis adicionais para apresentar certidões negativas com pendências menores.'],
                ['Cota de 25% reservada', 'Em itens divisíveis, 25% da quantidade fica reservada para ME/EPP.'],
                ['Preferência local', 'Municípios podem dar preferência para empresas locais em contratos de até R$80.000.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#6B0F1A] font-bold shrink-0 mt-0.5">✓</span>
                  <span><strong className="text-[#1A1A1C]">{t}:</strong> {d}</span>
                </li>
              ))}
            </ul>
            <p className="text-base text-[#4a4a4d] leading-relaxed">
              O obstáculo para a maioria das empresas pequenas não é a capacidade técnica — é ter informação a tempo. Com as vantagens da LC 123, muitos pregões são ganhados por MEI e ME antes mesmo da disputa de preços.
            </p>
          </section>

          {/* Seção 7 */}
          <section id="plataforma-gratuita" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">
              Plataforma de monitoramento de licitações gratuita
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O Monitor de Licitações oferece <strong>7 dias gratuitos</strong> sem cartão de crédito. Durante o período de teste você tem acesso completo:
            </p>
            <ul className="space-y-2 mb-6 text-sm text-[#4a4a4d]">
              {[
                'Alertas automáticos por e-mail, Telegram e WhatsApp',
                'Busca integrada em PNCP, ComprasNet e BLL',
                'Análise de preços vencedores para calibrar propostas',
                'Histórico de editais e exportação de dados',
              ].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#6B0F1A] shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA final */}
            <div className="bg-[#1A1A1C] rounded-xl px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1">
                <p className="text-white font-semibold text-base mb-1">Comece a monitorar hoje</p>
                <p className="text-[rgba(255,255,255,0.45)] text-sm">Configure em 2 minutos. Primeiro alerta em até 24h.</p>
              </div>
              <Link href="/cadastro" className="shrink-0 px-6 py-3 rounded-lg bg-[#6B0F1A] text-white text-sm font-semibold no-underline text-center shadow-[0_4px_16px_rgba(107,15,26,0.5)]">
                Começar gratuitamente →
              </Link>
            </div>
          </section>

          {/* Seção FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-6">
              Perguntas frequentes
            </h2>
            <div className="space-y-3">
              {[
                {
                  p: 'Onde encontrar licitações públicas abertas hoje?',
                  r: 'Os principais portais são o PNCP (Portal Nacional de Contratações Públicas), ComprasNet (Compras.gov.br), BLL e portais estaduais como BEC-SP e LicitaNet. Plataformas de monitoramento consolidam todos esses portais em um único painel.',
                },
                {
                  p: 'Quais palavras-chave usar para buscar licitações?',
                  r: 'Use termos técnicos que descrevam o que você vende. Empresa de TI → "desenvolvimento de sistema", "suporte técnico"; limpeza → "serviços de limpeza", "conservação predial"; construção → "obra civil", "pavimentação". Evite termos genéricos — prefira nomes técnicos como aparecem nos editais.',
                },
                {
                  p: 'Qual a diferença entre PNCP e ComprasNet?',
                  r: 'O PNCP é o novo portal oficial da Nova Lei de Licitações (Lei 14.133/2021), obrigatório para contratações acima dos limites legais. O ComprasNet é o sistema federal mais antigo, ainda ativo com grande volume de pregões. Ambos coexistem e publicam editais diferentes.',
                },
                {
                  p: 'MEI pode participar de licitações públicas?',
                  r: 'Sim. MEI pode participar de licitações de até R$80.000. A Lei Complementar 123/2006 garante empate ficto (cobrir preço até 10% maior), prazo extra para regularização de documentação e cotas reservadas em itens divisíveis.',
                },
                {
                  p: 'Com quantos dias de antecedência devo monitorar licitações?',
                  r: 'Quanto antes, melhor. O prazo mínimo legal é de 8 dias úteis para pregão eletrônico e 3 dias para dispensa. Quem recebe o alerta no dia da publicação tem o dobro do tempo para preparar uma proposta competitiva.',
                },
                {
                  p: 'É necessário se cadastrar no SICAF para participar de licitações?',
                  r: 'Para licitações federais, o SICAF (Sistema de Cadastro Unificado de Fornecedores) é o cadastro necessário. Para licitações estaduais e municipais, cada portal pode ter seu próprio cadastro. Muitos editais aceitam a documentação avulsa sem cadastro prévio.',
                },
              ].map(({ p, r }) => (
                <details key={p} className="group border border-[#F0EDE8] rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-4 md:p-5 font-semibold text-[#1A1A1C] text-sm leading-snug list-none">
                    {p}
                    <svg className="w-4 h-4 text-[#9AA0A6] shrink-0 ml-3 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 md:px-5 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#F0EDE8] pt-4">
                    {r}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Links internos */}
          <div className="border-t border-[#E8E4DC] pt-6 text-sm text-[#9AA0A6]">
            Veja também:{' '}
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">como funciona o Monitor de Licitações</Link>
            {' '}·{' '}
            <Link href="/licitacoes-para" className="text-[#6B0F1A] no-underline hover:underline">licitações por segmento</Link>
            {' '}·{' '}
            <Link href="/assinar" className="text-[#6B0F1A] no-underline hover:underline">planos e preços</Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#111113] px-6 md:px-10 py-7 text-center mt-10">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-[7px] bg-[#6B0F1A] flex items-center justify-center text-[10px] font-black text-[#C9A65A]">ML</div>
          <span className="text-sm text-[rgba(255,255,255,0.25)]">© 2021–{new Date().getFullYear()} Monitor de Licitações · Matutta Soluções Digitais</span>
        </div>
        <div className="flex gap-6 justify-center flex-wrap">
          {[['Início', '/'], ['Segmentos', '/licitacoes-para'], ['Planos', '/assinar'], ['Contato', '/contato'], ['Entrar', '/login'], ['Cadastrar', '/cadastro']].map(([label, href]) => (
            <Link key={label} href={href} className="text-sm text-[rgba(255,255,255,0.3)] no-underline">{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
