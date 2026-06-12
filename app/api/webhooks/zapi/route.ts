import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

// Respostas automáticas por palavra-chave
const RESPOSTAS: { regex: RegExp; resposta: string }[] = [
  {
    regex: /\b(painel|acesso|login|entrar|acessar)\b/i,
    resposta: `Acesse seu painel em: https://monitordelicitacoes.com.br/login 🔐`,
  },
  {
    regex: /\b(plano|assinar|assinatura|valor|preço|preco|contratar)\b/i,
    resposta: `Veja nossos planos em: https://monitordelicitacoes.com.br/assinar 📋`,
  },
  {
    regex: /\b(cancelar|cancelamento|encerrar)\b/i,
    resposta: `Para cancelar sua assinatura, acesse: https://monitordelicitacoes.com.br/perfil\nOu entre em contato pelo e-mail: ${ADMIN_EMAIL}`,
  },
  {
    regex: /\b(suporte|ajuda|help|problema|erro|dúvida|duvida)\b/i,
    resposta: `Olá! Para suporte, acesse nosso formulário: https://monitordelicitacoes.com.br/contato\nOu responda aqui com sua dúvida que entraremos em contato. 😊`,
  },
  {
    regex: /\b(obrigad[ao]|thanks|valeu|ótimo|otimo|perfeito)\b/i,
    resposta: `Fico feliz em ajudar! Qualquer dúvida estamos à disposição. 🙌`,
  },
]

const RESPOSTA_PADRAO = `Olá! Recebi sua mensagem e em breve entraremos em contato.\n\nEnquanto isso, você pode acessar:\n• Painel: https://monitordelicitacoes.com.br/dashboard\n• Suporte: https://monitordelicitacoes.com.br/contato`

async function enviarZApi(numero: string, mensagem: string) {
  const instanceId    = process.env.ZAPI_INSTANCE_ID
  const instanceToken = process.env.ZAPI_INSTANCE_TOKEN
  const clientToken   = process.env.ZAPI_CLIENT_TOKEN
  if (!instanceId || !instanceToken) return

  await fetch(`https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(clientToken ? { 'Client-Token': clientToken } : {}),
    },
    body: JSON.stringify({ phone: numero, message: mensagem }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => {})
}

async function notificarAdmin(assunto: string, corpo: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:   ADMIN_EMAIL,
      subject: assunto,
      text: corpo,
    })
  } catch {}
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const supabase = createAdminClient()
  const tipo = (body.type as string) ?? ''

  // ── 1. WhatsApp desconectado ──────────────────────────────────────────────
  if (tipo === 'DisconnectedCallback') {
    console.warn('[zapi/webhook] WhatsApp DESCONECTADO')
    await supabase.from('configuracoes').upsert({
      chave: 'zapi_status', valor: 'desconectado', atualizado_em: new Date().toISOString(),
    }, { onConflict: 'chave' })
    await notificarAdmin(
      '⚠️ WhatsApp desconectado — Monitor de Licitações',
      'O WhatsApp do sistema se desconectou da Z-API.\n\nAcesse https://app.z-api.io e reconecte escaneando o QR Code.\n\nAté a reconexão os alertas via WhatsApp estão pausados.',
    )
    return NextResponse.json({ ok: true })
  }

  // ── WhatsApp conectado ────────────────────────────────────────────────────
  if (tipo === 'ConnectedCallback') {
    await supabase.from('configuracoes').upsert({
      chave: 'zapi_status', valor: 'conectado', atualizado_em: new Date().toISOString(),
    }, { onConflict: 'chave' })
    console.log('[zapi/webhook] WhatsApp reconectado')
    return NextResponse.json({ ok: true })
  }

  // ── 3. Status de entrega (ReceivedCallback de status) ────────────────────
  if (tipo === 'MessageStatusCallback') {
    const msgId  = body.messageId as string
    const status = body.status as string  // SENT, RECEIVED, READ, ERROR
    if (msgId && status) {
      console.log(`[zapi/webhook] Status mensagem ${msgId}: ${status}`)
      if (status === 'ERROR') {
        await notificarAdmin(
          '⚠️ Falha no envio de WhatsApp',
          `Mensagem ${msgId} falhou ao ser entregue.\n\nDetalhes: ${JSON.stringify(body, null, 2)}`,
        )
      }
    }
    return NextResponse.json({ ok: true })
  }

  // ── 2. Mensagem recebida — resposta automática ────────────────────────────
  if (tipo === 'ReceivedCallback') {
    const fromMe = body.fromMe as boolean
    if (fromMe) return NextResponse.json({ ok: true }) // ignora mensagens enviadas por nós

    const telefone = body.phone as string
    const texto    = (body.text?.message ?? body.caption ?? '') as string

    if (!telefone || !texto) return NextResponse.json({ ok: true })

    console.log(`[zapi/webhook] Mensagem recebida de ${telefone}: ${texto.slice(0, 100)}`)

    // Notifica admin por e-mail
    await notificarAdmin(
      `💬 WhatsApp recebido de ${telefone}`,
      `Número: ${telefone}\nMensagem: ${texto}\n\nResponda diretamente pelo WhatsApp Business.`,
    )

    // Resposta automática por palavra-chave
    const match = RESPOSTAS.find(r => r.regex.test(texto))
    const resposta = match ? match.resposta : RESPOSTA_PADRAO

    await enviarZApi(telefone, resposta)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
