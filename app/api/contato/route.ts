import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN  = process.env.ADMIN_EMAIL ?? 'djardelreis@gmail.com'

export async function POST(req: NextRequest) {
  const { nome, email, assunto, mensagem } = await req.json()

  if (!nome || !email || !assunto || !mensagem) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  try {
    // E-mail para o admin
    await resend.emails.send({
      from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:      ADMIN,
      replyTo: email,
      subject: `[Fale Conosco] ${assunto} — ${nome}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 32px">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:rgba(255,255,255,.7);text-transform:uppercase">Monitor de Licitações</p>
    <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff">Nova mensagem via Fale Conosco</h1>
  </td></tr>

  <!-- Dados do remetente -->
  <tr><td style="padding:28px 32px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:14px">
      <tr>
        <td style="padding:10px 14px;background:#f8fafc;color:#64748b;font-weight:600;width:90px;border-bottom:1px solid #e2e8f0">Nome</td>
        <td style="padding:10px 14px;color:#0f172a;border-bottom:1px solid #e2e8f0">${nome}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#f8fafc;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">E-mail</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0"><a href="mailto:${email}" style="color:#3b82f6;text-decoration:none;font-weight:500">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#f8fafc;color:#64748b;font-weight:600">Assunto</td>
        <td style="padding:10px 14px;color:#0f172a"><span style="background:#eff6ff;color:#1d4ed8;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600">${assunto}</span></td>
      </tr>
    </table>
  </td></tr>

  <!-- Mensagem -->
  <tr><td style="padding:20px 32px 0">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase">Mensagem</p>
    <div style="background:#f8fafc;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 18px;font-size:14px;line-height:1.75;color:#334155;white-space:pre-wrap">${mensagem}</div>
  </td></tr>

  <!-- Ação rápida -->
  <tr><td style="padding:24px 32px">
    <a href="mailto:${email}?subject=Re: ${assunto}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 22px;border-radius:8px">Responder agora</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:11px;color:#94a3b8">Ao clicar em Responder, o e-mail vai diretamente para <strong>${email}</strong></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
    })

    // Confirmação para o usuário
    await resend.emails.send({
      from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:      email,
      subject: 'Recebemos sua mensagem — Monitor de Licitações',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 32px;text-align:center">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;color:rgba(255,255,255,.7);text-transform:uppercase">Monitor de Licitações</p>
    <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff">Mensagem recebida! ✓</h1>
  </td></tr>

  <!-- Corpo -->
  <tr><td style="padding:32px 32px 24px;text-align:center">
    <p style="margin:0 0 12px;font-size:16px;color:#0f172a;font-weight:600">Olá, ${nome.split(' ')[0]}!</p>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.75">Recebemos sua mensagem sobre <strong style="color:#1e40af">${assunto}</strong> e<br>responderemos em até <strong>24 horas</strong> nos dias úteis.</p>
  </td></tr>

  <!-- Card resumo -->
  <tr><td style="padding:0 32px 28px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase">Sua mensagem</p>
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.7;white-space:pre-wrap">${mensagem.length > 200 ? mensagem.slice(0, 200) + '…' : mensagem}</p>
    </div>
  </td></tr>

  <!-- CTA WhatsApp -->
  <tr><td style="padding:0 32px 32px;text-align:center">
    <p style="margin:0 0 14px;font-size:13px;color:#64748b">Precisa de resposta urgente?</p>
    <a href="https://wa.me/5531998317066" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:11px 24px;border-radius:8px">💬 Fale pelo WhatsApp</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">Monitor de Licitações · <a href="https://monitordelicitacoes.com.br" style="color:#94a3b8">monitordelicitacoes.com.br</a></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contato]', e)
    return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 })
  }
}
