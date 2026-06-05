'use client'

import { useEffect, useState } from 'react'

type Membro = { id: string; email: string; nome: string; empresa: string; criado_em: string }
type Convite = { id: string; email: string; criado_em: string; expira_em: string }

type Equipe = {
  plano: string
  maxUsers: number
  totalAtual: number
  membros: Membro[]
  convitesPendentes: Convite[]
}

export default function EquipePage() {
  const [equipe, setEquipe] = useState<Equipe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/equipe')
    if (!res.ok) {
      const d = await res.json()
      setErro(d.error ?? 'Erro ao carregar equipe.')
    } else {
      setEquipe(await res.json())
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function convidar(e: React.FormEvent) {
    e.preventDefault()
    if (!novoEmail.trim()) return
    setEnviando(true)
    setMsg(null)
    const res = await fetch('/api/equipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: novoEmail.trim() }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg({ tipo: 'ok', texto: `Convite enviado para ${novoEmail}.` })
      setNovoEmail('')
      carregar()
    } else {
      setMsg({ tipo: 'erro', texto: d.error ?? 'Erro ao enviar convite.' })
    }
    setEnviando(false)
  }

  async function removerMembro(id: string, email: string) {
    if (!confirm(`Remover ${email} da equipe? O acesso será revogado imediatamente.`)) return
    const res = await fetch(`/api/equipe/${id}`, { method: 'DELETE' })
    if (res.ok) carregar()
    else setMsg({ tipo: 'erro', texto: 'Erro ao remover membro.' })
  }

  const vagasRestantes = equipe ? equipe.maxUsers - equipe.totalAtual : 0

  if (carregando) return (
    <div className="max-w-2xl mx-auto space-y-4 mt-8">
      {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)' }} />)}
    </div>
  )

  if (erro) return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--preto)' }}>Recurso não disponível</h2>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>{erro}</p>
        <a href="/assinar" className="inline-block mt-4 text-sm font-semibold" style={{ color: 'var(--vinho)' }}>
          Ver planos com múltiplos usuários →
        </a>
      </div>
    </div>
  )

  if (!equipe) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Minha equipe</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>Gerencie os usuários com acesso à sua conta.</p>
      </div>

      {/* Uso do plano */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(107,15,26,0.08)' }}>👥</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--preto)' }}>
              {equipe.totalAtual} de {equipe.maxUsers} usuários
            </div>
            <div className="text-xs" style={{ color: 'var(--cinza)' }}>
              Plano {equipe.plano.charAt(0).toUpperCase() + equipe.plano.slice(1)} · {vagasRestantes > 0 ? `${vagasRestantes} vaga(s) disponível` : 'limite atingido'}
            </div>
          </div>
        </div>
        {/* Barra de progresso */}
        <div style={{ width: '120px' }}>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cinza-light)' }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(100, (equipe.totalAtual / equipe.maxUsers) * 100)}%`,
              background: equipe.totalAtual >= equipe.maxUsers ? '#ef4444' : 'var(--vinho)',
            }} />
          </div>
        </div>
      </div>

      {/* Convidar novo membro */}
      {vagasRestantes > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--preto)' }}>Convidar membro</h2>
          <form onSubmit={convidar} className="flex gap-2">
            <input
              type="email"
              value={novoEmail}
              onChange={e => setNovoEmail(e.target.value)}
              placeholder="email@empresa.com"
              required
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.08)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
            />
            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white flex-shrink-0"
              style={{ background: enviando ? '#9AA0A6' : 'var(--vinho)', cursor: enviando ? 'not-allowed' : 'pointer' }}
            >
              {enviando ? 'Enviando…' : 'Convidar'}
            </button>
          </form>
          {msg && (
            <div className="mt-3 rounded-xl px-4 py-3 text-sm" style={{
              background: msg.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${msg.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: msg.tipo === 'ok' ? '#10b981' : '#ef4444',
            }}>
              {msg.tipo === 'ok' ? '✓ ' : '⚠ '}{msg.texto}
            </div>
          )}
        </div>
      )}

      {vagasRestantes <= 0 && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#b91c1c' }}>
          ⚠ Limite de usuários atingido.{' '}
          <a href="/assinar" style={{ fontWeight: 700, color: '#b91c1c' }}>Faça upgrade →</a>
        </div>
      )}

      {/* Membros ativos */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--preto)' }}>Membros ativos ({equipe.membros.length})</h2>
        </div>
        {equipe.membros.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--cinza)' }}>
            Nenhum membro adicionado ainda. Convide alguém acima.
          </div>
        ) : (
          <div>
            {equipe.membros.map((m, i) => (
              <div key={m.id} className="px-6 py-4 flex items-center justify-between" style={{
                borderBottom: i < equipe.membros.length - 1 ? '1px solid var(--cinza-light)' : 'none',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'var(--vinho)' }}>
                    {(m.nome || m.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--preto)' }}>{m.nome || m.email}</div>
                    <div className="text-xs" style={{ color: 'var(--cinza)' }}>{m.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => removerMembro(m.id, m.email)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Convites pendentes */}
      {equipe.convitesPendentes.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--preto)' }}>Convites pendentes ({equipe.convitesPendentes.length})</h2>
          </div>
          {equipe.convitesPendentes.map((c, i) => (
            <div key={c.id} className="px-6 py-4 flex items-center justify-between" style={{
              borderBottom: i < equipe.convitesPendentes.length - 1 ? '1px solid var(--cinza-light)' : 'none',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'rgba(201,166,90,0.1)', color: '#92610a' }}>✉</div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--preto)' }}>{c.email}</div>
                  <div className="text-xs" style={{ color: 'var(--cinza)' }}>
                    Expira em {new Date(c.expira_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(201,166,90,0.1)', color: '#92610a' }}>
                Aguardando
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
