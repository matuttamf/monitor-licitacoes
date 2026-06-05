'use client'

import { useEffect, useState } from 'react'

type Usuario = {
  id: string
  email: string
  status: 'trial' | 'active' | 'expired'
  trial_inicio: string
  trial_fim: string
  criado_em: string
  trial_expirado: boolean
}

const statusConfig = {
  active:  { label: 'Ativo',      cor: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  trial:   { label: 'Trial',      cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)' },
  expired: { label: 'Expirado',   cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/admin/usuarios')
    if (!res.ok) {
      setErro('Acesso negado ou erro ao carregar.')
      setCarregando(false)
      return
    }
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

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function diasRestantes(trial_fim: string) {
    const diff = new Date(trial_fim).getTime() - Date.now()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return dias
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>
            Painel Administrativo
          </h1>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>
            Gerencie usuários e assinaturas
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
            {usuarios.filter(u => u.status === 'active').length} ativos
          </span>
          <span className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(201,166,90,0.1)', color: 'var(--dourado)' }}>
            {usuarios.filter(u => u.status === 'trial').length} em trial
          </span>
          <span className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            {usuarios.filter(u => u.status === 'expired' || u.trial_expirado).length} expirados
          </span>
        </div>
      </div>

      {erro && (
        <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '72px' }} />
          ))}
        </div>
      ) : usuarios.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p style={{ color: 'var(--cinza)' }}>Nenhum usuário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                {['E-mail', 'Status', 'Trial até', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const cfg = statusConfig[u.trial_expirado && u.status === 'trial' ? 'expired' : u.status]
                const dias = diasRestantes(u.trial_fim)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--preto)' }}>
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.cor }}>
                        {u.trial_expirado && u.status === 'trial' ? 'Trial expirado' : cfg.label}
                        {u.status === 'trial' && !u.trial_expirado && ` (${dias}d)`}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--cinza)' }}>
                      {formatarData(u.trial_fim)}
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--cinza)' }}>
                      {formatarData(u.criado_em)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {u.status !== 'active' && (
                          <button
                            onClick={() => alterarStatus(u.id, 'active')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                          >
                            Ativar
                          </button>
                        )}
                        {u.status !== 'expired' && (
                          <button
                            onClick={() => alterarStatus(u.id, 'expired')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                          >
                            Expirar
                          </button>
                        )}
                        {u.status !== 'trial' && (
                          <button
                            onClick={() => alterarStatus(u.id, 'trial')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                            style={{ background: 'rgba(201,166,90,0.1)', color: 'var(--dourado)' }}
                          >
                            Trial
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

      <p className="text-xs mt-4 text-center" style={{ color: 'var(--cinza)' }}>
        Acesso restrito ao administrador. Para ativar uma assinatura, clique em "Ativar" após confirmar o pagamento.
      </p>
    </div>
  )
}
