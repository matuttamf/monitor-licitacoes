import { createClient } from '@/lib/supabase/server'
import { criarCheckoutAssinatura, PLANOS } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { plano } = await request.json()

  if (!plano || !(plano in PLANOS)) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  // Verificar dados fiscais e campanha do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('cnpj, cpf, campanha_id')
    .eq('id', user.id)
    .single()

  if (!profile?.cnpj && !profile?.cpf) {
    return NextResponse.json({ cadastroIncompleto: true }, { status: 200 })
  }

  // Verificar desconto de campanha/parceria
  let descontoPercentual = 0
  let descontoMeses      = 0
  let precoFinal         = PLANOS[plano as keyof typeof PLANOS].preco

  if (profile?.campanha_id) {
    const { data: campanha } = await supabase
      .from('campanhas')
      .select('desconto_percentual, desconto_meses')
      .eq('id', profile.campanha_id)
      .eq('ativo', true)
      .maybeSingle()

    if (campanha?.desconto_percentual > 0 && campanha?.desconto_meses > 0) {
      descontoPercentual = campanha.desconto_percentual
      descontoMeses      = campanha.desconto_meses
      precoFinal         = Math.round(precoFinal * (1 - descontoPercentual / 100) * 100) / 100
    }
  }

  const checkoutUrl = await criarCheckoutAssinatura(
    plano, user.id, user.email!,
    precoFinal, descontoPercentual, descontoMeses,
  )

  return NextResponse.json({ url: checkoutUrl })
}
