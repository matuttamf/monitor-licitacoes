'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ width: 64, height: 64, background: '#6B0F1A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A65A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
          Algo deu errado
        </h1>
        <p style={{ color: '#666', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          Ocorreu um erro inesperado. Nossa equipe já foi notificada.
          {error.digest && <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Código: {error.digest}</span>}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={reset}
            style={{ padding: '11px 24px', borderRadius: 50, fontSize: 14, fontWeight: 700, background: '#6B0F1A', color: 'white', border: 'none', cursor: 'pointer' }}>
            Tentar novamente
          </button>
          <a href="/dashboard"
            style={{ padding: '11px 24px', borderRadius: 50, fontSize: 14, fontWeight: 600, border: '1.5px solid #e5e7eb', color: '#666', textDecoration: 'none' }}>
            Ir ao painel
          </a>
        </div>
      </div>
    </div>
  )
}
