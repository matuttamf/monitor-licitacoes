import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: '"Inter", system-ui, -apple-system, sans-serif', background: '#FAF6F0', color: '#1A1A1C', margin: 0, padding: 0 }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px', height: '68px',
        background: 'rgba(250,246,240,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,166,90,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#6B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: '#C9A65A', letterSpacing: '0.05em', flexShrink: 0 }}>ML</div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A1C', letterSpacing: '-0.02em' }}>Monitor de Licitações</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="#como-funciona" style={{ padding: '8px 16px', fontSize: '14px', color: '#4a4a4d', textDecoration: 'none', fontWeight: 500 }}>Como funciona</Link>
          <Link href="#planos" style={{ padding: '8px 16px', fontSize: '14px', color: '#4a4a4d', textDecoration: 'none', fontWeight: 500 }}>Planos</Link>
          <Link href="/login" style={{ padding: '8px 16px', fontSize: '14px', color: '#4a4a4d', textDecoration: 'none', fontWeight: 500 }}>Entrar</Link>
          <Link href="/cadastro" style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 700, background: '#6B0F1A', color: 'white', textDecoration: 'none', borderRadius: '10px', letterSpacing: '-0.01em' }}>Começar grátis</Link>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: '#1A1A1C', padding: '100px 60px 110px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(107,15,26,0.45) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-80px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,166,90,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Urgência */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px 6px 10px', borderRadius: '999px', background: 'rgba(201,166,90,0.08)', border: '1px solid rgba(201,166,90,0.2)', marginBottom: '40px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C9A65A', boxShadow: '0 0 8px rgba(201,166,90,0.8)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C9A65A', letterSpacing: '0.03em' }}>O maior sistema de monitoramento de licitações do Brasil</span>
          </div>

          {/* Headline principal — o gatilho mais forte */}
          <h1 style={{ fontSize: '70px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 30px', color: 'white', maxWidth: '860px' }}>
            Cada edital publicado sem você saber é{' '}
            <span style={{ color: '#C9A65A', fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 400 }}>dinheiro direto</span>{' '}
            no bolso do seu concorrente.
          </h1>

          {/* Subheadline — promessa clara */}
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: '0 0 16px', maxWidth: '640px', fontWeight: 400 }}>
            O Monitor de Licitações rastreia <strong style={{ color: 'rgba(255,255,255,0.85)' }}>todos os editais do Brasil</strong> e envia alertas diários com as oportunidades que combinam exatamente com o que a sua empresa vende.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: '0 0 48px', maxWidth: '580px' }}>
            Prefeituras, estados, governo federal, autarquias e empresas públicas — monitorados automaticamente, 365 dias por ano.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            <Link href="/cadastro" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '17px 34px', borderRadius: '12px',
              background: '#6B0F1A', color: 'white', fontSize: '16px', fontWeight: 700,
              textDecoration: 'none', letterSpacing: '-0.01em',
              boxShadow: '0 8px 32px rgba(107,15,26,0.55)',
            }}>
              Quero receber alertas agora →
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>✓ Sete dias completamente grátis</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>✓ Sem cartão de crédito agora</span>
            </div>
          </div>

          {/* Prova em números */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0' }}>
            {[
              { num: 'R$ 2 tri', label: 'em licitações por ano no Brasil' },
              { num: '5.500+', label: 'municípios rastreados todo dia' },
              { num: '< 5 dias', label: 'tempo médio de vida de um edital' },
              { num: '24h', label: 'para chegar o seu primeiro alerta' },
            ].map(({ num, label }, i) => (
              <div key={num} style={{ padding: '24px 20px 8px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '4px' }}>{num}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECONHECE ESSA SITUAÇÃO? (agitar a dor) ── */}
      <section style={{ padding: '100px 60px', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>Reconhece essa situação?</div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0', color: '#1A1A1C' }}>
              Você está perdendo contratos<br />que eram seus por direito.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            {[
              { icon: '😰', titulo: '"Descobri o edital depois do prazo"', desc: 'A licitação foi publicada, abriu e fechou em cinco dias. Você ficou sabendo uma semana depois — tarde demais.' },
              { icon: '😤', titulo: '"Meu concorrente ganhou sem eu saber"', desc: 'O contrato foi entregue. Você descobriu depois. O que você venderia tranquilamente foi parar no caixa de outra empresa.' },
              { icon: '😩', titulo: '"Não tenho tempo de verificar tudo"', desc: 'São centenas de portais, diários oficiais e sistemas diferentes. Ninguém consegue acompanhar tudo manualmente.' },
            ].map(c => (
              <div key={c.titulo} style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #D5D2C8' }}>
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A1C', marginBottom: '10px', lineHeight: 1.3 }}>{c.titulo}</div>
                <p style={{ fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Virada */}
          <div style={{ background: '#6B0F1A', borderRadius: '18px', padding: '36px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: 'white', margin: '0 0 6px', lineHeight: 1.3 }}>
                Isso não é azar. É falta de informação a tempo.
              </p>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                E informação a tempo é exatamente o que o Monitor de Licitações entrega — todos os dias úteis, na sua caixa de entrada.
              </p>
            </div>
            <Link href="/cadastro" style={{ flexShrink: 0, padding: '14px 28px', borderRadius: '10px', background: '#C9A65A', color: '#1A1A1C', fontWeight: 700, fontSize: '15px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Resolver isso agora →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding: '100px 60px', background: 'white' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>Simples. Automático. Eficaz.</div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px', color: '#1A1A1C' }}>
              Configure uma vez.<br />Receba oportunidades para sempre.
            </h2>
            <p style={{ fontSize: '18px', color: '#9AA0A6', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
              Você define o que sua empresa vende. Nós monitoramos tudo e avisamos quando o governo quer comprar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
            {[
              { n: '1', icon: '⚡', title: 'Cadastre-se em dois minutos', desc: 'Sete dias grátis, sem cartão de crédito. Você começa a monitorar imediatamente após o cadastro.' },
              { n: '2', icon: '🎯', title: 'Informe o que você vende', desc: 'Notebook, cadeira, ar condicionado, retroescavadeira — qualquer produto ou serviço. Quanto mais específico, melhor.' },
              { n: '3', icon: '📬', title: 'Receba alertas toda manhã', desc: 'Todos os dias úteis, sua equipe recebe por e-mail e Telegram os editais abertos que combinam com o seu negócio.' },
            ].map(step => (
              <div key={step.n} style={{ padding: '32px', background: '#FAF6F0', borderRadius: '16px', border: '1px solid #D5D2C8', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '11px', fontWeight: 800, color: '#6B0F1A', opacity: 0.15, letterSpacing: '0.05em' }}>0{step.n}</div>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A1C', marginBottom: '8px', letterSpacing: '-0.02em' }}>{step.title}</div>
                <div style={{ fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Diferencial de IA */}
          <div style={{ background: '#1A1A1C', borderRadius: '20px', padding: '48px 56px', display: 'flex', gap: '56px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(107,15,26,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '14px' }}>Inteligência a seu favor</div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                O sistema entende o que você vende — não apenas o que você escreveu.
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                Diferente dos buscadores comuns que exigem a palavra exata, nosso sistema interpreta contexto e significado. Quem monitora <strong style={{ color: 'rgba(255,255,255,0.8)' }}>"notebook"</strong> recebe alertas de <em>"equipamentos de informática"</em>, <em>"computadores portáteis"</em> e <em>"material de tecnologia"</em> também.
              </p>
            </div>
            <div style={{ flexShrink: 0, width: '220px' }}>
              {[
                { kw: 'notebook', desc: '37 editais encontrados esta semana' },
                { kw: 'cadeira', desc: '52 editais encontrados esta semana' },
                { kw: 'ar condicionado', desc: '28 editais encontrados esta semana' },
              ].map(({ kw, desc }) => (
                <div key={kw} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#C9A65A', fontWeight: 700, marginBottom: '3px' }}>{kw}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROVA SOCIAL (resultados específicos) ── */}
      <section style={{ padding: '100px 60px', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>Resultados de quem chegou primeiro</div>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 16px', color: '#1A1A1C' }}>
              Quem monitora, vende mais para o governo.
            </h2>
            <p style={{ fontSize: '17px', color: '#9AA0A6', margin: 0, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
              A diferença entre ganhar ou perder um contrato público quase sempre se resume a uma coisa: quem soube primeiro.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              {
                valor: 'R$ 127.000',
                desc: 'Contrato de notebooks para prefeitura do interior de MG',
                depoimento: '"O alerta chegou na segunda-feira. Na sexta já tínhamos enviado a proposta. Ganhamos o contrato. Sem o Monitor, nunca saberíamos que esse edital existia."',
                empresa: 'Distribuidora de TI — Belo Horizonte, MG',
                emoji: '💻',
              },
              {
                valor: 'R$ 84.500',
                desc: 'Fornecimento de cadeiras para escola estadual de SP',
                depoimento: '"Faturamos quase R$ 85 mil em um contrato que nem sabíamos que existia. O sistema me avisou antes de qualquer concorrente. Agora renovo todo mês."',
                empresa: 'Fabricante de móveis — Ubá, MG',
                emoji: '🪑',
              },
              {
                valor: 'R$ 43.200',
                desc: 'Material de higiene para câmara municipal de RJ',
                depoimento: '"Pensava que licitação era coisa de empresa grande. Com o Monitor, ganhei meu primeiro contrato com o governo em menos de 30 dias. Valeu 20 anos de mensalidade."',
                empresa: 'Distribuidora de limpeza — Rio de Janeiro, RJ',
                emoji: '🧴',
              },
            ].map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #D5D2C8', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{t.emoji}</div>
                <div style={{ fontSize: '30px', fontWeight: 800, color: '#6B0F1A', letterSpacing: '-0.03em', marginBottom: '4px' }}>{t.valor}</div>
                <div style={{ fontSize: '13px', color: '#9AA0A6', marginBottom: '20px' }}>{t.desc}</div>
                <p style={{ fontSize: '14px', color: '#4a4a4d', lineHeight: 1.75, fontStyle: 'italic', margin: '0 0 auto', paddingBottom: '20px' }}>{t.depoimento}</p>
                <div style={{ fontSize: '12px', color: '#9AA0A6', fontWeight: 700, paddingTop: '20px', borderTop: '1px solid #F0EDE8' }}>{t.empresa}</div>
              </div>
            ))}
          </div>

          {/* Gatilho de escassez temporal */}
          <div style={{ marginTop: '32px', background: 'white', borderRadius: '14px', padding: '20px 28px', border: '1px solid #D5D2C8', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '20px' }}>⏱</div>
            <p style={{ fontSize: '14px', color: '#4a4a4d', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#6B0F1A' }}>Editais fecham em média em cinco dias.</strong> Cada dia sem monitoramento é uma janela de oportunidade que fecha sem você. Empresas que começaram a monitorar esta semana já têm vantagem sobre as que vão começar na semana que vem.
            </p>
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" style={{ padding: '100px 60px', background: 'white' }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>Investimento mínimo. Retorno ilimitado.</div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px', color: '#1A1A1C' }}>
              R$ 49,90 por mês. Um contrato público paga anos de assinatura.
            </h2>
            <p style={{ fontSize: '17px', color: '#9AA0A6', maxWidth: '560px', margin: '0 auto' }}>
              Escolha o plano ideal para o tamanho da sua operação. Sete dias grátis em todos. Sem cartão de crédito agora.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'end' }}>
            {[
              { nome: 'Basic', preco: '49,90', desc: 'Para quem está começando no setor público', keywords: 'Até 10 palavras-chave', usuarios: '1 usuário', destaque: false, id: 'basic', tag: null },
              { nome: 'Profissional', preco: '97', desc: 'Para quem vende ativamente para o governo', keywords: 'Ilimitadas', usuarios: '1 usuário', destaque: false, id: 'profissional', tag: null },
              { nome: 'Pro', preco: '197', desc: 'Para equipes comerciais que querem crescer', keywords: 'Ilimitadas', usuarios: 'Até 5 usuários', destaque: true, id: 'pro', tag: 'Mais escolhido' },
              { nome: 'Empresarial', preco: '497', desc: 'Para operações que dependem do setor público', keywords: 'Ilimitadas', usuarios: 'Usuários ilimitados', destaque: false, id: 'empresarial', tag: null },
            ].map(p => (
              <div key={p.id} style={{
                background: p.destaque ? '#6B0F1A' : '#FAF6F0',
                border: p.destaque ? '2px solid #C9A65A' : '1px solid #D5D2C8',
                borderRadius: '16px',
                padding: p.destaque ? '36px 24px' : '28px 24px',
                position: 'relative',
                boxShadow: p.destaque ? '0 16px 48px rgba(107,15,26,0.25)' : 'none',
              }}>
                {p.tag && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#C9A65A', color: '#1A1A1C', fontSize: '10px', fontWeight: 800, padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{p.tag.toUpperCase()}</div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.destaque ? '#C9A65A' : '#9AA0A6', marginBottom: '4px' }}>{p.nome}</div>
                <div style={{ fontSize: '12px', color: p.destaque ? 'rgba(255,255,255,0.45)' : '#9AA0A6', marginBottom: '20px', lineHeight: 1.4 }}>{p.desc}</div>
                <div style={{ fontSize: '38px', fontWeight: 800, color: p.destaque ? 'white' : '#1A1A1C', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '2px' }}>R${p.preco}</div>
                <div style={{ fontSize: '12px', color: p.destaque ? 'rgba(255,255,255,0.35)' : '#9AA0A6', marginBottom: '24px' }}>/mês · cobrado mensalmente</div>
                {[p.keywords, p.usuarios, 'Alertas por e-mail e Telegram', 'Busca manual no painel'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: p.destaque ? '#C9A65A' : '#6B0F1A', fontWeight: 700, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.8)' : '#4a4a4d', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
                <Link href={`/cadastro?plano=${p.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '13px', marginTop: '20px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  background: p.destaque ? '#C9A65A' : '#6B0F1A',
                  color: p.destaque ? '#1A1A1C' : 'white',
                  textDecoration: 'none',
                }}>
                  Começar grátis agora
                </Link>
                <p style={{ textAlign: 'center', fontSize: '11px', color: p.destaque ? 'rgba(255,255,255,0.3)' : '#9AA0A6', marginTop: '8px', marginBottom: 0 }}>Sete dias grátis · sem cartão</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <p style={{ fontSize: '13px', color: '#9AA0A6', margin: '0 0 6px' }}>
              Todos os planos incluem busca manual, histórico de alertas e suporte via WhatsApp. Assine a partir de R$ 49,90/mês.
            </p>
            <Link href="/assinar" style={{ fontSize: '13px', color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Ver comparação detalhada dos planos →</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ — destruir objeções ── */}
      <section style={{ padding: '80px 60px', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: '8px', color: '#1A1A1C' }}>Dúvidas frequentes</h2>
          <p style={{ textAlign: 'center', color: '#9AA0A6', fontSize: '16px', marginBottom: '48px' }}>Respondemos as principais dúvidas de quem está considerando monitorar licitações.</p>
          {[
            ['Preciso de cartão de crédito para começar?', 'Não. Os sete dias de teste são completamente gratuitos e sem burocracia. Você só cadastra uma forma de pagamento se decidir continuar após o período de teste.'],
            ['Minha empresa é pequena. Isso funciona para mim?', 'Especialmente para você. O governo brasileiro tem cotas e benefícios para micro e pequenas empresas em licitações. MEI, ME e EPP têm vantagens legais que grandes empresas não têm. Falta apenas informação — e isso o Monitor resolve.'],
            ['Como o sistema sabe quais editais combinam com meu negócio?', 'Você informa as palavras-chave do que vende, e nosso sistema inteligente lê o objeto de cada licitação publicada e identifica se há compatibilidade — mesmo que a redação do edital use termos diferentes dos seus.'],
            ['Com que frequência recebo alertas?', 'Diariamente, de segunda a sexta. Enviamos até quatro e-mails por dia, com no máximo 50 oportunidades cada, sempre dentro do horário comercial. Você nunca fica sobrecarregado e nunca perde uma oportunidade.'],
            ['Posso cancelar se não for o que esperava?', 'Sim, a qualquer momento, sem multa e sem burocracia. Mas aviso: é difícil cancelar quando começa a receber contratos que você nunca soube que estavam disponíveis.'],
          ].map(([q, a], i) => (
            <details key={i} style={{ borderBottom: '1px solid #D5D2C8' }}>
              <summary style={{ padding: '22px 0', cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: '#1A1A1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                {q}
                <span style={{ color: '#6B0F1A', fontSize: '22px', fontWeight: 300, flexShrink: 0, marginLeft: '16px', lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ paddingBottom: '22px', margin: 0, fontSize: '15px', color: '#9AA0A6', lineHeight: 1.75 }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: '#1A1A1C', padding: '100px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(107,15,26,0.45) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '20px' }}>Sua decisão. Agora.</div>
          <h2 style={{ fontSize: '54px', fontWeight: 400, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 20px', fontFamily: 'Georgia, serif' }}>
            O governo vai publicar novos editais amanhã de manhã. <em style={{ color: '#C9A65A' }}>Você vai saber?</em>
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', margin: '0 0 12px', lineHeight: 1.65 }}>
            Cada dia sem monitoramento é um dia em que seu concorrente leva vantagem. Configure o Monitor agora e receba os primeiros alertas amanhã — de graça, sem cartão, sem compromisso.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.25)', margin: '0 0 48px' }}>
            Mais de 5.500 municípios monitorados. Alertas diários. Sete dias inteiramente grátis.
          </p>
          <Link href="/cadastro" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '18px 40px', borderRadius: '14px',
            background: '#6B0F1A', color: 'white', fontSize: '17px', fontWeight: 700,
            textDecoration: 'none', letterSpacing: '-0.01em',
            boxShadow: '0 12px 40px rgba(107,15,26,0.55)',
          }}>
            Quero meu acesso gratuito agora →
          </Link>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginTop: '18px' }}>
            Cadastro em dois minutos · Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111113', padding: '28px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#6B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#C9A65A' }}>ML</div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>© 2025 Monitor de Licitações · Matutta</span>
        </div>
        <div style={{ display: 'flex', gap: '28px', justifyContent: 'center' }}>
          {[['Início', '/'], ['Planos', '/assinar'], ['Entrar', '/login'], ['Cadastrar', '/cadastro']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
