import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getLimites } from '@/lib/planos'
import { Resend } from 'resend'
import { emailConfirmacaoAssinatura } from '@/lib/emails/confirmacao-assinatura'

const PRECOS_PLANO: Record<string, number> = {
  basic:        97,
  profissional: 197,
  pro:          297,
  empresarial:  497,
}

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
      const limites = getLimites(planoId)

      await supabase.from('profiles').update({
        status:             'active',
        plano:              planoId,
        mp_subscription_id: subscriptionId,
        max_keywords:       limites.maxKeywords,
        max_usuarios:       limites.maxUsers,
      }).eq('id', userId)

      console.log(`[webhook/mp] Assinatura ativada: user=${userId} plano=${planoId} keywords=${limites.maxKeywords}`)

      // Enviar e-mail de confirmação (não bloqueante)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, nome')
          .eq('id', userId)
          .maybeSingle()

        if (profile?.email) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { subject, html, text } = emailConfirmacaoAssinatura({
            nome:  profile.nome ?? undefined,
            email: profile.email,
            plano: planoId,
            valor: PRECOS_PLANO[planoId] ?? 97,
          })
          await resend.emails.send({
            from: 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
            to:   profile.email,
            subject, html, text,
          })
          console.log(`[webhook/mp] E-mail confirmação enviado para ${profile.email}`)
        }
      } catch (e) {
        console.error('[webhook/mp] Erro ao enviar e-mail confirmação:', e)
      }

    } else if (['cancelled', 'paused'].includes(subscription.status)) {
      await supabase.from('profiles').update({
        status:            'expired',
        mp_subscription_id: null,
      }).eq('id', userId)

      console.log(`[webhook/mp] Assinatura cancelada/pausada: user=${userId} status=${subscription.status}`)
    }
  }

  return NextResponse.json({ ok: true })
}
