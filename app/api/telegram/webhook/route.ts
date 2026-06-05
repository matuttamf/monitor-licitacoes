import { NextResponse } from 'next/server'

// Endpoint recebe mensagens do Telegram e responde com o Chat ID
export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ ok: false }, { status: 500 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat?.id
  const texto = message.text?.trim() ?? ''

  if (!chatId) return NextResponse.json({ ok: true })

  // Responde apenas ao /start
  if (texto === '/start' || texto.startsWith('/start ')) {
    const resposta =
      `👋 Olá! Sou o bot do *Monitor de Licitações*.\n\n` +
      `Seu *Chat ID* é:\n\n` +
      `\`${chatId}\`\n\n` +
      `📋 *Como ativar os alertas:*\n` +
      `1. Copie o número acima\n` +
      `2. Acesse o painel do Monitor de Licitações\n` +
      `3. Vá em *Perfil → Alertas no Telegram*\n` +
      `4. Cole o número e salve\n\n` +
      `Pronto! Você passará a receber as licitações por aqui. ✅`

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: resposta,
        parse_mode: 'Markdown',
      }),
    })
  }

  return NextResponse.json({ ok: true })
}
