'use client'

import { useEffect, useState, useCallback } from 'react'

type Licitacao = {
  orgao: string
  objeto: string
  url: string
  estado?: string
  cidade?: string
  valor_estimado?: number
  data_abertura?: string
}

type Alerta = {
  id: string
  enviado_em: string
  canais: string[]
  licitacoes: Licitacao | null
  keywords: { termo: string } | null
}

type Resposta = {
  data: Alerta[]
  total: number
  pagina: number
  paginas: number
}

const canalConfig: Record<string, { label: string; cor: string; bg: string }> = {
  email:    { label: 'E-mail',   cor: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  telegram: { label: 'Telegram', cor: '#0ea5e9', bg: 'rgba(14,165,233,0.1)'  },
}

function moeda(v?: number) {
  if (!v) return null
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
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
        className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'white', border: '1px solid var(--cinza-light)', color: pagina === 1 ? 'var(--cinza-light)' : 'var(--cinza)', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
      >
        ← Anterior
      </button>

      {pagNums.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'var(--cinza)' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
            style={{
              background: p === pagina ? 'var(--vinho)' : 'white',
              color:      p === pagina ? 'white' : 'var(--cinza)',
              border:     `1px solid ${p === pagina ? 'var(--vinho)' : 'var(--cinza-light)'}`,
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
        className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'white', border: '1px solid var(--cinza-light)', color: pagina === paginas ? 'var(--cinza-light)' : 'var(--cinza)', cursor: pagina === paginas ? 'not-allowed' : 'pointer' }}
      >
        Próxima →
      </button>
    </div>
  )
}

export default function AlertasPage() {
  const [resposta, setResposta]     = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [pagina, setPagina]         = useState(1)

  // Filtros
  const [busca,    setBusca]   = useState('')
  const [keyword,  setKeyword] = useState('')

  // Lista de keywords do usuário para o dropdown — carrega uma só vez
  const [keywords, setKeywords] = useState<string[]>([])
  useEffect(() => {
    fetch('/api/keywords')
      .then(r => r.ok ? r.json() : [])
      .then((kws: { termo: string }[]) => {
        if (Array.isArray(kws)) setKeywords(kws.map(k => k.termo))
      })
  }, [])

  const carregar = useCallback(async (p: number) => {
    setCarregando(true)
    const params = new URLSearchParams({ pagina: String(p) })
    if (busca)   params.set('busca', busca)
    if (keyword) params.set('keyword', keyword)
    const res = await fetch(`/api/alertas?${params}`)
    if (res.ok) setResposta(await res.json())
    setCarregando(false)
  }, [busca, keyword])

  // Re-busca quando filtros ou página mudam
  useEffect(() => {
    carregar(pagina)
  }, [pagina, carregar])

  // Ao mudar filtro, volta pra página 1
  function aplicarFiltro(fn: () => void) {
    fn()
    setPagina(1)
  }

  const alertas = resposta?.data ?? []
  const temFiltro = busca || keyword

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Histórico de Alertas</h1>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>
            {resposta ? `${resposta.total} alerta${resposta.total !== 1 ? 's' : ''} encontrado${resposta.total !== 1 ? 's' : ''}` : 'Carregando…'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-end" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        {/* Busca livre */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Buscar</label>
          <input
            type="text"
            value={busca}
            onChange={e => aplicarFiltro(() => setBusca(e.target.value))}
            placeholder="Órgão, objeto…"
            className="w-full px-3 py-2 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)' }}
          />
        </div>

        {/* Keyword */}
        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Palavra-chave</label>
          <select
            value={keyword}
            onChange={e => aplicarFiltro(() => setKeyword(e.target.value))}
            className="w-full px-3 py-2 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
          >
            <option value="">Todas</option>
            {keywords.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Limpar */}
        {temFiltro && (
          <button
            onClick={() => aplicarFiltro(() => { setBusca(''); setKeyword('') })}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface-2)', color: 'var(--cinza)', border: '1px solid var(--cinza-light)', cursor: 'pointer', alignSelf: 'flex-end' }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '100px' }} />
          ))}
        </div>
      ) : alertas.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--preto)' }}>
            {temFiltro ? 'Nenhum alerta encontrado para esses filtros' : 'Nenhum alerta enviado ainda'}
          </p>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>
            {temFiltro ? 'Tente ampliar os critérios de busca.' : 'Os alertas aparecerão aqui quando houver licitações com match nas suas palavras-chave.'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            {alertas.map((a, idx) => {
              const lic = a.licitacoes
              return (
                <div
                  key={a.id}
                  className="p-5"
                  style={{ borderBottom: idx < alertas.length - 1 ? '1px solid var(--cinza-light)' : undefined }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {a.keywords?.termo && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>
                            {a.keywords.termo}
                          </span>
                        )}
                        {a.canais.map(c => {
                          const cfg = canalConfig[c] ?? { label: c, cor: '#64748b', bg: 'rgba(100,116,139,0.1)' }
                          return (
                            <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-lg"
                              style={{ background: cfg.bg, color: cfg.cor }}>
                              {cfg.label}
                            </span>
                          )
                        })}
                        {lic?.estado && (
                          <span className="text-xs" style={{ color: 'var(--cinza)' }}>
                            {lic.cidade ? `${lic.cidade}/` : ''}{lic.estado}
                          </span>
                        )}
                      </div>

                      {/* Órgão + objeto */}
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--preto)' }}>
                        {lic?.orgao ?? '—'}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>
                        {lic?.objeto ? (lic.objeto.length > 150 ? lic.objeto.substring(0, 150) + '…' : lic.objeto) : '—'}
                      </p>

                      {/* Metadados */}
                      <div className="flex gap-4 mt-2 flex-wrap">
                        {lic?.valor_estimado && (
                          <span className="text-xs font-semibold" style={{ color: 'var(--preto)' }}>
                            💰 {moeda(lic.valor_estimado)}
                          </span>
                        )}
                        {lic?.data_abertura && (
                          <span className="text-xs" style={{ color: 'var(--cinza)' }}>
                            📅 {new Date(lic.data_abertura).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lado direito */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <p className="text-xs" style={{ color: 'var(--cinza)' }}>
                        {new Date(a.enviado_em).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {lic?.url && (
                        <a
                          href={lic.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}
                        >
                          Ver edital →
                        </a>
                      )}
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

          <p className="text-center text-xs mt-3" style={{ color: 'var(--cinza)' }}>
            Mostrando {(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, resposta?.total ?? 0)} de {resposta?.total ?? 0} alertas
          </p>
        </>
      )}
    </div>
  )
}
