import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const navItems = [
  { href: '/',              label: 'Dashboard',         icon: '◈' },
  { href: '/busca',         label: 'Busca',             icon: '⊕' },
  { href: '/palavras-chave', label: 'Palavras-chave',   icon: '◎' },
  { href: '/alertas',       label: 'Alertas',           icon: '◉' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const emailPrefix = user.email?.split('@')[0] ?? 'usuário'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-2)' }}>
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{
          background: 'var(--preto)',
          borderRight: '1px solid var(--sidebar-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Logo Matutta */}
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
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
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
              {emailPrefix.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'white' }}>
                {emailPrefix}
              </div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>Matutta</div>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-xs py-2 rounded-lg px-3 text-left transition-colors"
              style={{ color: 'rgba(255,255,255,0.35)', background: 'transparent' }}
            >
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      <span style={{ fontSize: '14px', color: 'var(--dourado)', opacity: 0.6 }}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
