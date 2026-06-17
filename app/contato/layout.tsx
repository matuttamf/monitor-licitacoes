import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato e Suporte',
  description:
    'Entre em contato com o Monitor de Licitações. Dúvidas sobre planos, suporte técnico, parcerias ou cancelamento — respondemos rapidamente pelo formulário ou WhatsApp.',
  alternates: {
    canonical: 'https://monitordelicitacoes.com.br/contato',
  },
}

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
