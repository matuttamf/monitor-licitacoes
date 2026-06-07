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
  const destino = req.nextUrl.searchParams.get('url') ?? 'https://monitordelicitacoes.com.br'

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
