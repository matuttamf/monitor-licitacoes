/**
 * E-mail de reconversão — usuários que testaram e não assinaram
 * Gatilhos usados:
 *  - Perda (loss aversion): "você estava a um passo de nunca mais perder um edital"
 *  - Escassez: "seus concorrentes já estão monitorando"
 *  - Identidade: "empresas que participam ativamente de licitações…"
 *  - Reciprocidade: "você já conhece o sistema — não precisa aprender nada novo"
 *  - Urgência real: editais publicados desde que o trial expirou
 *  - Facilidade: "um clique para reativar"
 *  - Social proof: volume de alertas enviados no sistema
 */

interface ParamsReconversao {
  nome?: string
  email: string
  diasExpirado: number    // há quantos dias o trial expirou
  appUrl?: string
}

export function emailReconversao(p: ParamsReconversao) {
  const nome = p.nome ? p.nome.split(' ')[0] : 'olá'
  const dias = p.diasExpirado
  const url = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const checkoutUrl = `${url}/assinar?utm_source=reconversao&utm_medium=email&utm_campaign=trial_expirado&utm_content=${dias}d`

  // Headline muda conforme urgência
  const headline = dias <= 3
    ? `${nome}, seu acesso expirou — mas os editais não param`
    : dias <= 7
    ? `${nome}, enquanto você está fora, seus concorrentes não estão`
    : `${nome}, você sabia que perdeu centenas de editais nos últimos ${dias} dias?`

  const subject = dias <= 3
    ? `Seu trial expirou — reative agora com desconto`
    : `${nome}, você está perdendo licitações enquanto não está no Monitor`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  body { margin:0; padding:0; background:#f5f3ef; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.07); }
  .header { background:#1a1a1c; padding:36px 40px 28px; text-align:center; position:relative; }
  .logo { color:#C9A65A; font-size:22px; font-weight:900; letter-spacing:0.1em; }
  .badge { display:inline-block; background:rgba(239,68,68,0.15); color:#ef4444; font-size:11px; font-weight:700; padding:4px 12px; border-radius:50px; margin-top:10px; letter-spacing:0.05em; border:1px solid rgba(239,68,68,0.3); }
  .body { padding:36px 40px; }
  h1 { margin:0 0 20px; font-size:21px; font-weight:800; color:#1a1a1a; line-height:1.3; }
  p { margin:0 0 16px; font-size:15px; line-height:1.65; color:#444; }
  strong { color:#1a1a1a; }
  .highlight { color:#6B0F1A; font-weight:700; }
  .loss-box { background:#fff8f0; border:1px solid rgba(239,68,68,0.2); border-left:4px solid #ef4444; border-radius:0 10px 10px 0; padding:16px 20px; margin:24px 0; }
  .loss-box p { margin:0; font-size:14px; color:#333; }
  .benefits { margin:20px 0; padding:0; list-style:none; }
  .benefits li { font-size:14px; color:#333; margin-bottom:10px; padding-left:28px; position:relative; line-height:1.5; }
  .benefits li::before { content:'✓'; position:absolute; left:0; color:#10b981; font-weight:700; }
  .cta-wrap { text-align:center; margin:32px 0 8px; }
  .cta { display:inline-block; background:#6B0F1A; color:#fff !important; text-decoration:none; padding:18px 40px; border-radius:50px; font-size:16px; font-weight:800; letter-spacing:0.02em; }
  .sub { font-size:12px; color:#999; text-align:center; margin-top:10px; }
  .ps { font-size:13px; color:#666; font-style:italic; margin-top:24px; padding-top:20px; border-top:1px solid #f0f0f0; }
  .footer { background:#f9f9f9; padding:20px 40px; border-top:1px solid #eee; text-align:center; }
  .footer p { font-size:12px; color:#aaa; margin:0; line-height:1.6; }
  .footer a { color:#aaa; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">ML</div>
    <div class="badge">⚠ TRIAL EXPIRADO HÁ ${dias} DIA${dias === 1 ? '' : 'S'}</div>
  </div>
  <div class="body">
    <h1>${headline}</h1>

    <p>
      Durante seus 7 dias de trial, você viu como funciona: palavras-chave definidas,
      alertas chegando em tempo real, editais encontrados antes que qualquer concorrente.
    </p>

    <div class="loss-box">
      <p>
        📊 <strong>Desde que seu acesso expirou, centenas de novos editais foram publicados no Brasil.</strong>
        Alguns deles eram exatamente o perfil da sua empresa — e foram para outro fornecedor.
      </p>
    </div>

    <p>
      A pergunta não é se haverá licitações para você.
      A pergunta é: <strong>quem vai chegar primeiro?</strong>
    </p>

    <p>
      Você já fez a parte difícil — aprendeu o sistema, configurou suas palavras-chave.
      Agora é só <span class="highlight">reativar com um clique</span> e voltar a receber alertas.
    </p>

    <ul class="benefits">
      <li><strong>Plano Basic a partir de R$ 97/mês</strong> — menos que uma hora de consultoria</li>
      <li><strong>Monitoramento 24/7</strong> de mais de 7 fontes nacionais</li>
      <li><strong>Alertas por e-mail + Telegram</strong> no instante que o edital sai</li>
      <li><strong>Filtragem inteligente</strong> — só os editais relevantes para você</li>
      <li><strong>Cancele quando quiser</strong> — sem multa, sem burocracia</li>
    </ul>

    <div class="cta-wrap">
      <a href="${checkoutUrl}" class="cta">Reativar meu acesso agora →</a>
      <p class="sub">Ativação imediata · Cancele quando quiser · Sem contrato</p>
    </div>

    <p class="ps">
      P.S.: Empresas que monitoram licitações ativamente ganham em média
      <strong>3× mais contratos</strong> do que as que buscam manualmente.
      Cada dia sem monitoramento é um edital que pode ir para o concorrente.
    </p>
  </div>
  <div class="footer">
    <p>
      Monitor de Licitações · Matutta Soluções Digitais<br>
      Este e-mail foi enviado para ${p.email} porque você criou uma conta no Monitor de Licitações.<br>
      <a href="${url}/auth/update-password">Acessar minha conta</a> ·
      <a href="${url}/descadastrar?email=${encodeURIComponent(p.email)}">Descadastrar</a>
    </p>
  </div>
</div>
</body>
</html>`

  const text = `${headline}

Seu trial expirou há ${dias} dia${dias === 1 ? '' : 's'}.

Desde então, centenas de editais foram publicados no Brasil. Alguns eram exatamente o perfil da sua empresa — e foram para outro fornecedor.

Você já fez a parte difícil: aprendeu o sistema e configurou suas palavras-chave. Agora é só reativar:

${checkoutUrl}

Plano Basic a partir de R$ 97/mês · Cancele quando quiser

--
Monitor de Licitações · Matutta Soluções Digitais
Descadastrar: ${url}/descadastrar?email=${encodeURIComponent(p.email)}`

  return { subject, html, text }
}
