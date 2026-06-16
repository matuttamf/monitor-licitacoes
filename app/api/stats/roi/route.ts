import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .eq('user_id', user.id)

  if (!keywords?.length) {
    return NextResponse.json({ totalAlertas: 0, totalLicitacoes: 0, volumeMonitorado: 0 })
  }

  const keywordIds = keywords.map(k => k.id)

  const { data: alertas } = await supabase
    .from('alertas')
    .select('licitacao_id, licitacoes(valor_estimado)')
    .in('keyword_id', keywordIds)

  if (!alertas?.length) {
    return NextResponse.json({ totalAlertas: 0, totalLicitacoes: 0, volumeMonitorado: 0 })
  }

  const licitacaoIdsUnicos = [...new Set(alertas.map(a => a.licitacao_id))]
  const volumeMonitorado = alertas.reduce((acc, a) => {
    const val = (a.licitacoes as { valor_estimado?: number } | null)?.valor_estimado ?? 0
    return acc + val
  }, 0)

  return NextResponse.json({
    totalAlertas:    alertas.length,
    totalLicitacoes: licitacaoIdsUnicos.length,
    volumeMonitorado,
  })
}
