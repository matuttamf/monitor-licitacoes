import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { resolverRef } from '@/lib/afiliados'

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

  const ref = await resolverRef(admin, codigo)
  if (!ref) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Incremento atômico de cliques — await necessário: a função serverless encerra no return.
  if (ref.tipo === 'afiliado') {
    const { error } = await admin.rpc('incrementar_cliques_afiliado_campanha', { vinculo_id: ref.vinculoId })
    if (error) console.error('[/r] erro ao incrementar cliques do vínculo:', error)
  } else {
    const { error } = await admin.rpc('incrementar_cliques_campanha', { campanha_id: ref.campanhaId })
    if (error) console.error('[/r] erro ao incrementar cliques da campanha:', error)
  }

  const base = ref.urlDestino?.startsWith('http') ? ref.urlDestino : APP_URL
  const destino = new URL(base)
  destino.searchParams.set('ref', codigo)

  const response = NextResponse.redirect(destino)
  // Cookie de atribuição — persiste 30 dias mesmo que o visitante navegue antes de se cadastrar
  response.cookies.set('affiliate_ref', codigo, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: false, // lido pelo JS client-side no /cadastro
    sameSite: 'lax',
  })
  return response
}
