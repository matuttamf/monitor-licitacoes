/**
 * E-mail de onboarding para assinantes — "Como se cadastrar como fornecedor"
 *
 * Enviado a assinantes ativos do Monitor de Licitações após ativação da assinatura.
 * Objetivo: transformar quem monitora em quem participa ativamente de licitações.
 *
 * Estrutura:
 *  1. Parabéns + contexto (você já monitora — agora vamos habilitar)
 *  2. Por que o cadastro como fornecedor é obrigatório
 *  3. Passo a passo: SICAF, Certidões, PNCP
 *  4. Dicas de proposta competitiva
 *  5. CTA: acessar o painel para começar a participar
 */

interface ParamsFornecedor {
  nome: string
  email: string
  plano: string   // 'basic' | 'pro' | 'enterprise'
  appUrl?: string
}

export function emailFornecedor(p: ParamsFornecedor) {
  const url     = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const ctaHref = `${url}/dashboard`
  const nomeDisplay = p.nome && p.nome !== 'Prezado(a)' ? p.nome : null
  const subject = nomeDisplay
    ? `${nomeDisplay}, você já monitora — agora vamos habilitar sua empresa para participar`
    : `Você já monitora — agora vamos habilitar sua empresa para participar`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f0ede8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }

  /* Header */
  .header { background: linear-gradient(135deg, #6B0F1A 0%, #8B1525 100%); padding: 28px 40px 22px; }
  .logo-row { display: flex; align-items: center; gap: 12px; }
  .logo-badge { background: #C9A65A; color: #6B0F1A; font-size: 13px; font-weight: 900; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-text { color: #fff; font-size: 15px; font-weight: 700; }
  .logo-sub { color: rgba(255,255,255,0.55); font-size: 11px; margin-top: 1px; }
  .header-badge { margin-top: 16px; display: inline-block; background: rgba(201,166,90,0.2); border: 1px solid #C9A65A; color: #C9A65A; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 99px; letter-spacing: 0.05em; }

  /* Body */
  .body { padding: 36px 40px 28px; }
  h2 { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; line-height: 1.3; }
  h3 { font-size: 14px; font-weight: 800; color: #6B0F1A; text-transform: uppercase; letter-spacing: 0.07em; margin: 28px 0 12px; }
  p { margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: #3a3a3a; }
  strong { color: #1a1a1a; }

  /* Destaque */
  .highlight { background: #fff8e8; border: 1px solid #e8d9b0; border-left: 4px solid #C9A65A; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
  .highlight p { margin: 0; font-size: 14px; color: #78350f; line-height: 1.6; }

  /* Passo a passo */
  .steps { margin: 4px 0 24px; }
  .step { display: flex; gap: 16px; margin-bottom: 18px; align-items: flex-start; }
  .step-icon { background: #6B0F1A; color: #C9A65A; font-size: 13px; font-weight: 900; min-width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .step-body { flex: 1; }
  .step-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
  .step-desc { font-size: 13px; color: #555; line-height: 1.6; margin: 0; }
  .step-link { display: inline-block; margin-top: 6px; font-size: 12px; color: #6B0F1A; font-weight: 700; text-decoration: none; }

  /* Lista de documentos */
  .doc-list { margin: 0; padding: 0; list-style: none; }
  .doc-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #444; line-height: 1.5; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
  .doc-list li:last-child { border-bottom: none; }
  .doc-list li::before { content: '✓'; color: #059669; font-weight: 900; margin-top: 1px; flex-shrink: 0; }

  /* Dica box */
  .tip { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
  .tip-title { font-size: 12px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
  .tip p { margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.6; }

  /* Separador */
  .divider { border: none; border-top: 1px solid #f0f0f0; margin: 28px 0; }

  /* CTA */
  .cta-section { background: linear-gradient(135deg, #6B0F1A 0%, #8B1525 100%); border-radius: 12px; padding: 28px 32px; margin: 28px 0; text-align: center; }
  .cta-pre { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 16px; }
  .cta-btn { display: inline-block; background: #C9A65A; color: #6B0F1A !important; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 900; letter-spacing: 0.02em; }
  .cta-sub { color: rgba(255,255,255,0.65); font-size: 12px; margin: 12px 0 0; }

  /* Footer */
  .footer { padding: 20px 40px; border-top: 1px solid #eee; text-align: center; background: #fafafa; }
  .footer p { font-size: 11px; color: #bbb; margin: 0; line-height: 1.8; }
  .footer a { color: #bbb; text-decoration: underline; }

  @media (max-width: 600px) {
    .body, .header, .footer { padding-left: 22px !important; padding-right: 22px !important; }
    .cta-section { padding: 22px 18px; }
    .cta-btn { padding: 14px 28px !important; font-size: 15px !important; }
  }
</style>
</head>
<body>
<div class="wrap">

  <!-- Header -->
  <div class="header">
    <div class="logo-row">
      <div class="logo-badge">ML</div>
      <div>
        <div class="logo-text">Monitor de Licitações</div>
        <div class="logo-sub">Inteligência em licitações públicas</div>
      </div>
    </div>
    <div class="header-badge">📋 Guia do Fornecedor Público</div>
  </div>

  <!-- Body -->
  <div class="body">

    <h2>Olá, <strong>${p.nome}</strong> —</h2>
    <p>Parabéns por assinar o Monitor de Licitações. Agora você vai receber alertas de editais antes da concorrência.</p>
    <p>Mas monitorar é só a metade do caminho. <strong>Para participar de licitações e enviar propostas, sua empresa precisa estar habilitada como fornecedora do governo.</strong> Preparamos este guia para que você não perca nenhuma oportunidade por falta de cadastro.</p>

    <div class="highlight">
      <p>💡 <strong>Por que isso importa:</strong> de nada adianta receber o alerta de um edital se, na hora de enviar a proposta, a empresa não tem habilitação. O cadastro é feito uma única vez e abre todas as portas — federal, estadual e municipal.</p>
    </div>

    <!-- PASSO 1: SICAF -->
    <h3>Passo 1 — Cadastro no SICAF (obrigatório para órgãos federais)</h3>
    <div class="steps">
      <div class="step">
        <div class="step-icon">1</div>
        <div class="step-body">
          <div class="step-title">Acesse o portal ComprasGov.br</div>
          <p class="step-desc">O SICAF (Sistema de Cadastramento Unificado de Fornecedores) é o registro federal obrigatório para participar de licitações de órgãos da União. O cadastro é gratuito e feito online.</p>
          <a href="https://www.gov.br/compras/pt-br/fornecedor/fornecedores/sicaf" class="step-link" target="_blank">→ Acessar portal do SICAF</a>
        </div>
      </div>
    </div>

    <p style="font-size:14px;font-weight:700;color:#333;margin-bottom:8px;">Documentos necessários para o SICAF:</p>
    <ul class="doc-list">
      <li><span>CNPJ ativo na Receita Federal (situação regular)</span></li>
      <li><span>Certidão Negativa de Débitos Federais (CND ou CPEND)</span></li>
      <li><span>Certidão de regularidade do FGTS (CRF)</span></li>
      <li><span>Certidão Negativa de Débitos Trabalhistas (CNDT)</span></li>
      <li><span>Certidão Negativa Estadual e Municipal (da sede da empresa)</span></li>
      <li><span>Balanço patrimonial ou declaração de microempresa (ME/EPP)</span></li>
      <li><span>Ato constitutivo (contrato social ou estatuto atualizado)</span></li>
    </ul>

    <div class="tip">
      <div class="tip-title">💡 Dica para ME e EPP</div>
      <p>Microempresas e empresas de pequeno porte têm tratamento diferenciado na Lei 14.133/2021: podem apresentar certidões com restrição e regularizá-las no prazo de 5 dias úteis após a declaração de vencedor. <strong>Não deixe de participar por causa de uma certidão pendente.</strong></p>
    </div>

    <hr class="divider">

    <!-- PASSO 2: PNCP -->
    <h3>Passo 2 — Credenciamento no PNCP</h3>
    <div class="steps">
      <div class="step">
        <div class="step-icon">2</div>
        <div class="step-body">
          <div class="step-title">Portal Nacional de Contratações Públicas</div>
          <p class="step-desc">O PNCP é a plataforma central da nova Lei de Licitações (14.133/2021). Todos os órgãos públicos federais, estaduais e municipais devem publicar licitações lá. Ter um perfil ativo facilita o acompanhamento e o envio de propostas eletrônicas.</p>
          <a href="https://www.pncp.gov.br/app/fornecedor" class="step-link" target="_blank">→ Credenciar no PNCP</a>
        </div>
      </div>
    </div>

    <hr class="divider">

    <!-- PASSO 3: Portais estaduais e municipais -->
    <h3>Passo 3 — Portais estaduais e de compras eletrônicas</h3>
    <p style="font-size:14px;color:#555;margin-bottom:14px;">Além do SICAF/PNCP federal, muitos estados e municípios usam portais próprios. Os mais usados no Brasil:</p>
    <div class="steps">
      <div class="step">
        <div class="step-icon">BLL</div>
        <div class="step-body">
          <div class="step-title">BLL Compras — ampla presença em municípios do Sul e Sudeste</div>
          <a href="https://bll.org.br/fornecedor" class="step-link" target="_blank">→ Cadastrar na BLL</a>
        </div>
      </div>
      <div class="step">
        <div class="step-icon">CE</div>
        <div class="step-body">
          <div class="step-title">ComprasNet / Licitações-e (Banco do Brasil)</div>
          <a href="https://www.licitacoes-e.com.br" class="step-link" target="_blank">→ Cadastrar no Licitações-e</a>
        </div>
      </div>
    </div>

    <div class="tip">
      <div class="tip-title">📌 Onde estão as licitações que você monitoramos</div>
      <p>O Monitor de Licitações já monitora PNCP, ComprasNet, BLL, Licitações-e e Diários Oficiais. Basta você estar cadastrado no portal onde o edital foi publicado para poder enviar proposta.</p>
    </div>

    <hr class="divider">

    <!-- DICAS DE PROPOSTA -->
    <h3>Como fazer uma proposta competitiva</h3>
    <div class="steps">
      <div class="step">
        <div class="step-icon">📄</div>
        <div class="step-body">
          <div class="step-title">Leia o edital completo antes de tudo</div>
          <p class="step-desc">Cada edital tem exigências específicas de habilitação, prazo, formato de proposta e critério de julgamento. Leia tudo — principalmente o Termo de Referência ou Projeto Básico.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-icon">💰</div>
        <div class="step-body">
          <div class="step-title">Pesquise o valor estimado antes de precificar</div>
          <p class="step-desc">O valor estimado pelo órgão é público. Use como referência, mas lembre que a proposta mais baixa nem sempre é a vencedora — critérios de qualificação técnica também valem.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-icon">✅</div>
        <div class="step-body">
          <div class="step-title">Certidões devem estar em dia no momento da sessão</div>
          <p class="step-desc">As certidões (FGTS, Receita, Trabalhista) são verificadas no momento da fase de habilitação — não no cadastro. Mantenha-as atualizadas e renove com antecedência.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-icon">🤝</div>
        <div class="step-body">
          <div class="step-title">Consórcio e subcontratação são opções</div>
          <p class="step-desc">Se o contrato exige capacidade técnica ou porte que sua empresa ainda não tem sozinha, verifique se o edital permite consórcio — é uma forma legal de participar em parceria com outra empresa.</p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="cta-section">
      <p class="cta-pre">Com a habilitação em dia, cada alerta do Monitor vira uma oportunidade real de proposta.</p>
      <a href="${ctaHref}" class="cta-btn">Acessar meu painel de licitações →</a>
      <p class="cta-sub">Seu plano <strong>${p.plano}</strong> está ativo · Configure alertas por palavras-chave</p>
    </div>

    <p style="font-size:13px;color:#888;margin-top:0;">Dúvidas sobre como participar de uma licitação específica? Responda este e-mail — nossa equipe tem experiência no processo e pode te orientar.</p>

  </div>

  <!-- Footer -->
  <div class="footer">
    <p>
      <strong>Monitor de Licitações</strong> · Matutta Soluções Digitais<br>
      Você recebeu este e-mail porque é assinante ativo do plano <strong>${p.plano}</strong>.<br>
      Acesse seu painel em <a href="${url}/dashboard">${url.replace('https://', '')}/dashboard</a>
    </p>
  </div>

</div>
</body>
</html>`

  const text = `Olá, ${p.nome} —

Parabéns por assinar o Monitor de Licitações. Agora você vai receber alertas de editais antes da concorrência.

Mas monitorar é só a metade do caminho. Para PARTICIPAR de licitações e enviar propostas, sua empresa precisa estar habilitada como fornecedora do governo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 1 — SICAF (obrigatório para órgãos federais)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Acesse: https://www.gov.br/compras/pt-br/fornecedor/fornecedores/sicaf

Documentos necessários:
✓ CNPJ ativo na Receita Federal
✓ Certidão Negativa de Débitos Federais (CND/CPEND)
✓ Certidão de regularidade do FGTS (CRF)
✓ Certidão Negativa de Débitos Trabalhistas (CNDT)
✓ Certidão Negativa Estadual e Municipal
✓ Balanço patrimonial ou declaração ME/EPP
✓ Contrato social atualizado

DICA: ME e EPP podem apresentar certidões com restrição e regularizá-las em até 5 dias úteis após ser declarada vencedora.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 2 — PNCP (nova Lei de Licitações)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Acesse: https://www.pncp.gov.br/app/fornecedor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSO 3 — Portais estaduais e municipais
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BLL Compras: https://bll.org.br/fornecedor
Licitações-e: https://www.licitacoes-e.com.br

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMO FAZER UMA PROPOSTA COMPETITIVA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Leia o edital completo, especialmente o Termo de Referência
2. Pesquise o valor estimado antes de precificar
3. Mantenha certidões em dia até a sessão (não só no cadastro)
4. Verifique se o edital permite consórcio para contratos maiores

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ ACESSAR MEU PAINEL:
${ctaHref}

Seu plano ${p.plano} está ativo. Configure suas palavras-chave e comece a receber alertas.

Dúvidas? Responda este e-mail — nossa equipe pode orientar.

--
Monitor de Licitações · Matutta Soluções Digitais
${url}`

  return { subject, html, text }
}
