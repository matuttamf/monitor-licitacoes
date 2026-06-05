'use client'

import { useEffect, useState } from 'react'

type Usuario = {
  id: string
  email: string
  status: 'trial' | 'active' | 'expired'
  plano: string
  trial_inicio: string
  trial_fim: string
  criado_em: string
  trial_expirado: boolean
  nome?: string
  telefone?: string
  empresa?: string
}

const statusConfig = {
  active:  { label: 'Ativo',    cor: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  trial:   { label: 'Trial',    cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)' },
  expired: { label: 'Expirado', cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/admin/usuarios')
    if (!res.ok) { setErro('Acesso negado ou erro ao carregar.'); setCarregando(false); return }
    setUsuarios(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function alterarStatus(id: string, status: string) {
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    carregar()
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvando(true)
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editando.id,
        nome: editando.nome,
        telefone: editando.telefone,
        empresa: editando.empresa,
        plano: editando.plano,
        status: editando.status,
      }),
    })
    setSalvando(false)
    setEditando(null)
    carregar()
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR')
  const dias = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Painel Administrativo</h1>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>Gerencie usuários e assinaturas</p>
        </div>
        <div className="flex gap-3 text-sm">
          {[
            { label: `${usuarios.filter(u => u.status === 'active').length} ativos`, cor: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: `${usuarios.filter(u => u.status === 'trial').length} em trial`, cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)' },
            { label: `${usuarios.filter(u => u.status === 'expired' || u.trial_expirado).length} expirados`, cor: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map(b => (
            <span key={b.label} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: b.bg, color: b.cor }}>{b.label}</span>
          ))}
        </div>
      </div>

      {erro && <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{erro}</div>}

      {carregando ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '72px' }} />)}</div>
      ) : usuarios.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p style={{ color: 'var(--cinza)' }}>Nenhum usuário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                {['Usuário', 'Plano / Status', 'Trial até', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const expirado = u.trial_expirado && u.status === 'trial'
                const cfg = statusConfig[expirado ? 'expired' : u.status]
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                    <td className="px-5 py-4">
                      <div className="font-medium" style={{ color: 'var(--preto)' }}>{u.nome || '—'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--cinza)' }}>{u.email}</div>
                      {u.empresa && <div className="text-xs" style={{ color: 'var(--cinza)' }}>{u.empresa}</div>}
                      {u.telefone && <div className="text-xs" style={{ color: 'var(--cinza)' }}>{u.telefone}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--cinza)' }}>{u.plano || 'basic'}</div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.cor }}>
                        {expirado ? 'Trial expirado' : cfg.label}
                        {u.status === 'trial' && !expirado && ` (${dias(u.trial_fim)}d)`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--cinza)' }}>{fmt(u.trial_fim)}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--cinza)' }}>{fmt(u.criado_em)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setEditando({ ...u })}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>
                          Editar
                        </button>
                        {u.status !== 'active' && (
                          <button onClick={() => alterarStatus(u.id, 'active')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                            Ativar
                          </button>
                        )}
                        {u.status !== 'expired' && (
                          <button onClick={() => alterarStatus(u.id, 'expired')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            Expirar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edição */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--preto)' }}>Editar usuário</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--cinza)' }}>{editando.email}</p>

            <div className="space-y-4">
              {[
                { label: 'Nome', key: 'nome', placeholder: 'Nome completo' },
                { label: 'Empresa', key: 'empresa', placeholder: 'Nome da empresa' },
                { label: 'Telefone', key: 'telefone', placeholder: '(31) 99999-9999' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>{label}</label>
                  <input
                    value={(editando as Record<string, string>)[key] ?? ''}
                    onChange={e => setEditando({ ...editando, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)' }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Plano</label>
                <select
                  value={editando.plano ?? 'basic'}
                  onChange={e => setEditando({ ...editando, plano: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
                >
                  {['basic', 'profissional', 'pro', 'empresarial'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Status</label>
                <select
                  value={editando.status}
                  onChange={e => setEditando({ ...editando, status: e.target.value as 'trial' | 'active' | 'expired' })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Ativo</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditando(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1.5px solid var(--cinza-light)', color: 'var(--cinza)' }}>
                Cancelar
              </button>
              <button onClick={salvarEdicao} disabled={salvando}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: salvando ? '#9AA0A6' : 'var(--vinho)', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs mt-4 text-center" style={{ color: 'var(--cinza)' }}>
        Acesso restrito ao administrador.
      </p>
    </div>
  )
}
