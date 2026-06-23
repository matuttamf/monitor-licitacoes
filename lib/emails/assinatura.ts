import { Resend } from 'resend'
import { trackResend } from '@/lib/uso-apis'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
const FROM = process.env.EMAIL_REMETENTE || 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function fmtValor(v?: number): string {
  if (!v) return '—'
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}B`
  if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (v >= 1_000)         return `R$ ${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

function baseEmail(conteudo: string): string {
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
      Monitor de Licitações · Matutta<br>
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

// ── Pós-assinatura Dia 1: Configuração ────────────────────────────────────────
export async function enviarEmailPosAssinaturaDia1(email: string, plano: string): Promise<void> {
  const resend = getResend()
  trackResend()

  const nomePlano = plano === 'basico' ? 'Básico'
    : plano === 'profissional' ? 'Profissional'
    : plano === 'empresarial' ? 'Empresarial'
    : plano

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Plano ${nomePlano} ativo — o primeiro alerta chega assim que você configurar`,
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Plano ${nomePlano} · Ativo</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Seu plano está ativo.<br>
      <span style="color:#6B0F1A;font-style:italic;">O que falta agora é dizer o que monitorar.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Assim que você cadastrar suas palavras-chave, o monitor começa a rastrear editais e envia o primeiro alerta assim que aparecer algo relevante. Todo o sistema já está pronto — falta só a sua instrução.
    </p>
  </td></tr>

  <!-- O que cadastrar -->
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:18px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Exemplos do que você pode monitorar</div>
      </td></tr>
      ${[
        ['Construção & Obras', 'reforma predial, pavimentação, elétrica, hidráulica, alvenaria'],
        ['Limpeza & Conservação', 'limpeza predial, zeladoria, jardinagem, dedetização'],
        ['Tecnologia & Software', 'suporte técnico, licença software, infraestrutura TI, cabeamento'],
        ['Vigilância & Segurança', 'vigilância armada, monitoramento eletrônico, controle de acesso'],
        ['Saúde & Hospitalar', 'material hospitalar, medicamentos, equipamentos médicos, EPIs'],
        ['Transporte & Logística', 'frete, transporte escolar, locação veículos, manutenção frota'],
        ['Alimentação', 'merenda escolar, refeição coletiva, gêneros alimentícios, copa'],
        ['Serviços Administrativos', 'impressão, gráfica, material de escritório, limpeza de documentos'],
      ].map(([seg, exemplos]) => `
      <tr><td style="padding:0 24px 14px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:600;margin-bottom:2px;">${seg}</div>
        <div style="color:#9AA0A6;font-size:12px;line-height:1.5;">${exemplos}</div>
      </td></tr>`).join('')}
      <tr><td style="padding:0 24px 18px;">
        <p style="color:#4a4a4d;font-size:13px;margin:0;line-height:1.6;border-top:1px solid #E8E4DC;padding-top:14px;">
          Use os termos exatos que os órgãos usam nos editais — não nomes de produtos ou marcas. Você pode adicionar, editar ou remover palavras-chave a qualquer momento.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/palavras-chave"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Cadastrar palavras-chave →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:16px 0 0;">Leva menos de 2 minutos · Pode editar quando quiser</p>
  </td></tr>
    `),
  })
}

// ── Pós-assinatura Dia 7: Primeira semana ─────────────────────────────────────
export async function enviarEmailPosAssinaturaDia7(
  email: string,
  totalAlertas: number,
  totalLicitacoes: number,
  valorTotal?: number,
  maiorOportunidade?: { objeto: string; valor: number; orgao?: string },
): Promise<void> {
  const resend = getResend()
  trackResend()

  const temDados   = totalAlertas > 0 || totalLicitacoes > 0
  const temValor   = valorTotal && valorTotal > 0
  const valorLabel = temValor ? fmtValor(valorTotal) : null

  const subject = temDados
    ? valorLabel
      ? `Primeira semana — ${valorLabel} em oportunidades rastreadas para você`
      : `Primeira semana — ${totalAlertas} alertas, ${totalLicitacoes} licitações monitoradas`
    : 'Primeira semana ativa — seu monitoramento em ritmo pleno'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Resumo da primeira semana</div>
    ${temDados ? `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${valorLabel
        ? `<span style="color:#6B0F1A;font-style:italic;">${valorLabel}</span><br>rastreados enquanto você cuidava da empresa.`
        : `<span style="color:#6B0F1A;font-style:italic;">${totalLicitacoes} licitações</span><br>monitoradas na primeira semana.`
      }
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Esses ${totalLicitacoes} editais foram publicados por municípios, estados e órgãos federais em todo o país. Você recebeu ${totalAlertas} alertas com as oportunidades mais relevantes para o seu perfil — sem precisar abrir nenhum portal manualmente.
    </p>
    ` : `
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Primeira semana ativa.<br>
      <span style="color:#6B0F1A;font-style:italic;">Seu monitoramento está em ritmo pleno.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      O sistema já rastreou centenas de editais publicados no Brasil nesta semana. Configure mais palavras-chave para ampliar sua cobertura e aumentar as chances de encontrar novas oportunidades.
    </p>
    `}
  </td></tr>

  ${temDados ? `
  <!-- Métricas da semana -->
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:24px;text-align:center;width:50%;border-right:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:30px;font-weight:700;">${totalAlertas}</div>
          <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:6px;">alertas enviados<br>na primeira semana</div>
        </td>
        <td style="padding:24px;text-align:center;width:50%;">
          <div style="color:#C9A65A;font-size:30px;font-weight:700;">${totalLicitacoes}</div>
          <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:6px;">licitações<br>monitoradas para você</div>
        </td>
      </tr>
      ${valorLabel ? `
      <tr>
        <td colspan="2" style="padding:16px 24px 20px;text-align:center;border-top:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:26px;font-weight:700;">${valorLabel}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;">volume financeiro total monitorado</div>
        </td>
      </tr>` : ''}
    </table>
  </td></tr>
  ` : ''}

  ${maiorOportunidade ? `
  <!-- Maior oportunidade -->
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

  <!-- Próximo passo: Telegram -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:18px 24px;">
        <div style="color:#1A1A1C;font-size:14px;font-weight:700;margin-bottom:8px;">Receba alertas em tempo real no Telegram</div>
        <p style="color:#4a4a4d;font-size:13px;line-height:1.6;margin:0 0 14px;">
          Além do e-mail, você pode ativar o canal de alertas no Telegram e receber oportunidades assim que são publicadas — direto no celular, sem precisar abrir o painel.
        </p>
        <a href="${APP_URL}/alertas"
           style="display:inline-block;background:white;border:1.5px solid #6B0F1A;color:#6B0F1A;text-decoration:none;padding:10px 22px;border-radius:10px;font-weight:700;font-size:13px;">
          Ativar alertas Telegram →
        </a>
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/alertas"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Ver todos os alertas →
    </a>
  </td></tr>
    `),
  })
}

// ── Pós-assinatura Dia 30: Um mês ─────────────────────────────────────────────
export async function enviarEmailPosAssinaturaDia30(
  email: string,
  plano: string,
  totalAlertas: number,
  totalLicitacoes: number,
  volumeMonitorado: number,
): Promise<void> {
  const resend = getResend()
  trackResend()

  const nomePlano = plano === 'basico' ? 'Básico'
    : plano === 'profissional' ? 'Profissional'
    : plano === 'empresarial' ? 'Empresarial'
    : plano

  const isBasico = plano === 'basico'
  const volumeLabel = fmtValor(volumeMonitorado)
  const temDados = totalLicitacoes > 0

  const subject = temDados
    ? `30 dias de Monitor — ${fmtValor(volumeMonitorado)} em oportunidades rastreadas para você`
    : `Monitor completa 30 dias ativo — seu histórico de monitoramento`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: baseEmail(`
  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">30 dias · Plano ${nomePlano}</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      Um mês de monitoramento.<br>
      <span style="color:#6B0F1A;font-style:italic;">Veja o que foi feito por você.</span>
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Enquanto você tocava a empresa, o Monitor rastreou ${temDados ? `${totalLicitacoes} editais publicados em portais de compras públicas em todo o Brasil` : 'editais publicados em centenas de portais públicos em todo o Brasil'}. ${totalAlertas > 0 ? `Você recebeu ${totalAlertas} alertas com as oportunidades mais relevantes para o seu perfil — sem abrir nenhum portal manualmente.` : 'Seu rastreamento está ativo e cobrindo centenas de fontes automaticamente.'}
    </p>
  </td></tr>

  <!-- Métricas dos 30 dias -->
  ${temDados ? `
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:20px 16px;text-align:center;width:33%;border-right:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:22px;font-weight:700;">${totalAlertas}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:4px;">alertas<br>enviados</div>
        </td>
        <td style="padding:20px 16px;text-align:center;width:33%;border-right:1px solid rgba(255,255,255,0.1);">
          <div style="color:#C9A65A;font-size:22px;font-weight:700;">${totalLicitacoes}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:4px;">licitações<br>monitoradas</div>
        </td>
        <td style="padding:20px 16px;text-align:center;width:33%;">
          <div style="color:#C9A65A;font-size:22px;font-weight:700;">${volumeLabel}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:4px;">volume<br>monitorado</div>
        </td>
      </tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- Trabalho invisível -->
  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:18px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">O que rodou por baixo dos panos</div>
      </td></tr>
      ${[
        ['346+ portais monitorados', 'Prefeituras, estados, hospitais, autarquias e órgãos federais — sem precisar checar um por um'],
        ['Coleta automática diária', 'O sistema busca novos editais todo dia, de segunda a sábado, automaticamente'],
        ['Matching com suas palavras', 'Cada edital encontrado é comparado ao que você definiu — só os relevantes chegam até você'],
        ['Alertas com contexto', 'Objeto, órgão, valor estimado, prazo e link direto para o edital — tudo em um só lugar'],
      ].map(([t, d]) => `
      <tr><td style="padding:0 24px 14px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:8px;height:8px;background:#C9A65A;border-radius:50%;vertical-align:top;padding-top:5px;"></td>
            <td style="padding-left:10px;">
              <div style="color:#1A1A1C;font-size:13px;font-weight:600;margin-bottom:2px;">${t}</div>
              <div style="color:#9AA0A6;font-size:12px;line-height:1.5;">${d}</div>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>
  </td></tr>

  ${isBasico ? `
  <!-- Upgrade para Profissional -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #C9A65A;border-radius:14px;overflow:hidden;">
      <tr><td style="background:#FAF6F0;padding:20px 24px;">
        <div style="color:#1A1A1C;font-size:14px;font-weight:700;margin-bottom:6px;">Ampliar seu monitoramento</div>
        <p style="color:#4a4a4d;font-size:13px;line-height:1.6;margin:0 0 12px;">
          No Plano Profissional você tem palavras-chave ilimitadas — o que significa rastrear mais segmentos, mais especificidades, e pegar oportunidades que o plano atual não cobre.
        </p>
        <a href="${APP_URL}/assinar"
           style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:10px 24px;border-radius:10px;font-weight:700;font-size:13px;">
          Ver Plano Profissional →
        </a>
      </td></tr>
    </table>
  </td></tr>
  ` : ''}

  <!-- CTA -->
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;">
      Acessar o painel →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:14px 0 0;">
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;font-weight:600;text-decoration:none;">Fale no WhatsApp</a>
    </p>
  </td></tr>
    `),
  })
}
