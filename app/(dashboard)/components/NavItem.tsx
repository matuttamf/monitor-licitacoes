'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const ativo = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
      style={{
        color:      ativo ? 'white'                    : 'rgba(255,255,255,0.5)',
        background: ativo ? 'rgba(201,166,90,0.12)'    : 'transparent',
        borderLeft: ativo ? '2px solid var(--dourado)' : '2px solid transparent',
      }}
    >
      <span style={{ fontSize: '14px', color: 'var(--dourado)', opacity: ativo ? 1 : 0.6 }}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
