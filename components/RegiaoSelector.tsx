'use client'

import { useState } from 'react'
import {
  ESTADOS_POR_REGIAO,
  NOME_UF,
  LABEL_REGIAO,
  adicionarRegiao,
  removerRegiao,
  jaCoberto,
  labelSelecao,
} from '@/lib/regioes'

// Regiões em ordem alfabética pelo label
const REGIOES_ORDEM = (
  Object.entries(LABEL_REGIAO)
    .filter(([key]) => key !== 'brasil')
    .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
    .map(([key]) => key)
) as string[]

// ─── Seletor em árvore (Brasil → Regiões → Estados) ──────────────────────────

export function RegiaoSelector({
  value,
  onChange,
  placeholder = 'Brasil (qualquer região)',
}: {
  value: string[]
  onChange: (novas: string[]) => void
  placeholder?: string
}) {
  const [aberto, setAberto] = useState(false)

  const selecionadas = value

  function toggle(item: string) {
    if (item === 'brasil') {
      onChange(selecionadas.includes('brasil') ? [] : ['brasil'])
    } else if (selecionadas.includes(item)) {
      const novas = removerRegiao(item, selecionadas)
      onChange(novas.length === 1 && novas[0] === 'brasil' && !selecionadas.includes('brasil') ? [] : novas)
    } else {
      onChange(adicionarRegiao(item, selecionadas))
    }
  }

  const resumo =
    selecionadas.length === 0 || selecionadas.includes('brasil')
      ? placeholder
      : selecionadas.map(labelSelecao).join(', ')

  function isSelecionado(item: string) {
    return selecionadas.includes(item) || (item === 'brasil' && selecionadas.length === 0)
  }
  function isCoberto(item: string) {
    return !selecionadas.includes(item) && jaCoberto(item, selecionadas)
  }

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
        <span style={{ color: 'var(--cinza)', flexShrink: 0, fontSize: '10px' }}>{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />

          <div
            className="absolute z-50 mt-1 w-full rounded-xl overflow-y-auto shadow-lg"
            style={{
              background: 'white',
              border: '1px solid var(--cinza-light)',
              maxHeight: '400px',
              minWidth: '240px',
            }}
          >
            {/* ── Brasil ── */}
            <TreeItem
              label="Brasil (qualquer região)"
              depth={0}
              selecionado={isSelecionado('brasil')}
              coberto={false}
              onToggle={() => toggle('brasil')}
            />

            {/* ── Regiões e estados sempre visíveis, ordem alfabética ── */}
            {REGIOES_ORDEM.map(regiao => {
              const estados = [...(ESTADOS_POR_REGIAO[regiao] ?? [])].sort()
              return (
                <div key={regiao}>
                  {/* Cabeçalho da região */}
                  <TreeItem
                    label={LABEL_REGIAO[regiao] ?? regiao}
                    depth={0}
                    selecionado={isSelecionado(regiao)}
                    coberto={isCoberto(regiao)}
                    onToggle={() => toggle(regiao)}
                    topBorder
                  />
                  {/* Estados sempre visíveis, indentados */}
                  {estados.map(uf => (
                    <TreeItem
                      key={uf}
                      label={`${uf} — ${NOME_UF[uf] ?? uf}`}
                      depth={2}
                      selecionado={isSelecionado(uf)}
                      coberto={isCoberto(uf)}
                      onToggle={() => toggle(uf)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Item de linha da árvore ──────────────────────────────────────────────────

function TreeItem({
  label,
  depth,
  selecionado,
  coberto,
  onToggle,
  topBorder = false,
}: {
  label: string
  depth: number
  selecionado: boolean
  coberto: boolean
  onToggle: () => void
  topBorder?: boolean
}) {
  const paddingLeft = depth === 0 ? 12 : 36

  return (
    <button
      type="button"
      disabled={coberto}
      onClick={onToggle}
      className="w-full text-left flex items-center gap-2 py-2 transition-colors"
      style={{
        paddingLeft,
        paddingRight: 12,
        background: selecionado ? 'rgba(107,15,26,0.05)' : 'transparent',
        border: 'none',
        borderTop: topBorder ? '1px solid var(--cinza-light)' : 'none',
        cursor: coberto ? 'not-allowed' : 'pointer',
        opacity: coberto ? 0.4 : 1,
      }}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center rounded text-white"
        style={{
          width: 15,
          height: 15,
          background: selecionado ? 'var(--vinho)' : 'var(--cinza-light)',
          fontSize: 9,
        }}
      >
        {selecionado ? '✓' : coberto ? '—' : ''}
      </span>

      <span className="text-xs" style={{ color: coberto ? 'var(--cinza)' : 'var(--preto)' }}>
        {label}
      </span>

      {coberto && (
        <span className="text-xs ml-auto" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>
          já coberto
        </span>
      )}
    </button>
  )
}

// ─── Chips das seleções ativas ────────────────────────────────────────────────

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
        Brasil
      </span>
    )
  }
  // Chips em ordem alfabética
  const ordenados = [...lista].sort((a, b) => labelSelecao(a).localeCompare(labelSelecao(b), 'pt-BR'))
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {ordenados.map(r => (
        <span
          key={r}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}
        >
          {labelSelecao(r)}
          <button
            type="button"
            onClick={() => onRemove(r)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--vinho)', lineHeight: 1 }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
