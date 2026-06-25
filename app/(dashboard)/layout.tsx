import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './components/LogoutButton'
import { NavItem } from './components/NavItem'
import { MobileMenuDrawer } from './components/MobileMenuDrawer'
import { IndicaWidget } from './components/IndicaWidget'
import { temMultiUsuario, temRadar, temFornecedores, temPrecosFiltros } from '@/lib/planos'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',         icon: '◈' },
  { href: '/busca',          label: 'Busca',             icon: '⊕' },
  { href: '/palavras-chave', label: 'Palavras-chave',    icon: '◎' },
  { href: '/alertas',        label: 'Alertas',           icon: '◉' },
  { href: '/perfil',         label: 'Meu Perfil',        icon: '◑' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const emailPrefix = user.email?.split('@')[0] ?? 'usuário'

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, owner_id, status, trial_fim, nome, empresa, membro_ativo, bloqueado_admin, acesso_ate')
    .eq('id', user.id)
    .single()

  const nomeExibido = profile?.nome?.trim() || emailPrefix
  const empresaExibida = profile?.empresa?.trim() || 'Monitor de Licitações'
  const inicialExibida = nomeExibido.charAt(0).toUpperCase()

  // Bloquear acesso ao painel (exceto admin)
  const isAdmin = user.email === ADMIN_EMAIL
  if (!isAdmin && profile) {
    // Bloqueio administrativo — independente do status de pagamento
    if (profile.bloqueado_admin) redirect('/bloqueado')

    // Sub-usuário desativado pelo owner
    if (profile.owner_id && profile.membro_ativo === false) redirect('/expirado')

    // Assinatura cancelada mas ainda dentro do período pago → permite acesso
    const emCarencia = profile.acesso_ate && new Date(profile.acesso_ate) > new Date()

    const expirado =
      profile.status === 'expired' ||
      profile.status === 'bloqueado' ||
      (profile.status === 'trial' && profile.trial_fim && new Date(profile.trial_fim) < new Date())

    if (expirado && !emCarencia) redirect('/expirado')
  }

  // Verifica se o usuário também é afiliado ativo (duplo papel: cliente + parceiro)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: afiliadoRow } = await adminClient
    .from('afiliados')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()
  const isAfiliado = !!afiliadoRow && afiliadoRow.status !== 'bloqueado'

  // Equipe visível apenas para owners de planos Pro/Empresarial
  const exibirEquipe       = !profile?.owner_id && temMultiUsuario(profile?.plano ?? 'basic')
  // Radar, Fornecedores e Preços visíveis para Profissional+; admin vê sempre
  const planoEfetivo       = profile?.plano ?? 'basic'
  const exibirRadar        = isAdmin || temRadar(planoEfetivo)
  const exibirFornecedores = isAdmin || temFornecedores(planoEfetivo)
  const exibirPrecosFiltros = isAdmin || temPrecosFiltros(planoEfetivo)

  const allNavItems: { href: string; label: string; icon: string; sub?: boolean; badge?: string; locked?: boolean; planoNecessario?: string }[] = [
    ...navItems,
    exibirRadar
      ? { href: '/radar',        label: 'Radar',        icon: '🎯' }
      : { href: '/radar',        label: 'Radar',        icon: '🎯', locked: true, planoNecessario: 'Profissional' },
    exibirFornecedores
      ? { href: '/fornecedores', label: 'Fornecedores', icon: '🏭', badge: 'Novo' }
      : { href: '/fornecedores', label: 'Fornecedores', icon: '🏭', locked: true, planoNecessario: 'Profissional' },
    { href: '/precos', label: 'Análise de Preços', icon: '💰', badge: 'Novo' },
    exibirEquipe
      ? { href: '/equipe',       label: 'Minha Equipe', icon: '◫' }
      : { href: '/equipe',       label: 'Minha Equipe', icon: '◫', locked: true, planoNecessario: 'Gestão' },
    ...(isAfiliado ? [
      { href: '/afiliados/dashboard', label: 'Painel Parceiro', icon: '🤝' },
    ] : []),
    ...(user.email === ADMIN_EMAIL ? [
      { href: '/admin',               label: 'Admin',          icon: '⚙' },
      { href: '/admin/afiliados',     label: '↳ Afiliados',    icon: '🤝', sub: true },
      { href: '/admin/campanhas',     label: '↳ Campanhas',    icon: '📣', sub: true },
      { href: '/admin/captacao',      label: '↳ Captação',     icon: '🎯', sub: true },
      { href: '/admin/financeiro',    label: '↳ Financeiro',   icon: '💰', sub: true },
      { href: '/admin/saude',         label: '↳ Saúde',        icon: '🏥', sub: true },
    ] : []),
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-2)' }}>
      {/* Sidebar — desktop only */}
      <aside
        className="hidden md:flex w-60 flex-shrink-0 flex-col"
        style={{
          background: 'var(--preto)',
          borderRight: '1px solid var(--sidebar-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Logo */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(201,166,90,0.15)' }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ background: 'var(--vinho)', color: 'var(--dourado)', letterSpacing: '0.05em' }}
          >
            ML
          </div>
          <div>
            <div className="font-semibold text-sm leading-none" style={{ color: 'white' }}>
              Monitor de
            </div>
            <div
              className="text-xs mt-0.5 font-medium tracking-wider uppercase"
              style={{ color: 'var(--dourado)', opacity: 0.8 }}
            >
              Licitações
            </div>
          </div>
        </div>

        {/* Linha dourada decorativa */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--vinho), var(--dourado), transparent)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {allNavItems.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} sub={item.sub} badge={item.badge} locked={item.locked} planoNecessario={item.planoNecessario} />
          ))}
        </nav>

        {/* Usuário */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(201,166,90,0.12)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--vinho)' }}
            >
              {inicialExibida}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'white' }}>
                {nomeExibido}
              </div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{empresaExibida}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-auto pt-[60px] md:pt-8 pb-4 md:pb-8">
        {children}
        {/* Widget de indicações — aparece no rodapé apenas quando a campanha está
            ativa, o usuário está apto e não é afiliado (auto-oculta caso contrário) */}
        {!profile?.owner_id && !isAfiliado && <IndicaWidget />}
      </main>

      {/* Mobile menu drawer (hamburger top-right) */}
      <MobileMenuDrawer
        items={allNavItems}
        nomeExibido={nomeExibido}
        inicialExibida={inicialExibida}
        empresaExibida={empresaExibida}
      />

      {/* Botão flutuante WhatsApp — Suporte */}
      <a
        href="https://wa.me/5531998317066?text=Olá! Preciso de ajuda com o Monitor de Licitações."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '16px',
          zIndex: 50,
          padding: '10px 16px',
          borderRadius: '50px',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          textDecoration: 'none',
          color: 'white',
          fontSize: '13px',
          fontWeight: 700,
        }}
        className="md:bottom-6 md:right-6"
        aria-label="Suporte via WhatsApp"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.057 23.5a.5.5 0 0 0 .623.603l5.772-1.515A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.035-1.368l-.36-.214-3.438.902.917-3.35-.234-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.526 6.526 2.1 12 2.1S21.9 6.526 21.9 12 17.474 21.9 12 21.9z" />
        </svg>
        <span>Suporte</span>
      </a>
    </div>
  )
}
