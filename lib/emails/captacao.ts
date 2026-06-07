/**
 * E-mail de captação — convite para trial gratuito de 7 dias
 * Técnicas aplicadas:
 *  - Personalização pelo nome da empresa (reciprocidade)
 *  - Segmentação por CNAE (copy específico por setor)
 *  - Prova social implícita ("empresas como a sua")
 *  - Escassez/urgência suave (oportunidades perdidas)
 *  - CTA único e claro (redução de atrito)
 *  - Benefício concreto antes do pedido
 *  - Assunto curioso + nome da empresa (open rate +35%)
 *  - Pixel de rastreamento (abertura)
 *  - Tracking de clique no CTA
 */

interface ParamsCaptacao {
  id?: string        // lead ID para rastreamento
  razaoSocial: string
  nomeFantasia?: string
  municipio?: string
  uf?: string
  cnae?: string
  appUrl?: string
}

// Detecta setor pelo código/descrição do CNAE
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
  assuntoSufixo: string   // complemento do assunto
  abertura: string        // 1º parágrafo personalizado
  beneficioDestaque: string // bullet extra de destaque
}

const COPY_POR_SETOR: Record<string, SetorCopy> = {
  construcao: {
    assuntoSufixo: 'há obras e reformas esperando sua proposta',
    abertura: 'Empresas de construção civil dependem de licitações para crescer — e cada edital perdido é uma obra que foi para o concorrente.',
    beneficioDestaque: '🏗️ <strong>Obras e reformas filtradas</strong> — só editais compatíveis com seu porte e especialidade',
  },
  ti: {
    assuntoSufixo: 'o governo está contratando TI — você está participando?',
    abertura: 'O setor público é o maior comprador de tecnologia do Brasil. Sistemas, licenças, suporte e desenvolvimento — há editais abertos o tempo todo para empresas de TI.',
    beneficioDestaque: '💻 <strong>Editais de TI categorizados</strong> — software, infraestrutura, suporte e muito mais',
  },
  limpeza: {
    assuntoSufixo: 'contratos de limpeza e conservação disponíveis agora',
    abertura: 'Serviços de limpeza e conservação são licitados o ano inteiro por prefeituras, autarquias e órgãos federais. Sua empresa precisa estar no lugar certo na hora certa.',
    beneficioDestaque: '🧹 <strong>Pregões de conservação e limpeza</strong> — alertas assim que abrirem no PNCP',
  },
  vigilancia: {
    assuntoSufixo: 'contratos de vigilância patrimonial esperando proposta',
    abertura: 'O mercado de segurança patrimonial pública movimenta bilhões por ano em licitações. Cada contrato não disputado é receita que fica para outra empresa.',
    beneficioDestaque: '🔒 <strong>Editais de vigilância e segurança</strong> — cobertura nacional em tempo real',
  },
  saude: {
    assuntoSufixo: 'editais de saúde pública aguardando sua proposta',
    abertura: 'Hospitais, UPAs, clínicas e secretarias de saúde licitam insumos, equipamentos e serviços continuamente. Estar presente nesses processos pode transformar sua operação.',
    beneficioDestaque: '🏥 <strong>Pregões de saúde filtrados</strong> — insumos, equipamentos e serviços de saúde',
  },
  transporte: {
    assuntoSufixo: 'contratos de transporte e logística disponíveis no governo',
    abertura: 'Transporte escolar, de pacientes, de cargas e logística de distribuição são licitados o ano inteiro por prefeituras e órgãos estaduais. Sua frota pode trabalhar mais.',
    beneficioDestaque: '🚛 <strong>Editais de transporte e logística</strong> — rastreados automaticamente por região',
  },
  generico: {
    assuntoSufixo: 'há licitações esperando por vocês',
    abertura: 'Sua empresa fornece para o setor público — e sabemos que encontrar os editais certos, no momento certo, faz toda a diferença para fechar contratos.',
    beneficioDestaque: '🎯 <strong>Matching com IA</strong> — só os editais que realmente importam para o seu negócio',
  },
}

export function emailCaptacao(p: ParamsCaptacao) {
  const nome = p.nomeFantasia || p.razaoSocial
  const cidade = p.municipio ? `${p.municipio}${p.uf ? '/' + p.uf : ''}` : null
  const url = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')

  const setor = detectarSetor(p.cnae)
  const copy = COPY_POR_SETOR[setor]

  const ctaDest = `${url}/cadastro?utm_source=captacao&utm_medium=email&utm_campaign=trial7d&utm_content=${setor}`

  // Se tiver ID de lead, envolve CTA em tracking de clique
  const ctaHref = p.id
    ? `${url}/api/track/click/${p.id}?url=${encodeURIComponent(ctaDest)}`
    : ctaDest

  // Pixel de rastreamento de abertura (1×1 GIF)
  const pixelTag = p.id
    ? `<img src="${url}/api/track/open/${p.id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : ''

  const subject = `${nome} — ${copy.assuntoSufixo}`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
<style>
  body { margin: 0; padding: 0; background: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
  .header { background: #6B0F1A; padding: 36px 40px 28px; text-align: center; }
  .logo { color: #C9A65A; font-size: 22px; font-weight: 900; letter-spacing: 0.1em; }
  .tagline { color: rgba(201,166,90,0.7); font-size: 12px; margin-top: 4px; letter-spacing: 0.05em; }
  .body { padding: 36px 40px; }
  h1 { margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a; line-height: 1.3; }
  p { margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #444; }
  .highlight { color: #6B0F1A; font-weight: 600; }
  .benefits { background: #fdf9f0; border-left: 3px solid #C9A65A; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0; }
  .benefits li { font-size: 14px; color: #333; margin-bottom: 8px; line-height: 1.5; }
  .benefits li:last-child { margin-bottom: 0; }
  .cta-wrap { text-align: center; margin: 32px 0 24px; }
  .cta { display: inline-block; background: #6B0F1A; color: #fff !important; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.02em; }
  .sub { font-size: 12px; color: #999; text-align: center; margin-top: 8px; }
  .footer { background: #f9f9f9; padding: 20px 40px; border-top: 1px solid #eee; text-align: center; }
  .footer p { font-size: 12px; color: #aaa; margin: 0; line-height: 1.6; }
  .footer a { color: #aaa; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">ML</div>
    <div class="tagline">Monitor de Licitações</div>
  </div>
  <div class="body">
    <h1>Olá, <span class="highlight">${nome}</span>!</h1>

    <p>
      ${copy.abertura}
      ${cidade ? `<br>E para empresas como a sua em <strong>${cidade}</strong>, os contratos públicos representam uma fonte real de crescimento.` : ''}
    </p>

    <p>
      O problema é que <strong>monitorar manualmente</strong> centenas de portais (PNCP, ComprasNet, BLL, Licitações-e,
      Diários Oficiais) consome horas preciosas que sua equipe poderia usar para elaborar propostas vencedoras.
    </p>

    <p>
      Por isso criamos o <span class="highlight">Monitor de Licitações</span>: você define suas palavras-chave
      e nossa inteligência artificial varre o Brasil inteiro — federal, estadual e municipal —
      alertando você por e-mail e Telegram <strong>assim que surgir um edital relevante</strong>.
    </p>

    <ul class="benefits">
      <li>${copy.beneficioDestaque}</li>
      <li>✅ <strong>Cobertura nacional</strong> — mais de 7 fontes simultâneas</li>
      <li>✅ <strong>Alertas em tempo real</strong> — e-mail + Telegram no mesmo instante</li>
      <li>✅ <strong>Busca histórica</strong> — consulte licitações dos últimos 5 anos</li>
      <li>✅ <strong>Sem contrato</strong> — cancele quando quiser</li>
    </ul>

    <p>
      Para conhecer na prática, estamos oferecendo <span class="highlight">7 dias gratuitos</span>,
      sem precisar de cartão de crédito. É só criar sua conta e começar.
    </p>

    <div class="cta-wrap">
      <a href="${ctaHref}" class="cta">Começar meu trial gratuito →</a>
      <p class="sub">Grátis por 7 dias · Sem cartão · Cancele quando quiser</p>
    </div>

    <p style="font-size:14px; color:#666;">
      Alguma dúvida? Responda este e-mail — nossa equipe retorna em até 1 dia útil.
    </p>
  </div>
  <div class="footer">
    <p>
      Monitor de Licitações · Matutta Soluções Digitais<br>
      Você recebeu este e-mail porque sua empresa é fornecedora em contratos públicos registrados no PNCP.<br>
      <a href="${url}/descadastrar?email={{EMAIL}}">Descadastrar</a>
    </p>
  </div>
  ${pixelTag}
</div>
</body>
</html>`

  const text = `Olá, ${nome}!

${copy.abertura}${cidade ? ` Para empresas em ${cidade}, os contratos públicos representam uma fonte real de crescimento.` : ''}

O problema é que monitorar manualmente centenas de portais consome horas preciosas.

O Monitor de Licitações resolve isso: defina suas palavras-chave e nossa IA varre o Brasil inteiro, alertando você por e-mail e Telegram assim que surgir um edital relevante.

✅ Cobertura nacional (7+ fontes)
✅ Matching com IA — só editais relevantes para seu setor
✅ Alertas em tempo real
✅ Busca histórica 5 anos
✅ Sem contrato

Experimente GRÁTIS por 7 dias, sem cartão:
${ctaDest}

Dúvidas? Responda este e-mail.

--
Monitor de Licitações · Matutta Soluções Digitais
Para descadastrar: ${url}/descadastrar`

  return { subject, html, text }
}
