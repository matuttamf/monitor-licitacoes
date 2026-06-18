'use client'

import { useState } from 'react'

const MOTIVOS = [
  'Muito caro para minha realidade',
  'Não encontrei os editais que precisava',
  'Não tive tempo de usar a ferramenta',
  'Encontrei outra solução',
  'A empresa não participa mais de licitações',
  'Outro motivo',
]

export default function CancelamentoPage() {
  const [motivo, setMotivo]       = useState('')
  const [detalhe, setDetalhe]     = useState('')
  const [enviado, setEnviado]     = useState(false)
  const [enviando, setEnviando]   = useState(false)

  async function enviar() {
    if (!motivo) return
    setEnviando(true)
    await fetch('/api/cancelamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, detalhe }),
    })
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '48px 40px', maxWidth: 480, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
          🙏
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
          Obrigado pelo feedback
        </h1>
        <p style={{ color: '#666', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Sua opinião é muito importante para melhorarmos.
          Se mudar de ideia, sua conta continua ativa até o fim do período pago.
        </p>
        <a href="/dashboard"
          style={{ display: 'inline-block', background: '#6B0F1A', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 600 }}>
          Voltar ao painel
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '40px 36px', maxWidth: 520, width: '100%', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>😔</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>
            Antes de ir…
          </h1>
          <p style={{ color: '#666', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Nos ajude a melhorar. Por que você está cancelando?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {MOTIVOS.map(m => (
            <label key={m} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${motivo === m ? '#6B0F1A' : '#e5e7eb'}`,
              background: motivo === m ? 'rgba(107,15,26,0.04)' : 'white',
            }}>
              <input type="radio" name="motivo" value={m}
                checked={motivo === m} onChange={() => setMotivo(m)}
                style={{ accentColor: '#6B0F1A' }} />
              <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: motivo === m ? 600 : 400 }}>{m}</span>
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 6 }}>
            Quer nos contar mais? (opcional)
          </label>
          <textarea
            value={detalhe}
            onChange={e => setDetalhe(e.target.value)}
            placeholder="Quanto mais detalhes você der, mais conseguimos melhorar…"
            rows={3}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
              border: '1.5px solid #e5e7eb', resize: 'vertical', fontFamily: 'inherit',
              boxSizing: 'border-box', color: '#1a1a1a',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/dashboard" style={{
            flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 10,
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            border: '1.5px solid #e5e7eb', color: '#666',
          }}>
            Voltar ao painel
          </a>
          <button onClick={enviar} disabled={!motivo || enviando} style={{
            flex: 2, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: motivo ? '#6B0F1A' : '#e5e7eb',
            color: motivo ? 'white' : '#9ca3af',
            border: 'none', cursor: motivo ? 'pointer' : 'not-allowed',
          }}>
            {enviando ? 'Enviando…' : 'Enviar feedback'}
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16 }}>
          O cancelamento é processado automaticamente. Esta página registra seu feedback.
        </p>
      </div>
    </div>
  )
}
