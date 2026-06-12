'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavItem({ href, label, icon, sub }: { href: string; label: string; icon: string; sub?: boolean }) {
  const pathname = usePathname()

  // Sub-itens: ativo apenas se pathname === href ou começa com href/
  // Item pai /admin: ativo apenas se exatamente /admin (sub-páginas ativam os sub-itens, não o pai)
  const ativo = href === '/admin'
    ? pathname === '/admin'
    : sub
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl text-sm transition-all"
      style={{
        padding:    sub ? '6px 12px 6px 28px' : '10px 12px',
        color:      ativo ? 'white'                    : sub ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.5)',
        background: ativo ? 'rgba(201,166,90,0.12)'    : 'transparent',
        borderLeft: ativo ? '2px solid var(--dourado)' : '2px solid transparent',
        fontSize:   sub ? '12px' : undefined,
      }}
    >
      <span style={{ fontSize: sub ? '12px' : '14px', color: 'var(--dourado)', opacity: ativo ? 1 : sub ? 0.45 : 0.6 }}>{icon}</span>
      <span className={sub ? 'font-medium' : 'font-medium'}>{label}</span>
    </Link>
  )
}
