import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--creme)', color: 'var(--preto)' }}>

      {/* Header fixo */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{ background: 'rgba(250,246,240,0.93)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,166,90,0.15)' }}
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
        className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-40 overflow-hidden"
        style={{ background: 'var(--preto)' }}
      >
        {/* Glow vinho */}
        <div
          className="absolute opacity-25 pointer-events-none"
          style={{
            top: '5%', left: '15%', width: '70%', height: '70%',
            background: 'radial-gradient(circle, var(--vinho) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Glow dourado */}
        <div
          className="absolute opacity-10 pointer-events-none"
          style={{
            bottom: '5%', right: '10%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, var(--dourado) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(201,166,90,0.12)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.25)' }}
          >
            Novo · Powered by IA
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-instrument)', color: 'white', fontWeight: 400 }}
          >
            Nunca perca uma<br />
            <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>licitação pública</span> de novo.
          </h1>

          <p
            className="text-lg md:text-xl mb-10 max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}
          >
            Alertas diários automáticos de prefeituras, estados e governo federal —
            filtrados por IA para o que você realmente pode vender.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/cadastro"
              className="px-8 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{ background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.2)' }}
            >
              Começar 7 dias grátis →
            </Link>
            <a
              href="#como-funciona"
              className="px-8 py-4 rounded-2xl text-base font-medium transition-all"
              style={{ color: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.12)' }}
            >
              Ver como funciona
            </a>
          </div>

          {/* Estatísticas */}
          <div
            className="flex flex-wrap justify-center gap-6 text-sm"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {['5.500+ municípios', 'Atualização diária', 'Match por IA', 'R$0 para começar'].map((stat, i) => (
              <span key={stat} className="flex items-center gap-2">
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>}
                {stat}
              </span>
            ))}
          </div>
        </div>

        {/* Linha dourada bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--dourado), transparent)', opacity: 0.25 }}
        />
      </section>

      {/* O problema */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ background: 'var(--creme)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--vinho)' }}>
              O problema
            </p>
            <h2
              className="text-3xl md:text-4xl max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
            >
              Você já perdeu contratos por não saber que o edital existia?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '⏰',
                titulo: 'Editais somem em dias',
                descricao: 'Editais publicados e fechados em 5 dias — sem você saber. A concorrência que monitora sai na frente.',
              },
              {
                icon: '🗺️',
                titulo: 'Centenas de portais',
                descricao: 'Centenas de portais diferentes para acompanhar manualmente. Impossível sem um sistema automatizado.',
              },
              {
                icon: '📩',
                titulo: 'Concorrentes com vantagem',
                descricao: 'Concorrentes recebendo alertas enquanto você pesquisa manualmente. A diferença é quem chega primeiro.',
              },
            ].map(card => (
              <div
                key={card.titulo}
                className="rounded-2xl p-7"
                style={{ background: 'white', border: '1.5px solid rgba(107,15,26,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--preto)' }}>
                  {card.titulo}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>
                  {card.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section
        id="como-funciona"
        className="px-6 py-20 md:py-28"
        style={{ background: 'white' }}
      >
        <div className="max-w-5xl mx-auto">
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
                titulo: 'Cadastre-se em 2 minutos',
                descricao: 'Sem cartão de crédito. Sem burocracia. Sua conta fica pronta na hora.',
              },
              {
                num: '02',
                titulo: 'Configure suas palavras-chave',
                descricao: 'Notebook, cadeira, retroescavadeira, qualquer produto ou serviço que você vende. Nossa IA entende o contexto.',
              },
              {
                num: '03',
                titulo: 'Receba alertas todos os dias',
                descricao: 'Por e-mail e Telegram, com link direto para o edital. Nunca mais perca um prazo.',
              },
            ].map(passo => (
              <div
                key={passo.num}
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{ background: 'var(--creme)', border: '1.5px solid rgba(26,26,28,0.07)' }}
              >
                <div
                  className="text-5xl font-bold mb-5"
                  style={{ fontFamily: 'var(--font-instrument)', color: 'var(--dourado)', opacity: 0.4 }}
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
        </div>
      </section>

      {/* Fontes */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ background: 'var(--creme)', borderTop: '1px solid rgba(26,26,28,0.06)' }}
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
              Cobertura completa do governo brasileiro
            </h2>
            <p className="text-base max-w-lg mx-auto mb-3" style={{ color: 'var(--cinza)' }}>
              Monitoramos as principais plataformas de compras públicas — municipal, estadual e federal.
            </p>
            <p className="text-xs font-semibold tracking-wider" style={{ color: 'var(--vinho)', opacity: 0.7 }}>
              Prefeituras · Estados · Governo Federal · Autarquias · Empresas Públicas
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                nome: 'PNCP',
                subtitulo: 'API oficial',
                descricao: 'Portal Nacional de Contratações Públicas — obrigatório para órgãos federais e a maioria dos estados.',
                cor: 'var(--vinho)',
                bg: 'rgba(107,15,26,0.06)',
                border: 'rgba(107,15,26,0.15)',
              },
              {
                nome: 'ComprasNet',
                subtitulo: 'Federal',
                descricao: 'Portal histórico de compras do governo federal com vasta base de pregões eletrônicos.',
                cor: 'var(--bordo)',
                bg: 'rgba(139,30,45,0.05)',
                border: 'rgba(139,30,45,0.12)',
              },
              {
                nome: 'Querido Diário',
                subtitulo: 'Diários oficiais',
                descricao: 'Diários oficiais de +5.500 municípios brasileiros — onde prefeituras publicam seus editais.',
                cor: '#b07d2a',
                bg: 'rgba(201,166,90,0.07)',
                border: 'rgba(201,166,90,0.2)',
              },
              {
                nome: 'Google',
                subtitulo: 'Portais municipais',
                descricao: 'Busca inteligente para capturar editais publicados fora das plataformas tradicionais.',
                cor: '#2d6a4f',
                bg: 'rgba(45,106,79,0.06)',
                border: 'rgba(45,106,79,0.15)',
              },
            ].map(fonte => (
              <div
                key={fonte.nome}
                className="rounded-2xl p-6"
                style={{ background: fonte.bg, border: `1.5px solid ${fonte.border}` }}
              >
                <div className="mb-1">
                  <span
                    className="text-sm font-bold"
                    style={{ color: fonte.cor }}
                  >
                    {fonte.nome}
                  </span>
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: fonte.border, color: fonte.cor, opacity: 0.8 }}
                  >
                    {fonte.subtitulo}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--cinza)' }}>
                  {fonte.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ background: 'white' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--dourado)' }}>
              Preços
            </p>
            <h2
              className="text-3xl md:text-4xl mb-3"
              style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
            >
              Escolha seu plano
            </h2>
            <p className="text-base" style={{ color: 'var(--cinza)' }}>
              7 dias grátis em qualquer plano. Cancele quando quiser.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                nome: 'Basic',
                preco: '49,90',
                keywords: 'Até 10 palavras-chave',
                usuarios: '1 usuário',
                canais: 'E-mail + Telegram',
                extra: null,
                destaque: false,
                plano: 'basic',
              },
              {
                nome: 'Profissional',
                preco: '97',
                keywords: 'Palavras-chave ilimitadas',
                usuarios: '1 usuário',
                canais: 'E-mail + Telegram',
                extra: null,
                destaque: false,
                plano: 'profissional',
              },
              {
                nome: 'Pro',
                preco: '197',
                keywords: 'Palavras-chave ilimitadas',
                usuarios: '5 usuários',
                canais: 'E-mail + Telegram',
                extra: null,
                destaque: true,
                plano: 'pro',
              },
              {
                nome: 'Empresarial',
                preco: '497',
                keywords: 'Palavras-chave ilimitadas',
                usuarios: 'Usuários ilimitados',
                canais: 'Tudo + Relatório mensal',
                extra: 'Suporte prioritário',
                destaque: false,
                plano: 'empresarial',
              },
            ].map(plano => (
              <div
                key={plano.nome}
                className="rounded-2xl p-7 flex flex-col relative overflow-hidden"
                style={{
                  background: plano.destaque ? 'var(--preto)' : 'var(--creme)',
                  border: plano.destaque ? '2px solid rgba(201,166,90,0.3)' : '1.5px solid rgba(26,26,28,0.08)',
                  boxShadow: plano.destaque ? '0 8px 32px rgba(107,15,26,0.25)' : '0 2px 12px rgba(0,0,0,0.03)',
                }}
              >
                {plano.destaque && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--dourado), transparent)' }}
                  />
                )}
                {plano.destaque && (
                  <div className="mb-3">
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{ background: 'rgba(201,166,90,0.15)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.25)' }}
                    >
                      ★ Mais popular
                    </span>
                  </div>
                )}

                <div className="mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: plano.destaque ? 'rgba(255,255,255,0.5)' : 'var(--cinza)' }}
                  >
                    {plano.nome}
                  </span>
                </div>

                <div className="mb-6">
                  <span
                    className="text-4xl font-bold"
                    style={{ fontFamily: 'var(--font-instrument)', color: plano.destaque ? 'white' : 'var(--preto)' }}
                  >
                    R${plano.preco}
                  </span>
                  <span className="text-sm ml-1" style={{ color: plano.destaque ? 'rgba(255,255,255,0.35)' : 'var(--cinza)' }}>
                    /mês
                  </span>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {[plano.keywords, plano.usuarios, plano.canais, plano.extra].filter(Boolean).map(item => (
                    <li
                      key={item!}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: plano.destaque ? 'rgba(255,255,255,0.6)' : 'var(--cinza)' }}
                    >
                      <span style={{ color: 'var(--dourado)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/cadastro?plano=${plano.plano}`}
                  className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all"
                  style={
                    plano.destaque
                      ? { background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.2)' }
                      : { background: 'transparent', color: 'var(--vinho)', border: '1.5px solid rgba(107,15,26,0.2)' }
                  }
                >
                  Começar grátis →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section
        className="px-6 py-20 md:py-28 relative overflow-hidden"
        style={{ background: 'var(--vinho)' }}
      >
        <div
          className="absolute opacity-15 pointer-events-none"
          style={{
            top: '-20%', left: '30%', width: '40%', height: '120%',
            background: 'radial-gradient(circle, rgba(201,166,90,0.5) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(201,166,90,0.6)' }}>
              Por que usar
            </p>
            <h2
              className="text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'white' }}
            >
              Empresas que vendem para o governo{' '}
              <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>precisam disso</span>
            </h2>
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              R$ 2 trilhões em licitações por ano no Brasil. Você está monitorando?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                nome: 'Carlos M.',
                empresa: 'Distribuidora de móveis, SP',
                texto: 'Antes eu levava 2 horas por dia pesquisando no PNCP. Hoje recebo os alertas de manhã e só entro para ver os editais que realmente me interessam.',
              },
              {
                nome: 'Fernanda L.',
                empresa: 'Informática e suprimentos, MG',
                texto: 'Ganhamos três pregões que nem saberíamos que existiam. O Monitor identificou licitações de municípios pequenos que nunca teriam chegado até nós.',
              },
              {
                nome: 'Roberto S.',
                empresa: 'Serviços de limpeza, RJ',
                texto: 'O filtro por IA é o diferencial. Só recebo editais que fazem sentido para o meu negócio. Zero ruído, 100% de relevância.',
              },
            ].map(dep => (
              <div
                key={dep.nome}
                className="rounded-2xl p-7"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  &ldquo;{dep.texto}&rdquo;
                </p>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'white' }}>{dep.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(201,166,90,0.65)' }}>{dep.empresa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="px-6 py-20 md:py-28"
        style={{ background: 'var(--creme)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--dourado)' }}>
              FAQ
            </p>
            <h2
              className="text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
            >
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                pergunta: 'Preciso de cartão de crédito para o teste?',
                resposta: 'Não. Os 7 dias de teste são totalmente gratuitos e sem necessidade de cartão de crédito. Só pedimos seu e-mail para criar a conta.',
              },
              {
                pergunta: 'Como recebo os alertas?',
                resposta: 'Você recebe um resumo diário por e-mail com todos os editais que combinam com suas palavras-chave. Em breve também por Telegram, com link direto para cada edital.',
              },
              {
                pergunta: 'Quais estados e municípios são cobertos?',
                resposta: 'Cobrimos o Brasil inteiro: governo federal, todos os estados e mais de 5.500 municípios via PNCP, ComprasNet, Querido Diário e busca no Google. Se um edital foi publicado, nós encontramos.',
              },
              {
                pergunta: 'Posso cancelar a qualquer momento?',
                resposta: 'Sim. Sem multa, sem burocracia. Basta cancelar pelo painel e você não é cobrado no próximo ciclo.',
              },
              {
                pergunta: 'O que é match semântico por IA?',
                resposta: 'Nossa IA entende o significado das suas palavras-chave, não só a correspondência exata. Se você vende "notebook", também encontramos editais de "computador portátil", "laptop" e similares — reduzindo falsos negativos.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="rounded-2xl overflow-hidden group"
                style={{ background: 'white', border: '1.5px solid rgba(26,26,28,0.08)' }}
              >
                <summary
                  className="flex items-center justify-between px-6 py-5 cursor-pointer text-base font-semibold select-none"
                  style={{ color: 'var(--preto)', listStyle: 'none' }}
                >
                  {item.pergunta}
                  <span
                    className="text-lg ml-4 flex-shrink-0"
                    style={{ color: 'var(--dourado)', transition: 'transform 0.2s' }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>
                    {item.resposta}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="px-6 py-24 md:py-36 text-center relative overflow-hidden"
        style={{ background: 'var(--preto)' }}
      >
        <div
          className="absolute opacity-20 pointer-events-none"
          style={{
            top: '-20%', left: '20%', width: '60%', height: '140%',
            background: 'radial-gradient(circle, var(--vinho) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        <div className="max-w-2xl mx-auto relative z-10">
          <h2
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'white' }}
          >
            Comece hoje. Receba seu<br />
            <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>primeiro alerta amanhã.</span>
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
            7 dias grátis. Sem cartão de crédito. Configure em minutos.
          </p>
          <Link
            href="/cadastro"
            className="inline-block px-12 py-4 rounded-2xl text-base font-semibold"
            style={{ background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.25)' }}
          >
            Criar conta grátis →
          </Link>
          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Sem cartão de crédito · Cancele quando quiser
          </p>
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
        <nav className="flex items-center gap-5">
          <Link href="/login" className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Entrar</Link>
          <Link href="/cadastro" className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Começar</Link>
          <Link href="/privacidade" className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Privacidade</Link>
        </nav>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          © {new Date().getFullYear()} Matutta. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  )
}
