import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const service = createAdminClient()

  const { data: adminAuth } = await service.auth.admin.listUsers()
  const adminUser = adminAuth?.users?.find(u => u.email === ADMIN_EMAIL)
  const adminId = adminUser?.id ?? 'none'

  const cnt = (p: Promise<{ count: number | null }>) =>
    p.then(r => r.count ?? 0).catch(() => 0)

  const leadsCount = (filter?: (q: ReturnType<typeof service.from>) => ReturnType<typeof service.from>) => {
    const base = service.from('leads').select('*', { count: 'exact', head: true })
    return cnt(Promise.resolve(filter ? filter(base as never) as never : base) as never)
  }

  const [
    totalUsuarios,
    totalAtivos,
    totalTrial,
    totalMembros,
    totalKeywords,
    totalAlertas,
    totalLicitacoes,
    alertasHoje,
    alertas7d,
    leadsPendentes,
    leadsEnviados,
    leadsTotal,
    leadsErro,
    leadsInvalido,
    leadsDescadastrado,
    fonteCnae,
    fontePncpContrato,
    fontePncpProposta,
    fontePortalTransparencia,
    fonteBuscaManual,
    reconversaoEnviado,
    leadsAbriram,
    leadsClicaram,
  ] = await Promise.all([
    cnt(service.from('profiles').select('*', { count: 'exact', head: true }).neq('id', adminId) as never),
    cnt(service.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active').neq('id', adminId).is('owner_id', null) as never),
    cnt(service.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'trial').neq('id', adminId).is('owner_id', null) as never),
    cnt(service.from('profiles').select('*', { count: 'exact', head: true }).not('owner_id', 'is', null) as never),
    cnt(service.from('keywords').select('*', { count: 'exact', head: true }).eq('ativo', true) as never),
    cnt(service.from('alertas').select('*', { count: 'exact', head: true }) as never),
    cnt(service.from('licitacoes').select('*', { count: 'exact', head: true }) as never),
    cnt(service.from('alertas').select('*', { count: 'exact', head: true }).gte('criado_em', new Date(Date.now() - 86400000).toISOString()) as never),
    cnt(service.from('alertas').select('*', { count: 'exact', head: true }).gte('criado_em', new Date(Date.now() - 7 * 86400000).toISOString()) as never),
    // Leads por status
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pendente').not('email', 'is', null).neq('email', '') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'enviado') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }) as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'erro') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'invalido') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'descadastrado') as never),
    // Leads por fonte
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('fonte', 'cnae') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('fonte', 'pncp_contrato') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('fonte', 'pncp_proposta') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('fonte', 'portal_transparencia') as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).eq('fonte', 'busca_manual') as never),
    // Reconversão e rastreamento
    cnt(service.from('profiles').select('*', { count: 'exact', head: true }).not('reconversao_email_em', 'is', null) as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).not('abriu_em', 'is', null) as never),
    cnt(service.from('leads').select('*', { count: 'exact', head: true }).not('clicou_em', 'is', null) as never),
  ])

  const fonteBreakdown = [
    { fonte: 'cnae',                 total: fonteCnae },
    { fonte: 'pncp_contrato',        total: fontePncpContrato },
    { fonte: 'pncp_proposta',        total: fontePncpProposta },
    { fonte: 'portal_transparencia', total: fontePortalTransparencia },
    { fonte: 'busca_manual',         total: fonteBuscaManual },
  ].filter(f => f.total > 0).sort((a, b) => b.total - a.total)

  return NextResponse.json({
    totalUsuarios,
    totalAtivos,
    totalTrial,
    totalMembros,
    totalExpired:   Math.max(0, totalUsuarios - totalAtivos - totalTrial - totalMembros),
    totalKeywords,
    totalAlertas,
    totalLicitacoes,
    alertasHoje,
    alertas7d,
    leadsPendentes,
    leadsEnviados,
    leadsTotal,
    leadsErro,
    leadsInvalido,
    leadsDescadastrado,
    fonteBreakdown,
    reconversaoEnviado,
    leadsAbriram,
    leadsClicaram,
  })
}
