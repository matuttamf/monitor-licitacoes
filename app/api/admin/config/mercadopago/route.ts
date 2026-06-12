/**
 * GET  /api/admin/config/mercadopago  — retorna estado atual da configuração MP
 * POST /api/admin/config/mercadopago  — testa conexão com a API do MP
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

function mascarar(token: string | undefined): string {
  if (!token) return ''
  if (token.length <= 12) return '***'
  return token.slice(0, 8) + '…' + token.slice(-4)
}

export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const ambiente      = process.env.MP_AMBIENTE ?? 'test'
  const tokenProd     = process.env.MP_ACCESS_TOKEN_PROD
  const tokenTest     = process.env.MP_ACCESS_TOKEN_TEST
  const webhookSecret = process.env.MP_WEBHOOK_SECRET
  const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return NextResponse.json({
    ambiente,
    tokenProdDefinido:     !!tokenProd,
    tokenTestDefinido:     !!tokenTest,
    tokenProdMascarado:    mascarar(tokenProd),
    tokenTestMascarado:    mascarar(tokenTest),
    webhookSecretDefinido: !!webhookSecret,
    webhookUrl:            appUrl ? `${appUrl}/api/webhooks/mercadopago` : '/api/webhooks/mercadopago',
    appUrl,
  })
}

export async function POST() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const ambiente    = process.env.MP_AMBIENTE ?? 'test'
  const accessToken = ambiente === 'production'
    ? process.env.MP_ACCESS_TOKEN_PROD
    : process.env.MP_ACCESS_TOKEN_TEST

  if (!accessToken) {
    return NextResponse.json({
      ok:    false,
      erro:  `Token ${ambiente === 'production' ? 'produção' : 'teste'} não configurado`,
      detalhe: 'Defina a variável de ambiente na Vercel e faça redeploy.',
    })
  }

  try {
    // Endpoint de informações do usuário MP — mais leve que buscar pagamentos
    const res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.ok) {
      return NextResponse.json({
        ok:       true,
        ambiente,
        mensagem: `Conexão ${ambiente === 'production' ? 'produção' : 'teste'} OK`,
      })
    }

    const body = await res.json().catch(() => ({}))
    return NextResponse.json({
      ok:      false,
      status:  res.status,
      erro:    body?.message ?? 'Resposta inesperada do MercadoPago',
      detalhe: res.status === 401 ? 'Token inválido ou expirado.' : undefined,
    })
  } catch (e) {
    return NextResponse.json({
      ok:    false,
      erro:  'Não foi possível conectar ao MercadoPago',
      detalhe: e instanceof Error ? e.message : String(e),
    })
  }
}
