import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getLimites } from '@/lib/planos'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

function computarFonte(
  p: { utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null; campanha_id?: string | null },
  campanhaMap: Record<string, string>
): string | null {
  if (p.campanha_id && campanhaMap[p.campanha_id]) return `📣 ${campanhaMap[p.campanha_id]}`
  const src = (p.utm_source ?? '').toLowerCase()
  const med = (p.utm_medium ?? '').toLowerCase()
  if (src === 'google' || med === 'cpc' || med === 'ppc') return '🔍 Google Ads'
  if (src === 'email' || med === 'email') return '📧 E-mail'
  if (src === 'instagram' || src === 'facebook' || src === 'meta') return '📱 Meta'
  if (src === 'whatsapp') return '💬 WhatsApp'
  if (p.utm_source) return `🔗 ${p.utm_source}`
  return null
}

export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = createAdminClient()

  const [
    { data, error },
    { data: authData },
    { data: kwList },
    { data: alertaRows },
    { data: campanhas },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, status, trial_inicio, trial_fim, criado_em, nome, telefone, whatsapp, empresa, plano, periodo, owner_id, bloqueado_admin, utm_source, utm_medium, utm_campaign, campanha_id')
      .order('criado_em', { ascending: false }),
    supabase.auth.admin.listUsers(),
    // Uma única query para keywords — id + user_id + ativo
    supabase.from('keywords').select('id, user_id, ativo'),
    // Alertas por user_id direto (coluna adicionada em 20260622_alertas_user_id.sql)
    supabase.from('alertas').select('user_id, criado_em').order('criado_em', { ascending: false }).range(0, 49999),
    supabase.from('campanhas').select('id, nome'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mapa keyword_id → user_id  +  contagem de keywords ativas por user
  const kwToUser: Record<string, string> = {}
  const kwPorUser: Record<string, number> = {}
  for (const kw of kwList ?? []) {
    kwToUser[kw.id] = kw.user_id
    if (kw.ativo) kwPorUser[kw.user_id] = (kwPorUser[kw.user_id] ?? 0) + 1
  }

  // Contagem + último alerta por usuário via user_id direto
  // Rows vêm ORDER BY criado_em DESC — primeiro registro de cada user é o mais recente
  const alertaPorUser: Record<string, { count: number; ultimo: string | null }> = {}
  for (const a of alertaRows ?? []) {
    const uid = (a as any).user_id
    if (!uid) continue
    if (!alertaPorUser[uid]) alertaPorUser[uid] = { count: 0, ultimo: null }
    alertaPorUser[uid].count++
    if (!alertaPorUser[uid].ultimo) alertaPorUser[uid].ultimo = (a as any).criado_em
  }

  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map(u => [u.id, u.email])
  )

  const campanhaMap = Object.fromEntries(
    (campanhas ?? []).map(c => [c.id, c.nome as string])
  )

  const usuarios = data?.map(p => {
    const email = emailMap[p.id] ?? 'desconhecido'
    return {
      ...p,
      email,
      is_admin:       email === ADMIN_EMAIL,
      trial_expirado: p.status === 'trial' && new Date(p.trial_fim) < new Date(),
      bloqueado_admin: p.bloqueado_admin ?? false,
      keyword_count:  kwPorUser[p.id] ?? 0,
      alerta_count:   alertaPorUser[p.id]?.count ?? 0,
      ultimo_alerta:  alertaPorUser[p.id]?.ultimo ?? null,
      periodo:        p.periodo ?? 'mensal',
      fonte:          computarFonte(p, campanhaMap),
    }
  })

  return NextResponse.json(usuarios)
}

export async function PATCH(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = createAdminClient()

  const { id, status, nome, telefone, whatsapp, empresa, plano, bloqueado_admin, fonte } = await request.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const atualizacao: Record<string, any> = {}
  if (status !== undefined) {
    if (!['trial', 'active', 'expired', 'bloqueado'].includes(status))
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    atualizacao.status = status
  }
  if (bloqueado_admin !== undefined) atualizacao.bloqueado_admin = Boolean(bloqueado_admin)
  if (nome      !== undefined) atualizacao.nome      = nome
  if (telefone  !== undefined) atualizacao.telefone  = telefone
  if (whatsapp  !== undefined) atualizacao.whatsapp  = whatsapp
  if (empresa   !== undefined) atualizacao.empresa   = empresa
  if (plano !== undefined) {
    atualizacao.plano = plano
    // Atualiza limites junto com o plano para manter consistência
    const limites = getLimites(plano)
    atualizacao.max_keywords = limites.maxKeywords
    atualizacao.max_usuarios = limites.maxUsers
  }
  // fonte manual substitui o utm_source (campo livre)
  if (fonte     !== undefined) atualizacao.utm_source = fonte || null

  const { error } = await supabase
    .from('profiles')
    .update(atualizacao)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
