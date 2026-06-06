/**
 * Envio de alertas via WhatsApp — Z-API
 *
 * Variáveis de ambiente necessárias:
 *   ZAPI_INSTANCE_ID    — ID da instância (ex: "3DF1234...")
 *   ZAPI_INSTANCE_TOKEN — Token da instância
 *   ZAPI_CLIENT_TOKEN   — Client-Token (header obrigatório na Z-API v2)
 *
 * Endpoint base: https://api.z-api.io/instances/{instanceId}/token/{instanceToken}/send-text
 *
 * Documentação: https://developer.z-api.io/
 */

interface LicitacaoAlerta {
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  keyword: string
  reenvio?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatarNumero(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  // Z-API aceita formato com país: 5531999999999
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

function formatarValor(v?: number): string {
  if (!v || v === 0) return ''
  return `💰 R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
}

function formatarData(d?: string): string {
  if (!d) return ''
  const dt = new Date(d.includes('T') ? d : d + 'T12:00:00')
  if (isNaN(dt.getTime())) return ''
  return `📅 Abertura: ${dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}\n`
}

// ─── Montagem de mensagem ─────────────────────────────────────────────────

const LOTE_WPP = 5

function montarMensagem(
  licitacoes: LicitacaoAlerta[],
  parte: number,
  total: number,
  appUrl: string,
): string {
  const header =
    `🔔 *Alerta Monitor de Licitações*` +
    (total > 1 ? ` (${parte}/${total})` : '') +
    ` — ${new Date().toLocaleDateString('pt-BR')}\n\n`

  const linhas = licitacoes.map(l => {
    const objeto = l.objeto.length > 120 ? l.objeto.substring(0, 120) + '…' : l.objeto
    return (
      `🔹 *${l.keyword.toUpperCase()}*${l.reenvio ? ' _(lembrete)_' : ''}\n` +
      `📋 ${l.orgao}\n` +
      `📝 ${objeto}\n` +
      formatarValor(l.valor_estimado) +
      formatarData(l.data_abertura) +
      `🔗 ${l.url}`
    )
  }).join('\n\n---\n\n')

  const rodape = `\n\n_Ver todas as oportunidades no painel: ${appUrl}/alertas_`

  return header + linhas + rodape
}

// ─── Envio via Z-API ──────────────────────────────────────────────────────

async function enviarMensagemZApi(numero: string, texto: string): Promise<boolean> {
  const instanceId    = process.env.ZAPI_INSTANCE_ID
  const instanceToken = process.env.ZAPI_INSTANCE_TOKEN
  const clientToken   = process.env.ZAPI_CLIENT_TOKEN

  if (!instanceId || !instanceToken) return false

  const url = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientToken ? { 'Client-Token': clientToken } : {}),
      },
      body: JSON.stringify({ phone: numero, message: texto }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`Z-API erro ${res.status} para ${numero}:`, body)
      return false
    }
    return true
  } catch (err) {
    console.error('Z-API exceção:', err instanceof Error ? err.message : err)
    return false
  }
}

// ─── Funções exportadas ───────────────────────────────────────────────────

export async function enviarAlertaWhatsApp(
  licitacoes: LicitacaoAlerta[],
  telefone: string,
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone || licitacoes.length === 0) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)

  const lotes: LicitacaoAlerta[][] = []
  for (let i = 0; i < licitacoes.length; i += LOTE_WPP) {
    lotes.push(licitacoes.slice(i, i + LOTE_WPP))
  }

  // Resumo inicial quando há múltiplos lotes
  if (lotes.length > 1) {
    const resumo =
      `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*\n\n` +
      `Encontrei *${licitacoes.length} oportunidades* para você.\n` +
      `Enviando em ${lotes.length} mensagens. ⬇️\n\n` +
      `_Todas as oportunidades estão no painel: ${appUrl}/alertas_`
    await enviarMensagemZApi(numero, resumo)
    await new Promise(r => setTimeout(r, 500))
  }

  let tudo_ok = true
  for (let i = 0; i < lotes.length; i++) {
    const ok = await enviarMensagemZApi(numero, montarMensagem(lotes[i], i + 1, lotes.length, appUrl))
    if (!ok) tudo_ok = false
    if (i < lotes.length - 1) await new Promise(r => setTimeout(r, 600))
  }
  return tudo_ok
}

/** Resumo semanal via WhatsApp */
export async function enviarResumoSemanalWhatsApp(
  telefone: string,
  totalAlertas: number,
  volumeTotal: number,
  topKeywords: { termo: string; count: number }[],
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)

  const volume = volumeTotal > 0
    ? `\n💰 *Volume total estimado:* R$ ${volumeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : ''

  const topList = topKeywords.slice(0, 5)
    .map((k, i) => `${i + 1}. ${k.termo} (${k.count})`)
    .join('\n')

  const inicio = (() => {
    const d = new Date(); d.setDate(d.getDate() - 6)
    return d.toLocaleDateString('pt-BR')
  })()

  const texto =
    `📊 *Resumo Semanal — Monitor de Licitações*\n` +
    `Semana: ${inicio} a ${new Date().toLocaleDateString('pt-BR')}\n\n` +
    `🔔 *${totalAlertas} licitaç${totalAlertas !== 1 ? 'ões' : 'ão'}* encontrada${totalAlertas !== 1 ? 's' : ''} para você.` +
    volume +
    (topList ? `\n\n🏆 *Top palavras-chave:*\n${topList}` : '') +
    `\n\n_Ver todas no painel: ${appUrl}/alertas_`

  return enviarMensagemZApi(numero, texto)
}
