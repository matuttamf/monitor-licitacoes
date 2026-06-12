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
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px">

  <!-- Header -->
  <tr><td style="background:#1e3a5f;border-radius:12px 12px 0 0;padding:24px 32px;display:flex;align-items:center">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#93c5fd;text-transform:uppercase">Monitor de Licitações</p>
        <h1 style="margin:4px 0 0;font-size:18px;font-weight:700;color:#ffffff;line-height:1.3">📬 Nova mensagem — Fale Conosco</h1>
      </td>
      <td align="right">
        <span style="background:#3b82f6;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;white-space:nowrap">${assunto}</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Card dados -->
  <tr><td style="background:#ffffff;padding:28px 32px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-size:14px">
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-weight:600;font-size:12px;width:80px;text-transform:uppercase;letter-spacing:.5px">Nome</td>
        <td style="padding:12px 16px;color:#0f172a;font-weight:500">${nome}</td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px">E-mail</td>
        <td style="padding:12px 16px"><a href="mailto:${email}" style="color:#2563eb;text-decoration:none;font-weight:600">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Assunto</td>
        <td style="padding:12px 16px;color:#0f172a">${assunto}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Mensagem -->
  <tr><td style="background:#ffffff;padding:20px 32px 0">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase">Mensagem</p>
    <div style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap">${mensagem}</div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#ffffff;padding:24px 32px 28px">
    <a href="mailto:${email}?subject=Re%3A%20${encodeURIComponent(assunto)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;letter-spacing:.3px">↩ Responder agora</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:14px 32px">
    <p style="margin:0;font-size:11px;color:#94a3b8">Responder este e-mail encaminha diretamente para <strong style="color:#64748b">${email}</strong></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

    const htmlCliente = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#1e3a5f;border-radius:12px 12px 0 0;padding:32px 32px 28px;text-align:center">
    <div style="display:inline-block;background:rgba(255,255,255,.12);border-radius:50%;width:52px;height:52px;line-height:52px;font-size:24px;margin-bottom:14px">✉️</div>
    <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.3px">Mensagem recebida!</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#93c5fd">Monitor de Licitações</p>
  </td></tr>

  <!-- Corpo -->
  <tr><td style="background:#ffffff;padding:32px 32px 24px;text-align:center">
    <p style="margin:0 0 8px;font-size:17px;font-weight:700;color:#0f172a">Olá, ${nome.split(' ')[0]}!</p>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.8">Recebemos sua mensagem sobre<br><strong style="color:#1e40af">${assunto}</strong><br>e responderemos em até <strong style="color:#0f172a">24 horas úteis</strong>.</p>
  </td></tr>

  <!-- Resumo -->
  <tr><td style="background:#ffffff;padding:0 32px 28px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px">
      <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase">Sua mensagem</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:1.75;white-space:pre-wrap">${mensagem.length > 220 ? mensagem.slice(0, 220) + '…' : mensagem}</p>
    </div>
  </td></tr>

  <!-- Divisor + CTA -->
  <tr><td style="background:#ffffff;padding:0 32px 32px;text-align:center;border-bottom:1px solid #f1f5f9">
    <p style="margin:0 0 16px;font-size:13px;color:#64748b">Precisa de suporte urgente?</p>
    <a href="https://wa.me/5531998317066" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px">💬 Falar pelo WhatsApp</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">© 2025 Monitor de Licitações &nbsp;·&nbsp; <a href="https://monitordelicitacoes.com.br" style="color:#94a3b8;text-decoration:none">monitordelicitacoes.com.br</a></p>
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
