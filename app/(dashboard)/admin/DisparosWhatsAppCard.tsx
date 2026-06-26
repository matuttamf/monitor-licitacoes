'use client'

import { useEffect, useState } from 'react'

type Disparo = {
  destino: string
  preview: string
  mensagem: string | null
  status: 'ok' | 'erro'
  erro: string | null
  criado_em: string
  nome: string | null
}
type Dados = { ok24: number; erro24: number; recentes: Disparo[] }

const hora = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const mascararFone = (f: string) => f && f.length > 6 ? f.slice(0, 4) + '****' + f.slice(-2) : f

export function DisparosWhatsAppCard() {
  const [d, setD] = useState<Dados | null>(null)
  const [aberto, setAberto] = useState(false)
  const [selecionado, setSelecionado] = useState<Disparo | null>(null)

  async function carregar() {
    try {
      const r = await fetch('/api/admin/disparos-whatsapp', { cache: 'no-store' })
      if (r.ok) setD(await r.json())
    } catch {}
  }
  useEffect(() => { carregar(); const id = setInterval(carregar, 60_000); return () => clearInterval(id) }, [])

  return (
    <>
      <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--preto)' }}>
            💬 Disparos WhatsApp <span style={{ fontWeight: 500, color: 'var(--cinza)' }}>— últimas 24h</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13 }}><strong style={{ color: '#25D366', fontSize: 18 }}>{d?.ok24 ?? '…'}</strong> <span style={{ color: 'var(--cinza)', fontSize: 11 }}>enviados</span></span>
            <span style={{ fontSize: 13 }}><strong style={{ color: '#ef4444', fontSize: 18 }}>{d?.erro24 ?? '…'}</strong> <span style={{ color: 'var(--cinza)', fontSize: 11 }}>falhas</span></span>
            <button onClick={() => setAberto(v => !v)} style={{ fontSize: 11, fontWeight: 600, color: '#6B0F1A', background: 'rgba(107,15,26,0.06)', border: '1px solid rgba(107,15,26,0.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
              {aberto ? 'Ocultar' : `Ver todos (${d?.recentes?.length ?? '…'})`}
            </button>
          </div>
        </div>

        {aberto && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 480, overflowY: 'auto' }}>
            {(d?.recentes ?? []).length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--cinza)', padding: '8px 0' }}>Nenhum disparo registrado nas últimas 24h.</div>
            )}
            {(d?.recentes ?? []).map((m, i) => (
              <div
                key={i}
                onClick={() => setSelecionado(m)}
                style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 8px', borderRadius: 6, background: i % 2 ? 'transparent' : 'var(--surface-2)', cursor: 'pointer' }}
                title="Clique para ver a mensagem completa"
              >
                <span title={m.status} style={{ fontSize: 12, color: m.status === 'ok' ? '#25D366' : '#ef4444', flexShrink: 0 }}>{m.status === 'ok' ? '✓' : '✕'}</span>
                <span style={{ fontSize: 11, color: 'var(--cinza)', whiteSpace: 'nowrap', flexShrink: 0 }}>{hora(m.criado_em)}</span>
                <span style={{ fontSize: 11, color: 'var(--cinza)', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>{mascararFone(m.destino)}</span>
                {m.nome && (
                  <span style={{ fontSize: 11, color: '#6B0F1A', fontWeight: 600, whiteSpace: 'nowrap', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{m.nome}</span>
                )}
                <span style={{ fontSize: 12, color: 'var(--preto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {m.preview}{m.erro ? <span style={{ color: '#ef4444' }}> · {m.erro.slice(0, 60)}</span> : ''}
                </span>
                <span style={{ fontSize: 10, color: 'var(--cinza)', flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal mensagem completa */}
      {selecionado && (
        <div
          onClick={() => setSelecionado(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 16, padding: '24px 28px', maxWidth: 520, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--preto)' }}>
                  💬 Mensagem enviada
                </div>
                <div style={{ fontSize: 11, color: 'var(--cinza)', marginTop: 2 }}>
                  {hora(selecionado.criado_em)} · {mascararFone(selecionado.destino)}{selecionado.nome ? ` · ${selecionado.nome}` : ''}
                </div>
              </div>
              <button
                onClick={() => setSelecionado(null)}
                style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cinza)', lineHeight: 1, padding: '0 4px' }}
              >×</button>
            </div>

            {selecionado.status === 'erro' && selecionado.erro && (
              <div style={{ fontSize: 12, color: '#ef4444', background: '#fef2f2', borderRadius: 8, padding: '8px 12px' }}>
                ✕ Erro: {selecionado.erro}
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', background: '#f0fdf4', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#1a1a1c', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {selecionado.mensagem ?? selecionado.preview}
            </div>

            <button
              onClick={() => setSelecionado(null)}
              style={{ alignSelf: 'flex-end', fontSize: 12, fontWeight: 600, color: '#6B0F1A', background: 'rgba(107,15,26,0.06)', border: '1px solid rgba(107,15,26,0.15)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
