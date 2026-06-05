import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './components/LogoutButton'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'matuttamaquinaseferramentas@gmail.com'

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
          {user.email === ADMIN_EMAIL && (
            <NavItem href="/admin" label="Admin" icon="⚙" />
          )}
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
          <LogoutButton />
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>

      {/* Botão flutuante WhatsApp */}
      <a
        href="https://wa.me/5531998317066?text=Olá! Preciso de ajuda com o Monitor de Licitações."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          textDecoration: 'none',
        }}
        aria-label="Falar no WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.057 23.5a.5.5 0 0 0 .623.603l5.772-1.515A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.035-1.368l-.36-.214-3.438.902.917-3.35-.234-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.526 6.526 2.1 12 2.1S21.9 6.526 21.9 12 17.474 21.9 12 21.9z" />
        </svg>
      </a>
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
