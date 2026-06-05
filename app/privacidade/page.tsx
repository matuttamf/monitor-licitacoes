import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Monitor de Licitações',
  description: 'Saiba como o Monitor de Licitações coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD.',
}

// ⚠️ LEMBRETE: Após registro do CNPJ, atualizar os campos marcados com TODO abaixo:
// - EMPRESA_NOME: razão social oficial
// - EMPRESA_CNPJ: número do CNPJ
// - EMPRESA_SEDE: cidade e estado da sede
// - CONTATO_EMAIL: e-mail oficial de privacidade (ex: privacidade@seudominio.com.br)
// - CONTATO_SITE: URL do site oficial

const EMPRESA_NOME    = 'Monitor de Licitações - Matutta'   // TODO: razão social oficial
const EMPRESA_CNPJ    = '[CNPJ em processo de registro]'     // TODO: inserir CNPJ
const EMPRESA_SEDE    = 'Brasil'                             // TODO: inserir cidade/UF
const CONTATO_EMAIL   = 'privacidade@monitorlicitacoes.com.br' // TODO: criar e-mail oficial
const CONTATO_SITE    = 'https://monitorlicitacoes.com.br'  // TODO: atualizar domínio

export default function PrivacidadePage() {
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
          <Link href="/termos" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Termos de Uso</Link>
          <Link href="/login" style={{ color: '#C9A65A', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Entrar →</Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* Título */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '14px' }}>Conformidade LGPD · Lei nº 13.709/2018</div>
          <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 14px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>Política de Privacidade</h1>
          <p style={{ fontSize: '15px', color: '#9AA0A6', margin: '0 0 20px', lineHeight: 1.6, maxWidth: '560px' }}>
            Este documento descreve como o Monitor de Licitações coleta, utiliza, armazena e protege suas informações pessoais, em plena conformidade com a Lei Geral de Proteção de Dados.
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
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9AA0A6', margin: '0 0 14px' }}>Nesta política</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
              {[
                '1. Identificação do controlador',
                '2. Dados coletados',
                '3. Finalidade do tratamento',
                '4. Bases legais',
                '5. Compartilhamento',
                '6. Transferência internacional',
                '7. Retenção e exclusão',
                '8. Seus direitos',
                '9. Segurança da informação',
                '10. Cookies',
                '11. Menores de idade',
                '12. Alterações desta política',
                '13. Encarregado de dados (DPO)',
              ].map(item => (
                <span key={item} style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#C9A65A', fontWeight: 700, fontSize: '10px' }}>›</span> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Seções */}
          <div style={{ padding: '40px' }}>

            <Section titulo="1. Identificação do controlador de dados">
              <InfoBox>
                <InfoRow label="Empresa">{EMPRESA_NOME}</InfoRow>
                <InfoRow label="CNPJ">{EMPRESA_CNPJ}</InfoRow>
                <InfoRow label="Sede">{EMPRESA_SEDE}</InfoRow>
                <InfoRow label="Serviço">Monitor de Licitações (monitorlicitacoes.com.br)</InfoRow>
                <InfoRow label="Contato DPO">{CONTATO_EMAIL}</InfoRow>
              </InfoBox>
              <p>O <strong>Monitor de Licitações</strong> é uma plataforma SaaS de monitoramento de editais públicos brasileiros. Na qualidade de controlador de dados, somos responsáveis pelas decisões sobre o tratamento das suas informações pessoais nos termos da Lei nº 13.709/2018 (LGPD).</p>
            </Section>

            <Section titulo="2. Dados pessoais coletados">
              <p>Coletamos apenas os dados estritamente necessários para a prestação do serviço (<em>princípio da minimização</em>):</p>

              <SubTitulo>2.1 Dados fornecidos diretamente por você</SubTitulo>
              <Tabela colunas={['Categoria', 'Dados', 'Momento da coleta']}>
                <tr><Td>Identificação</Td><Td>Nome completo, e-mail, senha (hash)</Td><Td>Cadastro</Td></tr>
                <tr><Td>Contato</Td><Td>Telefone, WhatsApp</Td><Td>Perfil (opcional)</Td></tr>
                <tr><Td>Empresa</Td><Td>Nome da empresa</Td><Td>Perfil (opcional)</Td></tr>
                <tr><Td>Preferências</Td><Td>Palavras-chave de monitoramento</Td><Td>Uso do painel</Td></tr>
              </Tabela>

              <SubTitulo>2.2 Dados coletados automaticamente</SubTitulo>
              <Tabela colunas={['Categoria', 'Dados', 'Finalidade']}>
                <tr><Td>Técnicos</Td><Td>Endereço IP, navegador, sistema operacional</Td><Td>Segurança e diagnóstico</Td></tr>
                <tr><Td>Uso</Td><Td>Páginas acessadas, alertas visualizados</Td><Td>Melhoria do serviço</Td></tr>
                <tr><Td>Autenticação</Td><Td>Tokens de sessão (cookies)</Td><Td>Manter login ativo</Td></tr>
              </Tabela>

              <SubTitulo>2.3 Dados de pagamento</SubTitulo>
              <p>Não coletamos nem armazenamos dados de cartão de crédito ou informações bancárias. O processamento financeiro é realizado integralmente por nossa plataforma de pagamentos parceira, certificada pelos padrões de segurança do setor. Armazenamos apenas o identificador da assinatura para controle de acesso ao serviço.</p>
            </Section>

            <Section titulo="3. Finalidade do tratamento">
              <Tabela colunas={['Finalidade', 'Descrição']}>
                <tr><Td>Prestação do serviço</Td><Td>Identificar licitações públicas relevantes via IA e enviar alertas personalizados por e-mail e Telegram</Td></tr>
                <tr><Td>Gestão da conta</Td><Td>Autenticação, controle de acesso, gerenciamento de plano e trial</Td></tr>
                <tr><Td>Comunicações</Td><Td>Alertas de licitações, avisos sobre trial, atualizações relevantes do serviço</Td></tr>
                <tr><Td>Segurança</Td><Td>Prevenção de fraudes, acessos não autorizados e abuso do sistema</Td></tr>
                <tr><Td>Melhoria contínua</Td><Td>Análise agregada e anonimizada de padrões de uso</Td></tr>
                <tr><Td>Obrigações legais</Td><Td>Cumprimento de requisitos fiscais, contábeis e regulatórios aplicáveis</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="4. Bases legais do tratamento (art. 7º e 11 LGPD)">
              <Tabela colunas={['Tratamento', 'Base legal']}>
                <tr><Td>Criação e gestão da conta</Td><Td>Execução de contrato (art. 7º, V)</Td></tr>
                <tr><Td>Envio de alertas de licitações</Td><Td>Execução de contrato (art. 7º, V)</Td></tr>
                <tr><Td>E-mails sobre o trial e planos</Td><Td>Legítimo interesse (art. 7º, IX)</Td></tr>
                <tr><Td>Segurança e antifraude</Td><Td>Legítimo interesse (art. 7º, IX)</Td></tr>
                <tr><Td>Logs de acesso (6 meses)</Td><Td>Cumprimento de obrigação legal — Marco Civil (art. 7º, II)</Td></tr>
                <tr><Td>Registros fiscais e financeiros</Td><Td>Cumprimento de obrigação legal (art. 7º, II)</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="5. Compartilhamento de dados">
              <p>Não comercializamos, alugamos nem vendemos seus dados pessoais a terceiros, em nenhuma hipótese.</p>
              <p>O compartilhamento ocorre exclusivamente com fornecedores de infraestrutura tecnológica indispensáveis à operação do serviço, nas categorias abaixo. Todos estão vinculados contratualmente a obrigações de proteção de dados compatíveis com a LGPD:</p>
              <Tabela colunas={['Categoria do fornecedor', 'Finalidade', 'Dados envolvidos']}>
                <tr><Td>Infraestrutura de banco de dados e autenticação</Td><Td>Armazenamento seguro dos dados da conta e controle de acesso</Td><Td>Dados de cadastro, preferências, histórico de uso</Td></tr>
                <tr><Td>Hospedagem e entrega da aplicação</Td><Td>Disponibilização da plataforma web ao usuário</Td><Td>Dados de acesso, endereço IP</Td></tr>
                <tr><Td>Envio de comunicações eletrônicas</Td><Td>Entrega de alertas de licitações e notificações do serviço</Td><Td>Nome, e-mail, conteúdo dos alertas</Td></tr>
                <tr><Td>Processamento de pagamentos</Td><Td>Cobrança e gestão de assinaturas recorrentes</Td><Td>E-mail, identificador da assinatura</Td></tr>
                <tr><Td>Processamento de linguagem natural</Td><Td>Análise semântica de textos públicos de licitações para identificar correspondências com as palavras-chave do usuário</Td><Td>Exclusivamente texto público de editais governamentais — nenhum dado pessoal</Td></tr>
              </Tabela>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#6B7280' }}>
                Não autorizamos nenhum fornecedor a utilizar os dados compartilhados para finalidades próprias, comercialização ou treinamento de modelos de inteligência artificial.
              </p>
            </Section>

            <Section titulo="6. Transferência internacional de dados">
              <p>Parte de nossa infraestrutura tecnológica opera fora do território brasileiro. Quando isso ocorre, asseguramos que a transferência de dados observa as salvaguardas exigidas pelo art. 33 da LGPD, mediante:</p>
              <ul>
                <li>Contratação de fornecedores que adotam cláusulas contratuais de proteção de dados internacionalmente reconhecidas</li>
                <li>Verificação de certificações de segurança e conformidade dos parceiros tecnológicos</li>
                <li>Aplicação de instrumentos jurídicos adequados a cada transferência</li>
              </ul>
              <p>O usuário pode solicitar informações sobre as salvaguardas adotadas pelo canal de contato indicado na seção 13.</p>
            </Section>

            <Section titulo="7. Retenção e exclusão de dados">
              <Tabela colunas={['Categoria', 'Prazo de retenção', 'Fundamento']}>
                <tr><Td>Dados de conta</Td><Td>Enquanto a conta estiver ativa + 90 dias após cancelamento</Td><Td>Execução de contrato</Td></tr>
                <tr><Td>Histórico de alertas</Td><Td>12 meses</Td><Td>Legítimo interesse</Td></tr>
                <tr><Td>Logs de acesso</Td><Td>6 meses</Td><Td>Art. 15 do Marco Civil (Lei nº 12.965/2014)</Td></tr>
                <tr><Td>Registros financeiros</Td><Td>5 anos</Td><Td>Art. 195 do CTN e legislação fiscal</Td></tr>
              </Tabela>
              <p>Após os prazos acima, os dados são excluídos de forma segura ou anonimizados de modo irreversível.</p>
            </Section>

            <Section titulo="8. Seus direitos como titular de dados (art. 18 LGPD)">
              <p>Você pode exercer os seguintes direitos a qualquer momento, gratuitamente:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px', marginBottom: '16px' }}>
                {[
                  { direito: 'Confirmação', desc: 'Saber se tratamos seus dados' },
                  { direito: 'Acesso', desc: 'Obter cópia dos seus dados' },
                  { direito: 'Correção', desc: 'Corrigir dados incompletos ou incorretos' },
                  { direito: 'Anonimização', desc: 'Bloquear dados desnecessários' },
                  { direito: 'Portabilidade', desc: 'Receber seus dados em formato estruturado' },
                  { direito: 'Eliminação', desc: 'Excluir dados tratados com seu consentimento' },
                  { direito: 'Oposição', desc: 'Contestar tratamentos baseados em legítimo interesse' },
                  { direito: 'Revogação', desc: 'Retirar consentimento quando aplicável' },
                ].map(({ direito, desc }) => (
                  <div key={direito} style={{ background: '#FAF6F0', borderRadius: '10px', padding: '12px 14px', border: '1px solid #EBE7E0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1C', marginBottom: '2px' }}>{direito}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{desc}</div>
                  </div>
                ))}
              </div>
              <p>Para exercer seus direitos, envie solicitação para <strong>{CONTATO_EMAIL}</strong> com identificação. Responderemos em até <strong>15 dias úteis</strong>.</p>
              <p>Caso não seja atendido, você pode apresentar reclamação à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={{ color: '#6B0F1A' }}>www.gov.br/anpd</a></p>
            </Section>

            <Section titulo="9. Segurança da informação">
              <p>Implementamos medidas técnicas e organizacionais proporcionais ao risco, em conformidade com o art. 46 da LGPD:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                {[
                  { label: 'Criptografia em trânsito', desc: 'Todas as comunicações protegidas por protocolo seguro' },
                  { label: 'Senhas protegidas', desc: 'Armazenadas com algoritmo de hash criptográfico irreversível' },
                  { label: 'Isolamento de dados', desc: 'Separação lógica entre contas de diferentes usuários' },
                  { label: 'Controle de acesso', desc: 'Autenticação obrigatória para acesso ao painel' },
                  { label: 'Cópias de segurança', desc: 'Backups regulares em infraestrutura redundante' },
                  { label: 'Monitoramento', desc: 'Registros de acesso e detecção de comportamentos anômalos' },
                ].map(({ label, desc }) => (
                  <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1C' }}>{label}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '16px' }}>Em caso de incidente de segurança com risco aos titulares, notificaremos a ANPD e os afetados no prazo legal (art. 48 LGPD).</p>
            </Section>

            <Section titulo="10. Cookies e tecnologias de rastreamento">
              <p>Utilizamos apenas cookies <strong>estritamente necessários</strong> ao funcionamento do serviço. Não utilizamos cookies de publicidade, rastreamento comportamental ou análise de terceiros.</p>
              <Tabela colunas={['Tipo', 'Finalidade', 'Duração']}>
                <tr><Td>Cookie de sessão</Td><Td>Autenticação — mantém o usuário conectado durante o uso</Td><Td>Duração da sessão</Td></tr>
                <tr><Td>Cookie de renovação</Td><Td>Renovação automática da autenticação sem necessidade de novo login</Td><Td>Até 60 dias</Td></tr>
              </Tabela>
              <p>Por serem tecnicamente necessários, esses cookies não requerem consentimento prévio (art. 7º, V da LGPD).</p>
            </Section>

            <Section titulo="11. Menores de idade">
              <p>O Monitor de Licitações é destinado exclusivamente a pessoas jurídicas e profissionais maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos que um menor forneceu dados sem consentimento dos responsáveis, excluiremos as informações imediatamente.</p>
            </Section>

            <Section titulo="12. Alterações nesta política">
              <p>Esta política pode ser atualizada para refletir mudanças no serviço, na legislação ou nas práticas de privacidade. Adotamos os seguintes procedimentos:</p>
              <ul>
                <li>Alterações <strong>relevantes</strong>: notificação por e-mail com antecedência mínima de 15 dias.</li>
                <li>Alterações <strong>operacionais</strong> (ex.: atualização de fornecedor): publicação imediata com atualização da data.</li>
                <li>O uso continuado do serviço após a vigência das alterações implica aceitação.</li>
              </ul>
              <p>O histórico de versões desta política está disponível mediante solicitação.</p>
            </Section>

            <Section titulo="13. Encarregado de dados (DPO)">
              <InfoBox>
                <InfoRow label="Responsável">Monitor de Licitações - Matutta</InfoRow>
                <InfoRow label="E-mail de privacidade">{CONTATO_EMAIL}</InfoRow>
                <InfoRow label="Site">{CONTATO_SITE}</InfoRow>
                <InfoRow label="Tempo de resposta">Até 15 dias úteis</InfoRow>
              </InfoBox>
              <p>O Encarregado de Proteção de Dados é o canal oficial para exercício de direitos, esclarecimento de dúvidas e registro de reclamações relacionadas ao tratamento de dados pessoais pelo Monitor de Licitações.</p>
            </Section>

          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/termos" style={{ color: '#6B0F1A', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Leia também os Termos de Uso →</Link>
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
