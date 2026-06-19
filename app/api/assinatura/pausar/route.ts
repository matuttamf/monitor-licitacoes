import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimitGuard, getIp } from '@/lib/rate-limit'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

const DIAS_PAUSA    = 14
const DIAS_CARENCIA = 180  // só pode pausar novamente após 180 dias da última pausa

export async function POST(request: Request) {
  const ip = getIp(request)
  if (!rateLimitGuard(`ip:${ip}:pausar`, 5, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('mp_subscription_id, status, ultima_pausa_em')
    .eq('id', user.id)
    .single()

  if (!profile?.mp_subscription_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 400 })
  }

  if (profile.status !== 'active') {
    return NextResponse.json({ error: 'Assinatura não está ativa' }, { status: 400 })
  }

  // Verifica carência de 180 dias desde a última pausa
  if (profile.ultima_pausa_em) {
    const diasDesdeUltimaPausa = (Date.now() - new Date(profile.ultima_pausa_em).getTime()) / (1000 * 60 * 60 * 24)
    if (diasDesdeUltimaPausa < DIAS_CARENCIA) {
      const diasRestantes = Math.ceil(DIAS_CARENCIA - diasDesdeUltimaPausa)
      return NextResponse.json(
        { error: `A pausa só pode ser usada novamente em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}.` },
        { status: 400 }
      )
    }
  }

  const res = await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ status: 'paused' }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erro ao pausar no MercadoPago' }, { status: 500 })
  }

  const agora     = new Date()
  const pausaAte  = new Date(agora.getTime() + DIAS_PAUSA * 24 * 60 * 60 * 1000)

  const serviceClient = await createServiceClient()
  await serviceClient.from('profiles').update({
    status:          'paused',
    ultima_pausa_em: agora.toISOString(),
    pausa_ate:       pausaAte.toISOString(),
  }).eq('id', user.id)

  return NextResponse.json({ ok: true, pausaAte: pausaAte.toISOString() })
}
