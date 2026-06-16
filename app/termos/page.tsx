import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso — Monitor de Licitações',
  description: 'Termos e condições de uso da plataforma Monitor de Licitações.',
}

const EMPRESA_NOME        = 'Matutta Soluções Digitais'
const EMPRESA_CNPJ        = '[CNPJ em processo de registro]'
const EMPRESA_SEDE_CIDADE = 'Belo Horizonte/MG'
const CONTATO_EMAIL       = 'contato@monitordelicitacoes.com.br'

export default function TermosPage() {
  const ultimaAtualizacao = '16 de junho de 2026'

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans">

      {/* Header */}
      <header className="bg-[#1A1A1C] border-b border-[rgba(201,166,90,0.15)] px-5 md:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-[11px] shrink-0">ML</div>
          <span className="text-white font-semibold text-[15px]">Monitor de Licitações</span>
        </Link>
        <div className="flex gap-5 flex-wrap">
          <Link href="/privacidade" className="text-[rgba(255,255,255,0.5)] text-sm no-underline">Política de Privacidade</Link>
          <Link href="/assinar" className="text-[rgba(255,255,255,0.5)] text-sm no-underline">Planos</Link>
          <Link href="/login" className="text-[#C9A65A] text-sm font-semibold no-underline">Entrar →</Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-[800px] mx-auto px-5 md:px-6 py-10 md:py-14 pb-16">

        {/* Título */}
        <div className="mb-8">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#C9A65A] mb-3.5">Contrato de serviço</div>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-[#1A1A1C] mb-3.5 tracking-tight leading-tight">Termos de Uso</h1>
          <p className="text-[15px] text-[#9AA0A6] mb-5 leading-relaxed max-w-[560px]">
            Este documento regula a relação entre o usuário e o Monitor de Licitações. Leia com atenção antes de criar sua conta ou utilizar o serviço.
          </p>
          <div className="inline-flex items-center gap-2 bg-white border border-[#D5D2C8] rounded-lg px-3.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0 inline-block" />
            <span className="text-xs text-[#4a4a4d]">Última atualização: {ultimaAtualizacao}</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-3xl border border-[#D5D2C8] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)]">

          {/* Sumário */}
          <div className="bg-[#FAF6F0] border-b border-[#EBE7E0] px-6 md:px-10 py-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AA0A6] mb-3.5">Nestes termos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                '1. Identificação das partes','2. Aceitação e vigência','3. Descrição do serviço',
                '4. Cadastro e conta','5. Período de teste gratuito','6. Planos e pagamento',
                '7. Cancelamento e reembolso','8. Obrigações do usuário','9. Uso aceitável',
                '9a. Diretório de Fornecedores',
                '10. Propriedade intelectual','11. Disponibilidade e SLA','12. Limitação de responsabilidade',
                '13. Privacidade e dados','14. Alterações nos termos','15. Rescisão','16. Disposições gerais',
              ].map(item => (
                <span key={item} className="text-xs text-[#6B7280] flex items-center gap-1.5">
                  <span className="text-[#C9A65A] font-bold text-[10px]">›</span> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Seções */}
          <div className="px-6 md:px-10 py-7">

            <Section titulo="1. Identificação das partes">
              <InfoBox>
                <InfoRow label="Prestador">Monitor de Licitações — plataforma operada por {EMPRESA_NOME}</InfoRow>
                <InfoRow label="CNPJ">{EMPRESA_CNPJ}</InfoRow>
                <InfoRow label="Contato">{CONTATO_EMAIL}</InfoRow>
                <InfoRow label="Usuário">Pessoa física ou jurídica que aceita estes termos ao criar uma conta</InfoRow>
              </InfoBox>
              <p>Ao criar uma conta, o usuário reconhece que leu, entendeu e concorda integralmente com estes Termos de Uso e com a <Link href="/privacidade" className="text-[#6B0F1A] font-semibold no-underline">Política de Privacidade</Link>.</p>
            </Section>

            <Section titulo="2. Aceitação e vigência">
              <p>A aceitação destes termos ocorre no momento do cadastro, ao clicar em <strong>&ldquo;Criar conta gratuita&rdquo;</strong>. O contrato entra em vigor imediatamente e permanece ativo enquanto o usuário mantiver uma conta cadastrada.</p>
              <p>Caso não concorde com qualquer disposição, o usuário não deve criar conta nem utilizar o serviço.</p>
            </Section>

            <Section titulo="3. Descrição do serviço">
              <p>O <strong>Monitor de Licitações</strong> é uma plataforma que oferece:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 mb-4">
                {[
                  { icon: '🔍', titulo: 'Coleta automatizada', desc: 'Editais coletados diariamente de portais e diários oficiais do governo federal, estados e municípios' },
                  { icon: '📊', titulo: 'Análise de oportunidades', desc: 'Identificação de licitações relevantes com base no perfil de monitoramento cadastrado pelo usuário' },
                  { icon: '📬', titulo: 'Alertas personalizados', desc: 'Notificações por e-mail, Telegram e WhatsApp com as licitações que correspondem ao seu perfil' },
                  { icon: '🔎', titulo: 'Painel de gestão', desc: 'Dashboard completo para visualização, busca e acompanhamento de licitações' },
                  { icon: '🏭', titulo: 'Diretório de Fornecedores', desc: 'Espaço opcional para o usuário cadastrar o perfil de sua empresa e ser encontrado por outros usuários da plataforma para fins de negociação e parceria comercial' },
                  { icon: '🎯', titulo: 'Radar de Inteligência', desc: 'Ferramenta de análise avançada disponível nos planos Profissional, Gestão e Empresarial' },
                ].map(({ icon, titulo, desc }) => (
                  <div key={titulo} className="bg-[#FAF6F0] rounded-xl p-3.5 border border-[#EBE7E0]">
                    <div className="text-lg mb-1.5">{icon}</div>
                    <div className="text-[13px] font-bold text-[#1A1A1C] mb-1">{titulo}</div>
                    <div className="text-xs text-[#6B7280] leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
              <Aviso tipo="info">
                O serviço fornece informações de monitoramento e <strong>não garante a identificação de 100% das licitações publicadas</strong>. Os dados são coletados de fontes governamentais públicas — o Monitor de Licitações não é responsável pela precisão ou integridade das informações publicadas pelos órgãos licitantes.
              </Aviso>
            </Section>

            <Section titulo="4. Cadastro e conta">
              <ul>
                <li>O usuário deve ter pelo menos <strong>18 anos</strong> e capacidade legal para contratar.</li>
                <li>As informações de cadastro devem ser <strong>verdadeiras, completas e atualizadas</strong>.</li>
                <li>O usuário é integralmente responsável pela <strong>confidencialidade de suas credenciais</strong> e por todas as atividades realizadas em sua conta.</li>
                <li>Cada conta é pessoal e intransferível, salvo nos planos que preveem múltiplos usuários.</li>
                <li>O usuário deve <strong>notificar imediatamente</strong> o suporte em caso de uso suspeito ou não autorizado da conta.</li>
                <li>Cada endereço de e-mail pode ser utilizado para <strong>uma única conta</strong>.</li>
              </ul>
            </Section>

            <Section titulo="5. Período de teste gratuito">
              <Tabela colunas={['Item', 'Condição']}>
                <tr><Td>Duração</Td><Td>7 (sete) dias corridos a partir da data de criação da conta</Td></tr>
                <tr><Td>Requisito</Td><Td>Não é necessário cartão de crédito para iniciar o teste</Td></tr>
                <tr><Td>Acesso</Td><Td>Funcionalidades completas do plano Basic durante o período</Td></tr>
                <tr><Td>Encerramento</Td><Td>Ao término, o acesso é suspenso automaticamente até contratação de plano pago</Td></tr>
                <tr><Td>Elegibilidade</Td><Td>Uma vez por cadastro, não renovável</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="6. Planos e pagamento">
              <p>Os planos disponíveis, com suas funcionalidades e preços, estão descritos na <Link href="/assinar" className="text-[#6B0F1A] font-semibold no-underline">página de planos</Link>.</p>
              <SubTitulo>6.1 Plano mensal</SubTitulo>
              <Tabela colunas={['Tema', 'Condição']}>
                <tr><Td>Periodicidade</Td><Td>Cobrança mensal recorrente, processada automaticamente pela plataforma de pagamentos parceira</Td></tr>
                <tr><Td>Renovação</Td><Td>Automática na mesma data do mês. Renova até cancelamento expresso</Td></tr>
                <tr><Td>Upgrade de plano</Td><Td>Possível a qualquer momento. É cobrado imediatamente o valor proporcional aos dias restantes do ciclo atual (diferença entre os planos). A partir do próximo ciclo, a cobrança passa a ser o valor integral do novo plano</Td></tr>
                <tr><Td>Downgrade de plano</Td><Td>Possível a qualquer momento. O usuário mantém os benefícios (funcionalidades e limites) do plano atual até o fim do ciclo já pago. O novo valor e os novos limites são aplicados no ciclo seguinte</Td></tr>
                <tr><Td>Reajuste de preços</Td><Td>Com aviso prévio de 30 dias por e-mail. Não se aplica ao ciclo em curso</Td></tr>
                <tr><Td>Inadimplência</Td><Td>Após 3 tentativas de cobrança sem sucesso, o acesso é suspenso</Td></tr>
                <tr><Td>Dados de pagamento</Td><Td>Processados exclusivamente pela plataforma de pagamentos parceira. Não armazenamos dados de cartão</Td></tr>
              </Tabela>
              <SubTitulo>6.2 Plano anual</SubTitulo>
              <Tabela colunas={['Tema', 'Condição']}>
                <tr><Td>Periodicidade</Td><Td>Cobrança única correspondente a 12 meses de acesso, processada no ato da contratação</Td></tr>
                <tr><Td>Preço</Td><Td>O valor exibido por mês é referencial — a cobrança é o equivalente anual em parcela única. O preço anual contratado é fixo durante todo o ciclo de 12 meses</Td></tr>
                <tr><Td>Renovação</Td><Td>Automática após 12 meses, com cobrança do valor anual vigente na data da renovação. O usuário será notificado por e-mail com 30 dias de antecedência</Td></tr>
                <tr><Td>Acesso</Td><Td>Permanece ativo durante todo o período de 12 meses, inclusive após eventual pedido de cancelamento antecipado</Td></tr>
                <tr><Td>Upgrade de plano</Td><Td>Possível a qualquer momento. É cobrado imediatamente o valor proporcional aos dias restantes do ciclo anual em curso (diferença entre os planos). A partir do próximo ciclo anual, a cobrança passa a ser o valor integral do novo plano</Td></tr>
                <tr><Td>Downgrade de plano</Td><Td>Possível a qualquer momento. O usuário mantém os benefícios do plano atual até o fim do ciclo anual já pago. O novo valor e os novos limites são aplicados no ciclo seguinte</Td></tr>
                <tr><Td>Reajuste de preços</Td><Td>Aplicável somente na renovação anual. O valor não é alterado durante o ciclo em vigor</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="7. Cancelamento e reembolso">
              <SubTitulo>7.1 Cancelamento</SubTitulo>
              <ul>
                <li>O usuário pode cancelar a assinatura a qualquer momento pelo painel ou por e-mail para {CONTATO_EMAIL}.</li>
                <li>O cancelamento tem efeito ao <strong>final do período já pago</strong> — não há cobrança proporcional ou multa.</li>
                <li>Após o cancelamento, os dados são mantidos por 90 dias e depois excluídos, conforme a <Link href="/privacidade" className="text-[#6B0F1A] no-underline">Política de Privacidade</Link>.</li>
              </ul>
              <SubTitulo>7.2 Cancelamento e reembolso — plano mensal</SubTitulo>
              <ul>
                <li>O usuário pode cancelar a qualquer momento pelo painel ou por e-mail para {CONTATO_EMAIL}.</li>
                <li><strong>Dentro de 7 dias corridos</strong> após a primeira cobrança de um novo plano: reembolso integral disponível mediante solicitação.</li>
                <li><strong>Após 7 dias:</strong> o acesso permanece ativo até o fim do ciclo mensal já pago. Não são realizados reembolsos parciais.</li>
                <li>O período de teste gratuito não gera direito a reembolso (não há cobrança).</li>
                <li>Reembolsos em casos de falha técnica grave do serviço são analisados individualmente.</li>
              </ul>
              <SubTitulo>7.3 Cancelamento e reembolso — plano anual</SubTitulo>
              <ul>
                <li>O usuário pode solicitar o cancelamento a qualquer momento pelo painel ou por e-mail para {CONTATO_EMAIL}.</li>
                <li><strong>Dentro de 7 dias corridos</strong> após a cobrança anual: reembolso integral disponível mediante solicitação.</li>
                <li><strong>Após 7 dias:</strong> o acesso permanece ativo até o fim do ciclo de 12 meses já pago. Não são realizados reembolsos proporcionais ao período não utilizado.</li>
                <li>Não há multa ou penalidade pelo cancelamento antecipado — apenas o encerramento do acesso ao término do ciclo vigente.</li>
              </ul>
            </Section>

            <Section titulo="8. Obrigações do usuário">
              <ul>
                <li>Manter seus dados cadastrais atualizados, especialmente o endereço de e-mail para recebimento de alertas.</li>
                <li>Utilizar o serviço em conformidade com a legislação vigente e estes Termos.</li>
                <li>Verificar as licitações alertadas diretamente nos portais oficiais antes de tomar decisões comerciais.</li>
                <li>Não compartilhar credenciais de acesso com pessoas não autorizadas pelo plano contratado.</li>
              </ul>
            </Section>

            <Section titulo="9. Uso aceitável">
              <p>É <strong>expressamente proibido</strong> utilizar o serviço para:</p>
              <div className="flex flex-col gap-2 mt-3">
                {[
                  'Violar qualquer lei ou regulamentação brasileira aplicável',
                  'Compartilhar credenciais de acesso com terceiros não autorizados pelo plano',
                  'Realizar engenharia reversa, scraping ou extração automatizada dos dados do painel',
                  'Sobrecarregar intencionalmente a infraestrutura da plataforma',
                  'Revender ou sublicenciar o acesso ao serviço sem autorização prévia por escrito',
                  'Utilizar os dados de licitações para fins que violem a lei de licitações (Lei nº 14.133/2021)',
                  'Criar contas fictícias ou fraudulentas para usufruir do período de teste indevidamente',
                  'Cadastrar no Diretório de Fornecedores informações falsas, enganosas ou que violem direitos de terceiros',
                  'Utilizar o Diretório de Fornecedores para envio de comunicações não solicitadas (spam) a outros usuários',
                ].map(item => (
                  <div key={item} className="flex gap-2.5 items-start text-sm text-[#4a4a4d]">
                    <span className="text-[#ef4444] mt-0.5 shrink-0 font-bold">✕</span>
                    {item}
                  </div>
                ))}
              </div>
              <Aviso tipo="atencao">
                O descumprimento das regras de uso aceitável pode resultar na <strong>suspensão ou encerramento imediato da conta</strong>, sem reembolso, a critério exclusivo do Monitor de Licitações.
              </Aviso>
            </Section>

            <Section titulo="9a. Diretório de Fornecedores — regras específicas">
              <p>O Diretório de Fornecedores é uma funcionalidade <strong>opcional</strong> que permite ao usuário cadastrar o perfil público de sua empresa para ser encontrado por outros usuários da plataforma. Ao utilizar o diretório, o usuário declara que:</p>
              <ul>
                <li>As informações inseridas (razão social, CNPJ, descrição, regiões, contato) são <strong>verdadeiras e de sua responsabilidade exclusiva</strong>.</li>
                <li>Tem autorização para divulgar os dados de contato informados.</li>
                <li>Compreende que o perfil ficará visível para todos os usuários com plano que inclua acesso ao diretório.</li>
                <li>Pode ativar ou desativar a visibilidade do perfil a qualquer momento pelo painel.</li>
              </ul>
              <Aviso tipo="info">
                O Monitor de Licitações <strong>não intermedia, garante nem participa</strong> de qualquer negociação, contrato ou transação comercial realizada entre usuários que se contatarem por meio do diretório. Qualquer relação comercial estabelecida é de responsabilidade exclusiva das partes envolvidas.
              </Aviso>
            </Section>

            <Section titulo="10. Propriedade intelectual">
              <p>Todo o conteúdo e tecnologia do Monitor de Licitações são de propriedade exclusiva de <strong>{EMPRESA_NOME}</strong>:</p>
              <ul>
                <li>Código-fonte, algoritmos e metodologia de análise e correspondência</li>
                <li>Design, interface e identidade visual</li>
                <li>Marca &ldquo;Monitor de Licitações&rdquo; e seus elementos associados</li>
                <li>Documentação, textos e materiais de suporte</li>
              </ul>
              <p>Os <strong>dados de licitações</strong> são de domínio público, coletados de portais governamentais oficiais.</p>
              <p>A assinatura concede ao usuário uma <strong>licença de uso não exclusiva, intransferível e revogável</strong> para acesso à plataforma durante o período contratado.</p>
            </Section>

            <Section titulo="11. Disponibilidade e nível de serviço">
              <Tabela colunas={['Aspecto', 'Compromisso']}>
                <tr><Td>Disponibilidade</Td><Td>Melhor esforço para manter o serviço disponível 24/7. Sem garantia de SLA formal no plano atual</Td></tr>
                <tr><Td>Coleta de licitações</Td><Td>Executada em dias úteis. Fontes governamentais podem ter instabilidades fora do controle do serviço</Td></tr>
                <tr><Td>Manutenção programada</Td><Td>Comunicada com antecedência mínima de 24h por e-mail ou aviso no painel</Td></tr>
                <tr><Td>Suporte</Td><Td>Via WhatsApp e e-mail, em dias úteis, das 8h às 18h (horário de Brasília)</Td></tr>
                <tr><Td>Incidentes críticos</Td><Td>Notificação por e-mail em até 4h após identificação</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="12. Limitação de responsabilidade">
              <p>O Monitor de Licitações <strong>não se responsabiliza</strong> por:</p>
              <ul>
                <li>Licitações não identificadas por indisponibilidade ou limitações das fontes oficiais</li>
                <li>Decisões comerciais, participações em certames ou prejuízos decorrentes do uso das informações</li>
                <li>Perda de oportunidade causada por indisponibilidade temporária do serviço</li>
                <li>Imprecisões nos dados publicados pelos órgãos licitantes</li>
                <li>Danos indiretos, incidentais, consequenciais, punitivos ou especiais</li>
                <li>Falhas em serviços de terceiros (e-mail, Telegram, WhatsApp, fontes de dados)</li>
                <li><strong>Negociações, acordos ou transações comerciais</strong> realizadas entre usuários que se encontraram por meio do Diretório de Fornecedores — o Monitor de Licitações atua exclusivamente como plataforma de conexão e não é parte em qualquer relação comercial entre usuários</li>
                <li>Veracidade, completude ou atualidade das informações inseridas pelos usuários no Diretório de Fornecedores</li>
              </ul>
              <Aviso tipo="info">
                A responsabilidade máxima do Monitor de Licitações em qualquer hipótese fica limitada ao <strong>valor total pago pelo usuário nos últimos 3 meses</strong> de assinatura.
              </Aviso>
            </Section>

            <Section titulo="13. Privacidade e proteção de dados">
              <p>O tratamento de dados pessoais dos usuários é regido integralmente pela <Link href="/privacidade" className="text-[#6B0F1A] font-semibold no-underline">Política de Privacidade</Link>, em plena conformidade com a LGPD (Lei nº 13.709/2018).</p>
              <p>Ao aceitar estes Termos, o usuário também declara ciência e concordância com a Política de Privacidade vigente.</p>
            </Section>

            <Section titulo="14. Alterações nos termos">
              <ul>
                <li><strong>Alterações relevantes</strong> (preços, condições de cancelamento, responsabilidades): notificação por e-mail com antecedência mínima de <strong>15 dias</strong>.</li>
                <li><strong>Alterações operacionais</strong> (atualização de fornecedores, correções editoriais): publicação imediata com atualização da data.</li>
                <li>O uso continuado do serviço após a vigência das alterações constitui aceite tácito.</li>
                <li>Caso o usuário não concorde, poderá cancelar a conta sem ônus antes da data de vigência.</li>
              </ul>
            </Section>

            <Section titulo="15. Rescisão">
              <SubTitulo>15.1 Rescisão pelo usuário</SubTitulo>
              <p>O usuário pode encerrar a conta a qualquer momento pelo painel ou por e-mail. O acesso permanece ativo até o término do período já pago.</p>
              <SubTitulo>15.2 Rescisão pelo Monitor de Licitações</SubTitulo>
              <p>Reservamo-nos o direito de suspender ou encerrar contas que:</p>
              <ul>
                <li>Violem estas condições de uso ou a legislação aplicável</li>
                <li>Apresentem inadimplência após 3 tentativas de cobrança</li>
                <li>Utilizem o serviço de forma fraudulenta ou abusiva</li>
              </ul>
              <p>Em caso de encerramento por justa causa, não haverá reembolso. Em caso de encerramento por decisão unilateral sem justa causa, o valor proporcional ao período não usufruído será reembolsado.</p>
            </Section>

            <Section titulo="16. Disposições gerais">
              <Tabela colunas={['Tema', 'Disposição']}>
                <tr><Td>Lei aplicável</Td><Td>Leis da República Federativa do Brasil, com destaque ao CDC (Lei nº 8.078/1990) quando aplicável</Td></tr>
                <tr><Td>Foro</Td><Td>Comarca de {EMPRESA_SEDE_CIDADE}, com renúncia a qualquer outro, por mais privilegiado que seja</Td></tr>
                <tr><Td>Integralidade</Td><Td>Estes termos, em conjunto com a Política de Privacidade, constituem o acordo integral entre as partes</Td></tr>
                <tr><Td>Invalidade parcial</Td><Td>A nulidade de qualquer cláusula não afeta a validade das demais</Td></tr>
                <tr><Td>Não renúncia</Td><Td>A tolerância a descumprimentos pontuais não implica renúncia a direitos futuros</Td></tr>
                <tr><Td>Cessão</Td><Td>O usuário não pode ceder seus direitos sem autorização prévia. O Monitor de Licitações pode ceder em caso de fusão, aquisição ou reestruturação societária</Td></tr>
              </Tabela>
            </Section>

          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/privacidade" className="text-[#6B0F1A] text-sm font-semibold no-underline">Leia também a Política de Privacidade →</Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1C] px-5 py-6 text-center">
        <p className="text-[rgba(255,255,255,0.3)] text-xs m-0">
          © {new Date().getFullYear()} Monitor de Licitações · {EMPRESA_NOME} ·{' '}
          <Link href="/privacidade" className="text-[rgba(255,255,255,0.5)] no-underline">Privacidade</Link>
          {' · '}
          <Link href="/termos" className="text-[rgba(255,255,255,0.5)] no-underline">Termos</Link>
        </p>
      </footer>
    </div>
  )
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-[#F0EDE8] last:border-0 last:mb-0 last:pb-0">
      <h2 className="text-base font-bold text-[#1A1A1C] mb-3 flex items-center gap-2.5">
        <span className="w-1 h-[18px] bg-[#6B0F1A] rounded-sm shrink-0 inline-block" />
        {titulo}
      </h2>
      <div className="text-sm text-[#4a4a4d] leading-[1.85] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-2 [&_ul]:mb-3 [&_li]:mb-1">{children}</div>
    </div>
  )
}

function SubTitulo({ children }: { children: React.ReactNode }) {
  return <p className="font-bold text-[#1A1A1C] text-[13px] mt-4 mb-1.5 uppercase tracking-[0.05em]">{children}</p>
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FAF6F0] border border-[#EBE7E0] rounded-xl px-6 py-5 mb-4">
      <table className="w-full border-collapse"><tbody>{children}</tbody></table>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="text-[12px] font-bold text-[#9AA0A6] uppercase tracking-[0.06em] py-1 pr-4 whitespace-nowrap align-top">{label}</td>
      <td className="text-sm text-[#1A1A1C] py-1 font-medium">{children}</td>
    </tr>
  )
}

function Tabela({ colunas, children }: { colunas: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto my-3 rounded-xl border border-[#EBE7E0]">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#FAF6F0]">
            {colunas.map(col => (
              <th key={col} className="text-left px-4 py-2.5 font-bold text-[#6B7280] text-[11px] uppercase tracking-[0.07em] border-b border-[#EBE7E0] whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2.5 text-[#4a4a4d] border-b border-[#F5F2EE] align-top">{children}</td>
}

function Aviso({ tipo, children }: { tipo: 'info' | 'atencao' | 'destaque'; children: React.ReactNode }) {
  const estilos = {
    info:     'bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)] text-[#1d4ed8]',
    atencao:  'bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)] text-[#b91c1c]',
    destaque: 'bg-[rgba(201,166,90,0.07)] border-[rgba(201,166,90,0.3)] text-[#92610a]',
  }
  return (
    <div className={`border rounded-xl px-4 py-3.5 my-3.5 text-[13px] leading-relaxed ${estilos[tipo]}`}>
      {children}
    </div>
  )
}
