import { createClient, createServiceClient } from '@/lib/supabase/server'
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

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, status, trial_inicio, trial_fim, criado_em, nome, telefone, whatsapp, empresa, plano')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Buscar emails dos usuários via auth
  const { data: authData } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map(u => [u.id, u.email])
  )

  const usuarios = data?.map(p => ({
    ...p,
    email: emailMap[p.id] ?? 'desconhecido',
    trial_expirado: p.status === 'trial' && new Date(p.trial_fim) < new Date(),
  }))

  return NextResponse.json(usuarios)
}

export async function PATCH(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = await createServiceClient()

  const { id, status, nome, telefone, whatsapp, empresa, plano } = await request.json()

  const atualizacao: Record<string, string> = {}
  if (status) {
    if (!['trial', 'active', 'expired'].includes(status))
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
