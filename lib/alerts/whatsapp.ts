/**
 * Envio de alertas via WhatsApp (Evolution API)
 *
 * Variáveis de ambiente necessárias:
 *   EVOLUTION_API_URL   — ex: https://evo.suainstancia.com.br
 *   EVOLUTION_API_KEY   — chave de acesso da instância
 *   EVOLUTION_INSTANCE  — nome da instância (padrão: "monitor")
 *
 * Se as variáveis não estiverem definidas, as funções retornam false silenciosamente.
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

function formatarNumero(telefone: string): string {
  // Remove tudo que não é dígito e garante prefixo 55 (Brasil)
  const digits = telefone.replace(/\D/g, '')
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

const LOTE_WPP = 5

function montarMensagem(licitacoes: LicitacaoAlerta[], parte: number, total: number): string {
  const header =
    `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*` +
    (total > 1 ? ` (${parte}/${total})` : '') +
    `\n\n`

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

  return header + linhas
}

async function enviarMensagemWpp(numero: string, texto: string): Promise<boolean> {
  const url  = process.env.EVOLUTION_API_URL
  const key  = process.env.EVOLUTION_API_KEY
  const inst = process.env.EVOLUTION_INSTANCE ?? 'monitor'

  if (!url || !key) return false

  try {
    const res = await fetch(`${url}/message/sendText/${inst}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
      },
      body: JSON.stringify({
        number: numero,
        text: texto,
        delay: 500,
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`WhatsApp erro ${res.status} para ${numero}:`, body)
      return false
    }
    return true
  } catch (err) {
    console.error('WhatsApp exceção:', err instanceof Error ? err.message : err)
    return false
  }
}

export async function enviarAlertaWhatsApp(
  licitacoes: LicitacaoAlerta[],
  telefone: string,
): Promise<boolean> {
  if (!process.env.EVOLUTION_API_URL || !telefone || licitacoes.length === 0) return false

  const numero = formatarNumero(telefone)
  const lotes: LicitacaoAlerta[][] = []
  for (let i = 0; i < licitacoes.length; i += LOTE_WPP) {
    lotes.push(licitacoes.slice(i, i + LOTE_WPP))
  }

  // Resumo inicial se mais de um lote
  if (lotes.length > 1) {
    const resumo =
      `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*\n\n` +
      `Encontrei *${licitacoes.length} licitações* para você.\n` +
      `Enviando em ${lotes.length} mensagens. ⬇️`
    await enviarMensagemWpp(numero, resumo)
    await new Promise(r => setTimeout(r, 400))
  }

  let tudo_ok = true
  for (let i = 0; i < lotes.length; i++) {
    const ok = await enviarMensagemWpp(numero, montarMensagem(lotes[i], i + 1, lotes.length))
    if (!ok) tudo_ok = false
    if (i < lotes.length - 1) await new Promise(r => setTimeout(r, 500))
  }
  return tudo_ok
}

/** Envia um resumo semanal via WhatsApp */
export async function enviarResumoSemanalWhatsApp(
  telefone: string,
  totalAlertas: number,
  volumeTotal: number,
  topKeywords: { termo: string; count: number }[],
): Promise<boolean> {
  if (!process.env.EVOLUTION_API_URL || !telefone) return false

  const numero = formatarNumero(telefone)
  const volume = volumeTotal > 0
    ? `\n💰 *Volume total:* R$ ${volumeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : ''

  const topList = topKeywords.slice(0, 5)
    .map((k, i) => `${i + 1}. ${k.termo} (${k.count})`)
    .join('\n')

  const texto =
    `📊 *Resumo Semanal — Monitor de Licitações*\n` +
    `Semana de ${getInicioSemana()} a ${new Date().toLocaleDateString('pt-BR')}\n\n` +
    `🔔 *${totalAlertas} licitações* encontradas para você esta semana.` +
    volume +
    (topList ? `\n\n🏆 *Top palavras-chave:*\n${topList}` : '') +
    `\n\n_Acesse o painel para ver todos os detalhes →_`

  return enviarMensagemWpp(numero, texto)
}

function getInicioSemana(): string {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toLocaleDateString('pt-BR')
}
