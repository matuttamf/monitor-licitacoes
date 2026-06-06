import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Keywords ativas do usuário
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .eq('user_id', user.id)
    .eq('ativo', true)

  if (!keywords?.length) return NextResponse.json({ estados: [] })

  const keywordIds = keywords.map(k => k.id)

  // Licitacao IDs via alertas
  const { data: alertas } = await supabase
    .from('alertas')
    .select('licitacao_id')
    .in('keyword_id', keywordIds)

  if (!alertas?.length) return NextResponse.json({ estados: [] })

  const licitacaoIds = [...new Set(alertas.map(a => a.licitacao_id))]

  // Buscar estado + valor de todas as licitações do usuário
  const { data: licitacoes } = await supabase
    .from('licitacoes')
    .select('estado, valor_estimado')
    .in('id', licitacaoIds)
    .not('estado', 'is', null)

  if (!licitacoes?.length) return NextResponse.json({ estados: [] })

  // Agregar por estado
  const mapa = new Map<string, { count: number; valor_total: number }>()
  for (const l of licitacoes) {
    if (!l.estado) continue
    const atual = mapa.get(l.estado) ?? { count: 0, valor_total: 0 }
    mapa.set(l.estado, {
      count:       atual.count + 1,
      valor_total: atual.valor_total + (l.valor_estimado ?? 0),
    })
  }

  const estados = [...mapa.entries()]
    .map(([uf, stats]) => ({ uf, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // top 8 estados

  return NextResponse.json({ estados, total: licitacaoIds.length })
}
