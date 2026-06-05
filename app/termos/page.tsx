import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso — Monitor de Licitações',
  description: 'Termos e condições de uso do Monitor de Licitações.',
}

export default function TermosPage() {
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
          <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Política de Privacidade</Link>
          <Link href="/login" style={{ color: '#C9A65A', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Entrar →</Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '12px' }}>Documento legal</div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Termos de Uso</h1>
          <p style={{ fontSize: '14px', color: '#9AA0A6', margin: 0 }}>Última atualização: {ultimaAtualizacao}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #D5D2C8', padding: '40px', lineHeight: 1.8 }}>
          <Section titulo="1. Aceitação dos termos">
            <p>Ao criar uma conta ou utilizar o <strong>Monitor de Licitações</strong>, você concorda com estes Termos de Uso. Se não concordar com qualquer disposição, não utilize o serviço.</p>
            <p>Estes termos constituem um contrato legal entre você e a <strong>Monitor de Licitações - Matutta</strong> (CNPJ em processo de registro), operadora do Monitor de Licitações.</p>
          </Section>

          <Section titulo="2. Descrição do serviço">
            <p>O Monitor de Licitações é uma plataforma SaaS (Software as a Service) que:</p>
            <ul>
              <li>Coleta automaticamente editais de licitações públicas de fontes oficiais (PNCP, ComprasNet e outras)</li>
              <li>Analisa os editais com inteligência artificial para identificar oportunidades relevantes com base nas palavras-chave do usuário</li>
              <li>Envia alertas por e-mail e Telegram com as licitações identificadas</li>
              <li>Disponibiliza painel de gestão para visualização e busca de licitações</li>
            </ul>
            <p><strong>Importante:</strong> o serviço fornece informações de monitoramento e não garante que todas as licitações existentes serão identificadas. As licitações exibidas são coletadas de fontes públicas — o Monitor de Licitações não é responsável pela precisão ou completude das informações publicadas pelos órgãos licitantes.</p>
          </Section>

          <Section titulo="3. Cadastro e conta">
            <ul>
              <li>Você deve ter pelo menos 18 anos para criar uma conta.</li>
              <li>As informações de cadastro devem ser verdadeiras e atualizadas.</li>
              <li>Você é responsável pela confidencialidade da sua senha e por todas as atividades realizadas na sua conta.</li>
              <li>Cada conta é de uso individual e intransferível, salvo nos planos que preveem múltiplos usuários.</li>
              <li>Notifique-nos imediatamente em caso de uso não autorizado da sua conta.</li>
            </ul>
          </Section>

          <Section titulo="4. Período de teste gratuito">
            <ul>
              <li>Oferecemos <strong>7 dias de teste gratuito</strong> para novos usuários, sem necessidade de cartão de crédito.</li>
              <li>O período de teste começa na data de criação da conta.</li>
              <li>Ao término do período de teste, o acesso é suspenso automaticamente até a contratação de um plano pago.</li>
              <li>Cada e-mail pode ser usado para apenas um período de teste gratuito.</li>
            </ul>
          </Section>

          <Section titulo="5. Planos e pagamento">
            <p>Os planos disponíveis e seus respectivos preços estão listados em <Link href="/assinar" style={{ color: '#6B0F1A' }}>monitor-licitacoes.vercel.app/assinar</Link>.</p>
            <ul>
              <li><strong>Cobrança:</strong> mensal, processada automaticamente pelo Mercado Pago na data de contratação.</li>
              <li><strong>Renovação automática:</strong> a assinatura renova mensalmente até ser cancelada.</li>
              <li><strong>Alteração de plano:</strong> possível a qualquer momento; o novo valor é cobrado no próximo ciclo.</li>
              <li><strong>Preços:</strong> podemos reajustar os preços com aviso prévio de 30 dias por e-mail.</li>
              <li><strong>Inadimplência:</strong> em caso de falha no pagamento, o acesso é suspenso após 3 tentativas sem sucesso.</li>
            </ul>
          </Section>

          <Section titulo="6. Cancelamento e reembolso">
            <ul>
              <li>Você pode cancelar sua assinatura a qualquer momento pelo painel ou por e-mail.</li>
              <li>O cancelamento tem efeito ao final do período já pago — não há cobrança proporcional.</li>
              <li><strong>Política de reembolso:</strong> reembolso integral disponível em até 7 dias após a primeira cobrança de um novo plano, mediante solicitação para {' '}<a href={`mailto:${emailContato}`} style={{ color: '#6B0F1A' }}>{emailContato}</a>. Após esse prazo, não realizamos reembolsos parciais.</li>
            </ul>
          </Section>

          <Section titulo="7. Uso aceitável">
            <p>Você concorda em não utilizar o serviço para:</p>
            <ul>
              <li>Violar qualquer lei ou regulamentação aplicável</li>
              <li>Compartilhar credenciais de acesso com terceiros não autorizados pelo plano contratado</li>
              <li>Realizar engenharia reversa, scraping ou extração automatizada dos dados do painel</li>
              <li>Sobrecarregar intencionalmente nossa infraestrutura</li>
              <li>Revender ou sublicenciar o acesso ao serviço sem autorização prévia por escrito</li>
              <li>Utilizar os dados de licitações para fins que violem a legislação de licitações públicas</li>
            </ul>
            <p>O descumprimento pode resultar na suspensão imediata da conta sem reembolso.</p>
          </Section>

          <Section titulo="8. Propriedade intelectual">
            <p>O Monitor de Licitações, incluindo seu código, design, marca, metodologia de matching e conteúdo próprio, são de propriedade exclusiva da Monitor de Licitações - Matutta.</p>
            <p>Os dados de licitações são de domínio público, coletados de fontes governamentais oficiais.</p>
            <p>A assinatura não transfere qualquer direito de propriedade intelectual — concedemos apenas uma licença de uso não exclusiva, intransferível e revogável para acesso ao serviço.</p>
          </Section>

          <Section titulo="9. Disponibilidade e suporte">
            <ul>
              <li><strong>Disponibilidade:</strong> buscamos manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência.</li>
              <li><strong>Coleta de licitações:</strong> realizada em dias úteis. Fontes governamentais podem ter instabilidades fora do nosso controle.</li>
              <li><strong>Suporte:</strong> via WhatsApp e e-mail, em dias úteis, horário comercial (8h–18h, horário de Brasília).</li>
            </ul>
          </Section>

          <Section titulo="10. Limitação de responsabilidade">
            <p>O Monitor de Licitações não se responsabiliza por:</p>
            <ul>
              <li>Licitações não identificadas por falha nas fontes oficiais ou limitações técnicas</li>
              <li>Decisões comerciais tomadas com base nos alertas recebidos</li>
              <li>Perdas de oportunidade decorrentes de indisponibilidade temporária do serviço</li>
              <li>Precisão ou integridade dos dados publicados pelos órgãos licitantes</li>
              <li>Danos indiretos, incidentais ou consequenciais</li>
            </ul>
            <p>Nossa responsabilidade máxima fica limitada ao valor pago pelos últimos 3 meses de assinatura.</p>
          </Section>

          <Section titulo="11. Privacidade">
            <p>O tratamento dos seus dados pessoais é regido pela nossa <Link href="/privacidade" style={{ color: '#6B0F1A' }}>Política de Privacidade</Link>, em conformidade com a LGPD (Lei nº 13.709/2018).</p>
          </Section>

          <Section titulo="12. Alterações nos termos">
            <p>Podemos modificar estes termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail com antecedência mínima de 15 dias. O uso continuado do serviço após as alterações implica aceitação.</p>
          </Section>

          <Section titulo="13. Lei aplicável e foro">
            <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Belo Horizonte/MG para dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </Section>

          <Section titulo="14. Contato">
            <p>Para dúvidas, cancelamentos ou exercício de direitos:</p>
            <p><strong>E-mail:</strong> <a href={`mailto:${emailContato}`} style={{ color: '#6B0F1A' }}>{emailContato}</a></p>
            <p><strong>Atendimento:</strong> dias úteis, 8h–18h (horário de Brasília)</p>
          </Section>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/privacidade" style={{ color: '#6B0F1A', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Leia também a Política de Privacidade →</Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#1A1A1C', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
          © {new Date().getFullYear()} Monitor de Licitações · Monitor de Licitações - Matutta ·{' '}
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
