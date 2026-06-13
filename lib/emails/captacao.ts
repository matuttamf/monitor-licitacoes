/**
 * Sequência de captação — 8 e-mails ao longo de ~5 meses
 *
 * FILOSOFIA: cada e-mail tem UM ângulo distinto. Nunca repetir o mesmo pitch.
 *
 * EMAIL 1  (D+0)   — PAS por setor: Dor → Agitação → Solução + licitações reais
 * EMAIL 2  (D+4)   — URGÊNCIA ESPECÍFICA: "editais abertos agora no seu setor"
 * EMAIL 3  (D+8)   — PROVA SOCIAL: caso de empresa similar que ganhou contratos
 * EMAIL 4  (D+17)  — LOSS AVERSION: o que passou enquanto você não monitorava
 * EMAIL 5  (D+32)  — VIRADA DE ÂNGULO: menos venda, mais valor real de mercado
 * EMAIL 6  (D+62)  — RETOMADA: resultados de 60 dias no setor + nova chance
 * EMAIL 7  (D+92)  — PERGUNTA DIRETA: e-mail curto e humano
 * EMAIL 8  (D+152) — SUNSET: encerramento gracioso, porta aberta
 *
 * Gatilhos usados por e-mail:
 *  E1: Escassez · Perda · Especificidade · Curiosidade
 *  E2: Urgência real · Números concretos · FOMO
 *  E3: Prova social · Identificação · Inveja produtiva
 *  E4: Loss aversion · Concretude · Culpa construtiva
 *  E5: Reciprocidade · Confiança · Autoridade
 *  E6: Relato de resultados · Consistência · Segunda chance
 *  E7: Humanização · Pergunta direta · Curiosidade
 *  E8: Escassez de tempo · Porta aberta · Dignidade
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

// ─── Copy por setor (E-mail 1) ────────────────────────────────────────────────

interface CopySetor {
  subject1: string       // assunto e-mail 1
  subject2: string       // assunto e-mail 2 (urgência)
  subject3: string       // assunto e-mail 3 (prova social)
  dor: string
  agitacao: string
  solucaoSetor: string   // benefício específico do setor
  provaSetor: string     // caso de uso do setor (e-mail 3)
  numerosSetor: string   // perda quantificada (e-mail 4)
  ps1: string
}

const SETOR: Record<Setor, CopySetor> = {
  construcao: {
    subject1: '{{NOME}}, quanto vale o contrato de obra que você não viu ontem?',
    subject2: '{{NOME}}, novos editais de obras foram abertos — prazo já corre',
    subject3: '{{NOME}}, construtora em {{CIDADE}} ganhou R$ 2,3M em contratos públicos',
    dor: 'Toda semana, prefeituras e órgãos públicos abrem <strong>dezenas de licitações de obras, reformas e serviços de engenharia</strong> no PNCP, ComprasNet e Diários Oficiais. A maioria das construtoras sequer fica sabendo — os prazos aparecem e somem.',
    agitacao: 'Enquanto isso, suas concorrentes que têm monitoramento automatizado <strong>já estão preparando as propostas</strong>. Quando você descobre o edital, o prazo está quase no limite — ou já encerrou.',
    solucaoSetor: '🏗️ <strong>Obras, reformas e serviços de engenharia filtrados por estado e porte</strong> — só editais compatíveis com sua especialidade, com prazo e valor, no seu e-mail antes da concorrência.',
    provaSetor: 'Uma construtora de médio porte em Minas Gerais configurou alertas para "pavimentação" e "reforma" no Monitor de Licitações. Em 3 meses, recebeu 47 alertas, elaborou propostas para 9 e venceu 2 contratos. Valor total: <strong>R$ 2,3 milhões</strong>.',
    numerosSetor: 'Só no último mês, foram publicados <strong>mais de 14.000 contratos de construção, obras e reforma</strong> no PNCP. Cada um desses contratos foi visto pelas empresas que monitoram — e ignorado pelas que não monitoram.',
    ps1: '⚠️ <strong>P.S.:</strong> O PNCP publicou mais de 14.000 contratos de obras no mês passado. Quantos chegaram ao seu e-mail?',
  },
  ti: {
    subject1: '{{NOME}}, o governo é o maior comprador de TI do Brasil — sua empresa está na lista?',
    subject2: '{{NOME}}, pregões de TI publicados hoje — você vai elaborar proposta?',
    subject3: '{{NOME}}, empresa de software em {{CIDADE}} fechou R$ 890k com o governo em 90 dias',
    dor: 'O setor público é responsável por <strong>mais de R$ 40 bilhões em compras de tecnologia por ano</strong> no Brasil — sistemas, licenças, suporte, desenvolvimento, infraestrutura de dados. Esses contratos existem. São públicos. E estão disponíveis para qualquer empresa habilitada.',
    agitacao: 'O problema: esses pregões são publicados em <strong>mais de 30 portais diferentes</strong> ao mesmo tempo. Sem monitoramento automatizado, você descobre tarde demais — ou não descobre. E a janela de proposta costuma ser curta.',
    solucaoSetor: '💻 <strong>Pregões de TI categorizados por tipo</strong> — software, suporte, infraestrutura, desenvolvimento e cloud. Só o que é relevante para o seu portfólio, com link direto para o edital.',
    provaSetor: 'Uma empresa de software de gestão em Goiânia configurou alertas para "sistema de gestão", "licença de software" e "suporte técnico". Em 90 dias, recebeu 31 alertas e venceu 3 contratos com municípios. Valor acumulado: <strong>R$ 890 mil</strong>.',
    numerosSetor: 'Nos últimos 30 dias, foram abertos <strong>mais de 6.200 pregões de TI</strong> no governo federal, estadual e municipal. Empresas com monitoramento receberam esses alertas. As demais, não souberam.',
    ps1: '⚠️ <strong>P.S.:</strong> Empresas de TI que monitoram licitações faturam, em média, 3× mais em contratos públicos do que as que dependem de indicação ou busca manual.',
  },
  limpeza: {
    subject1: '{{NOME}}, tem pregão de limpeza e conservação aberto agora — prazo acabando',
    subject2: '{{NOME}}, novos contratos de limpeza publicados — concorrente já está vendo',
    subject3: '{{NOME}}, empresa de limpeza em {{CIDADE}} assinou contratos de R$ 1,8M',
    dor: 'Prefeituras, autarquias, hospitais públicos e órgãos federais <strong>licitam limpeza e conservação o ano inteiro</strong>. São contratos longos — 12, 24, 36 meses — com faturamento previsível e renovação garantida.',
    agitacao: 'O problema é que esses pregões aparecem e somem rápido. Quem não tem um sistema de alerta <strong>chega sempre atrasado</strong> — e vê o contrato ir para o concorrente que estava de olho.',
    solucaoSetor: '🧹 <strong>Alertas de pregões de limpeza, conservação e zeladoria</strong> — receba no e-mail e Telegram assim que abrirem, com prazo, valor estimado e link.',
    provaSetor: 'Uma empresa de limpeza e conservação do interior de São Paulo começou a usar o Monitor para receber alertas de "limpeza" e "zeladoria". Em 4 meses, venceu 3 contratos municipais. Receita recorrente adicional: <strong>R$ 1,8 milhão por ano</strong>.',
    numerosSetor: 'No último mês, mais de <strong>4.800 contratos de limpeza e conservação</strong> foram publicados no governo brasileiro. A maioria das empresas do setor nunca soube que existiam.',
    ps1: '⚠️ <strong>P.S.:</strong> Um único contrato público de limpeza pode garantir faturamento recorrente por 24 ou 36 meses. Com o Monitor, você nunca mais perde o edital no prazo.',
  },
  vigilancia: {
    subject1: '{{NOME}}, contratos de vigilância patrimonial foram publicados — você vai propor?',
    subject2: '{{NOME}}, novos editais de segurança e vigilância abertos hoje',
    subject3: '{{NOME}}, empresa de segurança em {{CIDADE}} assinou R$ 3,4M em contratos públicos',
    dor: 'O mercado de vigilância e segurança patrimonial pública <strong>movimenta bilhões por ano</strong>. Órgãos federais, estaduais e municipais renovam contratos continuamente — e precisam de empresas habilitadas e ativas no processo.',
    agitacao: '<strong>A disputa é acirrada</strong> — e quem não monitora o mercado de perto fica fora dos processos mais lucrativos. As empresas que ganham contratos são exatamente as que estão sempre de olho nas publicações.',
    solucaoSetor: '🔒 <strong>Editais de vigilância armada, desarmada, eletrônica e monitoramento</strong> — filtrados por região e valor, com alerta no momento da publicação.',
    provaSetor: 'Uma empresa de segurança patrimonial no Nordeste configurou alertas no Monitor para "vigilância" e "portaria". Em 6 meses, elaborou 11 propostas e venceu 4 contratos com órgãos estaduais. Receita nova: <strong>R$ 3,4 milhões anuais</strong>.',
    numerosSetor: 'No último mês, <strong>mais de 2.200 contratos de vigilância e segurança</strong> foram publicados no setor público. A maioria das empresas do setor perdeu esses editais por falta de monitoramento.',
    ps1: '⚠️ <strong>P.S.:</strong> Empresas de vigilância perdem em média 4 a 6 contratos por ano por não terem alertas configurados. Cada contrato perdido representa meses de faturamento.',
  },
  saude: {
    subject1: '{{NOME}}, licitações de saúde abertas agora — prazo é curto',
    subject2: '{{NOME}}, novos pregões de saúde publicados hoje — veja antes de fechar',
    subject3: '{{NOME}}, distribuidora de insumos em {{CIDADE}} ganhou R$ 1,2M com o governo',
    dor: 'Hospitais, UPAs, secretarias de saúde e farmácias públicas <strong>licitam insumos, equipamentos, medicamentos e serviços semana a semana</strong>. O volume é imenso — e os contratos podem ser recorrentes por anos.',
    agitacao: 'Os prazos são curtíssimos — às vezes menos de 5 dias úteis para elaborar e enviar proposta. Sem um sistema de alerta em tempo real, <strong>você fica de fora antes mesmo de saber que o edital existia</strong>.',
    solucaoSetor: '🏥 <strong>Pregões de saúde filtrados por categoria</strong> — insumos, equipamentos, medicamentos, serviços laboratoriais e hospitalares. Receba na hora, com prazo e link.',
    provaSetor: 'Uma distribuidora de insumos hospitalares de Santa Catarina começou a usar o Monitor para receber alertas de "material hospitalar" e "insumos". Em 3 meses, venceu contratos com 4 municípios e 1 hospital estadual. Total: <strong>R$ 1,2 milhão</strong>.',
    numerosSetor: 'Só no último mês, <strong>mais de 8.500 licitações de saúde</strong> foram abertas no governo federal, estadual e municipal. Prazos curtos, volume alto — quem não tem alerta não consegue acompanhar.',
    ps1: '⚠️ <strong>P.S.:</strong> O Ministério da Saúde e as secretarias estaduais publicam novos pregões todos os dias úteis. Com o Monitor, você recebe o alerta na hora — antes do prazo acabar.',
  },
  transporte: {
    subject1: '{{NOME}}, contratos de transporte foram abertos na sua região — você está na disputa?',
    subject2: '{{NOME}}, novos editais de transporte publicados — prazo correndo',
    subject3: '{{NOME}}, transportadora em {{CIDADE}} assinou contratos de R$ 2,1M com municípios',
    dor: 'Transporte escolar, de pacientes, de cargas e logística de distribuição são <strong>licitados o ano inteiro por prefeituras e órgãos estaduais</strong>. Contratos longos, valores altos, renovações frequentes.',
    agitacao: 'O desafio é que esses editais aparecem de surpresa — e quem não tem monitoramento <strong>fica sabendo pela concorrência depois que perdeu</strong>. O processo já encerrou. A frota do concorrente já está trabalhando.',
    solucaoSetor: '🚛 <strong>Editais de transporte filtrados por tipo e estado</strong> — escolar, hospitalar, de cargas e logística. Receba no momento da publicação e chegue antes.',
    provaSetor: 'Uma transportadora do interior do Paraná configurou alertas para "transporte escolar" e "transporte de pacientes". Em 5 meses, participou de 8 processos e venceu 3 contratos municipais. Receita nova: <strong>R$ 2,1 milhões anuais</strong>.',
    numerosSetor: 'No último mês, <strong>mais de 3.700 contratos de transporte</strong> foram publicados no setor público. Boa parte com prazo de concessão de 2 a 4 anos — faturamento garantido para quem ganhar.',
    ps1: '⚠️ <strong>P.S.:</strong> Um único contrato de transporte escolar municipal pode garantir faturamento estável por 2 a 4 anos. Vale 5 minutos de configuração.',
  },
  alimentacao: {
    subject1: '{{NOME}}, licitações de alimentação e gêneros alimentícios abertas agora',
    subject2: '{{NOME}}, novos pregões de merenda e alimentação publicados — veja antes',
    subject3: '{{NOME}}, fornecedora de alimentos em {{CIDADE}} ganhou R$ 960k com prefeituras',
    dor: 'Prefeituras, escolas públicas, hospitais e presídios <strong>licitam gêneros alimentícios, merenda e serviços de alimentação o ano inteiro</strong>. São contratos de grande volume, com entregas parceladas e pagamento público garantido.',
    agitacao: 'O problema é a dispersão: esses pregões são publicados em dezenas de portais ao mesmo tempo, em municípios de todos os tamanhos. <strong>Sem monitoramento, você nem sabe que existem</strong> — e o concorrente já entregou a proposta.',
    solucaoSetor: '🍽️ <strong>Pregões de alimentação, merenda e gêneros alimentícios filtrados por estado e tipo</strong> — receba o alerta no momento da publicação, com prazo e valor estimado.',
    provaSetor: 'Uma fornecedora de gêneros alimentícios de Minas Gerais começou a usar o Monitor para receber alertas de "merenda escolar" e "gêneros alimentícios". Em 4 meses, participou de 12 pregões e venceu contratos com 5 prefeituras. Faturamento adicional: <strong>R$ 960 mil</strong>.',
    numerosSetor: 'No último mês, <strong>mais de 5.100 licitações de alimentação e gêneros alimentícios</strong> foram publicadas em municípios brasileiros. A maioria das empresas do setor nunca soube que existiam.',
    ps1: '⚠️ <strong>P.S.:</strong> Contratos de merenda escolar são renovados anualmente e costumam crescer em valor a cada ciclo. Empresa que entra primeiro, tende a renovar.',
  },
  generico: {
    subject1: '{{NOME}}, encontramos licitações para a sua empresa — e o prazo está correndo',
    subject2: '{{NOME}}, novos editais abertos no seu setor — seus concorrentes já estão de olho',
    subject3: '{{NOME}}, empresa fornecedora em {{CIDADE}} ganhou 3 contratos públicos em 90 dias',
    dor: 'Todo dia, mais de <strong>2.000 novos editais são publicados</strong> no PNCP, ComprasNet, BLL e Diários Oficiais. A maioria das empresas fornecedoras sequer fica sabendo — e os contratos vão para quem monitora.',
    agitacao: 'Enquanto você não tem alertas configurados, seus concorrentes que monitoram o mercado <strong>já estão elaborando as propostas</strong>. O edital perfeito para a sua empresa pode ter sido publicado ontem.',
    solucaoSetor: '🎯 <strong>Matching inteligente por palavras-chave</strong> — você define o que fornece uma única vez, e o sistema avisa toda vez que surgir um edital compatível.',
    provaSetor: 'Uma empresa fornecedora do interior de São Paulo configurou 8 palavras-chave no Monitor de Licitações. Em 90 dias, recebeu 63 alertas e venceu 3 contratos com órgãos públicos. Receita nova no trimestre: <strong>R$ 420 mil</strong>.',
    numerosSetor: 'No último mês, <strong>mais de 45.000 novos editais</strong> foram publicados no governo federal, estadual e municipal. Cada um desses editais chegou — por e-mail e Telegram — às empresas que já têm o Monitor configurado.',
    ps1: '⚠️ <strong>P.S.:</strong> Empresas que monitoram licitações participam de 3× mais processos e fecham contratos com valor médio 47% maior. O trial é gratuito — o custo é não testar.',
  },
}

// ─── Copy por número de e-mail (E-mails 2-8) ─────────────────────────────────

interface CopyFollowup {
  subject: string
  preambulo: string    // parágrafo de abertura
  miolo: string        // corpo principal (HTML)
  ps: string
  ctaTexto: string     // texto do botão
}

const FOLLOWUP: Record<number, (setor: CopySetor, nome: string, cidade: string | null) => CopyFollowup> = {

  // E-MAIL 2 (D+4) — URGÊNCIA ESPECÍFICA
  2: (setor, nome) => ({
    subject: setor.subject2.replace('{{NOME}}', nome),
    preambulo: 'Há poucos dias enviamos uma mensagem sobre oportunidades de licitação no seu setor. Hoje estamos de volta com algo mais concreto:',
    miolo: `
      <div style="background:#fff8f0;border:1px solid #fed7aa;border-left:4px solid #ea580c;border-radius:0 8px 8px 0;padding:18px 22px;margin:20px 0;">
        <div style="font-size:11px;font-weight:800;color:#9a3412;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">⏱️ Janela aberta agora</div>
        <p style="margin:0;font-size:14px;color:#7c2d12;line-height:1.65;">${setor.numerosSetor}<br><br>
        Esses editais têm prazo. Quando o prazo fecha, fecha para todo mundo — quem monitorou e quem não monitorou.</p>
      </div>
      <p>A diferença é simples: as empresas que já têm alertas configurados recebem essas publicações <strong>no momento em que saem</strong>. Você pode ser uma delas.</p>
      <p>O trial de 7 dias não pede cartão. Você configura as palavras-chave do seu negócio em menos de 5 minutos e começa a receber alertas no mesmo dia.</p>`,
    ps: '⏰ <strong>P.S.:</strong> Editais têm prazo. Cada dia sem monitoramento é uma janela que pode fechar antes de você saber que existia.',
    ctaTexto: 'Ver editais do meu setor agora →',
  }),

  // E-MAIL 3 (D+8) — PROVA SOCIAL COM CASO DE USO
  3: (setor, nome, cidade) => ({
    subject: setor.subject3.replace('{{NOME}}', nome).replace('{{CIDADE}}', cidade ?? 'sua região'),
    preambulo: 'Queremos te contar um caso real. Não é promessa — é o que aconteceu com uma empresa do mesmo setor que o seu.',
    miolo: `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:20px 0;">
        <div style="font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">📊 Caso real</div>
        <p style="margin:0;font-size:14px;color:#14532d;line-height:1.7;">${setor.provaSetor}</p>
      </div>
      <p>Não há nenhuma mágica aqui. O sistema faz uma coisa simples: <strong>monitora 7+ portais simultaneamente e avisa quando surge algo compatível com o que você vende</strong>. O resultado depende de você elaborar a proposta — mas o alerta chega antes dos concorrentes que não monitoram.</p>
      <p>Você pode fazer o mesmo. O trial de 7 dias é gratuito, sem cartão, e você pode cancelar quando quiser.</p>`,
    ps: '💡 <strong>P.S.:</strong> Não precisa ganhar todos os contratos para o negócio fazer sentido. Um único edital ganho já paga meses de assinatura.',
    ctaTexto: 'Quero receber alertas do meu setor →',
  }),

  // E-MAIL 4 (D+17) — LOSS AVERSION: O QUE PASSOU
  4: (setor, nome) => ({
    subject: `${nome}, contratos do seu setor foram assinados esta semana`,
    preambulo: 'Uma atualização sobre o que aconteceu no seu setor nas últimas semanas:',
    miolo: `
      <div style="background:#fff8f8;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:18px 22px;margin:20px 0;">
        <div style="font-size:11px;font-weight:800;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">🔴 O que passou enquanto você não monitorava</div>
        <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.65;">${setor.numerosSetor}<br><br>
        Cada um desses contratos foi visto, proposto e disputado por empresas que têm alertas configurados. Não é crítica — é o que acontece com qualquer empresa que depende de busca manual em um mercado de volume alto.</p>
      </div>
      <p>Não dá para recuperar o que passou. Mas dá para garantir que os próximos cheguem no seu e-mail, com prazo suficiente para elaborar uma boa proposta.</p>
      <p>O Monitor não promete que você vai ganhar todos os contratos. Promete que <strong>você vai saber que eles existem</strong> — que é o primeiro passo.</p>`,
    ps: '📉 <strong>P.S.:</strong> A perda não aparece em nenhum relatório. Não tem como calcular o quanto foi perdido por não saber que o edital existia. Mas o próximo você pode ver.',
    ctaTexto: 'Configurar meus alertas agora →',
  }),

  // E-MAIL 5 (D+32) — VIRADA: MENOS VENDA, MAIS VALOR
  5: (setor, nome) => ({
    subject: `${nome}, uma informação sobre o mercado público no seu setor`,
    preambulo: 'Não vou te pedir para clicar em nada neste e-mail. Só quero compartilhar uma informação que talvez seja útil.',
    miolo: `
      <p>O mercado de compras públicas no Brasil movimenta <strong>mais de R$ 600 bilhões por ano</strong>. Desse total, uma parcela significativa vai para contratos com empresas de pequeno e médio porte — exatamente o perfil de fornecedor que o sistema é projetado para incluir.</p>
      <p>A Lei 14.133/2021 (nova Lei de Licitações) criou mecanismos específicos para <strong>facilitar a participação de fornecedores de menor porte</strong>: cotas exclusivas para ME/EPP, dispensa eletrônica para valores menores, e simplificação de habilitação.</p>
      <div style="background:#f8f9fa;border-radius:8px;padding:18px 22px;margin:20px 0;border:1px solid #e9ecef;">
        <p style="margin:0;font-size:14px;color:#495057;line-height:1.7;"><strong>O que isso significa na prática:</strong> há mais contratos acessíveis para empresas como a sua do que nunca. O que falta, para a maioria, é saber que eles existem — a tempo de participar.</p>
      </div>
      <p style="font-size:13px;color:#888;">Se quiser testar o Monitor de Licitações, o trial de 7 dias ainda está disponível, sem cartão. Se não for o momento certo, tudo bem — guarde o link para quando fizer sentido.</p>`,
    ps: '📚 <strong>P.S.:</strong> A nova Lei de Licitações está mudando o mercado público. Empresas que entenderem as regras primeiro levam vantagem nos próximos anos.',
    ctaTexto: 'Conhecer o Monitor de Licitações →',
  }),

  // E-MAIL 6 (D+62) — RETOMADA COM RESULTADOS
  6: (setor, nome) => ({
    subject: `${nome}, 60 dias de movimentação no seu setor — resumo`,
    preambulo: 'Já faz dois meses desde o nosso primeiro contato. Aqui está um resumo do que aconteceu no mercado público do seu setor nesse período:',
    miolo: `
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px 24px;margin:20px 0;">
        <div style="font-size:11px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">📈 Últimos 60 dias no seu setor</div>
        <p style="margin:0;font-size:14px;color:#0c4a6e;line-height:1.7;">${setor.numerosSetor}<br><br>
        Empresas que têm alertas configurados no Monitor receberam esses editais em tempo real, elaboraram propostas e participaram dos processos. O ciclo não para.</p>
      </div>
      <p>Se em algum momento nos últimos dois meses você pensou <em>"deveria ter tentado"</em>, esse é o momento. O mercado público não para para esperar — mas o trial de 7 dias ainda está disponível, sem cartão.</p>
      <p>Configure suas palavras-chave, receba alertas por 7 dias, e veja na prática quantos editais do seu setor são publicados por semana. Sem compromisso.</p>`,
    ps: '🔁 <strong>P.S.:</strong> O mercado público funciona em ciclos. Novos editais são publicados toda semana, independente de época do ano. O melhor momento para começar é agora.',
    ctaTexto: 'Ativar meu trial de 7 dias →',
  }),

  // E-MAIL 7 (D+92) — PERGUNTA DIRETA E HUMANA
  7: (setor, nome) => ({
    subject: `${nome}, uma pergunta direta`,
    preambulo: 'Faz quase três meses desde o nosso primeiro e-mail. Tenho uma pergunta simples:',
    miolo: `
      <div style="background:#fafafa;border-radius:8px;padding:20px 24px;margin:20px 0;border:1px solid #e5e7eb;">
        <p style="margin:0;font-size:17px;color:#1a1a1a;font-style:italic;line-height:1.6;"><strong>"O que faria você experimentar o Monitor de Licitações?"</strong></p>
      </div>
      <p>Pode ser que o preço seja um impedimento. Pode ser que você já use outro sistema. Pode ser que o momento da empresa não seja o ideal. Ou pode ser que simplesmente não houve tempo.</p>
      <p>Qualquer uma dessas respostas é válida. Mas se for algo que possamos resolver — uma dúvida, uma demonstração, uma condição especial — responda este e-mail e nossa equipe entra em contato.</p>
      <p style="font-size:13px;color:#888;">E se o trial gratuito ainda não foi o que faltava, basta clicar abaixo e começar agora:</p>`,
    ps: '💬 <strong>P.S.:</strong> Respondemos todos os e-mails em até 1 dia útil. Se tiver qualquer dúvida sobre como o sistema funciona, basta perguntar.',
    ctaTexto: 'Experimentar o Monitor gratuitamente →',
  }),

  // E-MAIL 8 (D+152) — SUNSET
  8: (setor, nome) => ({
    subject: `${nome}, última mensagem — encerrando seu perfil`,
    preambulo: 'Esta é a nossa última mensagem para você.',
    miolo: `
      <p>Nos últimos meses, enviamos algumas atualizações sobre oportunidades de licitação no seu setor. Percebemos que o momento pode não ser o ideal agora — e respeitamos completamente essa realidade.</p>
      <p>Vamos encerrar o envio de mensagens para este e-mail. <strong>Não há nenhuma obrigação, e nenhum ressentimento.</strong></p>
      <div style="background:#f8f9fa;border-radius:8px;padding:18px 22px;margin:20px 0;border:1px solid #e9ecef;">
        <p style="margin:0;font-size:14px;color:#495057;line-height:1.7;">Se em algum momento você quiser monitorar licitações do seu setor, o Monitor de Licitações continua disponível. Basta acessar o site e criar sua conta — o trial de 7 dias gratuito estará lá, sem burocracia.</p>
      </div>
      <p style="font-size:13px;color:#888;">Se mudou de ideia antes do encerramento, basta responder este e-mail. Até lá — e bons negócios.</p>`,
    ps: '🤝 <strong>P.S.:</strong> Caso queira ser removido imediatamente de qualquer lista futura, use o link de descadastro no rodapé. É instantâneo.',
    ctaTexto: 'Criar minha conta gratuitamente →',
  }),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtValor(v?: number | null): string {
  if (!v || v <= 0) return ''
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000)    return `R$ ${Math.round(v / 1_000)}k`
  return `R$ ${v.toLocaleString('pt-BR')}`
}

function fmtData(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function buildLicitacoesHtml(lics: LicitacaoResumida[], ctaHref: string): string {
  if (!lics.length) return ''
  const items = lics.map((lic, i) => {
    const valor   = fmtValor(lic.valor_estimado)
    const data    = fmtData(lic.data_abertura)
    const estado  = lic.estado ? ` · ${lic.estado}` : ''
    const objeto  = lic.objeto.length > 90 ? lic.objeto.slice(0, 90) + '…' : lic.objeto
    const orgao   = lic.orgao.length > 55 ? lic.orgao.slice(0, 55) + '…' : lic.orgao
    const bg      = i % 2 === 0 ? '#fafafa' : '#fff'
    return `<tr>
      <td style="padding:12px 14px;background:${bg};border-bottom:1px solid #eee;vertical-align:top;">
        <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:3px;">${objeto}</div>
        <div style="font-size:12px;color:#666;margin-bottom:4px;">${orgao}${estado}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${valor ? `<span style="font-size:11px;background:#fef3c7;color:#92400e;padding:2px 7px;border-radius:99px;font-weight:700;">${valor}</span>` : ''}
          ${data  ? `<span style="font-size:11px;color:#888;">📅 Abertura: ${data}</span>` : ''}
        </div>
      </td>
    </tr>`
  }).join('')

  return `
    <div style="margin:24px 0;">
      <div style="font-size:12px;font-weight:800;color:#6B0F1A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">
        📋 Licitações abertas agora no seu setor
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;border-collapse:collapse;">
        ${items}
        <tr>
          <td style="padding:10px 14px;background:#6B0F1A;text-align:center;">
            <a href="${ctaHref}" style="font-size:12px;color:#C9A65A;font-weight:700;text-decoration:none;">
              Ver todas as licitações do seu setor →
            </a>
          </td>
        </tr>
      </table>
    </div>`
}

function buildLicitacoesTxt(lics: LicitacaoResumida[]): string {
  if (!lics.length) return ''
  const lines = lics.map((lic, i) => {
    const valor  = fmtValor(lic.valor_estimado)
    const data   = fmtData(lic.data_abertura)
    const objeto = lic.objeto.length > 80 ? lic.objeto.slice(0, 80) + '…' : lic.objeto
    return `  ${i + 1}. ${objeto}\n     ${lic.orgao}${lic.estado ? ' · ' + lic.estado : ''}${valor ? ' · ' + valor : ''}${data ? ' · Abertura: ' + data : ''}`
  }).join('\n')
  return `\nLICITAÇÕES ABERTAS NO SEU SETOR:\n${lines}\n`
}

function buildObjetoHtml(objeto: string, nome: string): string {
  const obj = objeto.length > 120 ? objeto.slice(0, 120) + '…' : objeto
  return `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #0284c7;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
      <div style="font-size:11px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">📋 Por que estamos enviando esta mensagem</div>
      <p style="margin:0;font-size:14px;color:#0c4a6e;line-height:1.6;">
        Identificamos que <strong>${nome}</strong> participou de um processo licitatório com o objeto:<br>
        <em style="color:#075985;">"${obj}"</em><br><br>
        Isso significa que sua empresa já fornece para o setor público. Nosso sistema encontra <strong>contratos similares ainda abertos</strong> que você pode estar perdendo.
      </p>
    </div>`
}

// ─── HTML base ────────────────────────────────────────────────────────────────

function wrapEmail(opts: {
  subject: string
  nome: string
  cidade: string | null
  conteudo: string
  ctaHref: string
  ctaTexto: string
  ps: string
  pixelTag: string
  url: string
  unsub: string
}): string {
  const cidadeHtml = opts.cidade ? ` — <span style="color:#6B0F1A;">${opts.cidade}</span>` : ''
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${opts.subject}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f0ede8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #6B0F1A 0%, #8B1525 100%); padding: 28px 40px 22px; }
  .logo-row { display: flex; align-items: center; gap: 12px; }
  .logo-badge { background: #C9A65A; color: #6B0F1A; font-size: 13px; font-weight: 900; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-text { color: #fff; font-size: 15px; font-weight: 700; }
  .logo-sub { color: rgba(255,255,255,0.55); font-size: 11px; margin-top: 1px; }
  .body { padding: 36px 40px 28px; }
  .greeting { font-size: 21px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px; line-height: 1.3; }
  p { margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3a3a3a; }
  strong { color: #1a1a1a; }
  .pain-box { background: #fff8f8; border: 1px solid #fcd5d5; border-left: 4px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
  .pain-box p { margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; }
  .steps { margin: 24px 0; }
  .step { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .step-num { background: #6B0F1A; color: #C9A65A; font-size: 12px; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .step-text { font-size: 14px; color: #333; line-height: 1.5; }
  .step-text strong { color: #1a1a1a; display: block; margin-bottom: 2px; }
  .setor-badge { background: #fdf9f0; border: 1px solid #e8d9b0; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #333; line-height: 1.5; }
  .proof { background: #f8fffe; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
  .proof p { font-size: 14px; color: #065f46; line-height: 1.6; margin: 0; }
  .cta-section { background: linear-gradient(135deg, #6B0F1A 0%, #8B1525 100%); border-radius: 12px; padding: 28px 32px; margin: 28px 0; text-align: center; }
  .cta-pre { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 16px; }
  .cta-btn { display: inline-block; background: #C9A65A; color: #6B0F1A !important; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 900; letter-spacing: 0.02em; }
  .cta-sub { color: rgba(255,255,255,0.65); font-size: 12px; margin: 12px 0 0; }
  .ps-box { background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
  .ps-box p { margin: 0; font-size: 13px; color: #78350f; line-height: 1.6; }
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
  <div class="header">
    <div class="logo-row">
      <div class="logo-badge">ML</div>
      <div>
        <div class="logo-text">Monitor de Licitações</div>
        <div class="logo-sub">Inteligência em licitações públicas</div>
      </div>
    </div>
  </div>
  <div class="body">
    <p class="greeting">Olá, <strong>${opts.nome}</strong>${cidadeHtml} —</p>
    ${opts.conteudo}
    <div class="cta-section">
      <p class="cta-pre">Teste gratuito por 7 dias · Sem cartão · Cancele quando quiser</p>
      <a href="${opts.ctaHref}" class="cta-btn">${opts.ctaTexto}</a>
      <p class="cta-sub">✓ Alertas no mesmo dia &nbsp;·&nbsp; ✓ E-mail + Telegram &nbsp;·&nbsp; ✓ Suporte incluso</p>
    </div>
    <div class="ps-box"><p>${opts.ps}</p></div>
    <p style="font-size:13px;color:#888;margin-top:8px;">Responda este e-mail para falar com nossa equipe — retornamos em até 1 dia útil.</p>
  </div>
  <div class="footer">
    <p>
      <strong>Monitor de Licitações</strong> · Matutta Soluções Digitais<br>
      Você recebeu este e-mail porque <strong>${opts.nome}</strong> consta como fornecedora em contratos públicos no PNCP.<br>
      Não quer mais receber? <a href="${opts.url}/descadastrar?token=${opts.unsub}">Clique aqui para se descadastrar</a>
    </p>
  </div>
  ${opts.pixelTag}
</div>
</body>
</html>`
}

// ─── Exportação principal ─────────────────────────────────────────────────────

export function emailCaptacao(p: ParamsCaptacao) {
  const nome     = p.nomeFantasia || p.razaoSocial
  const cidade   = p.municipio ? `${p.municipio}${p.uf ? '/' + p.uf : ''}` : null
  const url      = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const numero   = p.numeroEmail ?? 1
  const setor    = detectarSetor(p.cnae)
  const copy     = SETOR[setor]
  const lics     = p.licitacoes ?? []

  const campanha = numero === 1 ? 'trial7d' : `followup${numero}`
  const ctaDest  = `${url}/cadastro?ref=captacao-email&utm_source=captacao&utm_medium=email&utm_campaign=${campanha}&utm_content=${setor}`
  const ctaHref  = p.id ? `${url}/api/track/click/${p.id}?url=${encodeURIComponent(ctaDest)}` : ctaDest
  const pixelTag = p.id
    ? `<img src="${url}/api/track/open/${p.id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : ''

  // ── E-MAIL 1 ────────────────────────────────────────────────────────────────
  if (numero === 1) {
    const subject    = copy.subject1.replace('{{NOME}}', nome)
    const licitacoesHtml = buildLicitacoesHtml(lics, ctaHref)
    const licitacoesTxt  = buildLicitacoesTxt(lics)
    const objetoHtml     = p.objeto ? buildObjetoHtml(p.objeto, nome) : ''

    const conteudo = `
      <p>${copy.dor}</p>
      <div class="pain-box"><p>🔴 ${copy.agitacao}</p></div>
      ${objetoHtml}
      <p>O <strong>Monitor de Licitações</strong> foi criado exatamente para isso — e empresas de todo o Brasil já usam a plataforma para não perder editais relevantes.</p>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Você define suas palavras-chave</strong>Configure o que sua empresa fornece — leva menos de 5 minutos.</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Monitoramos 7+ fontes simultaneamente</strong>PNCP, ComprasNet, BLL, Licitações-e, Diários Oficiais e mais.</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Você recebe o alerta na hora</strong>E-mail + Telegram assim que o edital for publicado — antes da concorrência.</div>
        </div>
      </div>
      <div class="setor-badge">${copy.solucaoSetor}</div>
      <div class="proof"><p>Empresas que monitoram licitações ativamente participam de <strong>3× mais processos</strong> e fecham contratos com valor médio <strong>47% maior</strong> do que as que fazem busca manual.</p></div>
      ${licitacoesHtml}`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Começar meu trial gratuito →', ps: copy.ps1, pixelTag, url, unsub: '{{UNSUB_TOKEN}}' })

    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\n${copy.dor.replace(/<[^>]+>/g, '')}\n\nATENÇÃO: ${copy.agitacao.replace(/<[^>]+>/g, '')}\n\nO Monitor de Licitações resolve isso em 3 passos:\n\n1. Você define suas palavras-chave (menos de 5 minutos)\n2. Monitoramos 7+ fontes: PNCP, ComprasNet, BLL, Licitações-e e mais\n3. Você recebe o alerta na hora — e-mail + Telegram, antes da concorrência\n\n${copy.solucaoSetor.replace(/<[^>]+>/g, '')}\n${licitacoesTxt}\n▶ COMEÇAR TRIAL GRATUITO (sem cartão):\n${ctaDest}\n\n✓ 7 dias gratuitos · ✓ Sem cartão · ✓ Cancele quando quiser\n\n---\n${copy.ps1.replace(/<[^>]+>/g, '')}\n\nResponda este e-mail para falar com nossa equipe.\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token={{UNSUB_TOKEN}}`

    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, '{{UNSUB_TOKEN}}'), text }
  }

  // ── E-MAILS 2-8 ─────────────────────────────────────────────────────────────
  const fn = FOLLOWUP[numero] ?? FOLLOWUP[8]
  const fc = fn(copy, nome, cidade)

  const licitacoesHtml = numero <= 3 ? buildLicitacoesHtml(lics, ctaHref) : ''
  const licitacoesTxt  = numero <= 3 ? buildLicitacoesTxt(lics) : ''

  const conteudo = `
    <p>${fc.preambulo}</p>
    ${fc.miolo}
    ${licitacoesHtml}`

  const html = wrapEmail({ subject: fc.subject, nome, cidade, conteudo, ctaHref, ctaTexto: fc.ctaTexto, ps: fc.ps, pixelTag, url, unsub: '{{UNSUB_TOKEN}}' })

  const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\n${fc.preambulo}\n\n${fc.miolo.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim()}${licitacoesTxt}\n\n▶ ${fc.ctaTexto.replace('→', '').trim()}:\n${ctaDest}\n\n---\n${fc.ps.replace(/<[^>]+>/g, '')}\n\nResponda este e-mail para falar com nossa equipe.\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token={{UNSUB_TOKEN}}`

  return { subject: fc.subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, '{{UNSUB_TOKEN}}'), text }
}
