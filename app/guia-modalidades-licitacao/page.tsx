import Link from 'next/link'
import type { Metadata } from 'next'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/guia-modalidades-licitacao`

export const metadata: Metadata = {
  title: 'Modalidades de Licitação: Guia Completo 2026 — Pregão, Dispensa e mais',
  description:
    'Guia completo das modalidades de licitação: pregão eletrônico, dispensa de licitação, concorrência, credenciamento. Entenda quando cada uma é usada e como participar.',
  keywords: [
    'modalidades de licitação',
    'pregão eletrônico',
    'dispensa de licitação',
    'concorrência pública',
    'modalidades de licitação pública',
    'tipos de licitação',
    'pregão presencial',
    'credenciamento licitação',
    'diálogo competitivo',
    'nova lei de licitações modalidades',
    'Lei 14133 modalidades',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Modalidades de Licitação: Guia Completo 2026',
    description: 'Pregão eletrônico (6,5k buscas/mês), dispensa de licitação (6,1k) — entenda cada modalidade e quando você pode participar.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Guia de Modalidades de Licitação: Pregão, Dispensa, Concorrência e mais',
  description: 'Explicação completa de todas as modalidades de licitação da Nova Lei (Lei 14.133/2021): quando cada uma é usada, quem pode participar e como funciona o processo.',
  author: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  inLanguage: 'pt-BR',
  datePublished: `${new Date().getFullYear()}-01-01`,
  dateModified: '2026-06-21',
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Qual é a modalidade de licitação mais comum no Brasil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O pregão eletrônico é de longe a modalidade mais usada — responde por mais de 80% das licitações públicas no Brasil. É obrigatório para compras de bens e serviços comuns de qualquer valor, é 100% digital e tem o menor prazo entre publicação e sessão (8 dias úteis).',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferença entre pregão eletrônico e dispensa de licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O pregão eletrônico é uma licitação formal com disputa pública de lances em tempo real, aberta para qualquer fornecedor que atenda o edital. A dispensa de licitação é um procedimento simplificado para compras de baixo valor (até R$57.350 para bens/serviços e R$114.700 para obras) — o governo convida pelo menos 3 fornecedores via plataforma eletrônica e escolhe o menor preço sem sessão pública.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que é dispensa eletrônica de licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A dispensa eletrônica foi criada pela Nova Lei de Licitações (Lei 14.133/2021) para compras de pequeno valor. O órgão publica a necessidade em portal eletrônico (como o Compras.gov.br), fornecedores cadastrados enviam propostas, e o governo contrata o menor preço sem sessão de lances. O prazo mínimo é de 3 dias úteis.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quando é usada a concorrência pública?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A concorrência é usada para contratações de grande complexidade ou alto valor: obras de engenharia acima de R$3,3 milhões, serviços de engenharia acima de R$1,9 milhão, ou sempre que o objeto exija avaliação técnica além do preço. O prazo mínimo entre publicação e sessão é de 25 dias úteis. É mais rara que o pregão.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que mudou nas modalidades com a Nova Lei de Licitações?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Lei 14.133/2021 eliminou a tomada de preços e o convite (modalidades da lei antiga). As modalidades que restaram são: pregão, concorrência, diálogo competitivo, manifestação de interesse, leilão e credenciamento. A dispensa e a inexigibilidade continuam como hipóteses de contratação direta, agora com processo eletrônico obrigatório. O prazo de transição foi até dezembro de 2023.',
      },
    },
  ],
}

export default function GuiaModalidadesPagina() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

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

      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[680px] mx-auto">

          <div className="flex items-center gap-3 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <span>Modalidades de licitação</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Guia completo</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Nova Lei 14.133/2021 · Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Modalidades de licitação: guia completo com pregão eletrônico, dispensa e concorrência
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            A Nova Lei de Licitações (Lei 14.133/2021) reorganizou as modalidades de licitação no Brasil. O <strong>pregão eletrônico</strong> continua dominando — mais de 80% das compras públicas — mas há outros caminhos para fornecedores que precisam entender quando e como participar de cada um.
          </p>

          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste guia</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#pregao-eletronico', 'Pregão eletrônico: a modalidade mais usada'],
                ['#dispensa', 'Dispensa de licitação: compras de menor valor'],
                ['#concorrencia', 'Concorrência pública: grandes contratos'],
                ['#credenciamento', 'Credenciamento: lista de fornecedores aprovados'],
                ['#dialogo-competitivo', 'Diálogo competitivo: inovação e tecnologia'],
                ['#inexigibilidade', 'Inexigibilidade: fornecedor exclusivo'],
                ['#comparativo', 'Comparativo rápido entre modalidades'],
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

          {/* Pregão eletrônico */}
          <section id="pregao-eletronico" className="mb-12">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C]">Pregão eletrônico</h2>
              <span className="text-xs font-bold bg-[#6B0F1A] text-white px-2 py-0.5 rounded-full">Mais comum</span>
            </div>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              O pregão eletrônico é obrigatório para a compra de <strong>bens e serviços comuns</strong> de qualquer valor. "Comum" significa bens cujas especificações possam ser definidas objetivamente por descrição — o que na prática inclui 90% dos produtos e serviços do mercado.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { k: 'Quando é usado', v: 'Compras de bens e serviços comuns — qualquer valor' },
                { k: 'Prazo mínimo', v: '8 dias úteis entre publicação e sessão' },
                { k: 'Formato', v: '100% eletrônico, via portal do governo' },
                { k: 'Como funciona', v: 'Proposta + disputa de lances em tempo real' },
                { k: 'Critério padrão', v: 'Menor preço ou maior desconto' },
                { k: 'Certificado digital', v: 'Obrigatório (e-CNPJ ou e-CPF)' },
              ].map(({ k, v }) => (
                <div key={k} className="p-3 bg-[#FAF6F0] rounded-lg border border-[#F0EDE8] text-sm">
                  <div className="text-[#9AA0A6] text-xs mb-0.5">{k}</div>
                  <div className="text-[#1A1A1C] font-medium">{v}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Estratégia:</strong> no pregão, as propostas iniciais são sigilosas. A disputa real acontece na fase de lances. Não coloque seu preço mínimo na proposta inicial — guarde margem para a negociação.
            </div>
          </section>

          {/* Dispensa */}
          <section id="dispensa" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-3">Dispensa de licitação</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A dispensa é uma <strong>contratação direta simplificada</strong> usada quando o valor é baixo o suficiente para dispensar o processo licitatório formal. Com a Nova Lei, a dispensa passou a ser obrigatoriamente eletrônica — o governo publica a necessidade em portal, fornecedores enviam propostas, e a melhor é contratada.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { k: 'Bens e serviços comuns', v: 'Até R$57.350 por contrato' },
                { k: 'Obras e serviços de engenharia', v: 'Até R$114.700 por contrato' },
                { k: 'Prazo mínimo', v: '3 dias úteis para propostas' },
                { k: 'Propostas exigidas', v: 'Mínimo 3 fornecedores convidados' },
                { k: 'Processo', v: 'Sem sessão pública de lances' },
                { k: 'Resultado', v: 'Menor preço válido é contratado' },
              ].map(({ k, v }) => (
                <div key={k} className="p-3 bg-[#FAF6F0] rounded-lg border border-[#F0EDE8] text-sm">
                  <div className="text-[#9AA0A6] text-xs mb-0.5">{k}</div>
                  <div className="text-[#1A1A1C] font-medium">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              <strong className="text-[#1A1A1C]">Dica para iniciantes:</strong> a dispensa é ideal para o primeiro contrato. Sem a pressão da sessão de lances em tempo real, o processo é mais tranquilo e você tem mais tempo para preparar uma proposta competitiva.
            </p>
          </section>

          {/* Concorrência */}
          <section id="concorrencia" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-3">Concorrência pública</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A concorrência é reservada para contratações de <strong>grande valor ou alta complexidade técnica</strong>. É mais rara que o pregão, mas envolve contratos maiores e com critérios de avaliação mais sofisticados.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'Obras de engenharia acima de R$3,3 milhões',
                'Serviços de engenharia acima de R$1,9 milhão',
                'Concessões, parcerias e contratos de grande complexidade',
                'Quando o critério de julgamento envolve avaliação técnica além do preço',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              O prazo mínimo é de <strong>25 dias úteis</strong> entre publicação e sessão. Pode exigir atestado técnico de capacidade, balanço patrimonial e qualificação econômico-financeira mínima.
            </p>
          </section>

          {/* Credenciamento */}
          <section id="credenciamento" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-3">Credenciamento</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O credenciamento funciona de forma diferente: o órgão estabelece condições e preços, e <strong>qualquer fornecedor que atenda pode se cadastrar</strong>. A contratação acontece por demanda, sem disputa — todos os credenciados são contratados conforme necessidade.
            </p>
            <p className="text-sm text-[#4a4a4d] leading-relaxed mb-3">
              <strong className="text-[#1A1A1C]">Onde é usado:</strong> prestação de serviços médicos e laboratoriais para entes públicos (UBS, hospitais regionais), tradução/interpretação, credenciamento de advogados, vistoria de veículos e outros serviços onde a demanda é variável e imprevisível.
            </p>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Vantagem:</strong> no credenciamento, você não compete contra ninguém. Atendeu os requisitos, entrou na lista, começa a receber chamados. Ideal para profissionais da saúde e serviços especializados.
            </div>
          </section>

          {/* Diálogo competitivo */}
          <section id="dialogo-competitivo" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-3">Diálogo competitivo</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Modalidade nova da Lei 14.133/2021, o diálogo competitivo é usado quando o governo <strong>não sabe exatamente o que quer comprar</strong> — ou seja, precisa do mercado para definir a solução. O órgão conversa com fornecedores qualificados, desenvolve a solução em conjunto e depois abre a licitação com base no que foi definido.
            </p>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              Usada principalmente para projetos de inovação, PPPs (Parcerias Público-Privadas), tecnologia de ponta e concessões complexas. Muito rara no dia a dia das licitações comuns.
            </p>
          </section>

          {/* Inexigibilidade */}
          <section id="inexigibilidade" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-3">Inexigibilidade de licitação</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A inexigibilidade ocorre quando a <strong>competição é inviável</strong> — geralmente porque há um único fornecedor capaz de atender a necessidade. Não é uma modalidade de licitação, mas uma contratação direta legal em situações específicas.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'Fornecedor exclusivo (fabricante único ou representante exclusivo)',
                'Profissional consagrado por notória especialização (advogados, consultores reconhecidos)',
                'Artistas para espetáculos e atividades culturais',
                'Credenciamento de entidades sem fins lucrativos para serviços educacionais/saúde',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Comparativo */}
          <section id="comparativo" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Comparativo rápido entre modalidades</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#FAF6F0]">
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Modalidade</th>
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Valor típico</th>
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Prazo mín.</th>
                    <th className="text-left px-4 py-3 text-[#1A1A1C] font-bold border-b border-[#F0EDE8]">Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pregão eletrônico', 'Qualquer valor', '8 dias úteis', '⭐⭐⭐⭐⭐'],
                    ['Dispensa eletrônica', 'Até R$57.350', '3 dias úteis', '⭐⭐⭐⭐'],
                    ['Concorrência', 'Acima R$3,3 mi (obras)', '25 dias úteis', '⭐⭐'],
                    ['Credenciamento', 'Variável', 'Contínuo', '⭐⭐'],
                    ['Inexigibilidade', 'Qualquer valor', 'Sem sessão', '⭐'],
                    ['Diálogo competitivo', 'Grandes projetos', '60 dias úteis', '⭐'],
                  ].map(([mod, val, prazo, freq]) => (
                    <tr key={mod} className="border-b border-[#F0EDE8]">
                      <td className="px-4 py-3 font-medium text-[#1A1A1C]">{mod}</td>
                      <td className="px-4 py-3 text-[#4a4a4d]">{val}</td>
                      <td className="px-4 py-3 text-[#4a4a4d]">{prazo}</td>
                      <td className="px-4 py-3">{freq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Monitore todas as modalidades</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              Pregão, dispensa ou concorrência — receba alertas de tudo
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              O Monitor de Licitações rastreia todas as modalidades em PNCP, ComprasNet e portais estaduais e te avisa quando um edital compatível é publicado.
            </p>
            <Link href="/cadastro" className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Criar conta gratuita — 7 dias grátis →
            </Link>
          </div>

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

          <div className="border-t border-[#F0EDE8] pt-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9AA0A6] mb-4">Continue lendo</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/como-ganhar-primeiro-contrato-publico', label: 'Como ganhar o primeiro contrato' },
                { href: '/documentos-para-habilitacao-em-licitacoes', label: 'Documentos para habilitação' },
                { href: '/comprasnet-vs-pncp-vs-bll', label: 'ComprasNet vs PNCP vs BLL' },
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
