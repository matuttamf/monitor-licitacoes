import { Resend } from 'resend'
import { trackResend } from '@/lib/uso-apis'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
const FROM = process.env.EMAIL_REMETENTE || 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'

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
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a><br>
      <a href="${APP_URL}/regulamento-indicacoes" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Regulamento do programa de indicações</a>
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

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

// ── Usuário ficou apto a indicar ────────────────────────────────────────────

export async function enviarEmailIndicaApto(email: string, nome: string | null, codigo: string): Promise<void> {
  const resend = getResend()
  trackResend()
  const link = `${APP_URL}/r/${codigo}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '🚀 Convide amigos e ganhe meses grátis',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Novidade · Convide amigos</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Agora você pode ganhar meses grátis.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Você tem um <strong>link exclusivo</strong>. Cada amigo que assinar um plano pago
      pelo seu link garante <strong>+30 dias grátis</strong> para você — e o seu amigo
      ainda entra com <strong>20% de desconto</strong> na primeira assinatura.
    </p>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      O benefício é <strong>acumulativo e sem limite</strong>: indicando o suficiente,
      você mantém sua assinatura ativa sem pagar.
    </p>
    <div style="background:#FAF6F0;border:1px solid #E8E4DC;border-radius:12px;padding:16px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#9AA0A6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Seu link de convite</div>
      <div style="font-size:15px;font-weight:700;color:#6B0F1A;word-break:break-all;font-family:monospace;">${link}</div>
    </div>
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Convidar amigos agora →
    </a>
    <p style="color:#9AA0A6;font-size:13px;margin:22px 0 0;line-height:1.6;">
      Como funciona: amigo assina → permanece 10 dias → seus 30 dias são liberados.
      Veja todas as regras no
      <a href="${APP_URL}/regulamento-indicacoes" style="color:#6B0F1A;font-weight:600;">regulamento</a>.
    </p>
  </td></tr>
  <tr><td style="padding:0 28px 32px;"></td></tr>
    `),
  })
}

// ── Recompensa liberada ─────────────────────────────────────────────────────

export async function enviarEmailIndicaRecompensa(
  email: string,
  nome: string | null,
  economiaTotal: number,
): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Seu amigo assinou — você ganhou 1 mês grátis! 🎉',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Recompensa liberada</div>
    <h1 style="color:#1A1A1C;font-size:25px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Você ganhou <strong style="color:#6B0F1A;">+30 dias grátis</strong>.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Um amigo seu assinou e permaneceu ativo. Os 30 dias já foram creditados na sua conta.
    </p>
    <div style="background:linear-gradient(135deg,#6B0F1A,#8a1422);border-radius:14px;padding:24px;text-align:center;margin-bottom:22px;">
      <div style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Você já economizou</div>
      <div style="color:#C9A65A;font-size:34px;font-weight:800;letter-spacing:-0.02em;">${moeda(economiaTotal)}</div>
      <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:6px;">com suas indicações</div>
    </div>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Continue convidando — cada novo amigo que assina vale mais <strong>30 dias grátis</strong>.
    </p>
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Convidar mais amigos →
    </a>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;"></td></tr>
    `),
  })
}
