export const PLANOS = {
  basic:        { nome: 'Basic',        preco: 49.90,  preco_anual: 499.00,  max_keywords: 20,     max_usuarios: 1       },
  profissional: { nome: 'Profissional', preco: 97.90,  preco_anual: 979.00,  max_keywords: 999999, max_usuarios: 1       },
  gestao:       { nome: 'Gestão',       preco: 197.90, preco_anual: 1979.00, max_keywords: 999999, max_usuarios: 5       },
  empresarial:  { nome: 'Empresarial',  preco: 497.00, preco_anual: 4970.00, max_keywords: 999999, max_usuarios: 999999  },
}

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

export async function criarPlanoMP(planoId: string): Promise<string> {
  const plano = PLANOS[planoId as keyof typeof PLANOS]

  const res = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      reason: `Monitor de Licitações - ${plano.nome}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plano.preco,
        currency_id: 'BRL',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura/sucesso`,
      status: 'active',
    }),
  })

  const data = await res.json()
  return data.id
}

export async function criarCheckoutAssinatura(
  planoId: string,
  userId: string,
  email: string,
  precoFinal?: number,
  descontoPercentual?: number,
  descontoMeses?: number,
  periodo: 'mensal' | 'anual' = 'mensal',
): Promise<string> {
  const plano = PLANOS[planoId as keyof typeof PLANOS]
  const precoBase = periodo === 'anual' ? plano.preco_anual : plano.preco
  const valor = precoFinal ?? precoBase

  // external_reference: userId|planoId[|descN|mesesN][|periodo:anual]
  const parts = [userId, planoId]
  if (descontoPercentual && descontoPercentual > 0 && descontoMeses && descontoMeses > 0) {
    parts.push(`desc${descontoPercentual}`, `meses${descontoMeses}`)
  }
  if (periodo === 'anual') parts.push('periodo:anual')
  const extRef = parts.join('|')

  const razaoDesc = (descontoPercentual && descontoPercentual > 0)
    ? ` (${descontoPercentual}% off por ${descontoMeses} meses)`
    : ''
  const razaoPeriodo = periodo === 'anual' ? ' — Anual' : ''

  const res = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      reason: `Monitor de Licitações - ${plano.nome}${razaoDesc}${razaoPeriodo}`,
      external_reference: extRef,

      auto_recurring: {
        frequency:          periodo === 'anual' ? 12 : 1,
        frequency_type:     'months',
        transaction_amount: valor,
        currency_id:        'BRL',
      },
      payer_email: email,
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura/sucesso`,
      status: 'pending',
    }),
  })

  const data = await res.json()
  return data.init_point
}

/** Atualiza o valor de cobrança (e opcionalmente o external_reference) de uma assinatura no MercadoPago */
export async function atualizarValorAssinatura(
  subscriptionId: string,
  novoValor: number,
  externalReference?: string,
): Promise<boolean> {
  const body: Record<string, unknown> = {
    auto_recurring: { transaction_amount: novoValor },
  }
  if (externalReference) body.external_reference = externalReference

  const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })
  return res.ok
}

/** Busca dados de uma assinatura no MercadoPago (next_payment_date etc.) */
export async function buscarAssinatura(subscriptionId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  })
  if (!res.ok) return null
  return res.json()
}

/** Cria uma preferência de pagamento avulso (usado para cobrança proporcional no upgrade) */
export async function criarPreferenciaUpgrade(
  externalRef: string,
  nomePlano: string,
  valor: number,
  planoId: string,
): Promise<string | null> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [{
        id:         'upgrade-proporcional',
        title:      `Upgrade para plano ${nomePlano} (proporcional)`,
        quantity:   1,
        unit_price: valor,
        currency_id: 'BRL',
      }],
      external_reference: externalRef,
      back_urls: {
        success: `${APP_URL}/assinatura/sucesso?tipo=upgrade&plano=${planoId}`,
        failure: `${APP_URL}/assinar?from=painel&erro=upgrade`,
        pending: `${APP_URL}/assinar?from=painel`,
      },
      auto_return: 'approved',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.init_point ?? null
}
