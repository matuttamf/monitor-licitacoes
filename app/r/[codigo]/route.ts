import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: campanha } = await admin
    .from('campanhas')
    .select('id, ativo, url_destino')
    .eq('codigo', codigo)
    .maybeSingle()

  if (!campanha?.ativo) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Incremento atômico — await necessário: em serverless a função encerra no return
  const { error: rpcErr } = await admin.rpc('incrementar_cliques_campanha', { campanha_id: campanha.id })
  if (rpcErr) console.error('[/r] erro ao incrementar cliques:', rpcErr)

  const base = campanha.url_destino?.startsWith('http')
    ? campanha.url_destino
    : APP_URL
  const destino = new URL(base)
  destino.searchParams.set('ref', codigo)

  const response = NextResponse.redirect(destino)
  // Cookie de atribuição — persiste por 30 dias mesmo que o visitante navegue antes de se cadastrar
  response.cookies.set('affiliate_ref', codigo, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: false, // precisa ser lido pelo JS client-side no /cadastro
    sameSite: 'lax',
  })
  return response
}
