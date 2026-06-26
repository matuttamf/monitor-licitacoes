interface LicitacaoAlerta {
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  keyword: string
}

function formatarMensagemIndividual(l: LicitacaoAlerta, appUrl: string): string {
  const localidade = [l.cidade, l.estado].filter(Boolean).join(' — ')
  const objeto = escapeMd(l.objeto.substring(0, 350) + (l.objeto.length > 350 ? '...' : ''))

  return (
    `🚨 *OPORTUNIDADE!*\n\n` +
    `🔹 *${escapeMd(l.keyword.toUpperCase())}*\n` +
    `📋 ${escapeMd(l.orgao)}\n` +
    (localidade ? `📍 ${escapeMd(localidade)}\n` : '') +
    `📝 ${objeto}\n` +
    (l.valor_estimado ? `💰 R$ ${l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
    (l.data_abertura ? `📅 Abertura: ${l.data_abertura}\n` : '') +
    `🔗 [Ver edital](${l.url})\n\n` +
    `_Acompanhe todas as licitações no [Painel](${appUrl}/alertas)._`
  )
}

// Escapa caracteres especiais do modo Markdown legado do Telegram.
// Órgãos e objetos de licitação frequentemente contêm _ * [ que quebram o parse.
function escapeMd(s: string): string {
  return s.replace(/[_*`[\]]/g, '\\$&')
}

async function enviarMensagemTelegram(token: string, chatId: string, texto: string): Promise<boolean> {
  let res: Response
  try {
    res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:                  chatId,
        text:                     texto,
        parse_mode:               'Markdown',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    })
  } catch (err) {
    console.error(`Telegram timeout/erro de rede para chat ${chatId}:`, err instanceof Error ? err.message : err)
    return false
  }

  if (!res.ok) {
    console.error(`Erro ao enviar Telegram para chat ${chatId}:`, await res.text())
    return false
  }

  // Telegram retorna HTTP 200 mesmo em falhas lógicas — verificar campo "ok"
  const body = await res.json().catch(() => ({ ok: true }))
  if (!body.ok) {
    console.error(`Telegram recusou mensagem para chat ${chatId}:`, body.description ?? body)
    return false
  }

  return true
}

/** Envia um texto puro (já formatado em Markdown) para um chat */
export async function enviarTextoTelegram(chatId: string, texto: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !chatId) return false
  return enviarMensagemTelegram(token, chatId, texto)
}

/**
 * Envia uma mensagem individual por licitação, estilo sirene.
 * Intervalo de ~3s entre mensagens para respeitar rate limit do Telegram.
 */
export async function enviarAlertaTelegram(
  licitacoes: LicitacaoAlerta[],
  chatId: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !chatId || licitacoes.length === 0) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  let tudo_ok = true

  for (let i = 0; i < licitacoes.length; i++) {
    const texto = formatarMensagemIndividual(licitacoes[i], appUrl)
    const ok = await enviarMensagemTelegram(token, chatId, texto)
    if (!ok) tudo_ok = false

    // Pausa entre mensagens — respeita rate limit (30 msg/s por bot)
    if (i < licitacoes.length - 1) {
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  return tudo_ok
}
