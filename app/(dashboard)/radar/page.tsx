'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { ContratoVencendo } from '@/lib/radar/contratos-vencendo'

interface RadarData {
  em30dias:   ContratoVencendo[]
  em60dias:   ContratoVencendo[]
  em90dias:   ContratoVencendo[]
  coletadoEm: string
  totalBruto: number
  termos:     string[]
}

function fmtMoeda(v: number | null): string {
  if (!v) return '—'
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function fmtData(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

function badgeDias(dias: number) {
  const cor = dias <= 30 ? '#ef4444' : dias <= 60 ? '#f59e0b' : '#10b981'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      background: cor + '18',
      color: cor,
      border: `1px solid ${cor}30`,
    }}>
      {dias}d
    </span>
  )
}

function TabelaContratos({ titulo, contratos, cor }: { titulo: string; contratos: ContratoVencendo[]; cor: string }) {
  if (contratos.length === 0) return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>{titulo}</h2>
      <p style={{ fontSize: 13, color: 'var(--cinza)' }}>Nenhum contrato encontrado para suas palavras-chave nesta faixa.</p>
    </div>
  )

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>{titulo}</h2>
        <span style={{ fontSize: 12, fontWeight: 700, color: cor }}>{contratos.length} contrato{contratos.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-3">
        {contratos.map((c, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--preto)' }}>{c.orgao}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {badgeDias(c.diasRestantes)}
                {c.estado && <span style={{ fontSize: 10, color: 'var(--cinza)', fontWeight: 600 }}>{c.estado}</span>}
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--cinza)', margin: '4px 0', lineHeight: 1.5 }}>{c.objeto.substring(0, 200)}{c.objeto.length > 200 ? '…' : ''}</p>
            {c.keywords && c.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {c.keywords.slice(0, 4).map(kw => (
                  <span key={kw} style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
                    background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)',
                    border: '1px solid rgba(107,15,26,0.15)',
                  }}>{kw}</span>
                ))}
                {c.keywords.length > 4 && (
                  <span style={{ fontSize: 10, color: 'var(--cinza)', padding: '2px 4px' }}>+{c.keywords.length - 4}</span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 11, color: 'var(--cinza)' }}>Vence: <strong>{fmtData(c.dataVigenciaFim)}</strong></span>
                {c.valor && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{fmtMoeda(c.valor)}</span>}
              </div>
              <a href={c.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--vinho)', fontWeight: 700, textDecoration: 'none' }}>
                Ver contrato →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LockScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: 'var(--vinho)', color: 'var(--dourado)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 24,
      }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--preto)', marginBottom: 12 }}>
        Radar de Inteligência
      </h2>
      <p style={{ fontSize: 14, color: 'var(--cinza)', maxWidth: 460, lineHeight: 1.7, marginBottom: 28 }}>
        Identifique contratos vencendo nos próximos 30/60/90 dias, ATAs abertas para adesão
        e oportunidades que seus concorrentes ainda não viram. Disponível nos planos Pro e Empresarial.
      </p>
      <Link href="/assinar?from=painel"
        style={{
          display: 'inline-block', background: 'var(--vinho)', color: 'white',
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
          padding: '13px 28px', borderRadius: 12,
        }}>
        Fazer upgrade →
      </Link>
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
      if (!res.ok) throw new Error('Erro ao carregar')
      setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (bloq) return <LockScreen />

  function filtrarPorTexto<T extends { objeto: string; orgao: string }>(lista: T[]): T[] {
    if (!filtro.trim()) return lista
    const q = filtro.toLowerCase()
    return lista.filter(c => c.objeto.toLowerCase().includes(q) || c.orgao.toLowerCase().includes(q))
  }

  const total = data
    ? filtrarPorTexto(data.em30dias).length +
      filtrarPorTexto(data.em60dias).length +
      filtrarPorTexto(data.em90dias).length
    : 0

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>
            🎯 Radar de Inteligência
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>
            Contratos públicos vencendo em breve — oportunidades de renovação e adesão
          </p>
        </div>
        <button onClick={carregar}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'white', border: '1px solid var(--cinza-light)', color: 'var(--cinza)', cursor: 'pointer' }}>
          ↺ Atualizar
        </button>
      </div>

      {/* Filtro livre */}
      {!loading && data && (
        <div className="mb-5">
          <input
            type="text"
            placeholder="Filtrar por objeto ou órgão…"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{
              width: '100%', maxWidth: 480, padding: '10px 14px', borderRadius: 10,
              border: '1px solid var(--cinza-light)', fontSize: 14, color: 'var(--preto)',
              background: 'white', outline: 'none',
            }}
          />
          {data.termos.length > 0 && !filtro && (
            <p style={{ fontSize: 12, color: 'var(--cinza)', marginTop: 6 }}>
              Filtrado pelas suas {data.termos.length} palavra{data.termos.length !== 1 ? 's' : ''}-chave.
              {total === 0 ? ' Nenhum contrato relevante encontrado desta vez.' : ''}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div style={{ color: 'var(--cinza)', fontSize: 14 }}>Buscando contratos vencendo…</div>
        </div>
      )}

      {!loading && !data && (
        <div className="flex items-center justify-center h-64">
          <div style={{ color: '#ef4444', fontSize: 14 }}>Erro ao carregar dados. Tente novamente.</div>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-5">
          <TabelaContratos
            titulo="⚠️ Vencendo em até 30 dias"
            contratos={filtrarPorTexto(data.em30dias)}
            cor="#ef4444"
          />
          <TabelaContratos
            titulo="📅 Vencendo em 31–60 dias"
            contratos={filtrarPorTexto(data.em60dias)}
            cor="#f59e0b"
          />
          <TabelaContratos
            titulo="📆 Vencendo em 61–90 dias"
            contratos={filtrarPorTexto(data.em90dias)}
            cor="#10b981"
          />

          <p style={{ fontSize: 11, color: 'var(--cinza)', textAlign: 'center', paddingBottom: 8 }}>
            {data.coletadoEm
              ? `Dados do cache · atualizado em ${new Date(data.coletadoEm).toLocaleString('pt-BR')}`
              : 'Cache ainda não populado — acione o Radar no painel Admin'}
          </p>
        </div>
      )}
    </div>
  )
}
