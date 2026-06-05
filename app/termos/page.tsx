import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso — Monitor de Licitações',
  description: 'Termos e condições de uso da plataforma Monitor de Licitações.',
}

// ⚠️ LEMBRETE: Após registro do CNPJ, atualizar os campos marcados com TODO abaixo:
// - EMPRESA_NOME: razão social oficial
// - EMPRESA_CNPJ: número do CNPJ
// - EMPRESA_SEDE_CIDADE: cidade da sede (foro contratual)
// - CONTATO_EMAIL: e-mail oficial de atendimento (ex: contato@seudominio.com.br)

const EMPRESA_NOME        = 'Monitor de Licitações - Matutta'     // TODO: razão social oficial
const EMPRESA_CNPJ        = '[CNPJ em processo de registro]'       // TODO: inserir CNPJ
const EMPRESA_SEDE_CIDADE = 'Belo Horizonte/MG'                    // TODO: confirmar cidade da sede
const CONTATO_EMAIL       = 'contato@monitorlicitacoes.com.br'     // TODO: criar e-mail oficial

export default function TermosPage() {
  const ultimaAtualizacao = '05 de junho de 2026'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#1A1A1C', borderBottom: '1px solid rgba(201,166,90,0.15)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>ML</div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Monitor de Licitações</span>
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Política de Privacidade</Link>
          <Link href="/assinar" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Planos</Link>
          <Link href="/login" style={{ color: '#C9A65A', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Entrar →</Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* Título */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '14px' }}>Contrato de serviço · SaaS</div>
          <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 14px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>Termos de Uso</h1>
          <p style={{ fontSize: '15px', color: '#9AA0A6', margin: '0 0 20px', lineHeight: 1.6, maxWidth: '560px' }}>
            Este documento regula a relação entre o usuário e o Monitor de Licitações. Leia com atenção antes de criar sua conta ou utilizar o serviço.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #D5D2C8', borderRadius: '8px', padding: '8px 14px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: '#4a4a4d' }}>Última atualização: {ultimaAtualizacao}</span>
          </div>
        </div>

        {/* Card principal */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #D5D2C8', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

          {/* Sumário */}
          <div style={{ background: '#FAF6F0', borderBottom: '1px solid #EBE7E0', padding: '28px 40px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9AA0A6', margin: '0 0 14px' }}>Nestes termos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
              {[
                '1. Identificação das partes',
                '2. Aceitação e vigência',
                '3. Descrição do serviço',
                '4. Cadastro e conta',
                '5. Período de teste gratuito',
                '6. Planos e pagamento',
                '7. Cancelamento e reembolso',
                '8. Obrigações do usuário',
                '9. Uso aceitável',
                '10. Propriedade intelectual',
                '11. Disponibilidade e SLA',
                '12. Limitação de responsabilidade',
                '13. Privacidade e dados',
                '14. Alterações nos termos',
                '15. Rescisão',
                '16. Disposições gerais',
              ].map(item => (
                <span key={item} style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#C9A65A', fontWeight: 700, fontSize: '10px' }}>›</span> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Seções */}
          <div style={{ padding: '40px' }}>

            <Section titulo="1. Identificação das partes">
              <InfoBox>
                <InfoRow label="Prestador">Monitor de Licitações — plataforma operada por {EMPRESA_NOME}</InfoRow>
                <InfoRow label="CNPJ">{EMPRESA_CNPJ}</InfoRow>
                <InfoRow label="Contato">{CONTATO_EMAIL}</InfoRow>
                <InfoRow label="Usuário">Pessoa física ou jurídica que aceita estes termos ao criar uma conta</InfoRow>
              </InfoBox>
              <p>Ao criar uma conta, o usuário reconhece que leu, entendeu e concorda integralmente com estes Termos de Uso e com a <Link href="/privacidade" style={{ color: '#6B0F1A', fontWeight: 600 }}>Política de Privacidade</Link>.</p>
            </Section>

            <Section titulo="2. Aceitação e vigência">
              <p>A aceitação destes termos ocorre no momento do cadastro, ao clicar em <strong>"Criar conta gratuita"</strong>. O contrato entra em vigor imediatamente e permanece ativo enquanto o usuário mantiver uma conta cadastrada.</p>
              <p>Caso não concorde com qualquer disposição, o usuário não deve criar conta nem utilizar o serviço.</p>
            </Section>

            <Section titulo="3. Descrição do serviço">
              <p>O <strong>Monitor de Licitações</strong> é uma plataforma SaaS que oferece:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', marginBottom: '16px' }}>
                {[
                  { icon: '🔍', titulo: 'Coleta automatizada', desc: 'Editais coletados diariamente de portais e diários oficiais do governo federal, estados e municípios' },
                  { icon: '🤖', titulo: 'Análise automatizada', desc: 'Identificação de oportunidades relevantes com base no perfil de monitoramento cadastrado pelo usuário' },
                  { icon: '📬', titulo: 'Alertas personalizados', desc: 'Notificações por e-mail e Telegram com as licitações que correspondem ao seu perfil' },
                  { icon: '🔎', titulo: 'Painel de gestão', desc: 'Dashboard completo para visualização, busca e acompanhamento de licitações' },
                ].map(({ icon, titulo, desc }) => (
                  <div key={titulo} style={{ background: '#FAF6F0', borderRadius: '10px', padding: '14px', border: '1px solid #EBE7E0' }}>
                    <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1C', marginBottom: '4px' }}>{titulo}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>{desc}</div>
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
                <tr><Td>Elegibilidade</Td><Td>Uma vez por endereço de e-mail, não renovável</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="6. Planos e pagamento">
              <p>Os planos disponíveis, com suas funcionalidades e preços, estão descritos na <Link href="/assinar" style={{ color: '#6B0F1A', fontWeight: 600 }}>página de planos</Link>.</p>
              <Tabela colunas={['Tema', 'Condição']}>
                <tr><Td>Periodicidade</Td><Td>Cobrança mensal recorrente, processada automaticamente pela plataforma de pagamentos parceira</Td></tr>
                <tr><Td>Renovação</Td><Td>Automática na mesma data do mês. Renova até cancelamento expresso</Td></tr>
                <tr><Td>Alteração de plano</Td><Td>Possível a qualquer momento; o novo valor é aplicado no próximo ciclo</Td></tr>
                <tr><Td>Reajuste de preços</Td><Td>Com aviso prévio de 30 dias por e-mail. Não se aplica ao ciclo em curso</Td></tr>
                <tr><Td>Inadimplência</Td><Td>Após 3 tentativas de cobrança sem sucesso, o acesso é suspenso</Td></tr>
                <tr><Td>Dados de pagamento</Td><Td>Processados exclusivamente pela plataforma de pagamentos parceira, certificada pelos padrões de segurança do setor. Não armazenamos dados de cartão</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="7. Cancelamento e reembolso">
              <SubTitulo>7.1 Cancelamento</SubTitulo>
              <ul>
                <li>O usuário pode cancelar a assinatura a qualquer momento pelo painel do usuário ou por e-mail para {CONTATO_EMAIL}.</li>
                <li>O cancelamento tem efeito ao <strong>final do período já pago</strong> — não há cobrança proporcional ou multa.</li>
                <li>Após o cancelamento, os dados são mantidos por 90 dias e depois excluídos, conforme a <Link href="/privacidade" style={{ color: '#6B0F1A' }}>Política de Privacidade</Link>.</li>
              </ul>
              <SubTitulo>7.2 Reembolso</SubTitulo>
              <Aviso tipo="destaque">
                Garantia de satisfação: reembolso integral disponível em até <strong>7 dias corridos</strong> após a primeira cobrança de um novo plano, mediante solicitação para {CONTATO_EMAIL}. Após esse prazo, não são realizados reembolsos parciais.
              </Aviso>
              <ul>
                <li>O período de teste gratuito não gera direito a reembolso (não há cobrança).</li>
                <li>Reembolsos em casos de falha técnica grave do serviço são analisados individualmente.</li>
              </ul>
            </Section>

            <Section titulo="8. Obrigações do usuário">
              <p>O usuário compromete-se a:</p>
              <ul>
                <li>Manter seus dados cadastrais atualizados, especialmente o endereço de e-mail para recebimento de alertas.</li>
                <li>Utilizar o serviço em conformidade com a legislação vigente e estes Termos.</li>
                <li>Verificar as licitações alertadas diretamente nos portais oficiais antes de tomar decisões comerciais.</li>
                <li>Não compartilhar credenciais de acesso com pessoas não autorizadas pelo plano contratado.</li>
              </ul>
            </Section>

            <Section titulo="9. Uso aceitável">
              <p>É <strong>expressamente proibido</strong> utilizar o serviço para:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '12px' }}>
                {[
                  'Violar qualquer lei ou regulamentação brasileira aplicável',
                  'Compartilhar credenciais de acesso com terceiros não autorizados pelo plano',
                  'Realizar engenharia reversa, scraping ou extração automatizada dos dados do painel',
                  'Sobrecarregar intencionalmente a infraestrutura da plataforma',
                  'Revender ou sublicenciar o acesso ao serviço sem autorização prévia por escrito',
                  'Utilizar os dados de licitações para fins que violem a lei de licitações (Lei nº 14.133/2021)',
                  'Criar contas fictícias ou fraudulentas para usufruir do período de teste indevidamente',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: '#4a4a4d' }}>
                    <span style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0, fontWeight: 700 }}>✕</span>
                    {item}
                  </div>
                ))}
              </div>
              <Aviso tipo="atencao">
                O descumprimento das regras de uso aceitável pode resultar na <strong>suspensão ou encerramento imediato da conta</strong>, sem reembolso, a critério exclusivo do Monitor de Licitações.
              </Aviso>
            </Section>

            <Section titulo="10. Propriedade intelectual">
              <p>Todo o conteúdo e tecnologia do Monitor de Licitações são de propriedade exclusiva de <strong>{EMPRESA_NOME}</strong>:</p>
              <ul>
                <li>Código-fonte, algoritmos e metodologia de análise e correspondência</li>
                <li>Design, interface e identidade visual</li>
                <li>Marca "Monitor de Licitações" e seus elementos associados</li>
                <li>Documentação, textos e materiais de suporte</li>
              </ul>
              <p>Os <strong>dados de licitações</strong> são de domínio público, coletados de portais governamentais oficiais.</p>
              <p>A assinatura concede ao usuário uma <strong>licença de uso não exclusiva, intransferível e revogável</strong> para acesso à plataforma durante o período contratado. Nenhum direito de propriedade intelectual é transferido ao usuário.</p>
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
                <li>Falhas em serviços de terceiros (e-mail, Telegram, fontes de dados)</li>
              </ul>
              <Aviso tipo="info">
                A responsabilidade máxima do Monitor de Licitações em qualquer hipótese fica limitada ao <strong>valor total pago pelo usuário nos últimos 3 meses</strong> de assinatura.
              </Aviso>
            </Section>

            <Section titulo="13. Privacidade e proteção de dados">
              <p>O tratamento de dados pessoais dos usuários é regido integralmente pela <Link href="/privacidade" style={{ color: '#6B0F1A', fontWeight: 600 }}>Política de Privacidade</Link>, em plena conformidade com a LGPD (Lei nº 13.709/2018).</p>
              <p>Ao aceitar estes Termos, o usuário também declara ciência e concordância com a Política de Privacidade vigente.</p>
            </Section>

            <Section titulo="14. Alterações nos termos">
              <ul>
                <li><strong>Alterações relevantes</strong> (preços, condições de cancelamento, responsabilidades): notificação por e-mail com antecedência mínima de <strong>15 dias</strong>.</li>
                <li><strong>Alterações operacionais</strong> (atualização de fornecedores, correções editoriais): publicação imediata com atualização da data.</li>
                <li>O uso continuado do serviço após a vigência das alterações constitui aceite tácito.</li>
                <li>Caso o usuário não concorde com as alterações, poderá cancelar a conta sem ônus antes da data de vigência.</li>
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
              <p>Em caso de encerramento por justa causa, não haverá reembolso. Em caso de encerramento por decisão unilateral do Monitor de Licitações sem justa causa, o valor proporcional ao período não usufruído será reembolsado.</p>
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

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/privacidade" style={{ color: '#6B0F1A', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Leia também a Política de Privacidade →</Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#1A1A1C', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
          © {new Date().getFullYear()} Monitor de Licitações · {EMPRESA_NOME} ·{' '}
          <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacidade</Link>
          {' · '}
          <Link href="/termos" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Termos</Link>
        </p>
      </footer>
    </div>
  )
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid #F0EDE8' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1C', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '4px', height: '18px', background: '#6B0F1A', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }} />
        {titulo}
      </h2>
      <div style={{ fontSize: '14px', color: '#4a4a4d', lineHeight: 1.85 }}>{children}</div>
    </div>
  )
}

function SubTitulo({ children }: { children: React.ReactNode }) {
  return <p style={{ fontWeight: 700, color: '#1A1A1C', fontSize: '13px', marginTop: '20px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</p>
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FAF6F0', border: '1px solid #EBE7E0', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{children}</tbody></table>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ fontSize: '12px', fontWeight: 700, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 16px 4px 0', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}</td>
      <td style={{ fontSize: '14px', color: '#1A1A1C', padding: '4px 0', fontWeight: 500 }}>{children}</td>
    </tr>
  )
}

function Tabela({ colunas, children }: { colunas: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #EBE7E0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#FAF6F0' }}>
            {colunas.map(col => (
              <th key={col} style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid #EBE7E0', whiteSpace: 'nowrap' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '10px 16px', color: '#4a4a4d', borderBottom: '1px solid #F5F2EE', verticalAlign: 'top' }}>{children}</td>
}

function Aviso({ tipo, children }: { tipo: 'info' | 'atencao' | 'destaque'; children: React.ReactNode }) {
  const estilos = {
    info:      { bg: 'rgba(59,130,246,0.05)',  border: 'rgba(59,130,246,0.2)',  cor: '#1d4ed8' },
    atencao:   { bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.2)',   cor: '#b91c1c' },
    destaque:  { bg: 'rgba(201,166,90,0.07)',  border: 'rgba(201,166,90,0.3)',  cor: '#92610a' },
  }
  const s = estilos[tipo]
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px 18px', margin: '14px 0', fontSize: '13px', color: s.cor, lineHeight: 1.6 }}>
      {children}
    </div>
  )
}
