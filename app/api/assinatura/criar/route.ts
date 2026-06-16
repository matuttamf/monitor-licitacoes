import { createClient } from '@/lib/supabase/server'
import {
  criarCheckoutAssinatura,
  PLANOS,
  atualizarValorAssinatura,
  buscarAssinatura,
  criarPreferenciaUpgrade,
} from '@/lib/mercadopago'
import { getLimites } from '@/lib/planos'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { plano, periodo = 'mensal' } = await request.json()

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

  // ── Desconto de campanha ──────────────────────────────────────────────────────
  let descontoPercentual = 0
  let descontoMeses      = 0
  let precoFinal = periodoValido === 'anual' ? planoData.preco_anual : planoData.preco

  if (profile?.campanha_id) {
    const { data: campanha } = await supabase
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
  const checkoutUrl = await criarCheckoutAssinatura(
    plano, user.id, user.email!,
    precoFinal, descontoPercentual, descontoMeses, periodoValido,
  )

  return NextResponse.json({ url: checkoutUrl })
}
