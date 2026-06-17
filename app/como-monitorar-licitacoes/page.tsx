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
  alternates: {
    canonical: 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes',
  },
  openGraph: {
    title: 'Como Monitorar Licitações Públicas — Guia Completo 2025',
    description:
      'Guia passo a passo para monitorar licitações do PNCP, ComprasNet e BLL. Consulte editais abertos, receba alertas e nunca perca um pregão eletrônico.',
    url: 'https://monitordelicitacoes.com.br/como-monitorar-licitacoes',
    type: 'article',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Monitorar Licitações Públicas no Brasil — Guia Completo',
  description:
    'Guia passo a passo para monitorar licitações públicas: PNCP, ComprasNet, BLL, portais estaduais e municipais.',
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
    <div className="font-sans bg-[#FAF6F0] text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[68px] bg-[rgba(250,246,240,0.97)] backdrop-blur-xl border-b border-[rgba(201,166,90,0.12)]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-[9px] bg-[#6B0F1A] flex items-center justify-center font-black text-xs text-[#C9A65A] shrink-0">ML</div>
          <span className="font-bold text-base text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Entrar</Link>
          <Link href="/cadastro" className="px-4 md:px-[22px] py-2.5 text-sm font-bold bg-[#6B0F1A] text-white no-underline rounded-[10px]">Começar grátis</Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-6 md:px-[60px] py-4 border-b border-[#E8E4DC] bg-white">
        <div className="max-w-[800px] mx-auto text-sm text-[#9AA0A6]">
          <Link href="/" className="text-[#6B0F1A] no-underline">Início</Link>
          <span className="mx-2">›</span>
          <span>Como monitorar licitações públicas</span>
        </div>
      </div>

      {/* Artigo */}
      <main className="px-6 md:px-[60px] py-14 md:py-20">
        <article className="max-w-[800px] mx-auto">

          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Guia completo · Atualizado em 2025</div>

          <h1 className="text-3xl md:text-[46px] font-black leading-tight tracking-tight text-[#1A1A1C] mb-6">
            Como monitorar licitações públicas no Brasil — guia passo a passo
          </h1>

          <p className="text-lg text-[#4a4a4d] leading-relaxed mb-10 border-l-4 border-[#6B0F1A] pl-5">
            Monitorar licitações públicas manualmente exige vasculhar o PNCP, ComprasNet, BLL e dezenas de portais estaduais e municipais todos os dias. Neste guia você aprende as melhores formas de acompanhar editais abertos, receber alertas automáticos e nunca mais perder um pregão eletrônico.
          </p>

          {/* Índice */}
          <nav className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-[#9AA0A6] mb-3">Neste guia</div>
            <ol className="space-y-2 text-sm">
              {[
                ['#onde-encontrar', 'Onde encontrar licitações públicas no Brasil'],
                ['#como-consultar', 'Como consultar licitações abertas hoje'],
                ['#alerta-automatico', 'Como receber alertas automáticos de licitações'],
                ['#pregao-eletronico', 'Pregão eletrônico: como não perder o prazo'],
                ['#mei-pequenas', 'Licitações para MEI e pequenas empresas'],
                ['#plataforma-gratuita', 'Plataforma de monitoramento gratuita'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-[#6B0F1A] no-underline font-medium">{label}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Seção 1 */}
          <section className="mb-14" id="onde-encontrar">
            <h2 className="text-2xl md:text-[28px] font-black text-[#1A1A1C] mb-4">
              Onde encontrar licitações públicas no Brasil
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O governo federal centraliza a maioria das licitações no <strong>PNCP — Portal Nacional de Contratações Públicas</strong> (<a href="https://www.gov.br/pncp" target="_blank" rel="noopener noreferrer" className="text-[#6B0F1A] no-underline font-semibold">pncp.gov.br</a>), criado pela Lei 14.133/2021 (Nova Lei de Licitações). Além do PNCP, existem outros portais importantes:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { nome: 'PNCP', desc: 'Portal oficial do Governo Federal. Obrigatório para contratações acima dos limites da lei.', url: 'gov.br/pncp' },
                { nome: 'ComprasNet', desc: 'Sistema de compras do Governo Federal (SIASG). Pregões federais históricos e vigentes.', url: 'comprasnet.gov.br' },
                { nome: 'BLL — Bolsa de Licitações', desc: 'Marketplace privado muito usado por municípios e empresas estatais.', url: 'bll.org.br' },
                { nome: 'Portais estaduais', desc: 'Cada estado tem seu portal próprio: BEC-SP, LicitaNet, e-Licitações, entre outros.' },
                { nome: 'Diário Oficial', desc: 'Avisos de licitação, dispensas e contratos são publicados nos Diários Oficiais federal, estaduais e municipais.' },
                { nome: 'Portais de estatais', desc: 'Petrobras, Caixa, Correios, Eletrobras e SABESP publicam licitações em portais próprios.' },
              ].map(p => (
                <div key={p.nome} className="bg-white rounded-xl p-5 border border-[#E8E4DC]">
                  <div className="font-bold text-[#1A1A1C] text-sm mb-1">{p.nome}</div>
                  <div className="text-sm text-[#4a4a4d] leading-relaxed">{p.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#9AA0A6] leading-relaxed bg-white rounded-xl border border-[#E8E4DC] p-4">
              <strong className="text-[#4a4a4d]">Problema:</strong> monitorar todos esses portais manualmente consome 2 a 3 horas por dia e ainda assim você pode perder editais publicados em portais que não verificou. É por isso que ferramentas automáticas de monitoramento existem.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-14" id="como-consultar">
            <h2 className="text-2xl md:text-[28px] font-black text-[#1A1A1C] mb-4">
              Como consultar licitações abertas hoje
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Para consultar as licitações abertas no momento, você tem dois caminhos:
            </p>
            <ol className="space-y-5 mb-6">
              <li className="bg-white rounded-xl border border-[#E8E4DC] p-5">
                <div className="font-bold text-[#1A1A1C] mb-1">1. Acesso direto ao PNCP</div>
                <p className="text-sm text-[#4a4a4d] leading-relaxed">
                  No PNCP você filtra por modalidade (pregão, concorrência, dispensa), UF, órgão e intervalo de datas. É gratuito mas exige pesquisa manual repetitiva.
                </p>
              </li>
              <li className="bg-white rounded-xl border border-[#E8E4DC] p-5">
                <div className="font-bold text-[#1A1A1C] mb-1">2. Plataforma de monitoramento com busca integrada</div>
                <p className="text-sm text-[#4a4a4d] leading-relaxed">
                  Ferramentas como o Monitor de Licitações centralizam PNCP, ComprasNet, BLL e portais estaduais num único painel de busca. Você digita o produto ou serviço que vende e o sistema retorna todos os editais compatíveis — de qualquer portal.
                </p>
              </li>
            </ol>
            <div className="bg-[#FFF7ED] border border-[#FDDCAA] rounded-xl p-5 text-sm text-[#92400E] leading-relaxed">
              <strong>Dica importante:</strong> editais têm vida média de 5 dias úteis. Se você consultar manualmente uma vez por semana, já terá perdido a maioria das oportunidades antes de vê-las.
            </div>
          </section>

          {/* Seção 3 */}
          <section className="mb-14" id="alerta-automatico">
            <h2 className="text-2xl md:text-[28px] font-black text-[#1A1A1C] mb-4">
              Como receber alertas automáticos de licitações
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-6">
              A forma mais eficiente de monitorar licitações é configurar alertas automáticos. O processo é simples:
            </p>
            <div className="space-y-4 mb-6">
              {[
                { n: '1', t: 'Cadastre as palavras-chave do que você vende', d: 'Informe os produtos, serviços ou materiais que sua empresa fornece. Ex: "cadeiras ergonômicas", "serviço de TI", "material de limpeza".' },
                { n: '2', t: 'O sistema monitora automaticamente', d: 'A plataforma rastreia todos os portais públicos em tempo real e cruza os objetos dos editais com as suas palavras-chave.' },
                { n: '3', t: 'Você recebe o alerta no canal que preferir', d: 'E-mail, Telegram ou WhatsApp — assim que um edital compatível é publicado, a notificação chega sem precisar consultar nenhum portal.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-4 bg-white rounded-xl border border-[#E8E4DC] p-5">
                  <div className="w-8 h-8 rounded-full bg-[#6B0F1A] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">{n}</div>
                  <div>
                    <div className="font-bold text-[#1A1A1C] text-sm mb-1">{t}</div>
                    <div className="text-sm text-[#4a4a4d] leading-relaxed">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção 4 */}
          <section className="mb-14" id="pregao-eletronico">
            <h2 className="text-2xl md:text-[28px] font-black text-[#1A1A1C] mb-4">
              Pregão eletrônico: como não perder o prazo
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O <strong>pregão eletrônico</strong> é a modalidade mais comum de licitação no Brasil — representa mais de 70% das contratações públicas. No PNCP, o prazo mínimo entre a publicação e a sessão pública é de 8 dias úteis para bens e serviços comuns.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { prazo: '8 dias úteis', label: 'Prazo mínimo — pregão eletrônico (bens e serviços comuns)' },
                { prazo: '25 dias úteis', label: 'Prazo mínimo — concorrência eletrônica' },
                { prazo: '5 dias úteis', label: 'Prazo médio real de editais no PNCP em 2024' },
              ].map(({ prazo, label }) => (
                <div key={prazo} className="bg-[#1A1A1C] rounded-xl p-5 text-center">
                  <div className="text-[#C9A65A] font-black text-xl mb-1">{prazo}</div>
                  <div className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-base text-[#4a4a4d] leading-relaxed">
              Com alertas automáticos você recebe a notificação no dia da publicação — maximizando o tempo disponível para analisar o edital, preparar documentação, calcular custos e montar uma proposta competitiva.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="mb-14" id="mei-pequenas">
            <h2 className="text-2xl md:text-[28px] font-black text-[#1A1A1C] mb-4">
              Licitações para MEI e pequenas empresas
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A Lei Complementar 123/2006 garante tratamento diferenciado para <strong>ME, MEI e EPP</strong> nas licitações públicas:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                'Preferência de contratação para empresas locais em licitações de até R$ 80 mil',
                'Direito de cobrir a proposta mais barata em caso de empate (até 10% acima)',
                'Prazo adicional de 5 dias para regularizar a documentação fiscal',
                'Licitações exclusivas para ME/EPP nos itens de até R$ 80 mil',
                'Cota de 25% reservada para ME/EPP em itens divisíveis',
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="text-[#6B0F1A] font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-base text-[#4a4a4d] leading-relaxed">
              Isso significa que empresas pequenas têm <strong>vantagem legal</strong> sobre as grandes em muitos pregões. O principal obstáculo não é a capacidade técnica — é ter informação a tempo.
            </p>
          </section>

          {/* Seção 6 */}
          <section className="mb-14" id="plataforma-gratuita">
            <h2 className="text-2xl md:text-[28px] font-black text-[#1A1A1C] mb-4">
              Plataforma de monitoramento de licitações gratuita
            </h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-6">
              O Monitor de Licitações oferece <strong>7 dias gratuitos</strong> sem cartão de crédito. Durante o trial você tem acesso completo: alertas por e-mail, busca manual, painel de histórico e análise de preços vencedores.
            </p>
            <div className="bg-[#1A1A1C] rounded-2xl p-8 text-center">
              <div className="text-[#C9A65A] text-xs font-bold uppercase tracking-widest mb-3">Comece agora</div>
              <p className="text-white text-lg font-bold mb-2">
                Monitore licitações do PNCP, ComprasNet e BLL automaticamente
              </p>
              <p className="text-[rgba(255,255,255,0.45)] text-sm mb-6">
                Configure em 2 minutos. Primeiro alerta chega em até 24h.
              </p>
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold no-underline shadow-[0_8px_32px_rgba(107,15,26,0.55)]"
              >
                Começar gratuitamente →
              </Link>
              <p className="text-[rgba(255,255,255,0.25)] text-xs mt-4">7 dias grátis · Sem cartão · Cancele quando quiser</p>
            </div>
          </section>

          {/* Link interno para landing */}
          <div className="border-t border-[#E8E4DC] pt-8 mt-8 text-sm text-[#9AA0A6]">
            <p>
              Veja também:{' '}
              <Link href="/" className="text-[#6B0F1A] no-underline font-semibold">como funciona o Monitor de Licitações</Link>
              {' '}·{' '}
              <Link href="/assinar" className="text-[#6B0F1A] no-underline font-semibold">planos e preços</Link>
            </p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#111113] px-10 py-7 text-center mt-10">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-[7px] bg-[#6B0F1A] flex items-center justify-center text-[10px] font-black text-[#C9A65A]">ML</div>
          <span className="text-sm text-[rgba(255,255,255,0.25)]">© 2021–{new Date().getFullYear()} Monitor de Licitações · Matutta Soluções Digitais</span>
        </div>
        <div className="flex gap-7 justify-center flex-wrap">
          {[['Início', '/'], ['Planos', '/assinar'], ['Contato', '/contato'], ['Entrar', '/login'], ['Cadastrar', '/cadastro']].map(([label, href]) => (
            <Link key={label} href={href} className="text-sm text-[rgba(255,255,255,0.3)] no-underline">{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
