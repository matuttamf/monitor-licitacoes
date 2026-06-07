'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const ativo = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[56px]"
      style={{
        color: ativo ? 'var(--dourado)' : 'rgba(255,255,255,0.4)',
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
    </Link>
  )
}
