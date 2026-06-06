'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

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

type Resposta = {
  data: Licitacao[]
  total: number
  pagina: number
  paginas: number
}

const fonteConfig: Record<string, { cor: string; bg: string }> = {
  // Camada 1 — Federal
  'PNCP':              { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)'  },
  'PNCP Contratos':    { cor: '#7c1d1d', bg: 'rgba(124,29,29,0.07)'  },
  'PNCP Atas':         { cor: '#991b1b', bg: 'rgba(153,27,27,0.07)'  },
  'PNCP PCA':          { cor: '#b91c1c', bg: 'rgba(185,28,28,0.07)'  },
  'ComprasNet':        { cor: '#8B1E2D', bg: 'rgba(139,30,45,0.07)'  },
  'Querido Diário':    { cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)'  },
  'Google':            { cor: '#2d6a4f', bg: 'rgba(45,106,79,0.07)'  },
  'DOU':               { cor: '#374151', bg: 'rgba(55,65,81,0.07)'   },
  // Plataformas privadas
  'BBMNET':            { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.07)'  },
  'Licitanet':         { cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
  'BLL':               { cor: '#4a4a4d', bg: 'rgba(74,74,77,0.07)'   },
  'Licitações-e':      { cor: '#b45309', bg: 'rgba(180,83,9,0.07)'   },
  'Licitar Digital':   { cor: '#9f1239', bg: 'rgba(159,18,57,0.07)'  },
  'Negócios Públicos': { cor: '#0f766e', bg: 'rgba(15,118,110,0.07)' },
  'Compras Públicas':  { cor: '#1e40af', bg: 'rgba(30,64,175,0.07)'  },
  // Camada 2 — Estados
  'BEC/SP':            { cor: '#0369a1', bg: 'rgba(3,105,161,0.07)'  },
  'Portal MG':         { cor: '#065f46', bg: 'rgba(6,95,70,0.07)'    },
  'Portal RS':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.07)'   },
  'Portal PR':         { cor: '#3b0764', bg: 'rgba(59,7,100,0.07)'   },
  'Portal BA':         { cor: '#92400e', bg: 'rgba(146,64,14,0.07)'  },
  'Portal RJ':         { cor: '#166534', bg: 'rgba(22,101,52,0.07)'  },
  'Portal SC':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.08)'   },
  'Portal CE':         { cor: '#7c2d12', bg: 'rgba(124,45,18,0.07)'  },
  'Portal PE':         { cor: '#4c1d95', bg: 'rgba(76,29,149,0.07)'  },
  'Portal GO':         { cor: '#14532d', bg: 'rgba(20,83,45,0.07)'   },
  'Portal DF':         { cor: '#1c1917', bg: 'rgba(28,25,23,0.07)'   },
  'Portal ES':         { cor: '#064e3b', bg: 'rgba(6,78,59,0.07)'    },
  'Portal MT':         { cor: '#78350f', bg: 'rgba(120,53,15,0.07)'  },
  'Portal AM':         { cor: '#1a2e05', bg: 'rgba(26,46,5,0.07)'    },
  'Portal MS':         { cor: '#166534', bg: 'rgba(22,101,52,0.08)'  },
  'Portal PB':         { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.09)'   },
  'Portal PA':         { cor: '#064e3b', bg: 'rgba(6,78,59,0.08)'    },
  'Portal AC':         { cor: '#1a2e05', bg: 'rgba(26,46,5,0.08)'    },
  'Portal RO':         { cor: '#78350f', bg: 'rgba(120,53,15,0.08)'  },
  'Portal RR':         { cor: '#92400e', bg: 'rgba(146,64,14,0.08)'  },
  'Portal TO':         { cor: '#7c2d12', bg: 'rgba(124,45,18,0.08)'  },
  'Portal MA':         { cor: '#3b0764', bg: 'rgba(59,7,100,0.08)'   },
  'Portal PI':         { cor: '#4c1d95', bg: 'rgba(76,29,149,0.08)'  },
  'Portal RN':         { cor: '#065f46', bg: 'rgba(6,95,70,0.08)'    },
  'Portal SE':         { cor: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  'Portal AL':         { cor: '#1e40af', bg: 'rgba(30,64,175,0.08)'  },
  'Portal AP':         { cor: '#14532d', bg: 'rgba(20,83,45,0.08)'   },
  // Camada 3 — Municípios
  'SP Capital':        { cor: '#831843', bg: 'rgba(131,24,67,0.07)'  },
  'Portal BH':         { cor: '#312e81', bg: 'rgba(49,46,129,0.07)'  },
  'Portal Recife':     { cor: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  'Portal Fortaleza':  { cor: '#b45309', bg: 'rgba(180,83,9,0.08)'   },
  'Portal Manaus':     { cor: '#1a2e05', bg: 'rgba(26,46,5,0.09)'    },
  'Portal Curitiba':   { cor: '#3b0764', bg: 'rgba(59,7,100,0.09)'   },
  'Portal POA':        { cor: '#1e3a5f', bg: 'rgba(30,58,95,0.1)'    },
  'Portal Belém':      { cor: '#064e3b', bg: 'rgba(6,78,59,0.09)'    },
  'Portal Goiânia':    { cor: '#14532d', bg: 'rgba(20,83,45,0.09)'   },
  'Portal Salvador':   { cor: '#92400e', bg: 'rgba(146,64,14,0.09)'  },
  // Camada 5 — Estatais
  'Petronect':         { cor: '#0c4a6e', bg: 'rgba(12,74,110,0.1)'   },
  'Correios':          { cor: '#d97706', bg: 'rgba(217,119,6,0.1)'   },
  'Caixa':             { cor: '#1d4ed8', bg: 'rgba(29,78,216,0.09)'  },
  'Eletrobras':        { cor: '#065f46', bg: 'rgba(6,95,70,0.1)'     },
  'SABESP':            { cor: '#0369a1', bg: 'rgba(3,105,161,0.1)'   },
}

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function formatarValor(valor?: number) {
  if (!valor) return null
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function Paginacao({ pagina, paginas, onChange }: { pagina: number; paginas: number; onChange: (p: number) => void }) {
  if (paginas <= 1) return null

  const pagNums: (number | '...')[] = []
  if (paginas <= 7) {
    for (let i = 1; i <= paginas; i++) pagNums.push(i)
  } else {
    pagNums.push(1)
    if (pagina > 3) pagNums.push('...')
    for (let i = Math.max(2, pagina - 1); i <= Math.min(paginas - 1, pagina + 1); i++) pagNums.push(i)
    if (pagina < paginas - 2) pagNums.push('...')
    pagNums.push(paginas)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 1}
        className="px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: pagina === 1 ? 'var(--text-3)' : 'var(--text-2)', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
      >
        ← Anterior
      </button>

      {pagNums.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'var(--text-3)' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className="w-9 h-9 rounded-xl text-sm font-medium"
            style={{
              background: p === pagina ? 'var(--vinho)' : 'var(--surface)',
              color:      p === pagina ? 'white' : 'var(--text-2)',
              border:     `1px solid ${p === pagina ? 'var(--vinho)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(pagina + 1)}
        disabled={pagina === paginas}
        className="px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: pagina === paginas ? 'var(--text-3)' : 'var(--text-2)', cursor: pagina === paginas ? 'not-allowed' : 'pointer' }}
      >
        Próxima →
      </button>
    </div>
  )
}

type EstadoStat = { uf: string; count: number; valor_total: number }

const nomeEstado: Record<string, string> = {
  AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará',
  DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão',
  MT:'Mato Grosso', MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará',
  PB:'Paraíba', PR:'Paraná', PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro',
  RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima',
  SC:'Santa Catarina', SP:'São Paulo', SE:'Sergipe', TO:'Tocantins',
}

export default function DashboardPage() {
  const [resposta, setResposta]       = useState<Resposta | null>(null)
  const [carregando, setCarregando]   = useState(true)
  const [primeiraVez, setPrimeiraVez] = useState(true)
  const [pagina, setPagina]           = useState(1)
  const [filtroEstado,   setFiltroEstado]   = useState('')
  const [filtroValorMin, setFiltroValorMin] = useState('')
  const [statsEstados, setStatsEstados]     = useState<EstadoStat[]>([])

  useEffect(() => {
    fetch('/api/stats/por-estado')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.estados) setStatsEstados(d.estados) })
  }, [])

  const carregar = useCallback(async (p: number) => {
    setCarregando(true)
    const params = new URLSearchParams({ pagina: String(p) })
    if (filtroEstado)   params.set('estado', filtroEstado)
    if (filtroValorMin) params.set('valor_min', filtroValorMin)
    const res = await fetch(`/api/licitacoes?${params}`)
    if (res.ok) setResposta(await res.json())
    setCarregando(false)
    setPrimeiraVez(false)
  }, [filtroEstado, filtroValorMin])

  useEffect(() => {
    setPagina(1)
    carregar(1)
  }, [filtroEstado, filtroValorMin]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregar(pagina)
  }, [pagina, carregar])

  const licitacoes  = resposta?.data ?? []
  const totalValor  = licitacoes.reduce((acc, l) => acc + (l.valor_estimado || 0), 0)
  const semFiltros  = !filtroEstado && !filtroValorMin
  const semResultados = !carregando && !primeiraVez && resposta?.total === 0 && semFiltros

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Licitações com match nas suas palavras-chave
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Valor mínimo */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'var(--text-3)' }}>R$</span>
            <input
              type="number"
              value={filtroValorMin}
              onChange={e => setFiltroValorMin(e.target.value)}
              placeholder="Valor mín."
              className="text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none w-36"
              style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
            />
          </div>

          {/* Estado */}
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="text-sm rounded-xl px-4 py-2.5 outline-none"
            style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
          >
            <option value="">Todos os estados</option>
            {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>

          {/* Limpar filtros */}
          {(filtroEstado || filtroValorMin) && (
            <button
              onClick={() => { setFiltroEstado(''); setFiltroValorMin('') }}
              className="text-sm rounded-xl px-3 py-2.5"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', cursor: 'pointer' }}
            >
              ✕ Limpar
            </button>
          )}
        </div>
      </div>

      {/* Banner de onboarding — só aparece se não há licitações e não há filtros */}
      {semResultados && (
        <div className="rounded-2xl p-6 mb-8 flex items-start gap-5"
          style={{ background: 'linear-gradient(135deg, rgba(107,15,26,0.06), rgba(201,166,90,0.06))', border: '1.5px solid rgba(107,15,26,0.15)' }}>
          <div className="text-3xl flex-shrink-0">🚀</div>
          <div className="flex-1">
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
              Configure suas palavras-chave para começar
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
              O Monitor de Licitações rastreia editais de mais de 5.500 municípios todos os dias. Para receber alertas personalizados, cadastre os produtos ou serviços que sua empresa vende.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/palavras-chave"
                className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}
              >
                Cadastrar palavras-chave →
              </Link>
              <Link
                href="/busca"
                className="inline-block text-sm font-medium px-5 py-2.5 rounded-xl"
                style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)', textDecoration: 'none' }}
              >
                Buscar licitações agora
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats — só exibe se já carregou e tem dados */}
      {!semResultados && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Licitações encontradas',
              valor: carregando ? '—' : (resposta?.total ?? 0).toString(),
              cor: 'var(--vinho)',
            },
            {
              label: 'Volume estimado (página)',
              valor: carregando ? '—' : (totalValor > 0 ? formatarValor(totalValor)! : '—'),
              cor: 'var(--dourado)',
            },
            {
              label: 'Página atual',
              valor: carregando ? '—' : `${resposta?.pagina ?? 1} / ${resposta?.paginas ?? 1}`,
              cor: 'var(--bordo)',
            },
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
      )}

      {/* Painel de inteligência por estado */}
      {statsEstados.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-3)' }}>
                Oportunidades por estado
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Clique em um estado para filtrar
              </p>
            </div>
            {filtroEstado && (
              <button
                onClick={() => setFiltroEstado('')}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer' }}
              >
                ✕ Ver todos
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statsEstados.map((e, i) => {
              const ativo = filtroEstado === e.uf
              const barMax = statsEstados[0]?.count ?? 1
              const pct = Math.round((e.count / barMax) * 100)
              return (
                <button
                  key={e.uf}
                  onClick={() => setFiltroEstado(ativo ? '' : e.uf)}
                  className="text-left rounded-xl p-3 transition-all"
                  style={{
                    background:  ativo ? 'var(--vinho)' : 'rgba(107,15,26,0.04)',
                    border:      `1.5px solid ${ativo ? 'var(--vinho)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: ativo ? 'white' : 'var(--text-1)' }}>
                      {e.uf}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: ativo ? 'rgba(255,255,255,0.85)' : 'var(--vinho)' }}>
                      {e.count}
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="rounded-full overflow-hidden" style={{ height: '3px', background: ativo ? 'rgba(255,255,255,0.2)' : 'var(--border)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ativo ? 'rgba(255,255,255,0.7)' : 'var(--vinho)', borderRadius: '9999px' }} />
                  </div>
                  {e.valor_total > 0 && (
                    <p className="text-xs mt-1.5 truncate" style={{ color: ativo ? 'rgba(255,255,255,0.65)' : 'var(--text-3)' }}>
                      {e.valor_total >= 1_000_000
                        ? `R$ ${(e.valor_total / 1_000_000).toFixed(1)}M`
                        : `R$ ${(e.valor_total / 1_000).toFixed(0)}k`}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: '110px' }} />
          ))}
        </div>
      ) : licitacoes.length === 0 && !semResultados ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-1)' }}>Nenhuma licitação para esses filtros</p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Tente remover os filtros ou ampliar os critérios.
          </p>
        </div>
      ) : (
        <>
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
                        {l.objeto.length > 160 ? l.objeto.substring(0, 160) + '…' : l.objeto}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      {l.valor_estimado && (
                        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatarValor(l.valor_estimado)}</p>
                      )}
                      {l.data_abertura && (
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          Abertura: {new Date(l.data_abertura).toLocaleDateString('pt-BR')}
                        </p>
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

          {/* Paginação */}
          <Paginacao
            pagina={resposta?.pagina ?? 1}
            paginas={resposta?.paginas ?? 1}
            onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          />

          <p className="text-center text-xs mt-3" style={{ color: 'var(--text-3)' }}>
            Mostrando {(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, resposta?.total ?? 0)} de {resposta?.total ?? 0} licitações
          </p>
        </>
      )}
    </div>
  )
}
