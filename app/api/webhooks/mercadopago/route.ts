import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

export async function POST(request: Request) {
  const body = await request.json()

  const { type, data } = body

  if (type === 'subscription_preapproval') {
    const subscriptionId = data.id

    const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    })
    const subscription = await res.json()

    const [userId, planoId] = (subscription.external_reference || '').split('|')
    if (!userId || !planoId) return NextResponse.json({ ok: true })

    const supabase = await createServiceClient()

    if (subscription.status === 'authorized') {
      const maxKeywords = planoId === 'basic' ? 10 : 999999

      await supabase.from('profiles').update({
        status: 'active',
        plano: planoId,
        mp_subscription_id: subscriptionId,
        max_keywords: maxKeywords,
      }).eq('id', userId)

    } else if (['cancelled', 'paused'].includes(subscription.status)) {
      await supabase.from('profiles').update({
        status: 'expired',
      }).eq('id', userId)
    }
  }

  return NextResponse.json({ ok: true })
}
