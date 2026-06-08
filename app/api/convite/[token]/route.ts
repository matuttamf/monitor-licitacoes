import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — info pública do convite (para pré-preencher cadastro)
// Usa createAdminClient (sem cookies) pois o convidado ainda não está autenticado
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createAdminClient()

  const { data: convite } = await service
    .from('invites')
    .select('email, owner_id, expira_em, usado')
    .eq('token', token)
    .single()

  if (!convite) return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  if (convite.usado) return NextResponse.json({ error: 'Este convite já foi utilizado.' }, { status: 410 })
  if (new Date(convite.expira_em) < new Date()) return NextResponse.json({ error: 'Este convite expirou.' }, { status: 410 })

  // Buscar nome do owner para exibir na tela de cadastro
  const { data: ownerProfile } = await service
    .from('profiles')
    .select('nome, empresa')
    .eq('id', convite.owner_id)
    .single()

  return NextResponse.json({
    email: convite.email,
    owner: ownerProfile?.empresa || ownerProfile?.nome || 'sua equipe',
  })
}

// POST — aceitar convite após cadastro
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId obrigatório.' }, { status: 400 })

  const service = createAdminClient()

  const { data: convite } = await service
    .from('invites')
    .select('email, owner_id, expira_em, usado')
    .eq('token', token)
    .single()

  if (!convite) return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  if (convite.usado) return NextResponse.json({ error: 'Convite já utilizado.' }, { status: 410 })
  if (new Date(convite.expira_em) < new Date()) return NextResponse.json({ error: 'Convite expirado.' }, { status: 410 })

  // Confirmar que o userId pertence ao e-mail do convite
  const { data: authUser } = await service.auth.admin.getUserById(userId)
  if (!authUser?.user || authUser.user.email?.toLowerCase() !== convite.email.toLowerCase()) {
    return NextResponse.json({ error: 'E-mail não corresponde ao convite.' }, { status: 403 })
  }

  // Buscar plano do owner
  const { data: ownerProfile } = await service
    .from('profiles')
    .select('plano')
    .eq('id', convite.owner_id)
    .single()

  const planoOwner = ownerProfile?.plano ?? 'basic'

  // Confirmar e-mail do novo usuário e vincular ao owner
  await service.auth.admin.updateUserById(userId, { email_confirm: true })

  await service.from('profiles').update({
    owner_id: convite.owner_id,
    status: 'active',
    plano: planoOwner,
    max_keywords: planoOwner === 'basic' ? 10 : 99999,
  }).eq('id', userId)

  // Marcar convite como usado
  await service.from('invites').update({ usado: true }).eq('token', token)

  return NextResponse.json({ ok: true })
}
