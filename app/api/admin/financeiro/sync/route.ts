/**
 * POST /api/admin/financeiro/sync
 * Sincroniza status de assinatura(s) diretamente da API do MercadoPago.
 * Body: { userId?: string }  — sem userId sincroniza todos os assinantes ativos com mp_subscription_id.
 * Também detecta trials que já pagaram mas não tiveram mp_subscription_id gravado (webhook perdido).
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

type MpSubscription = {
  id: string
  status: string                    // authorized | paused | cancelled | pending | expired
  auto_recurring: {
    frequency: number
    frequency_type: string
    transaction_amount: number
    currency_id: string
  }
  next_payment_date?: string        // ISO8601 — fim do ciclo atual
  date_of_next_payment?: string     // alias em algumas versões da API
  last_modified: string
  external_reference: string        // userId|planoId
  summarized?: {
    last_charged_date?: string
    last_charged_amount?: number
    charged_quantity?: number
  }
}

async function buscarAssinaturaMP(subscriptionId: string): Promise<MpSubscription | null> {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })
  if (!res.ok) return null
  return res.json()
}

// Busca assinatura no MP pelo e-mail do pagador
// Útil quando o webhook não gravou o mp_subscription_id (ex: webhook perdido na primeira cobrança)
async function buscarAssinaturaPorEmail(email: string): Promise<MpSubscription | null> {
  const res = await fetch(
    `https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(email)}&limit=10&sort=date_created&criteria=desc`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  )
  if (!res.ok) return null
  const json = await res.json()
  const resultados: MpSubscription[] = json.results ?? []
  return resultados.find(s => s.status === 'authorized') ?? resultados[0] ?? null
}

export async function POST(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { userId } = body as { userId?: string }

  const supabase = createAdminClient()

  // Busca profiles: com mp_subscription_id definido OU trials sem ele (webhook pode ter falhado)
  let query = supabase
    .from('profiles')
    .select('id, email, status, plano, mp_subscription_id, acesso_ate, assinatura_inicio, valor_mensalidade')

  if (userId) {
    query = query.eq('id', userId)
  } else {
    query = query.in('status', ['active', 'trial'])
  }

  const { data: profiles, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!profiles?.length) return NextResponse.json({ ok: true, sincronizados: 0, detalhes: [] })

  const resultados: Array<{
    userId: string
    subscriptionId: string
    statusMP: string
    statusAntes: string
    statusDepois: string
    acessoAte: string | null
    valor: number | null
    erro?: string
  }> = []

  for (const profile of profiles) {
    let sub: MpSubscription | null = null

    if (profile.mp_subscription_id) {
      sub = await buscarAssinaturaMP(profile.mp_subscription_id)
    } else if (profile.status === 'trial' && profile.email) {
      // Webhook pode ter falhado — busca pelo e-mail do pagador no MP
      sub = await buscarAssinaturaPorEmail(profile.email)
      if (sub) {
        console.log(`[sync] Assinatura encontrada via payer_email para trial user=${profile.id} sub=${sub.id}`)
      }
    }

    if (!sub) {
      // Sem mp_subscription_id e sem assinatura no MP — conta manual/admin, pula silenciosamente
      if (!profile.mp_subscription_id) continue
      resultados.push({
        userId:         profile.id,
        subscriptionId: profile.mp_subscription_id,
        statusMP:       'erro_api',
        statusAntes:    profile.status,
        statusDepois:   profile.status,
        acessoAte:      null,
        valor:          null,
        erro:           'Não foi possível buscar no MP',
      })
      continue
    }

    // Se o mp_subscription_id foi descoberto via external_ref (webhook perdido), grava agora
    const subscriptionIdFinal = profile.mp_subscription_id ?? sub.id

    const update: Record<string, unknown> = {
      valor_mensalidade:  sub.auto_recurring?.transaction_amount ?? profile.valor_mensalidade,
      mp_subscription_id: subscriptionIdFinal,
    }

    let statusDepois = profile.status

    if (sub.status === 'authorized') {
      // Pagamento ativo — garante acesso liberado e limpa acesso_ate de cancelamentos antigos
      const extParts = (sub.external_reference ?? '').split('|')
      const planoDetectado = extParts[1] ?? profile.plano
      const periodoDetectado: 'mensal' | 'anual' = extParts.includes('periodo:anual') ? 'anual' : 'mensal'
      update.status     = 'active'
      update.plano      = planoDetectado
      update.periodo    = periodoDetectado
      update.acesso_ate = null
      if (!profile.assinatura_inicio) {
        update.assinatura_inicio = new Date().toISOString()
      }
      statusDepois = 'active'
    } else if (['cancelled', 'paused'].includes(sub.status)) {
      const fimCiclo = sub.next_payment_date ?? sub.date_of_next_payment ?? null
      if (fimCiclo && new Date(fimCiclo) > new Date()) {
        // Ainda dentro do período pago — mantém ativo até lá
        update.acesso_ate          = new Date(fimCiclo).toISOString()
        update.mp_subscription_id  = null
        statusDepois               = profile.status // 'active' ou conforme estava
      } else {
        // Período já encerrou — expira agora
        update.status             = 'expired'
        update.mp_subscription_id = null
        update.acesso_ate         = null
        statusDepois              = 'expired'
      }
    } else if (['pending', 'in_process'].includes(sub.status)) {
      // Aguardando pagamento — não altera nada, só registra
      statusDepois = profile.status
    } else {
      // expired ou desconhecido
      update.status             = 'expired'
      update.mp_subscription_id = null
      update.acesso_ate         = null
      statusDepois              = 'expired'
    }

    await supabase.from('profiles').update(update).eq('id', profile.id)

    resultados.push({
      userId:         profile.id,
      subscriptionId: subscriptionIdFinal,
      statusMP:       sub.status,
      statusAntes:    profile.status,
      statusDepois,
      acessoAte:      (update.acesso_ate as string | null) ?? null,
      valor:          sub.auto_recurring?.transaction_amount ?? null,
    })
  }

  return NextResponse.json({
    ok:            true,
    sincronizados: resultados.length,
    detalhes:      resultados,
  })
}
