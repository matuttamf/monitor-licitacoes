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
    { count: leadsPendentes },
    { count: leadsEnviados },
    { count: leadsTotal },
    { count: leadsErro },
    { count: leadsInvalido },
    { count: leadsDescadastrado },
    { count: reconversaoEnviado },
    { count: leadsAbriram },
    { count: leadsClicaram },
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
    // Leads — ignorar erro se tabela ainda não existir
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pendente')).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'enviado')).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true })).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'erro')).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'invalido')).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'descadastrado')).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    // Reconversão — profiles com email de reconversão já enviado
    Promise.resolve(service.from('profiles').select('*', { count: 'exact', head: true }).not('reconversao_email_em', 'is', null)).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    // Rastreamento — abriram e clicaram
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).not('abriu_em', 'is', null)).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
    Promise.resolve(service.from('leads').select('*', { count: 'exact', head: true }).not('clicou_em', 'is', null)).then(r => ({ count: (r as { count: number | null }).count ?? 0 })).catch(() => ({ count: 0 })),
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
    leadsPendentes:      leadsPendentes   ?? 0,
    leadsEnviados:       leadsEnviados    ?? 0,
    leadsTotal:          leadsTotal       ?? 0,
    leadsErro:           leadsErro        ?? 0,
    leadsInvalido:       leadsInvalido    ?? 0,
    leadsDescadastrado:  leadsDescadastrado ?? 0,
    reconversaoEnviado:  reconversaoEnviado ?? 0,
    leadsAbriram:        leadsAbriram       ?? 0,
    leadsClicaram:       leadsClicaram      ?? 0,
  })
}
