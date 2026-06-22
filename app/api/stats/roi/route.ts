import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Busca todos os alertas do usuário via keyword_id (alertas não têm profile_id)
  // usa licitacao_id_str para deduplicação mesmo após licitações removidas do banco
  const { data: alertas } = await supabase
    .from('alertas')
    .select('licitacao_id_str, valor_estimado, keywords!inner(user_id)')
    .eq('keywords.user_id', user.id)

  if (!alertas?.length) {
    return NextResponse.json({ totalAlertas: 0, totalLicitacoes: 0, volumeMonitorado: 0 })
  }

  const porLicitacao = new Map<string, number>()
  for (const a of alertas) {
    if (!a.licitacao_id_str) continue
    if (porLicitacao.has(a.licitacao_id_str)) continue
    porLicitacao.set(a.licitacao_id_str, a.valor_estimado ?? 0)
  }

  const volumeMonitorado = [...porLicitacao.values()].reduce((acc, v) => acc + v, 0)

  return NextResponse.json({
    totalAlertas:    alertas.length,
    totalLicitacoes: porLicitacao.size,
    volumeMonitorado,
  })
}
