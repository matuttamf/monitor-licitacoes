import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Monitorar Licitações Públicas — Guia Completo 2025',
  description:
    'Guia passo a passo para monitorar licitações públicas no Brasil: PNCP, ComprasNet, BLL, portais estaduais. Aprenda a consultar editais abertos, receber alertas e nunca mais perder um pregão eletrônico.',
  keywords: [
    'como monitorar licitações', 'monitorar licitações públicas', 'consultar licitações abertas',
    'acompanhar licitações do dia', 'onde encontrar licitações públicas', 'plataforma de licitação gratuita',
    'empresas que participam de licitações', 'pregão eletrônico PNCP', 'PNCP licitações',
    'ComprasNet licitações', 'alerta de licitações', 'como participar de licitações',
    'licitações para MEI', 'licitações para pequenas empresas',
  ],
  alternates: { canonical: 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes' },
  openGraph: {
    title: 'Como Monitorar Licitações Públicas — Guia Completo 2025',
    description: 'Guia passo a passo para monitorar licitações do PNCP, ComprasNet e BLL.',
    url: 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes',
    type: 'article',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Monitorar Licitações Públicas no Brasil — Guia Completo',
  description: 'Guia passo a passo para monitorar licitações públicas: PNCP, ComprasNet, BLL, portais estaduais e municipais.',
  author: { '@type': 'Organization', name: 'Monitor de Licitações', url: 'https://monitordelicitacoes.com.br' },
  publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: 'https://monitordelicitacoes.com.br' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes' },
  inLanguage: 'pt-BR',
  datePublished: '2025-01-01',
  dateModified: '2025-06-17',
  keywords: 'como monitorar licitações, consultar licitações abertas, pregão eletrônico, PNCP, ComprasNet',
}

export default function ComoMonitorarLicitacoes() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      {/* Header simples */}
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
            O governo federal gasta R$2,4 trilhões por ano em licitações públicas. A maioria das empresas perde contratos não por falta de capacidade — por falta de informação a tempo. Este guia explica como monitorar editais de forma eficiente, desde os portais oficiais até alertas automáticos.
          </p>

          {/* Índice */}
          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste guia</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#onde-encontrar', 'Onde encontrar licitações públicas no Brasil'],
                ['#como-consultar', 'Como consultar licitações abertas hoje'],
                ['#alerta-automatico', 'Como receber alertas automáticos de licitações'],
                ['#pregao-eletronico', 'Pregão eletrônico: como não perder o prazo'],
                ['#mei-pequenas', 'Licitações para MEI e pequenas empresas'],
                ['#plataforma-gratuita', 'Plataforma de monitoramento gratuita'],
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
                { n: 'PNCP', d: 'Portal oficial do Governo Federal. Obrigatório para contratações acima dos limites da Nova Lei de Licitações.' },
                { n: 'ComprasNet', d: 'Sistema de compras federal (SIASG). Ainda ativo e com grande volume de pregões federais.' },
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

          {/* Seção 3 */}
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

          {/* Seção 4 */}
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

          {/* Seção 5 */}
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

          {/* Seção 6 */}
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

            {/* CTA final — simples, não intrusivo */}
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

          {/* Links internos */}
          <div className="border-t border-[#E8E4DC] pt-6 text-sm text-[#9AA0A6]">
            Veja também:{' '}
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">como funciona o Monitor de Licitações</Link>
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
          {[['Início', '/'], ['Planos', '/assinar'], ['Contato', '/contato'], ['Entrar', '/login'], ['Cadastrar', '/cadastro']].map(([label, href]) => (
            <Link key={label} href={href} className="text-sm text-[rgba(255,255,255,0.3)] no-underline">{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
