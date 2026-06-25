import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

export const dynamic = 'force-dynamic'

/** Fila de alertas por canal (e-mail/Telegram/WhatsApp) — para o card do admin. */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const service = createAdminClient()
  const { data, error } = await service.rpc('fila_alertas')
  if (error) {
    console.error('[admin/fila-alertas] erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // data = { email, telegram, whatsapp, total }
  return NextResponse.json(data ?? { email: 0, telegram: 0, whatsapp: 0, total: 0 })
}
