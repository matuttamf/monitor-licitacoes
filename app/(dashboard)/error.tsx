'use client'

import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, background: 'rgba(107,15,26,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B0F1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--preto)', margin: '0 0 8px' }}>
        Erro ao carregar esta página
      </h2>
      <p style={{ color: 'var(--cinza)', fontSize: 14, marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
        Não foi possível carregar o conteúdo. Tente novamente ou volte ao início.
        {error.digest && <span style={{ display: 'block', fontSize: 11, marginTop: 4 }}>#{error.digest}</span>}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={reset}
          style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}>
          Tentar novamente
        </button>
        <a href="/dashboard"
          style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid var(--cinza-light)', color: 'var(--cinza)', textDecoration: 'none' }}>
          Ir ao painel
        </a>
      </div>
    </div>
  )
}
