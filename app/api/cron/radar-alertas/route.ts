/**
 * Cron: Radar de Inteligência — roda toda segunda-feira às 8h.
 * Envia digest de contratos vencendo nos próximos 90 dias
 * para usuários dos planos Pro e Empresarial.
 * Canais: e-mail (todos), Telegram e WhatsApp (se configurados).
 */

import { NextResponse }           from 'next/server'
import { Resend }                 from 'resend'
import { createServiceClient }   from '@/lib/supabase/server'
import { verificarCronAuth }     from '@/lib/cron-auth'
import { registrarCronLog }      from '@/lib/cron-log'
import { enviarTextoTelegram }   from '@/lib/alerts/telegram'
import { temRadar }              from '@/lib/planos'
import type { ContratoVencendo } from '@/lib/radar/contratos-vencendo'

export const maxDuration = 300

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }
const FROM = process.env.RESEND_FROM ?? 'Monitor de Licitações <alertas@monitordelicitacoes.com.br>'

function fmtMoeda(v: number | null): string {
  if (!v) return ''
  return ` · R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function filtrarPorTermos(lista: ContratoVencendo[], termos: string[]): ContratoVencendo[] {
  if (termos.length === 0) return lista.slice(0, 20)
  return lista.filter(c => {
    const h = (c.objeto + ' ' + c.orgao).toLowerCase()
    return termos.some(t => h.includes(t))
  }).slice(0, 20)
}

function gerarHtml(params: {
  nome:    string
  em30:    ContratoVencendo[]
  em60:    ContratoVencendo[]
  em90:    ContratoVencendo[]
  em180:   ContratoVencendo[]
  appUrl:  string
}): string {
  const { nome, em30, em60, em90, em180, appUrl } = params
  const total = em30.length + em60.length + em90.length + em180.length

  function secao(titulo: string, cor: string, lista: ContratoVencendo[]): string {
    if (!lista.length) return ''
    const linhas = lista.map(c =>
      `<tr style="border-bottom:1px solid #f0ede8">
        <td style="padding:10px 12px">
          <div style="font-size:12px;font-weight:700;color:#1A1A1C">${c.orgao}</div>
          <div style="font-size:12px;color:#6B7280;margin-top:2px">${c.objeto.substring(0, 180)}${c.objeto.length > 180 ? '…' : ''}</div>
        </td>
        <td style="padding:10px 12px;text-align:right;white-space:nowrap;vertical-align:top">
          <span style="font-size:11px;font-weight:700;color:${cor}">${c.diasRestantes}d</span><br>
          <span style="font-size:10px;color:#9AA0A6">${new Date(c.dataVigenciaFim + 'T00:00:00').toLocaleDateString('pt-BR')}${fmtMoeda(c.valor)}</span>
        </td>
      </tr>`
    ).join('')

    return `
      <tr><td style="padding:20px 32px 8px">
        <h3 style="margin:0;font-size:13px;font-weight:800;color:${cor};text-transform:uppercase;letter-spacing:0.05em">
          ${titulo} (${lista.length})
        </h3>
      </td></tr>
      <tr><td style="padding:0 32px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f0;border-radius:10px;overflow:hidden">
          ${linhas}
        </table>
      </td></tr>`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E0D5">

  <tr><td style="background:#1A1A1C;padding:28px 32px">
    <span style="font-size:20px;font-weight:700;color:#C9A65A">🎯 Radar de Inteligência</span>
    <div style="margin-top:4px;font-size:13px;color:rgba(255,255,255,0.5)">Monitor de Licitações</div>
  </td></tr>

  <tr><td style="padding:28px 32px 0">
    <h2 style="margin:0 0 8px;font-size:19px;color:#1A1A1C">Olá${nome ? ', ' + nome : ''}!</h2>
    <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6">
      Encontramos <strong>${total} contrato${total !== 1 ? 's' : ''}</strong> relevante${total !== 1 ? 's' : ''} vencendo
      nos próximos 180 dias que podem representar oportunidades de renovação ou adesão.
    </p>
  </td></tr>

  ${secao('⚠️ Vencendo em até 30 dias',  '#ef4444', em30)}
  ${secao('📅 Vencendo em 31–60 dias',   '#f59e0b', em60)}
  ${secao('📆 Vencendo em 61–90 dias',   '#10b981', em90)}
  ${secao('📋 Vencendo em 91–180 dias',  '#6366f1', em180)}

  <tr><td style="padding:24px 32px;text-align:center">
    <a href="${appUrl}/radar" style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px">
      Ver todos no painel →
    </a>
  </td></tr>

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

function gerarTelegram(em30: ContratoVencendo[], em60: ContratoVencendo[], em90: ContratoVencendo[], em180: ContratoVencendo[], appUrl: string): string {
  const total = em30.length + em60.length + em90.length + em180.length
  const linhas30 = em30.slice(0, 3).map(c => `• ${c.orgao.substring(0, 50)} — ${c.diasRestantes}d`).join('\n')
  const linhas60 = em60.slice(0, 3).map(c => `• ${c.orgao.substring(0, 50)} — ${c.diasRestantes}d`).join('\n')

  return (
    `🎯 *Radar de Inteligência — Monitor de Licitações*\n\n` +
    `${total} contrato${total !== 1 ? 's' : ''} relevante${total !== 1 ? 's' : ''} vencendo nos próximos 180 dias.\n\n` +
    (em30.length ? `⚠️ *Até 30 dias (${em30.length}):*\n${linhas30}\n\n` : '') +
    (em60.length ? `📅 *31–60 dias (${em60.length}):*\n${linhas60}\n\n` : '') +
    (em180.length ? `📋 *91–180 dias (${em180.length}):*\n${em180.slice(0, 3).map(c => `• ${c.orgao.substring(0, 50)} — ${c.diasRestantes}d`).join('\n')}\n\n` : '') +
    `[Ver todos no painel](${appUrl}/radar)`
  )
}

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

  // Buscar usuários elegíveis (Pro e Empresarial ativos)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, plano, status, owner_id, telegram_chat_id, whatsapp')
    .in('status', ['active', 'trial'])
    .is('owner_id', null)

  const elegíveis = (profiles ?? []).filter(p => temRadar(p.plano ?? 'basic'))

  if (!elegíveis.length) {
    await registrarCronLog({ job: 'radar-alertas', status: 'ok', mensagem: 'Nenhum usuário elegível' })
    return NextResponse.json({ ok: true, usuarios: 0 })
  }

  // Ler contratos vencendo nos próximos 90 dias direto da tabela licitacoes
  // (pncp-contratos.ts já coleta e salva com data_abertura = dataVigenciaFim)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const em180 = new Date(hoje)
  em180.setDate(em180.getDate() + 180)

  const { data: rows } = await supabase
    .from('licitacoes')
    .select('orgao, objeto, valor_estimado, data_abertura, url, estado, municipio, fonte')
    .in('fonte', ['PNCP Contratos', 'PNCP Atas'])
    .gte('data_abertura', hoje.toISOString().substring(0, 10))
    .lte('data_abertura', em180.toISOString().substring(0, 10))
    .order('data_abertura', { ascending: true })
    .limit(2000)

  console.log(`[radar] licitacoes encontradas: ${rows?.length ?? 0} (contratos+atas vencendo em 180d)`)

  function diasAte(dataFim: string): number {
    const fim = new Date(dataFim + 'T00:00:00')
    return Math.round((fim.getTime() - hoje.getTime()) / 86400000)
  }

  const todos: ContratoVencendo[] = (rows ?? []).map(r => ({
    orgao:           r.orgao ?? '',
    objeto:          r.objeto ?? '',
    valor:           r.valor_estimado ?? null,
    dataVigenciaFim: r.data_abertura ?? '',
    diasRestantes:   diasAte(r.data_abertura ?? ''),
    url:             r.url ?? 'https://pncp.gov.br/app/contratos',
    estado:          r.estado ?? null,
    cidade:          r.municipio ?? null,
  }))

  const radar = {
    em30dias:  todos.filter(c => c.diasRestantes <= 30),
    em60dias:  todos.filter(c => c.diasRestantes >= 31 && c.diasRestantes <= 60),
    em90dias:  todos.filter(c => c.diasRestantes >= 61 && c.diasRestantes <= 90),
    em180dias: todos.filter(c => c.diasRestantes >= 91),
  }

  // ── Persistir no banco para o painel /radar ───────────────────────────────
  if (todos.length > 0) {
    await supabase.from('radar_contratos').delete().not('id', 'is', null)
    await supabase.from('radar_contratos').insert(
      todos.map(c => ({
        orgao:             c.orgao,
        objeto:            c.objeto,
        valor:             c.valor,
        data_vigencia_fim: c.dataVigenciaFim,
        url:               c.url,
        estado:            c.estado,
        cidade:            c.cidade,
      }))
    )
  }

  // Enviar e-mails apenas às segundas — coleta é diária
  const ehSegunda = new Date().getUTCDay() === 1
  if (!ehSegunda) {
    await registrarCronLog({ job: 'radar-alertas', status: 'ok', mensagem: `Cache atualizado (${todos.length} contratos) — sem e-mail (não é segunda)` })
    return NextResponse.json({ ok: true, cache: todos.length, emails: 0 })
  }

  // Buscar emails dos usuários via auth.admin
  const { data: authData } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map(u => [u.id, u.email!])
  )

  let enviados = 0
  const resultados: Record<string, unknown> = {}

  for (const p of elegíveis) {
    const email = emailMap[p.id]
    if (!email || !email.includes('@')) continue

    // Buscar keywords do usuário
    const { data: kws } = await supabase
      .from('keywords')
      .select('termo')
      .eq('user_id', p.id)
      .eq('ativo', true)
      .limit(100)

    const termos = (kws ?? []).map(k => k.termo.toLowerCase())

    const em30  = filtrarPorTermos(radar.em30dias,  termos)
    const em60  = filtrarPorTermos(radar.em60dias,  termos)
    const em90  = filtrarPorTermos(radar.em90dias,  termos)
    const em180 = filtrarPorTermos(radar.em180dias, termos)

    const total = em30.length + em60.length + em90.length + em180.length
    if (total === 0) continue

    const canais: string[] = []

    // E-mail
    try {
      await getResend().emails.send({
        from:    FROM,
        to:      email,
        subject: `🎯 Radar: ${total} contrato${total !== 1 ? 's' : ''} vencendo nos próximos 180 dias`,
        html:    gerarHtml({ nome: p.nome ?? '', em30, em60, em90, em180, appUrl }),
      })
      canais.push('email')
    } catch (e) {
      console.error('radar-alertas email erro:', email, e)
    }

    // Telegram
    if (p.telegram_chat_id) {
      try {
        const ok = await enviarTextoTelegram(p.telegram_chat_id, gerarTelegram(em30, em60, em90, em180, appUrl))
        if (ok) canais.push('telegram')
      } catch (e) {
        console.error('radar-alertas telegram erro:', p.id, e)
      }
    }

    // WhatsApp — sem dependência de Z-API aqui por ora (usa o mesmo canal do resumo semanal)

    enviados++
    resultados[email] = { total, canais }
  }

  await registrarCronLog({
    job:      'radar-alertas',
    status:   'ok',
    mensagem: `Radar enviado para ${enviados} usuário(s)`,
    detalhes: resultados,
  })

  return NextResponse.json({ ok: true, usuarios: enviados, detalhes: resultados })
}
