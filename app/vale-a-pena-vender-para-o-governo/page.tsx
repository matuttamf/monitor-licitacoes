import Link from 'next/link'
import type { Metadata } from 'next'
import { NavArticlesDropdown } from '@/components/NavArticlesDropdown'
import { MobileMenu } from '@/components/MobileMenu'

const BASE = 'https://monitordelicitacoes.com.br'
const URL  = `${BASE}/vale-a-pena-vender-para-o-governo`

export const metadata: Metadata = {
  title: 'Vale a Pena Vender para o Governo? Análise Honesta para Empresas',
  description:
    'Vale a pena vender para o governo federal, estadual ou municipal? Descobra quanto ele paga, em quanto tempo, as vantagens reais e o que esperar como fornecedor público.',
  keywords: [
    'vale a pena vender para o governo',
    'vender para governo federal',
    'como vender para o governo',
    'fornecedor do governo',
    'vender para prefeitura',
    'governo como cliente',
    'vantagens de vender para governo',
    'fornecimento ao governo',
    'contratos com governo',
    'mercado público empresas',
  ],
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Vale a Pena Vender para o Governo? Análise Honesta para Empresas',
    description: 'O governo nunca dá calote, não negocia preço fora da licitação e compra o ano todo. Mas existem armadilhas — saiba quais antes de entrar.',
    url: URL,
    type: 'article',
    siteName: 'Monitor de Licitações',
    locale: 'pt_BR',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Vale a Pena Vender para o Governo? Análise Honesta para Empresas Brasileiras',
  description: 'Vantagens reais, desvantagens subestimadas e o que esperar ao ter o poder público como cliente no Brasil.',
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
      name: 'O governo realmente paga em dia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O governo federal tem histórico de pagamento dentro de 30 dias na maioria dos casos. Estados variam mais — grandes estados como SP e RJ costumam ser pontuais; estados menores podem atrasar. Municípios são os mais variáveis. A lei garante correção monetária em atrasos, e o não pagamento gera responsabilização do gestor público. Inadimplência definitiva é extremamente rara.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso emitir nota fiscal para vender para o governo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. Todo fornecimento ao governo exige emissão de Nota Fiscal eletrônica (NF-e) ou NFS-e (serviços), conforme o caso. A nota precisa ser emitida corretamente para o CNPJ do órgão público, com os dados do contrato ou empenho. Sem a nota correta, o pagamento fica retido.',
      },
    },
    {
      '@type': 'Question',
      name: 'É possível ser bloqueado de vender para o governo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. Empresas que descumprem contratos (não entregam, entregam com atraso reiterado ou entregam produto diferente do ofertado) podem ser penalizadas com advertência, multa, suspensão temporária ou inidoneidade. A suspensão impede a participação em licitações pelo prazo determinado — geralmente 6 a 24 meses. Por isso, nunca assine um contrato que não consegue cumprir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Dá para viver só de contratos com o governo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, e muitas empresas fazem isso com sucesso. Contratos plurianuais (até 5 anos renováveis) dão previsibilidade. Empresas de limpeza, segurança, TI e manutenção que trabalham principalmente com governo têm receita previsível e fluxo de caixa estável. O risco é a concentração: ter um único contrato grande é arriscado caso ele não seja renovado.',
      },
    },
  ],
}

export default function ValeAVenderPagina() {
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
            <span>Vender para o governo</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B0F1A]">Análise honesta</span>
            <span className="text-[#E8E4DC]">·</span>
            <span className="text-xs text-[#9AA0A6]">Atualizado em {new Date().getFullYear()}</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-black leading-[1.15] tracking-tight text-[#1A1A1C] mb-5">
            Vale a pena vender para o governo? O que nenhum consultor te conta
          </h1>

          <p className="text-base md:text-lg text-[#4a4a4d] leading-relaxed mb-8 border-l-[3px] border-[#6B0F1A] pl-4">
            O governo brasileiro é o <strong>maior comprador único do país</strong> — gasta mais de R$2 trilhões por ano, compra de todos os setores e, por lei, não pode deixar de pagar. Mas tem um lado que raramente aparece nos tutoriais: o ritmo mais lento, a burocracia de documentação e o risco de penalidades por descumprimento. Esta análise traz os dois lados.
          </p>

          <nav className="bg-[#FAF6F0] rounded-xl border border-[#E8E4DC] p-5 mb-10 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-3">Neste artigo</p>
            <ol className="space-y-1.5 list-none">
              {[
                ['#por-que-sim', 'Por que vale muito a pena'],
                ['#o-cliente-perfeito', 'O governo como cliente: o que é diferente'],
                ['#quanto-paga', 'Quanto o governo paga — e em quanto tempo'],
                ['#quem-pode', 'Qualquer empresa pode vender para o governo?'],
                ['#setores', 'Quais setores têm mais oportunidade'],
                ['#armadilhas', 'As armadilhas que ninguém conta'],
                ['#como-comecar', 'Como começar a vender para o governo'],
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

          <section id="por-que-sim" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Por que vale muito a pena</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Existem três razões que fazem do governo um cliente único — razões que nenhum cliente privado consegue oferecer ao mesmo tempo:
            </p>
            <div className="space-y-4 mb-6">
              {[
                {
                  icon: '🔒',
                  t: 'Pagamento garantido por lei',
                  d: 'O poder público tem obrigação legal de honrar os contratos. A inadimplência definitiva é excepcional. Atrasos geram correção monetária automática. Você pode vender para o governo com muito mais segurança do que para qualquer cliente privado.',
                },
                {
                  icon: '📅',
                  t: 'Receita previsível e recorrente',
                  d: 'Contratos de prestação de serviços duram 12 meses e podem ser renovados por até 5 anos. Isso significa receita previsível que permite contratar equipe, fazer investimentos e planejar o crescimento com tranquilidade.',
                },
                {
                  icon: '🌐',
                  t: 'Mercado de escala nacional',
                  d: 'Com o pregão eletrônico, você pode vender para a Prefeitura de Belém, o Governo do Paraná e uma autarquia federal ao mesmo tempo — sem sair do escritório. O Brasil inteiro é seu mercado potencial.',
                },
              ].map(({ icon, t, d }) => (
                <div key={t} className="flex gap-4 p-5 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8]">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div>
                    <div className="font-bold text-[#1A1A1C] mb-1">{t}</div>
                    <div className="text-sm text-[#4a4a4d] leading-relaxed">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="o-cliente-perfeito" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">O governo como cliente: o que é diferente</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              Vender para o governo é diferente de vender para empresa privada. Não melhor nem pior — diferente. Entender essas diferenças evita frustrações:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { t: 'Privado', items: ['Negocia preço livremente', 'Pode escolher o fornecedor', 'Paga quando quer', 'Processo informal', 'Relacionamento é tudo'] },
                { t: 'Governo', items: ['Preço definido em licitação pública', 'Deve contratar o menor preço legal', 'Tem prazo legal de 30 dias', 'Processo documentado', 'Regras são tudo'] },
              ].map(({ t, items }) => (
                <div key={t} className={`p-4 rounded-xl border ${t === 'Governo' ? 'border-[#6B0F1A] bg-[#FDF5F5]' : 'border-[#F0EDE8] bg-[#FAF6F0]'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${t === 'Governo' ? 'text-[#6B0F1A]' : 'text-[#9AA0A6]'}`}>{t}</div>
                  <ul className="space-y-1.5">
                    {items.map(item => (
                      <li key={item} className="text-sm text-[#4a4a4d] flex gap-2">
                        <span className={t === 'Governo' ? 'text-[#6B0F1A]' : 'text-[#9AA0A6]'}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#4a4a4d] leading-relaxed">
              No mercado público, o melhor vendedor não é quem tem o melhor relacionamento — é quem tem o melhor preço com a documentação em dia. Isso <em>nivela o campo</em> e permite que pequenas empresas compitam de igual para igual com grandes.
            </p>
          </section>

          <section id="quanto-paga" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Quanto o governo paga — e em quanto tempo</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              O governo paga o preço que você ofertou na licitação. Sem desconto posterior, sem negociação de prazo, sem parcelamento não acordado. O que foi contratado é o que será pago.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { k: 'Prazo de pagamento', v: '30 dias após entrega e nota fiscal aceita (prazo legal). Órgãos federais tendem a cumprir. Municipais variam.' },
                { k: 'O que acontece com atraso', v: 'Acima de 30 dias: correção pelo IPCA + juros de 0,5% ao mês. Você pode cobrar por carta registrada.' },
                { k: 'Contratos de serviço mensais', v: 'Pagamento mês a mês, após medição e aceite do serviço. Previsível como um salário.' },
                { k: 'Adiantamento', v: 'Alguns contratos de execução longa permitem mobilização inicial (10 a 30% antecipado). Previsto no edital.' },
              ].map(({ k, v }) => (
                <div key={k} className="flex gap-3 p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8] text-sm">
                  <strong className="text-[#1A1A1C] shrink-0 min-w-[140px]">{k}:</strong>
                  <span className="text-[#4a4a4d] leading-relaxed">{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="quem-pode" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Qualquer empresa pode vender para o governo?</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-4">
              Praticamente sim. MEI, microempresa, pequena, média ou grande — todas podem participar de licitações. Os requisitos são os mesmos para qualquer porte:
            </p>
            <ul className="space-y-2 mb-5">
              {[
                'CNPJ ativo sem impedimentos',
                'Certidões negativas de débitos (federal, FGTS, trabalhista, estadual, municipal)',
                'Documentação societária (contrato social ou certificado MEI)',
                'Capacidade técnica para cumprir o objeto (quando exigida)',
              ].map(item => (
                <li key={item} className="flex gap-2 text-sm text-[#4a4a4d]">
                  <span className="text-[#6B0F1A] font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-base text-[#4a4a4d] leading-relaxed">
              ME e EPP ainda têm <strong>vantagens extras por lei</strong>: empate ficto (cobrir preço até 10% maior), cotas reservadas e licitações exclusivas para contratos de até R$80.000.
            </p>
          </section>

          <section id="setores" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Quais setores têm mais oportunidade</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              O governo compra de tudo — mas alguns setores têm volume de demanda especialmente alto:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { seg: 'Tecnologia e TI', ex: 'Computadores, notebooks, suporte técnico, sistemas, segurança da informação' },
                { seg: 'Limpeza e conservação', ex: 'Serviço terceirizado, material de limpeza, desinsetização' },
                { seg: 'Saúde', ex: 'Medicamentos, equipamentos, insumos, serviços laboratoriais' },
                { seg: 'Construção civil', ex: 'Obras, pavimentação, reforma, manutenção predial' },
                { seg: 'Alimentação', ex: 'Merenda escolar (PNAE), refeições coletivas, gêneros alimentícios' },
                { seg: 'Material de escritório', ex: 'Papel, cartuchos, mobiliário, equipamentos' },
                { seg: 'Segurança', ex: 'Vigilância, monitoramento, alarmes, controle de acesso' },
                { seg: 'Transporte', ex: 'Frotas, fretamento, manutenção de veículos, combustível' },
              ].map(({ seg, ex }) => (
                <div key={seg} className="p-4 bg-[#FAF6F0] rounded-xl border border-[#F0EDE8]">
                  <div className="font-bold text-[#1A1A1C] text-sm mb-1">{seg}</div>
                  <div className="text-xs text-[#6B7280] leading-relaxed">{ex}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#4a4a4d]">
              Veja guias específicos por segmento em{' '}
              <Link href="/licitacoes-para" className="text-[#6B0F1A] no-underline hover:underline font-semibold">Licitações por segmento →</Link>
            </p>
          </section>

          <section id="armadilhas" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">As armadilhas que ninguém conta</h2>
            <div className="space-y-4 mb-6">
              {[
                {
                  t: 'Assinar contrato que não consegue cumprir',
                  d: 'Por empolgação ou falta de planejamento, alguns fornecedores assinam e depois descobrem que não conseguem entregar no prazo ou preço contratado. O resultado são multas de até 10% do valor e suspensão de licitações. Nunca assine um contrato sem garantir que consegue executá-lo.',
                },
                {
                  t: 'Precificar sem incluir todos os custos',
                  d: 'Frete, impostos sobre nota fiscal, custo de capital (você entrega e espera 30 dias para receber), encargos trabalhistas em serviços contínuos. Iniciantes frequentemente esquecem esses custos e fecham o primeiro contrato no prejuízo.',
                },
                {
                  t: 'Certidão vencendo no dia da sessão',
                  d: 'Uma certidão que vencia ontem derruba sua habilitação mesmo que o preço seja o melhor. Monitore o vencimento de cada certidão e renove com 15 dias de antecedência.',
                },
              ].map(({ t, d }) => (
                <div key={t} className="p-4 bg-[#FFF1F2] border border-[#FDA4AF] rounded-xl">
                  <div className="flex gap-2 mb-2">
                    <span className="text-red-500 font-black">⚠</span>
                    <strong className="text-[#1A1A1C] text-sm">{t}</strong>
                  </div>
                  <p className="text-sm text-[#4a4a4d] leading-relaxed ml-6">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="como-comecar" className="mb-12">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1C] mb-4">Como começar a vender para o governo</h2>
            <p className="text-base text-[#4a4a4d] leading-relaxed mb-5">
              O caminho mais direto para o primeiro contrato:
            </p>
            <ol className="space-y-3 mb-6">
              {[
                'Regularize toda documentação e crie um calendário de renovação de certidões',
                'Faça o cadastro no SICAF (Compras.gov.br) para licitações federais',
                'Configure o monitoramento automático de editais compatíveis com o que você vende',
                'Leia os primeiros 3 editais como espectador — sem participar — para entender o processo',
                'Participe de uma dispensa de licitação (processo mais simples que o pregão) como primeira experiência',
                'Com o primeiro atestado em mãos, aumente o valor dos contratos disputados',
              ].map((item, i) => (
                <li key={item} className="flex gap-3 text-sm text-[#4a4a4d] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-[#6B0F1A] text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
            <p className="text-sm text-[#4a4a4d]">
              Veja o roteiro completo em{' '}
              <Link href="/como-ganhar-primeiro-contrato-publico" className="text-[#6B0F1A] no-underline hover:underline font-semibold">Como ganhar o primeiro contrato público →</Link>
            </p>
          </section>

          <div className="p-6 bg-[#6B0F1A] rounded-2xl text-center mb-12">
            <div className="text-[#C9A65A] text-xs font-semibold uppercase tracking-wider mb-2">Primeiro passo</div>
            <h3 className="text-white font-black text-xl mb-3 leading-tight">
              Encontre licitações compatíveis com o que você vende
            </h3>
            <p className="text-[rgba(255,255,255,0.75)] text-sm mb-4 max-w-sm mx-auto">
              Cadastre palavras-chave e receba alertas automáticos de novos editais — 7 dias grátis.
            </p>
            <Link href="/cadastro" className="inline-block bg-[#C9A65A] text-[#6B0F1A] font-bold px-6 py-3 rounded-xl no-underline text-sm hover:bg-[#b8954f] transition-colors">
              Criar conta gratuita →
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
                { href: '/vale-a-pena-participar-de-licitacoes-publicas', label: 'Vale a pena participar de licitações?' },
                { href: '/como-ganhar-primeiro-contrato-publico', label: 'Como ganhar o primeiro contrato' },
                { href: '/guia-modalidades-licitacao', label: 'Modalidades de licitação' },
                { href: '/como-monitorar-licitacoes', label: 'Como monitorar licitações' },
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
