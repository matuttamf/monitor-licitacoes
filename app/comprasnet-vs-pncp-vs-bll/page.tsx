import Link from 'next/link'
import type { Metadata } from 'next'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/comprasnet-vs-pncp-vs-bll`

export const metadata: Metadata = {
  title: 'ComprasNet vs PNCP vs BLL: Qual Portal de Licitações Usar em 2026?',
  description:
    'Comparativo completo entre os três principais portais de licitações do Brasil: ComprasNet (Compras.gov.br), PNCP e BLL. Entenda as diferenças, volumes de editais e qual monitorar primeiro.',
  keywords: [
    'comprasnet vs pncp',
    'bl compras licitações',
    'comprasnet licitações',
    'pncp portal nacional contratações públicas',
    'bll licitações',
    'portal de licitações',
    'comprasnet compras gov br',
    'diferença comprasnet pncp bll',
    'portais licitação brasil',
    'onde pesquisar licitações',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ComprasNet vs PNCP vs BLL: Qual Portal de Licitações Usar?',
    description: 'Diferenças, volumes e estratégia de monitoramento dos três maiores portais de licitações do Brasil — para você não perder nenhum edital.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'ComprasNet vs PNCP vs BLL: Comparativo Completo dos Portais de Licitação',
  description: 'Comparativo detalhado dos três principais portais de licitações públicas do Brasil: volumes, funcionamento, diferenças e estratégia de monitoramento.',
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
      name: 'Qual é a diferença entre ComprasNet e PNCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O ComprasNet (Compras.gov.br) é o sistema federal de compras em operação desde 2000, com vasto histórico de pregões eletrônicos. O PNCP (Portal Nacional de Contratações Públicas) é o portal oficial criado pela Lei 14.133/2021 (Nova Lei de Licitações) e obrigatório para o governo federal desde 2024. Ambos publicam licitações federais, mas o PNCP está se tornando o sistema principal enquanto o ComprasNet é o legado.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que é a BLL e quem usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A BLL (Bolsa de Licitações e Leilões) é um portal privado de grande uso entre municípios, estados e empresas estatais. Não é um sistema do governo federal, mas tem credenciamento do governo. Muitas prefeituras e alguns estados optam pela BLL pela facilidade de uso e suporte oferecido. Tem grande volume de pregões eletrônicos fora do ambiente federal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso monitorar os três portais ao mesmo tempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, se você quer garantir cobertura completa. Uma licitação de prefeitura pode estar no BLL; uma licitação federal no PNCP ou ComprasNet; uma autarquia estadual pode usar um portal próprio. A estratégia mais eficiente é usar uma plataforma de monitoramento que consolide todos os portais em um único lugar e te avise por e-mail ou Telegram.',
      },
    },
    {
      '@type': 'Question',
      name: 'O ComprasNet vai acabar com o PNCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O ComprasNet não vai "acabar" imediatamente, mas está em processo de migração gradual para o PNCP, que é o novo padrão legal. Para licitações federais, o PNCP já é obrigatório. O ComprasNet ainda tem grande volume de contratos em andamento e histórico, então ambos coexistirão por algum tempo. Para quem monitora licitações, a recomendação é monitorar os dois.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como saber em qual portal está a licitação que me interessa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende do órgão. Governo federal (ministérios, autarquias, fundações): PNCP e ComprasNet. Municípios: BLL, Licitanet ou portais estaduais. Estados: cada estado tem seu portal (BEC-SP para São Paulo, por exemplo). A forma mais prática é usar um sistema de monitoramento que busque em todos os portais simultaneamente.',
      },
    },
  ],
}

export default function PortaisComparativoPagina() {
  return (
    <div className="font-sans bg-white text-[#1A1A1C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-[60px] h-[64px] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl border-b border-[#F0EDE8]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-[8px] bg-[#6B0F1A] flex items-center justify-center font-black text-[11px] text-[#C9A65A] shrink-0">ML</div>
          <span className="font-semibold text-sm text-[#1A1A1C] tracking-tight hidden sm:block">Monitor de Licitações</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavArticlesDropdown />
          <Link href="/assinar" className="hidden md:block px-4 py-2 text-sm text-[#4a4a4d] no-underline font-medium">Planos</Link>
          <Link href="/login" className="px-3 py-2 text-sm text-[#6B7280] no-underline">Entrar</Link>
          <Link href="/cadastro" className="px-4 py-2 text-sm font-semibold bg-[#6B0F1A] text-white no-underline rounded-lg">Começar grátis</Link>
        </div>
      </header>

      <main className="px-6 md:px-8 py-10 md:py-16">
        <article className="max-w-[680px] mx-auto">

          <div className="flex items-center gap-3 text-sm text-[#9AA0A6] mb-6">
            <Link href="/" className="text-[#6B0F1A] no-underline hover:underline">Início</Link>
            <span>›</span>
            <span>Portais de licitação</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Comparativo</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            ComprasNet vs PNCP vs BLL: qual portal de licitações você precisa monitorar?
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            Existem dezenas de portais de licitação no Brasil. Mas a grande maioria do volume — federal, estadual e municipal — passa por três: <strong>ComprasNet</strong>, <strong>PNCP</strong> e <strong>BLL</strong>. Se você monitorar apenas um deles, está deixando a maior parte do mercado de fora. Este guia explica as diferenças e como cobrir os três sem perder tempo.
          </p>

          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste artigo</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#visao-geral', 'Visão geral dos três portais'],
                ['#comprasnet', 'ComprasNet (Compras.gov.br)'],
                ['#pncp', 'PNCP — o novo padrão federal'],
                ['#bll', 'BLL — o portal dos municípios'],
                ['#comparativo', 'Tabela comparativa'],
                ['#estrategia', 'Estratégia: qual monitorar primeiro?'],
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

          <section id="visao-geral" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-5">Visão geral dos três portais</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                { n: 'ComprasNet', badge: 'Federal / Legado', cor: '#6B0F1A', desc: 'Sistema histórico do governo federal. Alto volume de pregões ainda em andamento.' },
                { n: 'PNCP', badge: 'Federal / Novo padrão', cor: '#1d4ed8', desc: 'Obrigatório para novos processos federais desde 2024. Padrão da Nova Lei de Licitações.' },
                { n: 'BLL', badge: 'Municipal / Estadual', cor: '#065f46', desc: 'Portal privado com grande adesão de municípios e estatais. Alto volume fora do federal.' },
              ].map(({ n, badge, cor, desc }) => (
                <div key={n} className="p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8]">
                  <div className="font-black text-lg text-[#1A1A1C] mb-1">{n}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: cor }}>{badge}</div>
                  <div className="text-xs text-[#6B7280] leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="comprasnet" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">ComprasNet (Compras.gov.br)</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O ComprasNet é o sistema de compras do governo federal em operação desde 2000. Historicamente o maior portal de licitações do Brasil, concentra principalmente <strong>pregões eletrônicos federais</strong> e tem um histórico imenso de processos e contratos.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { k: 'Quem usa', v: 'Ministérios, autarquias, fundações e órgãos federais' },
                { k: 'Modalidade principal', v: 'Pregão eletrônico' },
                { k: 'Cadastro (SICAF)', v: 'Obrigatório para participar de licitações federais' },
                { k: 'Status em 2026', v: 'Coexiste com o PNCP; novos processos migram para o PNCP gradualmente' },
              ].map(({ k, v }) => (
                <div key={k} className="p-3 bg-[#FAF6F0] rounded-lg border border-[#F0EDE8]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-1">{k}</div>
                  <div className="text-sm text-[#1A1A1C] font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Atenção:</strong> o endereço oficial é <strong>compras.gov.br</strong> (integrado ao gov.br). Sites com URLs parecidas podem ser falsos — sempre acesse pelo endereço oficial.
            </div>
          </section>

          <section id="pncp" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">PNCP — o novo padrão federal</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O <strong>Portal Nacional de Contratações Públicas (PNCP)</strong> foi criado pela Lei 14.133/2021 — a Nova Lei de Licitações — como o portal unificado e obrigatório para publicação de licitações públicas. Desde 2024, o governo federal é obrigado a publicar no PNCP todos os novos processos.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'Padrão legal obrigatório para o governo federal a partir de 2024',
                'Integra dados de todos os portais cadastrados, inclusive estaduais e municipais que optaram por integração',
                'API aberta — permite integração com sistemas de monitoramento',
                'Publicação de contratos, atas de registro de preços e termos aditivos',
                'Busca unificada — mas o volume ainda está crescendo conforme a migração avança',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              O PNCP é onde o mercado federal vai se concentrar. Monitorar o PNCP é <strong>obrigatório</strong> para quem quer vender para o governo federal.
            </p>
          </section>

          <section id="bll" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">BLL — o portal dos municípios</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A <strong>BLL (Bolsa de Licitações e Leilões)</strong> é um portal privado credenciado pelos governos estaduais. Tem grande adesão entre prefeituras, especialmente nas regiões Sul, Sudeste e Centro-Oeste, e também é usado por empresas estatais e algumas autarquias estaduais.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { k: 'Gestora', v: 'BLL — empresa privada credenciada' },
                { k: 'Quem usa', v: 'Prefeituras, câmaras municipais, estatais, alguns estados' },
                { k: 'Modalidades', v: 'Pregão eletrônico, dispensa eletrônica, concorrência' },
                { k: 'Destaque', v: 'Forte no interior de SP, PR, SC, RS e MT' },
              ].map(({ k, v }) => (
                <div key={k} className="p-3 bg-[#FAF6F0] rounded-lg border border-[#F0EDE8]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-1">{k}</div>
                  <div className="text-sm text-[#1A1A1C] font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              Se o seu mercado são municípios do Sul e Sudeste, ignorar a BLL é ignorar uma fatia enorme do mercado. Muitas empresas que monitoram só o ComprasNet perdem boa parte das oportunidades municipais.
            </p>
          </section>

          <section id="comparativo" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-5">Tabela comparativa</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-[#6B0F1A] text-white">
                    <th className="px-4 py-3 text-left font-bold text-xs">Critério</th>
                    <th className="px-4 py-3 text-left font-bold text-xs">ComprasNet</th>
                    <th className="px-4 py-3 text-left font-bold text-xs">PNCP</th>
                    <th className="px-4 py-3 text-left font-bold text-xs">BLL</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Esfera', 'Federal', 'Federal (+ outros)', 'Municipal / Estadual'],
                    ['Gestão', 'Governo federal', 'Governo federal', 'Empresa privada'],
                    ['Volume federal', 'Alto (histórico)', 'Crescendo', 'Baixo'],
                    ['Volume municipal', 'Baixo', 'Médio (crescendo)', 'Alto'],
                    ['Obrigatoriedade', 'Legado federal', 'Obrigatório (2024+)', 'Opcional (credenciada)'],
                    ['Cadastro necessário', 'SICAF', 'SICAF (federal)', 'Cadastro BLL'],
                    ['API pública', 'Limitada', 'Sim (aberta)', 'Limitada'],
                  ].map(([crit, cnet, pncp, bll], i) => (
                    <tr key={crit} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAF6F0]'}>
                      <td className="px-4 py-3 font-semibold text-[#1A1A1C] border-b border-[#F0EDE8]">{crit}</td>
                      <td className="px-4 py-3 text-[#4a4a4d] border-b border-[#F0EDE8]">{cnet}</td>
                      <td className="px-4 py-3 text-[#4a4a4d] border-b border-[#F0EDE8]">{pncp}</td>
                      <td className="px-4 py-3 text-[#4a4a4d] border-b border-[#F0EDE8]">{bll}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="estrategia" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Estratégia: qual monitorar primeiro?</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              A resposta depende de quem é seu cliente-alvo:
            </p>
            <div className="space-y-4 mb-6">
              {[
                {
                  perfil: 'Você vende para o governo federal',
                  portais: 'PNCP + ComprasNet',
                  desc: 'O PNCP é obrigatório para novos processos e o ComprasNet ainda tem volume significativo em andamento. Monitore os dois.',
                },
                {
                  perfil: 'Você vende para municípios (Sul/Sudeste)',
                  portais: 'BLL + PNCP',
                  desc: 'A BLL concentra grande parte dos pregões municipais dessas regiões. O PNCP está crescendo também nessa esfera.',
                },
                {
                  perfil: 'Você quer cobertura nacional',
                  portais: 'ComprasNet + PNCP + BLL',
                  desc: 'Os três portais juntos cobrem a grande maioria das oportunidades do Brasil. Use um sistema de monitoramento para não precisar acessar cada um manualmente.',
                },
              ].map(({ perfil, portais, desc }) => (
                <div key={perfil} className="p-4 border border-[#F0EDE8] rounded-xl">
                  <div className="font-bold text-[#1A1A1C] text-sm mb-1">{perfil}</div>
                  <div className="text-[11px] font-semibold text-[#6B0F1A] uppercase tracking-wider mb-2">{portais}</div>
                  <div className="text-sm text-[#4a4a4d] leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Dica prática:</strong> além dos três portais principais, cada estado tem seu próprio sistema (BEC-SP para São Paulo, LicitaNet, e-Licitações, etc.). Uma plataforma de monitoramento que consolide todos em um feed único é a forma mais eficiente de garantir cobertura sem triplicar o trabalho.
            </div>
          </section>

          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Monitore tudo de um lugar só</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              ComprasNet, PNCP e BLL — sem precisar acessar cada portal
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              O Monitor de Licitações rastreia os principais portais e te avisa por e-mail e Telegram quando um edital compatível com seu segmento é publicado.
            </p>
            <Link href="/cadastro" className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Testar grátis por 7 dias →
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
                { href: '/alerta-de-licitacao-whatsapp-telegram', label: 'Alertas por WhatsApp e Telegram' },
                { href: '/documentos-para-habilitacao-em-licitacoes', label: 'Documentos para habilitação' },
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
