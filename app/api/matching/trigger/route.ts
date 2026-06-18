import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })

  // Dispara matching apenas para o usuário autenticado, de forma não-bloqueante
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  fetch(`${baseUrl}/api/cron/matching?user_id=${user.id}`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ''}` },
  }).catch(() => null)

  return NextResponse.json({ ok: true })
}
