'use client'

import { useEffect, useState } from 'react'

type Fila = { email: number; telegram: number; whatsapp: number; total: number }

const CANAIS: { key: keyof Fila; label: string; icon: string; cor: string }[] = [
  { key: 'email',    label: 'E-mail',   icon: '✉',  cor: '#6B0F1A' },
  { key: 'telegram', label: 'Telegram', icon: '✈',  cor: '#229ED9' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬', cor: '#25D366' },
]

export function FilaAlertasCard() {
  const [fila, setFila] = useState<Fila | null>(null)
  const [erro, setErro] = useState(false)
  const [atualizado, setAtualizado] = useState<string>('')

  async function carregar() {
    try {
      const r = await fetch('/api/admin/fila-alertas', { cache: 'no-store' })
      if (!r.ok) { setErro(true); return }
      setFila(await r.json())
      setErro(false)
      setAtualizado(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch {
      setErro(true)
    }
  }

  useEffect(() => {
    carregar()
    const id = setInterval(carregar, 60_000) // tempo real (a cada 60s)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--preto)' }}>
          📨 Fila de alertas <span style={{ fontWeight: 500, color: 'var(--cinza)' }}>— pendentes por canal (licitações abertas)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {atualizado && <span style={{ fontSize: 10, color: 'var(--cinza)' }}>atualizado {atualizado}</span>}
          <button
            onClick={carregar}
            style={{ fontSize: 11, fontWeight: 600, color: '#6B0F1A', background: 'rgba(107,15,26,0.06)', border: '1px solid rgba(107,15,26,0.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {erro ? (
        <div style={{ fontSize: 12, color: '#ef4444' }}>Erro ao carregar a fila.</div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: 10 }}>
          {CANAIS.map(({ key, label, icon, cor }) => (
            <div key={key} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: cor, letterSpacing: '-0.03em' }}>
                {fila ? fila[key].toLocaleString('pt-BR') : '…'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--preto)', marginTop: 2 }}>{icon} {label}</div>
              <div style={{ fontSize: 10, color: 'var(--cinza)' }}>aguardando envio</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
