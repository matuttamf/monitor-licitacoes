import { Resend } from 'resend'
import { trackResend } from '@/lib/uso-apis'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
const FROM = process.env.EMAIL_REMETENTE || 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'
const WHATSAPP = 'https://wa.me/5531998317066'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function baseEmail(conteudo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:white;border-radius:20px;overflow:hidden;border:1px solid #E8E4DC;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

  <tr><td style="background:#6B0F1A;padding:24px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:rgba(255,255,255,0.08);border:1px solid rgba(201,166,90,0.3);border-radius:10px;width:38px;height:38px;text-align:center;vertical-align:middle;">
          <span style="color:#C9A65A;font-weight:700;font-size:12px;font-family:system-ui;">ML</span>
        </td>
        <td style="padding-left:12px;">
          <span style="color:white;font-weight:600;font-size:15px;">Monitor de Licitações</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  ${conteudo}

  <tr><td style="padding:20px 28px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações<br>
      Pode responder este e-mail — uma pessoa de verdade vai ler.<br>
      <a href="${WHATSAPP}" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a>
    </p>
  </td></tr>

  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function saudacao(nome: string | null): string {
  return nome ? `Olá, ${nome}!` : 'Olá!'
}

// ── Feedback pós-trial (5 dias após a tentativa de reativação) ───────────────

/** HTML do e-mail de feedback de trial expirado (exposto para preview). */
export function htmlFeedbackTrial(nome: string | null): string {
  const motivos = [
    'Não tive tempo de explorar',
    'Não encontrei licitações do meu segmento',
    'Achei o preço alto',
    'Faltou alguma função que eu precisava',
    'Outro motivo',
  ]
  const linhas = motivos.map(m =>
    `<tr><td style="padding:4px 0;">
       <a href="${WHATSAPP}?text=${encodeURIComponent('Sobre o trial: ' + m)}"
          style="display:block;background:#FAF6F0;border:1px solid #E8E4DC;border-radius:10px;padding:12px 16px;color:#1A1A1C;text-decoration:none;font-size:14px;font-weight:500;">
         ${m} →
       </a>
     </td></tr>`
  ).join('')

  return baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Sua opinião</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Podemos melhorar?
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 8px;">
      Seu período de teste terminou e você decidiu não continuar — tudo bem.
      Queremos entender <strong>o que faltou</strong> para o Monitor valer a pena para você.
    </p>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Leva 10 segundos: toque na opção que mais combina (abre o WhatsApp).
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">${linhas}</table>
    <p style="color:#9AA0A6;font-size:13px;margin:20px 0 0;line-height:1.6;">
      Sua resposta nos ajuda de verdade — e, se fizer sentido, encontramos uma forma de te atender melhor.
    </p>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;"></td></tr>
  `)
}

export async function enviarEmailFeedbackTrial(email: string, nome: string | null): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Podemos melhorar? Conte o que faltou',
    html: htmlFeedbackTrial(nome),
  })
}

// ── Feedback de experiência (32 dias de uso) ─────────────────────────────────

/** HTML do e-mail de feedback de experiência aos 32 dias (exposto para preview). */
export function htmlFeedbackExperiencia(nome: string | null): string {
  const escala = [
    { nota: '😍', label: 'Excelente' },
    { nota: '🙂', label: 'Boa' },
    { nota: '😐', label: 'Mediana' },
    { nota: '😕', label: 'Ruim' },
  ]
  const cols = escala.map(e =>
    `<td align="center" style="padding:4px;">
       <a href="${WHATSAPP}?text=${encodeURIComponent('Minha experiência no 1º mês: ' + e.label)}"
          style="display:block;background:#FAF6F0;border:1px solid #E8E4DC;border-radius:12px;padding:14px 8px;text-decoration:none;">
         <div style="font-size:26px;line-height:1;">${e.nota}</div>
         <div style="font-size:11px;color:#6B7280;margin-top:6px;font-weight:600;">${e.label}</div>
       </a>
     </td>`
  ).join('')

  return baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">1 mês juntos</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Como está sendo a experiência?
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Você já está há um mês com o Monitor de Licitações. Queremos saber, com sinceridade,
      <strong>como tem sido</strong> — o que está funcionando e o que podemos melhorar.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>${cols}</tr></table>
    <p style="color:#4a4a4d;font-size:14px;line-height:1.7;margin:20px 0 0;">
      Toque na carinha que representa sua experiência (abre o WhatsApp) — ou
      <strong>responda este e-mail</strong> contando o que achou. Lemos cada mensagem.
    </p>
    <div style="margin-top:24px;">
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
        Voltar ao painel →
      </a>
    </div>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;"></td></tr>
  `)
}

export async function enviarEmailFeedbackExperiencia(email: string, nome: string | null): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '1 mês com o Monitor — como está sendo?',
    html: htmlFeedbackExperiencia(nome),
  })
}
