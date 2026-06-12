export const PLANOS = {
  basic:        { nome: 'Basic',        preco: 49.90,  max_keywords: 20,     max_usuarios: 1 },
  profissional: { nome: 'Profissional', preco: 97.90,  max_keywords: 999999, max_usuarios: 1 },
  pro:          { nome: 'Pro',          preco: 197.90, max_keywords: 999999, max_usuarios: 5 },
  empresarial:  { nome: 'Empresarial',  preco: 497.00, max_keywords: 999999, max_usuarios: 999999 },
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
): Promise<string> {
  const plano = PLANOS[planoId as keyof typeof PLANOS]
  const valor = precoFinal ?? plano.preco

  // external_reference: userId|planoId[|descN|mesesN] — o webhook usa para saber se há desconto
  const extRef = (descontoPercentual && descontoPercentual > 0 && descontoMeses && descontoMeses > 0)
    ? `${userId}|${planoId}|desc${descontoPercentual}|meses${descontoMeses}`
    : `${userId}|${planoId}`

  const razaoDesc = (descontoPercentual && descontoPercentual > 0)
    ? ` (${descontoPercentual}% off por ${descontoMeses} meses)`
    : ''

  const res = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      reason: `Monitor de Licitações - ${plano.nome}${razaoDesc}`,
      external_reference: extRef,
      payer_email: email,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: valor,
        currency_id: 'BRL',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura/sucesso`,
      status: 'pending',
    }),
  })

  const data = await res.json()
  return data.init_point
}

/** Atualiza o valor de cobrança de uma assinatura existente no MercadoPago */
export async function atualizarValorAssinatura(subscriptionId: string, novoValor: number): Promise<boolean> {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      auto_recurring: { transaction_amount: novoValor },
    }),
  })
  return res.ok
}
