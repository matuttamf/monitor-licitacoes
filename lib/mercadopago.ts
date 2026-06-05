export const PLANOS = {
  basic:        { nome: 'Basic',        preco: 49.90,  max_keywords: 10,     max_usuarios: 1 },
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
  email: string
): Promise<string> {
  const plano = PLANOS[planoId as keyof typeof PLANOS]

  const res = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      reason: `Monitor de Licitações - ${plano.nome}`,
      external_reference: `${userId}|${planoId}`,
      payer_email: email,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plano.preco,
        currency_id: 'BRL',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura/sucesso`,
      status: 'pending',
    }),
  })

  const data = await res.json()
  return data.init_point
}
