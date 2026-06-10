/**
 * Utilitários de log para cron jobs.
 *
 * - `registrarCronLog`: insere linha na tabela `cron_logs` (histórico)
 * - `salvarResultadoCron`: upsert na tabela `configuracoes` (última execução,
 *   lida pelo painel admin)
 */

import { createServiceClient } from '@/lib/supabase/server'

export async function registrarCronLog({
  job,
  status,
  mensagem,
  detalhes,
}: {
  job: string
  status: 'ok' | 'erro' | 'ignorado'
  mensagem?: string
  detalhes?: Record<string, unknown>
}) {
  try {
    const supabase = await createServiceClient()
    await supabase.from('cron_logs').insert({ job, status, mensagem, detalhes })
  } catch { /* não deixa falha de log derrubar o cron */ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function salvarResultadoCron(supabase: any, cronId: string, resultado: Record<string, unknown>) {
  try {
    await supabase.from('configuracoes').upsert(
      { chave: `ultimo_resultado_${cronId}`, valor: JSON.stringify({ ...resultado, ts: new Date().toISOString() }) },
      { onConflict: 'chave' }
    )
  } catch { /* não deixa falha de log derrubar o cron */ }
}
