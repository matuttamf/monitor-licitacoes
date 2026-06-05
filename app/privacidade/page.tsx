import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Monitor de Licitações',
  description: 'Como coletamos, usamos e protegemos seus dados pessoais.',
}

export default function PrivacidadePage() {
  const ultimaAtualizacao = '05 de junho de 2026'
  const emailContato = 'matuttamaquinaseferramentas@gmail.com'

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
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '12px' }}>Documento legal</div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Política de Privacidade</h1>
          <p style={{ fontSize: '14px', color: '#9AA0A6', margin: 0 }}>Última atualização: {ultimaAtualizacao}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #D5D2C8', padding: '40px', lineHeight: 1.8 }}>
          <Section titulo="1. Quem somos">
            <p>O <strong>Monitor de Licitações</strong> é um serviço de monitoramento de licitações públicas brasileiras, operado por <strong>Matutta Máquinas e Ferramentas</strong> (CNPJ em processo de registro), com sede no Brasil.</p>
            <p>Para dúvidas sobre esta política, entre em contato pelo e-mail: <a href={`mailto:${emailContato}`} style={{ color: '#6B0F1A' }}>{emailContato}</a></p>
          </Section>

          <Section titulo="2. Dados que coletamos">
            <p>Coletamos os seguintes dados pessoais ao utilizar nossos serviços:</p>
            <ul>
              <li><strong>Dados de cadastro:</strong> nome completo, endereço de e-mail, senha (armazenada de forma criptografada), telefone, WhatsApp e nome da empresa.</li>
              <li><strong>Dados de uso:</strong> palavras-chave cadastradas, licitações visualizadas, histórico de alertas recebidos e preferências de configuração.</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pelo Mercado Pago — não armazenamos dados de cartão de crédito.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional e dados de acesso para fins de segurança e diagnóstico.</li>
            </ul>
          </Section>

          <Section titulo="3. Como usamos seus dados">
            <p>Utilizamos seus dados pessoais para as seguintes finalidades, todas baseadas em fundamentos legais da LGPD (Lei nº 13.709/2018):</p>
            <ul>
              <li><strong>Prestação do serviço:</strong> identificar licitações públicas relevantes com base nas suas palavras-chave e enviar alertas personalizados (base legal: execução de contrato).</li>
              <li><strong>Comunicação:</strong> enviar e-mails de alertas, notificações sobre o trial e comunicados sobre o serviço (base legal: execução de contrato e legítimo interesse).</li>
              <li><strong>Segurança:</strong> prevenir fraudes, acessos não autorizados e garantir a integridade do sistema (base legal: legítimo interesse).</li>
              <li><strong>Melhorias:</strong> analisar padrões de uso de forma agregada e anônima para aprimorar o serviço (base legal: legítimo interesse).</li>
              <li><strong>Cumprimento legal:</strong> atender obrigações legais e regulatórias quando aplicável (base legal: cumprimento de obrigação legal).</li>
            </ul>
          </Section>

          <Section titulo="4. Compartilhamento de dados">
            <p>Não vendemos seus dados pessoais. Compartilhamos informações apenas com:</p>
            <ul>
              <li><strong>Supabase:</strong> infraestrutura de banco de dados e autenticação (servidor nos EUA, com adequação GDPR).</li>
              <li><strong>Resend:</strong> serviço de envio de e-mails transacionais.</li>
              <li><strong>Mercado Pago:</strong> processamento de pagamentos e assinaturas recorrentes.</li>
              <li><strong>Google (Gemini API):</strong> análise semântica de textos de licitações — apenas o objeto da licitação é processado, sem dados pessoais.</li>
              <li><strong>Vercel:</strong> infraestrutura de hospedagem da aplicação.</li>
            </ul>
            <p>Todos os fornecedores são contratados com cláusulas de proteção de dados adequadas.</p>
          </Section>

          <Section titulo="5. Retenção de dados">
            <ul>
              <li><strong>Dados de conta:</strong> mantidos enquanto a conta estiver ativa. Após cancelamento, excluídos em até 90 dias, salvo obrigação legal.</li>
              <li><strong>Dados de alertas:</strong> histórico de alertas mantido por 12 meses.</li>
              <li><strong>Dados de pagamento:</strong> registros financeiros mantidos por 5 anos conforme exigência fiscal.</li>
              <li><strong>Logs de acesso:</strong> mantidos por 6 meses conforme Marco Civil da Internet (Lei nº 12.965/2014).</li>
            </ul>
          </Section>

          <Section titulo="6. Seus direitos (LGPD)">
            <p>Como titular de dados, você tem os seguintes direitos garantidos pela LGPD:</p>
            <ul>
              <li>Confirmação da existência de tratamento dos seus dados</li>
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço</li>
              <li>Eliminação dos dados pessoais tratados com base no seu consentimento</li>
              <li>Revogação do consentimento a qualquer momento</li>
              <li>Oposição ao tratamento realizado com fundamento em outras bases legais</li>
            </ul>
            <p>Para exercer seus direitos, entre em contato: <a href={`mailto:${emailContato}`} style={{ color: '#6B0F1A' }}>{emailContato}</a></p>
            <p>Responderemos em até 15 dias úteis.</p>
          </Section>

          <Section titulo="7. Segurança">
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul>
              <li>Transmissão criptografada via HTTPS/TLS</li>
              <li>Senhas armazenadas com hash bcrypt</li>
              <li>Acesso restrito aos dados por autenticação</li>
              <li>Separação de dados entre usuários (isolamento multi-tenant)</li>
              <li>Backups regulares em infraestrutura segura</li>
            </ul>
            <p>Em caso de incidente de segurança que afete seus dados, notificaremos a ANPD e os titulares afetados conforme exige a LGPD.</p>
          </Section>

          <Section titulo="8. Cookies">
            <p>Utilizamos apenas cookies estritamente necessários para o funcionamento do serviço:</p>
            <ul>
              <li><strong>Cookies de sessão:</strong> mantêm você autenticado durante o uso do painel.</li>
            </ul>
            <p>Não utilizamos cookies de rastreamento, publicidade ou análise de terceiros.</p>
          </Section>

          <Section titulo="9. Alterações nesta política">
            <p>Podemos atualizar esta política periodicamente. Em caso de alterações relevantes, notificaremos por e-mail com antecedência mínima de 15 dias. O uso continuado do serviço após as alterações implica aceitação da nova política.</p>
          </Section>

          <Section titulo="10. Contato e encarregado de dados (DPO)">
            <p>Para exercer seus direitos, tirar dúvidas ou registrar reclamações sobre o tratamento dos seus dados:</p>
            <p><strong>E-mail:</strong> <a href={`mailto:${emailContato}`} style={{ color: '#6B0F1A' }}>{emailContato}</a></p>
            <p>Você também pode registrar reclamações perante a Autoridade Nacional de Proteção de Dados (ANPD): <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={{ color: '#6B0F1A' }}>www.gov.br/anpd</a></p>
          </Section>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/termos" style={{ color: '#6B0F1A', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Leia também os Termos de Uso →</Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#1A1A1C', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
          © {new Date().getFullYear()} Monitor de Licitações · Matutta Máquinas e Ferramentas ·{' '}
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
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1A1A1C', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #F0EDE8' }}>{titulo}</h2>
      <div style={{ fontSize: '14px', color: '#4a4a4d', lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}
