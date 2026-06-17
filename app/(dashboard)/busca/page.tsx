'use client'

import { useState, useCallback } from 'react'
import { removerRegiao } from '@/lib/regioes'
import { RegiaoSelector, RegiaoChips } from '@/components/RegiaoSelector'

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
  _semantico?: boolean
}

type Resposta = {
  data: Licitacao[]
  total: number
  pagina: number
  paginas: number
}


const fonteConfig: Record<string, { cor: string; bg: string }> = {
  'PNCP':           { cor: '#6B0F1A', bg: 'rgba(107,15,26,0.07)'  },
  'ComprasNet':     { cor: '#8B1E2D', bg: 'rgba(139,30,45,0.07)'  },
  'Querido Diário': { cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)'  },
  'BLL':            { cor: '#4a4a4d', bg: 'rgba(74,74,77,0.07)'   },
}

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

export default function BuscaPage() {
  const [termo,      setTermo]      = useState('')
  const [regioes,    setRegioes]    = useState<string[]>([])
  const [valorMin,   setValorMin]   = useState('')
  const [valorMax,   setValorMax]   = useState('')
  const [dataInicio, setDataInicio] = useState('')

  const [ordenar,    setOrdenar]    = useState('recente')
  const [resposta,   setResposta]   = useState<Resposta | null>(null)
  const [buscando,   setBuscando]   = useState(false)
  const [buscouUmaVez, setBuscouUmaVez] = useState(false)
  const [pagina,     setPagina]     = useState(1)

  const buscar = useCallback(async (p: number) => {
    setBuscando(true)
    setBuscouUmaVez(true)

    const params = new URLSearchParams({ pagina: String(p), ordenar })
    if (termo)      params.set('q', termo)
    if (regioes.length > 0 && !regioes.includes('brasil')) params.set('regioes', regioes.join(','))
    if (valorMin)   params.set('valor_min', valorMin)
    if (valorMax)   params.set('valor_max', valorMax)
    if (dataInicio) params.set('data_inicio', dataInicio)

    const res = await fetch(`/api/busca?${params}`)
    if (res.ok) setResposta(await res.json())
    setBuscando(false)
  }, [termo, regioes, valorMin, valorMax, dataInicio, ordenar])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPagina(1)
    buscar(1)
  }

  function mudarPagina(p: number) {
    setPagina(p)
    buscar(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function buscarTempoReal() {
    setBuscando(true)
    await fetch('/api/busca/tempo-real')
    setPagina(1)
    await buscar(1)
  }

  const resultados = resposta?.data ?? []

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Busca manual</h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Pesquise no banco de licitações coletadas — independente das suas palavras-chave
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Campo principal */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>
            Buscar por objeto / descrição
          </label>
          <input
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Ex: notebook, cadeira, retroescavadeira, serviços de limpeza..."
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--text-1)', background: 'var(--surface)' }}
          />
        </div>

        {/* Filtros secundários */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Região / Estado</label>
            <RegiaoSelector value={regioes} onChange={setRegioes} placeholder="Todos" />
            {regioes.length > 0 && !regioes.includes('brasil') && (
              <RegiaoChips regioes={regioes} onRemove={r => setRegioes(removerRegiao(r, regioes))} />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Abertura a partir de</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--text-1)', background: 'var(--surface)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Valor mín. (R$)</label>
            <input
              type="number"
              value={valorMin}
              onChange={e => setValorMin(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--text-1)', background: 'var(--surface)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Valor máx. (R$)</label>
            <input
              type="number"
              value={valorMax}
              onChange={e => setValorMax(e.target.value)}
              placeholder="Sem limite"
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--text-1)', background: 'var(--surface)' }}
            />
          </div>
        </div>

        {/* Ordenação + Botões na mesma linha */}
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Ordenar por</label>
            <select
              value={ordenar}
              onChange={e => setOrdenar(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--border)', outline: 'none', color: 'var(--text-1)', background: 'var(--surface)', minWidth: '180px' }}
            >
              <option value="recente">Mais recentes</option>
              <option value="valor">Maior valor</option>
              <option value="abertura">Abertura próxima</option>
              <option value="menor">Menor valor</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--vinho)', color: 'white', cursor: buscando ? 'not-allowed' : 'pointer', opacity: buscando ? 0.7 : 1 }}
          >
            {buscando ? 'Buscando…' : 'Buscar no banco'}
          </button>
          <button
            type="button"
            onClick={buscarTempoReal}
            disabled={buscando}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: buscando ? 'not-allowed' : 'pointer', opacity: buscando ? 0.7 : 1 }}
          >
            🔄 Buscar agora nas fontes
          </button>
          {(termo || (regioes.length > 0 && !regioes.includes('brasil')) || valorMin || valorMax || dataInicio) && (
            <button
              type="button"
              onClick={() => { setTermo(''); setRegioes([]); setValorMin(''); setValorMax(''); setDataInicio('') }}
              className="px-4 py-2.5 rounded-xl text-sm"
              style={{ color: 'var(--text-3)', cursor: 'pointer' }}
            >
              ✕ Limpar
            </button>
          )}
        </div>
      </form>

      {/* Resultados */}
      {buscouUmaVez && (
        <>
          {buscando ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: '110px' }} />
              ))}
            </div>
          ) : resultados.length === 0 ? (
            <div className="rounded-2xl p-16 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-1)' }}>Nenhum resultado encontrado</p>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                Tente ampliar os critérios ou use "Buscar agora nas fontes" para coletar dados em tempo real.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>
                {resposta?.total ?? resultados.length} resultado{(resposta?.total ?? resultados.length) !== 1 ? 's' : ''} encontrado{(resposta?.total ?? resultados.length) !== 1 ? 's' : ''}
                {resposta && resposta.total > 20 && ` — página ${resposta.pagina} de ${resposta.paginas}`}
              </p>

              <div className="space-y-3">
                {resultados.map(l => {
                  const cfg = fonteConfig[l.fonte] ?? { cor: '#64748b', bg: 'rgba(100,116,139,0.08)' }
                  return (
                    <div
                      key={l.id}
                      className="rounded-2xl p-5"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${cfg.cor}` }}
                    >
                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.cor }}>
                          {l.fonte}
                        </span>
                        {l._semantico && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)' }}>
                            🤖 Correspondência inteligente
                          </span>
                        )}
                        {l.cidade && (
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                            {l.cidade}{l.estado ? `/${l.estado}` : ''}
                          </span>
                        )}
                      </div>

                      {/* Órgão */}
                      <p className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--text-1)' }}>{l.orgao}</p>

                      {/* Objeto capitalizado */}
                      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>
                        {(() => {
                          const txt = l.objeto.length > 160 ? l.objeto.substring(0, 160) + '…' : l.objeto
                          return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
                        })()}
                      </p>

                      {/* Rodapé: valor + data + botão */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          {l.valor_estimado ? (
                            <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatarValor(l.valor_estimado)}</p>
                          ) : null}
                          {l.data_abertura && (
                            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                              Abertura: {new Date(l.data_abertura + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                          style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}
                        >
                          Ver edital →
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Paginacao
                pagina={resposta?.pagina ?? 1}
                paginas={resposta?.paginas ?? 1}
                onChange={mudarPagina}
              />

              {resposta && resposta.total > 20 && (
                <p className="text-center text-xs mt-3" style={{ color: 'var(--text-3)' }}>
                  Mostrando {(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, resposta.total)} de {resposta.total} resultados
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
