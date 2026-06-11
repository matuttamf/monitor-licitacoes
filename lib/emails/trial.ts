import { Resend } from 'resend'
import { trackResend } from '@/lib/uso-apis'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://monitordelicitacoes.com.br'
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
          <span style="color:rgba(255,255,255,0.45);font-size:12px;">Matutta</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Linha dourada decorativa -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  ${conteudo}

  <!-- Footer -->
  <tr><td style="padding:24px 40px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações · Matutta<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a>
    </p>
  </td></tr>

  <!-- Barra final -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// E-mail Dia 1: Boas-vindas
export async function enviarEmailBoasVindas(email: string, nome: string): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Bem-vindo ao Monitor de Licitações — seus 7 dias começam agora',
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:40px 40px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Conta ativada com sucesso</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      O governo compra o que você vende.<br>
      <span style="color:#6B0F1A;font-style:italic;">Agora você vai saber quando.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Sua conta foi criada com sucesso. Você tem <strong>7 dias grátis</strong> para testar o monitoramento completo — sem precisar de cartão de crédito.
    </p>
  </td></tr>

  <!-- Passos -->
  <tr><td style="padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:20px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px;">3 passos para seu primeiro alerta</div>
      </td></tr>
      ${[
        ['1', 'Cadastre suas palavras-chave', 'Informe os produtos que sua empresa vende — o sistema faz o cruzamento automático com os editais.'],
        ['2', 'Aguarde o próximo dia útil', 'Coletamos novos editais toda madrugada. Seu primeiro alerta chega pela manhã.'],
        ['3', 'Receba e responda', 'Alertas por e-mail e Telegram com as oportunidades filtradas para o seu negócio.'],
      ].map(([n, t, d]) => `
      <tr><td style="padding:0 24px 16px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:28px;height:28px;background:#6B0F1A;border-radius:50%;text-align:center;vertical-align:middle;color:#C9A65A;font-weight:700;font-size:13px;" valign="middle">${n}</td>
            <td style="padding-left:14px;vertical-align:top;">
              <div style="color:#1A1A1C;font-size:14px;font-weight:600;margin-bottom:2px;">${t}</div>
              <div style="color:#9AA0A6;font-size:13px;line-height:1.5;">${d}</div>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 40px;" align="center">
    <a href="${APP_URL}/palavras-chave"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
      Configurar palavras-chave agora →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:16px 0 0;">Leva menos de 2 minutos</p>
  </td></tr>
    `),
  })
}

// E-mail Dia 3: Engajamento
export async function enviarEmailDia3(
  email: string,
  totalLicitacoes: number,
  termos: string[] = [],
): Promise<void> {
  const resend = getResend()
  trackResend()

  const termosLabel = termos.length > 0
    ? termos.slice(0, 3).join(', ') + (termos.length > 3 ? ` +${termos.length - 3}` : '')
    : 'suas palavras-chave'

  const subject = totalLicitacoes > 0
    ? `${totalLicitacoes} licitações encontradas para "${termosLabel}" — veja agora`
    : `Seu monitor está rastreando "${termosLabel}" — 4 dias restantes`

  const termosChips = termos.length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px;">
        ${termos.slice(0, 6).map(t => `
        <span style="display:inline-block;background:rgba(107,15,26,0.08);border:1px solid rgba(107,15,26,0.15);border-radius:99px;padding:4px 12px;font-size:13px;color:#6B0F1A;font-weight:600;">
          ${t}
        </span>`).join('')}
        ${termos.length > 6 ? `<span style="display:inline-block;background:#F0ECE8;border-radius:99px;padding:4px 12px;font-size:13px;color:#9AA0A6;">+${termos.length - 6} mais</span>` : ''}
      </div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:40px 40px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Atualização do seu monitoramento</div>
    ${totalLicitacoes > 0 ? `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      <span style="color:#6B0F1A;font-style:italic;">${totalLicitacoes} licitações</span><br>cruzadas com seu perfil.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Identificamos editais publicados nos últimos dias que correspondem ao que sua empresa vende. Acesse o painel para ver os detalhes e os valores envolvidos.
    </p>
    ` : `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Seu monitor está <span style="color:#6B0F1A;font-style:italic;">ativo e rastreando.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Ainda não encontramos editais publicados para suas palavras-chave nos últimos 3 dias — mas o monitoramento está rodando. Editais são publicados diariamente; seu alerta chega assim que um aparecer.
    </p>
    `}
    ${termosChips}
  </td></tr>

  <!-- Estatísticas -->
  <tr><td style="padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:24px;text-align:center;width:33%;">
          <div style="color:#C9A65A;font-size:22px;font-weight:700;">346+</div>
          <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;">Fontes monitoradas</div>
        </td>
        <td style="padding:24px;text-align:center;width:33%;border-left:1px solid rgba(255,255,255,0.1);border-right:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:22px;font-weight:700;">Diário</div>
          <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;">Coleta automática</div>
        </td>
        <td style="padding:24px;text-align:center;width:33%;">
          <div style="color:#C9A65A;font-size:22px;font-weight:700;">5.500+</div>
          <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;">Municípios cobertos</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 40px;" align="center">
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Ver licitações no painel →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:14px 0 0;">
      Seu trial termina em 4 dias. <a href="${APP_URL}/assinar" style="color:#6B0F1A;font-weight:600;text-decoration:none;">Assinar agora →</a>
    </p>
  </td></tr>
    `),
  })
}

// E-mail Dia 6: Urgência (trial expira amanhã)
export async function enviarEmailUrgencia(email: string): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Seu acesso expira amanhã — não perca as próximas oportunidades',
    html: baseEmail(`
  <!-- Urgência header -->
  <tr><td style="padding:40px 40px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Aviso importante</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Seu período de teste<br>
      <span style="color:#6B0F1A;font-style:italic;">expira amanhã.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Após o vencimento, os alertas diários serão pausados e você deixará de ser notificado sobre novos editais. Cada edital perdido pode ser uma oportunidade que vai para o concorrente.
    </p>
  </td></tr>

  <!-- Planos -->
  <tr><td style="padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #6B0F1A;border-radius:14px;overflow:hidden;">
      <tr><td style="background:#6B0F1A;padding:16px 24px;">
        <span style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Plano recomendado</span>
      </td></tr>
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="color:#1A1A1C;font-size:20px;font-weight:700;">Profissional</div>
              <div style="color:#9AA0A6;font-size:13px;margin-top:4px;">Palavras-chave ilimitadas · 1 usuário</div>
            </td>
            <td align="right">
              <div style="color:#6B0F1A;font-size:28px;font-weight:700;">R$97,90</div>
              <div style="color:#9AA0A6;font-size:12px;text-align:right;">por mês · R$3,26/dia</div>
            </td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #E8E4DC;margin:16px 0;">
        ${[
          'Palavras-chave ilimitadas',
          'Alertas por e-mail e Telegram',
          'Painel com busca e histórico',
          'Cobertura de 5.500+ municípios',
          'Cancele quando quiser',
        ].map(item => `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;color:#4a4a4d;font-size:14px;">
          <span style="color:#6B0F1A;font-weight:700;font-size:16px;">✓</span> ${item}
        </div>`).join('')}
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA duplo -->
  <tr><td style="padding:0 40px 40px;" align="center">
    <a href="${APP_URL}/assinar"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:12px;">
      Assinar e continuar monitorando →
    </a>
    <br>
    <a href="${APP_URL}/assinar"
       style="color:#6B0F1A;text-decoration:none;font-size:13px;font-weight:600;">
      Ver todos os planos a partir de R$ 49,90/mês
    </a>
  </td></tr>
    `),
  })
}
