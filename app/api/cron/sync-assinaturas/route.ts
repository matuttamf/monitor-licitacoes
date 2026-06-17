import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLimites } from '@/lib/planos'
import { atualizarValorAssinatura } from '@/lib/mercadopago'
import { verificarCronAuth } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD
  : process.env.MP_ACCESS_TOKEN_TEST

const PRECOS: Record<string, number> = {
  basic: 49.90, profissional: 97.90, gestao: 197.90, pro: 197.90, empresarial: 497.00,
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!ACCESS_TOKEN) {
    console.error('[cron/sync-assinaturas] MP_ACCESS_TOKEN não configurado')
    return NextResponse.json({ error: 'MP_ACCESS_TOKEN não configurado' }, { status: 500 })
  }

  const supabase = createAdminClient()

  // Atualizar preço no MP para usuários cujo desconto expirou
  const { data: comDesconto } = await supabase
    .from('profiles')
    .select('id, plano, mp_subscription_id, voucher_desconto_ate')
    .not('mp_subscription_id', 'is', null)
    .not('voucher_desconto_ate', 'is', null)
    .lt('voucher_desconto_ate', new Date().toISOString())

  for (const p of (comDesconto ?? [])) {
    const precoIntegral = PRECOS[p.plano] ?? null
    if (!precoIntegral || !p.mp_subscription_id) continue
    const ok = await atualizarValorAssinatura(p.mp_subscription_id, precoIntegral)
    if (ok) {
      await supabase.from('profiles').update({
        voucher_desconto_ate:        null,
        voucher_desconto_percentual: null,
        voucher_desconto_meses:      null,
        valor_mensalidade:           precoIntegral,
      }).eq('id', p.id)
      console.log(`[cron/sync-assinaturas] Desconto expirado — preço atualizado para ${precoIntegral} (user=${p.id})`)
    }
  }

  // Buscar todos os perfis com assinatura ativa no MP
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, status, plano, mp_subscription_id, bloqueado_admin, assinatura_inicio')
    .not('mp_subscription_id', 'is', null)

  if (error) {
    console.error('[cron/sync-assinaturas] Erro ao buscar profiles:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!profiles?.length) {
    console.log('[cron/sync-assinaturas] Nenhum perfil com mp_subscription_id')
    return NextResponse.json({ ok: true, sincronizados: 0 })
  }

  let sincronizados = 0
  let erros = 0
  const detalhes: { userId: string; subscriptionId: string; statusMP: string; acao: string }[] = []

  for (const profile of profiles) {
    try {
      const res = await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      })

      if (!res.ok) {
        console.warn(`[cron/sync-assinaturas] MP retornou ${res.status} para sub ${profile.mp_subscription_id}`)
        erros++
        continue
      }

      const sub = await res.json()
      const statusMP: string = sub.status
      const planoId: string  = (sub.external_reference || '').split('|')[1] || profile.plano || 'basic'
      const valorMensalidade = sub.auto_recurring?.transaction_amount ?? PRECOS[planoId] ?? null
      const proximaCobranca: string | null = sub.next_payment_date ?? sub.date_of_next_payment ?? null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update: Record<string, any> = { valor_mensalidade: valorMensalidade }
      let acao = 'sem_mudanca'

      if (statusMP === 'authorized') {
        if (profile.bloqueado_admin) {
          acao = 'ignorado_bloqueio_admin'
        } else if (profile.status !== 'active') {
          const limites = getLimites(planoId)
          update.status       = 'active'
          update.plano        = planoId
          update.max_keywords = limites.maxKeywords
          update.max_usuarios = limites.maxUsers
          update.acesso_ate   = null  // Limpa carência anterior em reativações
          if (!profile.assinatura_inicio) update.assinatura_inicio = new Date().toISOString()
          acao = 'reativado'
        } else {
          acao = 'ativo_ok'
        }
      } else if (['cancelled', 'paused'].includes(statusMP)) {
        if (proximaCobranca && new Date(proximaCobranca) > new Date()) {
          update.acesso_ate          = new Date(proximaCobranca).toISOString()
          update.mp_subscription_id  = null
          acao = 'carencia'
        } else {
          update.status             = 'expired'
          update.mp_subscription_id = null
          update.acesso_ate         = null
          acao = 'expirado'
        }
      } else if (statusMP === 'expired') {
        update.status             = 'expired'
        update.mp_subscription_id = null
        update.acesso_ate         = null
        acao = 'expirado'
      }

      await supabase.from('profiles').update(update).eq('id', profile.id)
      sincronizados++
      detalhes.push({ userId: profile.id, subscriptionId: profile.mp_subscription_id!, statusMP, acao })
    } catch (e) {
      console.error(`[cron/sync-assinaturas] Erro ao processar ${profile.id}:`, e)
      erros++
    }
  }

  const resultado = { ok: true, sincronizados, erros, detalhes }
  await registrarCronLog({
    job: 'sync-assinaturas',
    status: erros > 0 && sincronizados === 0 ? 'erro' : 'ok',
    mensagem: `${sincronizados} sincronizado(s), ${erros} erro(s)`,
    detalhes: resultado,
  })
  return NextResponse.json(resultado)
}
