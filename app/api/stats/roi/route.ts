import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Busca todos os alertas do usuário via profile_id (acumulado histórico,
  // independente de quais keywords existem hoje)
  const { data: alertas } = await supabase
    .from('alertas')
    .select('licitacao_id, licitacoes(valor_estimado)')
    .eq('profile_id', user.id)

  if (!alertas?.length) {
    return NextResponse.json({ totalAlertas: 0, totalLicitacoes: 0, volumeMonitorado: 0 })
  }

  // Deduplica por licitacao_id para não somar o mesmo valor múltiplas vezes
  const porLicitacao = new Map<string, number>()
  for (const a of alertas) {
    if (porLicitacao.has(a.licitacao_id)) continue
    const val = (a.licitacoes as { valor_estimado?: number } | null)?.valor_estimado ?? 0
    porLicitacao.set(a.licitacao_id, val)
  }

  const volumeMonitorado = [...porLicitacao.values()].reduce((acc, v) => acc + v, 0)

  return NextResponse.json({
    totalAlertas:    alertas.length,
    totalLicitacoes: porLicitacao.size,
    volumeMonitorado,
  })
}
