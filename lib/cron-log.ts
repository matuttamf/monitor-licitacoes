/**
 * Utilitários de log para cron jobs.
 *
 * - `registrarCronLog`: insere linha na tabela `cron_logs` (histórico)
 * - `salvarResultadoCron`: upsert na tabela `configuracoes` (última execução,
 *   lida pelo painel admin)
 */

import { createServiceClient } from '@/lib/supabase/server'

const ADMIN = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

async function notificarErro(job: string, mensagem: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
        to: ADMIN,
        subject: `❌ [Cron] ${job} — Falha detectada`,
        html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px">
          <h2 style="color:#dc2626">❌ Falha no cron: ${job}</h2>
          <p><strong>Horário:</strong> ${agora}</p>
          <p><strong>Erro:</strong> ${mensagem}</p>
          <hr><p style="color:#64748b;font-size:12px">Monitor de Licitações · monitordelicitacoes.com.br</p>
        </body></html>`,
      }),
    })
  } catch { /* não bloqueia */ }
}

export async function registrarCronLog({
  job,
  status,
  mensagem,
  detalhes,
}: {
  job: string
  status: 'ok' | 'erro' | 'aviso' | 'ignorado'
  mensagem?: string
  detalhes?: Record<string, unknown>
}) {
  try {
    const supabase = await createServiceClient()
    await supabase.from('cron_logs').insert({ job, status, mensagem, detalhes })
  } catch { /* não deixa falha de log derrubar o cron */ }

  if (status === 'erro' || status === 'aviso') {
    await notificarErro(job, mensagem ?? 'Erro sem detalhes')
  }
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
