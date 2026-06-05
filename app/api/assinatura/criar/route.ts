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

  const checkoutUrl = await criarCheckoutAssinatura(plano, user.id, user.email!)

  return NextResponse.json({ url: checkoutUrl })
}
