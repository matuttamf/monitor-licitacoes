interface ParamsConfirmacao {
  nome?: string
  email: string
  plano: string
  valor: number
  appUrl?: string
}

const NOMES_PLANO: Record<string, string> = {
  basic:        'Basic',
  profissional: 'Profissional',
  pro:          'Pro',
  empresarial:  'Empresarial',
}

export function emailConfirmacaoAssinatura(p: ParamsConfirmacao) {
  const nome  = p.nome ? p.nome.split(' ')[0] : 'olá'
  const plano = NOMES_PLANO[p.plano] ?? p.plano
  const url   = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const valor = p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const subject = `✅ Assinatura ativa — Bem-vindo ao Monitor de Licitações!`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#f5f3ef; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.07); }
  .header { background:#6B0F1A; padding:36px 40px 28px; text-align:center; }
  .logo { color:#C9A65A; font-size:22px; font-weight:900; letter-spacing:0.1em; }
  .check { width:56px; height:56px; background:rgba(201,166,90,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:16px auto 0; }
  .body { padding:36px 40px; }
  h1 { margin:0 0 8px; font-size:22px; font-weight:800; color:#1a1a1a; }
  p  { margin:0 0 16px; font-size:15px; line-height:1.65; color:#444; }
  .box { background:#fdf9f0; border:1px solid rgba(201,166,90,0.3); border-radius:12px; padding:20px 24px; margin:24px 0; }
  .box-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(201,166,90,0.15); }
  .box-row:last-child { border-bottom:none; }
  .box-label { font-size:13px; color:#666; }
  .box-value { font-size:13px; font-weight:700; color:#1a1a1a; }
  .cta-wrap { text-align:center; margin:28px 0 16px; }
  .cta { display:inline-block; background:#6B0F1A; color:#fff !important; text-decoration:none; padding:16px 36px; border-radius:50px; font-size:15px; font-weight:700; }
  .tips { background:#f9f9f9; border-radius:12px; padding:20px 24px; margin:16px 0; }
  .tips h3 { margin:0 0 12px; font-size:13px; font-weight:700; color:#6B0F1A; text-transform:uppercase; letter-spacing:0.05em; }
  .tips li { font-size:13px; color:#444; margin-bottom:8px; line-height:1.5; }
  .footer { background:#f9f9f9; padding:20px 40px; border-top:1px solid #eee; text-align:center; }
  .footer p { font-size:12px; color:#aaa; margin:0; line-height:1.6; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">ML</div>
    <div class="check">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A65A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  </div>
  <div class="body">
    <h1>${nome}, sua assinatura está ativa! 🎉</h1>
    <p>
      Obrigado por assinar o Monitor de Licitações. Seu acesso ao plano <strong>${plano}</strong> foi ativado com sucesso e você já pode monitorar licitações em todo o Brasil.
    </p>

    <div class="box">
      <div class="box-row">
        <span class="box-label">Plano</span>
        <span class="box-value">${plano}</span>
      </div>
      <div class="box-row">
        <span class="box-label">Cobrança mensal</span>
        <span class="box-value">${valor}/mês</span>
      </div>
      <div class="box-row">
        <span class="box-label">Status</span>
        <span class="box-value" style="color:#10b981">✓ Ativo</span>
      </div>
    </div>

    <div class="tips">
      <h3>Primeiros passos</h3>
      <ul style="margin:0; padding-left:16px;">
        <li><strong>Configure suas palavras-chave</strong> — quanto mais específicas, melhores os alertas</li>
        <li><strong>Ative o Telegram</strong> — receba notificações instantâneas no seu celular</li>
        <li><strong>Defina sua região</strong> — filtre por estado para focar onde sua empresa atua</li>
      </ul>
    </div>

    <div class="cta-wrap">
      <a href="${url}/dashboard" class="cta">Acessar meu painel →</a>
    </div>

    <p style="font-size:13px; color:#666;">
      Dúvidas? Responda este e-mail ou acesse seu painel. Nossa equipe retorna em até 1 dia útil.
    </p>
  </div>
  <div class="footer">
    <p>Monitor de Licitações · Matutta Soluções Digitais<br>
    E-mail enviado para ${p.email}</p>
  </div>
</div>
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
- Defina sua região de atuação

Dúvidas? Responda este e-mail.

--
Monitor de Licitações · Matutta Soluções Digitais`

  return { subject, html, text }
}
