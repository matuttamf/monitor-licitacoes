import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamento do Programa de Indicações — Monitor de Licitações',
  description: 'Regras completas do programa de indicações: como ganhar dias grátis indicando amigos, condições, carência, prazos e política de cancelamento.',
  robots: { index: true, follow: true },
}

const ATUALIZADO_EM = '25 de junho de 2026'

function Secao({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1C', margin: '0 0 10px' }}>
        {n}. {titulo}
      </h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.75, color: '#3f3f43' }}>{children}</div>
    </section>
  )
}

export default function RegulamentoIndicacoes() {
  return (
    <main style={{ background: '#FAF6F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#6B0F1A', padding: '20px 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
            Monitor de Licitações
          </Link>
          <Link href="/dashboard" style={{ color: '#C9A65A', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            Ir para o painel →
          </Link>
        </div>
      </div>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#6B0F1A,#C9A65A,transparent)' }} />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E8E4DC', padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>

          <div style={{ color: '#C9A65A', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Programa de Indicações
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: 'Georgia, serif', color: '#1A1A1C', margin: '0 0 8px', lineHeight: 1.25 }}>
            Regulamento — Convide amigos e ganhe meses grátis
          </h1>
          <p style={{ fontSize: 13, color: '#9AA0A6', margin: '0 0 32px' }}>
            Última atualização: {ATUALIZADO_EM}
          </p>

          <Secao n={1} titulo="Resumo do benefício">
            <p style={{ margin: '0 0 10px' }}>
              Usuários aptos recebem um <strong>link pessoal e exclusivo</strong>. A cada amigo que se cadastrar
              por esse link e <strong>assinar um plano pago</strong>, o titular do link ganha
              {' '}<strong>30 (trinta) dias grátis</strong> de assinatura, e o amigo recebe
              {' '}<strong>20% (vinte por cento) de desconto na primeira assinatura</strong>.
            </p>
            <p style={{ margin: 0 }}>
              O benefício do titular é <strong>acumulativo e sem limite</strong>: cada novo amigo convertido
              soma mais 30 dias.
            </p>
          </Secao>

          <Secao n={2} titulo="Quem pode participar">
            <p style={{ margin: '0 0 10px' }}>
              Podem indicar os usuários com <strong>assinatura paga ativa há mais de 10 (dez) dias</strong>,
              contados a partir da <strong>confirmação do pagamento</strong>. Ao completar esse período, o usuário
              fica <strong>apto</strong> e o link pessoal é disponibilizado no rodapé do painel.
            </p>
            <p style={{ margin: 0 }}>
              Usuários em período de teste (trial), com assinatura cancelada ou em atraso <strong>não estão aptos</strong>.
            </p>
          </Secao>

          <Secao n={3} titulo="Como a recompensa é liberada">
            <p style={{ margin: '0 0 10px' }}>A recompensa segue, obrigatoriamente, esta sequência:</p>
            <ol style={{ margin: '0 0 10px', paddingLeft: 20 }}>
              <li>Convite enviado pelo link pessoal;</li>
              <li>O amigo cria a conta;</li>
              <li>O amigo <strong>assina um plano pago</strong> (somente assinatura paga gera recompensa);</li>
              <li>Decorridos <strong>10 (dez) dias após a confirmação do pagamento sem cancelamento</strong>;</li>
              <li>A recompensa de 30 dias é <strong>liberada ao titular do link</strong>.</li>
            </ol>
            <p style={{ margin: 0, fontWeight: 700, color: '#6B0F1A' }}>
              A recompensa nunca é liberada de imediato. O prazo de carência de 10 dias é obrigatório e inegociável.
            </p>
          </Secao>

          <Secao n={4} titulo="Condições e limites">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}><strong>Somente assinaturas pagas</strong> geram recompensa — testes gratuitos não contam.</li>
              <li style={{ marginBottom: 6 }}>Assinaturas <strong>canceladas dentro dos 10 dias de carência não geram recompensa</strong>.</li>
              <li style={{ marginBottom: 6 }}>Cada amigo indicado <strong>gera uma única recompensa</strong>, não importa o plano contratado.</li>
              <li style={{ marginBottom: 6 }}>O desconto de 20% do amigo vale <strong>apenas na primeira assinatura</strong> (mensal ou anual).</li>
              <li>O link pessoal é <strong>fixo durante toda a assinatura</strong> do titular.</li>
            </ul>
          </Secao>

          <Secao n={5} titulo="Cumulatividade e prioridade de descontos">
            <p style={{ margin: '0 0 10px' }}>
              O cupom/link pessoal de indicação <strong>não soma nem se sobrepõe</strong> a outras promoções,
              campanhas ou parcerias. Quando houver concorrência de descontos,
              {' '}<strong>o cupom ou link de campanha, promoção ou parceiro prevalece sobre o cupom do usuário</strong>.
            </p>
            <p style={{ margin: 0 }}>
              Para o titular, os <strong>30 dias são cumulativos e sem limite</strong> — é possível manter a
              assinatura ativa indefinidamente por meio de indicações.
            </p>
          </Secao>

          <Secao n={6} titulo="Cancelamento com prêmio acumulado">
            <p style={{ margin: 0, fontWeight: 700, color: '#6B0F1A' }}>
              Caso o titular com benefício acumulado cancele o próprio plano, ele manterá o direito de acesso
              apenas até expirar o prêmio (dias de crédito acumulados). Após esse período, o acesso é encerrado.
            </p>
          </Secao>

          <Secao n={7} titulo="Prevenção a fraudes">
            <p style={{ margin: '0 0 10px' }}>
              Para preservar a integridade do programa, <strong>não serão aceitas</strong> indicações que envolvam:
            </p>
            <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}>mesmo <strong>CPF ou CNPJ</strong> entre indicador e indicado;</li>
              <li style={{ marginBottom: 6 }}>mesmo <strong>e-mail</strong> ou mesmo <strong>telefone</strong>;</li>
              <li style={{ marginBottom: 6 }}>auto-indicação;</li>
              <li>contas criadas <strong>em sequência</strong> ou com indícios de duplicidade.</li>
            </ul>
            <p style={{ margin: 0 }}>
              Indicações reprovadas pela análise antifraude <strong>não geram recompensa</strong>. O Monitor de
              Licitações reserva-se o direito de <strong>suspender benefícios e contas</strong> em caso de uso
              indevido, abuso ou tentativa de burlar estas regras.
            </p>
          </Secao>

          <Secao n={8} titulo="Parceiros e afiliados">
            <p style={{ margin: 0 }}>
              Usuários com alto volume de indicações convertidas podem ser convidados a integrar o
              {' '}<strong>programa de afiliados</strong>, com condições próprias definidas em contrato.
              {' '}<strong>Afiliados não acumulam o benefício de 30 dias deste programa</strong> — aplicam-se
              exclusivamente as condições do contrato de afiliado, nunca os dois benefícios simultaneamente.
            </p>
          </Secao>

          <Secao n={9} titulo="Alterações e vigência">
            <p style={{ margin: 0 }}>
              O Monitor de Licitações pode <strong>alterar, suspender ou encerrar</strong> este programa a
              qualquer tempo, mediante aviso no site. As recompensas já liberadas <strong>serão preservadas</strong>.
              A participação no programa implica concordância integral com este regulamento.
            </p>
          </Secao>

          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #E8E4DC', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ background: '#6B0F1A', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }}>
              Convidar amigos →
            </Link>
            <Link href="/termos" style={{ color: '#6B0F1A', fontWeight: 600, fontSize: 14, padding: '12px 8px', textDecoration: 'none' }}>
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
