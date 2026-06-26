'use client'

import { useEffect, useState } from 'react'

type Disparo = { destino: string; preview: string; status: 'ok' | 'erro'; erro: string | null; criado_em: string }
type Dados = { ok24: number; erro24: number; recentes: Disparo[] }

const hora = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const mascararFone = (f: string) => f && f.length > 6 ? f.slice(0, 4) + '****' + f.slice(-2) : f

export function DisparosWhatsAppCard() {
  const [d, setD] = useState<Dados | null>(null)
  const [aberto, setAberto] = useState(false)

  async function carregar() {
    try {
      const r = await fetch('/api/admin/disparos-whatsapp', { cache: 'no-store' })
      if (r.ok) setD(await r.json())
    } catch {}
  }
  useEffect(() => { carregar(); const id = setInterval(carregar, 60_000); return () => clearInterval(id) }, [])

  return (
    <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--preto)' }}>
          💬 Disparos WhatsApp <span style={{ fontWeight: 500, color: 'var(--cinza)' }}>— últimas 24h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13 }}><strong style={{ color: '#25D366', fontSize: 18 }}>{d?.ok24 ?? '…'}</strong> <span style={{ color: 'var(--cinza)', fontSize: 11 }}>enviados</span></span>
          <span style={{ fontSize: 13 }}><strong style={{ color: '#ef4444', fontSize: 18 }}>{d?.erro24 ?? '…'}</strong> <span style={{ color: 'var(--cinza)', fontSize: 11 }}>falhas</span></span>
          <button onClick={() => setAberto(v => !v)} style={{ fontSize: 11, fontWeight: 600, color: '#6B0F1A', background: 'rgba(107,15,26,0.06)', border: '1px solid rgba(107,15,26,0.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
            {aberto ? 'Ocultar' : 'Ver últimos'}
          </button>
        </div>
      </div>

      {aberto && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
          {(d?.recentes ?? []).length === 0 && <div style={{ fontSize: 12, color: 'var(--cinza)', padding: '8px 0' }}>Nenhum disparo registrado ainda.</div>}
          {(d?.recentes ?? []).map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '6px 8px', borderRadius: 6, background: i % 2 ? 'transparent' : 'var(--surface-2)' }}>
              <span title={m.status} style={{ fontSize: 12, color: m.status === 'ok' ? '#25D366' : '#ef4444' }}>{m.status === 'ok' ? '✓' : '✕'}</span>
              <span style={{ fontSize: 11, color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{hora(m.criado_em)}</span>
              <span style={{ fontSize: 11, color: 'var(--cinza)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{mascararFone(m.destino)}</span>
              <span style={{ fontSize: 12, color: 'var(--preto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {m.preview}{m.erro ? <span style={{ color: '#ef4444' }}> · {m.erro.slice(0, 60)}</span> : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
