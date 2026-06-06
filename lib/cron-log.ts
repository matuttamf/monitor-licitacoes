import { createServiceClient } from '@/lib/supabase/server'

export type CronJob = 'coletar' | 'matching' | 'alertar' | 'alertar-urgente' | 'emails-trial' | 'expirar-trials' | 'resumo-semanal'
export type CronStatus = 'ok' | 'erro' | 'ignorado'

export interface CronLogEntry {
  job:      CronJob
  status:   CronStatus
  mensagem: string
  detalhes?: Record<string, unknown>
}

export async function registrarCronLog(entry: CronLogEntry): Promise<void> {
  try {
    const supabase = await createServiceClient()
    await supabase.from('cron_logs').insert({
      job:      entry.job,
      status:   entry.status,
      mensagem: entry.mensagem,
      detalhes: entry.detalhes ?? null,
    })
  } catch (err) {
    // Nunca deixar o log travar o cron principal
    console.error('[cron-log] Falha ao registrar log:', err)
  }
}
