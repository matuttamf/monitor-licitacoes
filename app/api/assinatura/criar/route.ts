import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  criarCheckoutAssinatura,
  PLANOS,
  atualizarValorAssinatura,
  buscarAssinatura,
  criarPreferenciaUpgrade,
} from '@/lib/mercadopago'
import { getLimites } from '@/lib/planos'
import { resolverCupom } from '@/lib/cupons'
import { NextResponse } from 'next/server'
import { rateLimitGuard, getIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getIp(request)
  if (!rateLimitGuard(`ip:${ip}:criar`, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!rateLimitGuard(`user:${user.id}:criar`, 5, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const { plano, periodo = 'mensal', cupom } = await request.json()

  if (!plano || !(plano in PLANOS)) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('cnpj, cpf, campanha_id, status, plano, mp_subscription_id, periodo')
    .eq('id', user.id)
    .single()

  if (!profile?.cnpj && !profile?.cpf) {
    return NextResponse.json({ cadastroIncompleto: true }, { status: 200 })
  }

  const periodoValido: 'mensal' | 'anual' = periodo === 'anual' ? 'anual' : 'mensal'
  const planoData = PLANOS[plano as keyof typeof PLANOS]

  // ── Desconto: cupom digitado › atribuição por link ────────────────────────────
  // campanhas tem RLS sem acesso público → leituras usam service-role (admin).
  let descontoPercentual = 0
  let descontoMeses      = 0   // 0 = permanente
  let precoFinal = periodoValido === 'anual' ? planoData.preco_anual : planoData.preco
  let campanhaCupom: string | null = null

  const adminDb = createAdminClient()

  // 1) Cupom digitado no checkout tem precedência
  if (cupom) {
    const r = await resolverCupom(adminDb, String(cupom), plano, periodoValido)
    if (r.valido) {
      descontoPercentual = r.percentual
      descontoMeses      = r.meses
      precoFinal         = r.precoFinal
      // Só atribui o cupom como origem se NÃO for campanha de afiliado —
      // senão um código público digitado creditaria comissão sem o afiliado ter trazido o lead.
      if (r.comissaoTipo === 'nenhum') campanhaCupom = r.campanhaId ?? null
    }
  }

  // 2) Fallback: desconto global por atribuição de link (campanha_id)
  if (descontoPercentual === 0 && profile?.campanha_id) {
    const { data: campanha } = await adminDb
      .from('campanhas')
      .select('desconto_percentual, desconto_meses')
      .eq('id', profile.campanha_id)
      .eq('ativo', true)
      .maybeSingle()

    if (campanha && campanha.desconto_percentual > 0 && campanha.desconto_meses > 0) {
      descontoPercentual = campanha.desconto_percentual
      descontoMeses      = campanha.desconto_meses
      precoFinal         = Math.round(precoFinal * (1 - descontoPercentual / 100) * 100) / 100
    }
  }

  // Atribui a campanha do cupom ao perfil se ainda não houver atribuição (métricas)
  if (campanhaCupom && !profile?.campanha_id) {
    await adminDb.from('profiles').update({ campanha_id: campanhaCupom }).eq('id', user.id)
  }

  // ── Upgrade / downgrade in-place (assinante ativo, mesmo período) ─────────────
  const periodoAtual = (profile?.periodo ?? 'mensal') as 'mensal' | 'anual'
  if (
    profile?.status === 'active' &&
    profile?.mp_subscription_id &&
    periodoValido === periodoAtual &&
    descontoPercentual === 0  // com desconto ativo, recria normalmente
  ) {
    const planoAtualKey = (profile.plano ?? 'basic') as keyof typeof PLANOS
    const precoAtual = periodoAtual === 'anual'
      ? (PLANOS[planoAtualKey]?.preco_anual ?? 0)
      : (PLANOS[planoAtualKey]?.preco ?? 0)

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

    if (plano === profile.plano) {
      return NextResponse.json({ url: `${APP_URL}/dashboard` })
    }

    const limites = getLimites(plano)

    if (precoFinal <= precoAtual) {
      // ── Downgrade: atualiza preço no MP para próximo ciclo; mantém limites atuais até vencimento ──
      // external_reference atualizado para que o webhook do próximo pagamento aplique os limites certos
      const novoExtRef = periodoValido === 'anual'
        ? `${user.id}|${plano}|periodo:anual`
        : `${user.id}|${plano}`
      await atualizarValorAssinatura(profile.mp_subscription_id, precoFinal, novoExtRef)
      await supabase.from('profiles').update({
        plano,
        valor_mensalidade: precoFinal,
        // max_keywords e max_usuarios permanecem do plano atual até o próximo ciclo
      }).eq('id', user.id)
      return NextResponse.json({ url: `${APP_URL}/assinatura/sucesso?tipo=downgrade&plano=${plano}` })
    }

    // ── Upgrade: calcular proporcional ───────────────────────────────────────
    const mpSub = await buscarAssinatura(profile.mp_subscription_id)
    const nextPaymentStr = (mpSub?.next_payment_date ?? mpSub?.date_of_next_payment) as string | undefined
    let proracao = 0

    if (nextPaymentStr) {
      const nextPayment   = new Date(nextPaymentStr)
      const hoje          = new Date()
      const diasRestantes = Math.max(0, Math.ceil((nextPayment.getTime() - hoje.getTime()) / 86400000))
      const diasCiclo     = periodoValido === 'anual' ? 365 : 30
      proracao = Math.round((diasRestantes / diasCiclo) * (precoFinal - precoAtual) * 100) / 100
    }

    if (proracao <= 1.00) {
      // Proporcional irrisório — aplica direto sem cobrança extra
      await atualizarValorAssinatura(profile.mp_subscription_id, precoFinal)
      await supabase.from('profiles').update({
        plano,
        max_keywords:      limites.maxKeywords,
        max_usuarios:      limites.maxUsers,
        valor_mensalidade: precoFinal,
      }).eq('id', user.id)
      return NextResponse.json({ url: `${APP_URL}/assinatura/sucesso?tipo=upgrade&plano=${plano}` })
    }

    // Cria cobrança avulsa pelo proporcional
    // external_reference: userId|upgrade|novoPlano|periodo|subscriptionId
    const extRef = `${user.id}|upgrade|${plano}|${periodoValido}|${profile.mp_subscription_id}`
    const url = await criarPreferenciaUpgrade(extRef, limites.nome, proracao, plano)
    if (!url) return NextResponse.json({ error: 'Erro ao criar cobrança proporcional' }, { status: 500 })

    return NextResponse.json({ url })
  }

  // ── Nova assinatura (trial, expirado, troca de período) ───────────────────────
  try {
    const { url: checkoutUrl, preapprovalId } = await criarCheckoutAssinatura(
      plano, user.id, user.email!,
      precoFinal, descontoPercentual, descontoMeses, periodoValido,
    )
    // Salva o ID da assinatura MP imediatamente — o sync cron vai encontrá-la via GET direto
    if (preapprovalId) {
      const adminSupabase = (await import('@/lib/supabase/server')).createAdminClient()
      await adminSupabase.from('profiles').update({ mp_subscription_id: preapprovalId }).eq('id', user.id)
      console.log(`[assinatura/criar] preapproval salvo user=${user.id} sub=${preapprovalId}`)
    }
    return NextResponse.json({ url: checkoutUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[assinatura/criar]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
