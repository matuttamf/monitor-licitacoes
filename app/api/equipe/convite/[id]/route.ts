import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { enviarEmailConvite } from '@/lib/emails/convite'

// DELETE — cancelar convite pendente
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const service = createAdminClient()

  // Confirmar que o convite pertence ao owner
  const { data: convite } = await service
    .from('invites')
    .select('owner_id, email')
    .eq('id', id)
    .single()

  if (!convite || convite.owner_id !== user.id) {
    return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  }

  const { error } = await service.from('invites').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// POST — reenviar convite (cria novo token e envia e-mail)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const service = createAdminClient()

  const { data: convite } = await service
    .from('invites')
    .select('owner_id, email')
    .eq('id', id)
    .single()

  if (!convite || convite.owner_id !== user.id) {
    return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  }

  const { data: ownerProfile } = await service
    .from('profiles')
    .select('nome, empresa')
    .eq('id', user.id)
    .single()

  // Atualiza expira_em e gera novo token deletando e recriando
  await service.from('invites').delete().eq('id', id)

  const { data: novo, error: errNovo } = await service
    .from('invites')
    .insert({ owner_id: user.id, email: convite.email })
    .select('token')
    .single()

  if (errNovo || !novo) return NextResponse.json({ error: 'Erro ao recriar convite.' }, { status: 500 })

  await enviarEmailConvite({
    emailConvidado: convite.email,
    nomeOwner: ownerProfile?.nome ?? '',
    empresaOwner: ownerProfile?.empresa ?? '',
    token: novo.token,
  })

  return NextResponse.json({ ok: true })
}
