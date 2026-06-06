import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('nome, telefone, whatsapp, empresa, telegram_chat_id, min_valor_interesse, max_valor_interesse')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ ...data, email: user.email })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { nome, telefone, whatsapp, empresa, telegram_chat_id, min_valor_interesse, max_valor_interesse } = await request.json()

  const { error } = await supabase
    .from('profiles')
    .update({ nome, telefone, whatsapp, empresa, telegram_chat_id, min_valor_interesse: min_valor_interesse ?? 0, max_valor_interesse: max_valor_interesse ?? 0 })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
