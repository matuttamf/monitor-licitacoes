'use client'

import { useState } from 'react'
import {
  NOME_UF,
  adicionarRegiao,
  removerRegiao,
  jaCoberto,
  labelSelecao,
} from '@/lib/regioes'

// ─── Dados dos grupos ────────────────────────────────────────────────────────

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

// ─── Seletor dropdown multi-região ───────────────────────────────────────────

/**
 * value: array de seleções atuais. [] ou ['brasil'] = sem filtro.
 * onChange: chamado sempre que a seleção muda.
 */
export function RegiaoSelector({
  value,
  onChange,
  placeholder = '🌎 Brasil (qualquer região)',
}: {
  value: string[]
  onChange: (novas: string[]) => void
  placeholder?: string
}) {
  const [aberto, setAberto] = useState(false)

  // Trabalha com value diretamente — sem normalizar para ['brasil']
  const selecionadas = value

  function toggle(item: string) {
    if (item === 'brasil') {
      // Brasil selecionado → desmarcar limpa tudo ([] = sem filtro = brasil implícito)
      // Brasil desmarcado → selecionar substitui tudo por ['brasil']
      onChange(selecionadas.includes('brasil') ? [] : ['brasil'])
    } else if (selecionadas.includes(item)) {
      const novas = removerRegiao(item, selecionadas)
      // removerRegiao retorna ['brasil'] quando fica vazio — queremos [] nesse caso
      onChange(novas.length === 1 && novas[0] === 'brasil' && !selecionadas.includes('brasil') ? [] : novas)
    } else {
      onChange(adicionarRegiao(item, selecionadas))
    }
  }

  const resumo =
    selecionadas.length === 0 || selecionadas.includes('brasil')
      ? placeholder
      : selecionadas.map(labelSelecao).join(', ')

  // Para exibição de "já coberto": considera brasil selecionado se array vazio
  const selParaVerificar = selecionadas.length === 0 ? ['brasil'] : selecionadas

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
        <span className="truncate text-xs" style={{ maxWidth: '300px' }}>{resumo}</span>
        <span style={{ color: 'var(--cinza)', flexShrink: 0 }}>{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <>
          {/* Overlay invisível para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAberto(false)}
          />
          <div
            className="absolute z-50 mt-1 w-full rounded-xl overflow-y-auto shadow-lg"
            style={{
              background: 'white',
              border: '1px solid var(--cinza-light)',
              maxHeight: '260px',
              minWidth: '220px',
            }}
          >
            {GRUPOS.map(grupo => (
              <div key={grupo.titulo}>
                <div
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider sticky top-0"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--cinza)',
                    borderBottom: '1px solid var(--cinza-light)',
                  }}
                >
                  {grupo.titulo}
                </div>
                {grupo.itens.map(item => {
                  const selecionado = selecionadas.includes(item.value) ||
                    (item.value === 'brasil' && selecionadas.length === 0)
                  const coberto = !selecionado && jaCoberto(item.value, selParaVerificar)
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
                      <span
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-white text-xs"
                        style={{ background: selecionado ? 'var(--vinho)' : 'var(--cinza-light)' }}
                      >
                        {selecionado ? '✓' : coberto ? '—' : ''}
                      </span>
                      <span className="text-xs">{item.label}</span>
                      {coberto && (
                        <span className="text-xs ml-auto" style={{ color: 'var(--cinza)' }}>
                          já coberto
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Chips das seleções ───────────────────────────────────────────────────────

export function RegiaoChips({
  regioes,
  onRemove,
}: {
  regioes: string[]
  onRemove: (r: string) => void
}) {
  const lista = regioes.length === 0 ? ['brasil'] : regioes
  if (lista.includes('brasil')) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}
      >
        🌎 Brasil
      </span>
    )
  }
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {lista.map(r => (
        <span
          key={r}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}
        >
          {labelSelecao(r)}
          <button
            type="button"
            onClick={() => onRemove(r)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: 'var(--vinho)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
