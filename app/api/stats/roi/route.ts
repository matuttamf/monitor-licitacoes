import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // COUNT DISTINCT no banco — evita trazer todas as linhas para JS
  // (Supabase retorna 1000 por padrão sem limit, causando subcontagem)
  const { data, error } = await supabase.rpc('stats_roi_usuario', { p_user_id: user.id })

  if (error || !data) {
    return NextResponse.json({ totalAlertas: 0, totalLicitacoes: 0, volumeMonitorado: 0 })
  }

  return NextResponse.json({
    totalAlertas:    Number(data.total_licitacoes ?? 0),
    totalLicitacoes: Number(data.total_licitacoes ?? 0),
    volumeMonitorado: Number(data.volume_monitorado ?? 0),
  })
}
