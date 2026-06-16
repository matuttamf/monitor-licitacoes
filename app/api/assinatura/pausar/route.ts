import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('mp_subscription_id, status')
    .eq('id', user.id)
    .single()

  if (!profile?.mp_subscription_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 400 })
  }

  if (profile.status !== 'active') {
    return NextResponse.json({ error: 'Assinatura não está ativa' }, { status: 400 })
  }

  const res = await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ status: 'paused' }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erro ao pausar no MercadoPago' }, { status: 500 })
  }

  const serviceClient = await createServiceClient()
  await serviceClient.from('profiles').update({ status: 'paused' }).eq('id', user.id)

  return NextResponse.json({ ok: true })
}
