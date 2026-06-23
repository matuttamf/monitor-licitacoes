import { Resend } from 'resend'
import { trackResend } from '@/lib/uso-apis'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://monitordelicitacoes.com.br'
const FROM = process.env.EMAIL_REMETENTE || 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function baseEmail(conteudo: string, email: string): string {
  const url = APP_URL.replace(/\/$/, '')
  return `<!DOCTYPE html>
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
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  ${conteudo}

  <!-- Footer -->
  <tr><td style="padding:24px 40px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a><br>
      <a href="${url}/perfil" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Gerenciar preferências de e-mail</a>
      &nbsp;·&nbsp;
      <a href="${url}/descadastrar?email=${encodeURIComponent(email)}" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Descadastrar</a>
    </p>
  </td></tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function enviarEmailSugestoesKeywords(
  email: string,
  nome: string,
  keywordsSalvas: string[],
  sugestoes: string[],
): Promise<void> {
  const resend = getResend()
  trackResend()

  const chipsSalvas = keywordsSalvas
    .map(k => `<span style="display:inline-block;background:rgba(107,15,26,0.07);border:1px solid rgba(107,15,26,0.2);border-radius:99px;padding:4px 12px;font-size:13px;color:#6B0F1A;font-weight:600;margin:3px 4px 3px 0;">${k}</span>`)
    .join('')

  const chipsSugestoes = sugestoes
    .map(s => `<a href="${APP_URL}/palavras-chave" style="display:inline-block;background:#FAF6F0;border:1px solid #E8E4DC;border-radius:99px;padding:4px 12px;font-size:13px;color:#4a4a4d;font-weight:500;margin:3px 4px 3px 0;text-decoration:none;">+ ${s}</a>`)
    .join('')

  const primeiroNome = (nome || 'você').split(' ')[0]

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${primeiroNome}, mais ${sugestoes.length} ${sugestoes.length === 1 ? 'palavra-chave' : 'palavras-chave'} para não perder editais`,
    html: baseEmail(`
  <tr><td style="padding:40px 40px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Sugestões personalizadas</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Ampliar o monitoramento<br>
      <span style="color:#6B0F1A;font-style:italic;">aumenta suas chances de ganhar editais.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Olá, ${primeiroNome}! Você configurou ${keywordsSalvas.length} palavra${keywordsSalvas.length !== 1 ? 's' : ''}-chave. Baseado no seu perfil, identificamos mais termos que empresas do seu setor usam para capturar editais no governo.
    </p>
  </td></tr>

  <tr><td style="padding:0 40px 24px;">
    <div style="background:#FAF6F0;border-radius:14px;padding:20px 24px;">
      <div style="font-size:12px;font-weight:700;color:#6B0F1A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">✓ Suas palavras-chave atuais</div>
      <div>${chipsSalvas || '<span style="font-size:13px;color:#9AA0A6;">Nenhuma cadastrada ainda</span>'}</div>
    </div>
  </td></tr>

  <tr><td style="padding:0 40px 28px;">
    <div style="border:1.5px dashed #C9A65A;border-radius:14px;padding:20px 24px;">
      <div style="font-size:12px;font-weight:700;color:#C9A65A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">💡 Sugestões para você adicionar</div>
      <p style="color:#9AA0A6;font-size:12px;margin:0 0 12px;">Clique em qualquer palavra para ir direto à tela de gerenciamento.</p>
      <div>${chipsSugestoes}</div>
    </div>
  </td></tr>

  <tr><td style="padding:0 40px 36px;">
    <a href="${APP_URL}/palavras-chave"
      style="display:block;text-align:center;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:12px;">
      Adicionar palavras-chave →
    </a>
    <p style="color:#9AA0A6;font-size:12px;text-align:center;margin:12px 0 0;">
      Quanto mais palavras, mais editais você encontra. Você pode adicionar a qualquer momento.
    </p>
  </td></tr>
`, email),
  })
}
