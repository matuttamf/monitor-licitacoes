'use client'

import { useEffect, useState } from 'react'

type Dados = {
  ativa: boolean
  apto: boolean
  ehAfiliado?: boolean
  codigo?: string
  link?: string
  creditosDias?: number
  economiaTotal?: number
  convertidos?: number
  aguardando?: number
}

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

export function IndicaWidget() {
  const [d, setD] = useState<Dados | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/indicacoes/me')
      .then(r => (r.ok ? r.json() : null))
      .then(setD)
      .catch(() => {})
  }, [])

  if (!d || !d.ativa || !d.apto || !d.link) return null

  const economia = d.economiaTotal ?? 0
  const convertidos = d.convertidos ?? 0
  const aguardando = d.aguardando ?? 0

  async function copiar() {
    if (!d?.link) return
    await navigator.clipboard.writeText(d.link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function compartilhar(canal: 'whatsapp' | 'telegram' | 'email') {
    const msg = `Uso o Monitor de Licitações para acompanhar editais. Assine pelo meu link e ganhe 20% de desconto: ${d?.link}`
    const enc = encodeURIComponent(msg)
    const urls = {
      whatsapp: `https://wa.me/?text=${enc}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(d?.link ?? '')}&text=${encodeURIComponent('Assine o Monitor de Licitações com 20% de desconto:')}`,
      email: `mailto:?subject=${encodeURIComponent('Monitor de Licitações — 20% de desconto')}&body=${enc}`,
    }
    window.open(urls[canal], '_blank', 'noopener')
  }

  return (
    <div
      style={{
        marginTop: 32,
        background: 'linear-gradient(135deg, #6B0F1A 0%, #8a1422 100%)',
        borderRadius: 18,
        padding: '24px 26px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -20, fontSize: 120, opacity: 0.06 }}>🚀</div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🚀 Convide amigos</div>

        {economia > 0 ? (
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 4px', color: 'rgba(255,255,255,0.92)' }}>
            Você já economizou <strong style={{ color: '#C9A65A' }}>{moeda(economia)}</strong> com indicações.
          </p>
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 4px', color: 'rgba(255,255,255,0.92)' }}>
            Cada amigo que assinar pelo seu link vale <strong style={{ color: '#C9A65A' }}>+30 dias grátis</strong>.
          </p>
        )}
        <p style={{ fontSize: 13, margin: '0 0 16px', color: 'rgba(255,255,255,0.7)' }}>
          Continue economizando e ganhando <strong>+30 dias grátis</strong> a cada indicação.
          {(convertidos > 0 || aguardando > 0) && (
            <> {' · '}{convertidos} convertido{convertidos !== 1 ? 's' : ''}{aguardando > 0 ? `, ${aguardando} em carência` : ''}.</>
          )}
        </p>

        {/* Link + copiar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            readOnly
            value={d.link}
            onClick={e => (e.target as HTMLInputElement).select()}
            style={{
              flex: 1, minWidth: 200, fontSize: 13, padding: '10px 12px', borderRadius: 10,
              border: '1px solid rgba(201,166,90,0.4)', background: 'rgba(0,0,0,0.18)', color: 'white',
              fontFamily: 'monospace', outline: 'none',
            }}
          />
          <button
            onClick={copiar}
            style={{
              padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: copiado ? 'rgba(16,185,129,0.9)' : '#C9A65A', color: copiado ? 'white' : '#3a0a10',
              border: 'none', whiteSpace: 'nowrap',
            }}
          >
            {copiado ? '✓ Copiado' : '📋 Copiar link'}
          </button>
        </div>

        {/* Compartilhar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Compartilhar:</span>
          {([['whatsapp', 'WhatsApp'], ['telegram', 'Telegram'], ['email', 'E-mail']] as const).map(([canal, label]) => (
            <button
              key={canal}
              onClick={() => compartilhar(canal)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {label}
            </button>
          ))}
          <a
            href="/regulamento-indicacoes"
            style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}
          >
            Regulamento
          </a>
        </div>
      </div>
    </div>
  )
}
