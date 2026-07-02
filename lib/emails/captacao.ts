/**
 * Sequência de captação outbound — voz Matutta, formato texto puro
 *
 * E1 (D+0)   — Personalizado por setor: "vi no PNCP", pergunta aberta
 * E2 (D+4)   — Personalizado por setor: competitor frame
 * E3 (D+8)   — Personalizado por setor: transformação com números reais
 * E4 (D+17)  — Genérico: quebra de objeções
 * E5 (D+32)  — Personalizado por setor: nova prova social
 * E6 (D+62)  — Genérico: urgência
 * E7 (D+92)  — Genérico: pergunta humana
 * E8 (D+152) — Genérico: sunset com porta aberta
 */

export interface LicitacaoResumida {
  objeto:          string
  orgao:           string
  valor_estimado?: number | null
  estado?:         string | null
  data_abertura?:  string | null
  link?:           string | null
}

interface ParamsCaptacao {
  id?: string
  razaoSocial: string
  nomeFantasia?: string
  municipio?: string
  uf?: string
  cnae?: string
  appUrl?: string
  licitacoes?: LicitacaoResumida[]
  objeto?: string
  numeroEmail?: number
}

// ─── Detecção de setor ────────────────────────────────────────────────────────

type Setor = 'construcao' | 'ti' | 'limpeza' | 'vigilancia' | 'saude' | 'transporte' | 'alimentacao' | 'generico'

function detectarSetor(cnae?: string): Setor {
  if (!cnae) return 'generico'
  const c = cnae.toLowerCase()
  if (/\b(4[12]\d{2}|constru|obra|reforma|paviment|instalac|engenharia)/i.test(c)) return 'construcao'
  if (/\b(6[23]\d{2}|software|tecnologia|inform[aá]tica|sistemas|desenvolv|suporte\sti)/i.test(c)) return 'ti'
  if (/\b(8121|8129|limpeza|conserva[cç]|higieniza|zeladoria)/i.test(c)) return 'limpeza'
  if (/\b(8011|vigilancia|seguran[cç]a patrimon|monitoramento)/i.test(c)) return 'vigilancia'
  if (/\b(86\d{2}|8630|sa[uú]de|cl[ií]nica|hospital|laborat|medic|farmac)/i.test(c)) return 'saude'
  if (/\b(4[89][12]\d|transporte|log[ií]stica|frete|carga|frota)/i.test(c)) return 'transporte'
  if (/\b(5611|5612|merenda|alimenta[cç]|gen[eê]ros alimenti|refei[cç])/i.test(c)) return 'alimentacao'
  return 'generico'
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function fmtValor(v?: number | null): string {
  if (!v) return ''
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}k`
  return `R$ ${v.toFixed(0)}`
}

function fmtData(d?: string | null): string {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function buildLicitacoesHtml(lics: LicitacaoResumida[], ctaHref: string): string {
  if (!lics.length) return ''
  const items = lics.map((lic, i) => {
    const valor = fmtValor(lic.valor_estimado)
    const data  = fmtData(lic.data_abertura)
    const bg    = i % 2 === 0 ? '#fafafa' : '#fff'
    const obj   = lic.objeto.length > 90 ? lic.objeto.slice(0, 90) + '…' : lic.objeto
    const org   = lic.orgao.length > 55 ? lic.orgao.slice(0, 55) + '…' : lic.orgao
    const est   = lic.estado ? ` · ${lic.estado}` : ''
    return `<tr>
      <td style="padding:12px 14px;background:${bg};border-bottom:1px solid #eee;vertical-align:top;">
        <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:3px;font-family:Arial,sans-serif;">${obj}</div>
        <div style="font-size:12px;color:#666;margin-bottom:4px;font-family:Arial,sans-serif;">${org}${est}</div>
        ${valor ? `<span style="display:inline-block;font-size:11px;background:#fef3c7;color:#92400e;padding:2px 7px;border-radius:99px;font-weight:700;margin-right:8px;font-family:Arial,sans-serif;">${valor}</span>` : ''}
        ${data  ? `<span style="font-size:11px;color:#888;font-family:Arial,sans-serif;">Abertura: ${data}</span>` : ''}
      </td>
    </tr>`
  }).join('')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td>
        <div style="font-size:11px;font-weight:700;color:#6B0F1A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;font-family:Arial,sans-serif;">Exemplos de licitações abertas no seu setor</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;border-collapse:collapse;">
          ${items}
          <tr><td style="padding:10px 14px;background:#f5f0ea;text-align:center;">
            <a href="${ctaHref}" style="font-size:12px;color:#6B0F1A;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">Ver todas as licitações do seu setor →</a>
          </td></tr>
        </table>
      </td></tr>
    </table>`
}

function buildLicitacoesTxt(lics: LicitacaoResumida[]): string {
  if (!lics.length) return ''
  const lines = lics.map((lic, i) => {
    const valor = fmtValor(lic.valor_estimado)
    const data  = fmtData(lic.data_abertura)
    const obj   = lic.objeto.length > 80 ? lic.objeto.slice(0, 80) + '…' : lic.objeto
    return `  ${i + 1}. ${obj}\n     ${lic.orgao}${lic.estado ? ' · ' + lic.estado : ''}${valor ? ' · ' + valor : ''}${data ? ' · Abertura: ' + data : ''}`
  }).join('\n')
  return `\nExemplos de licitações abertas:\n${lines}\n`
}

// Mantidos para compatibilidade
export const BOX = {
  pain:      'background:#fff8f8;border:1px solid #fcd5d5;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;',
  painP:     'margin:0;font-size:14px;color:#7f1d1d;line-height:1.65;',
  insight:   'background:#fafaf7;border:1px solid #e5e2d8;border-radius:8px;padding:18px 22px;margin:20px 0;',
  insightP:  'margin:0;font-size:14px;color:#3a3730;line-height:1.7;',
  story:     'background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px 24px;margin:20px 0;',
  storyLabel:'font-size:11px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px;',
  storyP:    'margin:0;font-size:14px;color:#0c4a6e;line-height:1.7;',
  transform: 'background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:20px 0;',
  transformL:'font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px;',
  transformP:'margin:0;font-size:14px;color:#14532d;line-height:1.7;',
  objection: 'border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:14px 0;',
  objQ:      'font-size:14px;font-style:italic;color:#374151;font-weight:600;margin-bottom:8px;',
  objA:      'font-size:14px;color:#4b5563;line-height:1.6;margin:0;',
}

// ─── HTML wrapper — estilo texto puro ────────────────────────────────────────

const P  = 'font-size:15px;color:#2c2c2c;line-height:1.85;margin:0 0 18px;font-family:Georgia,serif;'
const PS = 'font-size:13px;color:#888;line-height:1.7;margin:0;font-style:italic;font-family:Georgia,serif;'

function wrapCaptacao(opts: {
  nome: string; cidade: string | null
  assunto: string; conteudo: string
  pixelTag: string; url: string; unsub: string
}): string {
  const cidadeStr = opts.cidade ? ` — ${opts.cidade}` : ''
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${opts.assunto}</title></head>
<body style="margin:0;padding:0;background:#f2ede8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2ede8;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;border:1px solid #d9d4cd;overflow:hidden;max-width:560px;">

  <tr><td style="padding:22px 36px 14px;border-bottom:1px solid #eeebe6;">
    <p style="margin:0 0 3px;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">De: <strong style="color:#555;">Monitor de Licitações</strong></p>
    <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">Para: <strong style="color:#555;">${opts.nome}${cidadeStr}</strong></p>
  </td></tr>

  <tr><td style="padding:20px 36px 4px;">
    <p style="margin:0;font-size:19px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;line-height:1.3;">${opts.assunto}</p>
  </td></tr>

  <tr><td style="padding:18px 36px 28px;">
    ${opts.conteudo}
  </td></tr>

  <tr><td style="padding:14px 36px;border-top:1px solid #eeebe6;background:#faf8f5;">
    <p style="margin:0;font-size:11px;color:#bbb;line-height:1.8;font-family:Arial,sans-serif;">
      Você recebe este e-mail porque <strong>${opts.nome}</strong> consta como fornecedora em contratos públicos no PNCP.<br>
      <a href="${opts.url}/descadastrar?token=${opts.unsub}" style="color:#bbb;text-decoration:underline;">Descadastrar</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
${opts.pixelTag}
</body>
</html>`
}

// ─── Templates por setor — E1 ────────────────────────────────────────────────

interface E1Template {
  assunto: string
  p1: string
  p2: string
  p3: string
  ctaText: string
  ps: string
}

const E1: Record<Setor, E1Template> = {
  construcao: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato de obra pública no PNCP. Reforma, construção — esse tipo.',
    p2: 'Uma pergunta: quando o próximo edital de obra aparecer em prefeituras da região, vocês vão receber o alerta?',
    p3: 'Prefeituras, estados e órgãos federais publicam mais de 3.200 contratos de construção por mês no Brasil, com prazo médio de 15 dias corridos. Quem monitora chega com tempo de elaborar proposta — quem não monitora descobre quando o prazo já fechou.',
    ctaText: '→ ver editais de obra abertos agora',
    ps: 'Esta semana foram publicados mais de 3.200 contratos de obras e reformas no Brasil. A maioria fechou sem que a empresa certa recebesse um alerta.',
  },
  limpeza: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato de limpeza e conservação no sistema federal.',
    p2: 'Uma pergunta: quando o próximo edital de limpeza aparecer — prefeitura, hospital, escola pública — vocês vão receber o alerta?',
    p3: 'Órgãos públicos licitam limpeza o ano inteiro — mais de 4.800 contratos por mês, a maioria com 12 a 36 meses de duração. Cada edital perdido não é uma venda: é até três anos de receita mensal garantida que foi para quem estava monitorando.',
    ctaText: '→ ver editais de limpeza abertos agora',
    ps: 'Contratos de limpeza duram de 1 a 3 anos. Um edital perdido não é uma venda — é até 36 meses de receita mensal garantida que foi para o concorrente que estava monitorando.',
  },
  ti: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato público de tecnologia no sistema federal.',
    p2: 'Uma pergunta: quando o próximo pregão de TI aparecer — software, suporte, infraestrutura — vocês vão receber o alerta?',
    p3: 'O setor público compra mais de R$ 40 bilhões em tecnologia por ano — mais de 6.000 pregões por mês, com prazo de 5 a 15 dias úteis. Sem alerta no dia da publicação, você começa a elaborar proposta com metade do prazo já consumido.',
    ctaText: '→ ver pregões de TI abertos agora',
    ps: 'Pregões de TI têm prazo de 5 a 15 dias úteis. Sem monitoramento, você nem tem tempo de elaborar proposta antes do prazo fechar.',
  },
  vigilancia: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato de vigilância patrimonial no sistema federal.',
    p2: 'Uma pergunta: quando o próximo edital de vigilância aparecer — prefeitura, hospital, autarquia — vocês vão receber o alerta?',
    p3: 'O governo contrata vigilância o ano inteiro — mais de 900 contratos por mês, a maioria com 12 a 36 meses de duração. Cada edital que passa sem você saber é até três anos de receita garantida que vai para quem estava monitorando.',
    ctaText: '→ ver editais de vigilância abertos agora',
    ps: 'Cada contrato de vigilância dura de 1 a 3 anos. Um edital perdido é até 36 meses de receita mensal garantida que foi para outro.',
  },
  saude: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato público de saúde no sistema federal.',
    p2: 'Uma pergunta: quando o próximo edital de saúde aparecer — equipamento, insumo, serviço para hospital — vocês vão receber o alerta?',
    p3: 'O governo é o maior comprador de produtos de saúde do país — mais de 2.100 licitações por mês, algumas emergenciais com prazo de 24 horas. Sem monitoramento em tempo real, você nem fica sabendo que as emergenciais existiram.',
    ctaText: '→ ver licitações de saúde abertas agora',
    ps: 'Algumas licitações de saúde são emergenciais — prazo de 24 a 72 horas. Sem monitoramento em tempo real, você nem fica sabendo que existiram.',
  },
  transporte: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato público de transporte ou logística no sistema federal.',
    p2: 'Uma pergunta: quando o próximo edital de transporte aparecer — frete, frota, logística — vocês vão receber o alerta?',
    p3: 'O governo contrata transporte o ano inteiro — mais de 1.200 contratos por mês, a maioria com 12 a 36 meses e pagamento garantido. Cada edital que fecha sem você participar é até três anos de receita que foi para quem estava monitorando.',
    ctaText: '→ ver editais de transporte abertos agora',
    ps: 'Contratos de transporte têm duração de 1 a 3 anos. Um edital perdido é até 36 meses de receita garantida que foi para quem estava monitorando.',
  },
  alimentacao: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato público de fornecimento de alimentos no sistema federal.',
    p2: 'Uma pergunta: quando o próximo edital de alimentação aparecer — merenda escolar, refeição institucional, gêneros alimentícios — vocês vão receber o alerta?',
    p3: 'Prefeituras licitam alimentação escolar o ano inteiro — mais de 2.400 contratos por mês, a maioria com 12 meses e renovação anual. Chegar a tempo de calcular logística e precificar é o que separa quem participa de quem descobre que perdeu.',
    ctaText: '→ ver editais de alimentação abertos agora',
    ps: 'Contratos de merenda têm duração de 12 meses com renovação. Um edital perdido é um ano inteiro de receita garantida que foi para o concorrente que estava monitorando.',
  },
  generico: {
    assunto: 'Vi a {{NOME}} no PNCP',
    p1: 'Vi o CNPJ de vocês vinculado a um contrato público no sistema federal de contratações.',
    p2: 'Uma pergunta: quando o próximo edital compatível com o que vocês fornecem aparecer, vocês vão receber o alerta?',
    p3: 'O governo federal publicou mais de R$ 240 bilhões em contratos no último ano só no PNCP — estados e municípios somam o mesmo volume. Os editais fecham antes de chegarem ao radar de quem não monitora.',
    ctaText: '→ ver editais abertos agora no meu setor',
    ps: 'Esta semana, mais de 18.000 licitações foram publicadas no Brasil. A maioria fechou sem que a empresa certa soubesse que existia.',
  },
}

// ─── Templates por setor — E2 ────────────────────────────────────────────────

interface E2Template {
  assunto: string
  p1: string
  p2: string
  p3: string
  ps: string
}

const E2: Record<Setor, E2Template> = {
  construcao: {
    assunto: 'Tem uma construtora no seu estado recebendo 7 alertas de obra esta semana',
    p1: 'Uma construtora de porte similar ao da {{NOME}} — obras, reformas, mesmo segmento — configurou monitoramento de editais no seu estado. Esta semana recebeu 7 alertas. Avaliou os 7. Decidiu participar de 3. Para os outros 4, não valia — e ela soube isso em 10 minutos, sem abrir portal nenhum.',
    p2: 'Você ficou sabendo de quantos desses 7 editais?',
    p3: 'Empresas de construção que monitoram participam, em média, de 5 a 10 vezes mais processos do que as que dependem de busca manual. A taxa de vitória é parecida — o que muda é o número de oportunidades que chegam a tempo.',
    ps: 'Editais de obras têm prazo médio de 15 dias corridos. Cada semana sem monitoramento é uma semana de oportunidades que abriram, correram e fecharam sem que você soubesse que existiam.',
  },
  limpeza: {
    assunto: 'Empresa de limpeza da sua região recebeu 14 alertas esta semana',
    p1: 'Uma empresa de limpeza e conservação predial da sua região — porte similar ao da {{NOME}} — recebeu 14 alertas esta semana: contratos em prefeituras, hospitais e escolas do estado. Avaliou os 14. Decidiu participar de 4. Para os outros 10, não era o perfil — e ela soube isso sem sair do lugar.',
    p2: 'Você ficou sabendo de quantos desses 14 editais?',
    p3: 'Contratos de limpeza têm duração de 12 a 36 meses. Quando você não sabe que o edital existe, não perde uma venda — perde o contrato inteiro. São 1 a 3 anos de receita mensal garantida que vão para quem estava monitorando.',
    ps: 'A empresa que ganhou aquele contrato de hospital não limpa melhor que a sua. Ela ficou sabendo 12 dias antes — e chegou ao processo com tempo de preparar proposta competitiva.',
  },
  ti: {
    assunto: 'Uma software house da sua cidade recebeu 12 pregões de TI esta semana',
    p1: 'Uma empresa de TI no mesmo segmento que a {{NOME}} — software, suporte, infraestrutura — configurou alertas para todo pregão compatível com o que ela fornece. Esta semana recebeu 12 notificações. Avaliou as 12 em menos de 2 horas. Participou de 4 processos. Para os outros 8, não valia o esforço — e ela soube isso sem abrir nenhum portal.',
    p2: 'Você ficou sabendo de quantos desses 12 pregões?',
    p3: 'Pregões de TI têm prazo de 5 a 15 dias úteis. Sem alerta no dia da publicação, você começa em desvantagem — quando descobre, já perdeu metade do prazo para montar proposta técnica.',
    ps: 'O concorrente que recebeu aquele alerta de R$ 380k não tem produto melhor que o seu. Ele tem um sistema que avisa na hora que o edital sai — antes que o prazo comece a correr.',
  },
  vigilancia: {
    assunto: 'Empresa de vigilância do seu estado recebeu 8 alertas esta semana',
    p1: 'Uma empresa de vigilância patrimonial da sua região — porte similar ao da {{NOME}} — recebeu 8 alertas esta semana: contratos em prefeituras, autarquias e hospitais do estado. Avaliou os 8. Participou de 3 processos. Para os outros 5, não valia o deslocamento ou o porte exigido — e ela soube isso sem gastar tempo de equipe.',
    p2: 'Você ficou sabendo de quantos desses 8 editais?',
    p3: 'Contratos de vigilância têm duração de 12 a 36 meses. Cada edital que você perde por falta de visibilidade é até 3 anos de receita mensal garantida que vai para a concorrência.',
    ps: 'O concorrente que ganhou aquele contrato de autarquia não tem equipe melhor que a sua. Ele ficou sabendo do edital 20 dias antes — e chegou com tempo de elaborar proposta competitiva.',
  },
  saude: {
    assunto: 'Fornecedora de saúde da sua região recebeu 16 alertas esta semana',
    p1: 'Uma empresa fornecedora de produtos para o setor de saúde — segmento similar ao da {{NOME}} — recebeu 16 alertas esta semana: licitações em hospitais, UPAs e secretarias de saúde. Avaliou as 16 em menos de 2 horas. Participou de 5. Para as outras 11, não era o produto ou a região não compensava.',
    p2: 'Você ficou sabendo de quantas dessas 16 licitações?',
    p3: 'Em saúde, algumas licitações são emergenciais — prazo de 24 a 72 horas. Sem monitoramento em tempo real, você nem fica sabendo que elas existiram. As emergenciais costumam ter os melhores preços por unidade.',
    ps: 'A empresa que vai ganhar aquela licitação de R$ 780k não tem produto melhor que o seu. Ela ficou sabendo 15 dias antes e chegou com tempo de verificar especificações técnicas.',
  },
  transporte: {
    assunto: 'Uma transportadora da sua região recebeu 11 contratos esta semana',
    p1: 'Uma empresa de transporte e logística da sua região — porte similar ao da {{NOME}}, frota compatível — recebeu 11 alertas esta semana: contratos de frete, frota e transporte de órgãos públicos do estado. Avaliou os 11 em menos de 1 hora. Decidiu participar de 3. Para os outros 8, não compensava rota ou porte.',
    p2: 'Você ficou sabendo de quantos desses 11 contratos?',
    p3: 'Contratos de transporte têm duração de 12 a 36 meses. Quando o edital abre e você não sabe, perde o contrato inteiro — não só uma viagem. São 1 a 3 anos de receita garantida que vão para quem estava monitorando.',
    ps: 'A transportadora que ganhou aquele contrato de R$ 1,8M não tem frota melhor que a sua. Ela ficou sabendo 20 dias antes e chegou com tempo de calcular rota e montar proposta.',
  },
  alimentacao: {
    assunto: 'Fornecedora de alimentos da sua região recebeu 18 alertas esta semana',
    p1: 'Uma empresa fornecedora de alimentação da sua região — gêneros, merenda, refeição — recebeu 18 alertas esta semana: contratos em prefeituras, escolas e hospitais do estado. Avaliou os 18 em menos de 2 horas. Decidiu participar de 5. Para os outros 13, não valia volume ou logística.',
    p2: 'Você ficou sabendo de quantos desses 18 contratos?',
    p3: 'Contratos de merenda têm duração de 12 meses com renovação frequente. Cada edital que você perde por não saber que existe é um ano inteiro de receita garantida que vai para o concorrente que estava monitorando.',
    ps: 'A empresa que ganhou aquele contrato de merenda de R$ 1,2M não tem comida melhor que a sua. Ela ficou sabendo 18 dias antes e chegou com tempo de calcular frete e precificar.',
  },
  generico: {
    assunto: 'Um concorrente do seu setor está monitorando editais em tempo real',
    p1: 'Uma empresa no mesmo setor que a {{NOME}} — produto ou serviço similar, porte parecido — configurou monitoramento automático. Esta semana recebeu vários alertas. Avaliou quais valiam proposta. Participou dos que faziam sentido. Para o resto, não desperdiçou tempo de equipe.',
    p2: 'Você ficou sabendo de quantos desses editais?',
    p3: 'Empresas que monitoram sistematicamente participam de 5 a 10 vezes mais processos do que as que dependem de busca manual — e vencem contratos na mesma proporção. A diferença não está na qualidade do produto. Está no número de oportunidades que chegam a tempo.',
    ps: 'Cada semana sem monitoramento é uma semana de editais que abriram, correram e fecharam sem que você soubesse que existiam. Esses contratos não voltam.',
  },
}

// ─── Templates por setor — E3 ────────────────────────────────────────────────

interface E3Template {
  assunto: string
  antes: string
  virada: string
  depois: string
  ps: string
}

const E3: Record<Setor, E3Template> = {
  construcao: {
    assunto: 'De 3 obras para 19 em um ano — o que uma construtora mudou',
    antes: 'Uma construtora de médio porte no interior de Minas fechava 3 ou 4 contratos públicos por ano. A estratégia era a mesma de sempre: alguém da equipe olhava o ComprasNet uma ou duas vezes por semana. Às vezes chegava dica de um despachante. Parecia o teto natural.',
    virada: 'Ao configurar alertas para "reforma predial", "pavimentação" e "construção" em todos os portais, chegaram 9 alertas na primeira semana — editais que a empresa nunca teria descoberto na busca manual. Alguns valiam proposta. Outros não. Mas agora a empresa escolhia, em vez de perder por padrão.',
    depois: 'Em 12 meses: 19 licitações participadas (contra 4 no ano anterior). 4 contratos vencidos — R$ 3,1M em volume total. Faturamento de contratos públicos cresceu 280%. A equipe não mudou. O produto não mudou. Mudou o que eles conseguiam ver.',
    ps: '4 contratos em 12 meses, R$ 3,1M — sem mudar equipe, sem mudar produto, sem mudar preço. O que mudou foi o número de licitações que chegavam a tempo de participar.',
  },
  limpeza: {
    assunto: 'De 2 para 9 contratos em 6 meses — empresa de limpeza no interior de SP',
    antes: 'Uma empresa de limpeza e conservação predial em São Paulo fechava 2 ou 3 contratos públicos por ano. A estratégia era indicação de clientes antigos e busca manual no ComprasNet uma vez por semana. Parecia o teto do negócio.',
    virada: 'Ao configurar alertas para "limpeza", "conservação predial" e "higienização" em todos os portais, chegaram alertas de editais em cidades próximas que a empresa nunca teria encontrado buscando manualmente. Alguns valiam proposta, outros não — mas agora a empresa tinha controle sobre a decisão.',
    depois: 'Em 6 meses: 21 licitações participadas (contra 6 nos 6 meses anteriores). 9 contratos vencidos. Faturamento de contratos públicos cresceu 340%. A equipe foi ampliada para atender a demanda. "A empresa era boa antes. Só não estava aparecendo nos lugares certos."',
    ps: '2 contratos por ano para 9 em 6 meses. Crescimento de 340% no faturamento público. Sem mudar preço, sem mudar equipe. Com monitoramento.',
  },
  ti: {
    assunto: 'De 0% para 38% da receita em contratos públicos — em 11 meses',
    antes: 'Uma empresa de software de gestão em Goiânia vivia de indicação e prospecção privada. Contratos públicos? "É muito burocrático, muito lento." Participava esporadicamente, quando alguém da rede indicava um edital específico. A receita pública era próxima de zero.',
    virada: 'Ao configurar alertas para "sistema de gestão", "software municipal" e "suporte" em todos os portais, a empresa passou a receber de 8 a 15 alertas por semana. A maioria não valia participar — mas sempre havia 1 ou 2 que faziam sentido. Para esses, elaborava proposta. Para o resto, não desperdiçava tempo.',
    depois: 'Em 11 meses: contratos com 4 prefeituras e 1 autarquia estadual. Receita de contratos públicos foi de 0% para 38% do faturamento total. "O produto sempre foi bom. O que faltava era estar presente no momento certo."',
    ps: 'Zero para 38% da receita em contratos públicos em 11 meses. Sem mudar o produto. Sem aumentar a equipe. Com 15 minutos por semana avaliando os alertas que chegavam.',
  },
  vigilancia: {
    assunto: 'De 3 para 11 contratos públicos em um ano — empresa de vigilância em SP',
    antes: 'Uma empresa de vigilância de médio porte em São Paulo fechava 3 contratos públicos por ano — todos por indicação ou busca esporádica em portais. A equipe comercial dedicava 2 dias por semana só para fazer busca manual. Era caro e ineficiente.',
    virada: 'Ao configurar alertas para "vigilância patrimonial", "segurança" e "monitoramento eletrônico" em todos os portais, o tempo da equipe comercial foi liberado: em vez de buscar editais, passaram a avaliar e elaborar propostas apenas para os que chegavam automaticamente.',
    depois: 'Em 12 meses: 11 contratos públicos vencidos (contra 3 no ano anterior). Tempo da equipe comercial caiu de 2 dias para 4 horas por semana. Receita de contratos públicos cresceu 210%.',
    ps: '3 contratos para 11 em um ano, receita pública +210%, equipe fazendo mais em menos tempo. O que mudou foi o número de editais que chegavam em tempo hábil.',
  },
  saude: {
    assunto: 'De fornecedora regional para contrato federal — 8 meses',
    antes: 'Uma empresa fornecedora de equipamentos médicos de diagnóstico atuava exclusivamente em hospitais privados e clínicas. Participava de licitações "quando aparecia" — principalmente quando alguém indicava um processo específico. Receita pública era esporádica.',
    virada: 'Ao configurar alertas para os equipamentos específicos que fornecia — por produto e por região — passou a receber de 10 a 20 alertas semanais de licitações de hospitais e secretarias de saúde. A maioria não se encaixava. Mas 1 ou 2 por semana faziam sentido — e agora chegava a tempo de elaborar proposta.',
    depois: 'Em 8 meses: contrato com hospital federal, 2 contratos com secretarias estaduais, 4 contratos municipais. Receita pública foi de 5% para 32% do faturamento total. "Sempre soubemos que o mercado público era grande. Agora conseguimos participar dele de verdade."',
    ps: 'De 5% para 32% da receita em contratos públicos de saúde em 8 meses. Sem mudar produto, sem aumentar equipe. Com visibilidade nos editais certos, na hora certa.',
  },
  transporte: {
    assunto: 'De 2 para 8 contratos em um ano — R$ 4,2M em receita de transporte',
    antes: 'Uma empresa de transporte e logística no interior do Brasil fechava 2 contratos públicos por ano — ambos por indicação de clientes antigos. A busca manual em portais era irregular. Parecia o teto possível.',
    virada: 'Ao configurar alertas para "frete", "transporte" e "logística" em todos os portais, a empresa passou a receber de 8 a 15 alertas semanais — contratos em cidades e estados da região que nunca teria buscado manualmente. Alguns não valiam a rota. Outros eram exatamente o perfil da frota.',
    depois: 'Em 12 meses: 8 contratos públicos vencidos (contra 2 no ano anterior). Volume total: R$ 4,2M em receita de contratos. Frota cresceu 40% para atender a demanda. "Sempre existiram esses contratos. A gente simplesmente nunca ficava sabendo."',
    ps: '2 contratos para 8 em um ano, R$ 4,2M em receita de contratos, frota crescendo 40%. O que mudou foi a visibilidade sobre o que estava sendo licitado na região.',
  },
  alimentacao: {
    assunto: 'De 1 para 9 prefeituras em 8 meses — faturamento público +480%',
    antes: 'Uma empresa fornecedora de gêneros alimentícios para escolas municipais atendia apenas a própria cidade. Não por falta de capacidade — porque nunca ficava sabendo dos editais das prefeituras vizinhas. A busca manual era irregular. Participava de 2 ou 3 licitações por ano.',
    virada: 'Ao configurar alertas para "gêneros alimentícios", "merenda escolar" e "alimentação escolar" em todas as prefeituras do estado, a empresa passou a receber alertas de contratos em cidades no raio de 200km que nunca teria encontrado manualmente. Alguns não valiam o frete. Outros sim.',
    depois: 'Em 8 meses: contratos com 9 prefeituras diferentes (estava em 1 antes). Volume de faturamento público cresceu 480%. Equipe de produção cresceu 60% para atender. "Sempre existiram esses contratos. A gente simplesmente não sabia quando os editais das outras prefeituras abriam."',
    ps: 'De 1 para 9 prefeituras em 8 meses, faturamento público +480%. Sem mudar produto, sem mudar qualidade. Com visibilidade sobre quais prefeituras estavam licitando na região.',
  },
  generico: {
    assunto: 'O que muda quando uma empresa começa a monitorar licitações',
    antes: 'A maioria das empresas fornecedoras para o governo participa de 2 a 5 licitações por ano. A estratégia é sempre a mesma: busca esporádica em portais, indicação de clientes, às vezes aviso de despachante. Parece o teto natural — mas não é.',
    virada: 'Ao configurar monitoramento automático com as palavras-chave certas, o cenário muda desde a primeira semana: chegam alertas de editais compatíveis que nunca apareceriam na busca manual — em cidades vizinhas, em estados da região, em órgãos que você nunca tinha prospectado. Alguns valem proposta, outros não. Mas agora a empresa escolhe — em vez de perder por padrão.',
    depois: 'O padrão observado em empresas que adotam monitoramento sistemático: participação em 5 a 10 vezes mais processos no primeiro ano. Taxa de vitória similar — o que se traduz em 5 a 10 vezes mais contratos ganhos. Sem mudar produto, sem aumentar equipe, sem reduzir preço.',
    ps: '5 a 10 vezes mais participações em licitações, sem mudar produto ou equipe. O que muda é o número de editais que chegam em tempo hábil para elaborar proposta.',
  },
}

// ─── Templates por setor — E5 ────────────────────────────────────────────────

interface E5Template {
  assunto: string
  historia: string
  ps: string
}

const E5: Record<Setor, E5Template> = {
  construcao: {
    assunto: 'Empresa elétrica do Paraná: 2 contratos novos em 2 meses, R$ 520k',
    historia: 'Uma empresa de instalações elétricas do Paraná — 8 funcionários, clientes principalmente na iniciativa privada — configurou alertas para "instalações elétricas", "sistema fotovoltaico" e "reforma elétrica". Em 2 meses, recebeu 31 alertas. Participou de 6 licitações. Venceu 2: um contrato federal de R$ 340k e um municipal de R$ 180k.\n\nA empresa existia há 11 anos e nunca tinha ganhado uma licitação federal. Não por falta de capacidade — por falta de visibilidade no momento certo.',
    ps: '11 anos de empresa, nunca tinha ganhado um contrato federal. Em 2 meses com monitoramento: R$ 520k em contratos. Não foi sorte — foi aparecer nos editais certos no momento certo.',
  },
  limpeza: {
    assunto: 'Empresa de limpeza hospitalar: 4 contratos novos em 4 meses',
    historia: 'Uma empresa de limpeza hospitalar especializada no interior de SP — 22 funcionários — nunca tinha participado de licitações de hospitais fora da própria cidade. Configurou alertas para "limpeza hospitalar", "higienização" e "conservação".\n\nEm 4 meses: 4 contratos novos com prefeituras e uma UPA estadual nas cidades vizinhas. Volume total: R$ 1,4M por ano em contratos de 24 meses. A empresa contratou mais 18 funcionários para atender.',
    ps: '18 funcionários contratados para atender os novos contratos. O crescimento não veio de preço menor — veio de aparecer nas cidades certas, nos momentos certos.',
  },
  ti: {
    assunto: 'Empresa de suporte no Nordeste: R$ 290k no primeiro pregão federal',
    historia: 'Uma empresa de suporte técnico e cabeamento estruturado do Nordeste — nunca tinha participado de um processo federal. Configurou alertas para "suporte", "rede", "cabeamento estruturado" e "TI".\n\nEm 60 dias: 41 alertas recebidos, 5 processos participados, 1 contrato federal vencido: R$ 290k. A empresa existia há 9 anos. Nunca tinha ganhado nada do governo federal — não por falta de capacidade técnica, mas porque nunca ficava sabendo dos pregões a tempo.',
    ps: '9 anos de empresa, nunca tinha ganhado um contrato federal. Em 60 dias com monitoramento: R$ 290k. O governo estava comprando o que eles vendiam — eles só não sabiam quando os pregões saíam.',
  },
  vigilancia: {
    assunto: 'Empresa de vigilância no Nordeste: primeiro contrato federal em 15 anos',
    historia: 'Uma empresa de vigilância patrimonial com 15 anos de operação no Nordeste — nunca tinha conseguido um contrato federal. Configurou alertas para "vigilância patrimonial", "vigilância armada" e "monitoramento eletrônico".\n\nEm 3 meses: 2 contratos novos — um municipal de R$ 480k por ano e um federal de R$ 920k por ano. "Em 15 anos, nunca me senti tão bem posicionado no mercado público."',
    ps: '15 anos de empresa, nunca tinha ganhado um contrato federal. Em 3 meses com monitoramento: R$ 1,4M em novos contratos anuais. Não foi sorte — foi visibilidade no momento certo.',
  },
  saude: {
    assunto: 'Distribuidora de insumos: R$ 2,1M em novos contratos em 6 meses',
    historia: 'Uma distribuidora de insumos hospitalares com 6 funcionários — equipe pequena, atuação regional — configurou alertas para os insumos específicos que distribuía. Em 6 meses, participou de 28 licitações em hospitais e UPAs de todo o estado.\n\nVenceu 7 contratos. Volume total: R$ 2,1M em pedidos novos — contratos de fornecimento contínuo. "Antes, as licitações que a gente ganhava vinham por acaso. Agora a gente escolhe quais vale participar."',
    ps: 'R$ 2,1M em contratos novos em 6 meses para uma empresa de 6 pessoas. Não foi sorte. Foi aparecer no momento certo, com tempo para elaborar proposta.',
  },
  transporte: {
    assunto: 'Transportadora do Centro-Oeste: 3 contratos federais em 5 meses',
    historia: 'Uma empresa de transporte de cargas do Centro-Oeste — operação regional, nunca tinha ganhado um contrato federal. Configurou alertas para "frete", "transporte de cargas" e "logística".\n\nEm 5 meses: 3 contratos federais vencidos — distribuição de materiais para órgãos do governo. Volume total: R$ 2,8M em contratos anuais. Frota cresceu para atender. "Não sabia que o governo federal contratava transporte do nosso tamanho. Agora sei."',
    ps: 'Nunca tinha ganhado um contrato federal. Em 5 meses com monitoramento: R$ 2,8M em contratos anuais. O governo federal contrata transportadoras regionais — a maioria delas só não sabe quando os editais abrem.',
  },
  alimentacao: {
    assunto: 'Fornecedora de merenda no Norte: de 1 para 12 prefeituras em 10 meses',
    historia: 'Uma empresa fornecedora de gêneros alimentícios no Norte do Brasil atendia 1 prefeitura — a cidade sede. Configurou alertas para "merenda escolar", "gêneros alimentícios" e "alimentação escolar".\n\nEm 10 meses: contratos com 12 prefeituras — todas dentro do raio de 300km. Volume total: R$ 3,8M em contratos anuais. Equipe e capacidade produtiva foram ampliadas. "Sempre soubemos que éramos bons. Agora temos contratos que provam isso."',
    ps: '1 prefeitura para 12 em 10 meses — R$ 3,8M em contratos anuais novos. O produto era bom antes. O que mudou foi saber quando os editais das outras prefeituras abriam.',
  },
  generico: {
    assunto: '8 anos sem licitação — e R$ 890k em contratos no primeiro ano com monitoramento',
    historia: 'Uma empresa prestadora de serviços especializados com 8 anos de operação — nunca tinha participado de licitação pública. Achava que "não era para o seu perfil". Configurou alertas para os serviços que prestava.\n\nEm 3 meses: 4 contratos públicos vencidos — 3 municipais e 1 estadual. Volume total: R$ 890k no primeiro ano. "Em 8 anos achei que não era pra nós. Em 3 meses descobri que éramos exatamente o que o governo estava buscando."',
    ps: '8 anos sem participar de licitação — "não era pra nós". Em 3 meses com monitoramento: R$ 890k em novos contratos. O governo estava comprando o que ela vendia o tempo todo. Ela só não sabia.',
  },
}

// ─── Templates genéricos — E4, E6, E7, E8 ────────────────────────────────────

const E4 = {
  assunto: 'Três razões que travam a maioria — e minha resposta para cada uma',
  p0: 'Enviei alguns e-mails nos últimos dias. Você ainda não ativou o trial. Isso costuma acontecer por uma dessas três razões:',
  objecoes: [
    {
      q: '"Não tenho equipe para acompanhar mais licitações"',
      r: 'O alerta chega com objeto, valor estimado, órgão, prazo e link para o edital. Você avalia em 2 minutos se vale participar ou não — sem abrir portal, sem busca manual. Só investe tempo nos editais que fazem sentido. O sistema faz a triagem; você faz a decisão.',
    },
    {
      q: '"Já tentei licitação uma vez e não deu certo"',
      r: 'A taxa de sucesso em licitações está diretamente ligada ao volume. Empresas que participam de 3 por ano têm resultado muito diferente das que participam de 30 — pela lei dos grandes números. O Monitor coloca você em 5 a 10 vezes mais processos no mesmo período, sem aumentar o esforço por processo.',
    },
    {
      q: '"7 dias não são suficientes para ver resultado"',
      r: 'Na primeira semana, você vai receber alertas de editais compatíveis com o que sua empresa já faz. Vai ver exatamente o que está saindo no mercado — em tempo real. Isso já muda a percepção do que você estava perdendo. E se depois de 7 dias não fizer sentido, você cancela. Sem cobranças, sem burocracia.',
    },
  ],
  p1: 'Se não foi nenhuma dessas três, responda este e-mail e me diz o que está segurando — vejo o que consigo resolver.',
  ps: 'Trial de 7 dias gratuito, sem cartão de crédito, sem compromisso. Se depois de uma semana os alertas não fizerem sentido para o seu caso, você cancela. O risco é zero.',
}

const E6 = {
  assunto: 'Contratos que fecharam este mês sem você participar',
  p1: 'Faz dois meses que enviei o primeiro e-mail sobre o mercado público no seu setor.',
  p2: 'Nesse período, centenas de editais compatíveis com o perfil da sua empresa abriram e fecharam. Alguns valiam proposta. Outros não. Mas você não teve como escolher — porque não recebeu os alertas.',
  p3: 'O trial de 7 dias não custa nada e não pede cartão. Em uma semana, você vê em tempo real o que está sendo licitado no seu setor — e decide se vale continuar.',
  ps: 'Os próximos editais estão sendo publicados agora. Os prazos já começaram a correr.',
}

const E7 = {
  assunto: 'Ainda faz sentido para a {{NOME}}?',
  p1: 'Enviamos alguns e-mails sobre monitoramento de licitações nos últimos meses. Você nunca respondeu.',
  p2: 'Uma pergunta direta: sua empresa ainda participa de licitações públicas?',
  p3: 'Pode ser que o mercado público não faça mais sentido para o seu modelo de negócio. Pode ser que você já tenha uma solução de monitoramento. Pode ser que esteja em outro momento.',
  p4: 'Responda este e-mail com uma linha — vou entender a resposta, seja ela qual for. Se não responder, vou assumir que não faz mais sentido e encerro a sequência por aqui.',
  ps: 'Se a resposta for "ainda participo, mas não tenho tempo para configurar", podemos fazer isso juntos em 10 minutos por videochamada — sem custo. Só responder este e-mail.',
}

const E8 = {
  assunto: 'Último e-mail — mas a porta continua aberta',
  p1: 'Este é o último e-mail que vou enviar.',
  p2: 'Ao longo de vários meses, compartilhei dados sobre o mercado público no seu setor, casos de empresas similares à sua e como o monitoramento muda o volume de contratos que uma empresa consegue participar.',
  p3: 'Não vou mais enviar e-mails automaticamente — mas a porta continua aberta. Se em algum momento a situação mudar e o mercado público se tornar uma prioridade, o Monitor de Licitações vai estar aqui.',
  p4: 'E se quiser conversar diretamente, é só responder este e-mail.',
  p5: 'Obrigado pela atenção ao longo desse tempo.',
  ps: 'O link abaixo vai continuar funcionando. Quando a hora for certa, a oportunidade vai estar aqui.',
}

// ─── Exportação principal ─────────────────────────────────────────────────────

function limparNome(razao: string): string {
  return razao.replace(/^\d{8}\s+/, '').trim()
}

function nl2br(s: string): string {
  return s.replace(/\n/g, '<br>')
}

export function emailCaptacao(p: ParamsCaptacao) {
  const nome   = p.nomeFantasia || limparNome(p.razaoSocial)
  const cidade = p.municipio ? `${p.municipio}${p.uf ? '/' + p.uf : ''}` : null
  const url    = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const num    = p.numeroEmail ?? 1
  const setor  = detectarSetor(p.cnae)
  const lics   = p.licitacoes ?? []
  const UNSUB  = '{{UNSUB_TOKEN}}'

  const campanha = num === 1 ? 'trial7d' : `cap${num}`
  const ctaDest  = `${url}/cadastro?ref=captacao-email&utm_source=captacao&utm_medium=email&utm_campaign=${campanha}&utm_content=${setor}`
  const ctaHref  = p.id ? `${url}/api/track/click/${p.id}?url=${encodeURIComponent(ctaDest)}` : ctaDest
  const pixelTag = p.id
    ? `<img src="${url}/api/track/open/${p.id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : ''

  const sub = (s: string) => s.replace(/\{\{NOME\}\}/g, nome)
  const cta = (text: string) =>
    `<p style="${P}"><a href="${ctaHref}" style="color:#6B0F1A;font-weight:600;text-decoration:none;">${text}</a></p>`
  const sig = () => ``
  const ps = (text: string) =>
    `<p style="${PS}">P.S.: ${text}</p>`
  const wrap = (assunto: string, conteudo: string) =>
    wrapCaptacao({ nome, cidade, assunto, conteudo, pixelTag, url, unsub: UNSUB })
      .replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB)

  // ── E1 ──────────────────────────────────────────────────────────────────────
  if (num === 1) {
    const t = E1[setor]
    const subject = sub(t.assunto)
    const conteudo = [
      `<p style="${P}">${t.p1}</p>`,
      `<p style="${P}">${t.p2}</p>`,
      `<p style="${P}">${t.p3}</p>`,
      buildLicitacoesHtml(lics, ctaHref),
      cta(t.ctaText),
      sig(),
      ps(t.ps),
    ].join('')
    const text = `${t.p1}\n\n${t.p2}\n\n${t.p3}${buildLicitacoesTxt(lics)}\n\n${t.ctaText}:\n${ctaDest}\n\nP.S.: ${t.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E2 ──────────────────────────────────────────────────────────────────────
  if (num === 2) {
    const t = E2[setor]
    const subject = sub(t.assunto)
    const conteudo = [
      `<p style="${P}">${sub(t.p1)}</p>`,
      `<p style="${P}">${t.p2}</p>`,
      `<p style="${P}">${t.p3}</p>`,
      buildLicitacoesHtml(lics, ctaHref),
      cta('→ ver editais do meu setor (trial gratuito 7 dias)'),
      sig(),
      ps(t.ps),
    ].join('')
    const text = `${sub(t.p1)}\n\n${t.p2}\n\n${t.p3}${buildLicitacoesTxt(lics)}\n\nTrial gratuito 7 dias:\n${ctaDest}\n\nP.S.: ${t.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E3 ──────────────────────────────────────────────────────────────────────
  if (num === 3) {
    const t = E3[setor]
    const subject = sub(t.assunto)
    const conteudo = [
      `<p style="${P}">Até agora falei sobre o que está sendo licitado no seu setor. Hoje quero mostrar um caso concreto.</p>`,
      `<p style="${P}"><strong>Antes:</strong> ${t.antes}</p>`,
      `<p style="${P}"><strong>O que mudou:</strong> ${t.virada}</p>`,
      `<p style="${P}"><strong>Resultado:</strong> ${t.depois}</p>`,
      cta('→ quero ver o que está sendo licitado no meu setor'),
      sig(),
      ps(t.ps),
    ].join('')
    const text = `Até agora falei sobre o que está sendo licitado no seu setor. Hoje quero mostrar um caso concreto.\n\nAntes: ${t.antes}\n\nO que mudou: ${t.virada}\n\nResultado: ${t.depois}\n\nTrial gratuito 7 dias:\n${ctaDest}\n\nP.S.: ${t.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E4 ──────────────────────────────────────────────────────────────────────
  if (num === 4) {
    const subject = sub(E4.assunto)
    const objecoesHtml = E4.objecoes.map((o, i) => `
      <p style="${P}"><strong>${i + 1}. ${o.q}</strong><br>${o.r}</p>`).join('')
    const conteudo = [
      `<p style="${P}">${E4.p0}</p>`,
      objecoesHtml,
      `<p style="${P}">${E4.p1}</p>`,
      cta('→ ativar trial gratuito de 7 dias'),
      sig(),
      ps(E4.ps),
    ].join('')
    const objecoesTxt = E4.objecoes.map((o, i) => `${i + 1}. ${o.q}\n${o.r}`).join('\n\n')
    const text = `${E4.p0}\n\n${objecoesTxt}\n\n${E4.p1}\n\nTrial gratuito 7 dias:\n${ctaDest}\n\nP.S.: ${E4.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E5 ──────────────────────────────────────────────────────────────────────
  if (num === 5) {
    const t = E5[setor]
    const subject = sub(t.assunto)
    const conteudo = [
      `<p style="${P}">Tem um caso novo que quero compartilhar.</p>`,
      `<p style="${P}">${nl2br(t.historia)}</p>`,
      `<p style="${P}">O ponto não é que todo mundo vai ter o mesmo resultado. O ponto é que, sem monitoramento, você nem chega a participar dos processos que fazem sentido.</p>`,
      cta('→ ver editais do meu setor (trial gratuito 7 dias)'),
      sig(),
      ps(t.ps),
    ].join('')
    const text = `Tem um caso novo que quero compartilhar.\n\n${t.historia}\n\nO ponto não é que todo mundo vai ter o mesmo resultado. O ponto é que, sem monitoramento, você nem chega a participar dos processos que fazem sentido.\n\nTrial gratuito 7 dias:\n${ctaDest}\n\nP.S.: ${t.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E6 ──────────────────────────────────────────────────────────────────────
  if (num === 6) {
    const subject = sub(E6.assunto)
    const conteudo = [
      `<p style="${P}">${E6.p1}</p>`,
      `<p style="${P}">${E6.p2}</p>`,
      `<p style="${P}">${E6.p3}</p>`,
      cta('→ ativar trial gratuito agora'),
      sig(),
      ps(E6.ps),
    ].join('')
    const text = `${E6.p1}\n\n${E6.p2}\n\n${E6.p3}\n\nTrial gratuito 7 dias:\n${ctaDest}\n\nP.S.: ${E6.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E7 ──────────────────────────────────────────────────────────────────────
  if (num === 7) {
    const subject = sub(E7.assunto)
    const conteudo = [
      `<p style="${P}">${E7.p1}</p>`,
      `<p style="${P}">${E7.p2}</p>`,
      `<p style="${P}">${E7.p3}</p>`,
      `<p style="${P}">${E7.p4}</p>`,
      cta('→ ou ative o trial de 7 dias agora'),
      sig(),
      ps(E7.ps),
    ].join('')
    const text = `${E7.p1}\n\n${E7.p2}\n\n${E7.p3}\n\n${E7.p4}\n\nOu ative o trial de 7 dias (sem cartão):\n${ctaDest}\n\nP.S.: ${E7.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: wrap(subject, conteudo), text }
  }

  // ── E8 ──────────────────────────────────────────────────────────────────────
  const subject = sub(E8.assunto)
  const conteudo = [
    `<p style="${P}">${E8.p1}</p>`,
    `<p style="${P}">${E8.p2}</p>`,
    `<p style="${P}">${E8.p3}</p>`,
    cta('→ ativar trial gratuito de 7 dias'),
    `<p style="${P}">${E8.p4}</p>`,
    `<p style="${P}">${E8.p5}</p>`,
    sig(),
    ps(E8.ps),
  ].join('')
  const text = `${E8.p1}\n\n${E8.p2}\n\n${E8.p3}\n\nTrial gratuito 7 dias:\n${ctaDest}\n\n${E8.p4}\n\n${E8.p5}\n\nP.S.: ${E8.ps}\n\n--\nMonitor de Licitações\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
  return { subject, html: wrap(subject, conteudo), text }
}
