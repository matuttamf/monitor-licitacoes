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
    .select('mp_subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.mp_subscription_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 400 })
  }

  const res = await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erro ao cancelar no MercadoPago' }, { status: 500 })
  }

  // Busca a assinatura para obter a data de fim do ciclo pago
  const subRes = await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  })

  const serviceClient = await createServiceClient()

  if (subRes.ok) {
    const sub = await subRes.json()
    const proximaCobranca: string | null = sub.next_payment_date ?? sub.date_of_next_payment ?? null

    if (proximaCobranca && new Date(proximaCobranca) > new Date()) {
      // Mantém acesso até o fim do período já pago; cron expirar-trials encerra depois
      await serviceClient.from('profiles').update({
        mp_subscription_id: null,
        acesso_ate:         new Date(proximaCobranca).toISOString(),
      }).eq('id', user.id)
    } else {
      // Sem ciclo futuro: encerra imediatamente
      await serviceClient.from('profiles').update({
        status:             'expired',
        mp_subscription_id: null,
        acesso_ate:         null,
      }).eq('id', user.id)
    }
  } else {
    // Fallback: não sabe a data de fim, encerra imediatamente
    await serviceClient.from('profiles').update({
      status:             'expired',
      mp_subscription_id: null,
    }).eq('id', user.id)
  }

  return NextResponse.json({ ok: true })
}
