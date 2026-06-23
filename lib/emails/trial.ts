import { Resend } from 'resend'
import { trackResend } from '@/lib/uso-apis'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
const FROM = process.env.EMAIL_REMETENTE || 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function fmtValor(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}B`
  if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (v >= 1_000)         return `R$ ${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

function baseEmail(conteudo: string, email: string): string {
  const url = APP_URL.replace(/\/$/, '')
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

  <!-- Linha dourada decorativa -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  ${conteudo}

  <!-- Footer -->
  <tr><td style="padding:20px 28px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a><br>
      <a href="${url}/perfil" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Gerenciar preferências de e-mail</a>
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

// ── Dia 0: Boas-vindas ────────────────────────────────────────────────────────
export async function enviarEmailBoasVindas(email: string, nome: string): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Conta criada — veja o que o monitor vai encontrar para você',
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Conta ativada · 7 dias grátis</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      O governo publica contratos todos os dias.<br>
      <span style="color:#6B0F1A;font-style:italic;">Agora você vai saber quais são para você.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Prefeituras, estados, hospitais públicos e órgãos federais compram o que sua empresa vende — e publicam os editais toda semana. O Monitor rastreia tudo isso automaticamente e envia os alertas direto para você.
    </p>
  </td></tr>

  <!-- O que você pode encontrar -->
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:18px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">O que empresas encontram no primeiro mês</div>
      </td></tr>
      ${[
        ['Construção & Obras', 'Reformas prediais, pavimentação, instalações — R$ 80k a R$ 4M', '#fef3c7', '#92400e'],
        ['Limpeza & Conservação', 'Contratos de 24 a 36 meses com prefeituras e hospitais', '#f0fdf4', '#166534'],
        ['TI & Software', 'Pregões de suporte, sistemas, infraestrutura — prazos de 5 dias', '#eff6ff', '#1e40af'],
        ['Qualquer segmento', 'Mais de 18.000 editais publicados por semana no Brasil', '#faf5ff', '#6b21a8'],
      ].map(([seg, desc, bg, cor]) => `
      <tr><td style="padding:0 24px 14px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:8px;height:8px;background:${cor};border-radius:50%;vertical-align:top;padding-top:5px;"></td>
            <td style="padding-left:10px;">
              <div style="color:#1A1A1C;font-size:14px;font-weight:600;">${seg}</div>
              <div style="color:#9AA0A6;font-size:13px;line-height:1.5;">${desc}</div>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>
  </td></tr>

  <!-- Passos -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:18px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Para o primeiro alerta chegar</div>
      </td></tr>
      ${[
        ['1', 'Cadastre suas palavras-chave', 'O que sua empresa vende — "reforma elétrica", "limpeza hospitalar", "suporte TI". O sistema busca os editais que correspondem.'],
        ['2', 'O sistema faz uma busca completa', 'Assim que você configurar, rastreamos todos os editais abertos no Brasil para as suas palavras. Em breve seu banco de dados estará completo.'],
        ['3', 'Receba alertas por e-mail e WhatsApp', 'Cada edital novo chega direto para você. Também temos canal no WhatsApp para oportunidades em tempo real.'],
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
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/palavras-chave"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
      Configurar e receber alertas →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:16px 0 0;text-align:center;">Leva menos de 2 minutos · 7 dias grátis · sem cartão de crédito</p>
  </td></tr>
    `, email),
  })
}

// ── Dia 3: Engajamento ────────────────────────────────────────────────────────
export async function enviarEmailDia3(
  email: string,
  totalLicitacoes: number,
  termos: string[] = [],
  valorTotal?: number,
  maiorOportunidade?: { objeto: string; valor: number },
): Promise<void> {
  const resend = getResend()
  trackResend()

  const termosLabel = termos.length > 0
    ? termos.slice(0, 3).join(', ') + (termos.length > 3 ? ` +${termos.length - 3}` : '')
    : 'suas palavras-chave'

  const temDados   = totalLicitacoes > 0
  const temValor   = valorTotal && valorTotal > 0
  const valorLabel = temValor ? fmtValor(valorTotal!) : null

  const subject = temDados
    ? valorLabel
      ? `${valorLabel} em oportunidades encontradas nos seus primeiros 3 dias`
      : `${totalLicitacoes} oportunidades encontradas para "${termosLabel}" — veja agora`
    : `Seu monitor está rastreando "${termosLabel}" — 4 dias restantes`

  const termosChips = termos.length > 0
    ? `<div style="margin-bottom:24px;line-height:2.2;">
        ${termos.slice(0, 6).map(t => `<span style="display:inline-block;background:rgba(107,15,26,0.08);border:1px solid rgba(107,15,26,0.15);border-radius:99px;padding:4px 12px;font-size:13px;color:#6B0F1A;font-weight:600;margin-right:6px;margin-bottom:4px;">${t}</span>`).join('')}${termos.length > 6 ? `<span style="display:inline-block;background:#F0ECE8;border-radius:99px;padding:4px 12px;font-size:13px;color:#9AA0A6;margin-right:6px;margin-bottom:4px;">+${termos.length - 6} mais</span>` : ''}
      </div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Atualização do seu monitoramento</div>
    ${temDados ? `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${valorLabel
        ? `<span style="color:#6B0F1A;font-style:italic;">${valorLabel}</span><br>em oportunidades rastreadas nos seus primeiros 3 dias.`
        : `<span style="color:#6B0F1A;font-style:italic;">${totalLicitacoes} oportunidades</span><br>encontradas enquanto você estava focado na sua empresa.`
      }
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      ${totalLicitacoes} editais publicados nos últimos dias correspondem ao que sua empresa vende. Acesse o painel para ver os detalhes, valores e prazos de cada um.
    </p>
    ` : `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Seu monitor está <span style="color:#6B0F1A;font-style:italic;">ativo e rastreando.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Ainda não encontramos editais publicados para suas palavras-chave nos últimos 3 dias — mas o monitoramento está rodando 24h. Editais são publicados diariamente; seu alerta chega assim que um aparecer.
    </p>
    `}
    ${termosChips}
  </td></tr>

  ${temDados && maiorOportunidade ? `
  <!-- Maior oportunidade -->
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;">
      <tr><td style="padding:18px 24px;">
        <div style="color:#9AA0A6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Maior oportunidade encontrada</div>
        <div style="color:#1A1A1C;font-size:14px;line-height:1.5;margin-bottom:8px;">${maiorOportunidade.objeto}</div>
        <span style="display:inline-block;background:#6B0F1A;color:#C9A65A;font-size:13px;font-weight:700;padding:4px 14px;border-radius:99px;">${fmtValor(maiorOportunidade.valor)}</span>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Estatísticas -->
  <tr><td style="padding:0 28px 28px;">
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
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Ver oportunidades no painel →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:14px 0 0;text-align:center;">
      Seu trial termina em 4 dias. <a href="${APP_URL}/assinar" style="color:#6B0F1A;font-weight:600;text-decoration:none;">Assinar agora — trial termina em 4 dias →</a>
    </p>
  </td></tr>
    `, email),
  })
}

// ── Segunda-feira: panorama semanal ───────────────────────────────────────────
export async function enviarEmailSegunda(
  email: string,
  totalNacional: number,
  termos: string[] = [],
  isTrial = false,
  valorTotal?: number,
  maiorOportunidade?: { objeto: string; valor: number; orgao?: string },
): Promise<void> {
  const resend = getResend()
  trackResend()

  const termosLabel = termos.length > 0
    ? termos.slice(0, 3).join(', ') + (termos.length > 3 ? ` +${termos.length - 3}` : '')
    : 'suas palavras-chave'

  const temDados   = totalNacional > 0
  const temValor   = valorTotal && valorTotal > 0
  const valorLabel = temValor ? fmtValor(valorTotal!) : null

  const subject = temDados
    ? valorLabel
      ? `${valorLabel} em oportunidades monitoradas nesta semana`
      : `${totalNacional} licitações abertas com suas palavras-chave — panorama desta semana`
    : `Monitoramento ativo — panorama desta semana`

  const termosChips = termos.length > 0
    ? `<div style="margin-bottom:24px;line-height:2.2;">
        ${termos.slice(0, 6).map(t => `<span style="display:inline-block;background:rgba(107,15,26,0.08);border:1px solid rgba(107,15,26,0.15);border-radius:99px;padding:4px 12px;font-size:13px;color:#6B0F1A;font-weight:600;margin-right:6px;margin-bottom:4px;">${t}</span>`).join('')}${termos.length > 6 ? `<span style="display:inline-block;background:#F0ECE8;border-radius:99px;padding:4px 12px;font-size:13px;color:#9AA0A6;margin-right:6px;margin-bottom:4px;">+${termos.length - 6} mais</span>` : ''}
      </div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Panorama da semana</div>
    ${temDados ? `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${valorLabel
        ? `<span style="color:#6B0F1A;font-style:italic;">${valorLabel}</span><br>em oportunidades monitoradas nesta semana.`
        : `<span style="color:#6B0F1A;font-style:italic;">${totalNacional} licitações abertas</span><br>com suas palavras-chave no Brasil agora.`
      }
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      São editais publicados em todo o território nacional que correspondem ao que sua empresa vende. Alguns fecham esta semana — acesse o painel para ver prazos e valores.
    </p>
    ` : `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Seu monitor está <span style="color:#6B0F1A;font-style:italic;">ativo e rastreando.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Não encontramos editais abertos para suas palavras-chave nesta semana — mas o monitoramento está rodando 24h. Editais são publicados diariamente; seu alerta chega assim que um aparecer.
    </p>
    `}
    ${termosChips}
  </td></tr>

  ${temDados && maiorOportunidade ? `
  <!-- Destaque da semana -->
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;">
      <tr><td style="padding:18px 24px;">
        <div style="color:#9AA0A6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Maior oportunidade da semana</div>
        <div style="color:#1A1A1C;font-size:14px;line-height:1.5;margin-bottom:6px;">${maiorOportunidade.objeto}</div>
        ${maiorOportunidade.orgao ? `<div style="color:#9AA0A6;font-size:12px;margin-bottom:8px;">${maiorOportunidade.orgao}</div>` : ''}
        <span style="display:inline-block;background:#6B0F1A;color:#C9A65A;font-size:13px;font-weight:700;padding:4px 14px;border-radius:99px;">${fmtValor(maiorOportunidade.valor)}</span>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Contador destaque -->
  ${temDados ? `
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:28px;text-align:center;">
          ${valorLabel
            ? `<div style="color:#C9A65A;font-size:40px;font-weight:700;line-height:1;">${valorLabel}</div>
               <div style="color:rgba(255,255,255,0.7);font-size:14px;margin-top:8px;">em licitações abertas no Brasil com suas palavras-chave</div>
               <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">${totalNacional} editais · alguns com prazo esta semana</div>`
            : `<div style="color:#C9A65A;font-size:44px;font-weight:700;line-height:1;">${totalNacional}</div>
               <div style="color:rgba(255,255,255,0.7);font-size:14px;margin-top:8px;">licitações abertas com suas palavras-chave</div>
               <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">em todo o território nacional</div>`
          }
        </td>
      </tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- CTA -->
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Ver oportunidades no painel →
    </a>
    ${isTrial ? `<p style="color:#9AA0A6;font-size:12px;margin:14px 0 0;text-align:center;">
      Ainda no período de teste. <a href="${APP_URL}/assinar" style="color:#6B0F1A;font-weight:600;text-decoration:none;">Assinar e continuar recebendo alertas →</a>
    </p>` : ''}
  </td></tr>
    `, email),
  })
}

// ── Dia 6: Urgência (trial expira amanhã) ─────────────────────────────────────
export async function enviarEmailUrgencia(
  email: string,
  totalLicitacoes = 0,
  totalAlertas = 0,
  valorTotal = 0,
): Promise<void> {
  const resend = getResend()
  trackResend()

  const temDados   = totalLicitacoes > 0 || totalAlertas > 0
  const temValor   = valorTotal > 0
  const valorLabel = temValor ? fmtValor(valorTotal) : null

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Amanhã os alertas serão interrompidos — o que o monitor encontrou nos seus 7 dias',
    html: baseEmail(`
  <!-- Urgência header -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Aviso importante</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Amanhã os alertas<br>
      <span style="color:#6B0F1A;font-style:italic;">serão interrompidos.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      A partir de amanhã, novos editais deixarão de chegar automaticamente para você. Cada edital não recebido é uma oportunidade que vai para o concorrente — sem que você saiba que ela existiu.
    </p>
  </td></tr>

  ${temDados ? `
  <!-- O que foi encontrado nos 7 dias -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:16px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">O que o monitor encontrou nos seus 7 dias</div>
      </td></tr>
      <tr><td style="padding:0 24px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${totalLicitacoes > 0 ? `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E8E4DC;">
              <span style="color:#4a4a4d;font-size:14px;">${totalLicitacoes} licitações encontradas para você</span>
            </td>
            <td align="right" style="padding:8px 0;border-bottom:1px solid #E8E4DC;">
              <span style="color:#1A1A1C;font-size:14px;font-weight:700;">${totalLicitacoes}</span>
            </td>
          </tr>` : ''}
          ${totalAlertas > 0 ? `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E8E4DC;">
              <span style="color:#4a4a4d;font-size:14px;">Alertas enviados durante o trial</span>
            </td>
            <td align="right" style="padding:8px 0;border-bottom:1px solid #E8E4DC;">
              <span style="color:#1A1A1C;font-size:14px;font-weight:700;">${totalAlertas}</span>
            </td>
          </tr>` : ''}
          ${valorLabel ? `
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#4a4a4d;font-size:14px;">Volume financeiro monitorado</span>
            </td>
            <td align="right" style="padding:8px 0;">
              <span style="color:#6B0F1A;font-size:15px;font-weight:700;">${valorLabel}</span>
            </td>
          </tr>` : ''}
        </table>
        <p style="color:#9AA0A6;font-size:12px;margin:12px 0 0;line-height:1.6;">
          Amanhã esses alertas param. A partir de então, novos editais publicados não chegarão até você.
        </p>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Plano -->
  <tr><td style="padding:0 28px 28px;">
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
          'Alertas por e-mail, Telegram e WhatsApp',
          'Municípios, estados e órgãos federais',
          'Painel completo com busca, filtros e histórico',
          'Busca de preços ilimitada',
          'Radar de fornecedores e parceiros',
          'Resumo semanal de oportunidades',
          'Cancele quando quiser',
        ].map(item => `
        <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;width:100%;">
          <tr>
            <td style="width:22px;color:#6B0F1A;font-weight:700;font-size:16px;vertical-align:top;padding-top:1px;">✓</td>
            <td style="color:#4a4a4d;font-size:14px;line-height:1.5;">${item}</td>
          </tr>
        </table>`).join('')}
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA duplo -->
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/assinar"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:12px;">
      Continuar recebendo alertas →
    </a>
    <br>
    <a href="${APP_URL}/assinar"
       style="color:#6B0F1A;text-decoration:none;font-size:13px;font-weight:600;">
      Ver todos os planos a partir de R$ 49,90/mês
    </a>
  </td></tr>
    `, email),
  })
}
