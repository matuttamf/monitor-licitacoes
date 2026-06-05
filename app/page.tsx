import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--creme)', color: 'var(--preto)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{ background: 'rgba(250,246,240,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,166,90,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--vinho)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.3)' }}
          >
            ML
          </div>
          <span className="font-semibold tracking-wide hidden sm:block" style={{ color: 'var(--preto)' }}>
            Monitor de Licitações
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--preto)', border: '1.5px solid rgba(26,26,28,0.12)' }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--vinho)', color: 'white' }}
          >
            Começar grátis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 overflow-hidden"
        style={{ background: 'var(--preto)' }}
      >
        {/* Glow vinho */}
        <div
          className="absolute opacity-25"
          style={{
            top: '10%', left: '20%', width: '60%', height: '60%',
            background: 'radial-gradient(circle, var(--vinho) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Glow dourado */}
        <div
          className="absolute opacity-10"
          style={{
            bottom: '5%', right: '15%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, var(--dourado) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(201,166,90,0.12)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.25)' }}
          >
            SaaS para empresas que vendem para o governo
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-instrument)', color: 'white', fontWeight: 400 }}
          >
            Encontre licitações<br />
            <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>antes da concorrência.</span>
          </h1>

          <p
            className="text-lg md:text-xl mb-10 max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}
          >
            Monitoramos PNCP, ComprasNet, Querido Diário e Google — e enviamos alertas diários
            dos editais que combinam com o que você vende.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cadastro"
              className="px-8 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{ background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.2)' }}
            >
              Começar 7 dias grátis →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl text-base font-medium transition-all"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            >
              Já tenho conta
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        {/* Linha dourada bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--dourado), transparent)', opacity: 0.3 }}
        />
      </section>

      {/* Como funciona */}
      <section className="px-6 py-20 md:py-28 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--dourado)' }}>
            Como funciona
          </p>
          <h2
            className="text-3xl md:text-4xl"
            style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
          >
            Simples de configurar, poderoso no dia a dia
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              titulo: 'Cadastre-se',
              descricao: 'Crie sua conta em menos de 2 minutos. Sem burocracia, sem cartão de crédito.',
            },
            {
              num: '02',
              titulo: 'Configure palavras-chave',
              descricao: 'Informe o que você vende — produtos, serviços, categorias. Nossa IA filtra o que é relevante.',
            },
            {
              num: '03',
              titulo: 'Receba alertas diários',
              descricao: 'Todo dia útil, um resumo das licitações que combinam com o seu negócio, direto no e-mail.',
            },
          ].map(passo => (
            <div
              key={passo.num}
              className="rounded-2xl p-7"
              style={{ background: 'white', border: '1px solid rgba(26,26,28,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-instrument)', color: 'var(--dourado)', opacity: 0.6 }}
              >
                {passo.num}
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--preto)' }}>
                {passo.titulo}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>
                {passo.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fontes */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ background: 'white', borderTop: '1px solid rgba(26,26,28,0.06)', borderBottom: '1px solid rgba(26,26,28,0.06)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--dourado)' }}>
              Cobertura nacional
            </p>
            <h2
              className="text-3xl md:text-4xl mb-4"
              style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
            >
              Monitoramos onde os contratos estão
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--cinza)' }}>
              Cobrimos as principais plataformas de compras públicas do Brasil —
              municipal, estadual e federal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                nome: 'PNCP',
                descricao: 'Portal Nacional de Contratações Públicas — obrigatório para órgãos federais e a maioria dos estados.',
                cor: 'var(--vinho)',
                bg: 'rgba(107,15,26,0.05)',
              },
              {
                nome: 'ComprasNet',
                descricao: 'Portal histórico de compras do governo federal com vasta base de pregões eletrônicos.',
                cor: 'var(--bordo)',
                bg: 'rgba(139,30,45,0.05)',
              },
              {
                nome: 'Querido Diário',
                descricao: 'Diários oficiais de +5.500 municípios brasileiros — onde prefeituras publicam seus editais.',
                cor: '#C9A65A',
                bg: 'rgba(201,166,90,0.07)',
              },
              {
                nome: 'Google',
                descricao: 'Busca inteligente para capturar editais publicados fora das plataformas tradicionais.',
                cor: '#2d6a4f',
                bg: 'rgba(45,106,79,0.06)',
              },
            ].map(fonte => (
              <div
                key={fonte.nome}
                className="rounded-2xl p-6"
                style={{ background: fonte.bg, border: `1.5px solid ${fonte.cor}20` }}
              >
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-3 px-2.5 py-1 rounded-lg inline-block"
                  style={{ background: fonte.bg, color: fonte.cor, border: `1px solid ${fonte.cor}30` }}
                >
                  {fonte.nome}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>
                  {fonte.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="px-6 py-20 md:py-28 max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--dourado)' }}>
          Preço simples
        </p>
        <h2
          className="text-3xl md:text-4xl mb-10"
          style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
        >
          Um plano. Sem surpresas.
        </h2>

        <div
          className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: 'var(--preto)', border: '1px solid rgba(201,166,90,0.2)' }}
        >
          {/* Glow */}
          <div
            className="absolute opacity-15"
            style={{
              top: '-20%', left: '30%', width: '40%', height: '60%',
              background: 'radial-gradient(circle, var(--vinho) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />

          <div className="relative z-10">
            <div className="mb-6">
              <span
                className="text-5xl font-bold"
                style={{ color: 'white', fontFamily: 'var(--font-instrument)' }}
              >
                R$ 49,90
              </span>
              <span className="text-base ml-2" style={{ color: 'rgba(255,255,255,0.4)' }}>/mês</span>
            </div>

            <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
              {[
                '7 dias grátis, sem cartão de crédito',
                'Palavras-chave ilimitadas',
                'Alertas diários por e-mail',
                'Cobertura: PNCP, ComprasNet, Querido Diário, Google',
                'Cancele quando quiser',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ color: 'var(--dourado)', marginTop: '1px', flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/cadastro"
              className="inline-block w-full py-4 rounded-2xl text-base font-semibold"
              style={{ background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.2)' }}
            >
              Começar 7 dias grátis →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="px-6 py-20 md:py-28 text-center"
        style={{ background: 'var(--preto)', borderTop: '1px solid rgba(201,166,90,0.1)' }}
      >
        <div className="max-w-2xl mx-auto relative">
          <div
            className="absolute opacity-20"
            style={{
              top: '-50%', left: '20%', width: '60%', height: '150%',
              background: 'radial-gradient(circle, var(--vinho) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />
          <div className="relative z-10">
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'white' }}
            >
              Comece agora.<br />
              <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>7 dias sem risco.</span>
            </h2>
            <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Configure em minutos. Receba os primeiros alertas amanhã.
            </p>
            <Link
              href="/cadastro"
              className="inline-block px-10 py-4 rounded-2xl text-base font-semibold"
              style={{ background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.25)' }}
            >
              Começar agora grátis →
            </Link>
            <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: 'var(--preto)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: 'var(--vinho)', color: 'var(--dourado)' }}
          >
            ML
          </div>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Monitor de Licitações · Matutta
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Matutta. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  )
}
