import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/busca', label: 'Busca', icon: '⊕' },
  { href: '/palavras-chave', label: 'Palavras-chave', icon: '◎' },
  { href: '/alertas', label: 'Alertas', icon: '◉' },
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
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            ML
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-none">Monitor</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Licitações</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              {emailPrefix.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{emailPrefix}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>Matutta</div>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-xs py-2 rounded-lg transition-colors text-left px-3"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent' }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = 'var(--sidebar-hover)'
                ;(e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'transparent'
                ;(e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
              }}
            >
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo principal */}
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
