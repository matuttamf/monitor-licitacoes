'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export function NavItem({
  href, label, icon, sub, badge, locked, planoNecessario,
}: {
  href: string
  label: string
  icon: string
  sub?: boolean
  badge?: string
  locked?: boolean
  planoNecessario?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  const ativo = href === '/admin'
    ? pathname === '/admin'
    : sub
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  if (locked) {
    return (
      <button
        onClick={() => router.push('/assinar')}
        className="w-full flex items-center gap-3 rounded-xl text-sm transition-all"
        style={{
          padding: '10px 12px',
          color: 'rgba(255,255,255,0.28)',
          background: 'transparent',
          borderLeft: '2px solid transparent',
          opacity: 0.5,
          cursor: 'pointer',
        }}
        title={`Disponível no plano ${planoNecessario ?? 'Profissional'} ou superior`}
      >
        <span style={{ fontSize: '14px', color: 'var(--dourado)', opacity: 0.3 }}>{icon}</span>
        <span className="font-medium flex-1 text-left">{label}</span>
        <span style={{ fontSize: '10px', opacity: 0.5 }}>🔒</span>
      </button>
    )
  }

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
      <span className="font-medium flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
          style={{ background: 'rgba(201,166,90,0.2)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.35)' }}>
          {badge}
        </span>
      )}
    </Link>
  )
}
