import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planos e Preços — A partir de R$49,90/mês',
  description:
    'Compare os planos do Monitor de Licitações: Basic, Profissional, Gestão e Empresarial. A partir de R$49,90/mês. Palavras-chave ilimitadas, alertas por WhatsApp, Radar de Inteligência e Análise de Preços.',
  alternates: {
    canonical: 'https://monitordelicitacoes.com.br/assinar',
  },
  openGraph: {
    title: 'Planos do Monitor de Licitações — A partir de R$1,66/dia',
    description:
      'Escolha o plano ideal para monitorar licitações públicas. 7 dias grátis em todos os planos. Basic (R$49,90), Profissional (R$97,90), Gestão (R$197,90) e Empresarial.',
    url: 'https://monitordelicitacoes.com.br/assinar',
    type: 'website',
  },
}

export default function AssinarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
