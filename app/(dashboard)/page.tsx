'use client'

import { useEffect, useState } from 'react'

type Licitacao = {
  id: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  fonte: string
  alertas: { keywords: { termo: string } }[]
}

const fonteConfig: Record<string, { cor: string; bg: string }> = {
  'PNCP':           { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)' },
  'ComprasNet':     { cor: '#8B1E2D', bg: 'rgba(139,30,45,0.07)' },
  'Querido Diário': { cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)'  },
  'BLL':            { cor: '#4a4a4d', bg: 'rgba(74,74,77,0.07)'   },
  'Google':         { cor: '#2d6a4f', bg: 'rgba(45,106,79,0.07)'  },
}

function formatarValor(valor?: number) {
  if (!valor) return null
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default function DashboardPage() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')

  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  async function carregar() {
    setCarregando(true)
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)
    const res = await fetch(`/api/licitacoes?${params}`)
    setLicitacoes(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [filtroEstado])

  const totalValor = licitacoes.reduce((acc, l) => acc + (l.valor_estimado || 0), 0)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Licitações com match nas suas palavras-chave
          </p>
        </div>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="text-sm rounded-xl px-4 py-2.5 outline-none"
          style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
        >
          <option value="">Todos os estados</option>
          {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Licitações encontradas', valor: carregando ? '—' : licitacoes.length.toString(), cor: 'var(--vinho)' },
          { label: 'Volume estimado', valor: carregando ? '—' : (totalValor > 0 ? formatarValor(totalValor)! : '—'), cor: 'var(--dourado)' },
          { label: 'Fontes ativas', valor: '3', cor: 'var(--bordo)' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>
              {stat.label}
            </p>
            <p className="text-2xl font-semibold" style={{ color: stat.cor }}>
              {stat.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: '110px' }} />
          ))}
        </div>
      ) : licitacoes.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-1)' }}>Nenhuma licitação encontrada</p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Acesse Busca para buscar agora nas fontes disponíveis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {licitacoes.map(l => {
            const cfg = fonteConfig[l.fonte] ?? { cor: '#64748b', bg: 'rgba(100,116,139,0.08)' }
            return (
              <div
                key={l.id}
                className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${cfg.cor}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.cor }}>
                        {l.fonte}
                      </span>
                      {l.alertas?.map((a, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)' }}>
                          {a.keywords?.termo}
                        </span>
                      ))}
                      {l.cidade && (
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {l.cidade}{l.estado ? `/${l.estado}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--text-1)' }}>{l.orgao}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {l.objeto.length > 160 ? l.objeto.substring(0, 160) + '...' : l.objeto}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    {l.valor_estimado && (
                      <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatarValor(l.valor_estimado)}</p>
                    )}
                    {l.data_abertura && (
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>Abertura: {l.data_abertura}</p>
                    )}
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}
                    >
                      Ver edital →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
