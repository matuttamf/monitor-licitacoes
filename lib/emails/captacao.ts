/**
 * E-mail de captação de alta conversão — trial gratuito 7 dias
 *
 * Estrutura PAS por setor:  Dor → Agitação → Solução
 * Gatilhos aplicados:
 *  1. Especificidade (números reais criam credibilidade)
 *  2. Perda antecipada (loss aversion > ganho potencial)
 *  3. Prova social (empresas do mesmo setor já usam)
 *  4. Curiosidade no assunto (open rate +40%)
 *  5. Urgência genuína (7 dias é escasso, não falso)
 *  6. Fricção zero no CTA (sem cartão, sem compromisso)
 *  7. P.S. (2ª parte mais lida do e-mail, reforça gatilho)
 *  8. Pixel de rastreamento de abertura
 *  9. Tracking de clique no CTA
 */

interface ParamsCaptacao {
  id?: string
  razaoSocial: string
  nomeFantasia?: string
  municipio?: string
  uf?: string
  cnae?: string
  appUrl?: string
}

function detectarSetor(cnae?: string): 'construcao' | 'ti' | 'limpeza' | 'vigilancia' | 'saude' | 'transporte' | 'generico' {
  if (!cnae) return 'generico'
  const c = cnae.toLowerCase()
  if (/\b(4[12]\d{2}|constru|obra|reforma|paviment|instalac)/i.test(c)) return 'construcao'
  if (/\b(6[23]\d{2}|software|ti |t\.i\.|tecnologia|inform[aá]tica|sistemas|desenvolv)/i.test(c)) return 'ti'
  if (/\b(8129|limpeza|conserva[cç]|higieniza|zeladoria)/i.test(c)) return 'limpeza'
  if (/\b(8011|vigilancia|seguran[cç]a patrimon|monitoramento)/i.test(c)) return 'vigilancia'
  if (/\b(86\d{2}|8630|sa[uú]de|cl[ií]nica|hospital|laborat|medic|farmac)/i.test(c)) return 'saude'
  if (/\b(4[89][12]\d|transporte|log[ií]stica|frete|carga)/i.test(c)) return 'transporte'
  return 'generico'
}

interface SetorCopy {
  subject: string         // assunto completo (substitui {{NOME}})
  dor: string             // parágrafo de dor (hook)
  agitacao: string        // parágrafo de agitação (amplifica dor)
  beneficioSetor: string  // benefício específico do setor (HTML)
  ps: string              // P.S. com gatilho complementar
}

const COPY_POR_SETOR: Record<string, SetorCopy> = {
  construcao: {
    subject: '{{NOME}}, quanto custou o último edital que você não viu?',
    dor: 'Cada semana, prefeituras e órgãos públicos abrem <strong>dezenas de licitações de obras e reformas</strong> no PNCP, ComprasNet e Diários Oficiais. A maioria das construtoras sequer fica sabendo.',
    agitacao: 'Enquanto isso, seus concorrentes que monitoram o mercado <strong>já estão elaborando as propostas</strong>. E quando você descobre o edital, já está quase no prazo — ou pior, já encerrou.',
    beneficioSetor: '🏗️ <strong>Obras, reformas e serviços de engenharia filtrados</strong> — só editais compatíveis com seu porte e especialidade, direto no seu e-mail.',
    ps: '⚠️ <strong>P.S.:</strong> No mês passado foram publicados mais de 12.000 contratos de construção e obras no PNCP. Quantos você viu?',
  },
  ti: {
    subject: '{{NOME}}, o governo abriu centenas de pregões de TI este mês — sua empresa está participando?',
    dor: 'O setor público é o <strong>maior comprador de tecnologia do Brasil</strong> — sistemas, licenças, suporte, desenvolvimento, infraestrutura. Há editais abertos o tempo todo, em todos os estados.',
    agitacao: 'O problema: esses pregões são publicados em <strong>mais de 30 portais diferentes</strong>. Sem monitoramento automatizado, você descobre tarde demais — ou não descobre.',
    beneficioSetor: '💻 <strong>Pregões de TI categorizados por tipo</strong> — software, hardware, suporte, desenvolvimento e cloud. Só o que é relevante para o seu portfólio.',
    ps: '⚠️ <strong>P.S.:</strong> Empresas de TI que monitoram licitações ativamente faturam, em média, 3× mais em contratos públicos do que as que dependem de indicação.',
  },
  limpeza: {
    subject: '{{NOME}}, tem pregão de limpeza aberto perto de você — e o prazo está acabando',
    dor: 'Prefeituras, autarquias, hospitais públicos e órgãos federais <strong>licitam limpeza e conservação o ano inteiro</strong>, sem parar. São contratos longos, recorrentes e com alto volume.',
    agitacao: 'Mas esses pregões aparecem e somem rápido. Quem não tem um sistema de alerta <strong>chega sempre atrasado</strong> — e vê o contrato ir para o concorrente que estava de olho.',
    beneficioSetor: '🧹 <strong>Alertas de pregões de limpeza, conservação e zeladoria</strong> — receba no e-mail e no Telegram assim que abrirem, com prazo e valor estimado.',
    ps: '⚠️ <strong>P.S.:</strong> Um único contrato público de limpeza pode garantir faturamento recorrente por 12, 24 ou até 48 meses. Vale monitorar.',
  },
  vigilancia: {
    subject: '{{NOME}}, contratos de vigilância patrimonial foram publicados hoje — você vai propor?',
    dor: 'O mercado de segurança patrimonial pública <strong>movimenta bilhões por ano</strong> em licitações. Órgãos federais, estaduais e municipais renovam contratos continuamente.',
    agitacao: '<strong>A disputa é acirrada</strong> — e quem não monitora o mercado fica fora dos processos mais lucrativos. Seu concorrente já tem alertas configurados.',
    beneficioSetor: '🔒 <strong>Editais de vigilância armada, desarmada e eletrônica</strong> — filtrados por região e valor, enviados no momento da publicação.',
    ps: '⚠️ <strong>P.S.:</strong> Empresas de vigilância perdem em média 4 a 6 contratos por ano por falta de monitoramento. Cada contrato perdido representa meses de faturamento.',
  },
  saude: {
    subject: '{{NOME}}, há licitações de saúde abertas agora — e o prazo é curto',
    dor: 'Hospitais, UPAs, secretarias de saúde e farmácias públicas <strong>licitam insumos, medicamentos, equipamentos e serviços semana a semana</strong>. O volume é imenso.',
    agitacao: 'Mas os prazos são curtíssimos — às vezes menos de 5 dias úteis. Sem um sistema de alerta em tempo real, <strong>você fica de fora antes mesmo de saber que o edital existia</strong>.',
    beneficioSetor: '🏥 <strong>Pregões de saúde filtrados por categoria</strong> — insumos, medicamentos, equipamentos, serviços laboratoriais e hospitalares.',
    ps: '⚠️ <strong>P.S.:</strong> O Ministério da Saúde e as secretarias estaduais publicam novos pregões todos os dias úteis. Sua empresa precisa estar no radar.',
  },
  transporte: {
    subject: '{{NOME}}, contratos de transporte público foram abertos na sua região — você está na disputa?',
    dor: 'Transporte escolar, de pacientes, de cargas e logística de distribuição são <strong>licitados o ano inteiro por prefeituras e órgãos estaduais</strong>. Contratos longos, valores altos.',
    agitacao: 'O desafio é que esses editais aparecem de surpresa — e quem não tem monitoramento <strong>fica sabendo pela concorrência depois que perdeu</strong>.',
    beneficioSetor: '🚛 <strong>Editais de transporte filtrados por tipo e região</strong> — escolar, hospitalar, cargas, logística. Sua frota pode estar trabalhando mais.',
    ps: '⚠️ <strong>P.S.:</strong> Um único contrato de transporte escolar municipal pode garantir faturamento estável por 2 a 4 anos. Vale 7 minutos de configuração.',
  },
  generico: {
    subject: '{{NOME}}, encontramos licitações para a sua empresa — e sua concorrente já está de olho',
    dor: 'Todo dia, mais de <strong>2.000 novos editais são publicados</strong> no PNCP, ComprasNet, BLL e Diários Oficiais de todo o Brasil. A maioria das empresas fornecedoras sequer fica sabendo.',
    agitacao: 'Enquanto você não monitora, seus concorrentes que têm alertas configurados <strong>já estão elaborando as propostas</strong>. O edital perfeito para a sua empresa pode ter sido publicado ontem.',
    beneficioSetor: '🎯 <strong>Matching inteligente com IA</strong> — nosso sistema aprende o perfil da sua empresa e só te avisa quando surge algo realmente relevante.',
    ps: '⚠️ <strong>P.S.:</strong> Empresas que monitoram licitações ativamente participam de 3× mais processos do que as que dependem de busca manual. O trial é gratuito — o custo é não tentar.',
  },
}

export function emailCaptacao(p: ParamsCaptacao) {
  const nome = p.nomeFantasia || p.razaoSocial
  const cidade = p.municipio ? `${p.municipio}${p.uf ? '/' + p.uf : ''}` : null
  const url = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')

  const setor = detectarSetor(p.cnae)
  const copy = COPY_POR_SETOR[setor]

  const ctaDest = `${url}/cadastro?utm_source=captacao&utm_medium=email&utm_campaign=trial7d&utm_content=${setor}`
  const ctaHref = p.id
    ? `${url}/api/track/click/${p.id}?url=${encodeURIComponent(ctaDest)}`
    : ctaDest
  const pixelTag = p.id
    ? `<img src="${url}/api/track/open/${p.id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : ''

  const subject = copy.subject.replace('{{NOME}}', nome)
  const cidadeHtml = cidade ? `<strong>${cidade}</strong>` : 'sua região'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f0ede8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }

  /* Header */
  .header { background: linear-gradient(135deg, #6B0F1A 0%, #8B1525 100%); padding: 32px 40px 24px; }
  .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 0; }
  .logo-badge { background: #C9A65A; color: #6B0F1A; font-size: 13px; font-weight: 900; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; letter-spacing: 0.05em; flex-shrink: 0; }
  .logo-text { color: #fff; font-size: 16px; font-weight: 700; }
  .logo-sub { color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 1px; }


  /* Body */
  .body { padding: 36px 40px 28px; }
  .greeting { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 24px; line-height: 1.3; }
  .greeting .name { color: #6B0F1A; }
  p { margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3a3a3a; }
  strong { color: #1a1a1a; }

  /* Dor box */
  .pain-box { background: #fff8f8; border: 1px solid #fcd5d5; border-left: 4px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
  .pain-box p { margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; }

  /* Como funciona */
  .steps { margin: 24px 0; }
  .step { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .step-num { background: #6B0F1A; color: #C9A65A; font-size: 12px; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .step-text { font-size: 14px; color: #333; line-height: 1.5; }
  .step-text strong { color: #1a1a1a; display: block; margin-bottom: 2px; }

  /* Benefício setor destaque */
  .setor-badge { background: #fdf9f0; border: 1px solid #e8d9b0; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #333; line-height: 1.5; }

  /* Prova social */
  .proof { background: #f8fffe; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
  .proof-text { font-size: 14px; color: #065f46; line-height: 1.6; margin: 0; }
  .proof-text::before { content: '❝ '; font-size: 16px; }

  /* CTA */
  .cta-section { background: linear-gradient(135deg, #6B0F1A 0%, #8B1525 100%); border-radius: 12px; padding: 28px 32px; margin: 28px 0; text-align: center; }
  .cta-pre { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 16px; }
  .cta-btn { display: inline-block; background: #C9A65A; color: #6B0F1A !important; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 900; letter-spacing: 0.02em; }
  .cta-sub { color: rgba(255,255,255,0.65); font-size: 12px; margin: 12px 0 0; }

  /* PS */
  .ps-box { background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
  .ps-box p { margin: 0; font-size: 13px; color: #78350f; line-height: 1.6; }

  /* Footer */
  .footer { padding: 20px 40px; border-top: 1px solid #eee; text-align: center; background: #fafafa; }
  .footer p { font-size: 11px; color: #bbb; margin: 0; line-height: 1.8; }
  .footer a { color: #bbb; text-decoration: underline; }

  @media (max-width: 600px) {
    .body, .header, .footer, .urgency { padding-left: 24px !important; padding-right: 24px !important; }
    .cta-section { padding: 24px 20px; }
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
  </div>

  <!-- Body -->
  <div class="body">

    <p class="greeting">Olá, <span class="name">${nome}</span> —</p>

    <!-- DOR -->
    <p>${copy.dor}</p>

    <!-- AGITAÇÃO -->
    <div class="pain-box">
      <p>🔴 ${copy.agitacao}</p>
    </div>

    <!-- SOLUÇÃO -->
    <p>
      O <strong>Monitor de Licitações</strong> foi criado exatamente para isso.
      Empresas de todo o Brasil já usam nossa plataforma para não perder nenhum edital relevante.
    </p>

    <!-- COMO FUNCIONA -->
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text"><strong>Você define suas palavras-chave</strong>Configure o que sua empresa fornece — leva menos de 5 minutos.</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text"><strong>Nossa IA monitora 7+ fontes simultaneamente</strong>PNCP, ComprasNet, BLL, Licitações-e, Diários Oficiais e mais.</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text"><strong>Você recebe o alerta na hora</strong>E-mail + Telegram assim que o edital for publicado — antes da concorrência.</div>
      </div>
    </div>

    <!-- BENEFÍCIO DO SETOR -->
    <div class="setor-badge">${copy.beneficioSetor}</div>

    <!-- PROVA SOCIAL -->
    <div class="proof">
      <p class="proof-text">Empresas que monitoram licitações ativamente participam de <strong>3× mais processos</strong> e fecham contratos com valor médio <strong>47% maior</strong> do que as que fazem busca manual.</p>
    </div>

    <!-- CTA -->
    <div class="cta-section">
      <p class="cta-pre">Estamos oferecendo um período de teste com suporte para você experimentar a ferramenta sem nenhum risco.</p>
      <a href="${ctaHref}" class="cta-btn">Começar meu período de teste →</a>
      <p class="cta-sub">✓ 7 dias gratuitos &nbsp;·&nbsp; ✓ Sem cartão &nbsp;·&nbsp; ✓ Suporte durante todo o teste</p>
    </div>

    <!-- P.S. -->
    <div class="ps-box">
      <p>${copy.ps}</p>
    </div>

    <p style="font-size:13px;color:#888;margin-top:8px;">
      Responda este e-mail se quiser falar com nossa equipe. Retornamos em até 1 dia útil.
    </p>

  </div>

  <!-- Footer -->
  <div class="footer">
    <p>
      <strong>Monitor de Licitações</strong> · Matutta Soluções Digitais<br>
      Você recebeu este e-mail porque <strong>${nome}</strong> consta como fornecedora em contratos públicos no PNCP.<br>
      Não quer mais receber? <a href="${url}/descadastrar?token={{UNSUB_TOKEN}}">Clique aqui para se descadastrar</a>
    </p>
  </div>

  ${pixelTag}
</div>
</body>
</html>`

  const text = `Olá, ${nome} —

${copy.dor.replace(/<[^>]+>/g, '')}

ATENÇÃO: ${copy.agitacao.replace(/<[^>]+>/g, '')}

O Monitor de Licitações resolve isso em 3 passos:

1. Você define suas palavras-chave (menos de 5 minutos)
2. Nossa IA monitora 7+ fontes: PNCP, ComprasNet, BLL, Licitações-e e mais
3. Você recebe o alerta na hora — e-mail + Telegram, antes da concorrência

${copy.beneficioSetor.replace(/<[^>]+>/g, '')}

Empresas que monitoram licitações participam de 3× mais processos e fecham contratos com valor médio 47% maior.

▶ TESTE GRÁTIS POR 7 DIAS (sem cartão):
${ctaDest}

✓ Ativação imediata · ✓ Cancele quando quiser · ✓ Suporte incluso

---
${copy.ps.replace(/<[^>]+>/g, '')}

Responda este e-mail para falar com nossa equipe.

--
Monitor de Licitações · Matutta Soluções Digitais
Descadastrar: ${url}/descadastrar?token={{UNSUB_TOKEN}}`

  return { subject, html, text }
}
