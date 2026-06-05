import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE — remover membro da equipe
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: membroId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const service = await createServiceClient()

  // Verificar que o membro pertence ao owner atual
  const { data: membroPerfil } = await service
    .from('profiles')
    .select('owner_id')
    .eq('id', membroId)
    .single()

  if (!membroPerfil || membroPerfil.owner_id !== user.id) {
    return NextResponse.json({ error: 'Membro não encontrado.' }, { status: 404 })
  }

  // Desvincula o membro (não deleta a conta, apenas remove da equipe)
  const { error } = await service
    .from('profiles')
    .update({ owner_id: null, status: 'expired', plano: 'basic' })
    .eq('id', membroId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
