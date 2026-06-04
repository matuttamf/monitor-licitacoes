interface LicitacaoAlerta {
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  keyword: string
}

export async function enviarAlertaTelegram(licitacoes: LicitacaoAlerta[]): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN!
  const chatId = process.env.TELEGRAM_CHAT_ID!

  const linhas = licitacoes.map(l =>
    `🔹 *${l.keyword.toUpperCase()}*\n` +
    `📋 ${l.orgao}\n` +
    `📝 ${l.objeto.substring(0, 100)}${l.objeto.length > 100 ? '...' : ''}\n` +
    `${l.valor_estimado ? `💰 R$ ${l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : ''}` +
    `${l.data_abertura ? `📅 Abertura: ${l.data_abertura}\n` : ''}` +
    `🔗 [Ver edital](${l.url})`
  ).join('\n\n---\n\n')

  const mensagem =
    `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*\n\n` +
    `Encontramos *${licitacoes.length}* nova(s) licitação(ões):\n\n` +
    linhas

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensagem,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    console.error('Erro ao enviar Telegram:', await res.text())
    return false
  }

  return true
}
