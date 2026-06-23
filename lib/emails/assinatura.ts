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

  <!-- Header -->
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

  <!-- Footer -->
  <tr><td style="padding:20px 28px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações · Matutta<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a><br>
      <a href="${APP_URL}/perfil" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Gerenciar preferências de e-mail</a>
    </p>
  </td></tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Dia 1: configurar palavras-chave ─────────────────────────────────────────
export async function enviarEmailPosAssinaturaDia1(
  email: string,
  plano: string,
): Promise<void> {
  const resend = getResend()
  trackResend()

  const nomePlano = plano.charAt(0).toUpperCase() + plano.slice(1)

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Plano ${nomePlano} ativo — configure suas palavras-chave agora`,
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Assinatura confirmada</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Agora falta uma coisa:<br>
      <span style="color:#6B0F1A;font-style:italic;">dizer o que sua empresa vende.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Seu plano <strong>${nomePlano}</strong> está ativo. Para começar a receber alertas, cadastre as palavras-chave que descrevem os produtos ou serviços da sua empresa — o monitor rastreia automaticamente todos os editais publicados no Brasil que se encaixam no seu perfil.
    </p>
  </td></tr>

  <!-- Exemplos de palavras-chave -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;padding:20px 24px;">
      <tr><td>
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Exemplos de palavras-chave</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${['reforma predial', 'material de escritório', 'serviços de TI', 'uniformes', 'limpeza', 'equipamentos médicos'].map(t =>
            `<span style="display:inline-block;background:rgba(107,15,26,0.07);border:1px solid rgba(107,15,26,0.12);border-radius:99px;padding:5px 14px;font-size:13px;color:#6B0F1A;font-weight:600;">${t}</span>`
          ).join('')}
        </div>
        <p style="color:#9AA0A6;font-size:12px;margin:12px 0 0;line-height:1.6;">
          Use termos simples que apareçam no objeto dos editais. Quanto mais específico, mais relevantes serão os alertas.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/palavras-chave"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
      Cadastrar palavras-chave →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:14px 0 0;">Leva menos de 2 minutos. Seu primeiro alerta chega no próximo dia útil.</p>
  </td></tr>
    `),
  })
}

// ── Dia 7: primeira semana ────────────────────────────────────────────────────
export async function enviarEmailPosAssinaturaDia7(
  email: string,
  totalAlertas: number,
  totalLicitacoes: number,
): Promise<void> {
  const resend = getResend()
  trackResend()

  const temDados = totalAlertas > 0

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: temDados
      ? `Sua primeira semana: ${totalAlertas} alertas, ${totalLicitacoes} licitações monitoradas`
      : 'Sua primeira semana de monitoramento — o que vem pela frente',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Sua primeira semana</div>
    ${temDados ? `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      <span style="color:#6B0F1A;font-style:italic;">${totalAlertas} alertas</span><br>na sua primeira semana.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Em 7 dias, o Monitor identificou <strong>${totalLicitacoes} licitações</strong> que correspondem ao perfil da sua empresa. Cada uma delas foi uma oportunidade que você não deixou passar.
    </p>
    ` : `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      O monitoramento está <span style="color:#6B0F1A;font-style:italic;">ativo e rodando.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Ainda não encontramos editais abertos para suas palavras-chave nesta semana — mas o rastreamento está funcionando. Editais são publicados diariamente; seu alerta chega assim que um aparecer.
    </p>
    `}
  </td></tr>

  <!-- Métricas da semana -->
  ${temDados ? `
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:24px;text-align:center;width:50%;">
          <div style="color:#C9A65A;font-size:32px;font-weight:700;">${totalAlertas}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:6px;">alertas recebidos</div>
        </td>
        <td style="padding:24px;text-align:center;width:50%;border-left:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:32px;font-weight:700;">${totalLicitacoes}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:6px;">licitações monitoradas</div>
        </td>
      </tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Dica -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;">
      <tr><td style="padding:20px 24px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;margin-bottom:8px;">💡 Dica: ative o Telegram para alertas instantâneos</div>
        <p style="color:#4a4a4d;font-size:13px;line-height:1.6;margin:0;">
          Além dos e-mails diários, você pode receber alertas urgentes no Telegram assim que um edital é publicado — sem esperar o próximo ciclo de envio.
        </p>
        <a href="${APP_URL}/perfil" style="display:inline-block;margin-top:12px;color:#6B0F1A;font-size:13px;font-weight:700;text-decoration:none;">Configurar Telegram →</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/alertas"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Ver todos os alertas →
    </a>
  </td></tr>
    `),
  })
}

// ── Dia 30: resumo do mês + upsell se Basic ───────────────────────────────────
export async function enviarEmailPosAssinaturaDia30(
  email: string,
  plano: string,
  totalAlertas: number,
  totalLicitacoes: number,
  volumeMonitorado: number,
): Promise<void> {
  const resend = getResend()
  trackResend()

  const isBasic = plano === 'basic'

  function formatarVolume(v: number): string {
    if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}B`
    if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
    if (v >= 1_000)         return `R$ ${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
    return `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `1 mês de Monitor — ${totalLicitacoes} licitações rastreadas para você`,
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Seu primeiro mês</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      30 dias monitorando<br>
      <span style="color:#6B0F1A;font-style:italic;">o mercado público para você.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Em um mês, o Monitor trabalhou todos os dias para garantir que nenhuma oportunidade relevante passasse despercebida. Veja o que foi rastreado:
    </p>
  </td></tr>

  <!-- Métricas do mês -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:20px 12px;text-align:center;width:33%;">
          <div style="color:#C9A65A;font-size:26px;font-weight:700;">${totalAlertas}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:4px;line-height:1.4;">alertas<br>gerados</div>
        </td>
        <td style="padding:20px 12px;text-align:center;width:33%;border-left:1px solid rgba(255,255,255,0.1);border-right:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:26px;font-weight:700;">${totalLicitacoes}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:4px;line-height:1.4;">licitações<br>monitoradas</div>
        </td>
        <td style="padding:20px 12px;text-align:center;width:33%;">
          <div style="color:#C9A65A;font-size:26px;font-weight:700;">${volumeMonitorado > 0 ? formatarVolume(volumeMonitorado) : '—'}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:4px;line-height:1.4;">volume<br>monitorado</div>
        </td>
      </tr>
    </table>
  </td></tr>

  ${isBasic ? `
  <!-- Upsell Basic → Profissional -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #6B0F1A;border-radius:14px;overflow:hidden;">
      <tr><td style="background:#6B0F1A;padding:14px 20px;">
        <span style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Desbloqueie o potencial completo</span>
      </td></tr>
      <tr><td style="padding:20px 24px;">
        <p style="color:#4a4a4d;font-size:14px;line-height:1.6;margin:0 0 16px;">
          No plano <strong>Basic</strong> você tem 20 palavras-chave. No <strong>Profissional</strong>, são ilimitadas — além de buscas de preços vencedores ilimitadas, Radar de Contratos (veja contratos públicos vencendo antes da concorrência) e Diretório de Parceiros (forme consórcios para ganhar editais maiores).
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="color:#1A1A1C;font-size:16px;font-weight:700;">Profissional</div>
              <div style="color:#9AA0A6;font-size:12px;margin-top:2px;">palavras-chave ilimitadas · 1 usuário</div>
            </td>
            <td align="right">
              <div style="color:#6B0F1A;font-size:22px;font-weight:700;">R$97,90<span style="font-size:13px;color:#9AA0A6;">/mês</span></div>
            </td>
          </tr>
        </table>
        <a href="${APP_URL}/precos"
           style="display:inline-block;margin-top:16px;background:#6B0F1A;color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
          Fazer upgrade →
        </a>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:${isBasic ? '#F5F0EB' : '#6B0F1A'};color:${isBasic ? '#6B0F1A' : 'white'};text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:14px;border:${isBasic ? '1px solid #D9CFC4' : 'none'};">
      Ver painel completo →
    </a>
  </td></tr>
    `),
  })
}
