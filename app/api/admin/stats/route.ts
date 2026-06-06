import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const service = await createServiceClient()

  // Obter ID do admin para excluí-lo das métricas
  const { data: adminAuth } = await service.auth.admin.listUsers()
  const adminUser = adminAuth?.users?.find(u => u.email === ADMIN_EMAIL)
  const adminId = adminUser?.id ?? 'none'

  const [
    { count: totalUsuarios },
    { count: totalAtivos },
    { count: totalTrial },
    { count: totalKeywords },
    { count: totalAlertas },
    { count: totalLicitacoes },
    { count: alertasHoje },
    { count: alertas7d },
  ] = await Promise.all([
    service.from('profiles').select('*', { count: 'exact', head: true }).neq('id', adminId),
    service.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active').neq('id', adminId),
    service.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'trial').neq('id', adminId),
    service.from('keywords').select('*', { count: 'exact', head: true }).eq('ativo', true),
    service.from('alertas').select('*', { count: 'exact', head: true }),
    service.from('licitacoes').select('*', { count: 'exact', head: true }),
    service.from('alertas').select('*', { count: 'exact', head: true })
      .gte('criado_em', new Date(Date.now() - 86400000).toISOString()),
    service.from('alertas').select('*', { count: 'exact', head: true })
      .gte('criado_em', new Date(Date.now() - 7 * 86400000).toISOString()),
  ])

  return NextResponse.json({
    totalUsuarios:   totalUsuarios  ?? 0,
    totalAtivos:     totalAtivos    ?? 0,
    totalTrial:      totalTrial     ?? 0,
    totalExpired:    (totalUsuarios ?? 0) - (totalAtivos ?? 0) - (totalTrial ?? 0),
    totalKeywords:   totalKeywords  ?? 0,
    totalAlertas:    totalAlertas   ?? 0,
    totalLicitacoes: totalLicitacoes ?? 0,
    alertasHoje:     alertasHoje    ?? 0,
    alertas7d:       alertas7d      ?? 0,
  })
}
