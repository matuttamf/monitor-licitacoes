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

  // Incremento atômico — não bloqueia o redirect
  admin.rpc('incrementar_cliques_campanha', { campanha_id: campanha.id })
    .catch(err => console.error('[/r] erro ao incrementar cliques:', err))

  const base = campanha.url_destino?.startsWith('http')
    ? campanha.url_destino
    : APP_URL
  const destino = new URL(base)
  destino.searchParams.set('ref', codigo)

  return NextResponse.redirect(destino)
}
