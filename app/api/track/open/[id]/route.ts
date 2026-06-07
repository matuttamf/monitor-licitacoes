/**
 * Pixel de rastreamento de abertura de e-mail
 * Cada e-mail de captação inclui: <img src="/api/track/open/{leadId}" width="1" height="1">
 * Ao abrir o e-mail, o cliente de e-mail carrega a imagem → registramos o horário
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GIF transparente 1x1
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Atualizar abriu_em apenas na primeira abertura
  if (id) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase
        .from('leads')
        .update({ abriu_em: new Date().toISOString() })
        .eq('id', id)
        .is('abriu_em', null) // só na primeira abertura
    } catch { /* silencioso — não pode afetar entrega do pixel */ }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type':  'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma':        'no-cache',
    },
  })
}
