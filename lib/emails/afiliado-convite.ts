import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

export async function enviarConviteAfiliado({
  email,
  nome,
  token,
}: {
  email: string
  nome: string
  token: string
}): Promise<boolean> {
  const APP_URL   = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const link      = `${APP_URL}/afiliados/ativar/${token}`
  const remetente = process.env.EMAIL_REMETENTE ?? 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:20px;overflow:hidden;border:1px solid #E8E4DC;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

  <!-- Header -->
  <tr><td style="background:#6B0F1A;padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:rgba(255,255,255,0.08);border:1px solid rgba(201,166,90,0.3);border-radius:10px;width:38px;height:38px;text-align:center;vertical-align:middle;">
          <span style="color:#C9A65A;font-weight:700;font-size:12px;font-family:system-ui;">ML</span>
        </td>
        <td style="padding-left:12px;">
          <span style="color:white;font-weight:600;font-size:15px;">Monitor de Licitações</span><br>
          <span style="color:rgba(255,255,255,0.45);font-size:12px;">Programa de Parceiros</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Linha dourada -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  <!-- Corpo -->
  <tr><td style="padding:40px 40px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Convite de parceiro</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Olá, ${nome}! Você foi convidado para o programa de parceiros.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Você receberá comissão por cada cliente que assinar o Monitor de Licitações pelo seu link exclusivo. Acesse seu painel para ver seu link, métricas e histórico de pagamentos.
    </p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 28px;" align="center">
    <a href="${link}"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
      Ativar minha conta de parceiro →
    </a>
  </td></tr>

  <!-- Aviso -->
  <tr><td style="padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td style="padding:16px 20px;">
        <p style="font-size:13px;color:#9AA0A6;margin:0;line-height:1.6;">
          ⏰ Este link expira em <strong style="color:#1A1A1C;">7 dias</strong>. Se você não esperava este convite, ignore este e-mail.
        </p>
        <p style="font-size:12px;color:#9AA0A6;margin:10px 0 0;line-height:1.6;word-break:break-all;">
          Link direto: <span style="color:#6B0F1A;">${link}</span>
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 40px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações · Matutta<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a>
    </p>
  </td></tr>

  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  const { error } = await getResend().emails.send({
    from:    remetente,
    to:      email,
    subject: 'Você foi convidado para o Programa de Parceiros — Monitor de Licitações',
    html,
  })

  if (error) { console.error('[afiliado-convite] erro:', error); return false }
  return true
}
