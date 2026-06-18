interface ParamsReconversao {
  nome?: string
  email: string
  diasExpirado: number
  appUrl?: string
}

export function emailReconversao(p: ParamsReconversao) {
  const nome = p.nome ? p.nome.split(' ')[0] : 'olá'
  const dias = p.diasExpirado
  const url  = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const checkoutUrl = `${url}/assinar?utm_source=reconversao&utm_medium=email&utm_campaign=trial_expirado&utm_content=${dias}d`

  const headline = dias <= 3
    ? `${nome}, seu acesso expirou — mas os editais não param`
    : dias <= 7
    ? `${nome}, enquanto você está fora, seus concorrentes não estão`
    : `${nome}, você sabia que perdeu centenas de editais nos últimos ${dias} dias?`

  const subject = dias <= 3
    ? `Seu acesso expirou — reative agora com desconto`
    : `${nome ?? 'Olá'}, você está perdendo licitações enquanto não está no Monitor`

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
          <span style="color:rgba(255,255,255,0.45);font-size:12px;">Matutta</span>
        </td>
        <td align="right">
          <span style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:99px;padding:4px 12px;color:#fca5a5;font-size:11px;font-weight:700;">⚠ TRIAL EXPIRADO HÁ ${dias} DIA${dias === 1 ? '' : 'S'}</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Linha dourada -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  <!-- Corpo -->
  <tr><td style="padding:40px 40px 0;">
    <h1 style="color:#1A1A1C;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.3;">${headline}</h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Durante seus 7 dias de trial, você viu como funciona: palavras-chave definidas, alertas chegando em tempo real, editais encontrados antes que qualquer concorrente.
    </p>
  </td></tr>

  <!-- Caixa de perda -->
  <tr><td style="padding:0 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f8;border:1px solid rgba(239,68,68,0.2);border-left:4px solid #ef4444;border-radius:0 10px 10px 0;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#7f1d1d;font-size:14px;margin:0;line-height:1.65;">
          📊 <strong style="color:#7f1d1d;">Desde que seu acesso expirou, centenas de novos editais foram publicados no Brasil.</strong>
          Alguns deles eram exatamente o perfil da sua empresa — e foram para outro fornecedor.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 40px 20px;">
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 16px;">
      A pergunta não é se haverá licitações para você. A pergunta é: <strong style="color:#1A1A1C;">quem vai chegar primeiro?</strong>
    </p>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0;">
      Você já fez a parte difícil — aprendeu o sistema, configurou suas palavras-chave. Agora é só <strong style="color:#6B0F1A;">reativar com um clique</strong> e voltar a receber alertas.
    </p>
  </td></tr>

  <!-- Benefícios -->
  <tr><td style="padding:0 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:12px;border:1px solid #E8E4DC;">
      <tr><td style="padding:16px 20px 8px;">
        ${[
          ['Plano Basic a partir de R$ 49,90/mês', 'menos que uma hora de consultoria'],
          ['Monitoramento 24/7', 'de mais de 346 fontes nacionais'],
          ['Alertas por e-mail + Telegram', 'no instante que o edital sai'],
          ['Cancele quando quiser', 'sem multa, sem burocracia'],
        ].map(([titulo, desc]) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
          <tr>
            <td style="width:20px;color:#10b981;font-weight:700;font-size:14px;vertical-align:top;padding-top:2px;">✓</td>
            <td style="font-size:14px;color:#1A1A1C;padding-left:8px;"><strong>${titulo}</strong> — ${desc}</td>
          </tr>
        </table>`).join('')}
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 32px;" align="center">
    <a href="${checkoutUrl}"
       style="display:inline-block;background:#6B0F1A;color:white;text-decoration:none;padding:18px 44px;border-radius:50px;font-size:16px;font-weight:800;letter-spacing:0.02em;">
      Reativar meu acesso agora →
    </a>
    <p style="color:#9AA0A6;font-size:12px;margin:10px 0 0;">Ativação imediata · Cancele quando quiser · Sem contrato</p>
  </td></tr>

  <!-- PS -->
  <tr><td style="padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #C9A65A;">
      <tr><td style="padding:12px 16px;">
        <p style="color:#78350f;font-size:13px;line-height:1.6;margin:0;font-style:italic;">
          P.S.: Empresas que monitoram licitações ativamente ganham em média <strong style="color:#78350f;">3× mais contratos</strong> do que as que buscam manualmente. Cada dia sem monitoramento é um edital que pode ir para o concorrente.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 40px;border-top:1px solid #E8E4DC;">
    <p style="color:#9AA0A6;font-size:12px;margin:0;text-align:center;line-height:1.8;">
      Monitor de Licitações · Matutta<br>
      Dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A;text-decoration:none;font-weight:600;">WhatsApp +55 31 99831-7066</a><br>
      <a href="${url}/perfil" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Gerenciar preferências de e-mail</a>
      &nbsp;·&nbsp;
      <a href="${url}/descadastrar?email=${encodeURIComponent(p.email)}" style="color:#9AA0A6;text-decoration:underline;font-size:11px;">Descadastrar</a>
    </p>
  </td></tr>

  <!-- Barra final -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  const text = `${headline}

Seu trial expirou há ${dias} dia${dias === 1 ? '' : 's'}.

Desde então, centenas de editais foram publicados no Brasil. Alguns eram exatamente o perfil da sua empresa — e foram para outro fornecedor.

Você já fez a parte difícil: aprendeu o sistema e configurou suas palavras-chave. Agora é só reativar:

${checkoutUrl}

Plano Basic a partir de R$ 49,90/mês · Cancele quando quiser

--
Monitor de Licitações · Matutta
Descadastrar: ${url}/descadastrar?email=${encodeURIComponent(p.email)}`

  return { subject, html, text }
}
