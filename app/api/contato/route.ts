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
    await resend.emails.send({
      from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:      ADMIN,
      replyTo: email,
      subject: `[Fale Conosco] ${assunto} — ${nome}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
          <h2 style="margin:0 0 20px;font-size:18px">Nova mensagem via Fale Conosco</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:700;width:100px">Nome</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${nome}</td></tr>
            <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:700">E-mail</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:700">Assunto</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${assunto}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:10px;font-size:14px;line-height:1.7;white-space:pre-wrap">${mensagem}</div>
          <p style="margin-top:24px;font-size:11px;color:#94a3b8">Responder diretamente a este e-mail vai para: ${email}</p>
        </div>`,
    })

    // Confirmação para o usuário
    await resend.emails.send({
      from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
      to:      email,
      subject: 'Recebemos sua mensagem — Monitor de Licitações',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
          <h2 style="margin:0 0 16px;font-size:18px">Mensagem recebida, ${nome.split(' ')[0]}!</h2>
          <p style="font-size:14px;line-height:1.7">Recebemos seu contato sobre <strong>${assunto}</strong> e responderemos em até 24 horas nos dias úteis.</p>
          <p style="font-size:14px;line-height:1.7;margin-top:12px">Precisa de algo urgente? Fale conosco pelo WhatsApp: <a href="https://wa.me/5531998317066" style="color:#25D366;font-weight:600">Suporte</a></p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #f1f5f9">
          <p style="font-size:11px;color:#94a3b8">Monitor de Licitações · monitordelicitacoes.com.br</p>
        </div>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contato]', e)
    return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 })
  }
}
