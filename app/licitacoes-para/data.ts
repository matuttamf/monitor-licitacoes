export type SegmentoData = {
  slug: string
  titulo: string
  subtitulo: string
  descricaoMeta: string
  keywords: string[]
  cnaes: string[]
  intro: string
  volumen: string
  tiposContrato: { titulo: string; descricao: string }[]
  vantagens: { titulo: string; descricao: string }[]
  faqs: { pergunta: string; resposta: string }[]
  statsDestaque: { valor: string; label: string }[]
}

export const SEGMENTOS: SegmentoData[] = [
  {
    slug: 'construcao-civil',
    titulo: 'Licitações para Construção Civil e Obras Públicas',
    subtitulo: 'O setor com o maior volume de contratos públicos no Brasil',
    descricaoMeta:
      'Monitore licitações de construção civil, obras públicas, reforma e infraestrutura em tempo real. Editais do PNCP, estados e municípios para empreiteiras e construtoras.',
    keywords: [
      'licitações construção civil', 'licitações obras públicas', 'editais construção',
      'licitações empreiteiras', 'licitações reforma e construção', 'pregão obras públicas',
      'licitações infraestrutura', 'CNAE 4110 licitações', 'licitações engenharia',
    ],
    cnaes: ['41.10', '41.20', '42.11', '42.12', '42.13', '42.21', '42.22', '42.29', '43.11', '43.12', '43.21', '43.22', '43.29', '43.30', '43.91', '43.99'],
    intro:
      'A construção civil é responsável por mais de R$300 bilhões em contratos públicos por ano no Brasil. Desde obras de infraestrutura rodoviária até reformas em escolas e hospitais, o setor público é o maior contratante do segmento. Empresas que monitoram sistematicamente os editais têm vantagem competitiva decisiva: chegam primeiro, preparam melhor as propostas e ganham mais contratos.',
    volumen: 'R$300 bilhões/ano em contratos públicos de construção',
    tiposContrato: [
      { titulo: 'Obras de infraestrutura', descricao: 'Rodovias, pontes, viadutos, drenagem, saneamento básico e redes de água.' },
      { titulo: 'Construção de edificações', descricao: 'Escolas, postos de saúde, UPAs, creches, delegacias e prédios públicos.' },
      { titulo: 'Reforma e manutenção', descricao: 'Recuperação de fachadas, reformas internas, manutenção predial de imóveis públicos.' },
      { titulo: 'Instalações e acabamentos', descricao: 'Instalações elétricas, hidráulicas, climatização e acabamento em obras públicas.' },
    ],
    vantagens: [
      { titulo: 'Volume alto de editais', descricao: 'São publicados centenas de editais de construção por semana em todo o Brasil.' },
      { titulo: 'Tickets altos', descricao: 'Contratos de obras costumam ter valores elevados, tornando cada proposta vencedora altamente lucrativa.' },
      { titulo: 'Recorrência garantida', descricao: 'Órgãos públicos renovam contratos de manutenção e abrem novas obras regularmente.' },
    ],
    statsDestaque: [
      { valor: '+12 mil', label: 'editais de obras/mês' },
      { valor: 'R$300 bi', label: 'volume anual de contratos' },
      { valor: '5.570', label: 'municípios contratantes' },
    ],
    faqs: [
      {
        pergunta: 'Quais documentos são necessários para participar de licitações de obras?',
        resposta: 'Em geral: registro no CREA ou CAU (conforme o tipo de obra), certidões negativas de débitos (CND federal, estadual e municipal), balanço patrimonial, atestados de capacidade técnica, seguro de responsabilidade civil e garantia de proposta. Cada edital especifica os documentos exatos.',
      },
      {
        pergunta: 'Empresa pequena pode ganhar licitação de obras?',
        resposta: 'Sim. A Lei 123/2006 garante tratamento favorecido a MEI, ME e EPP em licitações de até R$80 mil. Além disso, muitas obras são fragmentadas em lotes menores, abrindo espaço para empresas de menor porte.',
      },
      {
        pergunta: 'Como funciona o regime de execução em contratos de obras?',
        resposta: 'Os principais regimes são empreitada por preço global, empreitada por preço unitário, tarefa e empreitada integral. Cada um tem implicações diferentes para o balanço de riscos entre contratante e contratado.',
      },
      {
        pergunta: 'É possível subcontratar parte da obra?',
        resposta: 'Em geral sim, desde que o edital permita. O contratado principal permanece responsável pela execução integral. A subcontratação costuma ser limitada a um percentual do valor total do contrato.',
      },
      {
        pergunta: 'Como monitorar editais de obras de vários estados ao mesmo tempo?',
        resposta: 'O Monitor de Licitações agrega editais do PNCP, portais estaduais e municipais em uma única plataforma. Cadastre palavras-chave como "obra civil", "reforma predial" ou "pavimentação" e receba alertas por e-mail quando novos editais forem publicados.',
      },
    ],
  },
  {
    slug: 'tecnologia-ti',
    titulo: 'Licitações para Empresas de Tecnologia e TI',
    subtitulo: 'Software, hardware, suporte e serviços de TI para o governo',
    descricaoMeta:
      'Monitore licitações de tecnologia da informação, software, hardware, suporte técnico e infraestrutura de TI. Editais do PNCP para empresas de TI em todo o Brasil.',
    keywords: [
      'licitações tecnologia da informação', 'licitações TI', 'licitações software', 'licitações hardware',
      'licitações suporte técnico', 'editais TI', 'licitações desenvolvimento de sistemas',
      'CNAE 6201 licitações', 'licitações computadores', 'pregão eletrônico TI',
    ],
    cnaes: ['62.01', '62.02', '62.03', '62.09', '63.11', '63.19', '26.21', '26.22'],
    intro:
      'O setor público brasileiro investe mais de R$20 bilhões por ano em tecnologia da informação. Desde a aquisição de computadores e servidores até o desenvolvimento de sistemas customizados, a demanda por empresas de TI é crescente e contínua. Com o avanço da transformação digital do governo, o volume de editais na área só tende a crescer.',
    volumen: 'R$20 bilhões/ano em contratos de TI',
    tiposContrato: [
      { titulo: 'Desenvolvimento de software', descricao: 'Sistemas de gestão, portais, aplicativos mobile e soluções customizadas para órgãos públicos.' },
      { titulo: 'Infraestrutura e hardware', descricao: 'Servidores, computadores, notebooks, roteadores, switches e equipamentos de rede.' },
      { titulo: 'Suporte técnico e manutenção', descricao: 'Help desk, manutenção preventiva e corretiva de equipamentos e sistemas.' },
      { titulo: 'Licenças e SaaS', descricao: 'Licenças de softwares como Office, antivírus, ERP e plataformas em nuvem.' },
      { titulo: 'Segurança da informação', descricao: 'Firewalls, pentest, consultorias de segurança e conformidade com LGPD.' },
    ],
    vantagens: [
      { titulo: 'Alta recorrência', descricao: 'Contratos de suporte e manutenção geralmente têm duração de 12 a 60 meses, garantindo receita previsível.' },
      { titulo: 'Tickets crescentes', descricao: 'A transformação digital pública amplia o tamanho médio dos contratos de TI ano a ano.' },
      { titulo: 'Menos concorrência física', descricao: 'Empresas de TI podem atender órgãos em qualquer estado, ampliando o mercado potencial.' },
    ],
    statsDestaque: [
      { valor: '+3 mil', label: 'editais de TI/mês' },
      { valor: 'R$20 bi', label: 'volume anual de contratos' },
      { valor: '60 meses', label: 'duração máxima de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Startup pode participar de licitações de TI?',
        resposta: 'Sim. Com o Marco Legal das Startups (Lei 182/2021), startups podem participar de processos simplificados de contratação pública. Além disso, editais de desenvolvimento de software frequentemente permitem que empresas de qualquer porte participem.',
      },
      {
        pergunta: 'É necessário ter CNPJ antigo para ganhar licitações de TI?',
        resposta: 'Não há regra geral de tempo mínimo de CNPJ. Cada edital define os requisitos de qualificação. Em muitos casos, atestados de capacidade técnica e equipe qualificada têm mais peso do que o tempo de existência da empresa.',
      },
      {
        pergunta: 'Como funciona a licitação para serviços de cloud (IaaS, PaaS, SaaS)?',
        resposta: 'O governo tem contratado serviços em nuvem via pregão eletrônico, catálogo de soluções e acordos-quadro. O processo costuma avaliar SLA, segurança dos dados, conformidade com normas brasileiras e custo total de propriedade.',
      },
      {
        pergunta: 'Empresa de TI precisa de atestado de capacidade técnica?',
        resposta: 'Em geral sim para contratos de maior valor. O atestado deve ser fornecido por cliente anterior (público ou privado) e comprovado que a empresa executou serviços similares ao objeto da licitação.',
      },
      {
        pergunta: 'Como receber alertas de licitações de TI do meu estado?',
        resposta: 'O Monitor de Licitações permite filtrar editais por segmento, estado e valor. Cadastre palavras como "desenvolvimento de sistema", "suporte técnico", "equipamentos de informática" e receba alertas automáticos por e-mail.',
      },
    ],
  },
  {
    slug: 'saude-hospitalar',
    titulo: 'Licitações para Saúde e Material Hospitalar',
    subtitulo: 'Medicamentos, equipamentos médicos e serviços de saúde para o SUS',
    descricaoMeta:
      'Monitore licitações de saúde pública, materiais hospitalares, equipamentos médicos, medicamentos e serviços para o SUS. Editais do Ministério da Saúde, estados e municípios.',
    keywords: [
      'licitações saúde', 'licitações material hospitalar', 'licitações medicamentos',
      'licitações equipamentos médicos', 'licitações SUS', 'editais saúde pública',
      'licitações hospital', 'licitações UPA', 'licitações ANVISA', 'pregão medicamentos',
    ],
    cnaes: ['46.44', '47.72', '32.50', '33.50', '86.10', '86.20', '86.90'],
    intro:
      'O setor de saúde é um dos mais ativos em licitações públicas do Brasil. O SUS compra mais de R$60 bilhões em produtos e serviços por ano — desde medicamentos e insumos hospitalares até equipamentos de diagnóstico e serviços de saúde. Para fornecedores do setor, monitorar editais é essencial para manter a carteira de contratos governamentais.',
    volumen: 'R$60 bilhões/ano em contratações na saúde',
    tiposContrato: [
      { titulo: 'Medicamentos e insumos', descricao: 'Fármacos, vacinas, insumos farmacêuticos e soluções parenterais para hospitais e UBSs.' },
      { titulo: 'Equipamentos médicos', descricao: 'Aparelhos de diagnóstico por imagem, ventiladores, monitores cardíacos, bisturis eletrônicos.' },
      { titulo: 'Material hospitalar', descricao: 'Seringas, luvas, curativos, EPI, materiais cirúrgicos descartáveis e não descartáveis.' },
      { titulo: 'Serviços de saúde', descricao: 'Exames laboratoriais terceirizados, serviços de imagenologia, hemodiálise e esterilização.' },
      { titulo: 'Mobiliário hospitalar', descricao: 'Leitos, macas, cadeiras de rodas, mobiliário clínico e equipamentos de hotelaria hospitalar.' },
    ],
    vantagens: [
      { titulo: 'Demanda inelástica', descricao: 'O SUS compra regularmente independente de ciclos econômicos — saúde é prioridade constitucional.' },
      { titulo: 'Alta frequência de editais', descricao: 'Medicamentos e insumos são licitados com frequência mensal ou trimestral na maioria dos municípios.' },
      { titulo: 'Atas de registro de preço', descricao: 'Uma única licitação pode gerar fornecimentos para centenas de órgãos simultaneamente via SRP.' },
    ],
    statsDestaque: [
      { valor: '+5 mil', label: 'editais de saúde/mês' },
      { valor: 'R$60 bi', label: 'volume anual na saúde' },
      { valor: '5.570', label: 'municípios com SAMU/UBS' },
    ],
    faqs: [
      {
        pergunta: 'É necessário registro na ANVISA para participar de licitações de saúde?',
        resposta: 'Para produtos sujeitos à vigilância sanitária (medicamentos, equipamentos médicos, cosméticos), o registro ou notificação na ANVISA é obrigatório. A documentação técnica exigida varia conforme o produto.',
      },
      {
        pergunta: 'O que é Ata de Registro de Preços (SRP) em licitações de saúde?',
        resposta: 'É um instrumento que permite ao órgão licitante (e a outros órgãos participantes) contratar o fornecedor pelo preço registrado na ata sem necessidade de nova licitação, pelo prazo de até 12 meses.',
      },
      {
        pergunta: 'Distribuidora pode participar de licitações de medicamentos?',
        resposta: 'Sim. Distribuidoras autorizadas pela ANVISA podem participar desde que apresentem autorização de funcionamento, documentação de qualidade e, em alguns casos, anuência do fabricante.',
      },
      {
        pergunta: 'Como funciona a compra centralizada de medicamentos pelo Ministério da Saúde?',
        resposta: 'O Ministério da Saúde realiza licitações centralizadas (Farmácia Popular, Componente Especializado) que abastecem toda a rede SUS. Estados e municípios também fazem compras independentes via consórcios ou individualmente.',
      },
      {
        pergunta: 'Como monitorar licitações de saúde de vários municípios ao mesmo tempo?',
        resposta: 'O Monitor de Licitações consolida editais do PNCP e de portais estaduais em uma única tela. Cadastre palavras como "material hospitalar", "medicamento", "equipamento médico" e filtre por estado ou município.',
      },
    ],
  },
  {
    slug: 'alimentacao-refeicoes',
    titulo: 'Licitações para Alimentação e Refeições Coletivas',
    subtitulo: 'Refeições, merenda escolar e fornecimento de gêneros alimentícios',
    descricaoMeta:
      'Monitore licitações de alimentação escolar, refeições coletivas, fornecimento de gêneros alimentícios e serviços de buffet para o setor público. Editais do FNDE e prefeituras.',
    keywords: [
      'licitações alimentação', 'licitações merenda escolar', 'licitações PNAE',
      'licitações gêneros alimentícios', 'licitações refeições coletivas',
      'editais alimentação prefeitura', 'licitações cantina escolar', 'pregão alimentação',
    ],
    cnaes: ['10.11', '10.13', '10.20', '10.91', '56.11', '56.20', '46.39', '47.12'],
    intro:
      'O Programa Nacional de Alimentação Escolar (PNAE) distribui mais de R$4 bilhões por ano para alimentação de 40 milhões de alunos da rede pública. Além disso, o governo contrata refeições coletivas para hospitais, presídios, quartéis e repartições públicas. O setor de alimentação é um dos mais ativos em licitações no Brasil.',
    volumen: 'R$10 bilhões/ano em contratos de alimentação',
    tiposContrato: [
      { titulo: 'Merenda escolar (PNAE)', descricao: 'Fornecimento de gêneros alimentícios para a rede municipal e estadual de ensino.' },
      { titulo: 'Refeições coletivas', descricao: 'Preparo e distribuição de refeições para hospitais, presídios, quartéis e repartições.' },
      { titulo: 'Gêneros alimentícios', descricao: 'Compra direta de alimentos industrializados, laticínios, grãos e hortifruti.' },
      { titulo: 'Serviços de buffet', descricao: 'Eventos institucionais, seminários, posses e solenidades do governo.' },
    ],
    vantagens: [
      { titulo: 'Demanda garantida', descricao: 'A merenda escolar é obrigatória por lei — toda escola pública precisa desse fornecimento.' },
      { titulo: 'Pequenos fornecedores bem-vindos', descricao: 'O PNAE reserva 30% das compras obrigatoriamente para agricultores familiares.' },
      { titulo: 'Contratos longos', descricao: 'Contratos de refeições coletivas geralmente têm duração de 12 a 24 meses.' },
    ],
    statsDestaque: [
      { valor: 'R$4 bi', label: 'PNAE por ano' },
      { valor: '40 mi', label: 'alunos atendidos pelo PNAE' },
      { valor: '30%', label: 'reservado para agricultores familiares' },
    ],
    faqs: [
      {
        pergunta: 'Produtor rural pode participar de licitações de alimentação?',
        resposta: 'Sim. O PNAE obriga as prefeituras a destinarem no mínimo 30% do repasse federal para compra direta de agricultores familiares, dispensando licitação para esses casos (via chamada pública).',
      },
      {
        pergunta: 'Que documentos são necessários para licitação de merenda escolar?',
        resposta: 'Documentação sanitária (Alvará de Funcionamento, SIF ou SIE, registro no MAPA), certidões negativas de débito, comprovante de capacidade técnica e laudos de análise dos produtos, quando exigidos.',
      },
      {
        pergunta: 'É possível participar de licitações de refeições coletivas em outros estados?',
        resposta: 'Sim, desde que a empresa possua estrutura de produção ou cozinha no local ou prova logística viável. Alguns contratos exigem cozinha industrial no próprio município.',
      },
      {
        pergunta: 'O que é pregão para fornecimento de gêneros alimentícios?',
        resposta: 'É a modalidade licitatória mais usada para compra de alimentos industrializados. O pregão eletrônico permite participação de todo o Brasil, enquanto o presencial é mais comum em municípios menores.',
      },
      {
        pergunta: 'Como saber quando prefeituras estão abrindo licitações de merenda?',
        resposta: 'O Monitor de Licitações agrega editais do PNCP, FNDE e portais das prefeituras. Cadastre palavras como "gêneros alimentícios", "merenda escolar" ou "refeições" e receba alertas no e-mail.',
      },
    ],
  },
  {
    slug: 'limpeza-conservacao',
    titulo: 'Licitações de Limpeza e Conservação',
    subtitulo: 'Terceirização de limpeza para prédios públicos, escolas e hospitais',
    descricaoMeta:
      'Monitore licitações de serviços de limpeza e conservação predial, jardinagem, coleta de resíduos e higienização para órgãos públicos. Editais em todo o Brasil.',
    keywords: [
      'licitações limpeza', 'licitações serviços de limpeza', 'licitações conservação predial',
      'licitações terceirização limpeza', 'editais limpeza prefeitura',
      'licitações jardinagem', 'licitações coleta de lixo', 'CNAE 8121 licitações',
    ],
    cnaes: ['81.21', '81.22', '81.29', '81.30'],
    intro:
      'Serviços de limpeza e conservação estão entre os contratos mais recorrentes do setor público. Todo prédio público, escola, hospital e repartição precisa de limpeza continuada. Com mais de 300 mil órgãos públicos no Brasil, a demanda por essas empresas é constante e geograficamente distribuída.',
    volumen: 'R$8 bilhões/ano em contratos de limpeza',
    tiposContrato: [
      { titulo: 'Limpeza predial', descricao: 'Serviços de limpeza e conservação em escolas, repartições, hospitais e demais edificações públicas.' },
      { titulo: 'Coleta de resíduos', descricao: 'Coleta e transporte de lixo domiciliar, hospitalar e entulho para municípios.' },
      { titulo: 'Jardinagem e paisagismo', descricao: 'Manutenção de praças, jardins de prédios públicos e áreas verdes urbanas.' },
      { titulo: 'Higienização especializada', descricao: 'Higienização de ambientes hospitalares, desinsetização, desratização e controle de pragas.' },
    ],
    vantagens: [
      { titulo: 'Alta recorrência', descricao: 'Contratos de limpeza são renovados anualmente — cada contrato vencido gera uma nova oportunidade.' },
      { titulo: 'Distribuição nacional', descricao: 'Há editais em todos os estados e municípios, sem concentração regional.' },
      { titulo: 'Barreira de entrada baixa', descricao: 'Empresas de pequeno porte com boa estrutura podem competir com as grandes terceirizadoras.' },
    ],
    statsDestaque: [
      { valor: '+8 mil', label: 'editais de limpeza/mês' },
      { valor: 'R$8 bi', label: 'volume anual de contratos' },
      { valor: '12-60', label: 'meses de duração típica' },
    ],
    faqs: [
      {
        pergunta: 'Qual a documentação básica para licitar serviços de limpeza?',
        resposta: 'Habilitação jurídica (CNPJ, contrato social), regularidade fiscal e trabalhista (FGTS, CND, INSS), qualificação técnica (atestados de capacidade) e qualificação econômico-financeira (balanço patrimonial).',
      },
      {
        pergunta: 'Como funciona a estimativa de postos de trabalho nas licitações de limpeza?',
        resposta: 'O edital geralmente define a área a ser limpa (m²), a frequência de limpeza e o tipo de ambiente. A empresa calcula o número de serventes necessários e apresenta a proposta baseada em custo por posto de trabalho.',
      },
      {
        pergunta: 'Existe limite de valor para participação de MEI em licitações de limpeza?',
        resposta: 'MEI pode participar de licitações de até R$81.000. Para contratos maiores, é necessário ME ou EPP com CNPJ regular. A Lei 123/2006 prevê tratamento diferenciado para empresas de pequeno porte.',
      },
      {
        pergunta: 'O que são licitações de coleta seletiva?',
        resposta: 'São contratos para coleta diferenciada de recicláveis (papel, plástico, vidro, metal). Municípios têm obrigação de implementar coleta seletiva e frequentemente terceirizam esse serviço via licitação.',
      },
      {
        pergunta: 'Como encontrar licitações de limpeza perto da minha cidade?',
        resposta: 'O Monitor de Licitações permite filtrar editais por estado e município. Cadastre palavras como "serviços de limpeza", "conservação predial" ou "coleta de resíduos" e configure alertas regionais.',
      },
    ],
  },
  {
    slug: 'seguranca-vigilancia',
    titulo: 'Licitações de Segurança e Vigilância',
    subtitulo: 'Vigilância patrimonial, segurança eletrônica e portaria para órgãos públicos',
    descricaoMeta:
      'Monitore licitações de serviços de segurança e vigilância patrimonial, portaria, CFTV e controle de acesso para o setor público. Editais em prefeituras, estados e governo federal.',
    keywords: [
      'licitações segurança', 'licitações vigilância', 'licitações vigilância patrimonial',
      'licitações portaria', 'licitações CFTV', 'editais segurança privada',
      'CNAE 8011 licitações', 'pregão vigilância', 'licitações controle de acesso',
    ],
    cnaes: ['80.11', '80.12', '80.20'],
    intro:
      'Todos os prédios públicos, escolas, hospitais, repartições e parques precisam de vigilância e segurança. O setor público é o maior contratante de serviços de vigilância privada do Brasil, gerando bilhões em contratos anuais. Empresas autorizadas pela Polícia Federal encontram uma demanda constante e geograficamente distribuída.',
    volumen: 'R$12 bilhões/ano em contratos de segurança',
    tiposContrato: [
      { titulo: 'Vigilância patrimonial', descricao: 'Guarda armada ou desarmada de prédios, repartições, escolas e hospitais públicos.' },
      { titulo: 'Monitoramento eletrônico', descricao: 'CFTV, controle de acesso, alarmes e sistemas integrados de segurança.' },
      { titulo: 'Portaria e recepção', descricao: 'Controle de entrada e saída de pessoas e veículos em instalações governamentais.' },
      { titulo: 'Escolta e transporte de valores', descricao: 'Escolta de cargas, transporte de documentos sigilosos e segurança de autoridades.' },
    ],
    vantagens: [
      { titulo: 'Alta recorrência', descricao: 'Contratos de vigilância têm duração de 12 a 60 meses e são renovados com frequência.' },
      { titulo: 'Demanda crescente', descricao: 'A digitalização aumenta a demanda por segurança eletrônica além da vigilância física.' },
      { titulo: 'Receita previsível', descricao: 'Contratos contínuos com postos mensais geram receita estável e planejável.' },
    ],
    statsDestaque: [
      { valor: '+3 mil', label: 'editais de vigilância/mês' },
      { valor: 'R$12 bi', label: 'volume anual de contratos' },
      { valor: '60 meses', label: 'duração máxima de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Que autorização é necessária para participar de licitações de vigilância?',
        resposta: 'Empresas de vigilância precisam de autorização da Polícia Federal (Lei 7.102/1983), certificado de segurança, alvarás estaduais e registro no órgão de Trabalho. Cada edital pode exigir documentação adicional.',
      },
      {
        pergunta: 'Vigilância desarmada participa das mesmas licitações que a armada?',
        resposta: 'Não necessariamente. Os editais especificam o tipo de vigilância exigida. Vigilância desarmada tem requisitos de habilitação diferentes e geralmente menor custo de posto.',
      },
      {
        pergunta: 'Como funciona o cálculo de preço em licitações de vigilância?',
        resposta: 'O preço é calculado por posto (12h ou 24h), considerando salário da categoria, encargos sociais, uniforme, equipamentos, lucro e despesas administrativas. O Ministério da Justiça publica planilhas de referência.',
      },
      {
        pergunta: 'É possível participar de licitação de monitoramento eletrônico sem ter vigilância armada?',
        resposta: 'Sim. Empresas de CFTV e segurança eletrônica têm CNAEs e habilitações distintas. Não é necessário ter vigilância armada para licitar serviços de câmeras e controle de acesso.',
      },
      {
        pergunta: 'Como monitorar licitações de segurança em todo o estado?',
        resposta: 'O Monitor de Licitações centraliza editais de vigilância do PNCP e portais estaduais. Configure alertas com palavras como "vigilância patrimonial", "monitoramento eletrônico" ou "portaria" para receber novidades por e-mail.',
      },
    ],
  },
  {
    slug: 'material-escritorio',
    titulo: 'Licitações de Material de Escritório e Papelaria',
    subtitulo: 'Suprimentos e material de expediente para o setor público',
    descricaoMeta:
      'Monitore licitações de material de escritório, papelaria, cartuchos de impressora, papel e suprimentos de expediente para prefeituras, estados e governo federal.',
    keywords: [
      'licitações material de escritório', 'licitações papelaria', 'licitações material de expediente',
      'licitações cartuchos', 'licitações papel', 'editais material escritório prefeitura',
      'pregão material de consumo', 'licitações suprimentos',
    ],
    cnaes: ['46.49', '47.41', '17.10', '26.80'],
    intro:
      'Papelaria, material de escritório e suprimentos de impressão são comprados por todos os órgãos públicos do Brasil. O volume de editais nessa categoria é altíssimo — e a concorrência, embora grande, deixa espaço para distribuidores e revendedores bem posicionados regionalmente.',
    volumen: 'R$3 bilhões/ano em material de escritório',
    tiposContrato: [
      { titulo: 'Material de expediente', descricao: 'Papel A4, canetas, pastas, grampeadores, clips e demais suprimentos de escritório.' },
      { titulo: 'Cartuchos e toner', descricao: 'Cartuchos de impressora, toner laser, fitas de impressora e suprimentos de TI.' },
      { titulo: 'Material gráfico', descricao: 'Impressão de formulários, cadernetas, capas, envelopes e material institucional.' },
      { titulo: 'Mobiliário de escritório', descricao: 'Mesas, cadeiras, arquivos, estantes e divisórias para escritórios públicos.' },
    ],
    vantagens: [
      { titulo: 'Volume alto de editais', descricao: 'São publicados milhares de pregões de material de escritório por mês em todo o Brasil.' },
      { titulo: 'Entrada acessível', descricao: 'Empresas de menor porte conseguem atender pedidos locais com boa margem de competitividade.' },
      { titulo: 'Tickets previsíveis', descricao: 'Preços de referência bem estabelecidos facilitam a precificação e o controle de margem.' },
    ],
    statsDestaque: [
      { valor: '+10 mil', label: 'editais de suprimentos/mês' },
      { valor: 'R$3 bi', label: 'volume anual de contratos' },
      { valor: '1-3', label: 'dias para entrega exigidos' },
    ],
    faqs: [
      {
        pergunta: 'Preciso ser fabricante ou posso ser distribuidor?',
        resposta: 'Distribuidores podem participar livremente. A maioria dos editais não exige que o fornecedor seja fabricante — exige que o produto atenda às especificações técnicas do edital.',
      },
      {
        pergunta: 'O que é pregão de ata de registro de preços para material de escritório?',
        resposta: 'É uma licitação que gera uma ata válida por 12 meses. O órgão licitante (e outros que aderirem) podem solicitar quantidades durante esse período sem abrir nova licitação, garantindo fornecimento contínuo.',
      },
      {
        pergunta: 'Cartucho genérico pode ser vendido em licitações?',
        resposta: 'Depende do edital. Alguns órgãos exigem cartuchos originais; outros aceitam compatíveis desde que atendam especificações de qualidade e não violem garantia dos equipamentos. Leia sempre as especificações técnicas.',
      },
      {
        pergunta: 'Como funciona a entrega em licitações de material de escritório?',
        resposta: 'Os editais geralmente exigem entrega parcelada conforme solicitação (empenho), com prazo de 2 a 10 dias úteis. O almoxarifado do órgão faz o recebimento e atesta a nota fiscal.',
      },
      {
        pergunta: 'Como encontrar licitações de material de escritório perto de mim?',
        resposta: 'Configure no Monitor de Licitações palavras como "material de expediente", "material de escritório" ou "suprimentos de informática" com filtro pelo seu estado ou município para receber alertas relevantes.',
      },
    ],
  },
  {
    slug: 'transporte-logistica',
    titulo: 'Licitações de Transporte e Logística',
    subtitulo: 'Frota, transporte escolar, manutenção veicular e frete para o governo',
    descricaoMeta:
      'Monitore licitações de transporte escolar, locação de veículos, manutenção de frota, serviços de frete e logística para o setor público. Editais em todo o Brasil.',
    keywords: [
      'licitações transporte', 'licitações transporte escolar', 'licitações locação de veículos',
      'licitações frota', 'licitações frete', 'editais transporte prefeitura',
      'licitações manutenção veicular', 'CNAE 4921 licitações',
    ],
    cnaes: ['49.21', '49.22', '49.30', '77.11', '77.31', '52.20'],
    intro:
      'O setor público brasileiro opera uma das maiores frotas de veículos do país e contrata serviços de transporte em todos os níveis federativos. Do transporte escolar rural às passagens aéreas para servidores, passando por fretes e locação de veículos, as oportunidades para o setor de logística e transporte são amplas e constantes.',
    volumen: 'R$15 bilhões/ano em contratos de transporte',
    tiposContrato: [
      { titulo: 'Transporte escolar', descricao: 'Locação de ônibus, vans e micro-ônibus para transporte de alunos da rede pública.' },
      { titulo: 'Locação de veículos', descricao: 'Locação de carros, caminhonetes, ambulâncias e veículos especiais para uso oficial.' },
      { titulo: 'Manutenção de frota', descricao: 'Revisões, reparos mecânicos, borracharia e guincho para a frota pública.' },
      { titulo: 'Frete e logística', descricao: 'Transporte de materiais, mudanças de equipamentos e distribuição de insumos.' },
      { titulo: 'Passagens e diárias', descricao: 'Emissão de bilhetes aéreos e rodoviários para servidores em viagem a serviço.' },
    ],
    vantagens: [
      { titulo: 'Alta demanda rural', descricao: 'O transporte escolar rural é obrigatório por lei e gera contratos em todos os municípios.' },
      { titulo: 'Contratos longos', descricao: 'Locação de veículos tem duração de até 60 meses, garantindo receita previsível.' },
      { titulo: 'Diversidade de portes', descricao: 'Há contratos para MEI (táxi oficial), pequenas transportadoras até grandes operadores logísticos.' },
    ],
    statsDestaque: [
      { valor: '+4 mil', label: 'editais de transporte/mês' },
      { valor: 'R$15 bi', label: 'volume anual de contratos' },
      { valor: '5.570', label: 'municípios com transporte escolar' },
    ],
    faqs: [
      {
        pergunta: 'Transportador individual pode participar de licitações de transporte escolar?',
        resposta: 'Sim, desde que possua CNPJ ativo, habilitação específica (EAR), vistoria do DENATRAN e documentação do veículo em dia. Muitos municípios pequenos preferem contratar transportadores individuais locais.',
      },
      {
        pergunta: 'O que é locação de veículos com ou sem motorista?',
        resposta: 'Com motorista (locação com dedicação exclusiva) inclui o profissional de condução. Sem motorista (arrendamento) o órgão usa seus próprios servidores. Cada modalidade tem especificações de habilitação diferentes.',
      },
      {
        pergunta: 'Como funciona a manutenção de frota terceirizada?',
        resposta: 'O órgão contrata uma oficina ou rede para realizar manutenções preventivas e corretivas. O contrato geralmente define tabela de preços de peças e mão de obra, com limite de aprovação automática por solicitação.',
      },
      {
        pergunta: 'Agência de viagens pode participar de licitações de passagens?',
        resposta: 'Sim. A licitação de emissão de passagens seleciona agências que emitirão bilhetes com desconto em relação ao preço de tabela. A IATA exige que a agência seja acreditada para emissão de bilhetes aéreos.',
      },
      {
        pergunta: 'Como receber alertas de licitações de transporte escolar na minha região?',
        resposta: 'No Monitor de Licitações, cadastre palavras como "transporte escolar", "locação de veículos" ou "manutenção de frota" e configure o filtro por estado ou município para receber notificações em tempo real.',
      },
    ],
  },
  {
    slug: 'consultoria-engenharia',
    titulo: 'Licitações de Consultoria e Engenharia',
    subtitulo: 'Projetos, laudos técnicos, fiscalização e consultoria para o poder público',
    descricaoMeta:
      'Monitore licitações de consultoria técnica, projetos de engenharia, laudos, topografia, geotecnia e fiscalização de obras para órgãos públicos. Editais em todo o Brasil.',
    keywords: [
      'licitações consultoria', 'licitações engenharia', 'licitações projeto executivo',
      'licitações laudos técnicos', 'licitações topografia', 'licitações geotecnia',
      'editais consultoria prefeitura', 'CNAE 7112 licitações', 'licitações fiscalização obras',
    ],
    cnaes: ['71.11', '71.12', '71.19', '71.20', '74.90'],
    intro:
      'Projetos de engenharia, laudos técnicos, estudos ambientais e consultorias especializadas são demandas constantes do setor público. Antes de qualquer grande obra, o poder público precisa de projetos executivos, sondagens, topografia e estudos de viabilidade. Escritórios de engenharia e consultoras técnicas têm ampla margem para atuar nesse mercado.',
    volumen: 'R$5 bilhões/ano em serviços de engenharia e consultoria',
    tiposContrato: [
      { titulo: 'Projetos executivos', descricao: 'Projetos arquitetônicos, estruturais, elétricos e hidráulicos para obras públicas.' },
      { titulo: 'Laudos e perícias', descricao: 'Laudos de avaliação, laudos estruturais, perícias técnicas e avaliação de imóveis.' },
      { titulo: 'Levantamentos topográficos', descricao: 'Topografia, georeferenciamento, batimetria e levantamentos planialtimétricos.' },
      { titulo: 'Estudos ambientais', descricao: 'EIA/RIMA, PBA, estudos de impacto e licenciamento ambiental para obras públicas.' },
      { titulo: 'Fiscalização e supervisão', descricao: 'Fiscalização de obras em andamento, supervisão técnica e gestão de contratos.' },
    ],
    vantagens: [
      { titulo: 'Tickets altos', descricao: 'Contratos de consultoria de engenharia costumam ter valores significativos e boa margem.' },
      { titulo: 'Menor concorrência', descricao: 'Especialização reduz o número de concorrentes qualificados, aumentando chances de vitória.' },
      { titulo: 'Demanda pré-obra', descricao: 'Todo grande investimento público começa com projetos e estudos — a demanda é estrutural.' },
    ],
    statsDestaque: [
      { valor: '+1 mil', label: 'editais de consultoria/mês' },
      { valor: 'R$5 bi', label: 'volume anual de contratos' },
      { valor: '24 meses', label: 'duração típica de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Escritório de arquitetura pode participar de licitações de projetos?',
        resposta: 'Sim. Escritórios registrados no CAU (Conselho de Arquitetura e Urbanismo) podem participar de licitações de projetos arquitetônicos, de interiores e urbanísticos para o setor público.',
      },
      {
        pergunta: 'Como funciona a licitação de serviços de engenharia consultiva?',
        resposta: 'Geralmente usa a modalidade Concorrência ou RDC, com análise técnica e de preço. Às vezes usa a técnica e preço, onde a proposta técnica (metodologia, qualificação da equipe) tem peso tão importante quanto o preço.',
      },
      {
        pergunta: 'É possível participar de licitação de consultoria sem CNPJ?',
        resposta: 'Profissional liberal (engenheiro ou arquiteto autônomo) pode participar de certas licitações como pessoa física, desde que o edital permita. Para contratos maiores, é recomendável constituir pessoa jurídica.',
      },
      {
        pergunta: 'O que é RRT e ART em licitações de engenharia?',
        resposta: 'ART (Anotação de Responsabilidade Técnica) é o documento de registro do CREA que formaliza a responsabilidade técnica do engenheiro. RRT é o equivalente do CAU para arquitetos. Ambos são frequentemente exigidos em editais.',
      },
      {
        pergunta: 'Como encontrar licitações de consultoria técnica na minha especialidade?',
        resposta: 'No Monitor de Licitações, pesquise por termos específicos da sua área: "projeto executivo", "levantamento topográfico", "laudo estrutural" ou "EIA/RIMA". Configure alertas para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'moveis-equipamentos',
    titulo: 'Licitações de Móveis e Equipamentos',
    subtitulo: 'Mobiliário corporativo, equipamentos industriais e eletrodomésticos para o governo',
    descricaoMeta:
      'Monitore licitações de móveis corporativos, equipamentos de escritório, eletrodomésticos e mobiliário para escolas, hospitais e repartições públicas. Editais em todo o Brasil.',
    keywords: [
      'licitações móveis', 'licitações mobiliário', 'licitações equipamentos',
      'licitações móveis corporativos', 'licitações eletrodomésticos', 'editais mobiliário escolar',
      'licitações cadeiras escritório', 'pregão mobiliário', 'CNAE 3101 licitações',
    ],
    cnaes: ['31.01', '31.02', '31.03', '31.09', '46.59'],
    intro:
      'O setor público é um dos maiores compradores de móveis e equipamentos do Brasil. Toda nova escola, hospital, repartição ou quartel precisa ser mobiliado. Reformas e renovações de frota de móveis geram um fluxo constante de licitações para fabricantes, distribuidores e revendedores do setor.',
    volumen: 'R$4 bilhões/ano em móveis e equipamentos',
    tiposContrato: [
      { titulo: 'Mobiliário escolar', descricao: 'Carteiras, mesas, cadeiras e armários para escolas da rede pública.' },
      { titulo: 'Mobiliário de escritório', descricao: 'Mesas, cadeiras executivas, estações de trabalho e divisórias para repartições.' },
      { titulo: 'Equipamentos de cozinha', descricao: 'Fogões industriais, câmaras frias, liquidificadores e equipamentos para refeitórios.' },
      { titulo: 'Equipamentos hospitalares', descricao: 'Leitos, macas, cadeiras de rodas, mesas cirúrgicas e mobiliário clínico.' },
    ],
    vantagens: [
      { titulo: 'Demanda recorrente', descricao: 'Reformas e inaugurações de espaços públicos geram demanda constante por mobiliário.' },
      { titulo: 'Atas de registro de preços', descricao: 'Uma única licitação pode gerar pedidos por 12 meses para múltiplos órgãos.' },
      { titulo: 'Escopo diversificado', descricao: 'De mobiliário simples a produtos especializados, há segmentos para todos os portes.' },
    ],
    statsDestaque: [
      { valor: '+2 mil', label: 'editais de mobiliário/mês' },
      { valor: 'R$4 bi', label: 'volume anual de contratos' },
      { valor: '1 ano', label: 'validade da ata de registro de preços' },
    ],
    faqs: [
      {
        pergunta: 'Fabricante tem vantagem sobre distribuidor em licitações de móveis?',
        resposta: 'Não necessariamente. Distribuidores autorizados podem participar normalmente. O edital avalia preço e especificações técnicas — não exige que o licitante seja fabricante, salvo em casos específicos.',
      },
      {
        pergunta: 'Que normas técnicas são exigidas em móveis para licitações?',
        resposta: 'Os editais costumam exigir conformidade com normas ABNT — para móveis escolares (NBR 14699), cadeiras de escritório (NBR 13966), entre outras. O laudo de conformidade ou certificação ABNT pode ser exigido.',
      },
      {
        pergunta: 'Como funciona o prazo de entrega em licitações de mobiliário?',
        resposta: 'Varia por edital. Em geral, de 15 a 60 dias após a emissão do empenho. Alguns editais parcelam as entregas conforme as necessidades do órgão, especialmente em contratos de ata de registro de preços.',
      },
      {
        pergunta: 'É possível licitar mobiliário de forma nacional, atendendo vários estados?',
        resposta: 'Sim. Pregões do governo federal (ComprasGov), estados e consórcios municipais abrem licitações que permitem atendimento nacional. A logística e prazo de entrega devem ser considerados na proposta.',
      },
      {
        pergunta: 'Como receber alertas de licitações de mobiliário?',
        resposta: 'No Monitor de Licitações, cadastre palavras como "mobiliário escolar", "cadeiras de escritório", "mobiliário hospitalar" ou o CNAE do produto. Configure alertas por e-mail para nunca perder um edital.',
      },
    ],
  },
  {
    slug: 'educacao-treinamento',
    titulo: 'Licitações de Educação e Treinamento',
    subtitulo: 'Cursos, capacitações e materiais didáticos para o setor público',
    descricaoMeta:
      'Monitore licitações de educação corporativa, treinamentos, capacitações de servidores, material didático e plataformas de e-learning para órgãos públicos. Editais em todo o Brasil.',
    keywords: [
      'licitações treinamento', 'licitações capacitação', 'licitações educação corporativa',
      'licitações material didático', 'licitações cursos servidores', 'editais treinamento governo',
      'licitações e-learning', 'licitações EAD', 'CNAE 8599 licitações',
    ],
    cnaes: ['85.99', '82.99', '58.20', '72.10'],
    intro:
      'O governo é obrigado a capacitar seus servidores regularmente. De treinamentos obrigatórios de segurança do trabalho a capacitações de gestão, passando por cursos de idiomas e tecnologia, o setor público gera demanda constante por fornecedores de educação corporativa e treinamento.',
    volumen: 'R$2 bilhões/ano em capacitação e treinamento',
    tiposContrato: [
      { titulo: 'Capacitação de servidores', descricao: 'Cursos presenciais, semipresenciais e EAD para desenvolvimento de equipes públicas.' },
      { titulo: 'Material didático', descricao: 'Apostilas, livros, kits pedagógicos e materiais de apoio para ensino público.' },
      { titulo: 'Plataformas EAD', descricao: 'Licenças de LMS, plataformas de e-learning e ambientes virtuais de aprendizagem.' },
      { titulo: 'Treinamentos obrigatórios', descricao: 'NRs (segurança do trabalho), primeiros socorros, reciclagem de habilitação e CIPA.' },
      { titulo: 'Eventos e congressos', descricao: 'Organização de seminários, fóruns técnicos, workshops e conferências oficiais.' },
    ],
    vantagens: [
      { titulo: 'Demanda obrigatória', descricao: 'Treinamentos de NR e reciclagens são exigências legais, gerando demanda ininterrupta.' },
      { titulo: 'Escopo nacional via EAD', descricao: 'Plataformas EAD permitem atender órgãos em qualquer estado sem presença física.' },
      { titulo: 'Crescimento com digitalização', descricao: 'A transformação digital amplia a demanda por capacitação em tecnologia no setor público.' },
    ],
    statsDestaque: [
      { valor: '+800', label: 'editais de treinamento/mês' },
      { valor: 'R$2 bi', label: 'volume anual de contratos' },
      { valor: '12 NRs', label: 'regulamentadoras com treinamentos obrigatórios' },
    ],
    faqs: [
      {
        pergunta: 'Pessoa física pode dar treinamento para o governo?',
        resposta: 'Para contratos de menor valor, sim. Para contratos mais expressivos, é necessário CNPJ com atividade de ensino e, em alguns casos, credenciamento junto a entidades reconhecidas (SENAI, CBO, MEC).',
      },
      {
        pergunta: 'Empresa de EAD precisa de estrutura física para participar de licitações?',
        resposta: 'Não necessariamente. Editais de cursos online avaliam a plataforma tecnológica, certificação ISO ou equivalente, e qualidade do conteúdo. Estrutura física pode ser exigida apenas para certificações específicas.',
      },
      {
        pergunta: 'O que é licitação de registro cadastral para treinamentos?',
        resposta: 'Alguns órgãos montam cadastros de fornecedores habilitados e depois contratam diretamente por dispensa, sem nova licitação. Participar do cadastro garante ser chamado quando surgir a demanda.',
      },
      {
        pergunta: 'Como funciona licitação para organização de eventos?',
        resposta: 'Editais de eventos avaliam estrutura logística, portfólio de eventos anteriores, equipe técnica e preço. Agências de eventos e produtoras podem participar mediante comprovação de capacidade técnica.',
      },
      {
        pergunta: 'Como encontrar licitações de treinamento no meu estado?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "capacitação", "treinamento", "curso", "EAD" ou "material didático". Você receberá novidades por e-mail assim que forem publicadas.',
      },
    ],
  },
  {
    slug: 'combustiveis-lubrificantes',
    titulo: 'Licitações de Combustíveis e Lubrificantes',
    subtitulo: 'Fornecimento de combustível para a frota pública',
    descricaoMeta:
      'Monitore licitações de combustíveis, postos credenciados, lubrificantes e abastecimento de frota para o setor público. Editais de prefeituras, estados e governo federal.',
    keywords: [
      'licitações combustíveis', 'licitações postos de combustível', 'licitações gasolina diesel',
      'licitações lubrificantes', 'licitações abastecimento frota', 'editais combustível prefeitura',
      'CNAE 4681 licitações', 'pregão combustível', 'licitações posto credenciado',
    ],
    cnaes: ['46.81', '47.31', '19.22'],
    intro:
      'Toda frota de veículos públicos precisa de combustível. Prefeituras, estados, Forças Armadas, polícias e repartições federais mantêm frotas que consomem milhões de litros por ano. O credenciamento de postos e o fornecimento de combustíveis geram um fluxo constante de licitações em todo o Brasil.',
    volumen: 'R$6 bilhões/ano em combustíveis para frotas públicas',
    tiposContrato: [
      { titulo: 'Fornecimento de combustível', descricao: 'Gasolina, diesel S10, etanol e GNV para frota pública, com entrega na bomba ou por caminhão-tanque.' },
      { titulo: 'Credenciamento de postos', descricao: 'Cadastro de rede de postos para abastecimento com cartão frota ou sistema eletrônico.' },
      { titulo: 'Lubrificantes e aditivos', descricao: 'Óleos de motor, graxas, fluidos de freio e aditivos para manutenção da frota.' },
      { titulo: 'Gerenciamento de frota', descricao: 'Software de controle de abastecimento, cartões frotas e sistemas de telemetria integrados.' },
    ],
    vantagens: [
      { titulo: 'Alta frequência de abastecimento', descricao: 'A frota pública abastece diariamente — contratos de fornecimento têm consumo previsível.' },
      { titulo: 'Licitações regionais', descricao: 'Postos credenciados competem localmente, limitando a concorrência a empresas da região.' },
      { titulo: 'Contratos longos', descricao: 'Contratos de credenciamento e fornecimento de combustível costumam durar 12 a 24 meses.' },
    ],
    statsDestaque: [
      { valor: '+3 mil', label: 'editais de combustível/mês' },
      { valor: 'R$6 bi', label: 'volume anual de contratos' },
      { valor: '12-24', label: 'meses de duração típica' },
    ],
    faqs: [
      {
        pergunta: 'Posto de combustível individual pode participar de licitações?',
        resposta: 'Sim. Postos com CNPJ, autorização da ANP e documentação fiscal em dia podem participar de licitações para credenciamento ou fornecimento direto. Muitos editais municipais preferem postos locais.',
      },
      {
        pergunta: 'O que é cartão frota em licitações de combustível?',
        resposta: 'É um sistema em que os veículos públicos usam cartões eletrônicos para abastecer na rede credenciada. O contrato é com o fornecedor do cartão, que remunera os postos da rede.',
      },
      {
        pergunta: 'É possível fornecer combustível a granel para o governo?',
        resposta: 'Sim. Órgãos com tanques próprios (Exército, grandes prefeituras) licitam fornecimento a granel em caminhão-tanque. Distribuidoras autorizadas pela ANP podem participar dessa modalidade.',
      },
      {
        pergunta: 'Como funciona a precificação em licitações de combustível?',
        resposta: 'Costuma ser baseada em desconto sobre o preço de referência ANP ou na tabela Petrobras. O vencedor oferece o maior desconto percentual, garantindo fornecimento pelo prazo contratado.',
      },
      {
        pergunta: 'Como monitorar licitações de combustível na minha cidade?',
        resposta: 'No Monitor de Licitações, cadastre palavras como "combustíveis", "gasolina diesel", "abastecimento de frota" ou "posto credenciado". Configure alertas por município para receber novos editais no e-mail.',
      },
    ],
  },
  // ── Novos 18 segmentos ──────────────────────────────────────────────────
  {
    slug: 'uniformes-epis',
    titulo: 'Licitações de Uniformes e EPIs',
    subtitulo: 'Fardamentos, uniformes profissionais e equipamentos de proteção individual',
    descricaoMeta:
      'Monitore licitações de uniformes profissionais, fardamentos, EPIs e equipamentos de proteção individual para órgãos públicos. Editais em prefeituras, estados e governo federal.',
    keywords: [
      'licitações uniformes', 'licitações EPI', 'licitações fardamento',
      'licitações equipamentos de proteção', 'editais uniformes prefeitura',
      'licitações uniformes escolares', 'licitações vestuário profissional',
    ],
    cnaes: ['14.12', '14.13', '46.41', '47.51', '46.63'],
    intro:
      'Uniformes e EPIs são adquiridos por praticamente todos os órgãos públicos: agentes de saúde, guardas municipais, servidores de campo, garis, professores de educação física e operadores de obras. O volume de editais é alto e geograficamente distribuído, com ótimo espaço para confecções, distribuidores e representantes regionais.',
    volumen: 'R$2,5 bilhões/ano em uniformes e EPIs',
    tiposContrato: [
      { titulo: 'Fardamentos e uniformes', descricao: 'Uniformes para guardas municipais, agentes de saúde, servidores operacionais e professores.' },
      { titulo: 'EPIs obrigatórios', descricao: 'Capacetes, luvas, botas, óculos, protetores auriculares e coletes conforme NR-6.' },
      { titulo: 'Uniformes escolares', descricao: 'Kits de uniforme (camiseta, bermuda, calça, tênis) distribuídos a alunos da rede pública.' },
      { titulo: 'Crachás e identificação', descricao: 'Crachás, coletes de identificação, distintivos e vestuário funcional.' },
    ],
    vantagens: [
      { titulo: 'Alta recorrência', descricao: 'Uniformes são renovados anualmente — cada contrato vencido abre nova oportunidade no ano seguinte.' },
      { titulo: 'Concorrência regional', descricao: 'Confecções e distribuidores locais competem em pé de igualdade com fornecedores de outros estados.' },
      { titulo: 'Kits escolares municipais', descricao: 'Programas de uniforme escolar geram contratos únicos de alto volume para municípios inteiros.' },
    ],
    statsDestaque: [
      { valor: '+4 mil', label: 'editais de uniformes/mês' },
      { valor: 'R$2,5 bi', label: 'volume anual de contratos' },
      { valor: '1 ano', label: 'ciclo típico de renovação' },
    ],
    faqs: [
      {
        pergunta: 'Confecção pequena pode ganhar licitação de uniformes?',
        resposta: 'Sim. A Lei 123/2006 garante tratamento diferenciado para ME e EPP. Muitos editais municipais têm cota reservada para empresas de pequeno porte ou são exclusivos para elas quando o valor é até R$80 mil.',
      },
      {
        pergunta: 'Que certificações são exigidas para EPIs em licitações?',
        resposta: 'Os EPIs devem possuir CA (Certificado de Aprovação) emitido pelo Ministério do Trabalho. É obrigatório para todo equipamento de proteção vendido no Brasil e frequentemente exigido nos editais.',
      },
      {
        pergunta: 'Como é feita a entrega de uniformes em licitações municipais?',
        resposta: 'Geralmente por lote (escola, secretaria ou unidade) com prazo de 15 a 45 dias após empenho. Alguns editais exigem personalização (bordado, serigrafia) com logo do órgão antes da entrega.',
      },
      {
        pergunta: 'Pode participar de licitação de uniforme quem não fabrica, apenas revende?',
        resposta: 'Sim. Distribuidores e revendedores participam normalmente, desde que forneçam o produto conforme especificações técnicas do edital. Não é exigido que o licitante seja fabricante.',
      },
      {
        pergunta: 'Como encontrar licitações de uniformes e EPIs na minha região?',
        resposta: 'No Monitor de Licitações, configure alertas com palavras como "uniformes", "fardamento", "EPI", "equipamento de proteção individual" e filtre por estado ou município para receber notificações em tempo real.',
      },
    ],
  },
  {
    slug: 'manutencao-predial',
    titulo: 'Licitações de Manutenção Predial',
    subtitulo: 'Manutenção elétrica, hidráulica e civil em edificações públicas',
    descricaoMeta:
      'Monitore licitações de manutenção predial, manutenção elétrica, hidráulica, ar condicionado e reformas em edificações públicas. Editais em todo o Brasil.',
    keywords: [
      'licitações manutenção predial', 'licitações manutenção elétrica', 'licitações manutenção hidráulica',
      'licitações reforma predial', 'editais manutenção prefeitura',
      'licitações conservação predial', 'licitações instalações elétricas',
    ],
    cnaes: ['43.21', '43.22', '43.29', '43.30', '71.12'],
    intro:
      'Todo prédio público precisa de manutenção preventiva e corretiva contínua — instalações elétricas, hidráulicas, estrutura civil, telhados e sistemas prediais. O setor público mantém um dos maiores estoques prediais do país e terceiriza boa parte das manutenções, gerando demanda constante para empresas especializadas.',
    volumen: 'R$8 bilhões/ano em manutenção predial pública',
    tiposContrato: [
      { titulo: 'Manutenção elétrica', descricao: 'Troca de fiação, quadros elétricos, luminárias, tomadas e sistemas de SPDA.' },
      { titulo: 'Manutenção hidráulica', descricao: 'Reparos em encanamentos, caixas d\'água, bombas e sistemas de esgoto.' },
      { titulo: 'Manutenção civil', descricao: 'Reparos em alvenaria, pisos, revestimentos, telhados e impermeabilização.' },
      { titulo: 'Manutenção de elevadores', descricao: 'Contrato de manutenção preventiva e corretiva de elevadores em prédios públicos.' },
    ],
    vantagens: [
      { titulo: 'Contratos de longa duração', descricao: 'Contratos de manutenção predial duram de 12 a 60 meses com receita mensal fixa.' },
      { titulo: 'Alta recorrência', descricao: 'Cada prédio público precisa de manutenção continuada — a demanda nunca cessa.' },
      { titulo: 'Barreira técnica moderada', descricao: 'Empresas com bons atestados técnicos e equipe qualificada competem com grandes players.' },
    ],
    statsDestaque: [
      { valor: '+5 mil', label: 'editais de manutenção/mês' },
      { valor: 'R$8 bi', label: 'volume anual de contratos' },
      { valor: '60 meses', label: 'duração máxima de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Empresa de manutenção elétrica precisa de registro no CREA?',
        resposta: 'Sim. Serviços de instalação e manutenção elétrica exigem responsável técnico com registro no CREA (engenheiro eletricista ou técnico em eletrotécnica). A ART deve ser emitida para cada serviço.',
      },
      {
        pergunta: 'Qual a diferença entre manutenção preventiva e corretiva em contratos públicos?',
        resposta: 'Preventiva é programada — vistorias e ajustes periódicos para evitar falhas. Corretiva é reativa — atendimento quando algo quebra. A maioria dos contratos inclui ambas, com SLA definido para o tempo de atendimento.',
      },
      {
        pergunta: 'Empresa nova pode ganhar contrato de manutenção predial?',
        resposta: 'Sim, desde que apresente atestados de capacidade técnica compatíveis. Para contratos de maior valor, o edital pode exigir atestados de serviços anteriores com quantidade mínima de m² ou valor de contrato.',
      },
      {
        pergunta: 'Como funciona o contrato de manutenção de elevadores?',
        resposta: 'O contrato geralmente inclui visitas mensais preventivas, peças de desgaste e atendimento corretivo com SLA de 4 a 24h. A empresa deve ter técnico habilitado e registro no sindicato da categoria (SEMAPI em SP, equivalentes nos demais estados).',
      },
      {
        pergunta: 'Como monitorar licitações de manutenção predial no meu estado?',
        resposta: 'No Monitor de Licitações, cadastre palavras como "manutenção predial", "manutenção elétrica", "manutenção hidráulica" e filtre por estado. Você receberá alertas por e-mail assim que novos editais forem publicados.',
      },
    ],
  },
  {
    slug: 'material-construcao',
    titulo: 'Licitações de Material de Construção',
    subtitulo: 'Insumos, ferramentas e materiais hidráulicos e elétricos para obras públicas',
    descricaoMeta:
      'Monitore licitações de material de construção, ferramentas, material elétrico, hidráulico e insumos para obras de prefeituras, estados e governo federal.',
    keywords: [
      'licitações material de construção', 'licitações ferramentas', 'licitações material elétrico',
      'licitações material hidráulico', 'editais material construção prefeitura',
      'licitações cimento areia', 'pregão material construção',
    ],
    cnaes: ['46.74', '47.44', '46.62', '46.63', '47.59'],
    intro:
      'Prefeituras, autarquias e secretarias de obras compram material de construção com alta frequência para manutenção da infraestrutura municipal. Cimento, areia, tintas, material elétrico, hidráulico, ferragens e ferramentas são itens presentes em praticamente todo almoxarifado público.',
    volumen: 'R$5 bilhões/ano em material de construção',
    tiposContrato: [
      { titulo: 'Materiais básicos de construção', descricao: 'Cimento, areia, brita, blocos, telhas, tintas e acabamentos.' },
      { titulo: 'Material elétrico', descricao: 'Fios, cabos, disjuntores, tomadas, luminárias e componentes elétricos.' },
      { titulo: 'Material hidráulico', descricao: 'Tubos, conexões, registros, caixas d\'água, bombas e acessórios.' },
      { titulo: 'Ferramentas e equipamentos', descricao: 'Ferramentas manuais, elétricas, andaimes, betoneiras e compressores.' },
    ],
    vantagens: [
      { titulo: 'Volume alto de editais', descricao: 'Prefeituras compram material de construção com frequência mensal ou trimestral.' },
      { titulo: 'Atas de registro de preços', descricao: 'Uma licitação gera fornecimento por 12 meses para múltiplos órgãos participantes.' },
      { titulo: 'Revenda local competitiva', descricao: 'Lojas de material de construção locais competem em pé de igualdade com distribuidoras estaduais.' },
    ],
    statsDestaque: [
      { valor: '+6 mil', label: 'editais de material/mês' },
      { valor: 'R$5 bi', label: 'volume anual de contratos' },
      { valor: '5.570', label: 'municípios compradores' },
    ],
    faqs: [
      {
        pergunta: 'Loja de material de construção pode participar de licitação?',
        resposta: 'Sim. Qualquer empresa com CNPJ, regularidade fiscal e atividade compatível pode participar. Lojas locais têm vantagem logística em municípios menores, onde o prazo de entrega é fator competitivo.',
      },
      {
        pergunta: 'Como funciona a licitação de material de construção por ata de registro de preços?',
        resposta: 'O órgão realiza uma licitação e registra os preços por item. Durante 12 meses, ele (e outros órgãos que aderirem) podem solicitar quantidades conforme a necessidade, sem nova licitação.',
      },
      {
        pergunta: 'É necessário CNPJ de atacadista ou varejista pode participar?',
        resposta: 'Varejistas participam normalmente. O edital não exige CNAE de atacadista. O que importa é o produto fornecido atender às especificações e o prazo de entrega ser cumprido.',
      },
      {
        pergunta: 'Como são especificados os materiais nos editais?',
        resposta: 'Geralmente por norma ABNT, especificação técnica ou marca de referência (com cláusula "ou equivalente"). A empresa pode oferecer o produto de referência ou outro que atenda às mesmas especificações técnicas.',
      },
      {
        pergunta: 'Como receber alertas de licitações de material de construção perto de mim?',
        resposta: 'Configure o Monitor de Licitações com palavras como "material de construção", "material elétrico", "ferramentas" ou "material hidráulico" e aplique filtro por estado ou município.',
      },
    ],
  },
  {
    slug: 'telecomunicacoes',
    titulo: 'Licitações de Telecomunicações',
    subtitulo: 'Internet, telefonia, links dedicados e PABX para o setor público',
    descricaoMeta:
      'Monitore licitações de telecomunicações: internet banda larga, telefonia fixa e móvel, links dedicados, PABX e redes corporativas para órgãos públicos.',
    keywords: [
      'licitações telecomunicações', 'licitações internet', 'licitações telefonia',
      'licitações link dedicado', 'licitações PABX', 'editais telecomunicações governo',
      'licitações banda larga', 'pregão internet prefeitura',
    ],
    cnaes: ['61.10', '61.20', '61.30', '61.40', '61.90'],
    intro:
      'Todo órgão público depende de conectividade e telefonia para funcionar. Links de internet, telefonia fixa e móvel, PABX e redes WAN são contratados regularmente por prefeituras, estados e governo federal. O mercado de telecomunicações para o setor público movimenta bilhões por ano.',
    volumen: 'R$7 bilhões/ano em telecomunicações públicas',
    tiposContrato: [
      { titulo: 'Internet e links dedicados', descricao: 'Banda larga simétrica, links dedicados com SLA e fibra óptica para órgãos públicos.' },
      { titulo: 'Telefonia fixa', descricao: 'STFC, ramais, PABX e terminais telefônicos para repartições.' },
      { titulo: 'Telefonia móvel corporativa', descricao: 'Planos corporativos de celular para servidores e veículos operacionais.' },
      { titulo: 'Redes e infraestrutura', descricao: 'Implantação de redes locais, wi-fi, cabeamento estruturado e data centers.' },
    ],
    vantagens: [
      { titulo: 'Contratos longos', descricao: 'Contratos de telecomunicações duram de 12 a 60 meses com receita recorrente.' },
      { titulo: 'Mercado em expansão', descricao: 'A transformação digital do governo aumenta a demanda por mais banda e soluções avançadas.' },
      { titulo: 'Alta barreira de saída', descricao: 'Uma vez implantada a infraestrutura, a troca de fornecedor tem custo elevado para o órgão.' },
    ],
    statsDestaque: [
      { valor: '+1,5 mil', label: 'editais de telecom/mês' },
      { valor: 'R$7 bi', label: 'volume anual de contratos' },
      { valor: '60 meses', label: 'duração máxima de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Provedores regionais podem disputar licitações de internet com as grandes operadoras?',
        resposta: 'Sim, especialmente em municípios onde as grandes operadoras não têm infraestrutura. ISPs regionais com outorga da Anatel e SCM têm plena capacidade de participar e frequentemente ganham contratos municipais.',
      },
      {
        pergunta: 'Que documentos a Anatel exige para participar de licitações de telecom?',
        resposta: 'Licença ou autorização da Anatel para o serviço ofertado (SCM para internet, STFC para telefonia fixa, SMP para celular). Cada serviço tem sua outorga específica.',
      },
      {
        pergunta: 'Como funciona licitação de PABX?',
        resposta: 'Pode ser locação de PABX (hardware + manutenção), aquisição definitiva ou PABX virtual (VOIP em nuvem). Editais especificam número de ramais, funcionalidades e SLA de atendimento a falhas.',
      },
      {
        pergunta: 'O que é o PGMQ e como afeta licitações de telecom?',
        resposta: 'O Programa Governo Mais Qualidade impõe padrões de qualidade mínimos para serviços de telecomunicações contratados pelo governo federal. Operadoras devem cumprir índices de disponibilidade e velocidade definidos em contrato.',
      },
      {
        pergunta: 'Como monitorar licitações de internet e telefonia em todo o Brasil?',
        resposta: 'No Monitor de Licitações, configure alertas com palavras como "internet", "link dedicado", "telefonia", "PABX" ou "banda larga" para receber notificações de novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'ar-condicionado-climatizacao',
    titulo: 'Licitações de Ar Condicionado e Climatização',
    subtitulo: 'Instalação e manutenção de HVAC em prédios públicos',
    descricaoMeta:
      'Monitore licitações de ar condicionado, climatização, instalação e manutenção de HVAC para escolas, hospitais, repartições e prédios públicos em todo o Brasil.',
    keywords: [
      'licitações ar condicionado', 'licitações climatização', 'licitações HVAC',
      'licitações manutenção ar condicionado', 'editais ar condicionado prefeitura',
      'licitações split', 'licitações refrigeração', 'pregão ar condicionado',
    ],
    cnaes: ['43.22', '33.14', '46.93'],
    intro:
      'Escolas, hospitais, repartições, bibliotecas e todos os prédios públicos precisam de climatização adequada. A instalação, manutenção preventiva e corretiva de sistemas de ar condicionado gera contratos recorrentes em todo o Brasil — com destaque para regiões Norte, Nordeste e Centro-Oeste, onde o calor torna o serviço essencial.',
    volumen: 'R$3 bilhões/ano em climatização pública',
    tiposContrato: [
      { titulo: 'Fornecimento e instalação', descricao: 'Aquisição e instalação de splits, multi-splits, VRF e centrais de ar em prédios públicos.' },
      { titulo: 'Manutenção preventiva', descricao: 'Limpeza, recarga de gás, revisão e ajuste de sistemas de climatização.' },
      { titulo: 'Manutenção corretiva', descricao: 'Atendimento a chamados de falha com SLA definido em contrato.' },
      { titulo: 'Renovação de frota', descricao: 'Substituição de equipamentos antigos (Freon R22) por novos modelos com gases ecológicos.' },
    ],
    vantagens: [
      { titulo: 'Demanda ininterrupta', descricao: 'Equipamentos instalados precisam de manutenção anual obrigatória — o contrato se renova sozinho.' },
      { titulo: 'Concorrência regional', descricao: 'Técnicos de refrigeração locais competem com vantagem em municípios menores.' },
      { titulo: 'Crescimento acelerado', descricao: 'A universalização do ar condicionado em escolas públicas amplia o mercado ano a ano.' },
    ],
    statsDestaque: [
      { valor: '+2 mil', label: 'editais de climatização/mês' },
      { valor: 'R$3 bi', label: 'volume anual de contratos' },
      { valor: '12 meses', label: 'ciclo de manutenção preventiva' },
    ],
    faqs: [
      {
        pergunta: 'Técnico em refrigeração precisa de registro para participar de licitações?',
        resposta: 'Sim. O responsável técnico deve possuir Certificação de Técnico em Refrigeração e Climatização (SENAI/SENAC ou similar) e, para sistemas de maior porte, registro no CREA como engenheiro mecânico ou eletromecânico.',
      },
      {
        pergunta: 'Que certificação o equipamento precisa ter para ser aceito em licitações?',
        resposta: 'O equipamento deve ser certificado pelo INMETRO e estar em conformidade com as normas de eficiência energética vigentes (Programa Brasileiro de Etiquetagem). Alguns editais exigem nível A de eficiência.',
      },
      {
        pergunta: 'Como funciona o contrato de manutenção preventiva de ar condicionado?',
        resposta: 'Geralmente inclui visitas trimestrais ou semestrais, limpeza de filtros e serpentinas, verificação de gás e componentes elétricos. O contrato define SLA para atendimento corretivo emergencial.',
      },
      {
        pergunta: 'Empresa de ar condicionado pode atender municípios de outros estados?',
        resposta: 'Sim. Pregões eletrônicos permitem participação nacional. A empresa deve avaliar a viabilidade logística e considerar o custo de deslocamento da equipe técnica ao elaborar a proposta.',
      },
      {
        pergunta: 'Como receber alertas de licitações de ar condicionado na minha região?',
        resposta: 'Configure no Monitor de Licitações palavras como "ar condicionado", "climatização", "HVAC" ou "manutenção de refrigeração". Aplique filtro regional para focar nos editais mais próximos.',
      },
    ],
  },
  {
    slug: 'graficos-impressao',
    titulo: 'Licitações de Serviços Gráficos e Impressão',
    subtitulo: 'Publicidade legal, impressão de materiais e gráfica para o setor público',
    descricaoMeta:
      'Monitore licitações de serviços gráficos, impressão de materiais institucionais, publicidade legal, plotagem e confecção de materiais para órgãos públicos.',
    keywords: [
      'licitações serviços gráficos', 'licitações impressão', 'licitações gráfica',
      'licitações publicidade legal', 'editais gráfica prefeitura',
      'licitações material gráfico', 'licitações plotagem', 'pregão impressão',
    ],
    cnaes: ['18.11', '18.12', '18.13', '18.20'],
    intro:
      'Órgãos públicos têm obrigação legal de publicar atos oficiais em jornais e diários, além de produzir materiais impressos para campanhas, eventos e comunicação institucional. Gráficas, empresas de plotagem e produtoras de materiais visuais têm demanda constante no setor público.',
    volumen: 'R$2 bilhões/ano em serviços gráficos públicos',
    tiposContrato: [
      { titulo: 'Publicidade legal', descricao: 'Publicação de editais, atas, contratos e avisos em jornais de grande circulação ou diários oficiais.' },
      { titulo: 'Impressão de materiais', descricao: 'Folders, cartilhas, formulários, banners, outdoors e material de campanhas.' },
      { titulo: 'Plotagem e sinalização', descricao: 'Plotagem de veículos, sinalização de obras, fachadas e ambientes públicos.' },
      { titulo: 'Confecção de brindes', descricao: 'Brindes institucionais, camisetas de evento, bonés e materiais promocionais.' },
    ],
    vantagens: [
      { titulo: 'Publicidade legal obrigatória', descricao: 'Todo edital de licitação exige publicação — demanda gerada pelo próprio processo licitatório.' },
      { titulo: 'Alta frequência de editais', descricao: 'Prefeituras precisam de materiais gráficos o ano todo para campanhas de saúde, educação e eventos.' },
      { titulo: 'Segmento acessível a MPEs', descricao: 'Gráficas de pequeno porte competem diretamente por contratos de menor valor.' },
    ],
    statsDestaque: [
      { valor: '+3 mil', label: 'editais gráficos/mês' },
      { valor: 'R$2 bi', label: 'volume anual de contratos' },
      { valor: '5–30', label: 'dias de prazo de entrega típico' },
    ],
    faqs: [
      {
        pergunta: 'Jornal local pode participar de licitações de publicidade legal?',
        resposta: 'Sim, desde que comprovem circulação na área de abrangência exigida no edital. A maioria dos editais municipais aceita jornais de circulação regional, sem exigir circulação estadual ou nacional.',
      },
      {
        pergunta: 'Gráfica digital pequena pode participar de licitações?',
        resposta: 'Sim. Com CNPJ regular e atestado de capacidade técnica, gráficas de qualquer porte participam. A Lei 123/2006 favorece MPEs em licitações de até R$80 mil.',
      },
      {
        pergunta: 'Como funciona a especificação técnica em editais de impressão?',
        resposta: 'O edital detalha gramatura do papel, número de cores, acabamento (laminação, verniz, dobras), dimensões e quantidade. A gráfica deve confirmar que consegue atender todas as especificações antes de apresentar proposta.',
      },
      {
        pergunta: 'O que são brindes institucionais em licitações públicas?',
        resposta: 'São materiais personalizados com a marca do órgão (canetas, blocos, bonés, sacolas) distribuídos em eventos ou campanhas. A aquisição deve seguir limites de valor e se justificar no interesse público.',
      },
      {
        pergunta: 'Como encontrar licitações de gráfica para a minha cidade?',
        resposta: 'No Monitor de Licitações, configure alertas com palavras como "serviços gráficos", "impressão", "material gráfico", "publicidade legal" ou "plotagem" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'saude-ocupacional',
    titulo: 'Licitações de Saúde Ocupacional',
    subtitulo: 'Exames admissionais, PCMSO, PPRA e medicina do trabalho para o setor público',
    descricaoMeta:
      'Monitore licitações de saúde ocupacional, medicina do trabalho, exames admissionais e periódicos, PCMSO e PPRA para órgãos públicos em todo o Brasil.',
    keywords: [
      'licitações saúde ocupacional', 'licitações medicina do trabalho', 'licitações PCMSO',
      'licitações exames admissionais', 'licitações PPRA', 'editais saúde ocupacional prefeitura',
      'licitações SESMT', 'pregão medicina do trabalho',
    ],
    cnaes: ['86.20', '86.90', '71.20'],
    intro:
      'Todo órgão público com servidores é obrigado por lei a manter programas de saúde e segurança no trabalho — PCMSO, PPRA, exames admissionais, periódicos e demissionais. A terceirização desses serviços via licitação é prática comum, gerando demanda constante para clínicas, médicos do trabalho e empresas de SST.',
    volumen: 'R$1,5 bilhão/ano em saúde ocupacional pública',
    tiposContrato: [
      { titulo: 'Exames médicos ocupacionais', descricao: 'Admissionais, periódicos, retorno ao trabalho, mudança de função e demissionais (NR-7).' },
      { titulo: 'PCMSO e PPRA', descricao: 'Elaboração e gestão do Programa de Controle Médico de Saúde Ocupacional e Programa de Prevenção de Riscos Ambientais.' },
      { titulo: 'SESMT terceirizado', descricao: 'Serviço Especializado em Eng. de Segurança e Medicina do Trabalho para órgãos de menor porte.' },
      { titulo: 'Vacinação corporativa', descricao: 'Campanhas de vacinação (gripe, hepatite, COVID) para servidores públicos.' },
    ],
    vantagens: [
      { titulo: 'Demanda obrigatória por lei', descricao: 'As NRs exigem PCMSO e exames periódicos — o órgão é obrigado a contratar, independente de orçamento.' },
      { titulo: 'Alta recorrência', descricao: 'Contratos anuais com renovação — cada contrato vencido reabre como nova oportunidade.' },
      { titulo: 'Pequenas clínicas bem-posicionadas', descricao: 'Clínicas locais têm vantagem de proximidade nos municípios menores.' },
    ],
    statsDestaque: [
      { valor: '+800', label: 'editais de SST/mês' },
      { valor: 'R$1,5 bi', label: 'volume anual de contratos' },
      { valor: '12 meses', label: 'ciclo típico de contrato' },
    ],
    faqs: [
      {
        pergunta: 'Clínica médica precisa de CRM de pessoa jurídica?',
        resposta: 'Sim. Para prestação de serviços médicos, a empresa deve ter registro no CRM do estado como pessoa jurídica, além do responsável técnico (médico do trabalho) com CRM individual ativo.',
      },
      {
        pergunta: 'O que é o e-Social e como afeta contratos de saúde ocupacional?',
        resposta: 'O e-Social exige que todos os exames e laudos médicos sejam integrados ao sistema do governo. Empresas de SST devem ter sistema homologado e a empresa contratada geralmente assume a responsabilidade de envio dos dados.',
      },
      {
        pergunta: 'Empresa de segurança do trabalho sem médico pode participar?',
        resposta: 'Para serviços exclusivamente de segurança do trabalho (PPRA, LTCAT, laudos de ergonomia), sim. Para PCMSO e exames médicos, é obrigatória a presença de médico do trabalho no quadro funcional ou como subcontratado.',
      },
      {
        pergunta: 'Como funciona a licitação para vacinação de servidores?',
        resposta: 'O órgão lança pregão especificando tipo de vacina, número de doses e local de aplicação. Clínicas e laboratórios com câmara fria e enfermeiros habilitados participam. Algumas prefeituras realizam no próprio local de trabalho.',
      },
      {
        pergunta: 'Como encontrar licitações de saúde ocupacional no meu estado?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "saúde ocupacional", "medicina do trabalho", "PCMSO", "exames admissionais" ou "PPRA" e filtre por estado para receber notificações em tempo real.',
      },
    ],
  },
  {
    slug: 'seguros',
    titulo: 'Licitações de Seguros',
    subtitulo: 'Seguro de frota, prédios, responsabilidade civil e vida coletivo para o setor público',
    descricaoMeta:
      'Monitore licitações de seguros para o setor público: seguro de frota, patrimonial, responsabilidade civil, seguro de vida coletivo e seguros de obras.',
    keywords: [
      'licitações seguros', 'licitações seguro frota', 'licitações seguro patrimonial',
      'licitações seguro de vida', 'licitações seguro veicular', 'editais seguro prefeitura',
      'licitações corretora de seguros', 'pregão seguro',
    ],
    cnaes: ['65.11', '65.12', '65.20', '66.22'],
    intro:
      'O poder público é obrigado por lei a segurar sua frota, obras com financiamento federal, edificações tombadas e servidores em atividades de risco. Corretoras de seguros e seguradoras que conhecem o mercado público têm espaço significativo nesse segmento, especialmente considerando o tamanho da frota e do patrimônio imobiliário público no Brasil.',
    volumen: 'R$3 bilhões/ano em seguros públicos',
    tiposContrato: [
      { titulo: 'Seguro de frota', descricao: 'RCFAT, casco e cobertura abrangente para veículos públicos leves, pesados e especiais.' },
      { titulo: 'Seguro patrimonial', descricao: 'Incêndio, roubo, vendaval e danos a prédios, equipamentos e mobiliário público.' },
      { titulo: 'Seguro de vida coletivo', descricao: 'Cobertura de acidentes pessoais e morte para servidores em atividades de risco.' },
      { titulo: 'Seguro garantia', descricao: 'Seguro garantia de execução para contratos de obras e serviços públicos.' },
    ],
    vantagens: [
      { titulo: 'Obrigatoriedade legal', descricao: 'Obras com financiamento do FNDE, BNDES e outros exigem contratação de seguro.' },
      { titulo: 'Tickets elevados', descricao: 'Frotas e patrimônios públicos de grande porte geram prêmios significativos.' },
      { titulo: 'Renovação anual garantida', descricao: 'Seguros têm vigência de 12 meses — o contrato retorna como nova licitação todo ano.' },
    ],
    statsDestaque: [
      { valor: '+500', label: 'editais de seguro/mês' },
      { valor: 'R$3 bi', label: 'volume anual de contratos' },
      { valor: '1 ano', label: 'vigência padrão de contrato' },
    ],
    faqs: [
      {
        pergunta: 'Corretora de seguros pode participar de licitações?',
        resposta: 'Sim, corretoras registradas na SUSEP podem participar. O papel da corretora é apresentar a proposta da seguradora, gerenciar o contrato e intermediar sinistros. Muitos editais aceitam tanto seguradoras quanto corretoras.',
      },
      {
        pergunta: 'O que é seguro garantia em licitações?',
        resposta: 'É uma modalidade de garantia que o licitante apresenta para assegurar o cumprimento do contrato. Equivale à caução em dinheiro ou fiança bancária, mas com custo menor para o contratado e maior segurança para o contratante.',
      },
      {
        pergunta: 'Como funciona a licitação de seguro de frota pública?',
        resposta: 'O órgão apresenta relação de veículos, histórico de sinistros e uso previsto. Seguradoras e corretoras apresentam propostas de cobertura e prêmio. O critério é geralmente menor preço para a mesma cobertura definida no edital.',
      },
      {
        pergunta: 'Seguro de vida coletivo para servidores é obrigatório?',
        resposta: 'Varia por legislação estadual e municipal. Para servidores em atividades de alto risco (guardas, bombeiros, agentes penitenciários), muitos entes federativos têm obrigação legal de contratar cobertura de acidentes pessoais.',
      },
      {
        pergunta: 'Como encontrar licitações de seguros no setor público?',
        resposta: 'No Monitor de Licitações, configure alertas com palavras como "seguro de frota", "seguro patrimonial", "seguro de vida coletivo" ou simplesmente "seguros" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'publicidade-comunicacao',
    titulo: 'Licitações de Publicidade e Comunicação',
    subtitulo: 'Campanhas institucionais, comunicação pública e marketing governamental',
    descricaoMeta:
      'Monitore licitações de publicidade institucional, comunicação pública, assessoria de imprensa, campanhas de saúde e educação para órgãos públicos em todo o Brasil.',
    keywords: [
      'licitações publicidade', 'licitações comunicação', 'licitações agência de publicidade',
      'licitações assessoria de imprensa', 'editais publicidade governo',
      'licitações campanhas', 'pregão publicidade institucional',
    ],
    cnaes: ['73.11', '73.12', '70.20', '90.03'],
    intro:
      'Órgãos públicos contratam regularmente agências de publicidade, assessorias de imprensa e produtoras para campanhas de utilidade pública, comunicação institucional e divulgação de serviços. Com a Lei 12.232/2010 regulamentando especificamente a licitação de publicidade, o mercado tem regras claras e acesso bem definido.',
    volumen: 'R$4 bilhões/ano em publicidade pública',
    tiposContrato: [
      { titulo: 'Agência de publicidade', descricao: 'Planejamento, criação e veiculação de campanhas publicitárias institucionais.' },
      { titulo: 'Assessoria de imprensa', descricao: 'Produção de releases, relacionamento com mídia e monitoramento de notícias.' },
      { titulo: 'Produção audiovisual', descricao: 'Vídeos institucionais, spots de rádio, peças para TV e conteúdo para redes sociais.' },
      { titulo: 'Comunicação digital', descricao: 'Gestão de redes sociais, criação de sites institucionais e e-mail marketing.' },
    ],
    vantagens: [
      { titulo: 'Lei específica', descricao: 'A Lei 12.232/2010 regulamenta licitações de publicidade — processo mais previsível e transparente.' },
      { titulo: 'Contratos de AOR', descricao: 'Agências de publicidade podem ter contratos de Agência de Registro e Operações recorrentes.' },
      { titulo: 'Mercado crescente', descricao: 'Comunicação digital e redes sociais ampliam as oportunidades para agências especializadas.' },
    ],
    statsDestaque: [
      { valor: '+600', label: 'editais de publicidade/mês' },
      { valor: 'R$4 bi', label: 'volume anual de contratos' },
      { valor: '24 meses', label: 'duração típica de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Agência pequena pode participar de licitação de publicidade pública?',
        resposta: 'Sim. A Lei 12.232/2010 não exige porte mínimo. Municípios de menor porte preferem agências regionais que conheçam a cultura local. A qualificação técnica (portfólio, equipe) tem peso importante na seleção.',
      },
      {
        pergunta: 'Como funciona a licitação de publicidade segundo a Lei 12.232/2010?',
        resposta: 'É feita em duas etapas: habilitação técnica (portfólio, equipe, prêmios) e proposta de preço (valor dos serviços, desconto de mídia). A agência vencedora firma um contrato de prestação de serviços de publicidade.',
      },
      {
        pergunta: 'Assessoria de imprensa pode participar separadamente de publicidade?',
        resposta: 'Sim. Assessoria de imprensa é licitada separadamente da publicidade em muitos órgãos. Empresas especializadas em comunicação podem disputar contratos de assessoria sem precisar ter estrutura de agência full service.',
      },
      {
        pergunta: 'Quais são os documentos técnicos exigidos em licitações de publicidade?',
        resposta: 'Geralmente: portfólio de campanhas anteriores, relação de profissionais da equipe com currículos, comprovação de prêmios e reconhecimentos, e experiência em campanhas de temática similar ao objeto do edital.',
      },
      {
        pergunta: 'Como monitorar licitações de publicidade governamental?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "publicidade", "agência de publicidade", "comunicação social", "assessoria de imprensa" para receber novos editais automaticamente.',
      },
    ],
  },
  {
    slug: 'servicos-juridicos',
    titulo: 'Licitações de Serviços Jurídicos',
    subtitulo: 'Advocacia, assessoria jurídica e pareceres para municípios e autarquias',
    descricaoMeta:
      'Monitore licitações de serviços jurídicos, advocacia, assessoria jurídica, consultoria em direito administrativo e pareceres legais para órgãos públicos.',
    keywords: [
      'licitações serviços jurídicos', 'licitações advocacia', 'licitações assessoria jurídica',
      'licitações consultoria jurídica', 'editais serviços jurídicos prefeitura',
      'licitações parecer jurídico', 'licitações direito administrativo',
    ],
    cnaes: ['69.11', '69.12'],
    intro:
      'Municípios de menor porte e autarquias frequentemente não têm quadro jurídico próprio suficiente e terceirizam serviços de assessoria jurídica via licitação. Escritórios de advocacia especializados em direito público, administrativo, previdenciário e tributário têm amplo mercado nesse segmento.',
    volumen: 'R$1,2 bilhão/ano em serviços jurídicos públicos',
    tiposContrato: [
      { titulo: 'Assessoria jurídica geral', descricao: 'Consultoria permanente em direito administrativo, contratos e licitações para municípios.' },
      { titulo: 'Representação judicial', descricao: 'Defesa do ente público em ações judiciais cíveis, trabalhistas e tributárias.' },
      { titulo: 'Pareceres técnicos', descricao: 'Pareceres pontuais sobre contratos, licitações, convênios e questões regulatórias.' },
      { titulo: 'Execução fiscal', descricao: 'Cobrança judicial de dívidas ativas de municípios e autarquias.' },
    ],
    vantagens: [
      { titulo: 'Demanda estrutural', descricao: 'Municípios pequenos sem PGM própria terceirizam toda a assessoria jurídica.' },
      { titulo: 'Contratos de longa duração', descricao: 'Assessorias jurídicas geralmente têm contratos de 12 a 24 meses com renovação.' },
      { titulo: 'Especialização como diferencial', descricao: 'Escritórios especializados em direito público têm vantagem decisiva na qualificação técnica.' },
    ],
    statsDestaque: [
      { valor: '+400', label: 'editais jurídicos/mês' },
      { valor: 'R$1,2 bi', label: 'volume anual de contratos' },
      { valor: '24 meses', label: 'duração típica de contratos' },
    ],
    faqs: [
      {
        pergunta: 'Escritório de advocacia pode participar de licitação?',
        resposta: 'Sim. Escritórios com CNPJ e registro na OAB (pessoa jurídica) participam normalmente. A qualificação técnica costuma avaliar especialização em direito público, tempo de atuação e portfólio de clientes públicos anteriores.',
      },
      {
        pergunta: 'Advocacia pública não substitui a terceirizada?',
        resposta: 'Em muitos municípios, o quadro de procuradores é insuficiente para todas as demandas. A terceirização complementa e não substitui — especialmente em áreas específicas como execuções fiscais e ações trabalhistas em massa.',
      },
      {
        pergunta: 'O êxito pode ser remunerado em contratos com o poder público?',
        resposta: 'Sim, desde que previsto no edital e no contrato. A remuneração por êxito (percentual sobre valores recuperados em execuções fiscais, por exemplo) é permitida e comum em contratos de cobrança da dívida ativa.',
      },
      {
        pergunta: 'Advogado individual (sem escritório) pode participar?',
        resposta: 'Alguns editais admitem profissional autônomo (pessoa física), especialmente para pareceres pontuais. Para contratos de assessoria contínua, em geral é exigido CNPJ de escritório ou sociedade de advogados.',
      },
      {
        pergunta: 'Como encontrar licitações de serviços jurídicos em municípios?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "assessoria jurídica", "serviços jurídicos", "advocacia", "consultoria jurídica" para receber novos editais automaticamente.',
      },
    ],
  },
  {
    slug: 'auditoria-contabilidade',
    titulo: 'Licitações de Auditoria e Contabilidade',
    subtitulo: 'Serviços contábeis, auditorias externas e assessoria fiscal para o poder público',
    descricaoMeta:
      'Monitore licitações de auditoria externa, contabilidade pública, assessoria fiscal, gestão de folha de pagamento e serviços contábeis para órgãos públicos.',
    keywords: [
      'licitações auditoria', 'licitações contabilidade', 'licitações auditoria externa',
      'licitações serviços contábeis', 'editais auditoria prefeitura',
      'licitações assessoria fiscal', 'licitações gestão folha pagamento',
    ],
    cnaes: ['69.20', '70.20'],
    intro:
      'Câmaras municipais, autarquias, fundos de previdência e consórcios públicos frequentemente não têm estrutura interna para todas as demandas contábeis e de auditoria, terceirizando esses serviços. O mercado é estável, com contratos anuais recorrentes e boa previsibilidade de receita para escritórios de contabilidade e auditoria.',
    volumen: 'R$800 milhões/ano em contabilidade e auditoria pública',
    tiposContrato: [
      { titulo: 'Auditoria externa independente', descricao: 'Auditoria das demonstrações financeiras de autarquias, fundos e entidades públicas.' },
      { titulo: 'Assessoria contábil', descricao: 'Escrituração contábil, balanços, relatórios de gestão fiscal e SICONFI para câmaras e autarquias.' },
      { titulo: 'Gestão da folha de pagamento', descricao: 'Processamento da folha, cálculos trabalhistas e obrigações acessórias para entes pequenos.' },
      { titulo: 'Consultoria tributária', descricao: 'Recuperação de créditos tributários, planejamento fiscal e conformidade com legislação.' },
    ],
    vantagens: [
      { titulo: 'Demanda estrutural', descricao: 'Câmaras e autarquias de municípios pequenos terceirizam quase toda a contabilidade.' },
      { titulo: 'Contratos anuais recorrentes', descricao: 'Serviços contínuos renovados anualmente — alta previsibilidade de receita.' },
      { titulo: 'Especialização diferencia', descricao: 'Contadores com CRC e conhecimento em contabilidade pública e SICONFI se destacam.' },
    ],
    statsDestaque: [
      { valor: '+350', label: 'editais de contabilidade/mês' },
      { valor: 'R$800 mi', label: 'volume anual de contratos' },
      { valor: '1 ano', label: 'ciclo típico de renovação' },
    ],
    faqs: [
      {
        pergunta: 'Escritório de contabilidade precisa de CRC para participar de licitações?',
        resposta: 'Sim. O responsável técnico deve ser contador com CRC ativo. O escritório (pessoa jurídica) também deve ter registro no CRC como empresa de contabilidade.',
      },
      {
        pergunta: 'Auditor independente pessoa física pode participar?',
        resposta: 'Para auditorias, em geral sim, com registro no CFC e CRC. Para contratos de maior porte, é comum a exigência de empresa de auditoria com quadro mínimo de profissionais.',
      },
      {
        pergunta: 'O que é o SICONFI e por que é importante para contratos públicos?',
        resposta: 'O SICONFI é o sistema da STN para envio das informações contábeis dos entes públicos ao governo federal. Contadores que prestam serviços a municípios precisam dominar esse sistema para cumprir as obrigações de transparência.',
      },
      {
        pergunta: 'Câmara municipal pode contratar serviço contábil separado do executivo?',
        resposta: 'Sim. Câmaras são unidades orçamentárias independentes e podem contratar sua própria assessoria contábil. Na prática, muitas câmaras de municípios menores terceirizam integralmente sua contabilidade.',
      },
      {
        pergunta: 'Como monitorar licitações de auditoria e contabilidade?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "auditoria", "serviços contábeis", "assessoria contábil", "escrituração contábil" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'saneamento-meio-ambiente',
    titulo: 'Licitações de Saneamento e Meio Ambiente',
    subtitulo: 'Tratamento de água, resíduos sólidos, licenciamento e estudos ambientais',
    descricaoMeta:
      'Monitore licitações de saneamento básico, tratamento de água e esgoto, gestão de resíduos sólidos, licenciamento ambiental e estudos de impacto para órgãos públicos.',
    keywords: [
      'licitações saneamento', 'licitações meio ambiente', 'licitações resíduos sólidos',
      'licitações tratamento de água', 'licitações licenciamento ambiental',
      'editais saneamento prefeitura', 'licitações EIA RIMA', 'licitações aterro sanitário',
    ],
    cnaes: ['37.01', '37.02', '38.11', '38.12', '38.21', '38.22', '71.20'],
    intro:
      'O Marco Legal do Saneamento (Lei 14.026/2020) impulsionou investimentos massivos em saneamento básico no Brasil. Municípios são obrigados a universalizar o acesso à água tratada e coleta de esgoto até 2033, gerando bilhões em contratos para empresas de saneamento, engenharia ambiental e gestão de resíduos.',
    volumen: 'R$20 bilhões/ano em saneamento e meio ambiente',
    tiposContrato: [
      { titulo: 'Tratamento de água e esgoto', descricao: 'Operação de ETAs e ETEs, manutenção de redes e expansão de sistemas de saneamento.' },
      { titulo: 'Gestão de resíduos sólidos', descricao: 'Coleta, transporte, triagem, reciclagem e disposição final de RSU.' },
      { titulo: 'Licenciamento ambiental', descricao: 'EIA/RIMA, PBA, estudos de impacto e acompanhamento do licenciamento de obras.' },
      { titulo: 'Controle ambiental', descricao: 'Monitoramento de qualidade da água, ar e solo; gestão de passivos ambientais.' },
    ],
    vantagens: [
      { titulo: 'Marco legal favorável', descricao: 'A Lei 14.026/2020 criou obrigações de investimento que geram demanda estrutural de longo prazo.' },
      { titulo: 'Tickets elevados', descricao: 'Contratos de saneamento e obras ambientais têm valores significativos.' },
      { titulo: 'Crescimento acelerado', descricao: 'Prazo de 2033 para universalização cria urgência e aumenta o volume de editais.' },
    ],
    statsDestaque: [
      { valor: '+800', label: 'editais de saneamento/mês' },
      { valor: 'R$20 bi', label: 'volume anual de contratos' },
      { valor: '2033', label: 'meta de universalização do saneamento' },
    ],
    faqs: [
      {
        pergunta: 'Empresa de engenharia ambiental pode participar de licitações de saneamento?',
        resposta: 'Sim. Engenheiros ambientais com CREA e empresas especializadas participam de licitações de licenciamento, estudos e consultoria ambiental. Para operação de sistemas, é necessário habilitação técnica específica.',
      },
      {
        pergunta: 'O que mudou com o Marco Legal do Saneamento?',
        resposta: 'A Lei 14.026/2020 abriu o saneamento para a iniciativa privada via concessão, estabeleceu metas de universalização e criou regras mais rígidas para os contratos. Isso ampliou o mercado e atraiu novos players.',
      },
      {
        pergunta: 'Empresa de coleta de lixo pode participar de licitações de aterro sanitário?',
        resposta: 'Depende do edital. Coleta e disposição final são atividades diferentes. Alguns municípios licitam juntas (coleta + disposição), outros separadamente. Verifique se a empresa tem licença ambiental para operação de aterro.',
      },
      {
        pergunta: 'Como funciona o licenciamento ambiental terceirizado via licitação?',
        resposta: 'O órgão contrata empresa de consultoria ambiental para conduzir o processo de licenciamento junto ao IBAMA, OEMAS e municípios. A empresa elabora os estudos, coordena audiências públicas e acompanha a obtenção das licenças.',
      },
      {
        pergunta: 'Como monitorar licitações de saneamento e meio ambiente?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "saneamento", "resíduos sólidos", "tratamento de esgoto", "licenciamento ambiental" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'jardinagem-paisagismo',
    titulo: 'Licitações de Jardinagem e Paisagismo',
    subtitulo: 'Manutenção de praças, parques e áreas verdes públicas',
    descricaoMeta:
      'Monitore licitações de jardinagem, paisagismo, manutenção de praças, parques e áreas verdes, poda de árvores e roçagem em vias públicas para prefeituras e órgãos públicos.',
    keywords: [
      'licitações jardinagem', 'licitações paisagismo', 'licitações manutenção de praças',
      'licitações poda de árvores', 'licitações roçagem', 'editais jardinagem prefeitura',
      'licitações áreas verdes', 'pregão jardinagem',
    ],
    cnaes: ['81.30'],
    intro:
      'Todo município tem parques, praças, canteiros e áreas verdes que precisam de manutenção contínua. Jardinagem e paisagismo para o setor público é um mercado recorrente com alta distribuição geográfica — há editais em todos os municípios brasileiros, do interior à capital.',
    volumen: 'R$1,5 bilhão/ano em jardinagem pública',
    tiposContrato: [
      { titulo: 'Manutenção de praças e parques', descricao: 'Corte de grama, capina, limpeza, irrigação e cuidado geral de áreas verdes urbanas.' },
      { titulo: 'Poda de árvores', descricao: 'Poda preventiva, emergencial e remoção de árvores em risco nas vias públicas.' },
      { titulo: 'Roçagem de vias', descricao: 'Limpeza de terrenos baldios, margens de estradas, acostamentos e faixas de domínio.' },
      { titulo: 'Paisagismo e implantação', descricao: 'Projeto e implantação de jardins em novos espaços públicos, praças e rotatórias.' },
    ],
    vantagens: [
      { titulo: 'Presença em todos os municípios', descricao: 'Qualquer cidade tem áreas verdes a manter — o mercado está distribuído por todo o Brasil.' },
      { titulo: 'Baixa barreira de entrada', descricao: 'Empresa com equipamentos de jardinagem e equipe treinada pode começar a participar.' },
      { titulo: 'Contratos contínuos', descricao: 'Manutenção de praças é serviço mensal recorrente, com contratos de 12 a 24 meses.' },
    ],
    statsDestaque: [
      { valor: '+2 mil', label: 'editais de jardinagem/mês' },
      { valor: 'R$1,5 bi', label: 'volume anual de contratos' },
      { valor: '5.570', label: 'municípios com áreas verdes públicas' },
    ],
    faqs: [
      {
        pergunta: 'Empresa de jardinagem precisa de CREA ou CAU para participar de licitações?',
        resposta: 'Para serviços simples de manutenção (corte de grama, capina, roçagem), geralmente não. Para projetos de paisagismo ou remoção de árvores de grande porte, pode ser exigido responsável técnico com registro no CREA (engenheiro agrônomo ou florestal) ou CAU (arquiteto paisagista).',
      },
      {
        pergunta: 'O que é roçagem e como é licitada?',
        resposta: 'Roçagem é o corte mecanizado da vegetação rasteira em faixas de domínio, acostamentos e terrenos. Geralmente é licitada por km² ou m², com frequência definida (mensal, bimestral) e equipamento mínimo especificado no edital.',
      },
      {
        pergunta: 'Poda de árvores pode ser feita por qualquer empresa de jardinagem?',
        resposta: 'Não necessariamente. Para remoção e poda de árvores de grande porte em vias públicas, muitas prefeituras exigem responsável técnico habilitado (engenheiro florestal ou agrônomo) e equipe com treinamento específico em segurança.',
      },
      {
        pergunta: 'Empresa de pequeno porte tem vantagem em licitações de jardinagem?',
        resposta: 'Sim. Para contratos de menor valor, há cota reservada para ME e EPP. Empresas locais têm vantagem logística e são preferidas por órgãos que valorizam atendimento rápido e presença regional.',
      },
      {
        pergunta: 'Como monitorar licitações de jardinagem e paisagismo?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "jardinagem", "paisagismo", "roçagem", "poda de árvores" ou "manutenção de praças" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'energia-eficiencia-energetica',
    titulo: 'Licitações de Energia e Eficiência Energética',
    subtitulo: 'Energia solar, eficiência energética e gestão de energia para prédios públicos',
    descricaoMeta:
      'Monitore licitações de energia solar fotovoltaica, eficiência energética, iluminação pública LED e gestão energética para órgãos públicos em todo o Brasil.',
    keywords: [
      'licitações energia solar', 'licitações energia fotovoltaica', 'licitações eficiência energética',
      'licitações iluminação pública LED', 'editais energia solar prefeitura',
      'licitações painéis solares', 'licitações PPP energia',
    ],
    cnaes: ['35.11', '35.12', '71.12', '43.21'],
    intro:
      'O programa federal de eficiência energética e a queda nos custos de energia solar criaram um mercado crescente de contratos públicos no setor. Prefeituras instalam painéis solares em escolas e hospitais, modernizam a iluminação pública com LED e contratam gestão energética para reduzir a conta de luz.',
    volumen: 'R$5 bilhões/ano em energia e eficiência pública',
    tiposContrato: [
      { titulo: 'Instalação fotovoltaica', descricao: 'Painéis solares em escolas, postos de saúde, prédios públicos e estacionamentos.' },
      { titulo: 'Iluminação pública LED', descricao: 'Substituição de luminárias convencionais por LED em vias, praças e avenidas.' },
      { titulo: 'Gestão e auditoria energética', descricao: 'Diagnóstico de consumo, projetos de eficiência e monitoramento de energia.' },
      { titulo: 'PPP de iluminação', descricao: 'Parcerias Público-Privadas para modernização e gestão da iluminação pública municipal.' },
    ],
    vantagens: [
      { titulo: 'Mercado em expansão acelerada', descricao: 'A transição energética pública está apenas começando — há décadas de demanda pela frente.' },
      { titulo: 'Incentivos e financiamentos', descricao: 'BNDES, BID e Banco Mundial financiam projetos de eficiência energética no setor público.' },
      { titulo: 'ROI mensurável', descricao: 'Prefeituras aprovam projetos de eficiência porque a economia na conta de luz paga o investimento.' },
    ],
    statsDestaque: [
      { valor: '+400', label: 'editais de energia/mês' },
      { valor: 'R$5 bi', label: 'volume anual de contratos' },
      { valor: '60%', label: 'redução típica na conta de iluminação com LED' },
    ],
    faqs: [
      {
        pergunta: 'Empresa de energia solar precisa de CREA para participar de licitações?',
        resposta: 'Sim. A instalação de sistemas fotovoltaicos exige responsável técnico com registro no CREA (engenheiro eletricista). A empresa deve também ter profissional habilitado pela distribuidora de energia local.',
      },
      {
        pergunta: 'O que é uma PPP de iluminação pública?',
        resposta: 'É um contrato de Parceria Público-Privada em que a empresa privada substitui toda a iluminação da cidade por LED, mantém o sistema e é remunerada pela economia gerada ou por tarifa mensal, por 15 a 30 anos.',
      },
      {
        pergunta: 'Como funciona o financiamento de projetos fotovoltaicos em escolas?',
        resposta: 'Municípios usam recursos do BNDES, BID ou FNDE para financiar a instalação. A licitação é para escolher o fornecedor/instalador. Em alguns casos, usa-se PPP ou leasing de equipamentos com pagamento via economia de energia.',
      },
      {
        pergunta: 'Empresa de iluminação LED pode participar sem ser fabricante?',
        resposta: 'Sim. Distribuidores e integradores participam normalmente, desde que os produtos atendam às especificações técnicas (INMETRO, PROCEL) e a empresa comprove capacidade de instalação e manutenção.',
      },
      {
        pergunta: 'Como monitorar licitações de energia solar e eficiência energética?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "energia solar", "fotovoltaico", "LED", "iluminação pública", "eficiência energética" para receber novos editais automaticamente.',
      },
    ],
  },
  {
    slug: 'equipamentos-laboratorio',
    titulo: 'Licitações de Equipamentos de Laboratório',
    subtitulo: 'Equipamentos analíticos, reagentes e materiais para laboratórios públicos',
    descricaoMeta:
      'Monitore licitações de equipamentos de laboratório, reagentes, materiais de análise, instrumentação científica e equipamentos para laboratórios de saúde e pesquisa públicos.',
    keywords: [
      'licitações equipamentos laboratório', 'licitações reagentes', 'licitações instrumentação',
      'licitações materiais laboratoriais', 'editais laboratório prefeitura',
      'licitações equipamentos analíticos', 'pregão laboratório',
    ],
    cnaes: ['26.51', '26.52', '46.45', '72.10'],
    intro:
      'Laboratórios de saúde pública, institutos de pesquisa, universidades federais e laboratórios de controle ambiental contratam regularmente equipamentos, reagentes e materiais laboratoriais. O segmento tem alta especialização, o que reduz a concorrência e mantém margens atrativas para fornecedores qualificados.',
    volumen: 'R$3 bilhões/ano em equipamentos laboratoriais',
    tiposContrato: [
      { titulo: 'Equipamentos analíticos', descricao: 'Microscópios, espectrofotômetros, cromatógrafos, PCR e equipamentos de diagnóstico.' },
      { titulo: 'Reagentes e insumos', descricao: 'Reagentes químicos, meios de cultura, kits de diagnóstico e insumos para análises.' },
      { titulo: 'Equipamentos de biossegurança', descricao: 'Capelas de fluxo laminar, autoclaves, câmaras frias e EPIs laboratoriais.' },
      { titulo: 'Calibração e manutenção', descricao: 'Calibração de equipamentos de medição e manutenção preventiva/corretiva de instrumentação.' },
    ],
    vantagens: [
      { titulo: 'Alta especialização', descricao: 'Poucos fornecedores qualificados — menor concorrência e margens mais altas.' },
      { titulo: 'Demanda constante', descricao: 'Reagentes e insumos são consumidos continuamente e precisam de reposição periódica.' },
      { titulo: 'Vínculo técnico', descricao: 'Uma vez instalado o equipamento, o laboratório tende a continuar comprando do mesmo fornecedor.' },
    ],
    statsDestaque: [
      { valor: '+600', label: 'editais de laboratório/mês' },
      { valor: 'R$3 bi', label: 'volume anual de contratos' },
      { valor: '12 meses', label: 'ata de registro de preços para reagentes' },
    ],
    faqs: [
      {
        pergunta: 'Importadora pode participar de licitações de equipamentos laboratoriais?',
        resposta: 'Sim, desde que o equipamento tenha registro na ANVISA (quando necessário), INMETRO e documentação de importação regularizada. Importadoras autorizadas pelos fabricantes participam normalmente.',
      },
      {
        pergunta: 'O que é o Registro ANVISA e quando é obrigatório?',
        resposta: 'Equipamentos de diagnóstico in vitro, reagentes para diagnóstico e equipamentos médicos precisam de registro ou notificação na ANVISA antes de serem comercializados ou importados. É frequentemente exigido em editais de saúde.',
      },
      {
        pergunta: 'Como funciona a calibração de equipamentos em contratos públicos?',
        resposta: 'O edital geralmente exige certificado de calibração rastreável à RBC (Rede Brasileira de Calibração) para equipamentos de medição. A calibração é renovada anualmente e o fornecedor pode ser contratado para prestá-la.',
      },
      {
        pergunta: 'Assistência técnica pode ser licitada junto com o equipamento?',
        resposta: 'Sim. Muitos editais incluem garantia estendida e contrato de assistência técnica no objeto da licitação. O fornecedor precisa comprovar capacidade de atendimento técnico no território do órgão contratante.',
      },
      {
        pergunta: 'Como encontrar licitações de equipamentos de laboratório?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "equipamentos de laboratório", "reagentes", "instrumentação laboratorial" ou o nome do equipamento específico para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'agronegocio-insumos',
    titulo: 'Licitações para Agronegócio e Insumos Agrícolas',
    subtitulo: 'Sementes, defensivos, implementos e assistência técnica rural para o setor público',
    descricaoMeta:
      'Monitore licitações de insumos agrícolas, sementes, defensivos, implementos, máquinas agrícolas e assistência técnica rural para secretarias de agricultura e ATER públicas.',
    keywords: [
      'licitações agronegócio', 'licitações insumos agrícolas', 'licitações sementes',
      'licitações defensivos agrícolas', 'licitações máquinas agrícolas',
      'editais agricultura prefeitura', 'licitações implementos agrícolas', 'licitações ATER',
    ],
    cnaes: ['01.11', '01.13', '46.83', '46.21', '28.33'],
    intro:
      'Secretarias municipais de agricultura, ATER (Assistência Técnica e Extensão Rural), cooperativas públicas e programas de apoio ao produtor rural compram sementes, defensivos, implementos e máquinas via licitação. Municípios agrícolas têm alta demanda por esses insumos para programas de distribuição aos agricultores familiares.',
    volumen: 'R$4 bilhões/ano em insumos agrícolas públicos',
    tiposContrato: [
      { titulo: 'Sementes e mudas', descricao: 'Sementes certificadas, mudas frutíferas e material propagativo para distribuição a produtores.' },
      { titulo: 'Defensivos e fertilizantes', descricao: 'Agroquímicos, fertilizantes e corretivos de solo para programas agrícolas municipais.' },
      { titulo: 'Máquinas e implementos', descricao: 'Tratores, colheitadeiras, roçadeiras, grades e implementos para uso comunitário.' },
      { titulo: 'Assistência técnica rural', descricao: 'Serviços de extensão rural, consultoria agronômica e capacitação de produtores.' },
    ],
    vantagens: [
      { titulo: 'Alta demanda em municípios rurais', descricao: 'Municípios com perfil agrícola têm demanda elevada por insumos e máquinas agrícolas.' },
      { titulo: 'Sazonalidade previsível', descricao: 'Licitações seguem o calendário agrícola — é possível planejar antecipadamente a participação.' },
      { titulo: 'Programas federais como motor', descricao: 'Recursos do PAA, PNAE e programas estaduais aumentam as compras municipais de insumos.' },
    ],
    statsDestaque: [
      { valor: '+1 mil', label: 'editais de agro/mês' },
      { valor: 'R$4 bi', label: 'volume anual de contratos' },
      { valor: '70%', label: 'municípios com atividade agropecuária' },
    ],
    faqs: [
      {
        pergunta: 'Distribuidora de defensivos pode participar de licitações sem ser fabricante?',
        resposta: 'Sim. Distribuidoras com CNPJ, alvará sanitário para comercialização de agroquímicos e defensivos registrados no MAPA participam normalmente. Não é exigido que o licitante seja o fabricante.',
      },
      {
        pergunta: 'Engenheiro agrônomo pode participar de licitações de assistência técnica?',
        resposta: 'Sim. Profissional autônomo com CREA ativo pode participar de licitações de ATER em municípios menores. Para contratos maiores, geralmente é exigido CNPJ de empresa de consultoria agronômica.',
      },
      {
        pergunta: 'O que é o PAA e como gera oportunidades?',
        resposta: 'O Programa de Aquisição de Alimentos compra da agricultura familiar sem licitação (via chamada pública). Mas os insumos e máquinas para apoiar os beneficiários do PAA são licitados pelas prefeituras.',
      },
      {
        pergunta: 'Como funciona a licitação de máquinas agrícolas?',
        resposta: 'Geralmente via pregão eletrônico, com especificações técnicas de potência, capacidade e marca de referência (com "ou equivalente"). O prazo de entrega é crítico — máquinas devem chegar antes do período de plantio.',
      },
      {
        pergunta: 'Como monitorar licitações de insumos agrícolas em todo o Brasil?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "insumos agrícolas", "sementes", "defensivos", "implementos agrícolas" ou "máquinas agrícolas" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'odontologia-saude-bucal',
    titulo: 'Licitações de Odontologia e Saúde Bucal',
    subtitulo: 'Equipamentos odontológicos, materiais dentários e serviços para o SUS',
    descricaoMeta:
      'Monitore licitações de equipamentos odontológicos, materiais dentários, serviços de saúde bucal e unidades móveis odontológicas para o SUS e prefeituras.',
    keywords: [
      'licitações odontologia', 'licitações saúde bucal', 'licitações equipamentos odontológicos',
      'licitações materiais dentários', 'licitações unidade odontológica móvel',
      'editais odontologia prefeitura', 'licitações SUS odontologia',
    ],
    cnaes: ['32.50', '46.45', '86.30'],
    intro:
      'O Brasil Sorridente e os serviços de saúde bucal do SUS geram demanda constante por equipamentos, materiais e serviços odontológicos. Prefeituras equipam UBSs, CEOs e unidades móveis com materiais dentários e equipamentos comprados via licitação.',
    volumen: 'R$1,8 bilhão/ano em odontologia pública',
    tiposContrato: [
      { titulo: 'Equipamentos odontológicos', descricao: 'Cadeiras, equipo, fotopolimerizador, ultrassom, autoclave e instrumentais.' },
      { titulo: 'Materiais e insumos', descricao: 'Amálgamas, resinas, anestésicos, luvas, máscaras, sugadores e materiais de consumo.' },
      { titulo: 'Unidades odontológicas móveis', descricao: 'Ônibus ou trailers equipados para atendimento odontológico em locais remotos.' },
      { titulo: 'Próteses dentárias', descricao: 'Confecção de próteses totais e parciais para pacientes do SUS via laboratórios credenciados.' },
    ],
    vantagens: [
      { titulo: 'Programa permanente', descricao: 'O Brasil Sorridente é uma política de Estado — a demanda por saúde bucal no SUS é estrutural.' },
      { titulo: 'Alta frequência de insumos', descricao: 'Materiais dentários são consumíveis — comprados mensalmente ou trimestralmente.' },
      { titulo: 'Mercado especializado', descricao: 'Distribuidores especializados competem com vantagem sobre fornecedores generalistas.' },
    ],
    statsDestaque: [
      { valor: '+500', label: 'editais de odontologia/mês' },
      { valor: 'R$1,8 bi', label: 'volume anual de contratos' },
      { valor: '5 mil+', label: 'CEOs (Centros de Especialidades) pelo Brasil' },
    ],
    faqs: [
      {
        pergunta: 'Distribuidora de materiais odontológicos precisa de registro na ANVISA?',
        resposta: 'Sim. Materiais e equipamentos odontológicos são produtos de saúde regulados pela ANVISA. A distribuidora precisa de Autorização de Funcionamento de Empresa (AFE) da ANVISA para comercializar esses produtos.',
      },
      {
        pergunta: 'O que é CEO e quais licitações ele gera?',
        resposta: 'CEO é o Centro de Especialidades Odontológicas — unidade do SUS para tratamentos especializados. CEOs compram equipamentos de maior complexidade (radiografia panorâmica, laser, implantes) e materiais para procedimentos especializados.',
      },
      {
        pergunta: 'Como funciona a licitação de próteses dentárias para o SUS?',
        resposta: 'As prefeituras credenciam ou licitam laboratórios de próteses para confecção de próteses totais e parciais para pacientes do SUS. A remuneração é tabelada pelo Ministério da Saúde e o credenciamento é permanente enquanto houver demanda.',
      },
      {
        pergunta: 'Empresa de equipamentos odontológicos pode vender para municípios de outros estados?',
        resposta: 'Sim. Pregões eletrônicos permitem participação nacional. A empresa deve garantir assistência técnica no local ou em prazo razoável definido no edital.',
      },
      {
        pergunta: 'Como monitorar licitações de odontologia e saúde bucal?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "odontologia", "saúde bucal", "equipamentos odontológicos", "materiais dentários" para receber novos editais por e-mail.',
      },
    ],
  },
  {
    slug: 'fotografia-audiovisual',
    titulo: 'Licitações de Fotografia e Audiovisual',
    subtitulo: 'Cobertura fotográfica, produção de vídeos e transmissão ao vivo para o setor público',
    descricaoMeta:
      'Monitore licitações de fotografia, filmagem, produção audiovisual, transmissão ao vivo e cobertura de eventos para órgãos públicos em todo o Brasil.',
    keywords: [
      'licitações fotografia', 'licitações audiovisual', 'licitações filmagem',
      'licitações produção de vídeo', 'licitações cobertura fotográfica',
      'editais fotografia prefeitura', 'licitações transmissão ao vivo',
    ],
    cnaes: ['74.20', '60.21', '59.11', '59.12'],
    intro:
      'Órgãos públicos realizam centenas de eventos por ano — solenidades, inaugurações, campanhas de saúde, eventos culturais — e precisam de cobertura fotográfica, filmagem e produção de conteúdo audiovisual. Fotógrafos e produtoras com CNPJ têm acesso a um mercado constante e geograficamente distribuído.',
    volumen: 'R$500 milhões/ano em serviços audiovisuais públicos',
    tiposContrato: [
      { titulo: 'Cobertura fotográfica', descricao: 'Fotografias de eventos oficiais, solenidades, inaugurações e campanhas institucionais.' },
      { titulo: 'Produção de vídeo', descricao: 'Vídeos institucionais, documentários, spots para TV e conteúdo para redes sociais.' },
      { titulo: 'Transmissão ao vivo', descricao: 'Streaming de sessões legislativas, audiências públicas e eventos governamentais.' },
      { titulo: 'Drone e fotografia aérea', descricao: 'Imagens aéreas de obras, perímetros urbanos e monitoramento territorial.' },
    ],
    vantagens: [
      { titulo: 'Baixa barreira de entrada', descricao: 'Fotógrafo com equipamento próprio e CNPJ pode participar de licitações municipais.' },
      { titulo: 'Alta frequência', descricao: 'Prefeituras têm eventos todos os meses e precisam de cobertura contínua.' },
      { titulo: 'Contratos anuais possíveis', descricao: 'Contratos de cobertura fotográfica anual (por cachê mensal) são uma alternativa à contratação por evento.' },
    ],
    statsDestaque: [
      { valor: '+400', label: 'editais audiovisuais/mês' },
      { valor: 'R$500 mi', label: 'volume anual de contratos' },
      { valor: '12 meses', label: 'duração de contrato de cobertura anual' },
    ],
    faqs: [
      {
        pergunta: 'Fotógrafo autônomo pode participar de licitações?',
        resposta: 'Para contratos de menor valor, sim, como pessoa física. Para contratos mais expressivos, é recomendável ter CNPJ de MEI ou empresa de fotografia para facilitar a emissão de nota fiscal e participação formal no processo licitatório.',
      },
      {
        pergunta: 'Operador de drone precisa de autorização para trabalhar em licitações?',
        resposta: 'Sim. O piloto de drone deve ter habilitação ANAC (para drones acima de 250g) e o equipamento deve estar registrado no SISANT. Alguns municípios exigem seguro de responsabilidade civil para o drone.',
      },
      {
        pergunta: 'Como funciona o contrato de cobertura fotográfica anual?',
        resposta: 'O órgão contrata o fotógrafo por um valor mensal fixo, com obrigação de cobrir todos os eventos oficiais do mês. As imagens ficam de propriedade do órgão para uso institucional sem restrições.',
      },
      {
        pergunta: 'Produtora de vídeo pode participar de licitação de transmissão ao vivo?',
        resposta: 'Sim. Câmaras municipais e assembleias contratam transmissão ao vivo de sessões. A licitação avalia equipamentos, largura de banda, qualidade de streaming e experiência anterior comprovada.',
      },
      {
        pergunta: 'Como encontrar licitações de fotografia e audiovisual?',
        resposta: 'Configure alertas no Monitor de Licitações com palavras como "fotografia", "filmagem", "audiovisual", "produção de vídeo" ou "transmissão ao vivo" para receber novos editais por e-mail.',
      },
    ],
  },
]

export const SEGMENTOS_MAP: Record<string, SegmentoData> = Object.fromEntries(
  SEGMENTOS.map(s => [s.slug, s])
)
