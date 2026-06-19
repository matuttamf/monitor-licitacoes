import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SEGMENTOS, SEGMENTOS_MAP } from '../data'
import { createAdminClient } from '@/lib/supabase/server'

const BASE = 'https://monitordelicitacoes.com.br'

export const revalidate = 3600

export async function generateStaticParams() {
  return SEGMENTOS.map(s => ({ segmento: s.slug }))
}

type Edital = { id: string; orgao: string; objeto: string; valor_estimado: number | null; data_abertura: string | null; estado: string | null; url: string | null }

async function buscarEditaisSegmento(tiposContrato: { titulo: string }[]): Promise<Edital[]> {
  try {
    const supabase = createAdminClient()
    const hoje = new Date().toISOString().slice(0, 10)
    const termos = tiposContrato.map(t => `objeto.ilike.%${t.titulo}%`).join(',')
    const { data } = await supabase
      .from('licitacoes')
      .select('id, orgao, objeto, valor_estimado, data_abertura, estado, url')
      .or(termos)
      .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
      .order('coletado_em', { ascending: false })
      .limit(3)
    return (data ?? []) as Edital[]
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segmento: string }>
}): Promise<Metadata> {
  const { segmento } = await params
  const data = SEGMENTOS_MAP[segmento]
  if (!data) return {}

  return {
    title: `${data.titulo} | Monitor de Licitações`,
    description: data.descricaoMeta,
    keywords: data.keywords,
    alternates: { canonical: `${BASE}/licitacoes-para/${data.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: data.titulo,
      description: data.descricaoMeta,
      url: `${BASE}/licitacoes-para/${data.slug}`,
      type: 'article',
      siteName: 'Monitor de Licitações',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.titulo,
      description: data.descricaoMeta,
    },
  }
}

export default async function SegmentoPage({
  params,
}: {
  params: Promise<{ segmento: string }>
}) {
  const { segmento } = await params
  const data = SEGMENTOS_MAP[segmento]
  if (!data) notFound()

  const editais = await buscarEditaisSegmento(data.tiposContrato)

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.titulo,
    description: data.descricaoMeta,
    author: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
    publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/licitacoes-para/${data.slug}` },
    inLanguage: 'pt-BR',
    keywords: data.keywords.join(', '),
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: faq.resposta },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Licitações por Segmento', item: `${BASE}/licitacoes-para` },
      { '@type': 'ListItem', position: 3, name: data.titulo, item: `${BASE}/licitacoes-para/${data.slug}` },
    ],
  }

  const segmentoNome = data.titulo.replace('Licitações para ', '').replace('Licitações de ', '')

  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[64px] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl border-b border-[#F0EDE8]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-[8px] bg-[#6B0F1A] flex items-center justify-center font-black text-[11px] text-[#C9A65A] shrink-0">ML</div>
          <span className="font-semibold text-sm text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-sm text-[#6B7280] no-underline">Entrar</Link>
          <Link href={`/cadastro?segmento=${data.slug}`} className="px-4 py-2 text-sm font-semibold bg-[#6B0F1A] text-white no-underline rounded-lg">Começar grátis</Link>
        </div>
      </header>

      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[720px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <Link href="/licitacoes-para" className="text-[#6B0F1A] no-underline hover:underline">Licitações por Segmento</Link>
            <span>›</span>
            <span className="truncate max-w-[200px]">{data.titulo.split(' para ')[1] ?? data.titulo}</span>
          </nav>

          {/* Badge + H1 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Guia de segmento</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[26px] md:text-[36px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-4">
            {data.titulo}
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            {data.intro}
          </p>

          {/* Stats em destaque */}
          <div className="grid grid-cols-3 gap-4 mb-10 p-6 bg-[#FAF6F0] rounded-2xl border border-[#F0EDE8]">
            {data.statsDestaque.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-xl md:text-2xl font-black text-[#6B0F1A] mb-1">{stat.valor}</div>
                <div className="text-xs text-[#9AA0A6] leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tipos de contrato */}
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1A1C] mb-4">
            Tipos de contrato mais comuns
          </h2>
          <p className="text-[#6B7280] mb-6 text-sm">
            Conheça os principais objetos licitados por órgãos públicos no segmento de {data.titulo.toLowerCase().replace('licitações para ', '').replace('licitações de ', '')}.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {data.tiposContrato.map((tipo, i) => (
              <div key={i} className="p-5 bg-white border border-[#F0EDE8] rounded-xl hover:border-[#C9A65A] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#6B0F1A] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#C9A65A] font-bold text-xs">{i + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1A1C] text-sm mb-1">{tipo.titulo}</div>
                    <div className="text-xs text-[#9AA0A6] leading-relaxed">{tipo.descricao}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Por que monitorar */}
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1A1C] mb-4">
            Por que monitorar licitações desse segmento?
          </h2>

          <div className="space-y-4 mb-10">
            {data.vantagens.map((v, i) => (
              <div key={i} className="flex gap-4 p-4 bg-[#FAF6F0] rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[#6B0F1A] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A1C] text-sm mb-1">{v.titulo}</div>
                  <div className="text-xs text-[#6B7280] leading-relaxed">{v.descricao}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Editais reais */}
          {editais.length > 0 && (
            <div className="mb-10">
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1A1C] mb-2">
                Editais recentes deste segmento
              </h2>
              <p className="text-[#6B7280] text-sm mb-5">Licitações publicadas nos últimos dias — atualizadas a cada hora.</p>
              <div className="space-y-3">
                {editais.map(e => (
                  <div key={e.id} className="p-5 bg-white border border-[#F0EDE8] rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-wide mb-1">
                          {e.orgao}{e.estado ? ` · ${e.estado}` : ''}
                        </div>
                        <p className="text-sm font-medium text-[#1A1A1C] leading-snug line-clamp-2 mb-2">{e.objeto}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {e.valor_estimado && (
                            <span className="text-xs font-semibold text-[#6B0F1A]">
                              R$ {e.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          {e.data_abertura && (
                            <span className="text-xs text-[#9AA0A6]">
                              Abertura: {new Date(e.data_abertura).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#9AA0A6] mt-3 text-center">
                Veja todos os editais e configure alertas automáticos →{' '}
                <Link href={`/cadastro?segmento=${data.slug}`} className="text-[#6B0F1A] font-semibold no-underline hover:underline">
                  Começar grátis
                </Link>
              </p>
            </div>
          )}

          {/* Seção emocional — genérica, aparece em todos os segmentos */}
          <div className="my-10 p-7 md:p-9 rounded-2xl border border-[#F0EDE8] bg-[#FAF6F0]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A] mb-3">Por que isso importa</p>
            <h2 className="text-[18px] md:text-[22px] font-black text-[#1A1A1C] leading-snug mb-4">
              O governo gasta R$ 2 trilhões por ano — e a maioria das empresas ainda não monitora os editais do seu segmento.
            </h2>
            <p className="text-sm text-[#4a4a4d] leading-relaxed mb-4">
              Diferente do mercado privado — onde contratos dependem de relacionamento, indicação ou sorte —
              licitações são públicas, previsíveis e pagam em dia. Qualquer empresa com CNPJ pode participar.
              O que falta, quase sempre, é saber que o edital foi publicado.
            </p>
            <p className="text-sm text-[#4a4a4d] leading-relaxed mb-6">
              Empresas que monitoram ativamente licitações do seu segmento constroem uma carteira de clientes
              estável, com contratos de 12 a 60 meses e pagamento garantido pelo erário público.
              Não é um atalho — é um canal de vendas que seus concorrentes ainda subestimam.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#E8E4DC]">
              {[
                { valor: 'R$ 2 tri', label: 'compras públicas/ano' },
                { valor: '70%', label: 'editais sem disputa acirrada' },
                { valor: '30 dias', label:'prazo médio de pagamento' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-lg md:text-xl font-black text-[#6B0F1A]">{item.valor}</div>
                  <div className="text-[11px] text-[#9AA0A6] leading-tight mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA inline */}
          <div className="my-10 p-6 md:p-8 bg-[#6B0F1A] rounded-2xl text-center">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Comece agora</div>
            <h3 className="text-white font-black text-xl md:text-2xl mb-3 leading-tight">
              Nunca perca um edital do seu segmento
            </h3>
            <p className="text-[rgba(255,255,255,0.7)] text-sm mb-5 max-w-md mx-auto">
              Configure palavras-chave e receba alertas por e-mail quando novos editais forem publicados. Teste grátis por 7 dias.
            </p>
            <Link href={`/cadastro?segmento=${data.slug}`} className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-8 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Criar conta gratuita
            </Link>
          </div>

          {/* FAQ */}
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A1A1C] mb-6">
            Perguntas frequentes
          </h2>

          <div className="space-y-4 mb-10">
            {data.faqs.map((faq, i) => (
              <details key={i} className="group border border-[#F0EDE8] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-[#1A1A1C] text-sm leading-snug list-none">
                  {faq.pergunta}
                  <svg className="w-4 h-4 text-[#9AA0A6] shrink-0 ml-3 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#F0EDE8] pt-4">
                  {faq.resposta}
                </div>
              </details>
            ))}
          </div>

          {/* Links para outros segmentos */}
          <div className="mb-10">
            <h2 className="text-[18px] font-bold text-[#1A1A1C] mb-4">Outros segmentos</h2>
            <div className="flex flex-wrap gap-2">
              {SEGMENTOS.filter(s => s.slug !== data.slug).map(s => (
                <Link
                  key={s.slug}
                  href={`/licitacoes-para/${s.slug}`}
                  className="text-xs px-3 py-1.5 bg-[#FAF6F0] border border-[#F0EDE8] rounded-lg text-[#6B0F1A] no-underline hover:border-[#C9A65A] transition-colors"
                >
                  {s.titulo.replace('Licitações para ', '').replace('Licitações de ', '')}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA final */}
          <div className="border-t border-[#F0EDE8] pt-8 text-center">
            <p className="text-sm text-[#9AA0A6] mb-4">
              Monitore editais do PNCP, portais estaduais e municipais em uma única plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/cadastro?segmento=${data.slug}`} className="inline-block bg-[#6B0F1A] text-white font-bold px-7 py-3 rounded-xl no-underline text-sm hover:bg-[#5a0d17] transition-colors">
                Começar gratuitamente
              </Link>
              <Link href="/como-monitorar-licitacoes" className="inline-block bg-white border border-[#E8E4DC] text-[#1A1A1C] font-semibold px-7 py-3 rounded-xl no-underline text-sm hover:border-[#6B0F1A] transition-colors">
                Ver guia completo
              </Link>
            </div>
          </div>

        </article>
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-[#F0EDE8] px-6 py-8 text-center text-xs text-[#9AA0A6]">
        <div className="flex justify-center gap-4 mb-3">
          <Link href="/privacidade" className="text-[#9AA0A6] no-underline hover:underline">Privacidade</Link>
          <Link href="/termos" className="text-[#9AA0A6] no-underline hover:underline">Termos</Link>
          <Link href="/contato" className="text-[#9AA0A6] no-underline hover:underline">Contato</Link>
        </div>
        © {new Date().getFullYear()} Monitor de Licitações — Todos os direitos reservados
      </footer>
    </div>
  )
}
