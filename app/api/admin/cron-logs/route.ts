import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const service = createAdminClient()

  // Últimas 50 execuções (todos os jobs)
  const { data: logs } = await service
    .from('cron_logs')
    .select('id, job, status, mensagem, detalhes, criado_em')
    .order('criado_em', { ascending: false })
    .limit(50)

  // Última execução de cada job
  const jobs = ['coletar', 'matching', 'alertar', 'emails-trial', 'expirar-trials']
  const ultimasPorJob: Record<string, { status: string; mensagem: string; criado_em: string } | null> = {}

  for (const job of jobs) {
    const ultima = (logs ?? []).find(l => l.job === job)
    ultimasPorJob[job] = ultima
      ? { status: ultima.status, mensagem: ultima.mensagem, criado_em: ultima.criado_em }
      : null
  }

  return NextResponse.json({ logs: logs ?? [], ultimasPorJob })
}
