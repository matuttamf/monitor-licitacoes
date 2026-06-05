import Link from 'next/link'

export default function LandingPage() {
  const s = {
    page: { fontFamily: 'var(--font-jakarta, system-ui, sans-serif)', background: 'var(--creme, #FAF6F0)', color: 'var(--preto, #1A1A1C)', margin: 0 },
    // Header
    header: { position: 'sticky' as const, top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', background: 'rgba(250,246,240,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(201,166,90,0.15)' },
    logo: { display: 'flex', alignItems: 'center', gap: '12px' },
    logoBadge: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', background: '#6B0F1A', color: '#C9A65A', border: '1px solid rgba(201,166,90,0.3)', letterSpacing: '0.05em' },
    logoText: { fontWeight: 600, fontSize: '15px', color: '#1A1A1C' },
    nav: { display: 'flex', alignItems: 'center', gap: '12px' },
    btnOutline: { padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#1A1A1C', border: '1.5px solid rgba(26,26,28,0.15)', textDecoration: 'none', background: 'transparent' },
    btnPrimary: { padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: '#6B0F1A', color: 'white', textDecoration: 'none' },
    // Hero
    hero: { background: '#1A1A1C', padding: '80px 48px 100px', textAlign: 'center' as const, position: 'relative' as const },
    badge: { display: 'inline-block', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: 'rgba(201,166,90,0.12)', color: '#C9A65A', border: '1px solid rgba(201,166,90,0.2)', marginBottom: '28px', letterSpacing: '0.05em' },
    heroTitle: { fontSize: '52px', fontWeight: 400, lineHeight: 1.15, color: 'white', margin: '0 auto 20px', maxWidth: '800px', fontFamily: 'var(--font-instrument, Georgia, serif)' },
    heroTitleAccent: { color: '#C9A65A', fontStyle: 'italic' },
    heroSub: { fontSize: '18px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 40px' },
    heroButtons: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' as const },
    btnHeroPrimary: { padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, background: '#6B0F1A', color: 'white', textDecoration: 'none' },
    btnHeroSecondary: { padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.15)', textDecoration: 'none', background: 'transparent' },
    heroStats: { display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '56px', flexWrap: 'wrap' as const },
    heroStat: { textAlign: 'center' as const },
    heroStatNum: { fontSize: '24px', fontWeight: 700, color: '#C9A65A' },
    heroStatLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' },
    // Sections
    section: { padding: '80px 48px' },
    sectionDark: { padding: '80px 48px', background: '#1A1A1C' },
    sectionWhite: { padding: '80px 48px', background: 'white' },
    sectionTitle: { fontSize: '36px', fontWeight: 400, textAlign: 'center' as const, marginBottom: '12px', fontFamily: 'var(--font-instrument, Georgia, serif)' },
    sectionSub: { fontSize: '16px', color: '#9AA0A6', textAlign: 'center' as const, marginBottom: '52px' },
    // Cards grid 3
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' },
    card: { background: 'white', border: '1px solid #D5D2C8', borderRadius: '16px', padding: '28px' },
    cardIcon: { fontSize: '28px', marginBottom: '16px' },
    cardTitle: { fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1C' },
    cardText: { fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7, margin: 0 },
    // Passos
    steps: { display: 'flex', gap: '32px', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap' as const, justifyContent: 'center' },
    step: { flex: 1, minWidth: '220px', textAlign: 'center' as const },
    stepNum: { width: '40px', height: '40px', borderRadius: '50%', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', margin: '0 auto 16px' },
    stepTitle: { fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#1A1A1C' },
    stepText: { fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7 },
    // Fontes grid
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '960px', margin: '0 auto 32px' },
    fonteCard: (cor: string, bg: string) => ({ background: bg, border: `1px solid ${cor}30`, borderRadius: '14px', padding: '24px', textAlign: 'center' as const }),
    fonteName: (cor: string) => ({ fontWeight: 700, fontSize: '15px', color: cor, marginBottom: '4px' }),
    fonteDesc: { fontSize: '13px', color: '#9AA0A6' },
    // Planos
    planosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' },
    planoCard: (destaque: boolean) => ({ background: destaque ? '#6B0F1A' : 'white', border: destaque ? '2px solid #C9A65A' : '1px solid #D5D2C8', borderRadius: '16px', padding: '28px', position: 'relative' as const }),
    planoBadge: { position: 'absolute' as const, top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#C9A65A', color: '#1A1A1C', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
    planoNome: (destaque: boolean) => ({ fontSize: '14px', fontWeight: 600, color: destaque ? '#C9A65A' : '#9AA0A6', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }),
    planoPreco: (destaque: boolean) => ({ fontSize: '34px', fontWeight: 800, color: destaque ? 'white' : '#1A1A1C', lineHeight: 1, marginBottom: '4px' }),
    planoMes: (destaque: boolean) => ({ fontSize: '13px', color: destaque ? 'rgba(255,255,255,0.5)' : '#9AA0A6', marginBottom: '20px' }),
    planoItem: (destaque: boolean) => ({ fontSize: '14px', color: destaque ? 'rgba(255,255,255,0.8)' : '#4a4a4d', lineHeight: 1.6, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }),
    planoCheck: (destaque: boolean) => ({ color: destaque ? '#C9A65A' : '#6B0F1A', fontWeight: 700 }),
    planoBtn: (destaque: boolean) => ({ display: 'block', textAlign: 'center' as const, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, marginTop: '24px', textDecoration: 'none', background: destaque ? '#C9A65A' : '#6B0F1A', color: destaque ? '#1A1A1C' : 'white' }),
    // FAQ
    faqItem: { borderBottom: '1px solid #D5D2C8', padding: '20px 0' },
    faqQ: { fontWeight: 600, fontSize: '15px', cursor: 'pointer', color: '#1A1A1C', listStyle: 'none' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    faqA: { fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7, marginTop: '12px' },
    // CTA final
    ctaFinal: { background: '#1A1A1C', padding: '80px 48px', textAlign: 'center' as const },
    ctaTitle: { fontSize: '42px', fontWeight: 400, color: 'white', marginBottom: '16px', fontFamily: 'var(--font-instrument, Georgia, serif)' },
    ctaSub: { fontSize: '16px', color: 'rgba(255,255,255,0.45)', marginBottom: '36px' },
    ctaBtn: { display: 'inline-block', padding: '16px 40px', borderRadius: '14px', fontSize: '17px', fontWeight: 700, background: '#6B0F1A', color: 'white', textDecoration: 'none' },
    // Footer
    footer: { background: '#1A1A1C', borderTop: '1px solid rgba(201,166,90,0.1)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '16px' },
    footerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    footerText: { fontSize: '13px', color: 'rgba(255,255,255,0.3)' },
    footerLinks: { display: 'flex', gap: '24px' },
    footerLink: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' },
  }

  const planos = [
    { id: 'basic', nome: 'Basic', preco: '49,90', keywords: 'Até 10 palavras-chave', usuarios: '1 usuário', extras: ['E-mail + Telegram'], destaque: false },
    { id: 'profissional', nome: 'Profissional', preco: '97', keywords: 'Ilimitadas', usuarios: '1 usuário', extras: ['E-mail + Telegram'], destaque: false },
    { id: 'pro', nome: 'Pro', preco: '197', keywords: 'Ilimitadas', usuarios: '5 usuários', extras: ['E-mail + Telegram', 'Suporte prioritário'], destaque: true },
    { id: 'empresarial', nome: 'Empresarial', preco: '497', keywords: 'Ilimitadas', usuarios: 'Usuários ilimitados', extras: ['Tudo do Pro', 'Relatório semanal'], destaque: false },
  ]

  return (
    <div style={s.page}>
      {/* HEADER */}
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoBadge}>ML</div>
          <span style={s.logoText}>Monitor de Licitações</span>
        </div>
        <nav style={s.nav}>
          <Link href="/login" style={s.btnOutline}>Entrar</Link>
          <Link href="/cadastro" style={s.btnPrimary}>Começar grátis</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.badge}>Novo · Powered by Gemini IA</div>
        <h1 style={s.heroTitle}>
          Nunca perca uma licitação<br />
          <span style={s.heroTitleAccent}>pública de novo.</span>
        </h1>
        <p style={s.heroSub}>
          Alertas diários automáticos de prefeituras, estados e governo federal — filtrados por IA para o que você realmente pode vender.
        </p>
        <div style={s.heroButtons}>
          <Link href="/cadastro" style={s.btnHeroPrimary}>Começar 7 dias grátis</Link>
          <Link href="/assinar" style={s.btnHeroSecondary}>Ver planos →</Link>
        </div>
        <div style={s.heroStats}>
          {[['5.500+', 'Municípios monitorados'], ['Diária', 'Atualização automática'], ['IA', 'Match semântico Gemini'], ['R$ 0', 'Para começar']].map(([num, label]) => (
            <div key={label} style={s.heroStat}>
              <div style={s.heroStatNum}>{num}</div>
              <div style={s.heroStatLabel}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Você já perdeu contratos por não saber que o edital existia?</h2>
        <p style={s.sectionSub}>Esse é o problema que o Monitor resolve todos os dias.</p>
        <div style={s.grid3}>
          {[
            { icon: '⏰', title: 'Editais somem em dias', text: 'Editais publicados e fechados em 5 dias — sem você saber. A concorrência que monitora sai na frente.' },
            { icon: '📋', title: 'Centenas de portais', text: 'Centenas de portais diferentes para acompanhar manualmente. Impossível sem um sistema automatizado.' },
            { icon: '📉', title: 'Concorrentes com vantagem', text: 'Concorrentes recebendo alertas enquanto você pesquisa manualmente. A diferença é quem chega primeiro.' },
          ].map(c => (
            <div key={c.title} style={s.card}>
              <div style={s.cardIcon}>{c.icon}</div>
              <div style={s.cardTitle}>{c.title}</div>
              <p style={s.cardText}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={s.sectionWhite}>
        <h2 style={s.sectionTitle}>Como funciona</h2>
        <p style={s.sectionSub}>Configure em 2 minutos. Receba seu primeiro alerta amanhã.</p>
        <div style={s.steps}>
          {[
            { n: '1', title: 'Cadastre-se em 2 minutos', text: 'Sem cartão de crédito. 7 dias grátis em qualquer plano.' },
            { n: '2', title: 'Configure suas palavras-chave', text: 'notebook, cadeira, retroescavadeira — o que você vende.' },
            { n: '3', title: 'Receba alertas todos os dias', text: 'Por e-mail e Telegram, com link direto para o edital.' },
          ].map(step => (
            <div key={step.n} style={s.step}>
              <div style={s.stepNum}>{step.n}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <p style={s.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FONTES */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Cobertura completa do governo brasileiro</h2>
        <p style={s.sectionSub}>Prefeituras · Estados · Governo Federal · Autarquias · Empresas Públicas</p>
        <div style={s.grid4}>
          {[
            { nome: 'PNCP', desc: 'API oficial do governo federal', cor: '#6B0F1A', bg: 'rgba(107,15,26,0.06)' },
            { nome: 'ComprasNet', desc: 'Compras do governo federal', cor: '#8B1E2D', bg: 'rgba(139,30,45,0.06)' },
            { nome: 'Querido Diário', desc: 'Diários oficiais municipais', cor: '#C9A65A', bg: 'rgba(201,166,90,0.08)' },
            { nome: 'Google', desc: 'Portais municipais e estaduais', cor: '#2d6a4f', bg: 'rgba(45,106,79,0.06)' },
          ].map(f => (
            <div key={f.nome} style={s.fonteCard(f.cor, f.bg)}>
              <div style={s.fonteName(f.cor)}>{f.nome}</div>
              <div style={s.fonteDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9AA0A6' }}>
          Mais de <strong>5.500 municípios</strong> monitorados diariamente
        </p>
      </section>

      {/* PLANOS */}
      <section style={s.sectionWhite}>
        <h2 style={s.sectionTitle}>Escolha seu plano</h2>
        <p style={s.sectionSub}>7 dias grátis em qualquer plano. Cancele quando quiser. Sem burocracia.</p>
        <div style={s.planosGrid}>
          {planos.map(p => (
            <div key={p.id} style={s.planoCard(p.destaque)}>
              {p.destaque && <div style={s.planoBadge}>⭐ Mais popular</div>}
              <div style={s.planoNome(p.destaque)}>{p.nome}</div>
              <div style={s.planoPreco(p.destaque)}>R$ {p.preco}</div>
              <div style={s.planoMes(p.destaque)}>/mês</div>
              {[p.keywords, p.usuarios, ...p.extras].map(item => (
                <div key={item} style={s.planoItem(p.destaque)}>
                  <span style={s.planoCheck(p.destaque)}>✓</span> {item}
                </div>
              ))}
              <Link href={`/cadastro?plano=${p.id}`} style={s.planoBtn(p.destaque)}>
                Começar grátis
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Perguntas frequentes</h2>
        <div style={{ maxWidth: '700px', margin: '40px auto 0' }}>
          {[
            ['Preciso de cartão de crédito para o teste?', 'Não. Os 7 dias de teste são completamente gratuitos, sem necessidade de cartão de crédito.'],
            ['Como recebo os alertas?', 'Por e-mail todos os dias e pelo Telegram (bot). Você configura o Telegram uma vez e recebe mensagens diárias.'],
            ['Quais estados e municípios são cobertos?', 'Cobrimos todo o Brasil — todos os 26 estados e Distrito Federal, com mais de 5.500 municípios via PNCP, ComprasNet, Querido Diário e Google.'],
            ['Posso cancelar a qualquer momento?', 'Sim. Cancele quando quiser, sem multas ou burocracia. Sua conta fica ativa até o fim do período pago.'],
            ['O que é match semântico por IA?', 'O Gemini (IA do Google) lê o objeto da licitação e identifica se tem relação com suas palavras-chave — mesmo que não seja texto exato. Ex: "notebook" encontra "computadores portáteis".'],
          ].map(([q, a]) => (
            <details key={q as string} style={s.faqItem}>
              <summary style={s.faqQ}>{q} <span>+</span></summary>
              <p style={s.faqA}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={s.ctaFinal}>
        <h2 style={s.ctaTitle}>Comece hoje.<br />Receba seu primeiro alerta amanhã.</h2>
        <p style={s.ctaSub}>7 dias grátis · Sem cartão de crédito · Cancele quando quiser</p>
        <Link href="/cadastro" style={s.ctaBtn}>Criar conta gratuita →</Link>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerLeft}>
          <div style={{ ...s.logoBadge, width: '28px', height: '28px', fontSize: '10px' }}>ML</div>
          <span style={s.footerText}>© 2025 Monitor de Licitações · Matutta</span>
        </div>
        <div style={s.footerLinks}>
          <Link href="/login" style={s.footerLink}>Entrar</Link>
          <Link href="/cadastro" style={s.footerLink}>Cadastrar</Link>
          <Link href="/assinar" style={s.footerLink}>Planos</Link>
        </div>
      </footer>
    </div>
  )
}
