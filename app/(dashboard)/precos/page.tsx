'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ESTADOS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
]

interface ResultadoItem {
  descricao_item: string
  orgao:          string | null
  estado:         string | null
  municipio:      string | null
  valor_unitario: number
  nome_vencedor:  string | null
  cnpj_vencedor:  string | null
  unidade_medida: string | null
  data_resultado: string | null
  score:          number
}

interface Stats {
  total:   number
  minimo:  number
  maximo:  number
  media:   number
  mediana: number
}

interface BuscaResponse {
  resultados:   ResultadoItem[]
  stats:        Stats | null
  buscasUsadas: number
  maxBuscas:    number
  plano:        string
  error?:       string
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(iso: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score * 100))
  const color = pct >= 60 ? '#16a34a' : pct >= 35 ? '#ca8a04' : '#6b7280'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default function PrecosPage() {
  const router = useRouter()

  const [termo, setTermo]       = useState('')
  const [estado, setEstado]     = useState('')
  const [inicio, setInicio]     = useState('')
  const [fim, setFim]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [resultado, setResultado] = useState<BuscaResponse | null>(null)
  const [buscou, setBuscou]     = useState(false)

  const limiteAtingido = resultado?.error === 'limite_atingido'
  const isBasic = resultado?.plano === 'basic' || (!resultado && false)
  const buscasUsadas = resultado?.buscasUsadas ?? 0
  const maxBuscas    = resultado?.maxBuscas ?? 20

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!termo.trim()) return
    setLoading(true)
    setBuscou(true)
    try {
      const res = await fetch('/api/precos/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo, estado: estado || null, inicio: inicio || null, fim: fim || null }),
      })
      const data: BuscaResponse = await res.json()
      setResultado(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>
              💰 Análise de Preços Vencedores
            </h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.55 }}>
              Saiba quanto o governo pagou de verdade pelo que você vende — e monte propostas que ganham.
            </p>
          </div>
          {resultado && resultado.maxBuscas < 99999 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: buscasUsadas >= maxBuscas ? 'rgba(239,68,68,0.1)' : 'rgba(201,166,90,0.08)',
              border: `1px solid ${buscasUsadas >= maxBuscas ? 'rgba(239,68,68,0.3)' : 'rgba(201,166,90,0.2)'}`,
              borderRadius: 8, padding: '6px 14px', fontSize: 13,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Buscas este mês:</span>
              <span style={{ fontWeight: 700, color: buscasUsadas >= maxBuscas ? '#f87171' : 'var(--dourado)' }}>
                {buscasUsadas}/{maxBuscas}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={buscar}>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        }}>
          {/* Termo principal */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Descrição do item
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                placeholder="Ex: cadeira escritório, notebook i5, tijolo cerâmico 6 furos"
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '10px 14px', color: 'white', fontSize: 15, outline: 'none',
                }}
                required
              />
              <button
                type="submit"
                disabled={loading || !termo.trim()}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  background: loading ? 'rgba(201,166,90,0.3)' : 'var(--dourado)',
                  color: loading ? 'rgba(255,255,255,0.5)' : 'var(--preto)',
                  border: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  opacity: !termo.trim() ? 0.5 : 1,
                }}
              >
                {loading ? 'Buscando…' : 'Buscar preços'}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px', minWidth: 120 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estado
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13, outline: 'none',
                }}
              >
                <option value="">Todos os estados</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 140px', minWidth: 130 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Data inicial
              </label>
              <input
                type="date"
                value={inicio}
                onChange={e => setInicio(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: '1 1 140px', minWidth: 130 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Data final
              </label>
              <input
                type="date"
                value={fim}
                onChange={e => setFim(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Balão de upgrade ao atingir limite */}
      {limiteAtingido && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(107,55,122,0.25), rgba(201,166,90,0.1))',
          border: '1px solid rgba(201,166,90,0.3)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--dourado)', fontSize: 15, marginBottom: 4 }}>
              Limite de {maxBuscas} buscas atingido este mês
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
              Faça upgrade para o Plano Profissional e tenha buscas ilimitadas, filtros avançados e score de competitividade detalhado.
            </div>
          </div>
          <button
            onClick={() => router.push('/assinar?plano=profissional')}
            style={{
              padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 14,
              background: 'var(--dourado)', color: 'var(--preto)', border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Ver planos →
          </button>
        </div>
      )}

      {/* Stats cards */}
      {resultado?.stats && resultado.stats.total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Resultados',  value: resultado.stats.total.toString(),    highlight: false },
            { label: 'Menor valor', value: fmtBRL(resultado.stats.minimo),      highlight: false },
            { label: 'Mediana',     value: fmtBRL(resultado.stats.mediana),     highlight: true  },
            { label: 'Média',       value: fmtBRL(resultado.stats.media),       highlight: false },
            { label: 'Maior valor', value: fmtBRL(resultado.stats.maximo),      highlight: false },
          ].map(card => (
            <div
              key={card.label}
              style={{
                background: card.highlight ? 'linear-gradient(135deg, rgba(107,55,122,0.2), rgba(201,166,90,0.08))' : 'var(--card-bg)',
                border: `1px solid ${card.highlight ? 'rgba(201,166,90,0.25)' : 'var(--card-border)'}`,
                borderRadius: 10, padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: card.highlight ? 'var(--dourado)' : 'white' }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de resultados */}
      {buscou && !loading && resultado && !limiteAtingido && (
        <>
          {resultado.resultados.length === 0 ? (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: 12, padding: '40px 24px', textAlign: 'center',
              color: 'rgba(255,255,255,0.4)', fontSize: 14,
            }}>
              Nenhum resultado encontrado. Tente uma descrição diferente ou mais genérica.
            </div>
          ) : (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', borderBottom: '1px solid var(--card-border)',
              }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {resultado.resultados.length} resultado{resultado.resultados.length !== 1 ? 's' : ''} encontrado{resultado.resultados.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                  Ordenado por relevância
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Descrição', 'Valor unit.', 'Unidade', 'Vencedor', 'Órgão', 'UF', 'Data', 'Relevância'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 11,
                          color: 'rgba(255,255,255,0.4)', fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.resultados.map((r, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.85)', maxWidth: 260, verticalAlign: 'top' }}>
                          <div style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>{r.descricao_item}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--dourado)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                          {fmtBRL(r.valor_unitario)}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                          {r.unidade_medida ?? '—'}
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: 180, verticalAlign: 'top' }}>
                          <div style={{ color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {r.nome_vencedor ?? '—'}
                          </div>
                          {r.cnpj_vencedor && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                              {r.cnpj_vencedor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: 160, verticalAlign: 'top' }}>
                          <div style={{ color: 'rgba(255,255,255,0.5)', wordBreak: 'break-word', lineHeight: 1.3, fontSize: 12 }}>
                            {r.orgao ?? '—'}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                          {r.estado ?? '—'}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                          {fmtData(r.data_resultado)}
                        </td>
                        <td style={{ padding: '10px 14px', verticalAlign: 'top', minWidth: 90 }}>
                          <ScoreBar score={r.score} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aviso Basic */}
              {resultado.plano === 'basic' && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
                  padding: '12px 20px', borderTop: '1px solid rgba(201,166,90,0.15)',
                  background: 'rgba(201,166,90,0.04)',
                }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    Plano Basic: filtros avançados e histórico completo disponíveis no Profissional
                  </span>
                  <button
                    onClick={() => router.push('/assinar?plano=profissional')}
                    style={{
                      padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: 'transparent', border: '1px solid rgba(201,166,90,0.4)',
                      color: 'var(--dourado)',
                    }}
                  >
                    Upgrade →
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state inicial */}
      {!buscou && !loading && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '36px 28px' }}>
          <div style={{ fontSize: 36, marginBottom: 16, textAlign: 'center' }}>🎯</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 8 }}>
            Pare de chutar preço — consulte o que o governo pagou de verdade
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.65, marginBottom: 28 }}>
            Proposta muito alta: você perde. Proposta muito baixa: você perde dinheiro ou é desclassificado por inexequibilidade. A mediana dos preços homologados é a referência que separa quem ganha de quem fica de fora.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { icone: '📋', titulo: 'Historico real', texto: 'Preços homologados no PNCP desde 2021 — não estimativas.' },
              { icone: '📊', titulo: 'Mediana por item', texto: 'Saiba o valor médio praticado e o menor preço que passou.' },
              { icone: '🏆', titulo: 'Quem venceu', texto: 'Veja qual fornecedor ganhou e por qual valor.' },
              { icone: '🔍', titulo: 'Filtro por estado', texto: 'Compare preços por região — variam bastante no Brasil.' },
            ].map(c => (
              <div key={c.titulo} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icone}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{c.titulo}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>{c.texto}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
