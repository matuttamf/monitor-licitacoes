/**
 * Notifica por e-mail (Resend) o resultado de um job do GitHub Actions.
 * Chamado pelo workflow ao final de cada execução.
 *
 * Uso:
 *   npx tsx scripts/notificar-cron.ts <job-name> <success|failure|cancelled>
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
config()

const job    = process.argv[2] ?? 'job-desconhecido'
const status = process.argv[3] ?? 'unknown'
const ADMIN  = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
// ADMIN_EMAIL no GitHub Secret deve ser matuttamaquinaseferramentas@gmail.com
// (mesmo destino dos alertas do sistema — recebe via ImprovMX → matutta)

const EMOJI: Record<string, string> = { success: '✅', failure: '❌', cancelled: '⚠️' }
const LABEL: Record<string, string> = { success: 'Concluído com sucesso', failure: 'Falhou', cancelled: 'Cancelado' }

async function main() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.log('RESEND_API_KEY não definido — notificação ignorada'); return }

  const emoji = EMOJI[status] ?? '❓'
  const label = LABEL[status] ?? status
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
  <tr><td style="background:${status === 'success' ? '#15803d' : status === 'failure' ? '#dc2626' : '#92400e'};border-radius:12px 12px 0 0;padding:24px 28px">
    <h1 style="margin:0;font-size:18px;font-weight:700;color:#fff">${emoji} GitHub Actions — ${label}</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.8)">Monitor de Licitações</p>
  </td></tr>
  <tr><td style="background:#fff;padding:24px 28px;border:1px solid #e2e8f0;border-top:none">
    <table width="100%" style="font-size:14px;border-collapse:collapse">
      <tr><td style="padding:8px 0;color:#64748b;width:100px">Job</td><td style="padding:8px 0;color:#0f172a;font-weight:600">${job}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Status</td><td style="padding:8px 0;color:#0f172a">${emoji} ${label}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Horário</td><td style="padding:8px 0;color:#0f172a">${agora}</td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:14px 28px;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">Monitor de Licitações · monitordelicitacoes.com.br</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to: ADMIN,
      subject: `${emoji} [GitHub Actions] ${job} — ${label}`,
      html,
    }),
  })

  if (res.ok) console.log(`Notificação enviada para ${ADMIN}`)
  else console.error(`Falha ao notificar: ${await res.text()}`)
}

main().catch(console.error)
