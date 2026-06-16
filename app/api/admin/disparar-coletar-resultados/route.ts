/**
 * Disparo manual do coletar-resultados — apenas admin
 * POST /api/admin/disparar-coletar-resultados
 * Body: { dataInicio?: string, dataFim?: string }  (sobrescreve ponteiro se informado)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))

  // Se passou datas customizadas, sobrescreve o ponteiro de backfill
  if (body.dataInicio) {
    await supabase
      .from('configuracoes')
      .upsert({ chave: 'resultados_backfill_data', valor: body.dataInicio })
  }

  // Dispara o cron internamente
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const res = await fetch(`${baseUrl}/api/cron/coletar-resultados`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json({ ok: true, cron: data })
}
