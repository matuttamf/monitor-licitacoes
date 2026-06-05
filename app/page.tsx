import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: '"Inter", system-ui, -apple-system, sans-serif', background: '#FAF6F0', color: '#1A1A1C', margin: 0, padding: 0 }}>

      {/* ──────────────── HEADER ──────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px', height: '68px',
        background: 'rgba(250,246,240,0.96)',
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

      {/* ──────────────── HERO ──────────────── */}
      <section style={{ background: '#1A1A1C', padding: '100px 60px 120px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow effects */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(107,15,26,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,166,90,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '55%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,30,45,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px 6px 8px', borderRadius: '999px', background: 'rgba(201,166,90,0.08)', border: '1px solid rgba(201,166,90,0.2)', marginBottom: '36px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A65A', boxShadow: '0 0 6px #C9A65A' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C9A65A', letterSpacing: '0.04em' }}>Monitoramento inteligente de licitações públicas</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 28px', color: 'white', maxWidth: '820px' }}>
            Sua empresa na<br />
            frente de{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ color: '#C9A65A', fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 400 }}>toda</span>
            </span>{' '}
            <span style={{ color: '#C9A65A', fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 400 }}>concorrência.</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 48px', maxWidth: '620px', fontWeight: 400 }}>
            Alertas diários e automáticos de editais públicos de prefeituras, estados e governo federal — filtrados por inteligência artificial para os produtos que você vende.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            <Link href="/cadastro" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 32px', borderRadius: '12px',
              background: '#6B0F1A', color: 'white', fontSize: '16px', fontWeight: 700,
              textDecoration: 'none', letterSpacing: '-0.01em',
              boxShadow: '0 8px 32px rgba(107,15,26,0.5)',
            }}>
              Começar 7 dias grátis →
            </Link>
            <Link href="/assinar" style={{ padding: '16px 28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontSize: '15px', fontWeight: 500, textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}>
              Ver planos e preços
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['5.500+', 'municípios monitorados'],
              ['R$ 2 tri', 'em licitações por ano no Brasil'],
              ['< 5 dias', 'tempo médio de um edital'],
              ['24h', 'tempo para o 1º alerta'],
            ].map(([num, label], i) => (
              <div key={label} style={{ flex: 1, padding: '24px 20px 8px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '4px' }}>{num}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ──────────────── PROBLEMA ──────────────── */}
      <section style={{ padding: '100px 60px', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>O problema</div>
              <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 24px', color: '#1A1A1C' }}>
                Sua empresa perde contratos todo dia sem saber.
              </h2>
              <p style={{ fontSize: '17px', color: '#9AA0A6', lineHeight: 1.7, margin: 0 }}>
                O governo brasileiro abre milhares de licitações todo dia. A maioria das empresas que poderia participar simplesmente não fica sabendo — e perde contratos para quem monitora.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { n: '01', title: 'Editais publicados e fechados em cinco dias', desc: 'Sem um sistema de monitoramento, você descobre tarde demais para participar.' },
                { n: '02', title: 'Centenas de portais diferentes', desc: 'PNCP, ComprasNet, portais municipais, diários oficiais — impossível acompanhar tudo manualmente.' },
                { n: '03', title: 'Concorrentes já recebem alertas automáticos', desc: 'As empresas que monitoram sistematicamente chegam primeiro e ganham os contratos.' },
              ].map(c => (
                <div key={c.n} style={{ display: 'flex', gap: '16px', padding: '20px', background: 'white', borderRadius: '14px', border: '1px solid #D5D2C8', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6B0F1A', opacity: 0.4, letterSpacing: '0.05em', paddingTop: '2px', flexShrink: 0 }}>{c.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A1C', marginBottom: '4px' }}>{c.title}</div>
                    <div style={{ fontSize: '13px', color: '#9AA0A6', lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── SOLUÇÃO / COMO FUNCIONA ──────────────── */}
      <section id="como-funciona" style={{ padding: '100px 60px', background: 'white' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>A solução</div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px', color: '#1A1A1C' }}>
              Automatize seu monitoramento.<br />Foque em vender.
            </h2>
            <p style={{ fontSize: '18px', color: '#9AA0A6', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
              Configure uma vez. Receba alertas todos os dias com as licitações que realmente importam para o seu negócio.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
            {[
              { n: '1', icon: '⚡', title: 'Cadastre-se em dois minutos', desc: 'Crie sua conta gratuitamente, sem cartão de crédito. Você tem sete dias para explorar tudo.' },
              { n: '2', icon: '🎯', title: 'Defina o que você vende', desc: 'Informe suas palavras-chave: notebook, cadeira, ar condicionado, retroescavadeira — qualquer produto ou categoria.' },
              { n: '3', icon: '📬', title: 'Receba alertas toda manhã', desc: 'Todos os dias úteis você recebe no e-mail e no Telegram os editais que combinam com o que você vende.' },
            ].map((step, i) => (
              <div key={step.n} style={{ padding: '32px', background: '#FAF6F0', borderRadius: '16px', border: '1px solid #D5D2C8', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '11px', fontWeight: 800, color: '#6B0F1A', opacity: 0.2, letterSpacing: '0.05em' }}>0{step.n}</div>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A1C', marginBottom: '8px', letterSpacing: '-0.02em' }}>{step.title}</div>
                <div style={{ fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Destaque da IA */}
          <div style={{ background: '#1A1A1C', borderRadius: '20px', padding: '48px 56px', display: 'flex', gap: '48px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(107,15,26,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '14px' }}>Diferencial exclusivo</div>
              <h3 style={{ fontSize: '30px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Nosso sistema lê e interpreta os editais como um especialista.
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                Ao contrário de buscas por palavras exatas, nossa tecnologia entende o contexto. "Computadores portáteis" aparece para quem monitora "notebook". "Material de higiene" aparece para quem monitora "papel higiênico".
              </p>
            </div>
            <div style={{ flexShrink: 0, width: '220px' }}>
              {[['notebook', '23 editais esta semana'], ['cadeira', '41 editais esta semana'], ['impressora', '17 editais esta semana']].map(([kw, count]) => (
                <div key={kw} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#C9A65A', fontWeight: 600, marginBottom: '2px' }}>{kw}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── PROVA SOCIAL ──────────────── */}
      <section style={{ padding: '100px 60px', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>Resultados reais</div>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.03em', margin: '0', color: '#1A1A1C' }}>
              Empresas que chegaram primeiro.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { valor: 'R$ 127.000', desc: 'Contrato de notebooks para uma prefeitura', depoimento: '"Não sabíamos que esse edital existia. O alerta chegou no primeiro dia e conseguimos participar. Ganhamos o contrato."', empresa: 'Distribuidora de TI — Belo Horizonte, MG' },
              { valor: 'R$ 84.500', desc: 'Fornecimento de cadeiras para escola estadual', depoimento: '"Cheguei a pensar que as licitações eram só para grandes empresas. Com o Monitor, vi que há espaço para todo mundo."', empresa: 'Fabricante de móveis — Ubá, MG' },
              { valor: 'R$ 43.200', desc: 'Material de limpeza para câmara municipal', depoimento: '"A ferramenta se pagou na primeira semana. Agora monitoramos 12 categorias diferentes e estamos sempre disputando."', empresa: 'Distribuidora de higiene — São Paulo, SP' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #D5D2C8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#6B0F1A', letterSpacing: '-0.03em', marginBottom: '4px' }}>{t.valor}</div>
                  <div style={{ fontSize: '13px', color: '#9AA0A6', marginBottom: '24px' }}>{t.desc}</div>
                  <p style={{ fontSize: '14px', color: '#4a4a4d', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 20px' }}>{t.depoimento}</p>
                </div>
                <div style={{ fontSize: '12px', color: '#9AA0A6', fontWeight: 600, paddingTop: '20px', borderTop: '1px solid #F0EDE8' }}>{t.empresa}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PLANOS ──────────────── */}
      <section id="planos" style={{ padding: '100px 60px', background: 'white' }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B0F1A', marginBottom: '16px' }}>Preços transparentes</div>
            <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 16px', color: '#1A1A1C' }}>Escolha seu plano</h2>
            <p style={{ fontSize: '17px', color: '#9AA0A6' }}>Sete dias grátis em qualquer plano. Sem cartão de crédito. Cancele quando quiser.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'end' }}>
            {[
              { nome: 'Basic', preco: '49,90', desc: 'Para começar', keywords: 'Até 10 palavras-chave', usuarios: '1 usuário', destaque: false, id: 'basic' },
              { nome: 'Profissional', preco: '97', desc: 'Para vendedores ativos', keywords: 'Ilimitadas', usuarios: '1 usuário', destaque: false, id: 'profissional' },
              { nome: 'Pro', preco: '197', desc: 'Para equipes', keywords: 'Ilimitadas', usuarios: 'Até 5 usuários', destaque: true, id: 'pro' },
              { nome: 'Empresarial', preco: '497', desc: 'Operações grandes', keywords: 'Ilimitadas', usuarios: 'Ilimitados', destaque: false, id: 'empresarial' },
            ].map(p => (
              <div key={p.id} style={{
                background: p.destaque ? '#6B0F1A' : '#FAF6F0',
                border: p.destaque ? '2px solid #C9A65A' : '1px solid #D5D2C8',
                borderRadius: '16px',
                padding: p.destaque ? '36px 24px' : '28px 24px',
                position: 'relative',
                boxShadow: p.destaque ? '0 16px 48px rgba(107,15,26,0.25)' : 'none',
              }}>
                {p.destaque && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#C9A65A', color: '#1A1A1C', fontSize: '10px', fontWeight: 800, padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>MAIS POPULAR</div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.destaque ? '#C9A65A' : '#9AA0A6', marginBottom: '4px' }}>{p.nome}</div>
                <div style={{ fontSize: '12px', color: p.destaque ? 'rgba(255,255,255,0.45)' : '#9AA0A6', marginBottom: '20px' }}>{p.desc}</div>
                <div style={{ fontSize: '38px', fontWeight: 800, color: p.destaque ? 'white' : '#1A1A1C', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '2px' }}>R${p.preco}</div>
                <div style={{ fontSize: '12px', color: p.destaque ? 'rgba(255,255,255,0.35)' : '#9AA0A6', marginBottom: '24px' }}>/mês</div>
                <div style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.75)' : '#4a4a4d', marginBottom: '6px' }}>✓ {p.keywords}</div>
                <div style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.75)' : '#4a4a4d', marginBottom: '6px' }}>✓ {p.usuarios}</div>
                <div style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.75)' : '#4a4a4d', marginBottom: '24px' }}>✓ E-mail + Telegram</div>
                <Link href={`/cadastro?plano=${p.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  background: p.destaque ? '#C9A65A' : '#6B0F1A',
                  color: p.destaque ? '#1A1A1C' : 'white',
                  textDecoration: 'none',
                }}>
                  Começar grátis
                </Link>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#9AA0A6', marginTop: '24px' }}>
            Todos os planos incluem busca manual, histórico de alertas e suporte via WhatsApp. Assine a partir de R$ 49,90/mês.{' '}
            <Link href="/assinar" style={{ color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Ver todos os planos →</Link>
          </p>
        </div>
      </section>

      {/* ──────────────── URGÊNCIA / OBJEÇÕES ──────────────── */}
      <section style={{ padding: '80px 60px', background: '#FAF6F0' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: '48px', color: '#1A1A1C' }}>Perguntas frequentes</h2>
          {[
            ['Preciso de cartão de crédito para o teste?', 'Não. Os sete dias de teste são completamente gratuitos, sem qualquer dado de pagamento. Você só configura a forma de pagamento se decidir continuar.'],
            ['Como funciona a busca por contexto?', 'Nosso sistema lê o objeto da licitação e identifica relação com suas palavras-chave por contexto e significado — não apenas texto exato. "Equipamentos de informática" encontra quem monitora "notebook" ou "computador".'],
            ['Qualquer empresa pode participar de licitações?', 'Sim. Qualquer empresa formal pode participar, independentemente do porte — MEI, ME, EPP e grandes empresas. O segredo está em ser notificado a tempo e apresentar a proposta dentro do prazo.'],
            ['Posso cancelar quando quiser?', 'Sim. Cancele a qualquer momento pelo painel, sem burocracia e sem multa. Nenhuma letra pequena.'],
            ['E se eu não encontrar licitações para o que eu vendo?', 'É raro, mas se acontecer nos primeiros sete dias, sua conta continua ativa gratuitamente enquanto ajustamos as palavras-chave com você.'],
          ].map(([q, a], i) => (
            <details key={i} style={{ borderBottom: '1px solid #D5D2C8' }}>
              <summary style={{ padding: '22px 0', cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: '#1A1A1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                {q}
                <span style={{ color: '#6B0F1A', fontSize: '20px', fontWeight: 300, flexShrink: 0, marginLeft: '16px' }}>+</span>
              </summary>
              <p style={{ paddingBottom: '22px', margin: 0, fontSize: '15px', color: '#9AA0A6', lineHeight: 1.75 }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ──────────────── CTA FINAL ──────────────── */}
      <section style={{ background: '#1A1A1C', padding: '100px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(107,15,26,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '20px' }}>Comece agora</div>
          <h2 style={{ fontSize: '56px', fontWeight: 400, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 20px', fontFamily: 'Georgia, serif' }}>
            Seu próximo contrato<br />pode aparecer amanhã.
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', margin: '0 0 48px', lineHeight: 1.6 }}>
            Enquanto você lê isso, editais estão sendo publicados. Configure seu monitor agora e receba os primeiros alertas nas próximas 24 horas.
          </p>
          <Link href="/cadastro" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '18px 40px', borderRadius: '14px',
            background: '#6B0F1A', color: 'white', fontSize: '17px', fontWeight: 700,
            textDecoration: 'none', letterSpacing: '-0.01em',
            boxShadow: '0 12px 40px rgba(107,15,26,0.5)',
          }}>
            Criar conta gratuita — sete dias grátis
          </Link>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginTop: '20px' }}>
            Sem cartão de crédito · Ativação imediata · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
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
