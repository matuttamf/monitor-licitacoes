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
  estado?: string
  cidade?: string
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

// ─── Montagem de mensagem individual ─────────────────────────────────────

function montarMensagemIndividual(l: LicitacaoAlerta, appUrl: string): string {
  const localidade = [l.cidade, l.estado].filter(Boolean).join(' — ')
  const objeto = l.objeto.length > 350 ? l.objeto.substring(0, 350) + '…' : l.objeto

  return (
    `🚨 *OPORTUNIDADE!*\n\n` +
    `🔹 *${l.keyword.toUpperCase()}*${l.reenvio ? ' _(lembrete)_' : ''}\n` +
    `📋 ${l.orgao}\n` +
    (localidade ? `📍 ${localidade}\n` : '') +
    `📝 ${objeto}\n` +
    formatarValor(l.valor_estimado) +
    formatarData(l.data_abertura) +
    `🔗 ${l.url}\n\n` +
    `_Acompanhe todas as licitações no Painel: ${appUrl}/alertas_`
  )
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

/**
 * Envia uma mensagem individual por licitação, estilo sirene.
 * Intervalo de ~3s entre mensagens.
 */
export async function enviarAlertaWhatsApp(
  licitacoes: LicitacaoAlerta[],
  telefone: string,
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone || licitacoes.length === 0) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)

  let tudo_ok = true
  for (let i = 0; i < licitacoes.length; i++) {
    const ok = await enviarMensagemZApi(numero, montarMensagemIndividual(licitacoes[i], appUrl))
    if (!ok) tudo_ok = false
    if (i < licitacoes.length - 1) await new Promise(r => setTimeout(r, 3000))
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

/** Mensagem de segunda-feira com contagem nacional */
export async function enviarSegundaWhatsApp(
  telefone: string,
  totalNacional: number,
  termos: string[],
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)
  const termosStr = termos.slice(0, 3).join(', ') + (termos.length > 3 ? '...' : '')

  const texto =
    `📅 *Bom começo de semana!*\n\n` +
    `🔍 Esta semana há *${totalNacional.toLocaleString('pt-BR')} licitaç${totalNacional !== 1 ? 'ões' : 'ão'}* abertas` +
    (termosStr ? ` para "${termosStr}"` : '') +
    ` em todo o Brasil.\n\n` +
    `_Acompanhe no painel: ${appUrl}/alertas_`

  return enviarMensagemZApi(numero, texto)
}

/** Notifica o admin sobre novo cadastro */
export async function notificarAdminNovoCadastro(
  emailUsuario: string,
  nomeUsuario?: string,
): Promise<void> {
  const adminPhone = process.env.ADMIN_WHATSAPP
  if (!process.env.ZAPI_INSTANCE_ID || !adminPhone) return

  const nome = nomeUsuario ? `*${nomeUsuario}*` : 'um usuário'
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  const texto =
    `🆕 *Novo cadastro — Monitor de Licitações*\n\n` +
    `👤 ${nome}\n` +
    `📧 ${emailUsuario}\n` +
    `🕐 ${agora}`

  await enviarMensagemZApi(formatarNumero(adminPhone), texto).catch(() => {})
}
