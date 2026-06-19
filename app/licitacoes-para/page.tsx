import Link from 'next/link'
import type { Metadata } from 'next'
import { SEGMENTOS } from './data'

const BASE = 'https://monitordelicitacoes.com.br'

export const metadata: Metadata = {
  title: 'Licitações por Segmento — Construção, TI, Saúde e mais | Monitor de Licitações',
  description:
    'Guias de licitações públicas por segmento: construção civil, tecnologia, saúde, alimentação, limpeza, segurança e muito mais. Encontre editais do seu setor.',
  keywords: [
    'licitações por segmento', 'licitações por setor', 'guia licitações',
    'editais por segmento', 'licitações construção', 'licitações TI', 'licitações saúde',
  ],
  alternates: { canonical: `${BASE}/licitacoes-para` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Licitações por Segmento | Monitor de Licitações',
    description: 'Guias de licitações públicas por segmento de atuação.',
    url: `${BASE}/licitacoes-para`,
    type: 'website',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Licitações por Segmento | Monitor de Licitações',
    description: 'Guias de licitações públicas por segmento de atuação.',
  },
}

const ICONES: Record<string, string> = {
  'construcao-civil':           '🏗️',
  'tecnologia-ti':              '💻',
  'saude-hospitalar':           '🏥',
  'alimentacao-refeicoes':      '🍽️',
  'limpeza-conservacao':        '🧹',
  'seguranca-vigilancia':       '🔒',
  'material-escritorio':        '📋',
  'transporte-logistica':       '🚛',
  'consultoria-engenharia':     '📐',
  'moveis-equipamentos':        '🪑',
  'educacao-treinamento':       '📚',
  'combustiveis-lubrificantes': '⛽',
  'uniformes-epis':             '🦺',
  'manutencao-predial':         '🔧',
  'material-construcao':        '🧱',
  'telecomunicacoes':           '📡',
  'ar-condicionado-climatizacao': '❄️',
  'graficos-impressao':         '🖨️',
  'saude-ocupacional':          '🩺',
  'seguros':                    '🛡️',
  'publicidade-comunicacao':    '📣',
  'servicos-juridicos':         '⚖️',
  'auditoria-contabilidade':    '📊',
  'saneamento-meio-ambiente':   '♻️',
  'jardinagem-paisagismo':      '🌿',
  'energia-eficiencia-energetica': '☀️',
  'equipamentos-laboratorio':   '🔬',
  'agronegocio-insumos':        '🌱',
  'odontologia-saude-bucal':    '🦷',
  'fotografia-audiovisual':     '📸',
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
    { '@type': 'ListItem', position: 2, name: 'Licitações por Segmento', item: `${BASE}/licitacoes-para` },
  ],
}

export default function LicitacoesParaIndex() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
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

      <main className="px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-[900px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9AA0A6] mb-8">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <span>Licitações por Segmento</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Guias por segmento</span>
            </div>
            <h1 className="text-[28px] md:text-[40px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-4">
              Licitações públicas por setor de atuação
            </h1>
            <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed max-w-2xl">
              O governo compra de todos os setores. Encontre editais relevantes para o seu negócio, entenda como participar e configure alertas automáticos para nunca perder uma oportunidade.
            </p>
          </div>

          {/* Grid de segmentos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {SEGMENTOS.map(s => (
              <Link
                key={s.slug}
                href={`/licitacoes-para/${s.slug}`}
                className="group block p-5 bg-white border border-[#F0EDE8] rounded-2xl no-underline hover:border-[#C9A65A] hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{ICONES[s.slug] ?? '📄'}</span>
                  <div>
                    <div className="font-bold text-[#1A1A1C] text-sm leading-snug mb-1 group-hover:text-[#6B0F1A] transition-colors">
                      {s.titulo.replace('Licitações para ', '').replace('Licitações de ', '')}
                    </div>
                    <div className="text-xs text-[#9AA0A6] leading-relaxed line-clamp-2">
                      {s.subtitulo}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0EDE8] flex items-center gap-1 text-xs text-[#6B0F1A] font-semibold">
                  Ver guia completo
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="p-6 md:p-10 bg-[#6B0F1A] rounded-2xl text-center">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-3">Plataforma completa</div>
            <h2 className="text-white font-black text-2xl md:text-3xl mb-3 leading-tight">
              Monitore todos os segmentos em uma única plataforma
            </h2>
            <p className="text-[rgba(255,255,255,0.7)] text-sm md:text-base mb-6 max-w-xl mx-auto">
              Configure palavras-chave, filtre por estado e receba alertas por e-mail quando novos editais forem publicados no PNCP, portais estaduais e municipais.
            </p>
            <Link
              href="/cadastro"
              className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-8 py-3.5 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors"
            >
              Criar conta gratuita — 7 dias grátis
            </Link>
          </div>

        </div>
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
