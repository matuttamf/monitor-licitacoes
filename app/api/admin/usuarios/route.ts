import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function GET() {
  const supabase = await createServiceClient()
  const admin = await verificarAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { data, error } = await supabase
    .from('profiles')
    .select('id, status, trial_inicio, trial_fim, criado_em')
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
  const supabase = await createServiceClient()
  const admin = await verificarAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { id, status } = await request.json()

  if (!['trial', 'active', 'expired'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
