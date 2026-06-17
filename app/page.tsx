import Link from 'next/link'
import type { Metadata } from 'next'
import ContadorAoVivo from '@/app/components/ContadorAoVivo'
import TogglePeriodo from '@/app/components/TogglePeriodo'

// ─── SEO ─────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Monitor de Licitações — Alertas Automáticos de Licitações Públicas',
  description:
    'Receba alertas em tempo real de licitações públicas que combinam com o que sua empresa vende — por e-mail, Telegram e WhatsApp. Governo Federal, estados, municípios e estatais. Comece grátis por 7 dias.',
  keywords: [
    'monitor de licitações', 'alerta de licitações', 'licitações públicas',
    'edital de licitação', 'pregão eletrônico', 'PNCP', 'ComprasNet', 'BLL',
    'compras governamentais', 'contratação pública', 'fornecedor governo',
    'Portal Nacional de Contratações Públicas', 'monitoramento de licitações',
    'notificação licitação', 'licitações para MEI', 'licitações para pequenas empresas',
    'buscar editais públicos', 'dispensa de licitação', 'aviso de licitação',
    'sistema de alertas licitações', 'acompanhar editais', 'licitações Brasil',
  ],
  openGraph: {
    title: 'Monitor de Licitações — Nunca mais perca um contrato público',
    description:
      'O Monitor rastreia editais, dispensas e contratos do Governo Federal, estados, municípios e estatais — e avisa você por e-mail, Telegram ou WhatsApp antes que o prazo acabe.',
    url: 'https://monitordelicitacoes.com.br',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monitor de Licitações — Alertas automáticos de editais públicos',
    description: 'Receba alertas de licitações que combinam com o que você vende. 7 dias grátis, sem cartão.',
  },
  alternates: {
    canonical: 'https://monitordelicitacoes.com.br',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

// ─── Feature matrix ───────────────────────────────────────────────────────────
// Cada linha aparece em TODOS os cards — planos sem o recurso exibem "—"

// val = false → não incluso | string → label customizado | true → usa label padrão
type PlanId = 'trial' | 'basic' | 'profissional' | 'gestao' | 'empresarial'
type FeatureRow = { label: string } & Record<PlanId, string | boolean>

const FEATURE_ROWS: FeatureRow[] = [
  { label: 'Palavras-chave',             trial: 'Até 20 palavras-chave', basic: 'Até 20 palavras-chave', profissional: 'Ilimitadas palavras-chave', gestao: 'Ilimitadas palavras-chave', empresarial: 'Ilimitadas palavras-chave' },
  { label: 'Usuários',                   trial: '1 usuário',      basic: '1 usuário',      profissional: '1 usuário',      gestao: 'Até 5 usuários', empresarial: 'Até 15 usuários'},
  { label: 'Alertas por e-mail + Telegram', trial: true,          basic: true,             profissional: true,             gestao: true,             empresarial: true             },
  { label: 'Alertas por WhatsApp',       trial: false,            basic: false,            profissional: true,             gestao: true,             empresarial: true             },
  { label: 'Busca manual de editais no painel', trial: true,      basic: true,             profissional: true,             gestao: true,             empresarial: true             },
  { label: '🎯 Radar de Inteligência (contratos vencendo)', trial: false,   basic: false,            profissional: true,             gestao: true,             empresarial: true             },
  { label: '🤝 Diretório de Parceiros',  trial: false,            basic: false,            profissional: true,             gestao: true,             empresarial: true             },
  { label: '💰 Análise de Preços Vencedores', trial: '20 buscas de preços/mês', basic: '20 buscas de preços/mês', profissional: 'Buscas de preços ilimitadas', gestao: 'Buscas de preços ilimitadas', empresarial: 'Buscas de preços ilimitadas' },
  { label: '📊 Relatório semanal',       trial: true,             basic: true,             profissional: true,             gestao: true,             empresarial: true             },
]

const PLANOS = [
  {
    id: 'trial' as const,
    nome: 'Período de Teste',
    preco: null,
    porDia: 'Grátis',
    desc: 'Experimente sem compromisso',
    destaque: false,
    tag: '🎁 GRÁTIS',
    href: '/cadastro',
    btnText: 'Começar 7 dias grátis',
    note: 'Sem cartão de crédito',
  },
  {
    id: 'basic' as const,
    nome: 'Basic',
    preco: '49,90',
    preco_anual: '499',
    porDia: 'R$1,66/dia',
    porDia_anual: 'R$1,37/dia',
    desc: 'Para quem está começando no setor público',
    destaque: false,
    tag: null,
    href: '/checkout?plano=basic',
    btnText: 'Assinar agora →',
    note: '',
  },
  {
    id: 'profissional' as const,
    nome: 'Profissional',
    preco: '97,90',
    preco_anual: '979',
    porDia: 'R$3,26/dia',
    porDia_anual: 'R$2,68/dia',
    desc: 'Para quem fornece ativamente para o governo',
    destaque: false,
    tag: '🔥 MAIS POPULAR',
    href: '/checkout?plano=profissional',
    btnText: 'Assinar agora →',
    note: '',
  },
  {
    id: 'gestao' as const,
    nome: 'Gestão',
    preco: '197,90',
    preco_anual: '1.979',
    porDia: 'R$6,60/dia',
    porDia_anual: 'R$5,42/dia',
    desc: 'Para equipes comerciais que querem crescer',
    destaque: true,
    tag: '⭐ RECOMENDADO',
    href: '/checkout?plano=gestao',
    btnText: 'Assinar agora →',
    note: '',
  },
  {
    id: 'empresarial' as const,
    nome: 'Empresarial',
    preco: '497,00',
    preco_anual: '4.970',
    porDia: 'R$16,57/dia',
    porDia_anual: 'R$13,62/dia',
    desc: 'Para operações que dependem do setor público',
    destaque: false,
    tag: null,
    href: '/checkout?plano=empresarial',
    btnText: 'Assinar agora →',
    note: '',
  },
]

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Monitor de Licitações',
  url: APP_URL,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Procurement Monitoring',
  operatingSystem: 'Web',
  inLanguage: 'pt-BR',
  description:
    'Plataforma de monitoramento de licitações públicas brasileiras com alertas automáticos por e-mail, Telegram e WhatsApp. Monitora PNCP, ComprasNet, BLL e portais estaduais.',
  offers: [
    { '@type': 'Offer', price: '0',   priceCurrency: 'BRL', name: 'Trial 7 dias',        availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', price: '49.90',  priceCurrency: 'BRL', name: 'Plano Basic',       billingDuration: 'P1M', availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', price: '97.90',  priceCurrency: 'BRL', name: 'Plano Profissional', billingDuration: 'P1M', availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', price: '197.90', priceCurrency: 'BRL', name: 'Plano Gestão',      billingDuration: 'P1M', availability: 'https://schema.org/InStock' },
    { '@type': 'Offer', price: '497',    priceCurrency: 'BRL', name: 'Plano Empresarial', billingDuration: 'P1M', availability: 'https://schema.org/InStock' },
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Matutta Soluções Digitais',
    url: APP_URL,
  },
}

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Monitor de Licitações',
  url: APP_URL,
  logo: `${APP_URL}/og-image.png`,
  description: 'Plataforma de alertas automáticos de licitações públicas brasileiras — monitora PNCP, ComprasNet, BLL, editais estaduais e municipais.',
  areaServed: 'BR',
  knowsAbout: ['licitações públicas', 'pregão eletrônico', 'PNCP', 'contratação pública', 'compras governamentais'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'Portuguese',
  },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Preciso de cartão de crédito para começar?', acceptedAnswer: { '@type': 'Answer', text: 'Não. Os sete dias de teste são completamente gratuitos e sem burocracia. Você só cadastra uma forma de pagamento se decidir continuar após o período de teste.' } },
    { '@type': 'Question', name: 'Minha empresa é pequena. Isso funciona para mim?', acceptedAnswer: { '@type': 'Answer', text: 'Especialmente para você. O governo brasileiro tem cotas e benefícios para micro e pequenas empresas em licitações. MEI, ME e EPP têm vantagens legais que grandes empresas não têm. Falta apenas informação — e isso o Monitor resolve.' } },
    { '@type': 'Question', name: 'Como o sistema sabe quais editais combinam com meu negócio?', acceptedAnswer: { '@type': 'Answer', text: 'Você informa as palavras-chave do que vende, e nosso sistema inteligente lê o objeto de cada licitação publicada e identifica se há compatibilidade — mesmo que a redação do edital use termos diferentes dos seus.' } },
    { '@type': 'Question', name: 'Com que frequência recebo alertas?', acceptedAnswer: { '@type': 'Answer', text: 'Monitoramos continuamente de segunda a sexta, dentro do horário comercial. Assim que identificamos uma licitação compatível com o seu perfil, ela entra na fila de envio e chega para você em breve — sem sobrecarregar sua caixa de entrada.' } },
    { '@type': 'Question', name: 'Vocês monitoram empresas como Petrobras, Correios e Caixa?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. Além de todos os portais governamentais, monitoramos as principais estatais brasileiras: Petrobras, Caixa Econômica Federal, Correios, Eletrobras e SABESP.' } },
    { '@type': 'Question', name: 'Posso cancelar se não for o que esperava?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, sem burocracia. No plano mensal, o cancelamento encerra a renovação imediatamente. No plano anual, o cancelamento encerra a renovação automática e o acesso permanece ativo até o fim do período já pago.' } },
    { '@type': 'Question', name: 'O Diretório de Fornecedores é só para quem vende para o governo?', acceptedAnswer: { '@type': 'Answer', text: 'Não. Qualquer empresa pode se cadastrar no diretório — seja para ser encontrada por órgãos públicos, por outros usuários da plataforma ou por parceiros comerciais. O diretório funciona como uma vitrine aberta a todos os usuários: quem encontrar sua empresa entra em contato diretamente com você.' } },
  ],
}

export default function LandingPage() {
  return (
    <div className="font-sans bg-[#FAF6F0] text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[68px] bg-[rgba(250,246,240,0.97)] backdrop-blur-xl border-b border-[rgba(201,166,90,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[9px] bg-[#6B0F1A] flex items-center justify-center font-black text-xs text-[#C9A65A] shrink-0">ML</div>
          <span className="font-bold text-base text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </div>
        <nav className="flex items-center gap-1 md:gap-2">
          <Link href="#como-funciona" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Como funciona</Link>
          <Link href="/assinar" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Planos</Link>
          <Link href="/contato" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Contato</Link>
          <Link href="/login" className="px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Entrar</Link>
          <Link href="/cadastro" className="px-4 md:px-[22px] py-2.5 text-sm font-bold bg-[#6B0F1A] text-white no-underline rounded-[10px]">Começar grátis</Link>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#1A1A1C] px-6 md:px-[60px] py-[70px] md:py-[100px] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(107,15,26,0.45)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(201,166,90,0.1)_0%,transparent_65%)] pointer-events-none" />

        <div className="max-w-[920px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(201,166,90,0.08)] border border-[rgba(201,166,90,0.2)] mb-10">
            <div className="w-[7px] h-[7px] rounded-full bg-[#C9A65A] shadow-[0_0_8px_rgba(201,166,90,0.8)]" />
            <span className="text-xs font-semibold text-[#C9A65A] tracking-wide">Novo · Saiba o que o governo vai comprar antes do edital existir</span>
          </div>

          <h1 className="text-[42px] md:text-[70px] font-black leading-[1.05] tracking-[-0.04em] mb-8 text-white max-w-[860px]">
            Cada edital publicado sem você saber é{' '}
            <span className="text-[#C9A65A] italic font-normal" style={{ fontFamily: 'Georgia, serif' }}>dinheiro direto</span>{' '}
            no bolso do seu concorrente.
          </h1>

          <p className="text-base md:text-xl text-[rgba(255,255,255,0.6)] leading-relaxed mb-4 max-w-[640px]">
            O Monitor rastreia tudo que o setor público publica — editais, dispensas, contratos, avisos no Diário Oficial — e entrega as oportunidades que combinam com o que sua empresa vende, <strong className="text-[rgba(255,255,255,0.85)]">antes que o prazo comece a correr.</strong>
          </p>
          <p className="text-sm md:text-base text-[rgba(255,255,255,0.35)] leading-relaxed mb-12 max-w-[580px]">
            Do Governo Federal à Petrobras. Das prefeituras do interior às maiores capitais do país. Nenhum contrato público passa despercebido.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-16">
            <Link href="/cadastro" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold no-underline shadow-[0_8px_32px_rgba(107,15,26,0.55)]">
              Quero receber alertas agora →
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[rgba(255,255,255,0.45)]">✓ Sete dias completamente grátis</span>
              <span className="text-sm text-[rgba(255,255,255,0.45)]">✓ Sem cartão de crédito agora</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[rgba(255,255,255,0.07)]">
            {[
              { num: 'R$ 2 tri', label: 'em licitações por ano no Brasil' },
              { num: 'Todo dia útil', label: 'novos editais chegam antes das 9h' },
              { num: '< 5 dias', label: 'tempo médio de vida de um edital' },
              { num: '24h', label: 'para chegar o seu primeiro alerta' },
            ].map(({ num, label }, i) => (
              <div key={num} className={`pt-6 pb-2 px-4 md:px-5 ${i > 0 ? 'border-l border-[rgba(255,255,255,0.06)]' : ''}`}>
                <div className="text-xl md:text-[26px] font-black text-white tracking-tight mb-1">{num}</div>
                <div className="text-xs text-[rgba(255,255,255,0.3)] leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOR ── */}
      <section className="px-6 md:px-[60px] py-[70px] md:py-[100px] bg-[#FAF6F0]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Reconhece essa situação?</div>
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight leading-[1.1] text-[#1A1A1C]">
              Você está perdendo contratos<br className="hidden md:block" />que eram seus por direito.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: '😰', titulo: '"Descobri o edital depois do prazo"', desc: 'A licitação foi publicada, abriu e fechou em cinco dias. Você ficou sabendo uma semana depois — tarde demais.' },
              { icon: '😤', titulo: '"Meu concorrente ganhou sem eu saber"', desc: 'O contrato foi entregue. Você descobriu depois. O que você venderia tranquilamente foi parar no caixa de outra empresa.' },
              { icon: '😩', titulo: '"Não tenho tempo de verificar tudo"', desc: 'Cada estado tem um sistema. Cada prefeitura usa uma plataforma diferente. O Diário Oficial tem três seções. Monitorar tudo isso sozinho é humanamente impossível.' },
            ].map(c => (
              <div key={c.titulo} className="bg-white rounded-2xl p-7 border border-[#D5D2C8]">
                <div className="text-[32px] mb-3">{c.icon}</div>
                <div className="font-bold text-[15px] text-[#1A1A1C] mb-2.5 leading-snug">{c.titulo}</div>
                <p className="text-sm text-[#9AA0A6] leading-relaxed m-0">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#6B0F1A] rounded-[18px] p-8 md:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-lg md:text-[22px] font-bold text-white m-0 mb-1.5 leading-snug">Isso não é azar. É falta de informação a tempo.</p>
              <p className="text-sm md:text-[15px] text-[rgba(255,255,255,0.55)] m-0">O Monitor faz o trabalho de uma equipe inteira — Governo Federal, todos os estados, as maiores cidades, Petrobras e Caixa — e entrega só o que importa para o seu negócio.</p>
            </div>
            <Link href="/cadastro" className="shrink-0 px-7 py-3.5 rounded-[10px] bg-[#C9A65A] text-[#1A1A1C] font-bold text-[15px] no-underline whitespace-nowrap">
              Resolver isso agora →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="px-6 md:px-[60px] py-[70px] md:py-[100px] bg-white">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Simples. Automático. Eficaz.</div>
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight leading-[1.1] mb-4 text-[#1A1A1C]">
              Configure uma vez.<br className="hidden md:block" />Receba oportunidades para sempre.
            </h2>
            <p className="text-base md:text-lg text-[#9AA0A6] max-w-[540px] mx-auto leading-relaxed">
              Você define o que sua empresa vende. Nós monitoramos tudo e avisamos quando o governo quer comprar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { n: '1', icon: '⚡', title: 'Cadastre-se em dois minutos', desc: 'Sete dias grátis, sem cartão de crédito. Você começa a monitorar imediatamente após o cadastro.' },
              { n: '2', icon: '🎯', title: 'Informe o que você vende ou fornece', desc: 'Produtos, serviços, locações, obras, consultorias, TI — qualquer objeto de contratação pública, dos municípios do interior às maiores estatais do Brasil.' },
              { n: '3', icon: '📬', title: 'Receba alertas em tempo real', desc: 'Sempre que identificamos uma licitação compatível com seu perfil, o alerta chega por e-mail, Telegram ou WhatsApp — sem esperar o dia seguinte.' },
            ].map(step => (
              <div key={step.n} className="p-8 bg-[#FAF6F0] rounded-2xl border border-[#D5D2C8] relative">
                <div className="absolute top-5 right-5 text-[11px] font-black text-[#6B0F1A] opacity-15 tracking-wide">0{step.n}</div>
                <div className="text-[28px] mb-4">{step.icon}</div>
                <div className="font-bold text-base text-[#1A1A1C] mb-2 tracking-tight">{step.title}</div>
                <div className="text-sm text-[#9AA0A6] leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#1A1A1C] rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-14 items-start md:items-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(107,15,26,0.4)_0%,transparent_70%)] pointer-events-none" />
            <div className="flex-1 relative">
              <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#C9A65A] mb-3">Inteligência a seu favor</div>
              <h3 className="text-2xl md:text-[28px] font-black text-white mb-4 tracking-tight leading-snug">
                O sistema entende o que você vende — não apenas o que você escreveu.
              </h3>
              <p className="text-sm md:text-[15px] text-[rgba(255,255,255,0.5)] leading-relaxed m-0">
                Diferente dos buscadores comuns, nosso sistema interpreta contexto. Quem monitora <strong className="text-[rgba(255,255,255,0.8)]">"notebook"</strong> recebe alertas de <em>"equipamentos de informática"</em>, <em>"computadores portáteis"</em> e <em>"material de tecnologia"</em> também.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-[220px]">
              {[
                { kw: 'notebook', desc: '37 editais encontrados esta semana' },
                { kw: 'cadeira', desc: '52 editais encontrados esta semana' },
                { kw: 'ar condicionado', desc: '28 editais encontrados esta semana' },
              ].map(({ kw, desc }) => (
                <div key={kw} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 mb-2.5">
                  <div className="text-xs text-[#C9A65A] font-bold mb-1">{kw}</div>
                  <div className="text-[11px] text-[rgba(255,255,255,0.35)]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROVA SOCIAL ── */}
      <section className="px-6 md:px-[60px] py-[70px] md:py-[100px] bg-[#FAF6F0]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Resultados de quem chegou primeiro</div>
            <h2 className="text-3xl md:text-[40px] font-black tracking-tight mb-4 text-[#1A1A1C]">Quem monitora, vende mais para o governo.</h2>
            <p className="text-base md:text-[17px] text-[#9AA0A6] max-w-[520px] mx-auto">
              A diferença entre ganhar ou perder um contrato público quase sempre se resume a uma coisa: quem soube primeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { valor: 'R$ 127.000', desc: 'Contrato de notebooks para prefeitura do interior de MG', depoimento: '"O alerta chegou na segunda-feira. Na sexta já tínhamos enviado a proposta. Ganhamos o contrato. Sem o Monitor, nunca saberíamos que esse edital existia."', empresa: 'Distribuidora de TI — Belo Horizonte, MG', emoji: '💻' },
              { valor: 'R$ 84.500', desc: 'Fornecimento de cadeiras para escola estadual de SP', depoimento: '"Faturamos quase R$ 85 mil em um contrato que nem sabíamos que existia. O sistema me avisou antes de qualquer concorrente. Agora renovo todo mês."', empresa: 'Fabricante de móveis — Ubá, MG', emoji: '🪑' },
              { valor: 'R$ 43.200', desc: 'Material de higiene para câmara municipal de RJ', depoimento: '"Pensava que licitação era coisa de empresa grande. Com o Monitor, ganhei meu primeiro contrato com o governo em menos de 30 dias."', empresa: 'Distribuidora de limpeza — Rio de Janeiro, RJ', emoji: '🧴' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#D5D2C8] flex flex-col">
                <div className="text-[24px] mb-3">{t.emoji}</div>
                <div className="text-[28px] md:text-[30px] font-black text-[#6B0F1A] tracking-tight mb-1">{t.valor}</div>
                <div className="text-sm text-[#9AA0A6] mb-5">{t.desc}</div>
                <p className="text-sm text-[#4a4a4d] leading-[1.75] italic mb-auto pb-5">{t.depoimento}</p>
                <div className="text-xs text-[#9AA0A6] font-bold pt-5 border-t border-[#F0EDE8]">{t.empresa}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-[14px] p-5 md:p-7 border border-[#D5D2C8] flex items-start md:items-center gap-4">
            <div className="text-xl shrink-0">⏱</div>
            <p className="text-sm text-[#4a4a4d] m-0 leading-relaxed">
              <strong className="text-[#6B0F1A]">Editais fecham em média em cinco dias.</strong> Cada dia sem monitoramento é uma janela de oportunidade que fecha sem você. Empresas que começaram a monitorar esta semana já têm vantagem sobre as que vão começar na semana que vem.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARATIVO: MONITOR vs MANUALMENTE ── */}
      <section className="px-6 md:px-[60px] py-[60px] md:py-[80px] bg-white border-t border-[#F0EDE8]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">A diferença na prática</div>
            <h2 className="text-3xl md:text-[38px] font-black tracking-tight leading-[1.1] text-[#1A1A1C]">
              A cada edital que você não viu,<br className="hidden md:block" /> alguém já enviou a proposta.
            </h2>
            <p className="text-base text-[#9AA0A6] mt-4 max-w-[520px] mx-auto leading-relaxed">
              Não é falta de capacidade técnica. É falta de informação na hora certa. E isso tem solução.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 border-2 border-[#F0EDE8] bg-[#FAFAFA]">
              <div className="text-[11px] font-black tracking-wider uppercase text-[#9AA0A6] mb-5">❌ Sem o Monitor</div>
              {[
                ['Horas varrendo portais que publicam em sistemas diferentes', ''],
                ['Perde editais porque o governo chamou "parafuso" de "elemento de fixação"', ''],
                ['Descobre o edital perfeito — dois dias depois do prazo fechar', ''],
                ['Depende de rotina manual. Um dia esquece. Perde o contrato.', ''],
                ['Seu concorrente recebe o alerta. Você recebe a notícia depois.', ''],
              ].map(([item]) => (
                <div key={item} className="flex items-start gap-3 mb-3.5">
                  <span className="text-[#D5D2C8] text-lg leading-none mt-0.5 shrink-0">✕</span>
                  <span className="text-sm text-[#9AA0A6] leading-snug">{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-8 border-2 border-[#6B0F1A] bg-white shadow-[0_4px_24px_rgba(107,15,26,0.06)]">
              <div className="text-[11px] font-black tracking-wider uppercase text-[#6B0F1A] mb-5">✓ Com o Monitor</div>
              {[
                '5.500+ prefeituras e órgãos rastreados — zero esforço manual',
                'Lê o contexto do edital inteiro — encontra mesmo quando o nome é diferente',
                'Alerta chega com antecedência — tempo para verificar, orçar e montar a proposta',
                'E-mail, Telegram ou WhatsApp — no canal que você já usa',
                'Você chega primeiro. A proposta é sua.',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 mb-3.5">
                  <span className="text-[#6B0F1A] text-lg leading-none mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-[#1A1A1C] font-medium leading-snug">{item}</span>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-[#F0EDE8]">
                <Link href="/cadastro" className="block text-center py-3 rounded-[10px] bg-[#6B0F1A] text-white text-sm font-bold no-underline">
                  Começar agora — 7 dias grátis →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIRETÓRIO DE FORNECEDORES ── */}
      <section className="px-6 md:px-[60px] py-[60px] md:py-[80px] bg-white border-t border-[#F0EDE8]">
        <div className="max-w-[960px] mx-auto">
          <div className="bg-[#FAF6F0] rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-14 items-start md:items-center border border-[#D5D2C8]">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(107,15,26,0.07)]">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#6B0F1A]">Ferramenta exclusiva</span>
                </div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,166,90,0.12)', border: '1px solid rgba(201,166,90,0.35)' }}>
                  <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#92610a' }}>✦ Novidade</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-[30px] font-black text-[#1A1A1C] mb-3 tracking-tight leading-snug">
                O maior problema de quem compra<br className="hidden md:block" /> não é o preço. É achar um fornecedor de confiança.
              </h3>
              <p className="text-sm md:text-[15px] text-[#9AA0A6] leading-relaxed mb-2 m-0">
                Gestores públicos e compradores privados passam dias ligando, pesquisando e arriscando em fornecedores desconhecidos. Quando encontram um de confiança, voltam sempre.
              </p>
              <p className="text-sm md:text-[15px] text-[#4a4a4d] font-semibold leading-relaxed mb-5 m-0">
                O Diretório coloca sua empresa na frente de quem já decidiu comprar — e ainda não achou o fornecedor certo.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  '🎯 Visível para gestores e compradores ativos',
                  '📍 Filtrado por região e segmento',
                  '🔗 Contato direto — sem intermediários',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 bg-white border border-[#D5D2C8] rounded-[8px] px-3 py-2">
                    <span className="text-xs font-semibold text-[#1A1A1C]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 w-full md:w-[200px] space-y-3">
              {[
                { emoji: '🏗️', nome: 'Construtora Silva & Cia', regiao: 'Sudeste', seg: 'Construção' },
                { emoji: '💻', nome: 'Tech Solutions LTDA', regiao: 'Sul', seg: 'Tecnologia' },
                { emoji: '🧴', nome: 'Limpeza Total ME', regiao: 'Nordeste', seg: 'Limpeza' },
              ].map(f => (
                <div key={f.nome} className="bg-white border border-[#D5D2C8] rounded-[12px] px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{f.emoji}</span>
                    <span className="text-xs font-bold text-[#1A1A1C] leading-tight">{f.nome}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-[#9AA0A6] bg-[#F0EDE8] px-2 py-0.5 rounded">{f.regiao}</span>
                    <span className="text-[10px] text-[#9AA0A6] bg-[#F0EDE8] px-2 py-0.5 rounded">{f.seg}</span>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-[#9AA0A6] text-center pt-1">Exemplo ilustrativo do diretório</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FERRAMENTAS DE INTELIGÊNCIA: RADAR + PREÇOS ── */}
      <section className="px-6 md:px-[60px] py-[60px] md:py-[80px] bg-white border-t border-[#F0EDE8]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Vantagem competitiva real</div>
            <h2 className="text-3xl md:text-[38px] font-black tracking-tight leading-[1.1] text-[#1A1A1C] mb-4">
              Você que chega preparado<br className="hidden md:block" /> sempre vence quem chega surpreso.
            </h2>
            <p className="text-base text-[#9AA0A6] max-w-[520px] mx-auto leading-relaxed">
              Alertar quando o edital abre é o mínimo. O que separa quem ganha é saber antes — e saber por quanto vender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* RADAR */}
            <div className="bg-[#1A1A1C] rounded-[20px] p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
              <div className="absolute -bottom-12 -right-12 w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(107,15,26,0.5)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative">
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#C9A65A] mb-3">Radar de Inteligência</div>
                <h3 className="text-xl md:text-[24px] font-black text-white mb-3 tracking-tight leading-snug">
                  Saiba que o edital vai abrir <em>antes</em> de o edital abrir.
                </h3>
                <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed m-0 mb-5">
                  Todo contrato público tem validade. Quando vence, vai a licitação. O Radar monitora os contratos ativos e identifica os que vencem em 30, 60, 90 e 180 dias — <strong className="text-[rgba(255,255,255,0.75)]">você prepara a proposta enquanto o concorrente ainda não sabe que o edital vai existir.</strong>
                </p>
                <div className="space-y-2">
                  {[
                    { prazo: '≤ 30 dias', cor: '#ef4444', texto: 'O edital pode sair esta semana' },
                    { prazo: '31–60 dias', cor: '#f59e0b', texto: 'Monte documentação e orçamento agora' },
                    { prazo: '61–90 dias', cor: '#10b981', texto: 'Contate o órgão com antecedência' },
                  ].map(d => (
                    <div key={d.prazo} className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: d.cor + '20', color: d.cor }}>{d.prazo}</span>
                      <span className="text-xs text-[rgba(255,255,255,0.4)]">{d.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative text-[11px] text-[rgba(255,255,255,0.3)] border-t border-[rgba(255,255,255,0.08)] pt-4">
                Disponível nos planos Profissional, Gestão e Empresarial.
              </div>
            </div>

            {/* PREÇOS */}
            <div className="bg-[#FAF6F0] rounded-[20px] p-8 flex flex-col justify-between gap-6 border border-[#D5D2C8]">
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-3">Análise de Preços Vencedores</div>
                <h3 className="text-xl md:text-[24px] font-black text-[#1A1A1C] mb-3 tracking-tight leading-snug">
                  Pare de chutar preço. Saiba o que o governo pagou de verdade.
                </h3>
                <p className="text-sm text-[#9AA0A6] leading-relaxed m-0 mb-5">
                  Proposta alta demais: você perde. Baixa demais: é desclassificado por inexequibilidade. Nossa base reúne preços homologados em licitações reais desde 2021 — <strong className="text-[#4a4a4d]">a mediana que separa quem ganha de quem fica de fora.</strong>
                </p>
                <div className="bg-white border border-[#D5D2C8] rounded-[12px] p-5 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-2">Exemplo: "Notebook i5"</div>
                  {[
                    { label: 'Menor preço',     valor: 'R$ 2.890', cor: '#6B0F1A', peso: false },
                    { label: 'Mediana',          valor: 'R$ 3.450', cor: '#6B0F1A', peso: true  },
                    { label: 'Maior preço',      valor: 'R$ 5.200', cor: '#9AA0A6', peso: false },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#9AA0A6]">{r.label}</span>
                      <span className={`text-sm font-${r.peso ? 'black' : 'semibold'}`} style={{ color: r.cor }}>{r.valor}</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-[#9AA0A6] pt-2 border-t border-[#F0EDE8]">127 resultados encontrados · PNCP + Portal da Transparência</div>
                </div>
              </div>
              <div className="text-[11px] text-[#9AA0A6] border-t border-[#D5D2C8] pt-4">
                Basic e Trial: 20 buscas/mês · Profissional e acima: ilimitado.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="px-6 md:px-[60px] py-[70px] md:py-[100px] bg-[#FAF6F0]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-6">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Investimento mínimo. Retorno ilimitado.</div>
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight mb-3 text-[#1A1A1C]">
              A partir de R$1,66 por dia para nunca mais perder um contrato.
            </h2>
            <p className="text-base md:text-[17px] text-[#9AA0A6] max-w-[700px] mx-auto md:whitespace-nowrap">
              Escolha o plano ideal. Comece com 7 dias grátis — sem cartão de crédito.
            </p>
          </div>

          {/* Gatilho social + urgência */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="inline-flex items-center gap-3 bg-white border border-[#D5D2C8] rounded-full px-5 py-2.5 shadow-sm">
              <div className="flex -space-x-1.5">
                {['#6B0F1A','#C9A65A','#4a7a6b','#7a4a6b'].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <ContadorAoVivo />
            </div>
            <div className="inline-flex items-center gap-2 bg-[rgba(201,166,90,0.08)] border border-[rgba(201,166,90,0.25)] rounded-full px-4 py-2">
              <span className="text-[11px] font-bold text-[#6B0F1A]">⚡ Ativação imediata · Primeiros alertas chegam hoje</span>
            </div>
          </div>

          <TogglePeriodo planos={PLANOS} featureRows={FEATURE_ROWS} />

          {/* Garantia + urgência */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-[14px] p-5 border border-[#D5D2C8] flex items-center gap-3">
              <span className="text-2xl shrink-0">🔒</span>
              <div>
                <div className="text-sm font-bold text-[#1A1A1C]">Sem cartão agora</div>
                <div className="text-xs text-[#9AA0A6]">7 dias grátis para testar tudo sem risco</div>
              </div>
            </div>
            <div className="bg-white rounded-[14px] p-5 border border-[#D5D2C8] flex items-center gap-3">
              <span className="text-2xl shrink-0">↩</span>
              <div>
                <div className="text-sm font-bold text-[#1A1A1C]">Cancele quando quiser</div>
                <div className="text-xs text-[#9AA0A6]">Sem multa, sem burocracia, sem fidelidade</div>
              </div>
            </div>
            <div className="bg-[#6B0F1A] rounded-[14px] p-5 flex items-center gap-3">
              <span className="text-2xl shrink-0">⚡</span>
              <div>
                <div className="text-sm font-bold text-white">Ativação imediata</div>
                <div className="text-xs text-[rgba(255,255,255,0.55)]">Primeiro alerta chega em até 24h após o cadastro</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-7">
            <Link href="/assinar" className="text-sm text-[#6B0F1A] font-semibold no-underline">Ver comparação detalhada dos planos →</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 md:px-[60px] py-[70px] md:py-20 bg-[#FAF6F0]">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-3xl md:text-[36px] font-black tracking-tight text-center mb-2 text-[#1A1A1C]">Dúvidas frequentes</h2>
          <p className="text-center text-[#9AA0A6] text-base mb-12">Respondemos as principais dúvidas de quem está considerando monitorar licitações.</p>
          {[
            ['Preciso de cartão de crédito para começar?', 'Não. Os sete dias de teste são completamente gratuitos e sem burocracia. Você só cadastra uma forma de pagamento se decidir continuar após o período de teste.'],
            ['Minha empresa é pequena. Isso funciona para mim?', 'Especialmente para você. O governo brasileiro tem cotas e benefícios para micro e pequenas empresas em licitações. MEI, ME e EPP têm vantagens legais que grandes empresas não têm. Falta apenas informação — e isso o Monitor resolve.'],
            ['Como o sistema sabe quais editais combinam com meu negócio?', 'Você informa as palavras-chave do que vende, e nosso sistema inteligente lê o objeto de cada licitação publicada e identifica se há compatibilidade — mesmo que a redação do edital use termos diferentes dos seus.'],
            ['Com que frequência recebo alertas?', 'Monitoramos continuamente de segunda a sexta, dentro do horário comercial. Assim que identificamos uma licitação compatível com o seu perfil, ela entra na fila de envio e chega para você em breve — sem sobrecarregar sua caixa de entrada.'],
            ['Vocês monitoram empresas como Petrobras, Correios e Caixa?', 'Sim. Além de todos os portais governamentais, monitoramos as principais estatais brasileiras: Petrobras, Caixa Econômica Federal, Correios, Eletrobras e SABESP.'],
            ['Posso cancelar se não for o que esperava?', 'Sim, sem burocracia. No plano mensal, o cancelamento encerra a renovação imediatamente. No plano anual, o cancelamento encerra a renovação automática e o acesso permanece ativo até o fim do período já pago.'],
            ['O Diretório de Fornecedores é só para quem vende para o governo?', 'Não. Qualquer empresa pode se cadastrar no diretório — seja para ser encontrada por órgãos públicos, por outros usuários da plataforma ou por parceiros comerciais. O diretório funciona como uma vitrine aberta a todos os usuários: quem encontrar sua empresa entra em contato diretamente com você.'],
          ].map(([q, a], i) => (
            <details key={i} className="border-b border-[#D5D2C8]">
              <summary className="py-5 cursor-pointer font-semibold text-[15px] text-[#1A1A1C] flex justify-between items-center list-none">
                {q}
                <span className="text-[#6B0F1A] text-[22px] font-light shrink-0 ml-4 leading-none">+</span>
              </summary>
              <p className="pb-5 m-0 text-[15px] text-[#9AA0A6] leading-[1.75]">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-[#1A1A1C] px-6 md:px-[60px] py-[70px] md:py-[100px] text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(107,15,26,0.45)_0%,transparent_65%)] pointer-events-none" />
        <div className="relative z-10 max-w-[720px] mx-auto">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#C9A65A] mb-5">Sua decisão. Agora.</div>
          <h2 className="text-4xl md:text-[54px] font-normal text-white tracking-tight leading-[1.1] mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            O governo vai publicar novos editais amanhã de manhã. <em className="text-[#C9A65A]">Você vai saber?</em>
          </h2>
          <p className="text-base md:text-lg text-[rgba(255,255,255,0.45)] mb-3 leading-relaxed">
            Cada dia sem monitoramento é um dia em que seu concorrente leva vantagem. Configure o Monitor agora e receba os primeiros alertas — de graça, sem cartão, sem compromisso.
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.25)] mb-12">
            Do Governo Federal à Petrobras — cobertura nacional completa. Sete dias inteiramente grátis, sem cartão.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-2.5 px-10 py-5 rounded-[14px] bg-[#6B0F1A] text-white text-base md:text-[17px] font-bold no-underline shadow-[0_12px_40px_rgba(107,15,26,0.55)]">
            Quero meu acesso gratuito agora →
          </Link>
          <p className="text-xs text-[rgba(255,255,255,0.2)] mt-5">
            Cadastro em dois minutos · Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111113] px-10 py-7 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-[7px] bg-[#6B0F1A] flex items-center justify-center text-[10px] font-black text-[#C9A65A]">ML</div>
          <span className="text-sm text-[rgba(255,255,255,0.25)]">© 2021–{new Date().getFullYear()} Monitor de Licitações · Matutta Soluções Digitais</span>
        </div>
        <div className="flex gap-7 justify-center flex-wrap">
          {[['Início', '/'], ['Planos', '/assinar'], ['Contato', '/contato'], ['Entrar', '/login'], ['Cadastrar', '/cadastro'], ['Privacidade', '/privacidade'], ['Termos de Uso', '/termos']].map(([label, href]) => (
            <Link key={label} href={href} className="text-sm text-[rgba(255,255,255,0.3)] no-underline">{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
