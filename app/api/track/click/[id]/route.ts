/**
 * Rastreamento de clique no CTA do e-mail
 * URL usada no e-mail: /api/track/click/{leadId}?url=https://...
 * Registra clicou_em e redireciona para a URL destino
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rawUrl  = req.nextUrl.searchParams.get('url') ?? ''
  const base    = 'https://monitordelicitacoes.com.br'
  let destino   = base
  try {
    const parsed = new URL(rawUrl)
    if (parsed.origin === base || parsed.origin === 'https://www.monitordelicitacoes.com.br') {
      destino = rawUrl
    }
  } catch { /* URL inválida — usa fallback */ }

  if (id) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase
        .from('leads')
        .update({ clicou_em: new Date().toISOString() })
        .eq('id', id)
        .is('clicou_em', null)
    } catch { /* silencioso */ }
  }

  return NextResponse.redirect(destino, { status: 302 })
}
