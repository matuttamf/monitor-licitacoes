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
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[68px] bg-[rgba(26,26,28,0.97)] backdrop-blur-xl border-b border-[rgba(201,166,90,0.15)]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-[9px] bg-[#6B0F1A] flex items-center justify-center font-black text-xs text-[#C9A65A] shrink-0">ML</div>
          <span className="font-bold text-base text-white tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm text-[rgba(255,255,255,0.5)] no-underline font-medium">Entrar</Link>
          <Link href="/cadastro" className="px-4 md:px-[22px] py-2.5 text-sm font-bold bg-[#6B0F1A] text-white no-underline rounded-[10px] shadow-[0_4px_16px_rgba(107,15,26,0.5)]">Começar grátis</Link>
        </div>
      </header>

      {/* Hero — dark, impactful */}
      <section className="bg-[#1A1A1C] px-6 md:px-[60px] pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-[820px] mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-[rgba(255,255,255,0.3)] mb-6">
            <Link href="/" className="text-[#C9A65A] no-underline">Início</Link>
            <span className="mx-2">›</span>
            <span>Como monitorar licitações públicas</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-[rgba(201,166,90,0.1)] border border-[rgba(201,166,90,0.25)] rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A65A] inline-block shrink-0"></span>
            <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#C9A65A]">Guia completo · Atualizado em 2025</span>
          </div>

          <h1 className="text-3xl md:text-[48px] font-black leading-[1.1] tracking-tight text-white mb-6">
            Como monitorar licitações públicas no Brasil — guia passo a passo
          </h1>

          <p className="text-lg md:text-xl text-[rgba(255,255,255,0.6)] leading-relaxed mb-10 max-w-[660px]">
            O governo federal gasta <strong className="text-white">R$2,4 trilhões por ano</strong> em licitações. Mas a maioria das empresas perde contratos não por falta de capacidade — por falta de informação a tempo.
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 md:gap-8 mb-10 border-t border-[rgba(255,255,255,0.08)] pt-8">
            {[
              { n: 'R$2,4 tri', l: 'movimentados/ano em licitações' },
              { n: '5.500+', l: 'municípios publicando editais' },
              { n: '72%', l: 'das contratações via pregão eletrônico' },
            ].map(({ n, l }) => (
              <div key={n}>
                <div className="text-base md:text-3xl font-black text-[#C9A65A] mb-1 leading-tight">{n}</div>
                <div className="text-[10px] md:text-xs text-[rgba(255,255,255,0.4)] leading-relaxed">{l}</div>
              </div>
            ))}
          </div>

          {/* Loss aversion callout */}
          <div className="bg-[rgba(107,15,26,0.35)] border border-[rgba(107,15,26,0.6)] rounded-2xl px-6 py-5">
            <p className="text-[rgba(255,255,255,0.85)] text-base leading-relaxed m-0">
              <strong className="text-white">Cada dia sem monitorar</strong> é um edital que seu concorrente já viu — e está preparando proposta. Editais fecham em média em <strong className="text-[#FCA5A5]">5 dias úteis</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Table of contents */}
      <div className="px-6 md:px-[60px] py-8 bg-white border-b border-[#E8E4DC]">
        <div className="max-w-[820px] mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-[#9AA0A6] mb-4">Neste guia</div>
          <ol className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              ['#onde-encontrar', '1. Onde encontrar licitações no Brasil'],
              ['#como-consultar', '2. Como consultar editais abertos hoje'],
              ['#alerta-automatico', '3. Como receber alertas automáticos'],
              ['#pregao-eletronico', '4. Pregão eletrônico: não perca o prazo'],
              ['#mei-pequenas', '5. Licitações para MEI e pequenas empresas'],
              ['#plataforma-gratuita', '6. Plataforma gratuita de monitoramento'],
            ].map(([href, label]) => (
              <li key={href} className="list-none">
                <a href={href as string} className="text-[#6B0F1A] no-underline font-semibold hover:underline">{label as string}</a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Article */}
      <main className="px-6 md:px-[60px] py-14 md:py-20">
        <article className="max-w-[820px] mx-auto space-y-20">

          {/* Section 1 */}
          <section id="onde-encontrar">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">1</div>
              <h2 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] m-0">
                Onde encontrar licitações públicas no Brasil
              </h2>
            </div>

            <p className="text-base text-[#4a4a4d] leading-relaxed mb-6">
              O governo federal centraliza a maioria das licitações no <strong>PNCP — Portal Nacional de Contratações Públicas</strong>, criado pela Lei 14.133/2021 (Nova Lei de Licitações). Mas apenas o PNCP já não é suficiente: há outros portais igualmente importantes.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { nome: 'PNCP', badge: 'federal', desc: 'Portal oficial do Governo Federal. Obrigatório para contratações acima dos limites da lei. Ponto de partida para qualquer monitoramento.' },
                { nome: 'ComprasNet', badge: 'federal', desc: 'Sistema de compras federal (SIASG). Pregões federais históricos e vigentes — ainda ativo mesmo após a transição para o PNCP.' },
                { nome: 'BLL — Bolsa de Licitações', badge: 'privado', desc: 'Marketplace muito usado por municípios e estatais. Parte dos editais publicados aqui não aparecem no PNCP.' },
                { nome: 'Portais estaduais', badge: 'estadual', desc: 'BEC-SP, LicitaNet, e-Licitações, SEAD-BA, SIGA-ES e dezenas de outros. Cada estado com seu próprio sistema.' },
                { nome: 'Diário Oficial', badge: 'todos', desc: 'Avisos de licitação, dispensas e contratos publicados nos Diários Oficiais federal, estaduais e municipais.' },
                { nome: 'Portais de estatais', badge: 'estatal', desc: 'Petrobras, Caixa, Correios, Eletrobras e SABESP publicam licitações em portais próprios, fora do PNCP.' },
              ].map(p => (
                <div key={p.nome} className="bg-white rounded-xl p-5 border border-[#E8E4DC] hover:border-[#C9A65A] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-[#1A1A1C] text-sm">{p.nome}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FAF6F0] text-[#9AA0A6] px-2 py-0.5 rounded-full">{p.badge}</span>
                  </div>
                  <div className="text-sm text-[#4a4a4d] leading-relaxed">{p.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#FFF7ED] border-l-4 border-[#F59E0B] rounded-r-xl px-6 py-5">
              <p className="text-sm text-[#92400E] leading-relaxed m-0">
                <strong>O problema real:</strong> monitorar todos esses portais manualmente consome <strong>2 a 3 horas por dia</strong> — e ainda assim você pode perder editais publicados no portal que não verificou naquele dia.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="como-consultar">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">2</div>
              <h2 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] m-0">
                Como consultar licitações abertas hoje
              </h2>
            </div>

            <p className="text-base text-[#4a4a4d] leading-relaxed mb-6">
              Para consultar os editais abertos no momento, você tem dois caminhos. A diferença de resultado entre eles é enorme:
            </p>

            {/* Before/After comparison */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">😓</span>
                  <span className="font-black text-[#1A1A1C] text-base">Sem ferramenta</span>
                </div>
                <ul className="space-y-2.5 text-sm text-[#4a4a4d]">
                  {[
                    'Acessa PNCP, ComprasNet, BLL um a um',
                    'Filtra manualmente por UF, órgão e datas',
                    'Lê dezenas de títulos de editais',
                    'Copia links em planilhas',
                    '2–3 horas por dia, todo dia',
                    'Ainda assim pode perder editais',
                  ].map(item => (
                    <li key={item} className="flex gap-2 list-none">
                      <span className="text-[#EF4444] shrink-0 font-bold">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1A1A1C] rounded-2xl border border-[rgba(201,166,90,0.3)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⚡</span>
                  <span className="font-black text-white text-base">Com Monitor de Licitações</span>
                </div>
                <ul className="space-y-2.5 text-sm text-[rgba(255,255,255,0.7)]">
                  {[
                    'Um painel único: PNCP + ComprasNet + BLL',
                    'Filtra automaticamente pelo que você vende',
                    'Alerta chega por e-mail ou Telegram',
                    'Histórico de preços vencedores incluído',
                    '5 minutos de configuração, uma única vez',
                    'Zero edital relevante perdido',
                  ].map(item => (
                    <li key={item} className="flex gap-2 list-none">
                      <span className="text-[#C9A65A] shrink-0 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#FFF7ED] border border-[#FDDCAA] rounded-xl px-6 py-5 flex gap-4 items-start">
              <span className="text-2xl shrink-0">⏱️</span>
              <p className="text-sm text-[#92400E] leading-relaxed m-0">
                <strong>Editais têm vida curta.</strong> A média no PNCP é de <strong>5 dias úteis</strong> entre publicação e encerramento. Se você consultar manualmente uma vez por semana, já terá perdido a maioria das oportunidades antes de vê-las.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="alerta-automatico">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">3</div>
              <h2 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] m-0">
                Como receber alertas automáticos de licitações
              </h2>
            </div>

            <p className="text-base text-[#4a4a4d] leading-relaxed mb-6">
              Configurar alertas automáticos é a forma mais eficiente de monitorar licitações. O processo leva menos de 5 minutos:
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  n: '1',
                  t: 'Cadastre as palavras-chave do que você vende',
                  d: 'Informe os produtos, serviços ou materiais que sua empresa fornece. Ex: "cadeiras ergonômicas", "serviço de TI", "material de limpeza". Você pode cadastrar até 20 termos.',
                  icon: '🔑',
                },
                {
                  n: '2',
                  t: 'O sistema monitora todos os portais em tempo real',
                  d: 'A plataforma rastreia PNCP, ComprasNet, BLL e portais estaduais automaticamente — cruzando os objetos dos editais com os seus termos usando busca semântica.',
                  icon: '🔍',
                },
                {
                  n: '3',
                  t: 'Você recebe o alerta no canal que preferir',
                  d: 'E-mail, Telegram ou WhatsApp. Assim que um edital compatível é publicado, a notificação chega — sem precisar acessar nenhum portal manualmente.',
                  icon: '🔔',
                },
              ].map(({ n, t, d, icon }) => (
                <div key={n} className="flex gap-4 bg-white rounded-xl border border-[#E8E4DC] p-5 hover:border-[#C9A65A] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A1C] flex items-center justify-center shrink-0 text-xl">{icon}</div>
                  <div>
                    <div className="font-bold text-[#1A1A1C] text-sm mb-1">{n}. {t}</div>
                    <div className="text-sm text-[#4a4a4d] leading-relaxed">{d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="bg-[#1A1A1C] rounded-2xl p-6 md:p-8">
              <div className="text-[#C9A65A] text-xs font-bold uppercase tracking-widest mb-5">Resultados reais de clientes</div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { valor: 'R$127.400', desc: 'Empresa de TI ganhou pregão de equipamentos de informática', tempo: '72h após o alerta' },
                  { valor: 'R$84.500', desc: 'Distribuidora fechou contrato de material de expediente', tempo: '48h após o alerta' },
                  { valor: 'R$43.200', desc: 'MEI de limpeza conquistou primeiro contrato público', tempo: '5 dias após cadastro' },
                ].map(({ valor, desc, tempo }) => (
                  <div key={valor} className="bg-[rgba(255,255,255,0.05)] rounded-xl p-5 border border-[rgba(255,255,255,0.07)]">
                    <div className="text-[#C9A65A] font-black text-xl mb-2">{valor}</div>
                    <div className="text-[rgba(255,255,255,0.7)] text-xs leading-relaxed mb-3">{desc}</div>
                    <div className="text-[rgba(255,255,255,0.3)] text-[11px]">{tempo}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mid-article CTA */}
          <div className="bg-gradient-to-r from-[#6B0F1A] to-[#8B1522] rounded-2xl p-6 md:p-8 text-center">
            <p className="text-white font-bold text-lg mb-1">Configure seus alertas agora</p>
            <p className="text-[rgba(255,255,255,0.6)] text-sm mb-5">Leva 5 minutos. Os primeiros alertas chegam em até 24h.</p>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#6B0F1A] text-sm font-black no-underline shadow-lg"
            >
              Começar gratuitamente →
            </Link>
            <p className="text-[rgba(255,255,255,0.3)] text-xs mt-3">7 dias grátis · Sem cartão · Cancele quando quiser</p>
          </div>

          {/* Section 4 */}
          <section id="pregao-eletronico">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">4</div>
              <h2 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] m-0">
                Pregão eletrônico: como não perder o prazo
              </h2>
            </div>

            <p className="text-base text-[#4a4a4d] leading-relaxed mb-6">
              O <strong>pregão eletrônico</strong> é a modalidade mais usada no Brasil — representa mais de 70% das contratações públicas. A janela entre publicação e sessão pública é curta: quem vê o edital primeiro tem mais tempo para preparar uma proposta competitiva.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { prazo: '8 dias úteis', label: 'Prazo mínimo — pregão eletrônico (bens e serviços comuns)', cor: 'text-[#C9A65A]' },
                { prazo: '25 dias úteis', label: 'Prazo mínimo — concorrência eletrônica', cor: 'text-[#C9A65A]' },
                { prazo: '⚠ 5 dias úteis', label: 'Prazo médio real observado no PNCP em 2024', cor: 'text-[#FCA5A5]' },
              ].map(({ prazo, label, cor }) => (
                <div key={prazo} className="bg-[#1A1A1C] rounded-xl p-5 text-center border border-[rgba(255,255,255,0.06)]">
                  <div className={`font-black text-xl mb-2 ${cor}`}>{prazo}</div>
                  <div className="text-xs text-[rgba(255,255,255,0.4)] leading-relaxed">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
              <h3 className="font-black text-[#1A1A1C] text-base mb-4">Com quanto tempo você chega a cada edital?</h3>
              <div className="space-y-4">
                {[
                  { label: 'Monitoramento manual (consulta semanal)', pct: 37, texto: '≈ 3 dias restantes', cor: 'bg-[#EF4444]' },
                  { label: 'Alerta automático no dia da publicação', pct: 100, texto: 'Prazo completo', cor: 'bg-[#C9A65A]' },
                ].map(({ label, pct, texto, cor }) => (
                  <div key={label}>
                    <div className="flex flex-wrap justify-between gap-1 text-xs text-[#4a4a4d] mb-2">
                      <span className="mr-2">{label}</span>
                      <span className="font-bold shrink-0">{texto}</span>
                    </div>
                    <div className="h-2.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <div className={`h-full ${cor} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#9AA0A6] mt-5 leading-relaxed">
                Quem recebe o alerta no dia da publicação tem tempo para analisar o edital, calcular custos e montar uma proposta competitiva. Quem descobre no quinto dia já está correndo atrás.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="mei-pequenas">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">5</div>
              <h2 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] m-0">
                Licitações para MEI e pequenas empresas
              </h2>
            </div>

            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A Lei Complementar 123/2006 garante <strong>vantagens legais</strong> para ME, MEI e EPP nas licitações. Muitas empresas pequenas não sabem que têm direitos que as grandes não têm:
            </p>

            <ul className="space-y-3 mb-6">
              {[
                { t: 'Licitações exclusivas para ME/EPP', d: 'Itens de até R$80.000 podem ser reservados exclusivamente para micro e pequenas empresas.' },
                { t: 'Direito de empate ficto', d: 'Se a proposta de ME/EPP for até 10% maior que a mais barata, ela tem prioridade para cobrir o preço.' },
                { t: 'Prazo extra para regularizar documentação', d: '5 dias úteis adicionais para apresentar certidões negativas — quem tem pendências menores ainda pode participar.' },
                { t: 'Cota de 25% reservada', d: 'Em licitações de itens divisíveis, 25% da quantidade deve ser reservada para ME/EPP.' },
                { t: 'Preferência local em até R$80.000', d: 'Municípios podem dar preferência para empresas locais em contratos menores.' },
              ].map(item => (
                <li key={item.t} className="flex gap-3 bg-white rounded-xl border border-[#E8E4DC] p-4 list-none">
                  <span className="text-[#6B0F1A] font-black shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="font-bold text-[#1A1A1C] text-sm block mb-0.5">{item.t}</span>
                    <span className="text-sm text-[#4a4a4d] leading-relaxed">{item.d}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="bg-[#1A1A1C] rounded-2xl p-6 border border-[rgba(201,166,90,0.2)]">
              <p className="text-white text-base leading-relaxed m-0">
                <span className="text-[#C9A65A] font-black">O obstáculo não é capacidade — é informação.</span>{' '}
                Empresas pequenas têm vantagem legal em muitos pregões. O que falta é saber quais editais existem e vê-los a tempo de participar.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="plataforma-gratuita">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1C] text-[#C9A65A] font-black text-sm flex items-center justify-center shrink-0">6</div>
              <h2 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] m-0">
                Plataforma de monitoramento de licitações gratuita
              </h2>
            </div>

            <p className="text-base text-[#4a4a4d] leading-relaxed mb-8">
              O Monitor de Licitações oferece <strong>7 dias gratuitos</strong> sem cartão de crédito. Durante o período de teste você tem acesso completo à plataforma.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: '🔔', t: 'Alertas por e-mail, Telegram e WhatsApp', d: 'Notificação assim que o edital é publicado — sem entrar em nenhum portal.' },
                { icon: '🔍', t: 'Busca manual integrada', d: 'Pesquise por produto ou serviço em todos os portais ao mesmo tempo.' },
                { icon: '📊', t: 'Análise de preços vencedores', d: 'Veja o que o governo já pagou por itens similares para montar propostas competitivas.' },
                { icon: '👥', t: 'Acesso para a equipe', d: 'Planos Profissional e Empresarial incluem múltiplos usuários no mesmo painel.' },
              ].map(({ icon, t, d }) => (
                <div key={t} className="bg-white rounded-xl border border-[#E8E4DC] p-5">
                  <div className="text-xl mb-3">{icon}</div>
                  <div className="font-bold text-[#1A1A1C] text-sm mb-1">{t}</div>
                  <div className="text-sm text-[#4a4a4d] leading-relaxed">{d}</div>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="bg-[#1A1A1C] rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(107,15,26,0.45),transparent_60%)]" />
              <div className="relative">
                <div className="text-[#C9A65A] text-xs font-bold uppercase tracking-widest mb-3">Comece hoje, sem risco</div>
                <p className="text-white text-xl md:text-2xl font-black mb-2">
                  Monitore licitações do PNCP, ComprasNet e BLL automaticamente
                </p>
                <p className="text-[rgba(255,255,255,0.45)] text-base mb-8">
                  Configure em 2 minutos. Primeiro alerta chega em até 24h.
                </p>
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-black no-underline shadow-[0_8px_32px_rgba(107,15,26,0.65)]"
                >
                  Começar gratuitamente →
                </Link>
                <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
                  {['7 dias grátis', 'Sem cartão', 'Cancele quando quiser'].map(t => (
                    <span key={t} className="text-[rgba(255,255,255,0.3)] text-xs flex items-center gap-1">
                      <span className="text-[#C9A65A]">✓</span> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Internal links */}
          <div className="border-t border-[#E8E4DC] pt-8 text-sm text-[#9AA0A6]">
            <p>
              Veja também:{' '}
              <Link href="/" className="text-[#6B0F1A] no-underline font-semibold">como funciona o Monitor de Licitações</Link>
              {' '}·{' '}
              <Link href="/assinar" className="text-[#6B0F1A] no-underline font-semibold">planos e preços</Link>
              {' '}·{' '}
              <Link href="/cadastro" className="text-[#6B0F1A] no-underline font-semibold">criar conta grátis</Link>
            </p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#111113] px-6 md:px-10 py-7 text-center mt-10">
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
