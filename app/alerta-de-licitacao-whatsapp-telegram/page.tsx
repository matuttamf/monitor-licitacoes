import Link from 'next/link'
import type { Metadata } from 'next'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'
import { MobileMenu } from '@/components/MobileMenu'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/alerta-de-licitacao-whatsapp-telegram`

export const metadata: Metadata = {
  title: 'Alerta de Licitação por WhatsApp e Telegram: Como Configurar em 2026',
  description:
    'Como receber alertas automáticos de licitações por WhatsApp, Telegram e e-mail. Monitoramento em tempo real de PNCP, ComprasNet e portais estaduais — sem precisar acessar os sites manualmente.',
  keywords: [
    'alerta de licitação por whatsapp',
    'alerta licitação whatsapp',
    'notificação licitação telegram',
    'monitoramento licitação tempo real',
    'alerta de licitação',
    'receber alertas licitação',
    'licitação por email',
    'notificação de editais',
    'monitoramento automático licitação',
    'licitação tempo real',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Alerta de Licitação por WhatsApp e Telegram: Como Configurar',
    description: 'Nunca mais perca um edital por não saber que existia. Configure alertas automáticos por WhatsApp, Telegram ou e-mail em menos de 5 minutos.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Receber Alertas de Licitação por WhatsApp, Telegram e E-mail',
  description: 'Guia completo para configurar monitoramento automático de licitações com alertas em tempo real nos principais canais de comunicação.',
  author: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  publisher: { '@type': 'Organization', name: 'Monitor de Licitações', url: BASE },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  inLanguage: 'pt-BR',
  datePublished: `${new Date().getFullYear()}-01-01`,
  dateModified: '2026-06-21',
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Como receber alertas de licitação no WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para receber alertas de licitação no WhatsApp, você precisa usar uma plataforma de monitoramento que ofereça integração com WhatsApp Business API. Cadastre as palavras-chave do que você vende, configure o canal de notificação como WhatsApp e o sistema enviará uma mensagem automática sempre que um edital compatível for publicado no PNCP, ComprasNet ou portais estaduais.',
      },
    },
    {
      '@type': 'Question',
      name: 'É possível receber alertas de licitação pelo Telegram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. O Telegram é excelente para alertas de licitação por ser gratuito, rápido e suportar bots. Plataformas de monitoramento enviam as notificações via Telegram Bot diretamente para seu chat pessoal ou grupo da empresa. O processo é simples: você recebe um link de ativação, clica, e começa a receber os alertas.',
      },
    },
    {
      '@type': 'Question',
      name: 'Por que monitorar licitações automaticamente é melhor que fazer manualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Monitoramento manual exige acessar cada portal (PNCP, ComprasNet, BLL, portais estaduais) todos os dias, em cada um fazer a busca com as palavras certas, e ainda assim pode perder editais publicados fora do horário de trabalho. Sistemas automáticos rastreiam 24 horas por dia, consolidam todos os portais num único lugar e te avisam no momento da publicação — com dias de antecedência para preparar a proposta.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quantas palavras-chave posso monitorar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende do plano. No Monitor de Licitações, o plano Basic permite até 20 palavras-chave e planos avançados têm limites maiores. Para a maioria das pequenas empresas, 5 a 10 palavras-chave bem escolhidas já são suficientes para capturar todas as oportunidades relevantes do segmento.',
      },
    },
    {
      '@type': 'Question',
      name: 'O alerta de licitação funciona para todos os estados do Brasil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. Plataformas de monitoramento como o Monitor de Licitações rastreiam portais nacionais (PNCP, ComprasNet, BLL) que cobrem licitações de todos os estados. Além disso, é possível filtrar por estado ou macrorregião — assim você recebe apenas editais de onde faz sentido para o seu negócio.',
      },
    },
  ],
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://monitordelicitacoes.com.br' },
    { '@type': 'ListItem', position: 2, name: 'Alerta de Licitação por WhatsApp e Telegram', item: 'https://monitordelicitacoes.com.br/alerta-de-licitacao-whatsapp-telegram' },
  ],
}

export default function AlertaWhatsappPagina() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[64px] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl border-b border-[#F0EDE8]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-[8px] bg-[#6B0F1A] flex items-center justify-center font-black text-[11px] text-[#C9A65A] shrink-0">ML</div>
          <span className="font-semibold text-sm text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavArticlesDropdown />
          <Link href="/assinar" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Planos</Link>
          <Link href="/login" className="hidden md:block px-3 py-2 text-sm text-[#6B7280] no-underline">Entrar</Link>
          <Link href="/cadastro" className="hidden md:block px-4 py-2 text-sm font-semibold bg-[#6B0F1A] text-white no-underline rounded-lg">Começar grátis</Link>
          <MobileMenu />
        </div>
      </header>

      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[680px] mx-auto">

          <div className="flex items-center gap-3 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <span>Alerta de licitações</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Monitoramento automático</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Alerta de licitação por WhatsApp e Telegram: configure em 5 minutos
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            Existe uma razão por que empresas que monitoram licitações automaticamente ganham mais contratos que as que buscam manualmente: <strong>chegam primeiro</strong>. Editais têm prazo médio de 8 dias úteis. Quem recebe o alerta no momento da publicação tem o dobro do tempo para preparar uma proposta competitiva. Quem descobre na última hora improvisa — e improviso raramente ganha pregão.
          </p>

          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste artigo</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#o-problema', 'O problema do monitoramento manual'],
                ['#como-funciona', 'Como funciona o alerta automático'],
                ['#whatsapp', 'Alerta por WhatsApp: vantagens e como ativar'],
                ['#telegram', 'Alerta por Telegram: o favorito das equipes'],
                ['#email', 'Alerta por e-mail: ainda o mais completo'],
                ['#palavras-chave', 'Como escolher as palavras-chave certas'],
                ['#portais', 'Quais portais são monitorados'],
                ['#faq', 'Perguntas frequentes'],
              ].map(([href, label], i) => (
                <li key={href}>
                  <a href={href as string} className="text-[#6B0F1A] no-underline hover:underline">
                    {i + 1}. {label as string}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section id="o-problema" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">O problema do monitoramento manual</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Hoje, sem um sistema automático, monitorar licitações significa:
            </p>
            <ul className="space-y-3 mb-5">
              {[
                'Acessar o PNCP, buscar suas palavras-chave, filtrar resultados',
                'Repetir no ComprasNet (Compras.gov.br) — sistema diferente, busca diferente',
                'Acessar a BLL, repetir o processo',
                'Verificar os portais estaduais do seu interesse (BEC-SP, LicitaNet, etc.)',
                'Fazer isso todos os dias úteis — de manhã, porque editais publicados à tarde serão vistos somente no dia seguinte',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-red-400 font-black shrink-0">✗</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Isso consome entre <strong>1 e 3 horas por dia</strong>. E ainda há o risco de errar a busca, usar a palavra errada ou simplesmente não checar no dia que o edital foi publicado.
            </p>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>O custo invisível do monitoramento manual:</strong> não é só o tempo perdido — é a oportunidade que você deixa de disputar porque não ficou sabendo a tempo.
            </div>
          </section>

          <section id="como-funciona" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Como funciona o alerta automático</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              O sistema de alerta é simples de configurar e funciona em segundo plano enquanto você cuida do seu negócio:
            </p>
            <ol className="space-y-4 mb-6">
              {[
                { t: 'Você cadastra as palavras-chave do que vende', d: 'Exemplos: "material de limpeza", "serviço de TI", "notebooks", "gêneros alimentícios". Quanto mais específico, menos ruído.' },
                { t: 'Escolhe os canais de alerta', d: 'E-mail (principal), Telegram (instantâneo) ou WhatsApp (para quem prefere tudo no mesmo lugar).' },
                { t: 'O sistema rastreia os portais 24h por dia', d: 'PNCP, ComprasNet, BLL e portais estaduais são verificados diariamente. Qualquer novo edital que contenha suas palavras-chave dispara o alerta.' },
                { t: 'Você recebe a notificação e decide em segundos', d: 'O alerta traz o título do edital, órgão, prazo, valor estimado e link direto. Você lê em 30 segundos e decide se vale entrar.' },
              ].map(({ t, d }, i) => (
                <li key={t} className="flex gap-4 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="w-7 h-7 rounded-full bg-[#6B0F1A] text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <div><strong className="text-[#1A1A1C] block mb-0.5">{t}</strong>{d}</div>
                </li>
              ))}
            </ol>
          </section>

          <section id="whatsapp" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Alerta por WhatsApp: vantagens e como ativar</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O WhatsApp é o canal mais familiar para a maioria dos empreendedores brasileiros. Receber o alerta lá elimina a necessidade de abrir outro aplicativo — a notificação chega onde você já está.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { k: 'Vantagem', v: 'Familiar, não exige novo aplicativo' },
                { k: 'Vantagem', v: 'Notificação chega instantaneamente' },
                { k: 'Vantagem', v: 'Fácil encaminhar para sócios' },
                { k: 'Atenção', v: 'Pode gerar ruído se não filtrar bem as palavras-chave' },
              ].map(({ k, v }, i) => (
                <div key={i} className={`p-3 rounded-lg border text-sm ${k === 'Vantagem' ? 'bg-[#F0FDF4] border-[#86EFAC]' : 'bg-[#FFF7ED] border-[#FDE68A]'}`}>
                  <div className={`text-xs font-bold mb-0.5 ${k === 'Vantagem' ? 'text-green-700' : 'text-yellow-700'}`}>{k}</div>
                  <div className="text-[#4a4a4d]">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              Para ativar: após criar sua conta no Monitor de Licitações, acesse Configurações → Notificações → WhatsApp e siga o processo de vinculação do número. O sistema envia uma mensagem de confirmação e a integração é ativada em menos de 2 minutos.
            </p>
          </section>

          <section id="telegram" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Alerta por Telegram: o favorito das equipes</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O Telegram é o canal preferido de equipes que gerenciam licitações — porque permite criar grupos, bots e canais sem custo. Um alerta enviado para um grupo de Telegram chega simultaneamente para toda a equipe comercial.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'Gratuito e sem limite de mensagens',
                'Bots de alerta são nativos do Telegram — altamente confiáveis',
                'Pode criar grupos por tipo de licitação ou região',
                'Histórico de mensagens fácil de pesquisar',
                'Funciona no celular, tablet e desktop simultaneamente',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              Para ativar: acesse Configurações → Notificações → Telegram, clique em "Conectar Bot", abra o link no Telegram e envie o comando /start. Pronto — os alertas chegam direto no chat com o bot.
            </p>
          </section>

          <section id="email" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Alerta por e-mail: ainda o mais completo</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O e-mail continua sendo o canal mais rico em informação. Um bom alerta por e-mail traz:
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'Título completo do objeto licitado',
                'Órgão responsável e localização',
                'Modalidade (pregão, dispensa, concorrência)',
                'Valor estimado (quando disponível no edital)',
                'Data e hora da sessão ou prazo de propostas',
                'Link direto para o edital no portal de origem',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Estratégia recomendada:</strong> use e-mail como canal principal (mais informação, fácil de organizar em pastas) e Telegram para alertas instantâneos da equipe. Os dois juntos cobrem todos os cenários.
            </div>
          </section>

          <section id="palavras-chave" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Como escolher as palavras-chave certas</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A qualidade dos alertas depende da qualidade das palavras-chave. O erro mais comum é usar termos genéricos e receber dezenas de alertas irrelevantes por dia.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div className="p-4 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl">
                <div className="text-green-700 text-xs font-bold uppercase tracking-wider mb-2">✓ Boas palavras-chave</div>
                <ul className="space-y-1 text-sm text-[#4a4a4d]">
                  {['"notebooks Dell"', '"serviço de limpeza hospitalar"', '"câmeras de segurança IP"', '"merenda escolar PNAE"', '"manutenção predial"'].map(k => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-[#FFF1F2] border border-[#FDA4AF] rounded-xl">
                <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-2">✗ Palavras-chave ruins</div>
                <ul className="space-y-1 text-sm text-[#4a4a4d]">
                  {['"serviços"', '"equipamentos"', '"informática"', '"fornecimento"', '"materiais"'].map(k => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm text-[#4a4a4d]">
              Veja exemplos por segmento em{' '}
              <Link href="/como-monitorar-licitacoes#palavras-chave" className="text-[#6B0F1A] no-underline hover:underline font-semibold">Como monitorar licitações →</Link>
            </p>
          </section>

          <section id="portais" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Quais portais são monitorados</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { n: 'PNCP', d: 'Portal Nacional de Contratações Públicas — obrigatório para governo federal' },
                { n: 'ComprasNet', d: 'Compras.gov.br — sistema federal com grande volume de pregões' },
                { n: 'BLL', d: 'Bolsa de Licitações — muito usado por municípios e estatais' },
                { n: 'Portais estaduais', d: 'BEC-SP, LicitaNet, e-Licitações e outros — varia por estado' },
              ].map(({ n, d }) => (
                <div key={n} className="p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8]">
                  <div className="font-bold text-[#1A1A1C] text-sm mb-1">{n}</div>
                  <div className="text-xs text-[#6B7280] leading-relaxed">{d}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Configure em 5 minutos</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              Receba alertas de licitações por e-mail e Telegram
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              Cadastre as palavras-chave do que você vende e o Monitor te avisa automaticamente quando novos editais compatíveis são publicados.
            </p>
            <Link href="/cadastro" className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Criar conta gratuita — 7 dias grátis →
            </Link>
          </div>

          <section id="faq" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-6">Perguntas frequentes</h2>
            <div className="space-y-3">
              {faqLd.mainEntity.map((item) => (
                <details key={item.name} className="border border-[#F0EDE8] rounded-xl overflow-hidden">
                  <summary className="px-5 py-4 cursor-pointer font-semibold text-sm text-[#1A1A1C] list-none flex items-center justify-between gap-2">
                    {item.name}
                    <span className="text-[#6B0F1A] text-lg shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[#4a4a4d] leading-relaxed border-t border-[#F0EDE8] pt-3">
                    {item.acceptedAnswer.text}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <div className="border-t border-[#F0EDE8] pt-8 mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9AA0A6] mb-4">Continue lendo</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/como-monitorar-licitacoes', label: 'Como monitorar licitações públicas' },
                { href: '/comprasnet-vs-pncp-vs-bll', label: 'ComprasNet vs PNCP vs BLL' },
                { href: '/como-ganhar-primeiro-contrato-publico', label: 'Como ganhar o primeiro contrato' },
                { href: '/guia-modalidades-licitacao', label: 'Modalidades de licitação' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8] no-underline text-sm font-semibold text-[#1A1A1C] hover:border-[#C9A65A] transition-colors">
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-[#F0EDE8] px-6 py-8 text-center text-xs text-[#9AA0A6]">
        <div className="flex justify-center gap-4 mb-3">
          <Link href="/privacidade" className="text-[#9AA0A6] no-underline hover:underline">Privacidade</Link>
          <Link href="/termos" className="text-[#9AA0A6] no-underline hover:underline">Termos</Link>
          <Link href="/contato" className="text-[#9AA0A6] no-underline hover:underline">Contato</Link>
          <Link href="/licitacoes-para" className="text-[#9AA0A6] no-underline hover:underline">Segmentos</Link>
        </div>
        © {new Date().getFullYear()} Monitor de Licitações — Todos os direitos reservados
      </footer>
    </div>
  )
}
