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

  <!-- Linha dourada decorativa -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  ${conteudo}

  <!-- Footer -->
  <tr><td style="padding:20px 28px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a><br>
      <a href="${APP_URL}/perfil" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Gerenciar preferências de e-mail</a>
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

function saudacao(nome: string | null): string {
  return nome ? `Olá, ${nome}!` : 'Olá!'
}

// ── Perfil incompleto (D+1) ───────────────────────────────────────────────────

export async function enviarEmailPerfilIncompleto(email: string, nome: string | null): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Seu perfil está incompleto — leva 2 minutos',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Perfil · Ação necessária</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Seu perfil está incompleto.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Perfis completos recebem alertas mais certeiros — e aparecem no Diretório de Fornecedores,
      onde outras empresas que precisam dos seus serviços e produtos podem te encontrar.
    </p>
    <a href="${APP_URL}/perfil"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Completar perfil agora →
    </a>
    <p style="color:#9AA0A6;font-size:13px;margin:20px 0 0;line-height:1.6;">Leva menos de 2 minutos.</p>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;">
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td>
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:10px;">Por que completar o perfil?</div>
        <div style="font-size:13px;color:#6B7280;line-height:1.9;">
          ✅ Alertas mais precisos para o seu segmento<br>
          ✅ Visibilidade no Diretório de Fornecedores<br>
          ✅ Ser encontrado por empresas que buscam parceiros e subcontratados
        </div>
      </td></tr>
    </table>
  </td></tr>
    `),
  })
}

// ── Sem palavras-chave — sequência de 6 (D+0.5 até D+5) ──────────────────────

const COPIES_KEYWORDS: Record<number, { subject: string; titulo: string; corpo: string }> = {
  12: {
    subject: 'Configure suas palavras-chave para começar a receber alertas',
    titulo:  'Sua conta está ativa — falta só um passo.',
    corpo: `
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Para o Monitor buscar licitações para você, é preciso configurar ao menos uma palavra-chave
        relacionada ao seu segmento.
      </p>
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Exemplos: <em>"equipamentos hospitalares"</em>, <em>"serviços de TI"</em>, <em>"limpeza urbana"</em>.
      </p>
    `,
  },
  24: {
    subject: '1 dia de conta ativa — seus alertas ainda não começaram',
    titulo:  '1 dia de conta ativa, mas nenhum alerta ainda.',
    corpo: `
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Configure suas palavras-chave e começa a receber em breve — o Monitor
        monitora centenas de fontes por dia para você.
      </p>
    `,
  },
  48: {
    subject: 'Que tipo de licitação sua empresa busca?',
    titulo:  'Uma pergunta rápida.',
    corpo: `
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Que tipo de licitação sua empresa buscaria?
      </p>
      <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
        <tr>
          <td style="background:#FAF6F0;border-radius:10px;padding:12px;text-align:center;font-size:13px;color:#4a4a4d;">
            🛒 Equipamentos
          </td>
          <td style="width:8px;"></td>
          <td style="background:#FAF6F0;border-radius:10px;padding:12px;text-align:center;font-size:13px;color:#4a4a4d;">
            🏗️ Obras e reformas
          </td>
          <td style="width:8px;"></td>
          <td style="background:#FAF6F0;border-radius:10px;padding:12px;text-align:center;font-size:13px;color:#4a4a4d;">
            💻 Serviços de TI
          </td>
        </tr>
      </table>
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Qualquer que seja o segmento, configure em 1 minuto e receba as oportunidades certas para você.
      </p>
    `,
  },
  72: {
    subject: '3 dias sem alertas — veja como configurar em 1 minuto',
    titulo:  '3 dias sem alertas.',
    corpo: `
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
        O Monitor já rastreou licitações para empresas de diferentes segmentos nestes 3 dias.
        Configure suas palavras-chave agora para começar a receber.
      </p>
    `,
  },
  96: {
    subject: 'Ainda dá tempo de ativar os alertas',
    titulo:  'Quatro dias. Ainda dá tempo.',
    corpo: `
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Se sua empresa participa de processos licitatórios, o Monitor vai encontrar oportunidades para você —
        é só configurar uma palavra-chave do seu segmento.
      </p>
    `,
  },
  120: {
    subject: 'Último lembrete: suas palavras-chave',
    titulo:  'Último lembrete.',
    corpo: `
      <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Se tiver interesse em monitorar licitações, configure suas palavras-chave agora.
        O Monitor continuará disponível na sua conta.
      </p>
    `,
  },
}

export async function enviarEmailSemKeywords(
  email: string,
  nome: string | null,
  intervaloHoras: 12 | 24 | 48 | 72 | 96 | 120,
): Promise<void> {
  const resend = getResend()
  const copy = COPIES_KEYWORDS[intervaloHoras]

  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: copy.subject,
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Palavras-chave · Ação necessária</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 16px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} ${copy.titulo}
    </h1>
    ${copy.corpo}
    <a href="${APP_URL}/palavras-chave"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Configurar palavras-chave →
    </a>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;line-height:1.7;">
      Você tem até 20 palavras-chave disponíveis no plano atual.
    </p>
  </td></tr>
    `),
  })
}

// ── Poucas palavras-chave (D+2) ───────────────────────────────────────────────

export async function enviarEmailPoucasKeywords(
  email: string,
  nome: string | null,
  keywordsAtuais: string[],
  sugestoes: string[],
  limiteDoPlano: number,
): Promise<void> {
  const resend = getResend()
  const listaAtual = keywordsAtuais
    .map(t => `<span style="display:inline-block;background:#E8E4DC;border-radius:6px;padding:4px 10px;font-size:12px;color:#4a4a4d;margin:2px 4px 2px 0;">${t}</span>`)
    .join('')
  const listaSugestoes = sugestoes
    .map(t => `<span style="display:inline-block;background:#FFF7ED;border:1px solid #FDDCAA;border-radius:6px;padding:4px 10px;font-size:12px;color:#92400E;margin:2px 4px 2px 0;">+ ${t}</span>`)
    .join('')

  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Você tem ${keywordsAtuais.length} palavra${keywordsAtuais.length !== 1 ? 's' : ''}-chave — veja o que está perdendo`,
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Palavras-chave · Mais oportunidades</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Você pode estar perdendo licitações.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Com ${keywordsAtuais.length} palavra${keywordsAtuais.length !== 1 ? 's' : ''}-chave, o Monitor já trabalha por você.
      Mas quanto mais termos você monitorar, mais oportunidades aparecem — e seu plano permite até <strong>${limiteDoPlano}</strong>.
    </p>
    <div style="margin-bottom:20px;">
      <div style="font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Você monitora hoje:</div>
      <div>${listaAtual}</div>
    </div>
    ${sugestoes.length > 0 ? `
    <div style="margin-bottom:28px;">
      <div style="font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Termos relacionados que você pode adicionar:</div>
      <div>${listaSugestoes}</div>
    </div>` : ''}
    <a href="${APP_URL}/palavras-chave"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Adicionar palavras-chave →
    </a>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;">
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td>
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:8px;">Por que mais palavras-chave ajudam?</div>
        <div style="font-size:13px;color:#6B7280;line-height:1.9;">
          ✅ Licitações aparecem com nomenclaturas diferentes em cada órgão<br>
          ✅ Órgãos diferentes descrevem o mesmo serviço de formas variadas<br>
          ✅ Cobrir variações aumenta muito o volume de oportunidades encontradas
        </div>
      </td></tr>
    </table>
  </td></tr>
    `),
  })
}

// ── Fornecedor D+3 ────────────────────────────────────────────────────────────

export async function enviarEmailFornecedorD3(email: string, nome: string | null): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Outras empresas podem te encontrar no Monitor',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Diretório de Fornecedores</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Outras empresas podem te encontrar.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Você sabia que outras empresas usam o Monitor para encontrar fornecedores e parceiros?
    </p>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Empresas com perfil no Diretório são encontradas por quem precisa de subcontratados,
      parceiros ou fornecedores do seu segmento.
    </p>
    <a href="${APP_URL}/fornecedor"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Criar perfil no Diretório →
    </a>
    <p style="color:#9AA0A6;font-size:13px;margin:20px 0 0;line-height:1.6;">Sem custo extra — incluso no seu plano.</p>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;">
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td>
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:10px;">O que você ganha com o Diretório?</div>
        <div style="font-size:13px;color:#6B7280;line-height:1.9;">
          ✅ Visibilidade para empresas do seu setor<br>
          ✅ Contato de potenciais parceiros e subcontratados<br>
          ✅ Presença no ecossistema de licitações
        </div>
      </td></tr>
    </table>
  </td></tr>
    `),
  })
}

// ── Telegram D+5 ─────────────────────────────────────────────────────────────

export async function enviarEmailTelegramD5(email: string, nome: string | null): Promise<void> {
  const resend = getResend()
  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Ative os alertas no Telegram — sem custo extra',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Telegram · Alertas em tempo real</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Receba alertas direto no Telegram.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Sem custo extra — já incluso no seu plano. Quando uma licitação for encontrada,
      você recebe uma notificação instantânea, mesmo fora do painel.
    </p>
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;margin-bottom:24px;">
      <tr><td>
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:12px;">Como ativar em 3 passos:</div>
        <div style="font-size:13px;color:#4a4a4d;line-height:2.0;">
          <strong>1.</strong> Abra o Telegram e busque <strong>@MonitorLicitacoesBot</strong><br>
          <strong>2.</strong> Envie <code style="background:#E8E4DC;padding:2px 6px;border-radius:4px;">/start</code><br>
          <strong>3.</strong> Cole o código que aparece no seu painel
        </div>
      </td></tr>
    </table>
    <a href="${APP_URL}/perfil"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Ver código de ativação →
    </a>
  </td></tr>
  <tr><td style="padding:16px 28px 32px;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;line-height:1.7;">
      O código está disponível na aba Telegram do seu perfil.
    </p>
  </td></tr>
    `),
  })
}

// ── Convite para compartilhar (trial D+3) ────────────────────────────────────

export async function enviarEmailConvite(
  email: string,
  nome: string | null,
  codigoIndicacao: string,
): Promise<void> {
  const resend = getResend()
  const appUrl = APP_URL
  const linkConvite = `${appUrl}/r/${codigoIndicacao}`

  trackResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Seus parceiros sabem das licitações do setor?',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Compartilhe com quem importa</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 16px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Seus parceiros estão por dentro?
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Você já está monitorando licitações do seu setor. Mas e os seus parceiros, fornecedores e clientes?
      Quem não acompanha perde oportunidades — às vezes sem nem saber que existiam.
    </p>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Se conhece alguém que fornece para o governo ou quer entrar nesse mercado, vale compartilhar.
    </p>
    <a href="${linkConvite}"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Compartilhar o Monitor →
    </a>
  </td></tr>
  <tr><td style="padding:28px 28px 32px;">
    <table width="100%" cellpadding="18" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td>
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:10px;">Quem costuma se beneficiar:</div>
        <div style="font-size:13px;color:#6B7280;line-height:2.0;">
          🏗️ Fornecedores de equipamentos, materiais e serviços<br>
          💼 Consultores e assessores de licitações<br>
          🤝 Parceiros e subcontratados do seu setor<br>
          📋 Empresas que querem entrar no mercado público
        </div>
      </td></tr>
    </table>
  </td></tr>
    `),
  })
}

// ── Proof of value (D+0, 2h) — para quem já tem keywords ────────────────────

export async function enviarEmail2h(
  email: string,
  nome: string | null,
  totalLicitacoes: number,
  termosPrincipais: string[],
): Promise<void> {
  const resend = getResend()
  trackResend()

  const termoLabel = termosPrincipais.length > 0
    ? termosPrincipais.slice(0, 2).join(' e ')
    : 'seus setores'

  const destaque = totalLicitacoes > 0
    ? `<div style="background:#FFF7ED;border:1px solid #FDDCAA;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:52px;font-weight:900;color:#6B0F1A;line-height:1">${totalLicitacoes}</div>
        <div style="font-size:15px;color:#92400E;font-weight:600;margin-top:6px">
          licitaç${totalLicitacoes !== 1 ? 'ões encontradas' : 'ão encontrada'} para <em>${termoLabel}</em>
        </div>
      </div>`
    : `<div style="background:#FAF6F0;border-radius:14px;padding:20px;margin-bottom:24px;font-size:14px;color:#4a4a4d;line-height:1.7;">
        Estamos coletando os editais mais recentes. Em breve você receberá os primeiros alertas.
      </div>`

  await resend.emails.send({
    from: FROM,
    to:   email,
    subject: totalLicitacoes > 0
      ? `${totalLicitacoes} licitaç${totalLicitacoes !== 1 ? 'ões' : 'ão'} encontrada${totalLicitacoes !== 1 ? 's' : ''} para você`
      : 'Seus alertas já estão configurados',
    html: baseEmail(`
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Primeiras oportunidades</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 16px;font-family:Georgia,serif;line-height:1.3;">
      ${saudacao(nome)} Encontramos oportunidades para você.
    </h1>
    ${destaque}
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
      Ver licitações →
    </a>
  </td></tr>
  <tr><td style="padding:24px 28px 32px;">
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td>
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:10px;">O que você receberá agora em diante:</div>
        <div style="font-size:13px;color:#6B7280;line-height:1.9;">
          📧 Alertas por e-mail com novos editais<br>
          📱 WhatsApp quando surgir algo urgente<br>
          📊 Resumo semanal toda sexta-feira
        </div>
      </td></tr>
    </table>
  </td></tr>
    `),
  })
}
