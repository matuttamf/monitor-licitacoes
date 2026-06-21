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

// Busca a preapproval no MP pelo ID salvo no perfil (caminho principal — O(1))
async function buscarPorId(subId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${subId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })
  if (!res.ok) return null
  return res.json()
}

// Fallback para trials sem mp_subscription_id: tenta todas as combinações de plano/período.
// Usado apenas enquanto existirem checkouts criados antes do deploy que salva o ID.
const PLANOS_IDS = ['basic', 'profissional', 'gestao', 'empresarial']
async function buscarPorExtRef(userId: string): Promise<Record<string, unknown> | null> {
  const candidatos = PLANOS_IDS.flatMap(p => [`${userId}|${p}`, `${userId}|${p}|periodo:anual`])
  for (const extRef of candidatos) {
    const r = await fetch(
      `https://api.mercadopago.com/preapproval/search?external_reference=${encodeURIComponent(extRef)}&limit=10`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
    )
    if (!r.ok) continue
    const j = await r.json()
    const results: Record<string, unknown>[] = j.results ?? []
    const sub = results.find(s => s.status === 'authorized') ?? null
    if (sub) {
      console.log(`[sync/ext_ref] user=${userId} extRef=${extRef} sub=${sub.id} status=${sub.status}`)
      return sub
    }
  }

  // Última linha de defesa: busca pagamentos aprovados quando todas as preapprovals
  // estão pending (usuário pode ter tentado múltiplas vezes; a aprovada usa mesmo extRef).
  // Se encontrar pagamento aprovado, constrói um objeto sintético que simula preapproval.
  return buscarPorPagamentoAprovado(userId)
}

// Busca no histórico de pagamentos um pagamento aprovado com external_reference do usuário.
// Cobre o caso de Anne: múltiplas tentativas pendentes + 1 aprovada com mesmo extRef.
async function buscarPorPagamentoAprovado(userId: string): Promise<Record<string, unknown> | null> {
  for (const planoId of PLANOS_IDS) {
    for (const extRef of [`${userId}|${planoId}`, `${userId}|${planoId}|periodo:anual`]) {
      const r = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(extRef)}&status=approved&sort=date_created&criteria=desc&limit=1`,
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
      )
      if (!r.ok) continue
      const j = await r.json()
      const results: Record<string, unknown>[] = j.results ?? []
      const pay = results[0]
      if (!pay) continue

      console.log(`[sync/payment] user=${userId} extRef=${extRef} paymentId=${pay.id} status=${pay.status}`)

      // Buscar pagamento completo: /v1/payments/search retorna campos truncados,
      // preapproval_id só aparece no objeto completo via /v1/payments/{id}
      const rf = await fetch(
        `https://api.mercadopago.com/v1/payments/${pay.id}`,
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
      )
      if (rf.ok) {
        const fullPay = await rf.json()
        const preapprovalId = fullPay.preapproval_id as string | null
        if (preapprovalId) {
          const sub = await buscarPorId(preapprovalId)
          if (sub) {
            console.log(`[sync/payment→preapproval] user=${userId} preapprovalId=${preapprovalId}`)
            return sub
          }
        }
      }

      // Último recurso: objeto sintético — ativa mas sem mp_subscription_id
      // (na próxima renovação o webhook captura o ID corretamente)
      return {
        id:                 null,
        status:             'authorized',
        external_reference: extRef,
        auto_recurring:     { transaction_amount: pay.transaction_amount },
        next_payment_date:  null,
        _from_payment:      true,
      }
    }
  }
  return null
}

// Calcula as mudanças necessárias no perfil dado o status do MP
function calcularUpdate(
  profile: { id: string; status: string; plano: string; mp_subscription_id: string | null; bloqueado_admin: boolean; assinatura_inicio: string | null },
  sub: Record<string, unknown>,
) {
  const statusMP = sub.status as string
  const extParts = ((sub.external_reference as string) || '').split('|')
  const planoId = extParts[1] || profile.plano || 'basic'
  const periodoDetectado: 'mensal' | 'anual' = extParts.includes('periodo:anual') ? 'anual' : 'mensal'
  const autoRecurring = sub.auto_recurring as Record<string, unknown> | undefined
  const valorMensalidade = (autoRecurring?.transaction_amount as number | null) ?? PRECOS[planoId] ?? null
  const proximaCobranca: string | null = (sub.next_payment_date as string | null) ?? (sub.date_of_next_payment as string | null) ?? null
  const subscriptionIdFinal = (profile.mp_subscription_id ?? sub.id) as string
  const agora = new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {
    valor_mensalidade:  valorMensalidade,
    mp_subscription_id: subscriptionIdFinal,
    mp_synced_at:       agora,
  }
  let acao = 'sem_mudanca'

  if (statusMP === 'authorized') {
    if (profile.bloqueado_admin) {
      acao = 'ignorado_bloqueio_admin'
    } else if (profile.status !== 'active') {
      const limites = getLimites(planoId)
      update.status       = 'active'
      update.plano        = planoId
      update.periodo      = periodoDetectado
      update.max_keywords = limites.maxKeywords
      update.max_usuarios = limites.maxUsers
      update.acesso_ate   = null
      if (!profile.assinatura_inicio) update.assinatura_inicio = agora
      acao = 'reativado'
    } else {
      acao = 'ativo_ok'
    }
  } else if (statusMP === 'pending') {
    // Preapproval ainda não autorizada — limpa o ID para que a próxima rodada
    // tente buscarPorExtRef novamente, podendo encontrar outra preapproval autorizada.
    // (usuário pode ter iniciado checkout múltiplas vezes; a autorizada tem ID diferente)
    update.mp_subscription_id = null
    acao = 'pendente'
  } else if (['cancelled', 'paused'].includes(statusMP)) {
    if (proximaCobranca && new Date(proximaCobranca) > new Date()) {
      update.acesso_ate         = new Date(proximaCobranca).toISOString()
      update.mp_subscription_id = null
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

  return { update, acao, statusMP, subscriptionIdFinal }
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

  // ── Desconto expirado: atualiza preço no MP ───────────────────────────────────
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
      console.log(`[sync] desconto expirado — preço atualizado para ${precoIntegral} (user=${p.id})`)
    }
  }

  // ── Paginação: 300 usuários por rodada, priorizando quem está há mais tempo sem sync.
  // Chamadas ao MP rodadas em paralelo → cobre ~540k usuários/dia (300 × 30 runs/h × 24h).
  // Webhook continua sendo o caminho real-time; este cron é a rede de segurança.
  const BATCH = 300
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, status, plano, mp_subscription_id, bloqueado_admin, assinatura_inicio')
    .in('status', ['active', 'trial'])
    .order('mp_synced_at', { ascending: true, nullsFirst: true })
    .limit(BATCH)

  if (error) {
    console.error('[cron/sync-assinaturas] Erro ao buscar profiles:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!profiles?.length) {
    return NextResponse.json({ ok: true, sincronizados: 0 })
  }

  // ── Lookup paralelo no MP ─────────────────────────────────────────────────────
  const lookups = await Promise.allSettled(
    profiles.map(p =>
      p.mp_subscription_id
        ? buscarPorId(p.mp_subscription_id)
        : buscarPorExtRef(p.id),  // trial E active-sem-ID buscam pelo external_reference
    ),
  )

  // ── Aplicar updates no Supabase ───────────────────────────────────────────────
  let sincronizados = 0
  let erros = 0
  const detalhes: { userId: string; subscriptionId: string; statusMP: string; acao: string }[] = []

  await Promise.allSettled(
    profiles.map(async (profile, i) => {
      const result = lookups[i]
      if (result.status === 'rejected') { erros++; return }
      const sub = result.value
      if (!sub) return

      try {
        const { update, acao, statusMP, subscriptionIdFinal } = calcularUpdate(profile, sub)
        const { error: updateError } = await supabase.from('profiles').update(update).eq('id', profile.id)
        if (updateError) throw new Error(updateError.message)
        sincronizados++
        detalhes.push({ userId: profile.id, subscriptionId: subscriptionIdFinal, statusMP, acao })
        if (acao !== 'sem_mudanca' && acao !== 'ativo_ok') {
          console.log(`[sync] user=${profile.id} acao=${acao} statusMP=${statusMP}`)
        }
      } catch (e) {
        console.error(`[sync] erro ao atualizar user=${profile.id}:`, e)
        erros++
      }
    }),
  )

  const resultado = { ok: true, sincronizados, erros, detalhes }
  await registrarCronLog({
    job: 'sync-assinaturas',
    status: erros > 0 && sincronizados === 0 ? 'erro' : 'ok',
    mensagem: `${sincronizados} sincronizado(s), ${erros} erro(s)`,
    detalhes: resultado,
  })
  return NextResponse.json(resultado)
}
