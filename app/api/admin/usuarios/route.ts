import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  // Usa o client com cookies para verificar quem está logado
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, status, trial_inicio, trial_fim, criado_em, nome, telefone, whatsapp, empresa, plano, owner_id')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Emails via auth
  const { data: authData } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map(u => [u.id, u.email])
  )

  // Contagem de keywords por usuário
  const { data: kwCounts } = await supabase
    .from('keywords')
    .select('user_id')
    .eq('ativo', true)
  const kwPorUser: Record<string, number> = {}
  for (const kw of kwCounts ?? []) {
    kwPorUser[kw.user_id] = (kwPorUser[kw.user_id] ?? 0) + 1
  }

  // Contagem + último alerta por usuário — join via keywords (alertas não tem user_id direto)
  const { data: alertaCounts } = await supabase
    .from('alertas')
    .select('enviado_em, keywords!inner(user_id)')
    .order('enviado_em', { ascending: false })
  const alertaPorUser: Record<string, { count: number; ultimo: string | null }> = {}
  for (const a of alertaCounts ?? []) {
    const uid = (a.keywords as unknown as { user_id: string } | null)?.user_id
    if (!uid) continue
    if (!alertaPorUser[uid]) alertaPorUser[uid] = { count: 0, ultimo: a.enviado_em }
    alertaPorUser[uid].count++
  }

  const usuarios = data?.map(p => {
    const email = emailMap[p.id] ?? 'desconhecido'
    return {
      ...p,
      email,
      is_admin: email === ADMIN_EMAIL,
      trial_expirado: p.status === 'trial' && new Date(p.trial_fim) < new Date(),
      keyword_count: kwPorUser[p.id] ?? 0,
      alerta_count:  alertaPorUser[p.id]?.count ?? 0,
      ultimo_alerta: alertaPorUser[p.id]?.ultimo ?? null,
    }
  })

  return NextResponse.json(usuarios)
}

export async function PATCH(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = createAdminClient()

  const { id, status, nome, telefone, whatsapp, empresa, plano } = await request.json()

  const atualizacao: Record<string, string> = {}
  if (status) {
    if (!['trial', 'active', 'expired', 'bloqueado'].includes(status))
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    atualizacao.status = status
  }
  if (nome !== undefined) atualizacao.nome = nome
  if (telefone !== undefined) atualizacao.telefone = telefone
  if (empresa !== undefined) atualizacao.empresa = empresa
  if (plano !== undefined) atualizacao.plano = plano

  const { error } = await supabase
    .from('profiles')
    .update(atualizacao)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
