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
      { titulo: 'Treinamentos obrigatórios', descricao: 'NR's (segurança do trabalho), primeiros socorros, reciclagem de habilitação e CIPA.' },
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
]

export const SEGMENTOS_MAP: Record<string, SegmentoData> = Object.fromEntries(
  SEGMENTOS.map(s => [s.slug, s])
)
