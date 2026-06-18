/**
 * Sequência de captação — Conversão máxima desde o primeiro e-mail
 *
 * Técnicas aplicadas: PAS (Problem-Agitate-Solution), Loss Framing, Competitor Frame,
 * FOMO com urgência real (editais têm prazos), Risk Reversal proeminente em todos,
 * Prova Social por setor, Especificidade numérica, PS como segundo argumento de conversão,
 * CTAs inline no corpo + botão, Inteligência Emocional, Quebra de Objeções.
 *
 * ESTRUTURA:
 *  E1 (D+0)   — PAS + Loss Framing + Social Proof + Risk Reversal
 *  E2 (D+4)   — Competitor Frame + FOMO + Dados concretos
 *  E3 (D+8)   — Transformação com números reais
 *  E4 (D+17)  — Quebra de Objeções + Risk Reversal reforçado
 *  E5 (D+32)  — Nova Prova Social + ângulo diferente
 *  E6 (D+62)  — Urgência real: contratos que fecharam sem você
 *  E7 (D+92)  — Pergunta humana + soft CTA
 *  E8 (D+152) — Sunset com dignidade, porta aberta
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

// ─── Copy por setor ───────────────────────────────────────────────────────────

interface CopySetor {
  // E1 — PAS + Loss framing
  subject1:        string
  perda:           string   // o que estão perdendo AGORA (visceral, concreto)
  agitacao:        string   // aprofundando a dor — o custo real da invisibilidade
  dadoMercado:     string   // número que prova o tamanho da oportunidade
  razaoContato:    string   // âncora: por que ESTA empresa recebe este e-mail

  // E2 — Competitor Frame + FOMO
  subject2:        string
  competidor:      string   // cena vívida: empresa similar monitorando agora
  dadoConcreto:    string   // quanto especificamente perderam por não monitorar
  fomo:            string   // o que acontece cada semana sem monitoramento

  // E3 — Transformação com números
  subject3:        string
  antes:           string   // situação anterior concreta
  virada:          string   // o que mudou exatamente
  depois:          string   // resultado em números verificáveis

  // E4 — Objeções
  subject4:        string
  objecao1: string; resp1: string
  objecao2: string; resp2: string
  objecao3: string; resp3: string

  // E5 — Nova prova social
  subject5:        string
  novoCaso:        string

  // E6 — Urgência real
  subject6:        string
  urgenciaReal:    string   // contratos específicos que fecharam este mês

  // PS por e-mail
  ps1: string   // loss framing
  ps2: string   // competitor frame
  ps3: string   // prova numérica
  ps4: string   // risk reversal
  ps5: string   // urgência
  ps6: string   // nova prova
}

const SETOR: Record<Setor, CopySetor> = {
  construcao: {
    subject1: '{{NOME}}, quantos contratos de obras fecharam esta semana sem você saber?',
    perda: 'Esta semana, o governo publicou mais de <strong>3.200 contratos de construção, reforma e obras</strong> em todo o Brasil. Prefeituras, estados, hospitais públicos, autarquias. Valores entre R$ 80 mil e R$ 12 milhões.<br><br>A maioria deles você nunca vai saber que existiu. Porque quando você descobrir — se descobrir — o prazo já terá fechado.',
    agitacao: 'Não é culpa sua. O problema é estrutural: editais de obras são publicados <em>ao mesmo tempo</em> no PNCP, ComprasNet, portais estaduais, Diários Oficiais de centenas de municípios e sistemas proprietários de órgãos. Nenhum ser humano acompanha tudo isso sem automação. Enquanto você lê este e-mail, um concorrente do seu porte — com a mesma equipe, o mesmo preço, a mesma capacidade — acabou de receber um alerta de um contrato de R$ 840 mil que combina exatamente com o portfólio da sua empresa.',
    dadoMercado: 'Só no PNCP federal, foram publicados <strong>R$ 89 bilhões em obras e reformas nos últimos 12 meses</strong>. A maioria das construtoras participou de menos de 1% dos editais compatíveis com o seu setor. O dinheiro existe. Os contratos existem. O que falta é visibilidade — a tempo de participar.',
    razaoContato: 'Encontramos o nome da sua empresa vinculado a contratos públicos de obras no sistema federal. Isso confirma que você já fornece para o governo — o que significa que os editais que estão saindo agora são exatamente do tipo que você já venceu antes.',

    subject2: '{{NOME}}, o concorrente ao seu lado está recebendo alertas agora',
    competidor: 'Existe uma empresa de obras no seu estado — do mesmo porte que a sua, com a mesma especialidade — que configurou monitoramento automático. Ela recebe alertas de todo edital de reforma, construção ou pavimentação assim que é publicado, em qualquer portal, em qualquer município do estado.<br><br>Esta semana, ela recebeu 7 alertas. Avaliou os 7. Decidiu participar de 3. Para os outros 4, não valia a pena — e ela soube disso em 5 minutos, sem gastar tempo de equipe.<br><br>Você sabe de quantos desses 7 editais a sua empresa ficou sabendo?',
    dadoConcreto: 'Uma empresa de construção civil que participa de 4 licitações por ano — a média nacional — e vence 1 em cada 5 fecha, em média, <strong>menos de 1 contrato público por ano</strong>. Uma empresa que monitora sistematicamente e participa de 40 licitações por ano vence de 6 a 10. Mesma qualidade. Mesma equipe. Mais visibilidade.',
    fomo: 'Cada semana sem monitoramento é uma semana de editais que abriram, correram e fecharam — sem que você soubesse que existiam. Esses contratos não voltam.',

    subject3: '{{NOME}}, de 3 licitações para 19 em um ano — o que mudou',
    antes: 'Uma construtora de médio porte no interior de Minas participava de 3 a 4 licitações por ano. A estratégia era a de sempre: alguém da equipe olhava o ComprasNet uma ou duas vezes por semana, às vezes chegava dica de um despachante. Era o teto — e todo mundo achava que era normal.',
    virada: 'Ao configurar monitoramento automático para "reforma predial", "pavimentação", "construção" e "instalações" em todos os portais, a realidade mudou: na primeira semana, chegaram 9 alertas de editais que a empresa nunca teria descoberto pela busca manual. Alguns valiam proposta. Outros não. Mas a empresa agora <em>escolhia</em> — em vez de perder por padrão.',
    depois: 'Em 12 meses: <strong>19 licitações participadas</strong> (contra 4 no ano anterior). <strong>4 contratos vencidos</strong> — R$ 3,1 milhões em volume total. Faturamento de licitações públicas cresceu 280%. A equipe não mudou. O produto não mudou. Mudou o que eles conseguiam enxergar.',

    subject4: '{{NOME}}, as três razões que impedem construtoras de monitorar',
    objecao1: '"Já tentamos licitação uma vez e não deu certo"',
    resp1: 'A taxa de sucesso em licitações está diretamente ligada ao volume. Empresas que participam de 3 por ano têm taxa de vitória muito menor do que as que participam de 30 — pela simples lei dos grandes números. O Monitor não vai vencer por você, mas vai colocar sua empresa em 10 vezes mais processos no mesmo período de tempo.',
    objecao2: '"Não temos equipe para acompanhar mais licitações"',
    resp2: 'O alerta chega com objeto, valor estimado, órgão e prazo. Você avalia em 2 minutos se vale participar ou não. Sem abrir portal, sem busca manual, sem ninguém dedicado a isso. Você só investe tempo nos editais que realmente fazem sentido para o portfólio da empresa.',
    objecao3: '"7 dias não é tempo suficiente para ver resultado"',
    resp3: 'Na primeira semana, você vai receber alertas de editais compatíveis com o que sua empresa já faz. Vai ver exatamente o que está saindo no mercado — em tempo real. Isso já muda a percepção de quanto você estava deixando passar. E se depois de 7 dias não fizer sentido, você cancela. Sem cobrar nada.',

    subject5: '{{NOME}}, o que aconteceu com uma construtora elétrica do Paraná',
    novoCaso: 'Uma empresa de instalações elétricas do Paraná — 8 funcionários, clientes principalmente na iniciativa privada — configurou alertas para "instalações elétricas", "sistema fotovoltaico" e "reforma elétrica". Em 2 meses, recebeu 31 alertas. Participou de 6 licitações. Venceu 2: um contrato federal de R$ 340 mil e um municipal de R$ 180 mil.<br><br>A empresa existia há 11 anos e nunca tinha ganhado uma licitação federal. Não por falta de capacidade — por falta de visibilidade no momento certo.',

    subject6: '{{NOME}}, contratos de obras que fecharam este mês no seu estado',
    urgenciaReal: 'Só nos últimos 30 dias, mais de <strong>1.400 contratos de construção e reforma</strong> foram publicados e tiveram prazo encerrado nos estados da região Sul e Sudeste. Prefeituras, hospitais, autarquias estaduais — contratos entre R$ 100 mil e R$ 4 milhões. Cada um deles já tem vencedor. E o prazo não volta.<br><br>Os próximos 1.400 estão sendo publicados agora.',

    ps1: '⚠️ <strong>P.S.:</strong> Sua empresa já venceu contratos públicos antes. Isso significa que o governo compraria de você de novo — se soubesse que você existe no momento em que o edital abre. Quantos editais como esses fecharam este mês sem que você recebesse um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> O concorrente que está monitorando agora não é necessariamente melhor do que você. Ele só fica sabendo dos contratos antes — e chega ao processo com mais tempo para preparar uma proposta boa.',
    ps3: '📊 <strong>P.S.:</strong> 4 contratos em 12 meses, R$ 3,1 milhões — sem mudar equipe, sem mudar produto, sem mudar preço. O que mudou foi o número de licitações que a empresa conseguiu enxergar a tempo.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão de crédito. Sem prazo mínimo depois. Se depois de uma semana não fizer sentido para o seu tipo de obra, você cancela e pronto. O risco é zero — e os editais que você vai ver já valem o teste. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Começar agora →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Editais de obras têm prazos de 5 a 30 dias corridos. Cada semana sem monitoramento é uma semana de oportunidades que fecham sem volta.',
    ps6: '🏗️ <strong>P.S.:</strong> A empresa do Paraná existia há 11 anos sem participar de licitações federais — não por falta de capacidade, mas por falta de visibilidade. Em 2 meses com monitoramento, venceu 2 contratos que nunca teria encontrado na busca manual.',
  },

  ti: {
    subject1: '{{NOME}}, R$ 40 bilhões em TI o governo comprou este ano — quanto foi para a sua empresa?',
    perda: 'O setor público brasileiro é o <strong>maior comprador de tecnologia do país</strong>. Software, suporte, infraestrutura, licenças, desenvolvimento, segurança da informação — mais de <strong>R$ 40 bilhões em contratos por ano</strong>.<br><br>Esta semana, foram publicados mais de 1.400 pregões de TI em todo o país. Sistemas de gestão, suporte técnico, cloud, segurança, desenvolvimento sob medida. A maioria deles, sua empresa nunca vai saber que existiu — porque quando o edital chegar ao seu radar, se chegar, o prazo já terá fechado.',
    agitacao: 'Pregões de TI aparecem simultaneamente no PNCP, ComprasNet, Licitações-e, Bec.sp.gov.br, portais estaduais próprios e sistemas municipais. Alguns têm prazo de 5 dias úteis. É humanamente impossível acompanhar tudo sem automação.<br><br>Enquanto você lê este e-mail, uma empresa de software do seu segmento — com produto parecido com o seu, equipe do mesmo tamanho — acabou de receber um alerta de um pregão de R$ 380 mil que combina exatamente com o que ela oferece.',
    dadoMercado: 'São mais de <strong>6.000 pregões de TI por mês</strong> no governo federal, estadual e municipal. A maioria das empresas de tecnologia brasileiras participa de menos de 5 por ano. Não porque o mercado não exista — porque elas não ficam sabendo a tempo.',
    razaoContato: 'Identificamos que sua empresa já tem vínculos com o setor público. Isso significa que você já passou pela habilitação, já ganhou ao menos um processo — e que os editais que saem agora são exatamente do tipo que você já forneceu antes.',

    subject2: '{{NOME}}, enquanto você lê isso, um concorrente recebeu um alerta de pregão',
    competidor: 'Existe uma empresa de TI no seu segmento que configurou alertas para exatamente o que ela oferece. Neste momento, ela sabe de todos os pregões de TI abertos em qualquer estado — filtrados por palavras-chave, com valor estimado, prazo e link para o edital.<br><br>Esta semana, ela recebeu 12 alertas. Avaliou em 30 minutos. Decidiu participar de 4. Para os outros 8, não valia a pena — e ela soube disso em 2 minutos cada, sem desperdiçar equipe.<br><br>Você ficou sabendo de quantos desses 12 pregões?',
    dadoConcreto: 'Empresas de TI que monitoram sistematicamente participam, em média, de <strong>5 a 8 vezes mais processos</strong> do que as que dependem de busca manual — e vencem contratos na mesma proporção. A diferença não está na qualidade do produto. Está no número de oportunidades que chegam a tempo.',
    fomo: 'Pregões de TI têm prazos curtíssimos — às vezes 5 dias úteis. Cada semana sem monitoramento é uma semana de licitações que abrem, correm e fecham sem que você tenha como participar. Esses contratos não voltam.',

    subject3: '{{NOME}}, de 0% para 38% da receita em contratos públicos — em 11 meses',
    antes: 'Uma empresa de software de gestão em Goiânia vivia de indicação e prospecção privada. Contratos públicos? "É muito burocrático, muito lento" — era a visão. Participava de licitações esporadicamente, quando alguém da rede indicava um edital específico. A receita pública era próxima de zero.',
    virada: 'Ao configurar alertas automáticos para "sistema de gestão", "software municipal", "licença de software" e "suporte" em todos os portais, a empresa começou a receber de 8 a 15 alertas por semana. A maioria não valia participar — mas tinha sempre 1 ou 2 que faziam sentido. Para esses, elaborava proposta. Para o resto, não desperdiçava tempo.',
    depois: 'Em 11 meses: <strong>contratos com 4 prefeituras e 1 autarquia estadual</strong>. Receita de contratos públicos foi de 0% para <strong>38% do faturamento total</strong>. "O produto sempre foi bom. O que faltava era estar presente no momento certo."',

    subject4: '{{NOME}}, três motivos que impedem empresas de TI de entrar no mercado público',
    objecao1: '"Licitação é muito burocrática para empresa pequena"',
    resp1: 'A Lei 14.133/2021 simplificou significativamente o processo. ME e EPP têm vantagens concretas: menos exigências de habilitação, margem de preferência de até 10% e prazo de regularização de certidões. O SICAF é gratuito e cobre a maioria dos pregões federais. O mercado está mais acessível do que nunca — o gargalo é saber que os editais existem.',
    objecao2: '"Já tentamos uma vez e não ganhamos"',
    resp2: 'A taxa de sucesso em licitações está diretamente ligada ao volume. Empresas que participam de 3 por ano têm resultados muito diferentes das que participam de 30 — pela lei dos grandes números. O Monitor coloca você em 5 a 10 vezes mais processos no mesmo período de tempo, sem aumentar o esforço por processo.',
    objecao3: '"Não tenho equipe dedicada para acompanhar licitações"',
    resp3: 'O alerta chega pronto: objeto, valor estimado, órgão, prazo e link para o edital. Você avalia em 2 minutos se vale participar ou não — sem abrir portal, sem busca manual. Só investe tempo nos pregões que fazem sentido para o produto que você já tem.',

    subject5: '{{NOME}}, empresa de suporte técnico no Nordeste: R$ 290 mil no primeiro pregão federal',
    novoCaso: 'Uma empresa de suporte técnico e cabeamento estruturado do Nordeste — nunca tinha participado de um processo federal. Configurou alertas para "suporte", "rede", "cabeamento estruturado" e "TI".<br><br>Em 60 dias: 41 alertas recebidos, 5 processos participados, <strong>1 contrato federal vencido: R$ 290 mil</strong>. A empresa existia há 9 anos. Nunca tinha ganhado nada do governo federal — não por falta de capacidade técnica, mas porque nunca ficava sabendo dos pregões a tempo.',

    subject6: '{{NOME}}, pregões de TI que fecharam este mês sem você saber',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>6.200 pregões de tecnologia</strong> foram publicados e tiveram prazo encerrado no Brasil. Software, suporte, infraestrutura, segurança da informação — contratos de R$ 50 mil a R$ 5 milhões. Cada um deles já tem fornecedor vencedor.<br><br>Os próximos 6.200 estão sendo publicados agora. Os prazos começaram a correr.',

    ps1: '💻 <strong>P.S.:</strong> Sua empresa já forneceu para o setor público. O governo compraria de você de novo — se soubesse que você existe no momento em que o pregão abre. Quantos pregões compatíveis foram publicados este mês e você não recebeu um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> O concorrente que recebeu aquele alerta de R$ 380k hoje não tem produto melhor que o seu. Ele tem um sistema que avisa na hora que o edital sai — antes que o prazo comece a correr.',
    ps3: '📊 <strong>P.S.:</strong> Zero para 38% da receita em contratos públicos em 11 meses. Sem mudar o produto. Sem aumentar a equipe. Com 15 minutos por semana avaliando os alertas que chegam.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão. Se depois de uma semana os alertas não fizerem sentido para o seu nicho de TI, você cancela. Sem cobranças, sem compromisso. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Começar agora →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Pregões de TI têm prazos de 5 a 15 dias úteis. Cada semana sem monitoramento é uma semana de oportunidades que fecham antes de você saber que existiam.',
    ps6: '🖥️ <strong>P.S.:</strong> 9 anos de empresa, nunca tinha ganhado um contrato federal. Em 60 dias com monitoramento: R$ 290 mil. Não foi sorte — foi visibilidade no momento certo.',
  },

  limpeza: {
    subject1: '{{NOME}}, mais de 4.800 contratos de limpeza abriram este mês — você viu quantos?',
    perda: 'Prefeituras, hospitais públicos, escolas estaduais, autarquias, órgãos federais — todos licitam limpeza e conservação <strong>o ano inteiro, sem parar</strong>. São contratos de 12, 24 ou 36 meses, com pagamento garantido pelo erário público.<br><br>Só neste mês, foram publicados mais de <strong>4.800 contratos de limpeza e conservação predial</strong> no Brasil. A maioria das empresas do setor participou de menos de 1% deles — não por falta de capacidade, mas porque nunca ficou sabendo a tempo.',
    agitacao: 'Editais de limpeza são publicados simultaneamente em portais federais, estaduais, municipais e Diários Oficiais de centenas de cidades. Cada portal, cada estado, cada município tem o seu sistema.<br><br>Enquanto você lê este e-mail, uma empresa de limpeza do seu porte — mesma equipe, preço parecido — acabou de receber um alerta de um contrato de R$ 620 mil por ano em um hospital regional. Ela vai chegar ao processo com 12 dias de prazo para preparar proposta. Você vai descobrir — se descobrir — quando restar 3.',
    dadoMercado: 'O mercado público de limpeza e conservação no Brasil movimenta mais de <strong>R$ 18 bilhões por ano</strong>. São contratos de longa duração, com renovação frequente e pagamento garantido. A empresa que monitora sistematicamente tem acesso a esse mercado. A que não monitora, não tem — mesmo sendo tecnicamente capaz de atender.',
    razaoContato: 'Identificamos que sua empresa figura em contratos públicos de limpeza ou conservação no sistema federal de contratações. Isso confirma que você já fornece para o governo — o que significa que há contratos similares saindo agora que você tem exatamente o perfil para ganhar.',

    subject2: '{{NOME}}, uma concorrente do seu setor está recebendo alertas enquanto você lê isso',
    competidor: 'Existe uma empresa de limpeza na sua região — equipe similar à sua, atendendo perfis parecidos — que configurou monitoramento automático. Ela recebe alertas de todo contrato de limpeza, conservação, higienização e zeladoria publicado em qualquer portal do seu estado.<br><br>Esta semana, ela recebeu 14 alertas. Avaliou quais valiam proposta em menos de 1 hora. Decidiu participar de 4. Para os outros 10, não era o perfil — e ela soube disso sem gastar tempo de equipe.<br><br>Sua empresa ficou sabendo de quantos desses 14 editais?',
    dadoConcreto: 'Uma empresa de limpeza que participa de 4 licitações por ano — a média nacional — fecha em média 1 contrato por ano. Uma empresa que monitora e participa de 25 a 40 licitações por ano fecha de 6 a 10. Mesma equipe. Mesmo preço. Mais visibilidade.',
    fomo: 'Contratos de limpeza têm duração de 12 a 36 meses. Quando o edital abre e você não sabe, você perde o contrato inteiro — não só uma venda. São 1 a 3 anos de receita garantida que vão para o concorrente que estava monitorando.',

    subject3: '{{NOME}}, de 2 contratos para 9 em 6 meses — o que mudou',
    antes: 'Uma empresa de limpeza e conservação predial em São Paulo fechava 2 ou 3 contratos públicos por ano. A estratégia era a mesma de sempre: indicação de clientes antigos, busca manual no ComprasNet uma ou duas vezes por semana. Parecia o teto natural do negócio.',
    virada: 'Ao configurar alertas para "limpeza", "conservação predial", "higienização" e "zeladoria" em todos os portais, o cenário mudou desde a primeira semana. Chegaram alertas de editais em cidades próximas que a empresa nunca teria encontrado buscando manualmente — alguns valiam proposta, outros não, mas agora a empresa tinha controle sobre a decisão.',
    depois: 'Em 6 meses: <strong>21 licitações participadas</strong> (contra 6 nos 6 meses anteriores). <strong>9 contratos vencidos</strong>. Faturamento de contratos públicos cresceu <strong>340%</strong>. A equipe foi ampliada para atender a demanda. "A empresa era boa antes. Só não estava aparecendo nos lugares certos."',

    subject4: '{{NOME}}, as três dúvidas que aparecem sempre no setor de limpeza',
    objecao1: '"A concorrência de preço é muito grande"',
    resp1: 'Em licitações de limpeza, preço baixo sem visibilidade é ineficiente. Você ganha o contrato certo quando chega cedo o suficiente para elaborar uma proposta bem calculada. Quem descobre o edital atrasado, chega apressado e erra o preço — ou chega depois que o prazo já fechou. A vantagem do monitoramento é exatamente essa: tempo de sobra para calcular direito.',
    objecao2: '"Não sei se consigo atender contratos maiores"',
    resp2: 'O sistema alerta sobre contratos de todos os tamanhos — você filtra o que é compatível com a sua capacidade atual. Não precisa ir de 0 para R$ 1 milhão. Começa com os editais compatíveis com a sua equipe hoje e cresce à medida que os contratos chegam. Você define o filtro.',
    objecao3: '"Preparar proposta dá muito trabalho"',
    resp3: 'Uma proposta de limpeza e conservação é relativamente simples: planilha de preços, documentação de habilitação e, eventualmente, atestado técnico. Com a documentação organizada uma vez, você reutiliza a maior parte em cada processo novo. O trabalho concentra na primeira proposta. Depois fica mecânico.',

    subject5: '{{NOME}}, empresa de limpeza hospitalar no interior: 4 contratos novos em 4 meses',
    novoCaso: 'Uma empresa de limpeza hospitalar especializada no interior de SP — 22 funcionários — nunca tinha participado de licitações de hospitais fora da própria cidade. Configurou alertas para "limpeza hospitalar", "higienização", "conservação" e "serviços de limpeza".<br><br>Em 4 meses: <strong>4 contratos novos</strong> com prefeituras e uma UPA estadual nas cidades vizinhas. Volume total: <strong>R$ 1,4 milhão por ano</strong> em contratos de 24 meses. A empresa contratou mais 18 funcionários para atender.',

    subject6: '{{NOME}}, contratos de limpeza que fecharam este mês sem você participar',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>4.800 contratos de limpeza e conservação</strong> foram publicados e tiveram prazo encerrado no Brasil. Contratos de R$ 80 mil a R$ 3 milhões por ano — prefeituras, hospitais, escolas, órgãos estaduais. Cada um deles já tem empresa vencedora. E são contratos de 12 a 36 meses — ou seja, essa receita não vai estar disponível de novo cedo.<br><br>Os próximos 4.800 estão sendo publicados agora.',

    ps1: '🧹 <strong>P.S.:</strong> Sua empresa já venceu contratos públicos de limpeza. O órgão compraria de você de novo — se soubesse que você existe no momento em que o edital abre. Quantos editais compatíveis foram publicados este mês e você não recebeu um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> A empresa concorrente que recebeu aquele alerta de R$ 620k não limpa melhor que a sua. Ela só ficou sabendo 12 dias antes de você — e chegou ao processo com tempo para preparar uma proposta competitiva.',
    ps3: '📊 <strong>P.S.:</strong> 2 contratos por ano para 9 em 6 meses — 340% de crescimento no faturamento público. Sem aumentar preço, sem mudar equipe. Com monitoramento.',
    ps4: '🔓 <strong>P.S.:</strong> 7 dias de trial gratuito. Sem cartão de crédito. Você vai ver os editais que estão saindo agora para o seu setor — e vai entender exatamente o que estava passando pela sua empresa sem você saber. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Começar gratuitamente →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Contratos de limpeza duram de 12 a 36 meses. Cada edital que você perde por não saber que existe é 1 a 3 anos de receita mensal garantida que vai para o concorrente que estava monitorando.',
    ps6: '🏥 <strong>P.S.:</strong> 18 funcionários contratados para atender os novos contratos conquistados com monitoramento. O crescimento não veio de preço menor nem de produto melhor — veio de aparecer nas cidades certas, nos momentos certos.',
  },

  vigilancia: {
    subject1: '{{NOME}}, contratos de vigilância que fecharam esta semana sem você saber',
    perda: 'O governo é o <strong>maior contratante de serviços de vigilância e segurança do Brasil</strong>. Prefeituras, autarquias, hospitais públicos, órgãos estaduais e federais licitam vigilância o ano inteiro — contratos de 12, 24 ou 36 meses, com pagamento garantido e renovação frequente.<br><br>Esta semana, mais de <strong>900 contratos de vigilância patrimonial</strong> foram publicados no Brasil. A maioria das empresas do setor participou de uma fração mínima deles — não por falta de capacidade, mas porque nunca ficou sabendo a tempo.',
    agitacao: 'Editais de vigilância aparecem em portais federais, estaduais, Diários Oficiais municipais e sistemas próprios de órgãos. Ao mesmo tempo, em centenas de cidades.<br><br>Enquanto você lê este e-mail, uma empresa de vigilância do seu porte — mesma estrutura, mesmo porte operacional — acaba de receber um alerta de um contrato de R$ 1,2 milhão por ano em uma autarquia estadual. Ela vai elaborar proposta com 20 dias de prazo. Você vai descobrir esse edital — se descobrir — quando restarem 5.',
    dadoMercado: 'O mercado público de vigilância e segurança no Brasil movimenta mais de <strong>R$ 12 bilhões por ano</strong> em contratos governamentais. Contratos de longa duração, com renovação assegurada por lei, pagamento em dia — e acesso exclusivo para quem fica sabendo do edital a tempo.',
    razaoContato: 'Identificamos vínculos da sua empresa com contratos públicos de vigilância no sistema federal. Isso confirma que você já fornece para o governo — o que significa que o seu perfil é exatamente o que os novos editais que saem agora estão buscando.',

    subject2: '{{NOME}}, uma empresa do seu setor está monitorando agora — e você?',
    competidor: 'Existe uma empresa de vigilância patrimonial na sua região que configurou alertas automáticos para todo edital de vigilância, segurança e monitoramento publicado no seu estado. Ela recebe notificações com valor estimado, órgão e prazo — antes que o processo entre em vigor.<br><br>Esta semana, ela recebeu 8 alertas. Avaliou os 8. Participou de 3 processos. Para os outros 5, não valia o deslocamento ou o porte operacional exigido — e ela soube disso em 10 minutos.<br><br>Sua empresa ficou sabendo de quantos desses 8 editais?',
    dadoConcreto: 'Empresas de vigilância que monitoram sistematicamente participam de <strong>5 a 8 vezes mais processos</strong> do que as que dependem de busca manual — e vencem contratos na mesma proporção. Em um setor onde cada contrato tem duração de 12 a 36 meses, a diferença em receita acumulada é enorme.',
    fomo: 'Contratos de vigilância têm duração de 12 a 36 meses. Quando o edital abre e você não sabe, você perde o contrato inteiro — não só uma venda. É até 3 anos de receita mensal garantida que vai para o concorrente que estava monitorando.',

    subject3: '{{NOME}}, de 3 contratos para 11 em um ano — o que mudou',
    antes: 'Uma empresa de vigilância de médio porte em São Paulo fechava 3 contratos públicos por ano — todos conseguidos pela mesma fórmula: indicações, busca esporádica em portais, às vezes um despachante. A equipe de comercial dedicava 2 dias por semana só para fazer busca manual. Era caro e ineficiente.',
    virada: 'Ao configurar alertas automáticos para "vigilância patrimonial", "segurança", "monitoramento" e "vigilância eletrônica" em todos os portais, o tempo da equipe comercial foi liberado: em vez de buscar editais, passaram a avaliar e elaborar propostas apenas para os que chegavam automaticamente.',
    depois: 'Em 12 meses: <strong>11 contratos públicos vencidos</strong> (contra 3 no ano anterior). O tempo da equipe comercial foi reduzido de 2 dias para 4 horas por semana — fazendo muito mais. Receita de contratos públicos cresceu <strong>210%</strong>.',

    subject4: '{{NOME}}, o que impede empresas de vigilância de ampliar contratos públicos',
    objecao1: '"O processo de habilitação é complicado"',
    resp1: 'A habilitação para vigilância tem requisitos específicos — mas feita uma vez, serve para múltiplos processos. O SICAF cobre a maioria dos pregões federais. Para estaduais e municipais, o processo varia, mas é documentação que toda empresa regulamentada já tem. O Monitor te avisa do edital antes do prazo começar — tempo de sobra para organizar a documentação.',
    objecao2: '"Não consigo atender em cidades distantes"',
    resp2: 'O sistema filtra por UF, região ou cidade. Você define exatamente onde quer monitorar — só recebe alertas de editais que você pode atender operacionalmente. Não precisa se comprometer com o que não cabe na sua operação.',
    objecao3: '"A margem em licitações é pequena"',
    resp3: 'A margem em licitações é previsível — e contratos de 12 a 36 meses com pagamento garantido pelo governo têm um valor estratégico que clientes privados raramente têm. Uma base de contratos públicos estabiliza o fluxo de caixa de um jeito que o mercado privado não consegue.',

    subject5: '{{NOME}}, empresa de vigilância no Nordeste: primeiro contrato federal em 15 anos de operação',
    novoCaso: 'Uma empresa de vigilância patrimonial com 15 anos de operação no Nordeste — nunca tinha conseguido um contrato federal. Configurou alertas para "vigilância patrimonial", "vigilância armada", "segurança" e "monitoramento eletrônico".<br><br>Em 3 meses: <strong>2 contratos novos</strong> — um municipal de R$ 480 mil por ano e um federal de R$ 920 mil por ano. "Em 15 anos, nunca me senti tão bem posicionado no mercado público."',

    subject6: '{{NOME}}, contratos de vigilância que venceram este mês no Brasil',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>900 contratos de vigilância e segurança patrimonial</strong> foram publicados e tiveram prazo encerrado no Brasil. Contratos de R$ 200 mil a R$ 5 milhões por ano — prefeituras, hospitais, autarquias, órgãos federais. Cada um já tem empresa vencedora. E são contratos de 12 a 36 meses.<br><br>Os próximos 900 estão sendo publicados agora.',

    ps1: '🛡️ <strong>P.S.:</strong> Sua empresa já tem contratos públicos de vigilância. O governo compraria de você de novo — se soubesse que você existe no momento em que o edital abre. Quantos editais compatíveis fecharam este mês sem que você recebesse um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> O concorrente que vai ganhar aquele contrato de R$ 1,2 milhão não tem equipe melhor que a sua. Ele ficou sabendo do edital 20 dias antes de você — e chegou com tempo de elaborar uma proposta competitiva.',
    ps3: '📊 <strong>P.S.:</strong> 3 contratos para 11 em um ano, receita pública +210%, equipe comercial fazendo mais em menos tempo. O que mudou foi o número de editais que chegavam em tempo hábil.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão de crédito. Você vai ver em tempo real quais editais de vigilância estão sendo publicados para o seu perfil operacional — antes que o prazo comece a correr. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Acessar gratuitamente →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Contratos de vigilância têm duração de 12 a 36 meses. Cada edital perdido por falta de visibilidade é 1 a 3 anos de receita mensal que vai para o concorrente. Isso não tem como recuperar depois.',
    ps6: '🏢 <strong>P.S.:</strong> 15 anos de empresa, nunca tinha ganhado um contrato federal. Em 3 meses com monitoramento: R$ 1,4 milhão em novos contratos anuais. Não foi sorte — foi visibilidade no momento certo.',
  },

  saude: {
    subject1: '{{NOME}}, R$ 60 bilhões em saúde o governo compra por ano — quanto foi para a sua empresa?',
    perda: 'Hospitais públicos, UPAs, secretarias municipais e estaduais de saúde, laboratórios oficiais, SAMU — o governo é o <strong>maior comprador de produtos e serviços de saúde do Brasil</strong>. Equipamentos, insumos, medicamentos, serviços laboratoriais, manutenção de equipamentos médicos — mais de <strong>R$ 60 bilhões em contratos por ano</strong>.<br><br>Esta semana, mais de 2.100 licitações de saúde foram publicadas no país. A maioria das empresas do setor ficou sabendo de menos de 1% delas — não por falta de capacidade, mas porque os editais fecham antes de chegarem ao radar.',
    agitacao: 'Licitações de saúde aparecem em portais federais, estaduais, sistemas próprios de hospitais e secretarias, e Diários Oficiais de centenas de municípios — todos ao mesmo tempo. Prazos podem ser curtíssimos em compras emergenciais.<br><br>Enquanto você lê este e-mail, uma empresa do seu segmento recebeu um alerta de uma licitação de R$ 780 mil em equipamentos médicos compatíveis com o que ela fornece. Ela vai elaborar proposta com 15 dias de prazo. Você vai descobrir esse edital — se descobrir — quando restar 4.',
    dadoMercado: 'Só o governo federal comprou mais de <strong>R$ 60 bilhões em saúde</strong> nos últimos 12 meses pelo PNCP. Estados e municípios somam o mesmo volume. O mercado existe e é enorme — o desafio é saber que os editais existem a tempo de participar.',
    razaoContato: 'Identificamos que sua empresa tem vínculos com contratos públicos de saúde no sistema federal. Isso confirma que você já fornece para o setor público de saúde — e que os editais que saem agora são exatamente do tipo que você já atendeu.',

    subject2: '{{NOME}}, uma empresa do seu segmento recebe alertas de saúde em tempo real',
    competidor: 'Existe uma empresa fornecedora de produtos para saúde na sua região que recebe automaticamente todo edital compatível com o que ela fornece — hospitais, UPAs, laboratórios, secretarias — assim que é publicado em qualquer portal do Brasil.<br><br>Esta semana, ela recebeu 16 alertas de licitações de saúde. Avaliou quais valiam proposta em menos de 2 horas. Participou de 5. Para os outros 11, não era o produto certo ou a região não compensava — e ela soube disso rápido.<br><br>Sua empresa ficou sabendo de quantas dessas 16 licitações?',
    dadoConcreto: 'Empresas fornecedoras para o setor público de saúde que monitoram sistematicamente participam, em média, de <strong>6 a 10 vezes mais processos</strong> do que as que dependem de busca manual. Em saúde, onde licitações emergenciais têm prazo de horas ou dias, monitoramento em tempo real é ainda mais crítico.',
    fomo: 'Licitações de saúde têm prazos variados — algumas de 30 dias, outras emergenciais com prazo de 24 horas. Sem monitoramento em tempo real, você nem fica sabendo das emergenciais — e essas costumam ter os melhores preços por unidade.',

    subject3: '{{NOME}}, de fornecedora regional para contrato federal — em 8 meses',
    antes: 'Uma empresa fornecedora de equipamentos médicos de diagnóstico atuava exclusivamente em hospitais privados e clínicas. Participava de licitações "quando aparecia" — principalmente quando alguém da rede indicava um processo específico. Receita pública era esporádica.',
    virada: 'Ao configurar alertas para os equipamentos específicos que a empresa fornecia — por produto e por região —, passou a receber de 10 a 20 alertas semanais de licitações de hospitais e secretarias de saúde. A maioria não se encaixava. Mas 1 ou 2 por semana faziam sentido — e agora a empresa chegava a tempo de elaborar proposta.',
    depois: 'Em 8 meses: <strong>contrato com hospital federal, 2 contratos com secretarias estaduais, 4 contratos municipais</strong>. Receita pública foi de 5% para <strong>32% do faturamento total</strong>. "Sempre soubemos que o mercado público era grande. Agora conseguimos participar dele de verdade."',

    subject4: '{{NOME}}, o que impede empresas de saúde de ampliar contratos públicos',
    objecao1: '"Registro ANVISA e documentação são complicados"',
    resp1: 'A documentação de habilitação para saúde tem requisitos específicos — mas feita uma vez, serve para todos os processos. O Monitor te avisa do edital com antecedência, dando tempo de verificar documentação antes do prazo fechar. Você nunca mais perde processo por falta de tempo para organizar papéis.',
    objecao2: '"Hospitais públicos demoram para pagar"',
    resp2: 'O prazo legal de pagamento para contratos públicos é 30 dias após entrega e nota fiscal — e a maioria dos órgãos federais e estaduais cumpre. Municípios variam mais, mas contratos de grande porte costumam ter regularidade. E para o fluxo de caixa, contratos de longa duração são mais previsíveis do que vendas pontuais para o setor privado.',
    objecao3: '"Meu produto tem especificações técnicas muito particulares"',
    resp3: 'Você define as palavras-chave de monitoramento: nome técnico do produto, categoria ANVISA, aplicação clínica. O sistema filtra licitações que contenham exatamente esses termos — só chegam alertas de editais que descrevem o que você fornece. Não tem alerta de produto que você não tem.',

    subject5: '{{NOME}}, distribuidora de insumos hospitalares: R$ 2,1 milhões em novos contratos em 6 meses',
    novoCaso: 'Uma distribuidora de insumos hospitalares com 6 funcionários — equipe pequena, atuação regional — configurou alertas para os insumos específicos que distribuía. Em 6 meses, participou de 28 licitações em hospitais e UPAs de todo o estado.<br><br>Venceu 7 contratos. Volume total: <strong>R$ 2,1 milhões em pedidos novos</strong> — contratos de fornecimento contínuo. "Antes, as licitações que a gente ganhava vinham por acaso. Agora a gente escolhe quais vale participar."',

    subject6: '{{NOME}}, licitações de saúde que fecharam este mês sem você saber',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>2.100 licitações de saúde</strong> foram publicadas e tiveram prazo encerrado no Brasil — equipamentos médicos, insumos, serviços laboratoriais, manutenção, medicamentos. Contratos de R$ 50 mil a R$ 8 milhões. Cada uma já tem fornecedor vencedor.<br><br>As próximas 2.100 estão sendo publicadas agora. E algumas têm prazo emergencial de 24 a 72 horas.',

    ps1: '🏥 <strong>P.S.:</strong> Sua empresa já forneceu para o setor público de saúde. O hospital ou secretaria compraria de você de novo — se soubesse que você existe no momento em que a licitação abre. Quantas licitações compatíveis fecharam este mês sem que você ficasse sabendo?',
    ps2: '🔍 <strong>P.S.:</strong> A empresa que vai ganhar aquela licitação de R$ 780k não tem produto melhor que o seu. Ela ficou sabendo do edital 15 dias antes — e chegou com tempo de verificar especificações e montar uma proposta técnica completa.',
    ps3: '📊 <strong>P.S.:</strong> De 5% para 32% da receita em contratos públicos de saúde em 8 meses. Sem mudar produto, sem aumentar equipe. Com visibilidade nos editais certos, na hora certa.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão. Você vai ver em tempo real quais licitações de saúde estão sendo publicadas para os produtos que você fornece — incluindo emergenciais com prazo de 24 horas. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Acessar agora →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Algumas licitações de saúde são emergenciais — prazo de 24 a 72 horas. Sem monitoramento em tempo real, você nem fica sabendo que existiram. E essas costumam ter os melhores preços por unidade.',
    ps6: '💊 <strong>P.S.:</strong> R$ 2,1 milhões em contratos novos em 6 meses para uma empresa de 6 pessoas — com alerta para os insumos exatos que ela distribui. Não foi sorte. Foi aparecer no momento certo, com tempo para elaborar proposta.',
  },

  transporte: {
    subject1: '{{NOME}}, contratos de transporte que fecharam esta semana sem você saber',
    perda: 'O governo contrata transporte o ano inteiro: frete de cargas, transporte de pacientes, frota terceirizada, logística de medicamentos, transporte escolar — <strong>contratos de 12 a 36 meses, com pagamento garantido</strong>.<br><br>Esta semana, mais de <strong>1.200 contratos de transporte e logística</strong> foram publicados no Brasil. A maioria das empresas do setor participou de uma fração mínima deles — não por falta de capacidade, mas porque os editais fecham antes de chegarem ao radar.',
    agitacao: 'Editais de transporte aparecem em portais federais, estaduais, municipais e Diários Oficiais de centenas de cidades — todos ao mesmo tempo, com prazos que variam de 5 a 30 dias.<br><br>Enquanto você lê este e-mail, uma empresa de transporte do seu porte recebeu um alerta de um contrato de R$ 1,8 milhão por ano em frete de órgão federal. Ela vai elaborar proposta com 20 dias. Você vai descobrir esse edital — se descobrir — quando restar 4.',
    dadoMercado: 'O mercado público de transporte e logística no Brasil movimenta mais de <strong>R$ 25 bilhões por ano</strong> em contratos governamentais — transporte escolar, frota terceirizada, frete de cargas, transporte de pacientes. Contratos de longa duração, pagamento garantido, renovação frequente.',
    razaoContato: 'Identificamos que sua empresa tem vínculos com contratos públicos de transporte no sistema federal. Isso confirma que você já fornece para o governo — e que os editais que saem agora são exatamente do tipo que você já atendeu.',

    subject2: '{{NOME}}, uma transportadora da sua região monitora editais em tempo real',
    competidor: 'Existe uma empresa de transporte na sua região — porte similar, frota compatível — que configurou alertas automáticos para todo contrato de frete, transporte e logística publicado no seu estado.<br><br>Esta semana, ela recebeu 11 alertas. Avaliou os 11 em menos de 1 hora. Decidiu participar de 3. Para os outros 8, não compensava a rota ou o porte do contrato — e ela soube disso rápido, sem gastar tempo de equipe.<br><br>Sua empresa ficou sabendo de quantos desses 11 editais?',
    dadoConcreto: 'Transportadoras que monitoram sistematicamente participam de <strong>5 a 9 vezes mais processos</strong> do que as que dependem de busca manual. Em transporte, onde contratos têm duração de 12 a 36 meses, cada licitação perdida é potencialmente 3 anos de receita garantida que vai para o concorrente.',
    fomo: 'Contratos de transporte têm duração de 12 a 36 meses. Quando você não sabe que o edital existe, perde o contrato inteiro — não só uma entrega. São até 3 anos de receita garantida que vão para quem estava monitorando.',

    subject3: '{{NOME}}, de 2 contratos para 8 em um ano — o que mudou',
    antes: 'Uma empresa de transporte e logística no interior do Brasil fechava 2 contratos públicos por ano — ambos conseguidos por indicação de clientes antigos. A busca manual em portais era irregular e cansativa. Parecia o teto possível para a empresa.',
    virada: 'Ao configurar alertas para "frete", "transporte", "logística" e "frota" em todos os portais, a empresa passou a receber de 8 a 15 alertas semanais de contratos compatíveis — em cidades e estados da região que ela nunca teria buscado manualmente. Alguns não valiam a rota. Outros eram exatamente o perfil da frota.',
    depois: 'Em 12 meses: <strong>8 contratos públicos vencidos</strong> (contra 2 no ano anterior). Volume total: <strong>R$ 4,2 milhões em receita de contratos</strong>. Frota cresceu 40% para atender a demanda. "Sempre existiram esses contratos. A gente simplesmente nunca ficava sabendo."',

    subject4: '{{NOME}}, o que impede transportadoras de ampliar contratos públicos',
    objecao1: '"Não tenho frota suficiente para contratos maiores"',
    resp1: 'O sistema filtra por tipo de transporte e porte do contrato. Você define o que monitora — só recebe alertas de contratos compatíveis com a sua frota atual. Não precisa comprometer o que a empresa não consegue atender. E à medida que os contratos chegam, a frota cresce.',
    objecao2: '"A distância das cidades não compensa"',
    resp2: 'O filtro de monitoramento inclui UF, região e distância aproximada. Você recebe apenas alertas de editais que fazem sentido logístico para a sua base de operação. Sem perder tempo avaliando contratos que nunca valeria a pena participar.',
    objecao3: '"Prefiro clientes privados — pagam mais rápido"',
    resp3: 'Contratos públicos de longa duração têm algo que o privado raramente oferece: previsibilidade de receita por 12 a 36 meses. Para planejamento de frota, RH e capital de giro, um contrato de frete governamental de 2 anos vale mais do que 10 clientes privados sem compromisso. E o prazo legal de pagamento é 30 dias.',

    subject5: '{{NOME}}, transportadora do Centro-Oeste: 3 contratos federais em 5 meses',
    novoCaso: 'Uma empresa de transporte de cargas do Centro-Oeste — operação regional, nunca tinha ganhado um contrato federal. Configurou alertas para "frete", "transporte de cargas", "logística" e "distribuição".<br><br>Em 5 meses: <strong>3 contratos federais vencidos</strong> — distribuição de materiais para órgãos do governo. Volume total: <strong>R$ 2,8 milhões em contratos anuais</strong>. Frota cresceu para atender. "Não sabia que o governo federal contratava transporte do nosso tamanho. Agora sei."',

    subject6: '{{NOME}}, contratos de transporte que fecharam este mês sem você participar',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>1.200 contratos de transporte e logística</strong> foram publicados e tiveram prazo encerrado no Brasil. Contratos de R$ 150 mil a R$ 6 milhões por ano — frete, frota, transporte de pacientes, transporte escolar. Cada um já tem vencedor. São contratos de 12 a 36 meses.<br><br>Os próximos 1.200 estão sendo publicados agora.',

    ps1: '🚛 <strong>P.S.:</strong> Sua empresa já tem contratos públicos de transporte. O governo compraria de você de novo — se soubesse que você existe no momento em que o edital abre. Quantos editais compatíveis fecharam este mês sem que você recebesse um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> A transportadora que ganhou aquele contrato de R$ 1,8 milhão não tem frota melhor que a sua. Ela ficou sabendo do edital 20 dias antes e chegou com tempo de calcular rota e montar proposta competitiva.',
    ps3: '📊 <strong>P.S.:</strong> 2 contratos para 8 em um ano, R$ 4,2 milhões em receita de contratos, frota crescendo 40%. O que mudou foi a visibilidade sobre o que estava sendo licitado na região.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão. Você vai ver em tempo real quais contratos de transporte estão sendo publicados para o perfil da sua frota — antes que os prazos comecem a correr. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Começar agora →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Contratos de transporte têm duração de 12 a 36 meses. Cada edital perdido por falta de visibilidade é potencialmente 3 anos de receita mensal garantida que vai para o concorrente que estava monitorando.',
    ps6: '🚌 <strong>P.S.:</strong> Nunca tinha ganhado um contrato federal. Em 5 meses com monitoramento: R$ 2,8 milhões em contratos anuais. O governo federal contrata transportadoras regionais — a maioria delas só não sabe quando os editais abrem.',
  },

  alimentacao: {
    subject1: '{{NOME}}, merenda escolar e refeições institucionais: R$ 15 bilhões licitados por ano',
    perda: 'Prefeituras, escolas públicas, hospitais, presídios, forças armadas — o governo é o <strong>maior comprador de alimentação coletiva e gêneros alimentícios do Brasil</strong>. Merenda escolar, refeições institucionais, gêneros alimentícios, fornecimento de marmitas — <strong>R$ 15 bilhões em contratos por ano</strong>.<br><br>Esta semana, mais de <strong>2.400 contratos de alimentação</strong> foram publicados no Brasil. A maioria das empresas do setor participou de uma fração mínima deles — não porque não tinham capacidade, mas porque os editais fecharam antes de chegarem ao radar.',
    agitacao: 'Editais de alimentação aparecem em portais federais, estaduais, municipais e Diários Oficiais de centenas de cidades — ao mesmo tempo, com prazos de 5 a 30 dias. Nenhuma equipe consegue acompanhar tudo isso manualmente com consistência.<br><br>Enquanto você lê este e-mail, uma empresa do seu setor recebeu um alerta de um contrato de merenda escolar de R$ 1,2 milhão por ano em prefeitura vizinha. Ela vai elaborar proposta com 18 dias de prazo. Você vai descobrir esse edital — se descobrir — quando restar 3.',
    dadoMercado: 'Só o Programa Nacional de Alimentação Escolar (PNAE) distribui mais de <strong>R$ 4 bilhões por ano</strong> para prefeituras comprarem merenda. Somando refeições institucionais, gêneros alimentícios e serviços de cozinha em hospitais e quartéis, o mercado público de alimentação ultrapassa R$ 15 bilhões anuais.',
    razaoContato: 'Identificamos que sua empresa tem vínculos com contratos públicos de alimentação ou gêneros alimentícios no sistema federal. Isso confirma que você já fornece para o governo — e que os editais que saem agora são exatamente do perfil que você já atendeu.',

    subject2: '{{NOME}}, uma empresa do setor alimentício monitora licitações em tempo real',
    competidor: 'Existe uma empresa de fornecimento de alimentação na sua região que configurou alertas automáticos para todo edital de merenda, refeição, gêneros alimentícios e alimentação coletiva publicado no seu estado.<br><br>Esta semana, ela recebeu 18 alertas. Avaliou todos em menos de 2 horas. Decidiu participar de 5. Para os outros 13, não valia o volume ou o prazo de entrega — e ela soube disso sem gastar tempo de equipe.<br><br>Sua empresa ficou sabendo de quantos desses 18 editais?',
    dadoConcreto: 'Empresas do setor de alimentação que monitoram sistematicamente participam de <strong>5 a 10 vezes mais processos</strong> do que as que dependem de busca manual. Em alimentação escolar, onde os contratos têm duração de 12 meses com renovação automática, cada edital perdido é um ano inteiro de receita mensal que vai para o concorrente.',
    fomo: 'Contratos de alimentação pública têm duração de 12 meses com renovação frequente. Quando você não sabe que o edital existe, perde o contrato inteiro — não só uma venda. É 1 ano de receita garantida que vai para quem estava monitorando.',

    subject3: '{{NOME}}, de fornecedora local para 9 prefeituras — em 8 meses',
    antes: 'Uma empresa fornecedora de gêneros alimentícios para escolas municipais atendia apenas a própria cidade — não por falta de capacidade, mas porque nunca ficava sabendo dos editais das prefeituras vizinhas. A busca manual era irregular. Participava de 2 ou 3 licitações por ano.',
    virada: 'Ao configurar alertas para "gêneros alimentícios", "merenda escolar", "alimentação escolar" e "produtos alimentícios" em todas as prefeituras do estado, a empresa passou a receber alertas de contratos em cidades no raio de 200km que ela nunca teria encontrado manualmente. Alguns não valiam o frete. Outros sim.',
    depois: 'Em 8 meses: <strong>contratos com 9 prefeituras diferentes</strong> (estava em 1 antes). Volume de faturamento público cresceu <strong>480%</strong>. Equipe de produção cresceu 60% para atender. "Sempre existiram esses contratos. A gente simplesmente não sabia quando os editais abriam."',

    subject4: '{{NOME}}, o que impede empresas de alimentação de ampliar contratos públicos',
    objecao1: '"Logística para cidades distantes não compensa"',
    resp1: 'O filtro de monitoramento inclui região e distância aproximada. Você define o raio de atuação — só recebe alertas de editais de prefeituras que fazem sentido logístico para a sua operação. Sem perder tempo avaliando contratos que nunca valeria atender.',
    objecao2: '"Prefeituras pequenas têm volumes baixos"',
    resp2: 'Contratos de merenda com prefeituras pequenas têm volumes menores individualmente — mas são renováveis por anos e muito previsíveis. Algumas empresas acumulam contratos com 10, 15 prefeituras e têm uma base de receita pública extremamente estável. O tamanho da prefeitura não define a qualidade do contrato.',
    objecao3: '"A Vigilância Sanitária e os documentos são complicados"',
    resp3: 'A documentação sanitária — Alvará da Vigilância, registros de produto — feita uma vez, serve para todos os processos. O Monitor te avisa do edital com antecedência, dando tempo de verificar documentação antes do prazo fechar. E para contratos de gêneros alimentícios in natura com agricultores familiares, as exigências são ainda mais simples.',

    subject5: '{{NOME}}, fornecedora de merenda no Norte: de 1 para 12 prefeituras em 10 meses',
    novoCaso: 'Uma empresa fornecedora de gêneros alimentícios no Norte do Brasil atendia 1 prefeitura — a cidade sede. Configurou alertas para "merenda escolar", "gêneros alimentícios", "alimentação escolar" e "agricultura familiar".<br><br>Em 10 meses: contratos com <strong>12 prefeituras</strong> — todas dentro do raio de 300km. Volume total: <strong>R$ 3,8 milhões em contratos anuais</strong>. Equipe e capacidade produtiva foram ampliadas. "Sempre soubemos que éramos bons. Agora temos contratos que provam isso."',

    subject6: '{{NOME}}, contratos de alimentação que fecharam este mês sem você participar',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>2.400 contratos de alimentação e gêneros alimentícios</strong> foram publicados e tiveram prazo encerrado no Brasil. Merenda escolar, refeições institucionais, fornecimento de alimentos para hospitais e quartéis — contratos de R$ 80 mil a R$ 4 milhões. Cada um já tem fornecedor vencedor.<br><br>Os próximos 2.400 estão sendo publicados agora.',

    ps1: '🍽️ <strong>P.S.:</strong> Sua empresa já forneceu para o setor público. O órgão compraria de você de novo — se soubesse que você existe no momento em que o edital abre. Quantos contratos de alimentação foram publicados este mês na sua região e você não recebeu um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> A empresa que ganhou aquele contrato de merenda de R$ 1,2 milhão não tem comida melhor que a sua. Ela ficou sabendo do edital 18 dias antes e chegou com tempo de calcular frete, precificar e montar proposta completa.',
    ps3: '📊 <strong>P.S.:</strong> De 1 para 12 prefeituras em 10 meses, faturamento público +480%. Sem mudar produto, sem mudar qualidade. Com visibilidade sobre quais prefeituras estavam licitando na região.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão. Você vai ver em tempo real quais contratos de alimentação estão sendo publicados para o perfil da sua empresa — antes que os prazos comecem a correr. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Ver editais do meu setor →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Contratos de merenda têm duração de 12 meses com renovação. Cada edital que você perde por não saber que existe é um ano inteiro de receita mensal garantida que vai para o concorrente que estava monitorando.',
    ps6: '🥗 <strong>P.S.:</strong> 1 prefeitura para 12 em 10 meses — R$ 3,8 milhões em contratos anuais novos. O produto era bom antes. O que mudou foi saber quando os editais das outras prefeituras abriam.',
  },

  generico: {
    subject1: '{{NOME}}, quanto o governo está licitando no seu setor — e você está vendo?',
    perda: 'Prefeituras, estados, autarquias, hospitais públicos, órgãos federais — o governo brasileiro é um dos maiores compradores de bens e serviços do mundo. Contratos de todas as categorias, o ano inteiro, em todos os estados.<br><br>Esta semana, mais de <strong>18.000 licitações públicas</strong> foram publicadas no Brasil. A maioria das empresas brasileiras participou de uma fração mínima das que eram compatíveis com o seu setor — não por falta de capacidade, mas porque os editais fecham antes de chegarem ao radar.',
    agitacao: 'Licitações são publicadas ao mesmo tempo no PNCP, ComprasNet, BLL, Licitações-e, portais estaduais, Diários Oficiais de centenas de municípios. Prazos variam de 5 a 30 dias. É humanamente impossível acompanhar tudo sem automação.<br><br>Enquanto você lê este e-mail, um concorrente do mesmo porte que a sua empresa recebeu um alerta de um edital compatível com o que ele fornece. Ele vai elaborar proposta com 15 dias de prazo. Você vai descobrir esse edital — se descobrir — quando restar 3.',
    dadoMercado: 'O governo federal publicou mais de <strong>R$ 240 bilhões em contratos nos últimos 12 meses</strong> só no PNCP. Estados e municípios somam volume equivalente. O dinheiro existe. Os contratos existem. O que falta para a maioria das empresas é visibilidade — a tempo de participar.',
    razaoContato: 'Identificamos que sua empresa tem vínculos com contratos públicos no sistema federal de contratações. Isso confirma que você já fornece para o governo — e que os editais que saem agora são exatamente do tipo que você já atendeu.',

    subject2: '{{NOME}}, um concorrente do seu porte monitora editais em tempo real',
    competidor: 'Existe uma empresa no seu setor — do mesmo porte que a sua, fornecendo produtos ou serviços similares — que configurou monitoramento automático. Ela recebe alertas de todo edital compatível com o que ela fornece, assim que é publicado em qualquer portal, em qualquer estado do Brasil.<br><br>Esta semana, ela recebeu vários alertas. Avaliou quais valiam proposta em menos de 1 hora. Participou dos que faziam sentido. Para o resto, não desperdiçou tempo de equipe.<br><br>Sua empresa ficou sabendo de quantos desses editais?',
    dadoConcreto: 'Empresas que monitoram sistematicamente participam, em média, de <strong>5 a 10 vezes mais processos</strong> do que as que dependem de busca manual — e vencem contratos na mesma proporção. A diferença não está na qualidade do produto. Está no número de oportunidades que chegam a tempo.',
    fomo: 'Cada semana sem monitoramento é uma semana de editais que abriram, correram e fecharam — sem que você soubesse que existiam. Esses contratos não voltam.',

    subject3: '{{NOME}}, o que muda quando uma empresa começa a monitorar licitações',
    antes: 'A maioria das empresas que fornece para o governo participa de 2 a 5 licitações por ano. A estratégia é sempre a mesma: busca esporádica em portais, indicação de clientes, às vezes aviso de despachante. É o teto que parece natural — mas não é.',
    virada: 'Ao configurar monitoramento automático com as palavras-chave certas, o cenário muda desde a primeira semana: chegam alertas de editais compatíveis que nunca apareceriam na busca manual — em cidades vizinhas, em estados da região, em órgãos que você nunca tinha prospectado. Alguns valem proposta, outros não. Mas agora a empresa <em>escolhe</em> — em vez de perder por padrão.',
    depois: 'O padrão observado em empresas que adotam monitoramento sistemático: <strong>participação em 5 a 10 vezes mais processos</strong> no primeiro ano. Taxa de vitória similar — o que se traduz em 5 a 10 vezes mais contratos ganhos. Sem mudar produto, sem aumentar equipe, sem reduzir preço.',

    subject4: '{{NOME}}, as três dúvidas mais comuns — respondidas',
    objecao1: '"Não tenho equipe para acompanhar mais licitações"',
    resp1: 'O alerta chega com objeto, valor estimado, órgão, prazo e link para o edital. Você avalia em 2 minutos se vale participar ou não — sem abrir portal, sem busca manual. Só investe tempo nos editais que fazem sentido. O sistema faz a busca; você faz a decisão.',
    objecao2: '"Nunca participei de licitação e não sei como começar"',
    resp2: 'O Monitor resolve a parte mais difícil: saber que o edital existe, a tempo de participar. Para a parte de elaboração de proposta e habilitação, temos guias e suporte incluso no trial. Muitas empresas participam do primeiro processo em menos de 30 dias após ativar o monitoramento.',
    objecao3: '"Não sei se vai funcionar para o que eu vendo"',
    resp3: 'Você define as palavras-chave de monitoramento: o nome do produto ou serviço exatamente como você descreveria para um cliente. Se os termos aparecerem em editais públicos, você vai receber alertas. Em 7 dias de trial você vai saber se funciona para o seu caso — sem nenhum custo.',

    subject5: '{{NOME}}, empresa de serviços: primeiro contrato público em 8 anos de operação',
    novoCaso: 'Uma empresa prestadora de serviços especializados com 8 anos de operação — nunca tinha participado de licitação pública. Achava que "não era para o seu perfil". Configurou alertas para os serviços que prestava.<br><br>Em 3 meses: <strong>4 contratos públicos vencidos</strong> — 3 municipais e 1 estadual. Volume total: <strong>R$ 890 mil no primeiro ano</strong>. "Em 8 anos achei que não era pra nós. Em 3 meses descobri que éramos exatamente o que o governo estava buscando."',

    subject6: '{{NOME}}, contratos que fecharam este mês sem você participar',
    urgenciaReal: 'Nos últimos 30 dias, mais de <strong>18.000 licitações públicas</strong> foram publicadas e tiveram prazo encerrado no Brasil. Serviços, produtos, obras, fornecimentos — contratos de R$ 30 mil a dezenas de milhões. Cada um já tem vencedor.<br><br>Os próximos 18.000 estão sendo publicados agora. Os prazos começaram a correr.',

    ps1: '⚠️ <strong>P.S.:</strong> Sua empresa já forneceu para o setor público. O governo compraria de você de novo — se soubesse que você existe no momento em que o edital abre. Quantos editais compatíveis fecharam este mês sem que você recebesse um alerta?',
    ps2: '🔍 <strong>P.S.:</strong> O concorrente que recebeu aquele alerta hoje não tem produto melhor que o seu. Ele tem um sistema que avisa na hora que o edital sai — antes que o prazo comece a correr.',
    ps3: '📊 <strong>P.S.:</strong> 5 a 10 vezes mais participações em licitações, sem mudar produto ou equipe. O que muda é o número de editais que chegam em tempo hábil para elaborar proposta.',
    ps4: '🔓 <strong>P.S.:</strong> Trial de 7 dias gratuito. Sem cartão de crédito. Em uma semana você vai ver exatamente quais editais do seu setor estão sendo publicados — e o que estava passando pela sua empresa sem você saber. <a href="{{CTA_HREF}}" style="color:#6B0F1A;font-weight:700;">Começar gratuitamente →</a>',
    ps5: '⏰ <strong>P.S.:</strong> Cada semana sem monitoramento é uma semana de licitações que abriram, correram e fecharam — sem que você soubesse que existiam. Esses contratos não voltam.',
    ps6: '🏢 <strong>P.S.:</strong> 8 anos sem participar de licitação — "não era pra nós". Em 3 meses com monitoramento: R$ 890 mil em novos contratos. O governo estava comprando o que ela vendia o tempo todo. Ela só não sabia.',
  },
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
        <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:3px;">${obj}</div>
        <div style="font-size:12px;color:#666;margin-bottom:4px;">${org}${est}</div>
        ${valor ? `<span style="display:inline-block;font-size:11px;background:#fef3c7;color:#92400e;padding:2px 7px;border-radius:99px;font-weight:700;margin-right:8px;">${valor}</span>` : ''}
        ${data  ? `<span style="font-size:11px;color:#888;">📅 Abertura: ${data}</span>` : ''}
      </td>
    </tr>`
  }).join('')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td>
        <div style="font-size:12px;font-weight:800;color:#6B0F1A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">📋 Exemplos de licitações abertas no seu setor</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;border-collapse:collapse;">
          ${items}
          <tr><td style="padding:10px 14px;background:#6B0F1A;text-align:center;">
            <a href="${ctaHref}" style="font-size:12px;color:#C9A65A;font-weight:700;text-decoration:none;">Ver todas as licitações do seu setor →</a>
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
  return `\nEXEMPLOS DE LICITAÇÕES ABERTAS:\n${lines}\n`
}

function buildObjetoHtml(objeto: string, nome: string): string {
  const obj = objeto.length > 120 ? objeto.slice(0, 120) + '…' : objeto
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #0284c7;border-radius:0 8px 8px 0;margin:20px 0;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:11px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">📋 Por que estamos entrando em contato com você</div>
        <p style="margin:0;font-size:14px;color:#0c4a6e;line-height:1.6;">
          Identificamos que <strong>${nome}</strong> participou de um processo licitatório com o objeto:<br>
          <em style="color:#075985;">"${obj}"</em><br><br>
          Isso confirma que sua empresa já fornece para o setor público — e que provavelmente há contratos similares abertos agora que você ainda não viu.
        </p>
      </td></tr>
    </table>`
}

// Estilos inline para boxes usados no conteúdo das variantes
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

function wrapEmail(opts: {
  subject: string; nome: string; cidade: string | null
  conteudo: string; ctaHref: string; ctaTexto: string
  ps: string; pixelTag: string; url: string; unsub: string
}): string {
  const cidadeStr = opts.cidade ? ` — <span style="color:#6B0F1A;font-weight:600;">${opts.cidade}</span>` : ''
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:white;border-radius:14px;overflow:hidden;border:1px solid #E8E4DC;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:#6B0F1A;padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;background:#C9A65A;border-radius:8px;text-align:center;vertical-align:middle;" valign="middle">
          <span style="color:#6B0F1A;font-weight:900;font-size:13px;">ML</span>
        </td>
        <td style="padding-left:12px;">
          <div style="color:white;font-size:15px;font-weight:700;">Monitor de Licitações</div>
          <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:1px;">Monitoramento de licitações públicas</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Linha dourada -->
  <tr><td style="height:2px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0);"></td></tr>

  <!-- Corpo -->
  <tr><td style="padding:36px 40px 28px;">
    <p style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 20px;line-height:1.3;">Olá, <strong>${opts.nome}</strong>${cidadeStr} —</p>
    ${opts.conteudo}

    <!-- CTA block -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#6B0F1A;border-radius:12px;margin:28px 0;">
      <tr><td style="padding:28px 32px;" align="center">
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 16px;">Trial gratuito de 7 dias · Sem cartão · Sem compromisso</p>
        <a href="${opts.ctaHref}" style="display:inline-block;background:#C9A65A;color:#6B0F1A;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:900;letter-spacing:0.02em;">${opts.ctaTexto}</a>
        <p style="color:rgba(255,255,255,0.65);font-size:12px;margin:12px 0 0;">✓ Alertas no mesmo dia &nbsp;·&nbsp; ✓ E-mail + Telegram &nbsp;·&nbsp; ✓ Suporte incluso</p>
      </td></tr>
    </table>

    <!-- PS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;margin:20px 0;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">${opts.ps}</p>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#888;margin:8px 0 0;">Responda este e-mail para falar com nossa equipe — retornamos em até 1 dia útil.</p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;background:#fafafa;">
    <p style="font-size:11px;color:#bbb;margin:0;line-height:1.8;">
      <strong style="color:#bbb;">Monitor de Licitações</strong> · Matutta Soluções Digitais<br>
      Você recebeu este e-mail porque <strong style="color:#bbb;">${opts.nome}</strong> consta como fornecedora em contratos públicos no PNCP.<br>
      Não quer mais receber? <a href="${opts.url}/descadastrar?token=${opts.unsub}" style="color:#bbb;text-decoration:underline;">Clique aqui para se descadastrar</a>
    </p>
  </td></tr>

  <!-- Barra final -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#6B0F1A,#C9A65A,transparent);"></td></tr>

</table>
</td></tr>
</table>
${opts.pixelTag}
</body>
</html>`
}

// ─── Exportação principal ─────────────────────────────────────────────────────

function limparNome(razao: string): string {
  // MEIs têm CNPJ básico (8 dígitos) prefixado à razão social: "47568432 FULANO DE TAL"
  return razao.replace(/^\d{8}\s+/, '').trim()
}

export function emailCaptacao(p: ParamsCaptacao) {
  const nome   = p.nomeFantasia || limparNome(p.razaoSocial)
  const cidade = p.municipio ? `${p.municipio}${p.uf ? '/' + p.uf : ''}` : null
  const url    = (p.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')
  const num    = p.numeroEmail ?? 1
  const setor  = detectarSetor(p.cnae)
  const copy   = SETOR[setor]
  const lics   = p.licitacoes ?? []

  const campanha = num === 1 ? 'trial7d' : `cap${num}`
  const ctaDest  = `${url}/cadastro?ref=captacao-email&utm_source=captacao&utm_medium=email&utm_campaign=${campanha}&utm_content=${setor}`
  const ctaHref  = p.id ? `${url}/api/track/click/${p.id}?url=${encodeURIComponent(ctaDest)}` : ctaDest
  const pixelTag = p.id
    ? `<img src="${url}/api/track/open/${p.id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : ''
  const UNSUB = '{{UNSUB_TOKEN}}'

  const psHref = (ps: string) => ps.replace('{{CTA_HREF}}', ctaHref)

  // ── E1 (D+0) — PAS + LOSS FRAMING + SOCIAL PROOF + RISK REVERSAL ───────────
  if (num === 1) {
    const subject = copy.subject1.replace('{{NOME}}', nome)
    const objetoHtml = p.objeto ? buildObjetoHtml(p.objeto, nome) : ''

    const conteudo = `
      ${objetoHtml}
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.pain}"><tr><td>
        <p style="${BOX.painP}">${copy.perda}</p>
      </td></tr></table>
      <p>${copy.agitacao}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.insight}"><tr><td>
        <p style="${BOX.insightP}"><strong>O tamanho do mercado que está sendo licitado:</strong><br><br>${copy.dadoMercado}</p>
      </td></tr></table>
      <p>${copy.razaoContato}</p>
      <p>O Monitor de Licitações monitora 7+ portais simultaneamente — PNCP, ComprasNet, BLL, Licitações-e, Diários Oficiais estaduais e mais — e envia alertas no momento em que um edital compatível com o seu perfil é publicado.</p>
      <p style="font-size:14px;color:#555;text-align:center;margin:4px 0 20px;">Empresas que monitoram participam de 5 a 10x mais licitações. Sem aumentar equipe. Sem mudar produto.</p>
      <p style="text-align:center;margin:8px 0 24px;"><a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;font-size:15px;">→ Ver os editais do meu setor agora (trial gratuito 7 dias)</a></p>
      ${buildLicitacoesHtml(lics, ctaHref)}`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Começar trial gratuito de 7 dias →', ps: psHref(copy.ps1), pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\n${copy.perda.replace(/<[^>]+>/g, '')}\n\n${copy.agitacao.replace(/<[^>]+>/g, '')}\n\n${copy.dadoMercado.replace(/<[^>]+>/g, '')}\n\n${copy.razaoContato}\n\nVer editais do meu setor (trial gratuito 7 dias):\n${ctaDest}${buildLicitacoesTxt(lics)}\n\n---\n${copy.ps1.replace(/<[^>]+>/g, '').replace('{{CTA_HREF}}', ctaDest)}\n\nResponda este e-mail para falar com nossa equipe.\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E2 (D+4) — COMPETITOR FRAME + FOMO ─────────────────────────────────────
  if (num === 2) {
    const subject  = copy.subject2.replace('{{NOME}}', nome)
    const conteudo = `
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.story}"><tr><td>
        <div style="${BOX.storyLabel}">🔍 O que está acontecendo agora no seu setor</div>
        <p style="${BOX.storyP}">${copy.competidor}</p>
      </td></tr></table>
      <p>${copy.dadoConcreto}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.pain}"><tr><td>
        <p style="${BOX.painP}">${copy.fomo}</p>
      </td></tr></table>
      <p>O trial gratuito de 7 dias mostra exatamente o que está sendo licitado no seu setor — em tempo real. <a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;">Acesse e veja os alertas dos últimos dias →</a></p>
      ${buildLicitacoesHtml(lics, ctaHref)}`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Ver editais do meu setor →', ps: psHref(copy.ps2), pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\n${copy.competidor.replace(/<[^>]+>/g, '')}\n\n${copy.dadoConcreto.replace(/<[^>]+>/g, '')}\n\n${copy.fomo}\n\nTrial gratuito 7 dias — sem cartão:\n${ctaDest}${buildLicitacoesTxt(lics)}\n\n---\n${copy.ps2.replace(/<[^>]+>/g, '').replace('{{CTA_HREF}}', ctaDest)}\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E3 (D+8) — TRANSFORMAÇÃO COM NÚMEROS ────────────────────────────────────
  if (num === 3) {
    const subject  = copy.subject3.replace('{{NOME}}', nome)
    const conteudo = `
      <p>Até agora falei sobre o que está sendo licitado no seu setor — e sobre o que acontece com quem monitora versus quem não monitora.</p>
      <p>Hoje quero te mostrar um caso concreto.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.story}"><tr><td>
        <div style="${BOX.storyLabel}">📋 A situação antes</div>
        <p style="${BOX.storyP}">${copy.antes}</p>
      </td></tr></table>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.insight}"><tr><td>
        <p style="${BOX.insightP}"><strong>O que mudou:</strong><br><br>${copy.virada}</p>
      </td></tr></table>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.transform}"><tr><td>
        <div style="${BOX.transformL}">✅ O resultado</div>
        <p style="${BOX.transformP}">${copy.depois}</p>
      </td></tr></table>
      <p>O que mudou não foi o produto, a equipe ou o preço. Foi o número de oportunidades que chegaram a tempo de participar.</p>
      <p style="text-align:center;margin:8px 0 24px;"><a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;font-size:15px;">→ Quero ver o que está sendo licitado no meu setor (7 dias grátis)</a></p>
      ${buildLicitacoesHtml(lics, ctaHref)}`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Começar trial gratuito →', ps: psHref(copy.ps3), pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\nUm caso concreto:\n\nAntes: ${copy.antes.replace(/<[^>]+>/g, '')}\n\nO que mudou: ${copy.virada.replace(/<[^>]+>/g, '')}\n\nResultado: ${copy.depois.replace(/<[^>]+>/g, '')}\n\nTrial gratuito 7 dias:\n${ctaDest}${buildLicitacoesTxt(lics)}\n\n---\n${copy.ps3.replace(/<[^>]+>/g, '').replace('{{CTA_HREF}}', ctaDest)}\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E4 (D+17) — QUEBRA DE OBJEÇÕES + RISK REVERSAL ─────────────────────────
  if (num === 4) {
    const subject  = copy.subject4.replace('{{NOME}}', nome)
    const conteudo = `
      <p>Enviei alguns e-mails nos últimos dias sobre o mercado público no seu setor. Ainda não ativou o trial.</p>
      <p>Isso costuma acontecer por uma das três razões abaixo. Vou responder cada uma:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.objection}"><tr><td>
        <div style="${BOX.objQ}">❶ ${copy.objecao1}</div>
        <div style="${BOX.objA}">${copy.resp1}</div>
      </td></tr></table>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.objection}"><tr><td>
        <div style="${BOX.objQ}">❷ ${copy.objecao2}</div>
        <div style="${BOX.objA}">${copy.resp2}</div>
      </td></tr></table>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.objection}"><tr><td>
        <div style="${BOX.objQ}">❸ ${copy.objecao3}</div>
        <div style="${BOX.objA}">${copy.resp3}</div>
      </td></tr></table>
      <p>Se não foi nenhuma dessas três, responda este e-mail e me diz o que está segurando — vejo o que consigo resolver.</p>
      <p>O trial de 7 dias é gratuito, sem cartão, sem compromisso. Se não funcionar para o seu caso, você cancela e não custa nada. <a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;">Ativar agora →</a></p>`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Ativar trial gratuito de 7 dias →', ps: psHref(copy.ps4), pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\nAinda não ativou o trial. Respondo as dúvidas mais comuns:\n\n1. ${copy.objecao1}\n${copy.resp1.replace(/<[^>]+>/g, '')}\n\n2. ${copy.objecao2}\n${copy.resp2.replace(/<[^>]+>/g, '')}\n\n3. ${copy.objecao3}\n${copy.resp3.replace(/<[^>]+>/g, '')}\n\nTrial gratuito 7 dias — sem cartão:\n${ctaDest}\n\n---\n${copy.ps4.replace(/<[^>]+>/g, '').replace('{{CTA_HREF}}', ctaDest)}\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E5 (D+32) — NOVA PROVA SOCIAL ───────────────────────────────────────────
  if (num === 5) {
    const subject  = copy.subject5.replace('{{NOME}}', nome)
    const conteudo = `
      <p>Tem um caso novo que quero compartilhar.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.transform}"><tr><td>
        <div style="${BOX.transformL}">📈 Resultado real</div>
        <p style="${BOX.transformP}">${copy.novoCaso}</p>
      </td></tr></table>
      <p>O ponto não é que todo mundo vai ter o mesmo resultado. O ponto é que, sem monitoramento, você nem chega a participar dos processos que fazem sentido.</p>
      <p>O trial de 7 dias ainda está disponível — sem cartão, sem compromisso. <a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;">Acessar gratuitamente →</a></p>
      ${buildLicitacoesHtml(lics, ctaHref)}`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Ver editais do meu setor →', ps: psHref(copy.ps5), pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\n${copy.novoCaso.replace(/<[^>]+>/g, '')}\n\nTrial gratuito 7 dias:\n${ctaDest}${buildLicitacoesTxt(lics)}\n\n---\n${copy.ps5.replace(/<[^>]+>/g, '').replace('{{CTA_HREF}}', ctaDest)}\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E6 (D+62) — URGÊNCIA REAL ───────────────────────────────────────────────
  if (num === 6) {
    const subject  = copy.subject6.replace('{{NOME}}', nome)
    const conteudo = `
      <table width="100%" cellpadding="0" cellspacing="0" style="${BOX.pain}"><tr><td>
        <p style="${BOX.painP}">${copy.urgenciaReal}</p>
      </td></tr></table>
      <p>Faz dois meses que enviei o primeiro e-mail sobre o mercado público no seu setor.</p>
      <p>Nesse período, centenas de editais compatíveis com o seu perfil abriram e fecharam. Alguns valeriam proposta. Outros não. Mas você não teve como escolher — porque não recebeu os alertas.</p>
      <p>O trial de 7 dias não custa nada e não pede cartão. Em uma semana, você vê em tempo real o que está sendo licitado no seu setor — e decide se vale continuar. <a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;">Ativar agora →</a></p>`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Começar trial gratuito →', ps: psHref(copy.ps6), pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\n${copy.urgenciaReal.replace(/<[^>]+>/g, '')}\n\nFaz dois meses que enviei o primeiro e-mail. Nesse período, centenas de editais compatíveis com o seu perfil abriram e fecharam.\n\nO trial é gratuito, sem cartão:\n${ctaDest}\n\n---\n${copy.ps6.replace(/<[^>]+>/g, '').replace('{{CTA_HREF}}', ctaDest)}\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E7 (D+92) — PERGUNTA HUMANA ─────────────────────────────────────────────
  if (num === 7) {
    const subject  = `${nome}, uma pergunta direta`
    const conteudo = `
      <p>Enviamos alguns e-mails sobre monitoramento de licitações nos últimos meses. Você nunca respondeu.</p>
      <p>Tenho uma pergunta direta: <strong>sua empresa ainda participa de licitações públicas?</strong></p>
      <p>Pode ser que o mercado público não faça mais sentido para o seu modelo de negócio. Pode ser que você já tenha uma solução de monitoramento. Pode ser que esteja em outro momento.</p>
      <p>Responda este e-mail com uma linha — vou entender a resposta, seja ela qual for. Se não responder, vou assumir que não faz mais sentido e encerro a sequência por aqui.</p>
      <p style="text-align:center;margin:8px 0 24px;"><a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;">Ou ative o trial de 7 dias agora →</a></p>`

    const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Ativar trial gratuito →', ps: '💬 <strong>P.S.:</strong> Se a resposta for "ainda participo, mas não tenho tempo para configurar", podemos fazer isso juntos em 10 minutos por videochamada — sem custo. Só responder este e-mail.', pixelTag, url, unsub: UNSUB })
    const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\nEnviei alguns e-mails sobre monitoramento de licitações nos últimos meses. Você nunca respondeu.\n\nUma pergunta direta: sua empresa ainda participa de licitações públicas?\n\nResponda com uma linha — vou entender qualquer resposta.\n\nOu ative o trial de 7 dias agora (sem cartão):\n${ctaDest}\n\n---\nP.S.: Se a resposta for "ainda participo, mas não tenho tempo para configurar", podemos fazer isso juntos em 10 minutos por videochamada — sem custo. Só responder este e-mail.\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
    return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
  }

  // ── E8 (D+152) — SUNSET ─────────────────────────────────────────────────────
  const subject  = `${nome}, último e-mail — e uma oferta final`
  const conteudo = `
    <p>Este é o último e-mail que vou enviar.</p>
    <p>Ao longo de vários meses, compartilhei dados sobre o mercado público no seu setor, casos de empresas similares à sua e como o monitoramento muda o volume de contratos que uma empresa consegue participar.</p>
    <p>Não vou mais enviar e-mails automaticamente — mas a porta continua aberta. Se em algum momento a situação mudar e o mercado público se tornar uma prioridade, o Monitor de Licitações vai estar aqui.</p>
    <p>O trial de 7 dias ainda está disponível — gratuito, sem cartão, sem compromisso. <a href="${ctaHref}" style="color:#6B0F1A;font-weight:700;">Ativar agora →</a></p>
    <p>E se quiser conversar diretamente, é só responder este e-mail.</p>
    <p>Obrigado pela atenção ao longo desse tempo.</p>`

  const html = wrapEmail({ subject, nome, cidade, conteudo, ctaHref, ctaTexto: 'Ativar trial gratuito de 7 dias →', ps: '🚪 <strong>P.S.:</strong> Mesmo depois deste e-mail, você pode acessar o trial quando quiser. O link acima vai continuar funcionando. Quando a hora for certa, a oportunidade vai estar aqui.', pixelTag, url, unsub: UNSUB })
  const text = `Olá, ${nome}${cidade ? ` — ${cidade}` : ''} —\n\nEste é o último e-mail que vou enviar.\n\nAo longo de vários meses, compartilhei dados sobre o mercado público no seu setor. Não vou mais enviar e-mails automáticos — mas a porta continua aberta.\n\nTrial de 7 dias gratuito, sem cartão:\n${ctaDest}\n\nObrigado pela atenção.\n\n--\nMonitor de Licitações · Matutta Soluções Digitais\nDescadastrar: ${url}/descadastrar?token=${UNSUB}`
  return { subject, html: html.replace(/\{\{UNSUB_TOKEN\}\}/g, UNSUB), text }
}
