import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN  = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

export async function POST(req: NextRequest) {
  const { nome, email, assunto, mensagem } = await req.json()

  if (!nome || !email || !assunto || !mensagem) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  try {
    const htmlAdmin = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px">

  <!-- Header -->
  <tr><td style="background:#1A1A1C;border-radius:12px 12px 0 0;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#C9A65A;text-transform:uppercase">Monitor de Licitações</p>
        <h1 style="margin:4px 0 0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.3">📬 Nova mensagem — Fale Conosco</h1>
      </td>
      <td align="right" style="vertical-align:middle">
        <span style="background:#6B0F1A;color:#C9A65A;font-size:11px;font-weight:700;padding:5px 14px;border-radius:99px;white-space:nowrap;border:1px solid rgba(201,166,90,0.3)">${assunto}</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Card dados -->
  <tr><td style="background:#ffffff;padding:28px 32px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E4DC;border-radius:10px;overflow:hidden;font-size:14px">
      <tr style="border-bottom:1px solid #F5F0E8">
        <td style="padding:12px 16px;background:#FAF6F0;color:#9AA0A6;font-weight:600;font-size:12px;width:80px;text-transform:uppercase;letter-spacing:.5px">Nome</td>
        <td style="padding:12px 16px;color:#1A1A1C;font-weight:500">${nome}</td>
      </tr>
      <tr style="border-bottom:1px solid #F5F0E8">
        <td style="padding:12px 16px;background:#FAF6F0;color:#9AA0A6;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px">E-mail</td>
        <td style="padding:12px 16px"><a href="mailto:${email}" style="color:#6B0F1A;text-decoration:none;font-weight:600">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#FAF6F0;color:#9AA0A6;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Assunto</td>
        <td style="padding:12px 16px;color:#1A1A1C">${assunto}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Mensagem -->
  <tr><td style="background:#ffffff;padding:20px 32px 0">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#9AA0A6;text-transform:uppercase">Mensagem</p>
    <div style="background:#FAF6F0;border-left:4px solid #C9A65A;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;line-height:1.8;color:#4a4a4d;white-space:pre-wrap">${mensagem}</div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#ffffff;padding:24px 32px 28px">
    <a href="mailto:${email}?subject=Re%3A%20${encodeURIComponent(assunto)}" style="display:inline-block;background:#6B0F1A;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;letter-spacing:.3px">↩ Responder agora</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#FAF6F0;border:1px solid #E8E4DC;border-top:none;border-radius:0 0 12px 12px;padding:14px 32px">
    <p style="margin:0;font-size:11px;color:#9AA0A6">Responder este e-mail encaminha diretamente para <strong style="color:#4a4a4d">${email}</strong></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

    const htmlCliente = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#1A1A1C;border-radius:12px 12px 0 0;padding:36px 32px 30px;text-align:center">
    <div style="display:inline-flex;align-items:center;justify-content:center;background:#6B0F1A;border-radius:50%;width:56px;height:56px;font-size:26px;margin-bottom:16px">✉️</div>
    <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.3px">Recebemos sua mensagem!</h1>
    <p style="margin:10px 0 0;font-size:13px;color:rgba(201,166,90,0.8);letter-spacing:.05em">Monitor de Licitações · Suporte</p>
  </td></tr>

  <!-- Linha dourada -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#6B0F1A)"></td></tr>

  <!-- Corpo principal -->
  <tr><td style="background:#ffffff;padding:36px 32px 28px">
    <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#1A1A1C">Olá, ${nome.split(' ')[0]}!</p>
    <p style="margin:0 0 20px;font-size:15px;color:#4a4a4d;line-height:1.8">
      Sua mensagem sobre <strong style="color:#6B0F1A">${assunto}</strong> chegou com sucesso.<br>
      Um de nossos atendentes <strong style="color:#1A1A1C">entrará em contato o quanto antes</strong> — normalmente em até 24 horas nos dias úteis.
    </p>
    <p style="margin:0;font-size:14px;color:#9AA0A6;line-height:1.7">
      Enquanto isso, se sua dúvida for urgente, você pode nos chamar diretamente pelo WhatsApp e ser atendido de imediato.
    </p>
  </td></tr>

  <!-- Resumo da mensagem -->
  <tr><td style="background:#ffffff;padding:0 32px 28px">
    <div style="background:#FAF6F0;border:1px solid #E8E4DC;border-left:4px solid #C9A65A;border-radius:0 8px 8px 0;padding:18px 20px">
      <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:#9AA0A6;text-transform:uppercase">Sua mensagem</p>
      <p style="margin:0;font-size:13px;color:#4a4a4d;line-height:1.75;white-space:pre-wrap">${mensagem.length > 220 ? mensagem.slice(0, 220) + '…' : mensagem}</p>
    </div>
  </td></tr>

  <!-- CTA WhatsApp -->
  <tr><td style="background:#ffffff;padding:0 32px 36px;text-align:center">
    <p style="margin:0 0 16px;font-size:13px;color:#9AA0A6">Precisa de resposta imediata?</p>
    <a href="https://wa.me/5531998317066?text=Olá! Entrei em contato pelo site e gostaria de suporte." style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:8px;letter-spacing:.3px">💬 Falar agora pelo WhatsApp</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#FAF6F0;border:1px solid #E8E4DC;border-radius:0 0 12px 12px;padding:18px 32px;text-align:center">
    <p style="margin:0 0 4px;font-size:12px;color:#9AA0A6">Você está recebendo este e-mail porque entrou em contato conosco.</p>
    <p style="margin:0;font-size:11px;color:#C0BAB0">© ${new Date().getFullYear()} Monitor de Licitações &nbsp;·&nbsp; <a href="https://monitordelicitacoes.com.br" style="color:#9AA0A6;text-decoration:none">monitordelicitacoes.com.br</a></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

    await resend.emails.send({
      from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:      ADMIN,
      replyTo: email,
      subject: `[Fale Conosco] ${assunto} — ${nome}`,
      html:    htmlAdmin,
    })

    await resend.emails.send({
      from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:      email,
      subject: 'Recebemos sua mensagem — Monitor de Licitações',
      html:    htmlCliente,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contato]', e)
    return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 })
  }
}
