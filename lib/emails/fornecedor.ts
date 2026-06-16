interface ParamsFornecedor {
  nome: string
  email: string
  plano: string
  appUrl?: string
}

export function emailFornecedor(p: ParamsFornecedor) {
  const url     = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const ctaHref = `${url}/dashboard`
  const nomeDisplay = p.nome && p.nome !== 'Prezado(a)' ? p.nome : null
  const subject = nomeDisplay
    ? `${nomeDisplay}, você já monitora — agora vamos habilitar sua empresa para participar`
    : `Você já monitora — agora vamos habilitar sua empresa para participar`

  const passos = [
    {
      num: '1',
      titulo: 'Acesse o portal ComprasGov.br',
      desc: 'O SICAF é o registro federal obrigatório para licitações da União. Gratuito e feito online.',
      link: 'https://www.gov.br/compras/pt-br/fornecedor/fornecedores/sicaf',
      linkLabel: '→ Acessar portal do SICAF',
    },
    {
      num: '2',
      titulo: 'Credenciar no PNCP',
      desc: 'O PNCP é a plataforma central da Lei 14.133/2021. Todos os órgãos federais, estaduais e municipais publicam licitações lá.',
      link: 'https://www.pncp.gov.br/app/fornecedor',
      linkLabel: '→ Credenciar no PNCP',
    },
    {
      num: 'BLL',
      titulo: 'BLL Compras — ampla presença em municípios do Sul e Sudeste',
      desc: '',
      link: 'https://bll.org.br/fornecedor',
      linkLabel: '→ Cadastrar na BLL',
    },
    {
      num: 'CE',
      titulo: 'ComprasNet / Licitações-e (Banco do Brasil)',
      desc: '',
      link: 'https://www.licitacoes-e.com.br',
      linkLabel: '→ Cadastrar no Licitações-e',
    },
  ]

  const docs = [
    'CNPJ ativo na Receita Federal (situação regular)',
    'Certidão Negativa de Débitos Federais (CND ou CPEND)',
    'Certidão de regularidade do FGTS (CRF)',
    'Certidão Negativa de Débitos Trabalhistas (CNDT)',
    'Certidão Negativa Estadual e Municipal (da sede da empresa)',
    'Balanço patrimonial ou declaração de microempresa (ME/EPP)',
    'Ato constitutivo (contrato social ou estatuto atualizado)',
  ]

  const dicasProposta = [
    ['📄', 'Leia o edital completo antes de tudo', 'Cada edital tem exigências específicas de habilitação, prazo e formato de proposta. Leia principalmente o Termo de Referência ou Projeto Básico.'],
    ['💰', 'Pesquise o valor estimado antes de precificar', 'O valor estimado pelo órgão é público. Use como referência, mas lembre que a proposta mais baixa nem sempre é vencedora.'],
    ['✅', 'Certidões devem estar em dia no momento da sessão', 'As certidões são verificadas na fase de habilitação — não no cadastro. Mantenha-as atualizadas.'],
    ['🤝', 'Consórcio e subcontratação são opções', 'Se o contrato exige capacidade que sua empresa ainda não tem sozinha, verifique se o edital permite consórcio.'],
  ]

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
          <span style="color:rgba(255,255,255,0.45);font-size:12px;">Guia do Fornecedor Público</span>
        </td>
        <td align="right">
          <span style="background:rgba(201,166,90,0.15);border:1px solid rgba(201,166,90,0.3);border-radius:99px;padding:4px 12px;color:#C9A65A;font-size:11px;font-weight:700;">📋 GUIA</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Linha dourada -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  <!-- Intro -->
  <tr><td style="padding:40px 40px 0;">
    <div style="color:#C9A65A;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Habilitação como fornecedor</div>
    <h1 style="color:#1A1A1C;font-size:24px;font-weight:400;margin:0 0 16px;font-family:Georgia,serif;line-height:1.3;">
      Olá, <strong style="color:#6B0F1A;">${p.nome}</strong> — você já monitora.<br>Agora vamos habilitar para participar.
    </h1>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Parabéns por assinar o Monitor de Licitações. Agora você vai receber alertas de editais antes da concorrência.
    </p>
    <p style="color:#4a4a4d;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Mas monitorar é só a metade do caminho. <strong style="color:#1A1A1C;">Para participar de licitações e enviar propostas, sua empresa precisa estar habilitada como fornecedora do governo.</strong>
    </p>
  </td></tr>

  <!-- Destaque -->
  <tr><td style="padding:0 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e8;border:1px solid #e8d9b0;border-left:4px solid #C9A65A;border-radius:0 12px 12px 0;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#78350f;font-size:14px;margin:0;line-height:1.6;">
          💡 <strong style="color:#78350f;">Por que isso importa:</strong> de nada adianta receber o alerta de um edital se, na hora de enviar a proposta, a empresa não tem habilitação. O cadastro é feito uma única vez e abre todas as portas — federal, estadual e municipal.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Seção SICAF -->
  <tr><td style="padding:0 40px 8px;">
    <div style="color:#6B0F1A;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #E8E4DC;padding-bottom:8px;">Passo 1 — Cadastro no SICAF (obrigatório para órgãos federais)</div>
  </td></tr>

  <tr><td style="padding:16px 40px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;background:#6B0F1A;border-radius:8px;text-align:center;vertical-align:middle;color:#C9A65A;font-weight:900;font-size:13px;" valign="middle">1</td>
        <td style="padding-left:14px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#1A1A1C;margin-bottom:4px;">Acesse o portal ComprasGov.br</div>
          <div style="font-size:13px;color:#555;line-height:1.6;">O SICAF é o registro federal obrigatório para licitações da União. Gratuito e feito online.</div>
          <a href="https://www.gov.br/compras/pt-br/fornecedor/fornecedores/sicaf" style="display:inline-block;margin-top:6px;font-size:12px;color:#6B0F1A;font-weight:700;text-decoration:none;">→ Acessar portal do SICAF</a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Docs SICAF -->
  <tr><td style="padding:0 40px 24px;">
    <p style="font-size:14px;font-weight:700;color:#333;margin:12px 0 8px;">Documentos necessários para o SICAF:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:10px;">
      <tr><td style="padding:12px 16px;">
        ${docs.map(d => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr>
            <td style="width:16px;color:#059669;font-weight:900;font-size:13px;vertical-align:top;padding-top:2px;">✓</td>
            <td style="font-size:13px;color:#444;padding-left:8px;line-height:1.5;">${d}</td>
          </tr>
        </table>`).join('')}
      </td></tr>
    </table>
  </td></tr>

  <!-- Dica ME/EPP -->
  <tr><td style="padding:0 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">💡 Dica para ME e EPP</div>
        <p style="color:#0c4a6e;font-size:13px;margin:0;line-height:1.6;">Microempresas e empresas de pequeno porte têm tratamento diferenciado na Lei 14.133/2021: podem apresentar certidões com restrição e regularizá-las em até 5 dias úteis após a declaração de vencedor. <strong style="color:#0c4a6e;">Não deixe de participar por causa de uma certidão pendente.</strong></p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Seção PNCP -->
  <tr><td style="padding:0 40px 8px;">
    <div style="color:#6B0F1A;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #E8E4DC;padding-bottom:8px;">Passo 2 — Credenciamento no PNCP</div>
  </td></tr>

  <tr><td style="padding:16px 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;background:#6B0F1A;border-radius:8px;text-align:center;vertical-align:middle;color:#C9A65A;font-weight:900;font-size:13px;" valign="middle">2</td>
        <td style="padding-left:14px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#1A1A1C;margin-bottom:4px;">Portal Nacional de Contratações Públicas</div>
          <div style="font-size:13px;color:#555;line-height:1.6;">O PNCP é a plataforma central da nova Lei de Licitações (14.133/2021). Todos os órgãos públicos federais, estaduais e municipais publicam licitações lá.</div>
          <a href="https://www.pncp.gov.br/app/fornecedor" style="display:inline-block;margin-top:6px;font-size:12px;color:#6B0F1A;font-weight:700;text-decoration:none;">→ Credenciar no PNCP</a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Seção portais -->
  <tr><td style="padding:0 40px 8px;">
    <div style="color:#6B0F1A;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #E8E4DC;padding-bottom:8px;">Passo 3 — Portais estaduais e de compras eletrônicas</div>
  </td></tr>

  <tr><td style="padding:16px 40px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="width:36px;height:36px;background:#FAF6F0;border:1px solid #C9A65A;border-radius:8px;text-align:center;vertical-align:middle;color:#6B0F1A;font-weight:900;font-size:11px;" valign="middle">BLL</td>
        <td style="padding-left:14px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#1A1A1C;margin-bottom:4px;">BLL Compras</div>
          <div style="font-size:13px;color:#555;">Ampla presença em municípios do Sul e Sudeste</div>
          <a href="https://bll.org.br/fornecedor" style="display:inline-block;margin-top:4px;font-size:12px;color:#6B0F1A;font-weight:700;text-decoration:none;">→ Cadastrar na BLL</a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;background:#FAF6F0;border:1px solid #C9A65A;border-radius:8px;text-align:center;vertical-align:middle;color:#6B0F1A;font-weight:900;font-size:10px;" valign="middle">CE</td>
        <td style="padding-left:14px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#1A1A1C;margin-bottom:4px;">ComprasNet / Licitações-e (Banco do Brasil)</div>
          <a href="https://www.licitacoes-e.com.br" style="display:inline-block;margin-top:4px;font-size:12px;color:#6B0F1A;font-weight:700;text-decoration:none;">→ Cadastrar no Licitações-e</a>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;">
      <tr><td style="padding:14px 18px;">
        <div style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;">📌 Onde estão as licitações que monitoramos</div>
        <p style="color:#0c4a6e;font-size:13px;margin:0;line-height:1.6;">O Monitor já monitora PNCP, ComprasNet, BLL, Licitações-e e Diários Oficiais. Basta você estar cadastrado no portal onde o edital foi publicado para poder enviar proposta.</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Dicas de proposta -->
  <tr><td style="padding:0 40px 8px;">
    <div style="color:#6B0F1A;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #E8E4DC;padding-bottom:8px;">Como fazer uma proposta competitiva</div>
  </td></tr>

  <tr><td style="padding:16px 40px 24px;">
    ${dicasProposta.map(([icon, titulo, desc]) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
      <tr>
        <td style="width:36px;height:36px;background:#FAF6F0;border-radius:8px;text-align:center;vertical-align:middle;font-size:18px;" valign="middle">${icon}</td>
        <td style="padding-left:14px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#1A1A1C;margin-bottom:3px;">${titulo}</div>
          <div style="font-size:13px;color:#555;line-height:1.6;">${desc}</div>
        </td>
      </tr>
    </table>`).join('')}
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 40px;" align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:14px;overflow:hidden;">
      <tr><td style="padding:24px 32px;" align="center">
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 16px;">Com a habilitação em dia, cada alerta do Monitor vira uma oportunidade real de proposta.</p>
        <a href="${ctaHref}" style="display:inline-block;background:#C9A65A;color:#6B0F1A;text-decoration:none;padding:15px 40px;border-radius:50px;font-size:15px;font-weight:900;letter-spacing:0.02em;">Acessar meu painel de licitações →</a>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:12px 0 0;">Seu plano <strong style="color:rgba(255,255,255,0.9);">${p.plano}</strong> está ativo · Configure alertas por palavras-chave</p>
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

Dúvidas? Responda este e-mail ou fale pelo WhatsApp +55 31 99831-7066.

--
Monitor de Licitações · Matutta`

  return { subject, html, text }
}
