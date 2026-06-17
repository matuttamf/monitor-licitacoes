'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'

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
  cnpj_orgao:     string | null
  ano_compra:     number | null
  seq_compra:     number | null
  fonte:          string | null
}

interface Stats {
  total:   number
  minimo:  number
  maximo:  number
  media:   number
  mediana: number
}

interface PrecoMercado {
  media:  number | null
  minimo: number | null
  total:  number
}

interface BuscaResponse {
  resultados:   ResultadoItem[]
  stats:        Stats | null
  statsLabel:   string | null
  precoMercado: PrecoMercado | null
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

function fmtCnpj(s: string) {
  return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function pncpLink(r: ResultadoItem): string | null {
  if (!r.cnpj_orgao || !r.ano_compra || !r.seq_compra) return null
  return `https://pncp.gov.br/app/contratos/${r.cnpj_orgao}/${r.ano_compra}/${r.seq_compra}`
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score * 100))
  const color = pct >= 60 ? '#16a34a' : pct >= 35 ? '#ca8a04' : '#9ca3af'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 70 }}>
      <div style={{ flex: 1, height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, color: '#9ca3af', width: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default function PrecosPage() {
  const router = useRouter()

  const [termo, setTermo]         = useState('')
  const [estado, setEstado]       = useState('')
  const [inicio, setInicio]       = useState('')
  const [fim, setFim]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [resultado, setResultado] = useState<BuscaResponse | null>(null)
  const [buscou, setBuscou]       = useState(false)

  const limiteAtingido       = resultado?.error === 'limite_atingido'
  const limiteDiarioAtingido = resultado?.error === 'limite_diario_atingido'
  const buscasUsadas         = resultado?.buscasUsadas ?? 0
  const maxBuscas            = resultado?.maxBuscas ?? 20

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
      if (!data.error) analytics.busca(termo)
    } finally {
      setLoading(false)
    }
  }

  const stats        = resultado?.stats
  const statsLabel   = resultado?.statsLabel ?? null
  const precoMercado = resultado?.precoMercado

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--preto)', margin: 0 }}>
              💰 Análise de Preços Vencedores
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--cinza)', fontSize: 13, lineHeight: 1.55 }}>
              Saiba quanto o governo pagou de verdade pelo que você vende — e monte propostas que ganham.
            </p>
          </div>
          {resultado && resultado.maxBuscas < 99999 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: buscasUsadas >= maxBuscas ? 'rgba(239,68,68,0.07)' : 'rgba(201,166,90,0.08)',
              border: `1px solid ${buscasUsadas >= maxBuscas ? 'rgba(239,68,68,0.25)' : 'rgba(201,166,90,0.25)'}`,
              borderRadius: 8, padding: '6px 14px', fontSize: 13,
            }}>
              <span style={{ color: 'var(--cinza)' }}>Buscas este mês:</span>
              <span style={{ fontWeight: 700, color: buscasUsadas >= maxBuscas ? '#dc2626' : '#92610a' }}>
                {buscasUsadas}/{maxBuscas}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={buscar}>
        <div style={{
          background: 'white', border: '1px solid var(--cinza-light)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 20,
        }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--cinza)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Descrição do item
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                placeholder="Ex: cadeira escritório, notebook i5, tijolo cerâmico 6 furos"
                style={{
                  flex: 1, background: 'var(--fundo)', border: '1.5px solid var(--cinza-light)',
                  borderRadius: 10, padding: '10px 14px', color: 'var(--preto)', fontSize: 14, outline: 'none',
                }}
                required
              />
              <button
                type="submit"
                disabled={loading || !termo.trim()}
                style={{
                  padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  background: !termo.trim() || loading ? 'var(--cinza-light)' : 'var(--vinho)',
                  color: !termo.trim() || loading ? 'var(--cinza)' : 'white',
                  border: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {loading ? 'Buscando…' : 'Buscar preços'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Estado', value: estado, onChange: (v: string) => setEstado(v), isSelect: true },
              { label: 'Data inicial', value: inicio, onChange: (v: string) => setInicio(v), type: 'date' },
              { label: 'Data final',   value: fim,    onChange: (v: string) => setFim(v),    type: 'date' },
            ].map(f => (
              <div key={f.label} style={{ flex: '1 1 130px', minWidth: 120 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--cinza)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {f.label}
                </label>
                {f.isSelect ? (
                  <select
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--fundo)', border: '1.5px solid var(--cinza-light)',
                      borderRadius: 8, padding: '8px 10px', color: 'var(--preto)', fontSize: 13, outline: 'none',
                    }}
                  >
                    <option value="">Todos os estados</option>
                    {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--fundo)', border: '1.5px solid var(--cinza-light)',
                      borderRadius: 8, padding: '8px 10px', color: 'var(--preto)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Limites */}
      {limiteDiarioAtingido && (
        <div style={{
          background: 'rgba(107,15,26,0.06)', border: '1.5px solid rgba(107,15,26,0.2)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--vinho)', fontSize: 15, marginBottom: 4 }}>
              Limite de 10 buscas diárias atingido
            </div>
            <div style={{ color: 'var(--cinza)', fontSize: 13 }}>
              {resultado?.plano === 'trial' ? 'Assine um plano para continuar pesquisando hoje.' : 'Faça upgrade para o Plano Profissional e tenha buscas ilimitadas.'}
            </div>
          </div>
          <button onClick={() => { const dest = resultado?.plano === 'trial' ? '/assinar' : '/assinar?plano=profissional'; analytics.upsellClicado('limite_diario', dest); router.push(dest) }}
            style={{ padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 14, background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {resultado?.plano === 'trial' ? 'Ver planos →' : 'Fazer upgrade →'}
          </button>
        </div>
      )}
      {limiteAtingido && (
        <div style={{
          background: 'rgba(201,166,90,0.07)', border: '1.5px solid rgba(201,166,90,0.3)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#92610a', fontSize: 15, marginBottom: 4 }}>
              Limite de {maxBuscas} buscas atingido este mês
            </div>
            <div style={{ color: 'var(--cinza)', fontSize: 13 }}>Faça upgrade para o Plano Profissional e tenha buscas ilimitadas.</div>
          </div>
          <button onClick={() => router.push('/assinar?plano=profissional')}
            style={{ padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 14, background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Ver planos →
          </button>
        </div>
      )}

      {/* ── PAINEL DE COMPARATIVOS ─────────────────────────────────────────── */}
      {stats && Number(stats.total) > 0 && (
        <div style={{
          background: 'white', border: '1px solid var(--cinza-light)',
          borderRadius: 14, padding: '18px 20px', marginBottom: 16,
        }}>
          {/* Badge de período */}
          {statsLabel && (
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: statsLabel.startsWith('Últimos') ? 'rgba(22,163,74,0.08)' : 'rgba(107,15,26,0.06)',
                border: `1px solid ${statsLabel.startsWith('Últimos') ? 'rgba(22,163,74,0.25)' : 'rgba(107,15,26,0.15)'}`,
                borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                color: statsLabel.startsWith('Últimos') ? '#15803d' : 'var(--vinho)',
              }}>
                {statsLabel.startsWith('Últimos') ? '📅' : '📚'} {statsLabel}
              </span>
              {!statsLabel.startsWith('Últimos') && (
                <span style={{ fontSize: 11, color: 'var(--cinza)' }}>
                  — poucos resultados nos últimos 12 meses, usando histórico completo
                </span>
              )}
            </div>
          )}

          {/* Cards de preço */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {[
              { label: 'P10 (base)',      value: fmtBRL(stats.minimo),  sub: '10% dos contratos abaixo', destaque: false, cor: '#15803d' },
              { label: 'Mediana',         value: fmtBRL(stats.mediana), sub: 'referência principal',      destaque: true,  cor: 'var(--vinho)' },
              { label: 'Média P25–P75',   value: fmtBRL(stats.media),   sub: 'sem extremos',              destaque: false, cor: 'var(--preto)' },
              { label: 'P90 (teto)',      value: fmtBRL(stats.maximo),  sub: '10% dos contratos acima',   destaque: false, cor: '#b91c1c' },
            ].map(card => (
              <div key={card.label} style={{
                background: card.destaque ? 'rgba(107,15,26,0.04)' : 'var(--fundo)',
                border: `1.5px solid ${card.destaque ? 'rgba(107,15,26,0.18)' : 'var(--cinza-light)'}`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 10, color: 'var(--cinza)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontWeight: 600 }}>{card.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: card.cor }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 3 }}>{card.sub}</div>}
              </div>
            ))}

            {/* Card de mercado (Mercado Livre) */}
            {precoMercado?.media && (
              <div style={{
                background: 'rgba(59,130,246,0.04)',
                border: '1.5px solid rgba(59,130,246,0.2)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 10, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontWeight: 600 }}>
                  Mercado Livre
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>{fmtBRL(precoMercado.media)}</div>
                <div style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 3 }}>
                  mín. {fmtBRL(precoMercado.minimo!)} · {precoMercado.total} produtos
                </div>
              </div>
            )}
          </div>

          {/* Nota metodológica */}
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--cinza)', lineHeight: 1.5 }}>
            ⚠️ Valores representam contratos homologados — alguns podem incluir múltiplas unidades (ex: aquisição de 50 notebooks gera um único contrato). A <strong>Média P25–P75</strong> e os percentis <strong>P10/P90</strong> excluem os 10% mais baratos e 10% mais caros para reduzir distorções. A <strong>mediana</strong> é calculada sobre todos os {stats.total} contratos encontrados.
          </div>

          {/* Comparativo governo vs mercado */}
          {precoMercado?.media && (() => {
            const diff = ((stats.mediana - precoMercado.media!) / precoMercado.media!) * 100
            const acima = diff > 0
            return (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: acima ? 'rgba(185,28,28,0.04)' : 'rgba(21,128,61,0.04)',
                border: `1px solid ${acima ? 'rgba(185,28,28,0.15)' : 'rgba(21,128,61,0.15)'}`,
                borderRadius: 8, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
              }}>
                <span style={{ color: acima ? '#b91c1c' : '#15803d', fontWeight: 700 }}>
                  {acima ? '▲' : '▼'} Mediana governo {Math.abs(diff).toFixed(1)}% {acima ? 'acima' : 'abaixo'} da média do Mercado Livre
                </span>
                <span style={{ fontSize: 11, color: 'var(--cinza)' }}>
                  Fonte: Mercado Livre (produtos novos) · referência, não base legal
                </span>
              </div>
            )
          })()}
        </div>
      )}

      {/* Tabela de resultados */}
      {buscou && !loading && resultado && !limiteAtingido && (
        <>
          {resultado.resultados.length === 0 ? (
            <div style={{
              background: 'white', border: '1px solid var(--cinza-light)',
              borderRadius: 12, padding: '40px 24px', textAlign: 'center',
              color: 'var(--cinza)', fontSize: 14,
            }}>
              Nenhum resultado encontrado. Tente uma descrição diferente ou mais genérica.
            </div>
          ) : (
            <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', borderBottom: '1px solid var(--cinza-light)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--preto)', fontWeight: 700 }}>
                  {resultado.resultados.length} resultado{resultado.resultados.length !== 1 ? 's' : ''} encontrado{resultado.resultados.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 12, color: 'var(--cinza)' }}>Ordenado por relevância</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--fundo)' }}>
                      {['Descrição', 'Valor unit.', 'Fornecedor', 'Órgão', 'UF', 'Data', 'Rel.'].map(h => (
                        <th key={h} style={{
                          padding: '9px 14px', textAlign: 'left', fontSize: 11,
                          color: 'var(--cinza)', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          borderBottom: '1px solid var(--cinza-light)', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.resultados.map((r, i) => {
                      const link = pncpLink(r)
                      return (
                        <tr
                          key={i}
                          style={{ borderBottom: '1px solid var(--cinza-light)', transition: 'background 0.1s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--fundo)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Descrição — mais larga */}
                          <td style={{ padding: '10px 14px', maxWidth: 300, minWidth: 200, verticalAlign: 'top' }}>
                            <div style={{ lineHeight: 1.45, wordBreak: 'break-word', fontSize: 12, color: 'var(--preto)' }}>
                              {r.descricao_item}
                            </div>
                            {link && (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4, fontSize: 10, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                              >
                                🔗 Ver no PNCP
                              </a>
                            )}
                          </td>

                          {/* Valor */}
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--vinho)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                            {fmtBRL(r.valor_unitario)}
                          </td>

                          {/* Fornecedor */}
                          <td style={{ padding: '10px 14px', maxWidth: 180, minWidth: 140, verticalAlign: 'top' }}>
                            <div style={{ color: 'var(--preto)', wordBreak: 'break-word', lineHeight: 1.35, fontSize: 12 }}>
                              {r.nome_vencedor ?? '—'}
                            </div>
                            {r.cnpj_vencedor && (
                              <div style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 2 }}>
                                {fmtCnpj(r.cnpj_vencedor)}
                              </div>
                            )}
                          </td>

                          {/* Órgão — mais largo */}
                          <td style={{ padding: '10px 14px', maxWidth: 220, minWidth: 160, verticalAlign: 'top' }}>
                            <div style={{ color: 'var(--cinza)', wordBreak: 'break-word', lineHeight: 1.35, fontSize: 12 }}>
                              {r.orgao ?? '—'}
                            </div>
                            {r.municipio && (
                              <div style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 2, opacity: 0.8 }}>
                                {r.municipio}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '10px 14px', color: 'var(--cinza)', whiteSpace: 'nowrap', verticalAlign: 'top', fontSize: 12 }}>
                            {r.estado ?? '—'}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--cinza)', whiteSpace: 'nowrap', verticalAlign: 'top', fontSize: 12 }}>
                            {fmtData(r.data_resultado)}
                          </td>
                          <td style={{ padding: '10px 14px', verticalAlign: 'top', minWidth: 80 }}>
                            <ScoreBar score={r.score} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {resultado.plano === 'basic' && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
                  padding: '12px 20px', borderTop: '1px solid var(--cinza-light)',
                  background: 'rgba(201,166,90,0.04)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--cinza)' }}>
                    Plano Basic · Upgrade para buscas ilimitadas e histórico completo
                  </span>
                  <button onClick={() => router.push('/assinar?plano=profissional')}
                    style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--vinho)', color: 'white', border: 'none' }}>
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
            <div key={i} style={{
              height: 52, borderRadius: 8, background: 'var(--cinza-light)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!buscou && !loading && (
        <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '36px 28px' }}>
          <div style={{ fontSize: 36, marginBottom: 16, textAlign: 'center' }}>🎯</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--preto)', textAlign: 'center', marginBottom: 8 }}>
            Pare de chutar preço — consulte o que o governo pagou de verdade
          </p>
          <p style={{ fontSize: 13, color: 'var(--cinza)', textAlign: 'center', lineHeight: 1.65, marginBottom: 28 }}>
            Proposta alta: você perde. Proposta baixa: desclassificado por inexequibilidade. A mediana dos preços homologados é a referência que separa quem ganha de quem fica de fora.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { icone: '📋', titulo: 'Histórico real',      texto: 'Preços homologados no PNCP e Transparência desde 2021.' },
              { icone: '📊', titulo: 'Mediana por item',    texto: 'O valor médio praticado e o menor preço que passou.' },
              { icone: '🛒', titulo: 'Preço de mercado',    texto: 'Comparativo com Mercado Livre para calibrar a proposta.' },
              { icone: '🔍', titulo: 'Filtro por estado',   texto: 'Compare preços por região — variam bastante no Brasil.' },
            ].map(c => (
              <div key={c.titulo} style={{
                background: 'var(--fundo)', borderRadius: 10,
                padding: '14px 16px', border: '1px solid var(--cinza-light)',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icone}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--preto)', marginBottom: 4 }}>{c.titulo}</div>
                <div style={{ fontSize: 11, color: 'var(--cinza)', lineHeight: 1.55 }}>{c.texto}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
