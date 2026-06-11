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

  // Última execução de cada job — query individual para não perder jobs raros
  const jobs = ['coletar', 'matching', 'alertar', 'alertar-urgente', 'emails-trial', 'expirar-trials', 'resumo-semanal', 'radar-alertas']
  const resultados = await Promise.all(
    jobs.map(job =>
      service
        .from('cron_logs')
        .select('job, status, mensagem, criado_em')
        .eq('job', job)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
  )

  const ultimasPorJob: Record<string, { status: string; mensagem: string; criado_em: string } | null> = {}
  jobs.forEach((job, i) => {
    const row = resultados[i].data
    ultimasPorJob[job] = row ? { status: row.status, mensagem: row.mensagem, criado_em: row.criado_em } : null
  })

  return NextResponse.json({ logs: logs ?? [], ultimasPorJob })
}
