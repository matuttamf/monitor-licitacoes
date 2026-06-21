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
      background: '#1a1a2e', color: '#fff', padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.3)',
    }}>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', flex: 1, minWidth: '240px' }}>
        Usamos cookies para melhorar sua experiência e medir o desempenho das nossas campanhas.{' '}
        <a href="/privacidade" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
          Política de Privacidade
        </a>
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={() => handle('declined')}
          style={{
            padding: '8px 16px', borderRadius: '6px', border: '1px solid #555',
            background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '13px',
          }}
        >
          Recusar
        </button>
        <button
          onClick={() => handle('accepted')}
          style={{
            padding: '8px 16px', borderRadius: '6px', border: 'none',
            background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  )
}
