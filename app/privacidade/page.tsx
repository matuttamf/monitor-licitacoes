import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Monitor de Licitações',
  description: 'Saiba como o Monitor de Licitações coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD.',
}

const EMPRESA_NOME  = 'Matutta Soluções Digitais'
const EMPRESA_CNPJ  = '[CNPJ em processo de registro]'
const EMPRESA_SEDE  = 'Brasil'
const CONTATO_EMAIL = 'privacidade@monitordelicitacoes.com.br'
const CONTATO_SITE  = 'https://monitordelicitacoes.com.br'

export default function PrivacidadePage() {
  const ultimaAtualizacao = '05 de junho de 2026'

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans">

      {/* Header */}
      <header className="bg-[#1A1A1C] border-b border-[rgba(201,166,90,0.15)] px-5 md:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-[11px] shrink-0">ML</div>
          <span className="text-white font-semibold text-[15px]">Monitor de Licitações</span>
        </Link>
        <div className="flex gap-5">
          <Link href="/termos" className="text-[rgba(255,255,255,0.5)] text-sm no-underline">Termos de Uso</Link>
          <Link href="/login" className="text-[#C9A65A] text-sm font-semibold no-underline">Entrar →</Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-[800px] mx-auto px-5 md:px-6 py-14 md:py-20 pb-24">

        {/* Título */}
        <div className="mb-14">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#C9A65A] mb-3.5">Conformidade LGPD · Lei nº 13.709/2018</div>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-[#1A1A1C] mb-3.5 tracking-tight leading-tight">Política de Privacidade</h1>
          <p className="text-[15px] text-[#9AA0A6] mb-5 leading-relaxed max-w-[560px]">
            Este documento descreve como o Monitor de Licitações coleta, utiliza, armazena e protege suas informações pessoais, em plena conformidade com a Lei Geral de Proteção de Dados.
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
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AA0A6] mb-3.5">Nesta política</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                '1. Identificação do controlador','2. Dados coletados','3. Finalidade do tratamento',
                '4. Bases legais','5. Compartilhamento','6. Proteção onde quer que estejam',
                '7. Por quanto tempo guardamos','8. Seus direitos','9. Segurança da informação',
                '10. Cookies','11. Menores de idade','12. Alterações desta política','13. Encarregado de dados (DPO)',
              ].map(item => (
                <span key={item} className="text-xs text-[#6B7280] flex items-center gap-1.5">
                  <span className="text-[#C9A65A] font-bold text-[10px]">›</span> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Seções */}
          <div className="px-6 md:px-10 py-10">

            <Section titulo="1. Identificação do controlador de dados">
              <InfoBox>
                <InfoRow label="Empresa">{EMPRESA_NOME}</InfoRow>
                <InfoRow label="CNPJ">{EMPRESA_CNPJ}</InfoRow>
                <InfoRow label="Sede">{EMPRESA_SEDE}</InfoRow>
                <InfoRow label="Serviço">Monitor de Licitações (monitordelicitacoes.com.br)</InfoRow>
                <InfoRow label="Contato DPO">{CONTATO_EMAIL}</InfoRow>
              </InfoBox>
              <p>O <strong>Monitor de Licitações</strong> é uma plataforma de monitoramento de editais públicos brasileiros. Na qualidade de controlador de dados, somos responsáveis pelas decisões sobre o tratamento das suas informações pessoais nos termos da Lei nº 13.709/2018 (LGPD).</p>
            </Section>

            <Section titulo="2. Dados pessoais coletados">
              <p>Coletamos apenas os dados estritamente necessários para a prestação do serviço (<em>princípio da minimização</em>):</p>
              <SubTitulo>2.1 Dados fornecidos diretamente por você</SubTitulo>
              <Tabela colunas={['Categoria', 'Dados', 'Momento da coleta']}>
                <tr><Td>Identificação</Td><Td>Nome completo, e-mail, credencial de acesso</Td><Td>Cadastro</Td></tr>
                <tr><Td>Documento fiscal</Td><Td>CPF ou CNPJ</Td><Td>Cadastro (obrigatório para validação de identidade)</Td></tr>
                <tr><Td>Contato</Td><Td>Telefone, WhatsApp</Td><Td>Perfil (opcional)</Td></tr>
                <tr><Td>Empresa</Td><Td>Nome da empresa</Td><Td>Perfil (opcional)</Td></tr>
                <tr><Td>Preferências</Td><Td>Palavras-chave de monitoramento</Td><Td>Uso do painel</Td></tr>
              </Tabela>
              <SubTitulo>2.2 Dados coletados automaticamente</SubTitulo>
              <Tabela colunas={['O que é', 'Para que serve', 'O que não fazemos']}>
                <tr>
                  <Td><strong>Endereço IP e dados do navegador</strong><br/><span className="text-xs text-[#9AA0A6]">Informação técnica gerada automaticamente ao acessar qualquer site</span></Td>
                  <Td>Identificar tentativas de acesso não autorizado e resolver problemas técnicos</Td>
                  <Td>Não usamos para rastrear sua localização nem para fins comerciais</Td>
                </tr>
                <tr>
                  <Td><strong>Páginas acessadas na plataforma</strong><br/><span className="text-xs text-[#9AA0A6]">Ex.: qual seção do painel foi acessada</span></Td>
                  <Td>Entender como o serviço é usado para melhorá-lo — de forma agregada</Td>
                  <Td>Não monitoramos o que você faz fora da plataforma</Td>
                </tr>
                <tr>
                  <Td><strong>Cookie de sessão</strong><br/><span className="text-xs text-[#9AA0A6]">Arquivo pequeno salvo no seu navegador</span></Td>
                  <Td>Manter você conectado enquanto usa o painel</Td>
                  <Td>Não usamos cookies de publicidade nem de rastreamento entre sites</Td>
                </tr>
              </Tabela>
              <SubTitulo>2.3 Dados do Diretório de Fornecedores (voluntários e públicos)</SubTitulo>
              <p>Caso o usuário opte por cadastrar sua empresa no Diretório de Fornecedores, os seguintes dados são coletados e exibidos <strong>publicamente para outros usuários da plataforma</strong>:</p>
              <Tabela colunas={['Dado', 'Natureza']}>
                <tr><Td>Razão social / nome comercial</Td><Td>Voluntário — inserido pelo usuário</Td></tr>
                <tr><Td>CNPJ</Td><Td>Voluntário — inserido pelo usuário</Td></tr>
                <tr><Td>Descrição da empresa</Td><Td>Voluntário — inserido pelo usuário</Td></tr>
                <tr><Td>Regiões de atendimento</Td><Td>Voluntário — selecionado pelo usuário</Td></tr>
                <tr><Td>E-mail de contato</Td><Td>Voluntário — pode ser diferente do e-mail de login</Td></tr>
                <tr><Td>Telefone de contato</Td><Td>Voluntário — inserido pelo usuário</Td></tr>
                <tr><Td>Website</Td><Td>Voluntário — inserido pelo usuário</Td></tr>
              </Tabela>
              <Aviso tipo="atencao">
                Atenção: ao ativar a visibilidade no diretório, esses dados ficam acessíveis a <strong>todos os usuários da plataforma</strong> com plano que inclua acesso ao diretório. O usuário pode desativar ou remover seu perfil a qualquer momento pelo painel.
              </Aviso>

              <SubTitulo>2.4 Dados de pagamento</SubTitulo>
              <p>Não coletamos nem armazenamos dados de cartão de crédito. O processamento financeiro é realizado pela plataforma de pagamentos parceira. Armazenamos apenas o identificador da assinatura para controle de acesso.</p>
            </Section>

            <Section titulo="3. Finalidade do tratamento">
              <Tabela colunas={['Finalidade', 'Descrição']}>
                <tr><Td>Prestação do serviço</Td><Td>Identificar licitações relevantes e enviar alertas por e-mail, Telegram e WhatsApp</Td></tr>
                <tr><Td>Gestão da conta</Td><Td>Autenticação, controle de acesso, gerenciamento de plano e trial</Td></tr>
                <tr><Td>Comunicações</Td><Td>Alertas de licitações, avisos sobre trial, atualizações do serviço</Td></tr>
                <tr><Td>Segurança</Td><Td>Prevenção de fraudes, acessos não autorizados e abuso do sistema</Td></tr>
                <tr><Td>Diretório de Fornecedores</Td><Td>Exibição do perfil público da empresa do usuário para outros usuários da plataforma, conforme configurado e autorizado pelo próprio usuário</Td></tr>
                <tr><Td>Melhoria contínua</Td><Td>Análise agregada e anonimizada de padrões de uso</Td></tr>
                <tr><Td>Obrigações legais</Td><Td>Cumprimento de requisitos fiscais, contábeis e regulatórios aplicáveis</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="4. Bases legais do tratamento (art. 7º e 11 LGPD)">
              <Tabela colunas={['Tratamento', 'Base legal']}>
                <tr><Td>Criação e gestão da conta</Td><Td>Execução de contrato (art. 7º, V)</Td></tr>
                <tr><Td>Envio de alertas de licitações</Td><Td>Execução de contrato (art. 7º, V)</Td></tr>
                <tr><Td>E-mails sobre trial e planos</Td><Td>Legítimo interesse (art. 7º, IX)</Td></tr>
                <tr><Td>Segurança e antifraude</Td><Td>Legítimo interesse (art. 7º, IX)</Td></tr>
                <tr><Td>Perfil no Diretório de Fornecedores</Td><Td>Consentimento do titular (art. 7º, I) — ativação voluntária pelo usuário</Td></tr>
                <tr><Td>Logs de acesso (6 meses)</Td><Td>Cumprimento de obrigação legal — Marco Civil (art. 7º, II)</Td></tr>
                <tr><Td>Registros fiscais e financeiros</Td><Td>Cumprimento de obrigação legal (art. 7º, II)</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="5. Compartilhamento de dados">
              <p>Não comercializamos, alugamos nem vendemos seus dados pessoais a terceiros.</p>
              <SubTitulo>5.1 Fornecedores de infraestrutura</SubTitulo>
              <Tabela colunas={['Categoria do fornecedor', 'Finalidade', 'Dados envolvidos']}>
                <tr><Td>Banco de dados e autenticação</Td><Td>Armazenamento seguro e controle de acesso</Td><Td>Dados de cadastro, preferências, histórico</Td></tr>
                <tr><Td>Hospedagem e entrega da aplicação</Td><Td>Disponibilização da plataforma web</Td><Td>Dados de acesso, endereço IP</Td></tr>
                <tr><Td>Envio de comunicações</Td><Td>Entrega de alertas e notificações</Td><Td>Nome, e-mail, conteúdo dos alertas</Td></tr>
                <tr><Td>Processamento de pagamentos</Td><Td>Cobrança e gestão de assinaturas</Td><Td>E-mail, identificador da assinatura</Td></tr>
                <tr><Td>Processamento de conteúdo</Td><Td>Análise de textos públicos de editais</Td><Td>Apenas texto público — nenhum dado pessoal</Td></tr>
              </Tabela>
              <SubTitulo>5.2 Outros usuários da plataforma (Diretório de Fornecedores)</SubTitulo>
              <p>Quando o usuário <strong>ativa voluntariamente</strong> seu perfil no Diretório de Fornecedores, os dados que ele inseriu no perfil (razão social, CNPJ, descrição, regiões, e-mail de contato, telefone e website) ficam visíveis para outros usuários da plataforma com plano que inclua acesso ao diretório.</p>
              <Aviso tipo="destaque">
                Esse compartilhamento é <strong>inteiramente controlado pelo usuário</strong>: ocorre apenas se o usuário ativar a visibilidade do perfil, pode ser desativado a qualquer momento, e os dados inseridos no diretório são exclusivamente aqueles que o próprio usuário escolheu informar.
              </Aviso>
            </Section>

            <Section titulo="6. Seus dados estão protegidos onde quer que estejam">
              <p>Parte da infraestrutura opera fora do território brasileiro, mas seus dados permanecem igualmente protegidos através de contratos de proteção, certificações internacionais de segurança e conformidade com o art. 33 da LGPD.</p>
              <div className="grid gap-2.5 my-4">
                {[
                  { icon: '📋', titulo: 'Contratos de proteção', desc: 'Todos os parceiros assinam obrigações contratuais de proteção de dados equivalentes às exigidas no Brasil.' },
                  { icon: '🔒', titulo: 'Certificações de segurança', desc: 'Selecionamos fornecedores com certificações reconhecidas internacionalmente em segurança da informação.' },
                  { icon: '⚖️', titulo: 'Conformidade legal', desc: 'As transferências atendem às salvaguardas exigidas pelo art. 33 da LGPD.' },
                ].map(({ icon, titulo, desc }) => (
                  <div key={titulo} className="flex gap-3 items-start bg-[#FAF6F0] rounded-xl p-3.5 border border-[#EBE7E0]">
                    <span className="text-xl shrink-0">{icon}</span>
                    <div>
                      <div className="text-[13px] font-bold text-[#1A1A1C] mb-0.5">{titulo}</div>
                      <div className="text-[13px] text-[#6B7280] leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section titulo="7. Por quanto tempo guardamos seus dados">
              <Tabela colunas={['O que guardamos', 'Por quanto tempo', 'Por que esse prazo']}>
                <tr>
                  <Td><strong>Dados da conta</strong><br/><span className="text-xs text-[#9AA0A6]">Nome, e-mail, preferências</span></Td>
                  <Td>Enquanto ativa. Se cancelar, excluímos em até <strong>90 dias</strong></Td>
                  <Td>Necessário para prestar o serviço</Td>
                </tr>
                <tr>
                  <Td><strong>Histórico de alertas</strong></Td>
                  <Td><strong>12 meses</strong></Td>
                  <Td>Utilidade direta para o usuário</Td>
                </tr>
                <tr>
                  <Td><strong>Registros técnicos de acesso</strong></Td>
                  <Td><strong>6 meses</strong></Td>
                  <Td>Exigência legal do Marco Civil da Internet</Td>
                </tr>
                <tr>
                  <Td><strong>Comprovantes de pagamento</strong></Td>
                  <Td><strong>5 anos</strong></Td>
                  <Td>Obrigação fiscal brasileira (CTN, art. 195)</Td>
                </tr>
              </Tabela>
            </Section>

            <Section titulo="8. Seus direitos como titular de dados (art. 18 LGPD)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
                {[
                  { direito: 'Confirmação', desc: 'Saber se tratamos seus dados' },
                  { direito: 'Acesso', desc: 'Obter cópia dos seus dados' },
                  { direito: 'Correção', desc: 'Corrigir dados incompletos ou incorretos' },
                  { direito: 'Anonimização', desc: 'Bloquear dados desnecessários' },
                  { direito: 'Portabilidade', desc: 'Receber seus dados em formato estruturado' },
                  { direito: 'Eliminação', desc: 'Excluir dados tratados com seu consentimento' },
                  { direito: 'Oposição', desc: 'Contestar tratamentos por legítimo interesse' },
                  { direito: 'Revogação', desc: 'Retirar consentimento quando aplicável' },
                ].map(({ direito, desc }) => (
                  <div key={direito} className="bg-[#FAF6F0] rounded-xl p-3 border border-[#EBE7E0]">
                    <div className="text-[13px] font-bold text-[#1A1A1C] mb-0.5">{direito}</div>
                    <div className="text-xs text-[#6B7280]">{desc}</div>
                  </div>
                ))}
              </div>
              <p>Para exercer seus direitos, envie solicitação para <strong>{CONTATO_EMAIL}</strong>. Responderemos em até <strong>15 dias úteis</strong>.</p>
              <p>Reclamações também podem ser apresentadas à <strong>ANPD</strong>: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-[#6B0F1A]">www.gov.br/anpd</a></p>
            </Section>

            <Section titulo="9. Segurança da informação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                {[
                  { label: 'Criptografia em trânsito', desc: 'Todas as comunicações protegidas por protocolo seguro' },
                  { label: 'Senhas protegidas', desc: 'Armazenadas com hash criptográfico irreversível' },
                  { label: 'Isolamento de dados', desc: 'Segregação de dados entre contas distintas' },
                  { label: 'Controle de acesso', desc: 'Autenticação obrigatória para acesso ao painel' },
                  { label: 'Cópias de segurança', desc: 'Backups regulares em infraestrutura redundante' },
                  { label: 'Monitoramento', desc: 'Registros de acesso e detecção de anomalias' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex gap-2.5 items-start">
                    <span className="text-[#10b981] mt-0.5 shrink-0">✓</span>
                    <div>
                      <div className="text-[13px] font-semibold text-[#1A1A1C]">{label}</div>
                      <div className="text-xs text-[#6B7280]">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section titulo="10. Cookies e tecnologias de rastreamento">
              <p>Utilizamos apenas cookies <strong>estritamente necessários</strong>. Não utilizamos cookies de publicidade ou rastreamento comportamental.</p>
              <Tabela colunas={['Tipo', 'Finalidade', 'Duração']}>
                <tr><Td>Cookie de sessão</Td><Td>Autenticação — mantém o usuário conectado</Td><Td>Duração da sessão</Td></tr>
                <tr><Td>Cookie de renovação</Td><Td>Renovação automática da autenticação</Td><Td>Até 60 dias</Td></tr>
              </Tabela>
            </Section>

            <Section titulo="11. Menores de idade">
              <p>O Monitor de Licitações é destinado exclusivamente a pessoas jurídicas e profissionais maiores de 18 anos. Não coletamos dados de menores intencionalmente.</p>
            </Section>

            <Section titulo="12. Alterações nesta política">
              <ul>
                <li>Alterações <strong>relevantes</strong>: notificação por e-mail com antecedência mínima de 15 dias.</li>
                <li>Alterações <strong>operacionais</strong>: publicação imediata com atualização da data.</li>
                <li>O uso continuado do serviço implica aceitação das alterações.</li>
              </ul>
            </Section>

            <Section titulo="13. Encarregado de dados (DPO)">
              <InfoBox>
                <InfoRow label="Responsável">Matutta Soluções Digitais</InfoRow>
                <InfoRow label="E-mail de privacidade">{CONTATO_EMAIL}</InfoRow>
                <InfoRow label="Site">{CONTATO_SITE}</InfoRow>
                <InfoRow label="Tempo de resposta">Até 15 dias úteis</InfoRow>
              </InfoBox>
            </Section>

          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/termos" className="text-[#6B0F1A] text-sm font-semibold no-underline">Leia também os Termos de Uso →</Link>
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
    <div className="mb-10 pb-10 border-b border-[#F0EDE8] last:border-0 last:mb-0 last:pb-0">
      <h2 className="text-base font-bold text-[#1A1A1C] mb-4 flex items-center gap-2.5">
        <span className="w-1 h-[18px] bg-[#6B0F1A] rounded-sm shrink-0 inline-block" />
        {titulo}
      </h2>
      <div className="text-sm text-[#4a4a4d] leading-[1.85]">{children}</div>
    </div>
  )
}

function SubTitulo({ children }: { children: React.ReactNode }) {
  return <p className="font-bold text-[#1A1A1C] text-[13px] mt-5 mb-2 uppercase tracking-[0.05em]">{children}</p>
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
  return <td className="px-4 py-2.5 text-[#4a4a4d] border-b border-[#F5F2EE] align-top last:[&]:border-0">{children}</td>
}
