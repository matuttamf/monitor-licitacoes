/**
 * Cron: Resumo Semanal — executa toda sexta-feira
 *
 * Envia para cada usuário ativo um digest dos alertas recebidos na semana:
 * - Total de licitações encontradas
 * - Volume financeiro estimado
 * - Top 5 palavras-chave com mais matches
 * - Canais: e-mail (todos), Telegram (se configurado), WhatsApp (Profissional+)
 */

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { registrarCronLog } from '@/lib/cron-log'
import { enviarTextoTelegram } from '@/lib/alerts/telegram'
import { enviarResumoSemanalWhatsApp } from '@/lib/alerts/whatsapp'
import { temWhatsApp } from '@/lib/planos'

export const maxDuration = 300

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }
const FROM_EMAIL = process.env.RESEND_FROM ?? 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'

function inicioSemana(): string {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toISOString().substring(0, 10)
}

function formatarMoeda(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function gerarHtmlResumo(params: {
  nomeUsuario: string
  total: number
  volumeTotal: number
  topKeywords: { termo: string; count: number }[]
  inicio: string
  fim: string
  appUrl: string
}): string {
  const { nomeUsuario, total, volumeTotal, topKeywords, inicio, fim, appUrl } = params

  const volume = volumeTotal > 0
    ? `<div style="margin-top:6px;font-size:14px;color:#6B0F1A;font-weight:600">${formatarMoeda(volumeTotal)} em volume estimado</div>`
    : ''

  const topList = topKeywords.slice(0, 5).map((k, i) =>
    `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#4a4a4d">${i + 1}. ${k.termo}</td>
      <td style="padding:8px 12px;font-size:13px;color:#6B0F1A;font-weight:700;text-align:right">${k.count} match${k.count !== 1 ? 'es' : ''}</td>
    </tr>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E0D5">

  <!-- Header -->
  <tr><td style="background:#1A1A1C;padding:28px 32px">
    <div style="display:flex;align-items:center;gap:12px">
      <span style="font-size:22px;font-weight:700;color:#C9A65A">Monitor de Licitações</span>
    </div>
    <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.5)">Resumo semanal — ${inicio} a ${fim}</div>
  </td></tr>

  <!-- Saudação -->
  <tr><td style="padding:28px 32px 0">
    <h2 style="margin:0 0 8px;font-size:20px;color:#1A1A1C">
      Olá${nomeUsuario ? ', ' + nomeUsuario : ''}! 👋
    </h2>
    <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6">
      Aqui está o resumo das licitações que encontramos para você nesta semana.
    </p>
  </td></tr>

  <!-- Destaque principal -->
  <tr><td style="padding:24px 32px">
    <div style="background:#FFF7ED;border:1px solid #FDDCAA;border-radius:12px;padding:24px;text-align:center">
      <div style="font-size:48px;font-weight:800;color:#6B0F1A;line-height:1">${total}</div>
      <div style="font-size:15px;color:#92400E;font-weight:600;margin-top:4px">licitaç${total !== 1 ? 'ões encontradas' : 'ão encontrada'} na semana</div>
      ${volume}
    </div>
  </td></tr>

  ${topKeywords.length > 0 ? `
  <!-- Top palavras-chave -->
  <tr><td style="padding:0 32px 24px">
    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1A1A1C;text-transform:uppercase;letter-spacing:0.05em">Top Palavras-chave</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:10px;overflow:hidden">
      ${topList}
    </table>
  </td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="padding:0 32px 32px;text-align:center">
    <a href="${appUrl}/alertas"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px">
      Ver todos os alertas →
    </a>
    <p style="margin-top:16px;font-size:12px;color:#9AA0A6">
      Você recebe este resumo toda sexta-feira.<br>
      Para ajustar suas palavras-chave, <a href="${appUrl}/palavras-chave" style="color:#6B0F1A">clique aqui</a>.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1A1A1C;padding:20px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35)">
      © ${new Date().getFullYear()} Monitor de Licitações ·
      <a href="${appUrl}/perfil" style="color:rgba(255,255,255,0.35)">Gerenciar alertas</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function gerarTextoTelegramResumo(params: {
  total: number
  volumeTotal: number
  topKeywords: { termo: string; count: number }[]
  inicio: string
  fim: string
  appUrl: string
}): string {
  const { total, volumeTotal, topKeywords, inicio, fim, appUrl } = params
  const volume = volumeTotal > 0 ? `\n💰 *Volume estimado:* ${formatarMoeda(volumeTotal)}` : ''
  const topList = topKeywords.slice(0, 5)
    .map((k, i) => `${i + 1}. ${k.termo} — ${k.count} match${k.count !== 1 ? 'es' : ''}`)
    .join('\n')

  return (
    `📊 *Resumo Semanal — Monitor de Licitações*\n` +
    `Período: ${inicio} a ${fim}\n\n` +
    `🔔 *${total} licitaç${total !== 1 ? 'ões' : 'ão'}* encontrada${total !== 1 ? 's' : ''} para você.` +
    volume +
    (topList ? `\n\n🏆 *Top palavras-chave:*\n${topList}` : '') +
    `\n\n[Ver todos os alertas](${appUrl}/alertas)`
  )
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

  const inicio = inicioSemana()
  const fim    = new Date().toISOString().substring(0, 10)

  // Buscar todos os alertas da semana com licitação + keyword
  const { data: alertasSemana, error } = await supabase
    .from('alertas')
    .select(`
      id,
      keyword_id,
      licitacoes (id, valor_estimado, estado),
      keywords (id, termo, user_id)
    `)
    .gte('criado_em', inicio + 'T00:00:00.000Z')
    .lte('criado_em', fim    + 'T23:59:59.999Z')

  if (error) {
    console.error('Resumo semanal — erro ao buscar alertas:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!alertasSemana?.length) {
    await registrarCronLog({ job: 'resumo-semanal', status: 'ok', mensagem: 'Sem alertas na semana' })
    return NextResponse.json({ ok: true, usuarios: 0, motivo: 'sem alertas na semana' })
  }

  // Agrupar por usuário
  const dadosPorUsuario = new Map<string, {
    totalAlertas: number
    volumeTotal: number
    keywordCount: Map<string, number>
  }>()

  for (const a of alertasSemana) {
    const userId = (a.keywords as any)?.user_id
    if (!userId) continue
    if (!dadosPorUsuario.has(userId)) {
      dadosPorUsuario.set(userId, { totalAlertas: 0, volumeTotal: 0, keywordCount: new Map() })
    }
    const u = dadosPorUsuario.get(userId)!
    u.totalAlertas++
    const valor = (a.licitacoes as any)?.valor_estimado
    if (valor && valor > 0) u.volumeTotal += valor
    const termo = (a.keywords as any)?.termo ?? ''
    u.keywordCount.set(termo, (u.keywordCount.get(termo) ?? 0) + 1)
  }

  const userIds = [...dadosPorUsuario.keys()]

  // Buscar e-mails
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? [])
      .filter(u => userIds.includes(u.id))
      .map(u => [u.id, u.email!])
  )

  // Buscar perfis
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, status, plano, telegram_chat_id, whatsapp')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let totalUsuarios = 0
  const resultados: Record<string, { ok: boolean; canais: string[] }> = {}

  for (const [userId, dados] of dadosPorUsuario.entries()) {
    const email   = emailMap[userId]
    const perfil  = profileMap[userId]
    if (!email || perfil?.status === 'expired') continue

    const topKeywords = [...dados.keywordCount.entries()]
      .map(([termo, count]) => ({ termo, count }))
      .sort((a, b) => b.count - a.count)

    const canaisEnviados: string[] = []
    const nomeUsuario = perfil?.nome ?? ''

    // E-mail — todos os planos
    try {
      await getResend().emails.send({
        from:    FROM_EMAIL,
        to:      email,
        subject: `📊 Seu resumo semanal — ${dados.totalAlertas} licitaç${dados.totalAlertas !== 1 ? 'ões' : 'ão'} encontrada${dados.totalAlertas !== 1 ? 's' : ''}`,
        html:    gerarHtmlResumo({ nomeUsuario, total: dados.totalAlertas, volumeTotal: dados.volumeTotal, topKeywords, inicio, fim, appUrl }),
      })
      canaisEnviados.push('email')
    } catch (e) {
      console.error('Resumo semanal — erro email:', email, e)
    }

    // Telegram — todos os planos (se configurado)
    if (perfil?.telegram_chat_id) {
      try {
        const texto = gerarTextoTelegramResumo({ total: dados.totalAlertas, volumeTotal: dados.volumeTotal, topKeywords, inicio, fim, appUrl })
        const ok = await enviarTextoTelegram(perfil.telegram_chat_id, texto)
        if (ok) canaisEnviados.push('telegram')
      } catch (e) {
        console.error('Resumo semanal — erro telegram:', userId, e)
      }
    }

    // WhatsApp — Profissional+
    const plano = perfil?.plano ?? 'basic'
    if (temWhatsApp(plano) && perfil?.whatsapp) {
      const ok = await enviarResumoSemanalWhatsApp(
        perfil.whatsapp,
        dados.totalAlertas,
        dados.volumeTotal,
        topKeywords,
      )
      if (ok) canaisEnviados.push('whatsapp')
    }

    totalUsuarios++
    resultados[email] = { ok: canaisEnviados.length > 0, canais: canaisEnviados }
  }

  await registrarCronLog({
    job:      'resumo-semanal',
    status:   'ok',
    mensagem: `Resumo semanal enviado para ${totalUsuarios} usuário(s)`,
    detalhes: resultados,
  })

  return NextResponse.json({ ok: true, usuarios: totalUsuarios, detalhes: resultados })
}
