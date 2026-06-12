'use client'

import { useEffect, useState, useCallback } from 'react'

const REGIOES = [
  'Nacional',
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

type Fornecedor = {
  id: string
  razao_social: string | null
  cnpj: string | null
  descricao: string
  regioes: string[]
  email_contato: string | null
  telefone_contato: string | null
  website: string | null
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [busca, setBusca]       = useState('')
  const [regiao, setRegiao]     = useState('')
  const [carregando, setCarregando] = useState(true)
  const [bloqueado, setBloqueado]   = useState(false)

  const carregar = useCallback(async (p: number, q: string, r: string) => {
    setCarregando(true)
    const params = new URLSearchParams({ page: String(p) })
    if (q) params.set('q', q)
    if (r) params.set('regiao', r)
    const res = await fetch(`/api/fornecedores?${params}`)
    if (res.status === 403) { setBloqueado(true); setCarregando(false); return }
    const data = await res.json()
    setFornecedores(data.fornecedores ?? [])
    setTotal(data.total ?? 0)
    setCarregando(false)
  }, [])

  useEffect(() => { carregar(1, '', '') }, [carregar])

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    carregar(1, busca, regiao)
  }

  function mudarRegiao(r: string) {
    setRegiao(r)
    setPage(1)
    carregar(1, busca, r)
  }

  const totalPaginas = Math.ceil(total / 20)

  if (bloqueado) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--preto)' }}>Recurso exclusivo</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--cinza)' }}>
          O Diretório de Fornecedores está disponível nos planos Profissional, Gestão e Empresarial.
        </p>
        <a href="/assinar" className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white no-underline"
          style={{ background: 'var(--vinho)' }}>
          Ver planos →
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Diretório de Fornecedores</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>
          Empresas cadastradas que fornecem produtos e serviços para o setor público.
        </p>
      </div>

      {/* Busca */}
      <form onSubmit={buscar} className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou descrição..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }}
        />
        <select
          value={regiao}
          onChange={e => mudarRegiao(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm"
          style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }}
        >
          <option value="">Todas as regiões</option>
          {REGIOES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
          Buscar
        </button>
      </form>

      {/* Contador */}
      {!carregando && (
        <p className="text-xs" style={{ color: 'var(--cinza)' }}>
          {total === 0 ? 'Nenhum fornecedor encontrado.' : `${total} fornecedor${total !== 1 ? 'es' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)' }} />
          ))}
        </div>
      ) : fornecedores.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div className="text-3xl mb-3">🏭</div>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>Nenhum fornecedor encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fornecedores.map(f => (
            <div key={f.id} className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold text-base mb-0.5" style={{ color: 'var(--preto)' }}>
                    {f.razao_social ?? 'Empresa'}
                  </div>
                  {f.cnpj && (
                    <div className="text-xs mb-2" style={{ color: 'var(--cinza)' }}>CNPJ: {f.cnpj}</div>
                  )}
                  {f.descricao && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>{f.descricao}</p>
                  )}
                </div>
                {f.regioes.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap shrink-0">
                    {f.regioes.map(r => (
                      <span key={r} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {(f.email_contato || f.telefone_contato || f.website) && (
                <div className="flex gap-4 mt-4 flex-wrap" style={{ borderTop: '1px solid var(--cinza-light)', paddingTop: '12px' }}>
                  {f.email_contato && (
                    <a href={`mailto:${f.email_contato}`} className="text-xs font-medium no-underline"
                      style={{ color: 'var(--vinho)' }}>
                      ✉ {f.email_contato}
                    </a>
                  )}
                  {f.telefone_contato && (
                    <a href={`tel:${f.telefone_contato}`} className="text-xs font-medium no-underline"
                      style={{ color: 'var(--vinho)' }}>
                      📞 {f.telefone_contato}
                    </a>
                  )}
                  {f.website && (
                    <a href={f.website.startsWith('http') ? f.website : `https://${f.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium no-underline"
                      style={{ color: 'var(--vinho)' }}>
                      🌐 {f.website}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => { const p = page - 1; setPage(p); carregar(p, busca, regiao) }}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'white', border: '1px solid var(--cinza-light)', color: page === 1 ? 'var(--cinza)' : 'var(--preto)', cursor: page === 1 ? 'default' : 'pointer' }}
          >
            ← Anterior
          </button>
          <span className="text-sm px-3" style={{ color: 'var(--cinza)' }}>
            {page} / {totalPaginas}
          </span>
          <button
            onClick={() => { const p = page + 1; setPage(p); carregar(p, busca, regiao) }}
            disabled={page === totalPaginas}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'white', border: '1px solid var(--cinza-light)', color: page === totalPaginas ? 'var(--cinza)' : 'var(--preto)', cursor: page === totalPaginas ? 'default' : 'pointer' }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
