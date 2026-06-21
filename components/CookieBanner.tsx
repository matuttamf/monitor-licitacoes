'use client'

import { useEffect, useState } from 'react'

const COOKIE_KEY = 'ml_cookie_consent'

export type ConsentState = 'accepted' | 'declined' | null

export function getConsent(): ConsentState {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(COOKIE_KEY) as ConsentState) ?? null
}

export default function CookieBanner({ onConsent }: { onConsent: (v: ConsentState) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true)
  }, [])

  function handle(choice: 'accepted' | 'declined') {
    localStorage.setItem(COOKIE_KEY, choice)
    setVisible(false)
    onConsent(choice)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#f5f5f5', color: '#333', padding: '14px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
      borderTop: '1px solid #ddd',
    }}>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', flex: 1, minWidth: '240px' }}>
        Nós usamos cookies e tecnologia semelhantes em nossos sites. Ao utilizar nossos serviços, você concorda com essa utilização. Saiba mais em{' '}
        <a href="/privacidade" style={{ color: '#333', textDecoration: 'underline' }}>
          Política de Privacidade
        </a>
        .
      </p>
      <button
        onClick={() => handle('accepted')}
        style={{
          padding: '10px 28px', border: 'none', borderRadius: '4px',
          background: '#6B0F1A', color: '#fff', cursor: 'pointer',
          fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
          textTransform: 'uppercase', flexShrink: 0,
        }}
      >
        Prosseguir
      </button>
    </div>
  )
}
