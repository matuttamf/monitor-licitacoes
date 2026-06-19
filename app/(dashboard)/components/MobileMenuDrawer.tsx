'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavItemData {
  href: string
  label: string
  icon: string
  sub?: boolean
  badge?: string
  locked?: boolean
  planoNecessario?: string
}

export function MobileMenuDrawer({
  items,
  nomeExibido,
  inicialExibida,
  empresaExibida,
}: {
  items: NavItemData[]
  nomeExibido: string
  inicialExibida: string
  empresaExibida: string
}) {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Top header bar — mobile only */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{ background: 'var(--preto)', borderBottom: '1px solid rgba(201,166,90,0.15)', height: 52 }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
            style={{ background: 'var(--vinho)', color: 'var(--dourado)', letterSpacing: '0.05em' }}
          >
            ML
          </div>
          <div>
            <div className="text-xs font-semibold leading-none" style={{ color: 'white' }}>Monitor de</div>
            <div className="text-[9px] font-medium tracking-wider uppercase mt-0.5" style={{ color: 'var(--dourado)', opacity: 0.8 }}>Licitações</div>
          </div>
        </div>
        <button
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 8, lineHeight: 1 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      {aberto && (
        <div
          className="md:hidden fixed inset-0 z-[60]"
          onClick={() => setAberto(false)}
          style={{ background: 'rgba(0,0,0,0.55)' }}
        />
      )}

      {/* Drawer (slides from right) */}
      <div
        className="md:hidden fixed top-0 right-0 bottom-0 z-[70] flex flex-col"
        style={{
          width: 280,
          background: 'var(--preto)',
          borderLeft: '1px solid rgba(201,166,90,0.15)',
          transform: aberto ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(201,166,90,0.15)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'var(--vinho)' }}
            >
              {inicialExibida}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'white' }}>{nomeExibido}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{empresaExibida}</div>
            </div>
          </div>
          <button
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 18, padding: 4, lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map(item => {
            const ativo = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.locked ? '/assinar' : item.href}
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 rounded-lg"
                style={{
                  padding: '10px 12px',
                  paddingLeft: item.sub ? 28 : 12,
                  color: item.locked ? 'rgba(255,255,255,0.25)' : ativo ? 'var(--dourado)' : 'rgba(255,255,255,0.65)',
                  background: ativo ? 'rgba(201,166,90,0.1)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    style={{ background: 'rgba(201,166,90,0.15)', color: 'var(--dourado)' }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.locked && (
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>🔒</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(201,166,90,0.12)' }}>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
