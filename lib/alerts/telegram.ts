interface LicitacaoAlerta {
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  keyword: string
}

const LOTE_TELEGRAM = 5  // máx por mensagem (Telegram: 4.096 chars)

function formatarLote(licitacoes: LicitacaoAlerta[], loteAtual: number, totalLotes: number): string {
  const header =
    `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*` +
    (totalLotes > 1 ? ` (${loteAtual}/${totalLotes})` : '') +
    `\n\n`

  const linhas = licitacoes.map(l =>
    `🔹 *${l.keyword.toUpperCase()}*\n` +
    `📋 ${l.orgao}\n` +
    `📝 ${l.objeto.substring(0, 100)}${l.objeto.length > 100 ? '...' : ''}\n` +
    `${l.valor_estimado ? `💰 R$ ${l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : ''}` +
    `${l.data_abertura ? `📅 Abertura: ${l.data_abertura}\n` : ''}` +
    `🔗 [Ver edital](${l.url})`
  ).join('\n\n---\n\n')

  return header + linhas
}

async function enviarMensagemTelegram(token: string, chatId: string, texto: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: texto,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    console.error(`Erro ao enviar Telegram para chat ${chatId}:`, await res.text())
    return false
  }

  return true
}

export async function enviarAlertaTelegram(
  licitacoes: LicitacaoAlerta[],
  chatId: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !chatId || licitacoes.length === 0) return false

  // Dividir em lotes para não ultrapassar o limite de 4.096 chars do Telegram
  const lotes: LicitacaoAlerta[][] = []
  for (let i = 0; i < licitacoes.length; i += LOTE_TELEGRAM) {
    lotes.push(licitacoes.slice(i, i + LOTE_TELEGRAM))
  }

  let tudo_ok = true

  // Enviar um resumo inicial se houver múltiplos lotes
  if (lotes.length > 1) {
    const resumo =
      `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*\n\n` +
      `Encontramos *${licitacoes.length} licitações* para você.\n` +
      `Enviando em ${lotes.length} mensagens para melhor leitura. ⬇️`

    await enviarMensagemTelegram(token, chatId, resumo)
    // Breve pausa para não ser bloqueado pelo Telegram (30 msg/s por bot)
    await new Promise(r => setTimeout(r, 300))
  }

  for (let i = 0; i < lotes.length; i++) {
    const texto = formatarLote(lotes[i], i + 1, lotes.length)
    const ok = await enviarMensagemTelegram(token, chatId, texto)
    if (!ok) tudo_ok = false

    // Pausa entre lotes para respeitar rate limit do Telegram
    if (i < lotes.length - 1) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return tudo_ok
}
