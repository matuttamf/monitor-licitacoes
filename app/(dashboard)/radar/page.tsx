'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { ContratoVencendo } from '@/lib/radar/contratos-vencendo'

interface RadarData {
  em30dias:   ContratoVencendo[]
  em60dias:   ContratoVencendo[]
  em90dias:   ContratoVencendo[]
  em180dias:  ContratoVencendo[]
  coletadoEm: string
  totalBruto: number
  termos:     string[]
}

function fmtMoeda(v: number | null): string {
  if (!v) return ''
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}k`
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function fmtData(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

function badgeDias(dias: number) {
  const cor = dias <= 30 ? '#ef4444' : dias <= 60 ? '#f59e0b' : dias <= 90 ? '#10b981' : '#6366f1'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      background: cor + '18', color: cor, border: `1px solid ${cor}30`,
    }}>
      {dias}d
    </span>
  )
}

const FAIXAS = [
  {
    key: 'em30dias' as const,
    urgencia: 'CRÍTICO',
    titulo: 'Vencendo em até 30 dias',
    cor: '#ef4444',
    corBg: 'rgba(239,68,68,0.04)',
    corBorder: 'rgba(239,68,68,0.15)',
    icone: '🚨',
    acao: 'O edital pode sair esta semana. Prepare proposta imediatamente.',
  },
  {
    key: 'em60dias' as const,
    urgencia: 'URGENTE',
    titulo: 'Vencendo em 31–60 dias',
    cor: '#f59e0b',
    corBg: 'rgba(245,158,11,0.04)',
    corBorder: 'rgba(245,158,11,0.15)',
    icone: '⚡',
    acao: 'Edital provável em até 30 dias. Comece a preparar documentação.',
  },
  {
    key: 'em90dias' as const,
    urgencia: 'ATENÇÃO',
    titulo: 'Vencendo em 61–90 dias',
    cor: '#10b981',
    corBg: 'rgba(16,185,129,0.04)',
    corBorder: 'rgba(16,185,129,0.15)',
    icone: '📋',
    acao: 'Moment ideal para contatar o órgão e alinhar especificações.',
  },
  {
    key: 'em180dias' as const,
    urgencia: 'MONITORAR',
    titulo: 'Vencendo em 91–180 dias',
    cor: '#6366f1',
    corBg: 'rgba(99,102,241,0.04)',
    corBorder: 'rgba(99,102,241,0.15)',
    icone: '🔭',
    acao: 'Planeje com antecedência. Nenhum concorrente chegou ainda.',
  },
]

function ContratoCard({ c }: { c: ContratoVencendo }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--cinza-light)',
      borderRadius: 14, padding: '16px 18px',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--preto)', lineHeight: 1.3 }}>{c.orgao}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {badgeDias(c.diasRestantes)}
          {c.estado && <span style={{ fontSize: 10, color: 'var(--cinza)', fontWeight: 600 }}>{c.estado}</span>}
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#555', margin: '0 0 10px', lineHeight: 1.55 }}>
        {c.objeto.substring(0, 220)}{c.objeto.length > 220 ? '…' : ''}
      </p>

      {c.keywords && c.keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {c.keywords.slice(0, 5).map(kw => (
            <span key={kw} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)',
              border: '1px solid rgba(107,15,26,0.15)',
            }}>{kw}</span>
          ))}
          {c.keywords.length > 5 && (
            <span style={{ fontSize: 10, color: 'var(--cinza)', padding: '2px 4px' }}>+{c.keywords.length - 5}</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--cinza)' }}>
            Vence: <strong style={{ color: 'var(--preto)' }}>{fmtData(c.dataVigenciaFim)}</strong>
          </span>
          {c.valor && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>{fmtMoeda(c.valor)}</span>
          )}
        </div>
        <a href={c.url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: 'var(--vinho)', fontWeight: 700, textDecoration: 'none' }}>
          Ver contrato →
        </a>
      </div>
    </div>
  )
}

function FaixaContratos({
  faixa,
  contratos,
}: {
  faixa: typeof FAIXAS[number]
  contratos: ContratoVencendo[]
}) {
  const [aberto, setAberto] = useState(true)
  const totalValor = contratos.reduce((acc, c) => acc + (c.valor ?? 0), 0)

  return (
    <div style={{
      borderRadius: 16,
      border: `1.5px solid ${contratos.length > 0 ? faixa.corBorder : 'var(--cinza-light)'}`,
      background: contratos.length > 0 ? faixa.corBg : 'white',
      overflow: 'hidden',
    }}>
      {/* Cabeçalho da faixa */}
      <button
        onClick={() => setAberto(a => !a)}
        style={{
          width: '100%', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{faixa.icone}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.07em', color: faixa.cor }}>
                {faixa.urgencia}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--preto)' }}>
                {faixa.titulo}
              </span>
            </div>
            {contratos.length > 0 && (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#777' }}>{faixa.acao}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {contratos.length > 0 && (
            <>
              <span style={{ fontSize: 12, fontWeight: 700, color: faixa.cor }}>
                {contratos.length} contrato{contratos.length !== 1 ? 's' : ''}
              </span>
              {totalValor > 0 && (
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                  {fmtMoeda(totalValor)}
                </span>
              )}
            </>
          )}
          <span style={{ fontSize: 14, color: 'var(--cinza)', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </button>

      {aberto && (
        <div style={{ padding: '0 14px 14px' }}>
          {contratos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--cinza)', padding: '8px 4px' }}>
              Nenhum contrato encontrado para suas palavras-chave nesta faixa.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contratos.map((c, i) => <ContratoCard key={i} c={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LockScreen() {
  return (
    <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: 'var(--vinho)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, margin: '0 auto 24px',
      }}>🎯</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--preto)', marginBottom: 12 }}>
        Saiba o que o governo vai comprar antes do edital existir
      </h2>
      <p style={{ fontSize: 14, color: 'var(--cinza)', lineHeight: 1.75, marginBottom: 8 }}>
        O Radar monitora os contratos ativos do setor público e identifica os que vencem em 30, 60, 90 e 180 dias.
      </p>
      <p style={{ fontSize: 14, color: 'var(--cinza)', lineHeight: 1.75, marginBottom: 28 }}>
        Todo contrato que vence vai a licitação. Se você souber com 90 dias de antecedência, chega preparado enquanto seu concorrente ainda nem sabe que o edital vai abrir.
      </p>
      <Link href="/assinar?from=painel" style={{
        display: 'inline-block', background: 'var(--vinho)', color: 'white',
        textDecoration: 'none', fontWeight: 700, fontSize: 14,
        padding: '13px 32px', borderRadius: 12,
      }}>
        Ativar Radar de Inteligência →
      </Link>
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--cinza)' }}>Disponível nos planos Profissional, Gestão e Empresarial.</p>
    </div>
  )
}

export default function RadarPage() {
  const [data,    setData]    = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bloq,    setBloq]    = useState(false)
  const [filtro,  setFiltro]  = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/radar')
      if (res.status === 403) { setBloq(true); return }
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (bloq) return <LockScreen />

  function filtrar<T extends { objeto: string; orgao: string }>(lista: T[]): T[] {
    if (!filtro.trim()) return lista
    const q = filtro.toLowerCase()
    return lista.filter(c => c.objeto.toLowerCase().includes(q) || c.orgao.toLowerCase().includes(q))
  }

  const totalContratos = data
    ? filtrar(data.em30dias).length + filtrar(data.em60dias).length +
      filtrar(data.em90dias).length + filtrar(data.em180dias ?? []).length
    : 0

  const totalValorGeral = data
    ? [...data.em30dias, ...data.em60dias, ...data.em90dias, ...(data.em180dias ?? [])]
        .reduce((acc, c) => acc + (c.valor ?? 0), 0)
    : 0

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--preto)', margin: '0 0 4px' }}>
          🎯 Radar de Inteligência
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--cinza)', lineHeight: 1.5 }}>
          Contratos públicos vencendo em breve — todo contrato que vence vai a licitação.{' '}
          <strong style={{ color: 'var(--preto)' }}>Chegue preparado antes que o edital abra.</strong>
        </p>
      </div>

      {/* Cards de resumo */}
      {!loading && data && totalContratos > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Contratos monitorados', valor: String(totalContratos), cor: 'var(--preto)' },
            { label: 'Críticos (≤30 dias)', valor: String(filtrar(data.em30dias).length), cor: '#ef4444' },
            { label: 'Urgentes (≤60 dias)', valor: String(filtrar(data.em60dias).length), cor: '#f59e0b' },
            { label: 'Valor em jogo', valor: totalValorGeral > 0 ? fmtMoeda(totalValorGeral) : '—', cor: '#059669' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'white', border: '1px solid var(--cinza-light)',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--cinza)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c.cor }}>{c.valor}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtro + Atualizar na mesma linha */}
      {!loading && data && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <input
            type="text"
            placeholder="Filtrar por objeto ou órgão…"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: 10,
              border: '1px solid var(--cinza-light)', fontSize: 13, color: 'var(--preto)',
              background: 'white', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button onClick={carregar}
            style={{
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'white', border: '1px solid var(--cinza-light)', color: 'var(--cinza)',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
            ↺ Atualizar
          </button>
        </div>
      )}
      {!loading && data && data.termos.length > 0 && (
        <p style={{ fontSize: 11, color: 'var(--cinza)', marginTop: -12, marginBottom: 16 }}>
          Filtrado pelas suas {data.termos.length} palavras-chave.
          {totalContratos === 0 ? ' Nenhum contrato relevante neste momento — o Radar atualiza diariamente.' : ''}
        </p>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--cinza)', fontSize: 14 }}>
          Buscando contratos vencendo…
        </div>
      )}

      {!loading && !data && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#ef4444', fontSize: 14 }}>
          Erro ao carregar. Tente novamente.
        </div>
      )}

      {!loading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAIXAS.map(faixa => (
            <FaixaContratos
              key={faixa.key}
              faixa={faixa}
              contratos={filtrar(data[faixa.key] ?? [])}
            />
          ))}

          {/* Banner de como usar */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(107,15,26,0.04), rgba(201,166,90,0.06))',
            border: '1px solid rgba(201,166,90,0.2)',
            borderRadius: 14, padding: '16px 20px',
          }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--preto)', marginBottom: 8 }}>
              💡 Como usar o Radar para ganhar contratos
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { tempo: '≤ 30 dias', cor: '#ef4444', dica: 'Monte a proposta agora. O edital pode abrir esta semana.' },
                { tempo: '31–60 dias', cor: '#f59e0b', dica: 'Organize certidões e documentação. Tempo curto.' },
                { tempo: '61–90 dias', cor: '#10b981', dica: 'Contate o órgão. Entenda as especificações antes de todo mundo.' },
                { tempo: '91–180 dias', cor: '#6366f1', dica: 'Pesquise preços, ajuste margens e trace estratégia.' },
              ].map(d => (
                <div key={d.tempo} style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 3, borderRadius: 4, background: d.cor, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: d.cor, marginBottom: 2 }}>{d.tempo}</div>
                    <div style={{ fontSize: 12, color: 'var(--cinza)', lineHeight: 1.45 }}>{d.dica}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--cinza)', textAlign: 'center', paddingBottom: 4 }}>
            {data.coletadoEm
              ? `Atualizado em ${new Date(data.coletadoEm).toLocaleString('pt-BR')}`
              : 'Cache ainda não populado — acione o Radar no painel Admin'}
          </p>
        </div>
      )}
    </div>
  )
}
