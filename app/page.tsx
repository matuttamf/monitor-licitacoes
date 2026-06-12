import Link from 'next/link'

const PLANOS = [
  {
    id: 'trial',
    nome: 'Período de Teste',
    preco: null,
    porDia: 'Grátis',
    desc: 'Experimente sem compromisso',
    destaque: false,
    tag: '🎁 GRÁTIS',
    href: '/cadastro',
    btnText: 'Começar 7 dias grátis',
    note: 'Sem cartão de crédito',
    features: [
      { text: 'Até 20 palavras-chave', highlight: false },
      { text: '1 usuário', highlight: false },
      { text: 'Alertas por e-mail e Telegram', highlight: false },
      { text: 'Busca manual no painel', highlight: false },
    ],
  },
  {
    id: 'basic',
    nome: 'Basic',
    preco: '49,90',
    porDia: 'R$1,66/dia',
    desc: 'Para quem está começando no setor público',
    destaque: false,
    tag: null,
    href: '/checkout?plano=basic',
    btnText: 'Assinar agora →',
    note: 'Ou teste 7 dias grátis antes',
    features: [
      { text: 'Até 20 palavras-chave', highlight: false },
      { text: '1 usuário', highlight: false },
      { text: 'Alertas por e-mail e Telegram', highlight: false },
      { text: 'Busca manual no painel', highlight: false },
    ],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: '97,90',
    porDia: 'R$3,26/dia',
    desc: 'Para quem fornece ativamente para o governo',
    destaque: false,
    tag: '🔥 MAIS POPULAR',
    href: '/checkout?plano=profissional',
    btnText: 'Assinar agora →',
    note: 'Ou teste 7 dias grátis antes',
    features: [
      { text: 'Palavras-chave ilimitadas', highlight: true },
      { text: '1 usuário', highlight: false },
      { text: 'E-mail, Telegram e WhatsApp', highlight: true },
      { text: 'Busca manual no painel', highlight: false },
      { text: '🎯 Radar de Inteligência', highlight: true },
      { text: '🏭 Diretório de Fornecedores', highlight: true },
    ],
  },
  {
    id: 'gestao',
    nome: 'Gestão',
    preco: '197,90',
    porDia: 'R$6,60/dia',
    desc: 'Para equipes comerciais que querem crescer',
    destaque: true,
    tag: '⭐ RECOMENDADO',
    href: '/checkout?plano=gestao',
    btnText: 'Assinar agora →',
    note: 'Ou teste 7 dias grátis antes',
    features: [
      { text: 'Palavras-chave ilimitadas', highlight: false },
      { text: 'Até 5 usuários', highlight: true },
      { text: 'E-mail, Telegram e WhatsApp', highlight: false },
      { text: 'Busca manual no painel', highlight: false },
      { text: '🎯 Radar de Inteligência', highlight: true },
      { text: '🏭 Diretório de Fornecedores', highlight: true },
    ],
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    preco: '497,00',
    porDia: 'R$16,57/dia',
    desc: 'Para operações que dependem do setor público',
    destaque: false,
    tag: null,
    href: '/checkout?plano=empresarial',
    btnText: 'Assinar agora →',
    note: 'Ou teste 7 dias grátis antes',
    features: [
      { text: 'Palavras-chave ilimitadas', highlight: false },
      { text: 'Até 15 usuários', highlight: true },
      { text: 'E-mail, Telegram e WhatsApp', highlight: false },
      { text: 'Busca manual no painel', highlight: false },
      { text: '🎯 Radar de Inteligência', highlight: false },
      { text: '🏭 Diretório de Fornecedores', highlight: false },
      { text: 'Relatório semanal detalhado', highlight: true },
    ],
  },
]

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Monitor de Licitações',
  url: APP_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plataforma de monitoramento de licitações públicas brasileiras com alertas automáticos por e-mail, Telegram e WhatsApp.',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'BRL', name: 'Trial 7 dias' },
    { '@type': 'Offer', price: '97', priceCurrency: 'BRL', name: 'Plano Basic', billingDuration: 'P1M' },
    { '@type': 'Offer', price: '197', priceCurrency: 'BRL', name: 'Plano Empresarial', billingDuration: 'P1M' },
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Monitor de Licitações',
    url: APP_URL,
  },
}

export default function LandingPage() {
  return (
    <div className="font-sans bg-[#FAF6F0] text-[#1A1A1C]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* ── PLANOS ── */}
      <section id="planos" className="px-6 md:px-[60px] py-[70px] md:py-[100px] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B0F1A] mb-4">Investimento mínimo. Retorno ilimitado.</div>
            <h2 className="text-3xl md:text-[44px] font-black tracking-tight mb-3 text-[#1A1A1C]">
              A partir de R$1,66 por dia para nunca mais perder um contrato.
            </h2>
            <p className="text-base md:text-[17px] text-[#9AA0A6] max-w-[560px] mx-auto">
              Escolha o plano ideal. Comece com 7 dias grátis — sem cartão de crédito.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            {PLANOS.map(p => (
              <div key={p.id} className={`rounded-2xl p-6 relative flex flex-col ${
                p.destaque
                  ? 'bg-[#6B0F1A] border-2 border-[#C9A65A] shadow-[0_20px_60px_rgba(107,15,26,0.3)]'
                  : p.id === 'trial'
                  ? 'bg-[#FAF6F0] border-2 border-[#C9A65A]'
                  : p.id === 'profissional'
                  ? 'bg-white border-2 border-[#6B0F1A] shadow-[0_4px_24px_rgba(107,15,26,0.08)]'
                  : 'bg-[#FAF6F0] border border-[#D5D2C8]'
              }`}>
                {/* Badge topo */}
                {p.tag && (
                  <div className={`absolute -top-[13px] left-1/2 -translate-x-1/2 text-[10px] font-black px-3.5 py-1 rounded-full whitespace-nowrap tracking-wide ${
                    p.destaque
                      ? 'bg-[#C9A65A] text-[#1A1A1C]'
                      : p.id === 'profissional'
                      ? 'bg-[#6B0F1A] text-white'
                      : 'bg-[#C9A65A] text-[#1A1A1C]'
                  }`}>{p.tag}</div>
                )}

                {/* Nome + descrição */}
                <div className={`text-[11px] font-bold tracking-[0.08em] uppercase mb-1 ${p.destaque ? 'text-[#C9A65A]' : p.id === 'profissional' ? 'text-[#6B0F1A]' : 'text-[#9AA0A6]'}`}>{p.nome}</div>
                <div className={`text-xs mb-4 leading-snug ${p.destaque ? 'text-[rgba(255,255,255,0.45)]' : 'text-[#9AA0A6]'}`}>{p.desc}</div>

                {/* Preço */}
                {p.preco ? (
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-xs font-medium mb-1 ${p.destaque ? 'text-[rgba(255,255,255,0.5)]' : 'text-[#9AA0A6]'}`}>R$</span>
                    <span className={`text-[32px] font-black tracking-tight leading-none ${p.destaque ? 'text-white' : 'text-[#1A1A1C]'}`}>
                      {p.preco.split(',')[0]}
                      <span className="text-[18px]">,{p.preco.split(',')[1]}</span>
                    </span>
                    <span className={`text-[11px] mb-1 ${p.destaque ? 'text-[rgba(255,255,255,0.35)]' : 'text-[#9AA0A6]'}`}>/mês</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[32px] font-black tracking-tight leading-none text-[#1A1A1C]">7 dias</span>
                  </div>
                )}

                <div className={`text-[11px] font-semibold mb-5 px-2 py-1 rounded inline-block w-fit ${
                  p.destaque
                    ? 'text-[rgba(201,166,90,0.8)] bg-[rgba(201,166,90,0.1)]'
                    : 'text-[#6B0F1A] bg-[rgba(107,15,26,0.06)]'
                }`}>
                  {p.porDia}
                </div>

                {/* Features */}
                <div className="flex-1 mb-5 space-y-2.5">
                  {p.features.map(f => (
                    <div key={f.text} className="flex items-start gap-2">
                      <span className={`font-bold text-sm shrink-0 mt-0.5 ${p.destaque ? 'text-[#C9A65A]' : 'text-[#6B0F1A]'}`}>✓</span>
                      <span className={`text-xs leading-snug ${
                        p.destaque
                          ? f.highlight ? 'text-white font-semibold' : 'text-[rgba(255,255,255,0.75)]'
                          : f.highlight ? 'text-[#1A1A1C] font-semibold' : 'text-[#4a4a4d]'
                      }`}>{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* Divisor visual antes do botão */}
                <div className={`h-px mb-4 ${p.destaque ? 'bg-[rgba(201,166,90,0.2)]' : 'bg-[#E8E4DC]'}`} />

                <Link href={p.href} className={`block text-center py-3 rounded-[10px] text-sm font-bold no-underline transition-opacity hover:opacity-90 ${
                  p.destaque
                    ? 'bg-[#C9A65A] text-[#1A1A1C]'
                    : p.id === 'trial'
                    ? 'bg-[#C9A65A] text-[#1A1A1C]'
                    : p.id === 'profissional'
                    ? 'bg-[#6B0F1A] text-white'
                    : 'bg-[#6B0F1A] text-white'
                }`}>
                  {p.btnText}
                </Link>
                <p className={`text-center text-[11px] mt-2.5 mb-0 ${p.destaque ? 'text-[rgba(255,255,255,0.3)]' : 'text-[#9AA0A6]'}`}>{p.note}</p>
              </div>
            ))}
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
            ['Posso cancelar se não for o que esperava?', 'Sim, a qualquer momento, sem multa e sem burocracia.'],
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
          <span className="text-sm text-[rgba(255,255,255,0.25)]">© 2021 Monitor de Licitações · Matutta Soluções Digitais</span>
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
