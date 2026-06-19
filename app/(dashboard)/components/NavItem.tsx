'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
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
  const [tooltip, setTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ativo = href === '/admin'
    ? pathname === '/admin'
    : sub
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (locked) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setTooltip(v => !v)
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => setTooltip(false), 4000)
          }}
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-all"
          style={{
            padding: '10px 12px',
            color: 'rgba(255,255,255,0.28)',
            background: 'transparent',
            borderLeft: '2px solid transparent',
            opacity: 0.5,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '14px', color: 'var(--dourado)', opacity: 0.3 }}>{icon}</span>
          <span className="font-medium flex-1 text-left">{label}</span>
          <span style={{ fontSize: '10px', opacity: 0.5 }}>🔒</span>
        </button>

        {tooltip && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#1A1A1C',
            border: '1px solid rgba(201,166,90,0.35)',
            borderRadius: 10,
            padding: '10px 14px',
            zIndex: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            <div style={{ color: 'var(--dourado)', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
              🔒 Módulo bloqueado
            </div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 1.4, marginBottom: 10 }}>
              Disponível no plano <strong style={{ color: 'white' }}>{planoNecessario ?? 'Profissional'}</strong> ou superior.
            </div>
            <button
              onClick={() => { setTooltip(false); router.push('/assinar') }}
              style={{
                width: '100%',
                padding: '7px 0',
                borderRadius: 7,
                background: 'var(--dourado)',
                color: 'var(--preto)',
                fontWeight: 700,
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Fazer upgrade →
            </button>
          </div>
        )}
      </div>
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
