import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 3600

const BASE = 'https://monitordelicitacoes.com.br'

function decodeToken(token: string): { userId: string; semanaInicio: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [userId, semanaInicio] = decoded.split(':')
    if (!userId || !semanaInicio) return null
    return { userId, semanaInicio }
  } catch {
    return null
  }
}

function formatarMoeda(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`
  return `R$ ${v.toLocaleString('pt-BR')}`
}

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const decoded = decodeToken(token)
  if (!decoded) notFound()

  const { userId, semanaInicio } = decoded
  const semanaFim = new Date(new Date(semanaInicio).getTime() + 7 * 86400000).toISOString().slice(0, 10)

  const supabase = createAdminClient()

  // Busca perfil do usuário
  const { data: perfil } = await supabase
    .from('profiles')
    .select('nome, empresa')
    .eq('id', userId)
    .single()

  if (!perfil) notFound()

  // Alertas da semana com licitações
  const { data: alertas } = await supabase
    .from('alertas')
    .select('id, criado_em, licitacoes(id, orgao, objeto, valor_estimado, data_abertura, estado), keywords!inner(user_id, termo)')
    .eq('keywords.user_id', userId)
    .gte('criado_em', semanaInicio + 'T00:00:00.000Z')
    .lte('criado_em', semanaFim + 'T23:59:59.999Z')
    .order('criado_em', { ascending: false })
    .limit(100)

  // Top 5 por valor estimado
  type AlertaItem = {
    id: string
    criado_em: string
    licitacoes: { id: string; orgao: string; objeto: string; valor_estimado: number | null; data_abertura: string | null; estado: string | null } | null
    keywords: { user_id: string; termo: string } | { user_id: string; termo: string }[]
  }

  const itens = ((alertas ?? []) as AlertaItem[])
    .filter(a => a.licitacoes)
    .sort((a, b) => (b.licitacoes?.valor_estimado ?? 0) - (a.licitacoes?.valor_estimado ?? 0))
    .slice(0, 5)

  const total = (alertas ?? []).length
  const volumeTotal = (alertas ?? []).reduce((acc, a) => {
    const lic = a as AlertaItem
    return acc + (lic.licitacoes?.valor_estimado ?? 0)
  }, 0)

  const nomeDisplay = perfil.empresa || perfil.nome || 'Monitor de Licitações'
  const dataFormatada = new Date(semanaInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const dataFimFormatada = new Date(semanaFim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans">
      {/* Header */}
      <header className="bg-[#6B0F1A] px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A65A] flex items-center justify-center font-black text-[11px] text-[#6B0F1A]">ML</div>
            <span className="text-white font-semibold text-sm">Monitor de Licitações</span>
          </div>
          <Link href="/cadastro" className="text-xs font-semibold text-[#C9A65A] no-underline border border-[rgba(201,166,90,0.4)] px-3 py-1.5 rounded-lg hover:border-[#C9A65A] transition-colors">
            Criar conta grátis →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Título */}
        <div className="text-center mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B0F1A] mb-2">Relatório semanal</div>
          <h1 className="text-2xl font-black text-[#1A1A1C] mb-1">{nomeDisplay}</h1>
          <p className="text-sm text-[#9AA0A6]">{dataFormatada} a {dataFimFormatada}</p>
        </div>

        {/* Destaque */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-6 text-center">
          <div className="text-6xl font-black text-[#6B0F1A] leading-none mb-2">{total}</div>
          <div className="text-base font-semibold text-[#4a4a4d]">
            licitaç{total !== 1 ? 'ões encontradas' : 'ão encontrada'} na semana
          </div>
          {volumeTotal > 0 && (
            <div className="mt-2 text-sm font-semibold text-[#C9A65A]">
              {formatarMoeda(volumeTotal)} em volume estimado
            </div>
          )}
        </div>

        {/* Top licitações */}
        {itens.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1C] mb-3">
              Principais oportunidades
            </h2>
            <div className="space-y-3">
              {itens.map((a, i) => {
                const lic = a.licitacoes!
                return (
                  <div key={a.id} className="bg-white rounded-xl border border-[#E8E4DC] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#6B0F1A] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[#C9A65A]">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#9AA0A6] mb-1">
                          {lic.orgao}{lic.estado ? ` · ${lic.estado}` : ''}
                        </div>
                        <p className="text-sm font-medium text-[#1A1A1C] leading-snug mb-2 line-clamp-2">
                          {lic.objeto}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {lic.valor_estimado && (
                            <span className="text-xs font-bold text-[#6B0F1A]">
                              {formatarMoeda(lic.valor_estimado)}
                            </span>
                          )}
                          {lic.data_abertura && (
                            <span className="text-xs text-[#9AA0A6]">
                              Abertura: {new Date(lic.data_abertura).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#6B0F1A] rounded-2xl p-6 text-center">
          <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Receba alertas como esses</div>
          <h3 className="text-white font-black text-lg mb-2 leading-tight">
            Monitore licitações do seu setor automaticamente
          </h3>
          <p className="text-[rgba(255,255,255,0.65)] text-sm mb-4">
            Alertas por e-mail, WhatsApp e Telegram. Teste grátis por 7 dias.
          </p>
          <Link href={`${BASE}/cadastro`} className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
            Criar conta gratuita →
          </Link>
        </div>

        <p className="text-center text-xs text-[#9AA0A6] mt-6">
          Compartilhado por {nomeDisplay} via{' '}
          <Link href={BASE} className="text-[#6B0F1A] no-underline hover:underline">Monitor de Licitações</Link>
        </p>
      </main>
    </div>
  )
}
