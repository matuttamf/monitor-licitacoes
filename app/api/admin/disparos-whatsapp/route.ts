import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

export const dynamic = 'force-dynamic'

/** Disparos de WhatsApp para auditoria no painel: contagem 24h + últimos envios. */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const service = createAdminClient()
  const h24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [{ data: recentes }, { count: ok24 }, { count: erro24 }] = await Promise.all([
    service.from('disparos_log')
      .select('destino, preview, status, erro, criado_em')
      .eq('canal', 'whatsapp')
      .order('criado_em', { ascending: false })
      .limit(40),
    service.from('disparos_log').select('*', { count: 'exact', head: true })
      .eq('canal', 'whatsapp').eq('status', 'ok').gte('criado_em', h24),
    service.from('disparos_log').select('*', { count: 'exact', head: true })
      .eq('canal', 'whatsapp').eq('status', 'erro').gte('criado_em', h24),
  ])

  return NextResponse.json({
    ok24:   ok24 ?? 0,
    erro24: erro24 ?? 0,
    recentes: recentes ?? [],
  })
}
