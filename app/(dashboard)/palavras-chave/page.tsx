'use client'

import { useEffect, useState } from 'react'

type Keyword = {
  id: string
  termo: string
  ativo: boolean
  regiao: string
  criado_em: string
}

const REGIOES = [
  { value: 'brasil',       label: '🌎 Brasil (qualquer região)' },
  { value: 'norte',        label: '🌿 Norte',        estados: 'AC, AM, AP, PA, RO, RR, TO' },
  { value: 'nordeste',     label: '☀️ Nordeste',     estados: 'AL, BA, CE, MA, PB, PE, PI, RN, SE' },
  { value: 'sudeste',      label: '🏙️ Sudeste',      estados: 'ES, MG, RJ, SP' },
  { value: 'sul',          label: '❄️ Sul',           estados: 'PR, RS, SC' },
  { value: 'centro_oeste', label: '🌾 Centro-Oeste', estados: 'DF, GO, MS, MT' },
  { value: 'SP', label: 'Estado: São Paulo' },
  { value: 'RJ', label: 'Estado: Rio de Janeiro' },
  { value: 'MG', label: 'Estado: Minas Gerais' },
  { value: 'RS', label: 'Estado: Rio Grande do Sul' },
  { value: 'PR', label: 'Estado: Paraná' },
  { value: 'BA', label: 'Estado: Bahia' },
  { value: 'SC', label: 'Estado: Santa Catarina' },
  { value: 'GO', label: 'Estado: Goiás' },
  { value: 'PE', label: 'Estado: Pernambuco' },
  { value: 'CE', label: 'Estado: Ceará' },
  { value: 'PA', label: 'Estado: Pará' },
  { value: 'MT', label: 'Estado: Mato Grosso' },
  { value: 'MS', label: 'Estado: Mato Grosso do Sul' },
  { value: 'AM', label: 'Estado: Amazonas' },
  { value: 'DF', label: 'Estado: Distrito Federal' },
  { value: 'ES', label: 'Estado: Espírito Santo' },
  { value: 'MA', label: 'Estado: Maranhão' },
  { value: 'RN', label: 'Estado: Rio Grande do Norte' },
  { value: 'PB', label: 'Estado: Paraíba' },
  { value: 'AL', label: 'Estado: Alagoas' },
  { value: 'PI', label: 'Estado: Piauí' },
  { value: 'SE', label: 'Estado: Sergipe' },
  { value: 'TO', label: 'Estado: Tocantins' },
  { value: 'RO', label: 'Estado: Rondônia' },
  { value: 'AC', label: 'Estado: Acre' },
  { value: 'AP', label: 'Estado: Amapá' },
  { value: 'RR', label: 'Estado: Roraima' },
]

function labelRegiao(value: string): string {
  return REGIOES.find(r => r.value === value)?.label ?? value
}

export default function PalavrasChavePage() {
  const [keywords, setKeywords]     = useState<Keyword[]>([])
  const [novoTermo, setNovoTermo]   = useState('')
  const [novaRegiao, setNovaRegiao] = useState('brasil')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]             = useState('')
  const [salvando, setSalvando]     = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/keywords')
    if (res.ok) setKeywords(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    const res = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo: novoTermo, regiao: novaRegiao }),
    })
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao adicionar')
      return
    }
    setNovoTermo('')
    setNovaRegiao('brasil')
    carregar()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: !ativo }),
    })
    carregar()
  }

  async function salvarRegiao(id: string, regiao: string) {
    setSalvando(id)
    await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, regiao }),
    })
    setSalvando(null)
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover esta palavra-chave?')) return
    await fetch('/api/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregar()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Palavras-chave</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>
          Configure os termos que deseja monitorar e a região de interesse de cada um.
        </p>
      </div>

      {/* Formulário de adição */}
      <form onSubmit={adicionar} className="rounded-2xl p-5 mb-5"
        style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--cinza)' }}>
          Nova palavra-chave
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* Termo */}
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--cinza)' }}>Termo</label>
            <input
              value={novoTermo}
              onChange={e => setNovoTermo(e.target.value)}
              placeholder="Ex: notebook, retroescavadeira, uniforme…"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
              onFocus={e => { e.target.style.borderColor = 'var(--vinho)' }}
              onBlur={e =>  { e.target.style.borderColor = 'var(--cinza-light)' }}
            />
          </div>

          {/* Região */}
          <div className="sm:w-60">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--cinza)' }}>Região</label>
            <select
              value={novaRegiao}
              onChange={e => setNovaRegiao(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
            >
              {REGIOES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
            style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            + Adicionar
          </button>
        </div>

        {erro && (
          <div className="mt-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}>
            ⚠ {erro}
          </div>
        )}
      </form>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '72px' }} />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p className="text-base font-medium mb-1" style={{ color: 'var(--preto)' }}>Nenhuma palavra-chave ainda</p>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>Adicione termos acima para começar a receber alertas.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>

          {/* Cabeçalho da lista */}
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
              {keywords.length} palavra{keywords.length !== 1 ? 's' : ''}-chave
            </span>
            <span className="text-xs" style={{ color: 'var(--cinza)' }}>
              {keywords.filter(k => k.ativo).length} ativa{keywords.filter(k => k.ativo).length !== 1 ? 's' : ''}
            </span>
          </div>

          {keywords.map((kw, idx) => (
            <div
              key={kw.id}
              className="px-5 py-4"
              style={{
                borderBottom: idx < keywords.length - 1 ? '1px solid var(--cinza-light)' : undefined,
                opacity: kw.ativo ? 1 : 0.55,
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Termo */}
                <span className="text-sm font-semibold flex-1 min-w-0"
                  style={{ color: 'var(--preto)', textDecoration: kw.ativo ? 'none' : 'line-through' }}>
                  {kw.termo}
                </span>

                {/* Seletor de região inline */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={kw.regiao ?? 'brasil'}
                    onChange={e => salvarRegiao(kw.id, e.target.value)}
                    disabled={salvando === kw.id}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{
                      border: '1px solid var(--cinza-light)',
                      background: 'var(--surface-2)',
                      color: 'var(--cinza)',
                      outline: 'none',
                      cursor: 'pointer',
                      maxWidth: '190px',
                    }}
                  >
                    {REGIOES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {salvando === kw.id && (
                    <span className="text-xs animate-pulse" style={{ color: 'var(--cinza)' }}>✓</span>
                  )}
                </div>

                {/* Badge status */}
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: kw.ativo ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
                    color: kw.ativo ? '#16a34a' : 'var(--cinza)',
                  }}>
                  {kw.ativo ? 'ativa' : 'inativa'}
                </span>

                {/* Ações */}
                <button onClick={() => toggleAtivo(kw.id, kw.ativo)}
                  className="text-xs font-medium"
                  style={{ color: 'var(--vinho)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {kw.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => remover(kw.id)}
                  className="text-xs font-medium"
                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remover
                </button>
              </div>

              {/* Detalhe da região (se não for Brasil todo) */}
              {kw.regiao && kw.regiao !== 'brasil' && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--cinza)' }}>
                  <span>📍</span>
                  <span>
                    Filtrando: {labelRegiao(kw.regiao)}
                    {(() => {
                      const r = REGIOES.find(r => r.value === kw.regiao)
                      return r && 'estados' in r ? ` — ${r.estados}` : ''
                    })()}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nota sobre limites de plano */}
      <p className="text-xs text-center mt-4" style={{ color: 'var(--cinza)' }}>
        Plano Basic: até 20 palavras-chave &nbsp;·&nbsp; Profissional / Pro / Empresarial: ilimitado
      </p>
    </div>
  )
}
