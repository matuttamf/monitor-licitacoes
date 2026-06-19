const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://monitordelicitacoes.com.br'

const NOMES_PLANO: Record<string, string> = {
  basic:        'Basic',
  profissional: 'Profissional',
  gestao:       'Gestão',
  pro:          'Gestão',
  empresarial:  'Empresarial',
}

interface ParamsConfirmacao {
  nome?: string
  email: string
  plano: string
  valor: number
  periodo?: 'mensal' | 'anual'
  appUrl?: string
}

export function emailConfirmacaoAssinatura(p: ParamsConfirmacao) {
  const nome  = p.nome ? p.nome.split(' ')[0] : 'olá'
  const plano = NOMES_PLANO[p.plano] ?? p.plano
  const url   = (p.appUrl ?? APP_URL).replace(/\/$/, '')
  const valor = p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const subject = `✅ Assinatura ativa — Bem-vindo ao plano ${plano}!`

  const html = `<!DOCTYPE html>
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
          <span style="color:white;font-weight:600;font-size:15px;">Monitor de Licitações</span><br>
          <span style="color:rgba(255,255,255,0.45);font-size:12px;">Confirmação de Assinatura</span>
        </td>
        <td align="right">
          <span style="background:rgba(201,166,90,0.15);border:1px solid rgba(201,166,90,0.3);border-radius:99px;padding:4px 12px;color:#C9A65A;font-size:11px;font-weight:700;">✓ ATIVA</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Linha dourada -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  <!-- Hero -->
  <tr><td style="padding:32px 28px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Assinatura confirmada</div>
    <h1 style="color:#1A1A1C;font-size:26px;font-weight:400;margin:0 0 12px;font-family:Georgia,serif;line-height:1.3;">
      ${nome}, seu plano <span style="color:#6B0F1A;font-style:italic;">${plano}</span><br>está ativo agora!
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Obrigado por assinar o Monitor de Licitações. Seu acesso está liberado e você já pode monitorar licitações em todo o Brasil.
    </p>
  </td></tr>

  <!-- Detalhes da assinatura -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:16px 24px 0;">
        <div style="color:#9AA0A6;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Resumo da assinatura</div>
      </td></tr>
      ${[
        ['Plano', plano],
        [p.periodo === 'anual' ? 'Cobrança anual' : 'Cobrança mensal', p.periodo === 'anual' ? `${valor}/ano` : `${valor}/mês`],
        ['Status', '✓ Ativo'],
      ].map(([label, valor]) => `
      <tr><td style="padding:10px 24px;border-bottom:1px solid #E8E4DC;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#9AA0A6;font-size:13px;">${label}</td>
            <td align="right" style="color:#1A1A1C;font-size:13px;font-weight:600;">${valor}</td>
          </tr>
        </table>
      </td></tr>`).join('')}
      <tr><td style="height:8px;"></td></tr>
    </table>
  </td></tr>

  <!-- Primeiros passos -->
  <tr><td style="padding:0 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;">
      <tr><td style="padding:20px 24px 12px;">
        <div style="color:#1A1A1C;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px;">Primeiros passos</div>
      </td></tr>
      ${[
        ['Configure suas palavras-chave', 'Quanto mais específicas, melhores os alertas para o seu negócio.'],
        ['Ative o Telegram', 'Receba notificações instantâneas no celular, além do e-mail.'],
        ['Explore o painel', 'Busque editais, veja o histórico e personalize seus filtros.'],
      ].map(([titulo, desc], i) => `
      <tr><td style="padding:0 24px 16px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:28px;height:28px;background:#6B0F1A;border-radius:50%;text-align:center;vertical-align:middle;color:#C9A65A;font-weight:700;font-size:13px;" valign="middle">${i + 1}</td>
            <td style="padding-left:14px;vertical-align:top;">
              <div style="color:#1A1A1C;font-size:14px;font-weight:600;margin-bottom:2px;">${titulo}</div>
              <div style="color:#9AA0A6;font-size:13px;line-height:1.5;">${desc}</div>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 28px 40px;" align="center">
    <a href="${url}/dashboard"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
      Acessar meu painel →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:16px 0 0;">
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">Fale pelo WhatsApp</a>
    </p>
  </td></tr>

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

  const text = `${nome}, sua assinatura está ativa!

Plano: ${plano}
Cobrança: ${valor}/mês
Status: Ativo ✓

Acesse seu painel: ${url}/dashboard

Primeiros passos:
- Configure suas palavras-chave
- Ative o Telegram para notificações instantâneas
- Explore o painel e personalize seus filtros

Dúvidas? WhatsApp +55 31 99831-7066

--
Monitor de Licitações · Matutta Soluções Digitais`

  return { subject, html, text }
}
