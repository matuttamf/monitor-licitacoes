'use client'

import { useEffect, useState } from 'react'
import {
  ESTADOS_POR_REGIAO,
  NOME_UF,
  LABEL_REGIAO,
  adicionarRegiao,
  removerRegiao,
  jaCoberto,
  labelSelecao,
} from '@/lib/regioes'

type Keyword = {
  id: string
  termo: string
  ativo: boolean
  regiao: string[]
  criado_em: string
}

// ─── Seletor de múltiplas regiões ──────────────────────────────────────────

const GRUPOS = [
  {
    titulo: 'Brasil',
    itens: [{ value: 'brasil', label: '🌎 Brasil (qualquer região)' }],
  },
  {
    titulo: 'Regiões',
    itens: [
      { value: 'norte',        label: '🌿 Norte' },
      { value: 'nordeste',     label: '☀️ Nordeste' },
      { value: 'sudeste',      label: '🏙️ Sudeste' },
      { value: 'sul',          label: '❄️ Sul' },
      { value: 'centro_oeste', label: '🌾 Centro-Oeste' },
    ],
  },
  {
    titulo: 'Estados',
    itens: Object.keys(NOME_UF)
      .sort()
      .map(uf => ({ value: uf, label: `${uf} — ${NOME_UF[uf]}` })),
  },
]

function RegiaoSelector({
  value,
  onChange,
}: {
  value: string[]
  onChange: (novas: string[]) => void
}) {
  const [aberto, setAberto] = useState(false)
  const selecionadas = value.length === 0 ? ['brasil'] : value

  function toggle(item: string) {
    if (selecionadas.includes(item)) {
      onChange(removerRegiao(item, selecionadas))
    } else {
      onChange(adicionarRegiao(item, selecionadas))
    }
  }

  const resumo = selecionadas.includes('brasil')
    ? '🌎 Brasil (qualquer região)'
    : selecionadas.map(labelSelecao).join(', ')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        className="w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between gap-2"
        style={{
          border: '1.5px solid var(--cinza-light)',
          background: 'white',
          color: 'var(--preto)',
          cursor: 'pointer',
        }}
      >
        <span className="truncate text-xs" style={{ maxWidth: '280px' }}>{resumo}</span>
        <span style={{ color: 'var(--cinza)', flexShrink: 0 }}>{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl overflow-y-auto shadow-lg"
          style={{
            background: 'white',
            border: '1px solid var(--cinza-light)',
            maxHeight: '260px',
          }}
        >
          {GRUPOS.map(grupo => (
            <div key={grupo.titulo}>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider sticky top-0"
                style={{ background: 'var(--surface-2)', color: 'var(--cinza)', borderBottom: '1px solid var(--cinza-light)' }}>
                {grupo.titulo}
              </div>
              {grupo.itens.map(item => {
                const coberto = jaCoberto(item.value, selecionadas) && !selecionadas.includes(item.value)
                const selecionado = selecionadas.includes(item.value)
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={coberto}
                    onClick={() => toggle(item.value)}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                    style={{
                      color: coberto ? 'var(--cinza)' : 'var(--preto)',
                      opacity: coberto ? 0.45 : 1,
                      background: selecionado ? 'rgba(107,15,26,0.06)' : 'transparent',
                      cursor: coberto ? 'not-allowed' : 'pointer',
                      border: 'none',
                    }}
                  >
                    <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-white text-xs"
                      style={{ background: selecionado ? 'var(--vinho)' : 'var(--cinza-light)' }}>
                      {selecionado ? '✓' : coberto ? '—' : ''}
                    </span>
                    <span className="text-xs">{item.label}</span>
                    {coberto && <span className="text-xs ml-auto" style={{ color: 'var(--cinza)' }}>já coberto</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Chips das regiões selecionadas ─────────────────────────────────────────

function RegiaoChips({ regioes, onRemove }: { regioes: string[]; onRemove: (r: string) => void }) {
  const lista = regioes.length === 0 ? ['brasil'] : regioes
  if (lista.includes('brasil')) {
    return <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>🌎 Brasil</span>
  }
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {lista.map(r => (
        <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>
          {labelSelecao(r)}
          <button type="button" onClick={() => onRemove(r)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--vinho)', lineHeight: 1 }}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function PalavrasChavePage() {
  const [keywords, setKeywords]     = useState<Keyword[]>([])
  const [novoTermo, setNovoTermo]   = useState('')
  const [novasRegioes, setNovasRegioes] = useState<string[]>(['brasil'])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]             = useState('')
  const [salvando, setSalvando]     = useState<string | null>(null)
  const [editandoRegiao, setEditandoRegiao] = useState<string | null>(null)
  const [regiaoEdit, setRegiaoEdit] = useState<string[]>(['brasil'])

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/keywords')
    if (res.ok) {
      const data = await res.json()
      // Normaliza regiao: se vier como string (legado), transforma em array
      setKeywords(data.map((k: Keyword & { regiao: string | string[] }) => ({
        ...k,
        regiao: Array.isArray(k.regiao) ? k.regiao : [k.regiao ?? 'brasil'],
      })))
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    const res = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo: novoTermo, regiao: novasRegioes }),
    })
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao adicionar')
      return
    }
    setNovoTermo('')
    setNovasRegioes(['brasil'])
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

  async function salvarRegiao(id: string, regiao: string[]) {
    setSalvando(id)
    await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, regiao }),
    })
    setSalvando(null)
    setEditandoRegiao(null)
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
          Configure os termos que deseja monitorar e as regiões de interesse de cada um.
        </p>
      </div>

      {/* Formulário de adição */}
      <form onSubmit={adicionar} className="rounded-2xl p-5 mb-5"
        style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--cinza)' }}>
          Nova palavra-chave
        </h2>

        <div className="flex flex-col gap-3">
          {/* Termo */}
          <div>
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

          {/* Regiões */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--cinza)' }}>Regiões de interesse</label>
            <RegiaoSelector value={novasRegioes} onChange={setNovasRegioes} />
            <RegiaoChips regioes={novasRegioes} onRemove={r => setNovasRegioes(removerRegiao(r, novasRegioes))} />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold self-start"
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
            <div key={kw.id} className="px-5 py-4"
              style={{
                borderBottom: idx < keywords.length - 1 ? '1px solid var(--cinza-light)' : undefined,
                opacity: kw.ativo ? 1 : 0.55,
              }}>

              <div className="flex items-start gap-3 flex-wrap">
                {/* Termo */}
                <span className="text-sm font-semibold flex-1 min-w-0 pt-0.5"
                  style={{ color: 'var(--preto)', textDecoration: kw.ativo ? 'none' : 'line-through' }}>
                  {kw.termo}
                </span>

                {/* Ações direita */}
                <div className="flex items-center gap-3 flex-shrink-0">
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
              </div>

              {/* Regiões — chips clicáveis para edição inline */}
              {editandoRegiao === kw.id ? (
                <div className="mt-2 space-y-2">
                  <RegiaoSelector
                    value={regiaoEdit}
                    onChange={setRegiaoEdit}
                  />
                  <RegiaoChips regioes={regiaoEdit} onRemove={r => setRegiaoEdit(removerRegiao(r, regiaoEdit))} />
                  <div className="flex gap-2 mt-1">
                    <button type="button"
                      disabled={salvando === kw.id}
                      onClick={() => salvarRegiao(kw.id, regiaoEdit)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                      style={{ background: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
                      {salvando === kw.id ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button type="button"
                      onClick={() => setEditandoRegiao(null)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--cinza-light)', color: 'var(--cinza)', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--cinza)' }}>📍</span>
                  <RegiaoChips regioes={kw.regiao} onRemove={() => {}} />
                  <button type="button"
                    onClick={() => { setEditandoRegiao(kw.id); setRegiaoEdit(kw.regiao) }}
                    className="text-xs"
                    style={{ color: 'var(--cinza)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    editar regiões
                  </button>
                </div>
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
