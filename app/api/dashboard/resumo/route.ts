import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const inicioSemana = new Date(Date.now() - 7 * 86400000).toISOString()

  // Alertas da semana com valor das licitações associadas
  const { data: alertas } = await supabase
    .from('alertas')
    .select('id, criado_em, licitacoes(valor_estimado), keywords!inner(user_id)')
    .eq('keywords.user_id', user.id)
    .gte('criado_em', inicioSemana)
    .limit(500)

  const total = alertas?.length ?? 0
  const volumeTotal = (alertas ?? []).reduce((acc, a) => {
    const v = (a.licitacoes as { valor_estimado?: number } | null)?.valor_estimado
    return acc + (v ?? 0)
  }, 0)

  // Total histórico de alertas
  const { count: totalHistorico } = await supabase
    .from('alertas')
    .select('id, keywords!inner(user_id)', { count: 'exact', head: true })
    .eq('keywords.user_id', user.id)

  return NextResponse.json({ total, volumeTotal, totalHistorico: totalHistorico ?? 0 })
}
