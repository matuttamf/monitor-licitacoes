import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

// Verifica a assinatura HMAC-SHA256 enviada pelo MercadoPago
// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function verificarAssinatura(
  request: Request,
  dataId: string,
  rawSignature: string | null,
  requestId: string | null,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  // Se o secret não estiver configurado, aceita (modo desenvolvimento / migração)
  if (!secret) {
    console.warn('[webhook/mp] MP_WEBHOOK_SECRET não configurado — verificação HMAC ignorada')
    return true
  }
  if (!rawSignature) return false

  // Formato: "ts=1704908010,v1=618c85345248..."
  const parts = Object.fromEntries(
    rawSignature.split(',').map(p => p.split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Template assinado pelo MercadoPago
  const template = `id:${dataId};request-id:${requestId ?? ''};ts:${ts};`
  const hash = createHmac('sha256', secret).update(template).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const rawSignature = request.headers.get('x-signature')
  const requestId    = request.headers.get('x-request-id')

  let body: { type?: string; data?: { id?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const { type, data } = body
  const dataId = data?.id ?? ''

  // Verificar assinatura antes de qualquer processamento
  if (!verificarAssinatura(request, dataId, rawSignature, requestId)) {
    console.error('[webhook/mp] Assinatura inválida — requisição rejeitada', { dataId, requestId })
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  if (type === 'subscription_preapproval') {
    const subscriptionId = dataId

    const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    })

    if (!res.ok) {
      console.error('[webhook/mp] Erro ao buscar assinatura no MP:', res.status)
      return NextResponse.json({ ok: true }) // Retorna 200 para MP não retentar
    }

    const subscription = await res.json()
    const [userId, planoId] = (subscription.external_reference || '').split('|')

    if (!userId || !planoId) {
      console.warn('[webhook/mp] external_reference inválido:', subscription.external_reference)
      return NextResponse.json({ ok: true })
    }

    const supabase = await createServiceClient()

    if (subscription.status === 'authorized') {
      const maxKeywords = planoId === 'basic' ? 10 : 999999
      const maxUsuarios = planoId === 'pro' ? 5 : planoId === 'empresarial' ? 999999 : 1

      await supabase.from('profiles').update({
        status:            'active',
        plano:             planoId,
        mp_subscription_id: subscriptionId,
        max_keywords:      maxKeywords,
        max_usuarios:      maxUsuarios,
      }).eq('id', userId)

      console.log(`[webhook/mp] Assinatura ativada: user=${userId} plano=${planoId}`)

    } else if (['cancelled', 'paused'].includes(subscription.status)) {
      await supabase.from('profiles').update({
        status: 'expired',
      }).eq('id', userId)

      console.log(`[webhook/mp] Assinatura expirada: user=${userId} status=${subscription.status}`)
    }
  }

  return NextResponse.json({ ok: true })
}
