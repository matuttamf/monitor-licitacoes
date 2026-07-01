import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { telefone, nome } = await request.json().catch(() => ({}))
  if (!telefone?.trim()) return NextResponse.json({ error: 'Telefone obrigatório' }, { status: 400 })

  const serviceClient = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { telefone: telefone.trim() }
  if (nome?.trim()) update.nome = nome.trim()

  const { error } = await serviceClient
    .from('profiles')
    .update(update)
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
