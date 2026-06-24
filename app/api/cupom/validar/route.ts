import { createClient, createAdminClient } from '@/lib/supabase/server'
import { PLANOS } from '@/lib/mercadopago'
import { resolverCupom } from '@/lib/cupons'
import { rateLimitGuard, getIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Pré-visualização do desconto de um cupom para (plano, periodo).
// Exige usuário autenticado (o checkout já é autenticado) e é rate-limited
// para evitar enumeração de códigos.
export async function POST(request: Request) {
  const ip = getIp(request)
  if (!rateLimitGuard(`ip:${ip}:cupom`, 20, 60_000)) {
    return NextResponse.json({ valido: false, motivo: 'Muitas tentativas. Aguarde.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ valido: false, motivo: 'Não autorizado' }, { status: 401 })

  if (!rateLimitGuard(`user:${user.id}:cupom`, 15, 60_000)) {
    return NextResponse.json({ valido: false, motivo: 'Muitas tentativas. Aguarde.' }, { status: 429 })
  }

  const { codigo, plano, periodo = 'mensal' } = await request.json().catch(() => ({}))

  if (!codigo || !plano || !(plano in PLANOS)) {
    return NextResponse.json({ valido: false, motivo: 'Dados inválidos' }, { status: 400 })
  }

  const periodoValido: 'mensal' | 'anual' = periodo === 'anual' ? 'anual' : 'mensal'

  const resultado = await resolverCupom(createAdminClient(), String(codigo), plano, periodoValido, user.id)
  return NextResponse.json(resultado)
}
