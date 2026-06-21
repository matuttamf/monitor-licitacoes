import Link from 'next/link'
import type { Metadata } from 'next'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'
import { MobileMenu } from '@/components/MobileMenu'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/documentos-para-habilitacao-em-licitacoes`

export const metadata: Metadata = {
  title: 'Documentos para Habilitação em Licitações: Lista Completa 2026',
  description:
    'Lista completa de documentos para habilitação em licitações: certidões negativas, documentação jurídica, fiscal e técnica. Saiba o que manter sempre atualizado para não ser inabilitado.',
  keywords: [
    'documentos para habilitação em licitações',
    'certidões negativas para licitação',
    'documentos para licitação',
    'habilitação licitação',
    'certidão negativa licitação',
    'documentação licitação',
    'sicaf documentos',
    'regularidade fiscal licitação',
    'habilitação jurídica licitação',
    'qualificação técnica licitação',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Documentos para Habilitação em Licitações: Lista Completa',
    description: 'Tudo que você precisa ter em dia para não ser inabilitado em uma licitação — certidões, documentos jurídicos, fiscais e técnicos explicados de forma clara.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Documentos para Habilitação em Licitações: Lista Completa com Prazos e Onde Emitir',
  description: 'Guia prático com todos os documentos necessários para a fase de habilitação em licitações públicas, incluindo certidões negativas, documentação jurídica, fiscal, técnica e econômico-financeira.',
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
      name: 'O que é a fase de habilitação em uma licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A fase de habilitação é quando o órgão público verifica se a empresa licitante está apta a participar da licitação — ou seja, se existe juridicamente, está em dia com suas obrigações fiscais e trabalhistas, tem capacidade técnica para entregar o objeto, e possui saúde financeira mínima. Nos pregões eletrônicos, a habilitação ocorre após a etapa de lances, apenas para o vencedor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Posso participar de licitação sem SICAF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para licitações federais (via ComprasNet ou PNCP), o cadastro no SICAF (Sistema de Cadastramento Unificado de Fornecedores) é obrigatório. Para licitações estaduais e municipais, o cadastro exigido varia — alguns aceitam o SICAF como substituto, outros têm seu próprio sistema de cadastro. Verificar o edital sempre é o passo correto.',
      },
    },
    {
      '@type': 'Question',
      name: 'Com que frequência devo renovar as certidões?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A maioria das certidões negativas tem validade de 90 a 180 dias. O SICAF mantém essas certidões automaticamente se você as inserir no sistema. A recomendação prática é verificar a validade de todas as certidões mensalmente e renovar qualquer uma que vença em menos de 30 dias — assim você estará sempre pronto para participar de qualquer licitação sem urgência.',
      },
    },
    {
      '@type': 'Question',
      name: 'O que é qualificação técnica e quando é exigida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Qualificação técnica é a comprovação de que a empresa já executou serviços ou forneceu produtos similares ao objeto da licitação. Pode ser exigida na forma de atestados de capacidade técnica (declarações assinadas por clientes anteriores), certidões de acervo técnico do CREA/CAU (para obras) ou simplesmente certificados e registros no conselho de classe da área. A exigência varia conforme o objeto e o edital.',
      },
    },
    {
      '@type': 'Question',
      name: 'MEI pode participar de licitação?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, MEI pode participar de licitações. A documentação de habilitação para MEI é mais simples — o Certificado da Condição de Microempreendedor Individual (CCMEI) substitui vários documentos jurídicos. O MEI também tem as vantagens da LC 123/2006: empate ficto (direito de cobertura de proposta) e possibilidade de regularizar certidões negativas em até 5 dias úteis após a declaração de vencedor.',
      },
    },
  ],
}

type Documento = { doc: string; validade: string; onde: string }

const documentosJuridicos: Documento[] = [
  { doc: 'Ato constitutivo / Contrato social (última alteração consolidada)', validade: 'Enquanto vigente', onde: 'Junta Comercial' },
  { doc: 'Registro comercial (empresário individual)', validade: 'Enquanto vigente', onde: 'Junta Comercial' },
  { doc: 'CNPJ / Cartão CNPJ atualizado', validade: 'Sem validade', onde: 'Receita Federal (online)' },
  { doc: 'RG e CPF dos sócios / representantes', validade: 'Sem validade', onde: 'SSP / RFB' },
]

const documentosFiscais: Documento[] = [
  { doc: 'CND Federal (Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa)', validade: '180 dias', onde: 'Receita Federal / PGFN (certidaointernet.receita.fazenda.gov.br)' },
  { doc: 'CND Estadual (ICMS)', validade: '90 dias', onde: 'Secretaria de Fazenda do Estado (site da SEFAZ)' },
  { doc: 'CND Municipal (ISS)', validade: '90 dias', onde: 'Prefeitura do município-sede da empresa' },
  { doc: 'CRF — Certificado de Regularidade do FGTS', validade: '30 dias', onde: 'Caixa Econômica Federal (consulta online)' },
  { doc: 'CNDT — Certidão Negativa de Débitos Trabalhistas', validade: '180 dias', onde: 'TST (cndt.tst.jus.br)' },
]

const documentosTecnicos: Documento[] = [
  { doc: 'Atestado(s) de capacidade técnica (serviços similares prestados)', validade: 'Sem validade', onde: 'Emitido pelo cliente anterior — assinar e reconhecer firma se exigido' },
  { doc: 'Registro no conselho de classe (quando aplicável)', validade: 'Anual', onde: 'CREA, CRM, OAB, CRC, etc.' },
  { doc: 'Acervo técnico (obras de engenharia)', validade: 'Sem validade', onde: 'CREA — Certidão de Acervo Técnico (CAT)' },
]

const documentosFinanceiros: Documento[] = [
  { doc: 'Balanço Patrimonial (último exercício fiscal)', validade: 'Anual', onde: 'Assinado por contador registrado no CRC' },
  { doc: 'Capital social mínimo ou patrimônio líquido (conforme edital)', validade: 'Conforme balanço', onde: 'Balanço Patrimonial' },
  { doc: 'Certidão Negativa de Falência e Recuperação Judicial', validade: '30–90 dias (varia)', onde: 'Tribunal de Justiça do estado-sede' },
]

function TabelaDocumentos({ docs }: { docs: Documento[] }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full text-sm border-collapse min-w-[520px]">
        <thead>
          <tr className="bg-[#FAF6F0] border-b-2 border-[#E8E4DC]">
            <th className="px-4 py-3 text-left font-bold text-xs text-[#6B7280] uppercase tracking-wider">Documento</th>
            <th className="px-4 py-3 text-left font-bold text-xs text-[#6B7280] uppercase tracking-wider w-[110px]">Validade</th>
            <th className="px-4 py-3 text-left font-bold text-xs text-[#6B7280] uppercase tracking-wider">Onde emitir</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(({ doc, validade, onde }, i) => (
            <tr key={doc} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAF6F0]'}>
              <td className="px-4 py-3 text-[#1A1A1C] leading-snug border-b border-[#F0EDE8]">{doc}</td>
              <td className="px-4 py-3 text-[#6B0F1A] font-semibold border-b border-[#F0EDE8] whitespace-nowrap">{validade}</td>
              <td className="px-4 py-3 text-[#4a4a4d] border-b border-[#F0EDE8]">{onde}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DocumentosHabilitacaoPagina() {
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
            <span>Habilitação</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Guia prático</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Documentos para habilitação em licitações: lista completa e atualizada
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            Ganhar o pregão e ser <strong>inabilitado na documentação</strong> é uma das experiências mais frustrantes de quem participa de licitações. Você teve a melhor proposta, mas uma certidão vencida ou um documento errado te tira do contrato. Este guia traz a lista completa de documentos — organizados por categoria — com validade e onde emitir cada um.
          </p>

          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste artigo</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#o-que-e-habilitacao', 'O que é habilitação e quando ocorre'],
                ['#juridica', 'Habilitação jurídica'],
                ['#fiscal', 'Regularidade fiscal e trabalhista'],
                ['#tecnica', 'Qualificação técnica'],
                ['#financeira', 'Qualificação econômico-financeira'],
                ['#sicaf', 'O papel do SICAF'],
                ['#checklist', 'Checklist de manutenção mensal'],
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

          <section id="o-que-e-habilitacao" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">O que é habilitação e quando ocorre</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              A <strong>habilitação</strong> é a fase da licitação em que o órgão público verifica se a empresa está apta a celebrar o contrato. Quatro aspectos são analisados:
            </p>
            <ol className="space-y-3 mb-5">
              {[
                { t: 'Habilitação jurídica', d: 'A empresa existe legalmente e está regularmente constituída' },
                { t: 'Regularidade fiscal e trabalhista', d: 'A empresa está em dia com impostos federais, estaduais, municipais, FGTS e débitos trabalhistas' },
                { t: 'Qualificação técnica', d: 'A empresa tem capacidade comprovada para executar o objeto' },
                { t: 'Qualificação econômico-financeira', d: 'A empresa tem saúde financeira para cumprir o contrato' },
              ].map(({ t, d }, i) => (
                <li key={t} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-[#6B0F1A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <div><strong className="text-[#1A1A1C]">{t}:</strong> {d}</div>
                </li>
              ))}
            </ol>
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Nos pregões eletrônicos</strong> (a modalidade mais comum), a habilitação é verificada <strong>somente para o vencedor</strong> — após a etapa de lances. Se o vencedor não apresentar a documentação correta, o segundo colocado é convocado.
            </div>
          </section>

          <section id="juridica" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">1. Habilitação jurídica</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Comprova que a empresa existe e está regularmente constituída. Para MEI, o CCMEI (Certificado da Condição de Microempreendedor Individual) substitui os documentos abaixo.
            </p>
            <TabelaDocumentos docs={documentosJuridicos} />
          </section>

          <section id="fiscal" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">2. Regularidade fiscal e trabalhista</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Esta é a etapa em que mais empresas tropeçam — alguma certidão vencida ou débito não regularizado. A boa notícia: empresas ME e EPP (incluindo MEI) podem, como vencedoras, solicitar prazo de 5 dias úteis para regularização antes da inabilitação.
            </p>
            <TabelaDocumentos docs={documentosFiscais} />
            <div className="bg-[#FFF7ED] border-l-[3px] border-[#F59E0B] pl-4 pr-5 py-4 text-sm text-[#92400E] leading-relaxed rounded-r-lg">
              <strong>Atenção ao CRF:</strong> o Certificado de Regularidade do FGTS tem validade de apenas 30 dias — é o documento que vence mais rápido. Renove mensalmente e guarde o novo antes de descartar o antigo.
            </div>
          </section>

          <section id="tecnica" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">3. Qualificação técnica</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Comprova que sua empresa já executou serviços ou forneceu produtos similares. Nem todo edital exige — mas quando exige, a documentação precisa ser específica para o objeto licitado.
            </p>
            <TabelaDocumentos docs={documentosTecnicos} />
            <p className="text-sm text-[#4a4a4d] leading-relaxed mt-3">
              <strong>Como conseguir atestados:</strong> solicite às empresas e órgãos para quem você já prestou serviços. Um atestado em papel timbrado do cliente, com assinatura e data, geralmente é suficiente. Para valores significativos, o edital pode exigir reconhecimento de firma.
            </p>
          </section>

          <section id="financeira" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">4. Qualificação econômico-financeira</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Garante que sua empresa tem saúde financeira para cumprir o contrato. Para licitações de pequeno valor (abaixo de certos limites), essa exigência costuma ser dispensada ou simplificada.
            </p>
            <TabelaDocumentos docs={documentosFinanceiros} />
          </section>

          <section id="sicaf" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">5. O papel do SICAF</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              O <strong>SICAF (Sistema de Cadastramento Unificado de Fornecedores)</strong> é o cadastro obrigatório para participar de licitações do governo federal. Uma vez cadastrado e com as certidões inseridas no sistema, o SICAF valida automaticamente a regularidade fiscal e trabalhista nas consultas online.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'Cadastro gratuito pelo portal Compras.gov.br',
                'Substitui a apresentação manual das certidões em licitações federais',
                'Precisa ser mantido com as certidões atualizadas no sistema',
                'Nível I (básico) é suficiente para pregões; outros níveis exigem visita ao órgão',
                'Estados e municípios podem aceitar o SICAF como substituto — verificar cada edital',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="checklist" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Checklist de manutenção mensal</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Mantenha sempre pronto um arquivo com todos os documentos — renove automaticamente todo mês:
            </p>
            <div className="space-y-2">
              {[
                { status: '✓ Mensal', item: 'CRF (FGTS) — validade 30 dias' },
                { status: '✓ Trimestral', item: 'CND Estadual (ICMS) — validade 90 dias' },
                { status: '✓ Trimestral', item: 'CND Municipal (ISS) — validade 90 dias' },
                { status: '✓ Semestral', item: 'CND Federal (RFB/PGFN) — validade 180 dias' },
                { status: '✓ Semestral', item: 'CNDT (Trabalhista) — validade 180 dias' },
                { status: '✓ Semestral', item: 'Certidão Negativa de Falência — validade varia (30–90 dias)' },
                { status: '✓ Anual', item: 'Balanço Patrimonial — exercício anterior' },
                { status: '✓ Anual', item: 'Registro no conselho de classe (quando aplicável)' },
                { status: '✓ Sempre atualizado', item: 'Contrato social com última alteração' },
                { status: '✓ Sempre atualizado', item: 'Atestados de capacidade técnica para novos clientes' },
              ].map(({ status, item }) => (
                <div key={item} className="flex gap-3 items-start text-sm py-2 border-b border-[#F0EDE8]">
                  <span className="text-[#6B0F1A] font-bold text-xs shrink-0 mt-0.5 whitespace-nowrap">{status}</span>
                  <span className="text-[#4a4a4d]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Documentação pronta?</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              Monitore licitações do seu segmento e chegue preparado
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              Com a documentação em dia, basta encontrar os editais certos. O Monitor de Licitações te avisa por e-mail e Telegram quando novos editais compatíveis são publicados.
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
                { href: '/como-ganhar-primeiro-contrato-publico', label: 'Como ganhar o primeiro contrato' },
                { href: '/vale-a-pena-participar-de-licitacoes-publicas', label: 'Vale a pena participar de licitações?' },
                { href: '/guia-modalidades-licitacao', label: 'Modalidades de licitação' },
                { href: '/comprasnet-vs-pncp-vs-bll', label: 'ComprasNet vs PNCP vs BLL' },
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
