'use client'

import { useEffect, useState, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Dado = { [key: string]: string | number }

type IntelData = {
  totais: {
    licitacoes: number
    leads: number
    licitacoes7d: number
    licitacoesHoje: number
  }
  porEstado:      { uf: string; total: number }[]
  porFonte:       { fonte: string; total: number }[]
  timeline30d:    { data: string; total: number }[]
  topOrgaos:      { orgao: string; total: number }[]
  porValor:       { ate10k: number; ate100k: number; ate1m: number; ate10m: number; acima10m: number }
  leadsSegmento:  { segmento: string; total: number }[]
  leadsUF:        { uf: string; total: number }[]
  leadsStatus:    Record<string, number>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number) { return n.toLocaleString('pt-BR') }
function fmtData(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function BarraH({ label, value, max, cor = 'var(--vinho)', sublabel }: {
  label: string; value: number; max: number; cor?: string; sublabel?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div style={{ width: 100, fontSize: 11, color: 'var(--preto)', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        title={label}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--cinza-light)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ width: 52, fontSize: 11, color: 'var(--cinza)', textAlign: 'right', flexShrink: 0 }}>
        {sublabel ?? fmtNum(value)}
      </div>
    </div>
  )
}

function KPI({ label, value, sub, cor = 'var(--vinho)' }: { label: string; value: number | string; sub?: string; cor?: string }) {
  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: cor, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {typeof value === 'number' ? fmtNum(value) : value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--preto)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function InteligenciaPage() {
  const [data, setData]       = useState<IntelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro]       = useState('')

  const carregar = useCallback(async () => {
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/admin/inteligencia')
      if (!res.ok) throw new Error('Erro ao carregar dados')
      setData(await res.json())
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div style={{ color: 'var(--cinza)', fontSize: 14 }}>Carregando inteligência de mercado…</div>
    </div>
  )

  if (erro || !data) return (
    <div className="flex items-center justify-center h-64">
      <div style={{ color: '#ef4444', fontSize: 14 }}>{erro || 'Sem dados'}</div>
    </div>
  )

  const maxEstado   = data.porEstado[0]?.total ?? 1
  const maxFonte    = data.porFonte[0]?.total ?? 1
  const maxOrgao    = data.topOrgaos[0]?.total ?? 1
  const maxSegmento = data.leadsSegmento[0]?.total ?? 1
  const maxLeadsUF  = data.leadsUF[0]?.total ?? 1
  const maxTimeline = Math.max(...data.timeline30d.map(d => d.total), 1)

  const faixasValor = [
    { label: 'Até R$ 10k',   value: data.porValor.ate10k,   cor: '#10b981' },
    { label: 'R$ 10k–100k',  value: data.porValor.ate100k,  cor: '#3b82f6' },
    { label: 'R$ 100k–1M',   value: data.porValor.ate1m,    cor: '#C9A65A' },
    { label: 'R$ 1M–10M',    value: data.porValor.ate10m,   cor: '#f59e0b' },
    { label: 'Acima R$ 10M', value: data.porValor.acima10m, cor: '#6B0F1A' },
  ]
  const maxValor = Math.max(...faixasValor.map(f => f.value), 1)

  const coresSegmento: Record<string, string> = {
    construção: '#6B0F1A', tecnologia: '#3b82f6', saúde: '#10b981',
    limpeza: '#f59e0b', segurança: '#8b5cf6', transporte: '#06b6d4',
    alimentação: '#f97316', consultoria: '#84cc16', educação: '#ec4899',
    manutenção: '#C9A65A', jardinagem: '#22c55e', gráfica: '#6366f1',
    outros: '#9ca3af',
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>Inteligência de Mercado</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>
            Visão consolidada de licitações coletadas e leads captados
          </p>
        </div>
        <button onClick={carregar}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'white', border: '1px solid var(--cinza-light)', color: 'var(--cinza)', cursor: 'pointer' }}>
          ↺ Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <KPI label="Licitações na base"    value={data.totais.licitacoes}     sub="total acumulado"       cor="var(--vinho)" />
        <KPI label="Coletadas hoje"        value={data.totais.licitacoesHoje}  sub="nas últimas 24h"       cor="#10b981" />
        <KPI label="Coletadas (7 dias)"    value={data.totais.licitacoes7d}    sub="últimos 7 dias"        cor="#3b82f6" />
        <KPI label="Leads captados"        value={data.totais.leads}           sub="empresas na base"      cor="#C9A65A" />
        <KPI label="Leads pendentes"       value={data.leadsStatus['pendente'] ?? 0} sub="aguardando e-mail" cor="#f59e0b" />
        <KPI label="E-mails enviados"      value={data.leadsStatus['enviado']  ?? 0} sub="captação"          cor="#8b5cf6" />
      </div>

      {/* Timeline 30 dias */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
          📈 Coleta diária — últimos 30 dias
        </h2>
        <div className="flex items-end gap-0.5" style={{ height: 80 }}>
          {data.timeline30d.map(({ data: dia, total }) => {
            const h = maxTimeline > 0 ? Math.max(2, Math.round((total / maxTimeline) * 80)) : 2
            const isHoje = dia === new Date().toISOString().slice(0, 10)
            return (
              <div key={dia} className="flex-1 flex flex-col items-center group relative" style={{ minWidth: 0 }}>
                <div
                  title={`${fmtData(dia)}: ${fmtNum(total)}`}
                  style={{ width: '100%', height: h, background: isHoje ? '#10b981' : 'var(--vinho)', borderRadius: '2px 2px 0 0', opacity: total === 0 ? 0.15 : 0.85, cursor: 'default' }}
                />
                {/* Tooltip label a cada 5 dias */}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span style={{ fontSize: 10, color: 'var(--cinza)' }}>{fmtData(data.timeline30d[0]?.data ?? '')}</span>
          <span style={{ fontSize: 10, color: 'var(--cinza)' }}>Hoje</span>
        </div>
      </div>

      {/* Dois painéis lado a lado: Estado + Fonte */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>

        {/* Por estado */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
            🗺️ Licitações por estado
          </h2>
          {data.porEstado.length === 0
            ? <p style={{ color: 'var(--cinza)', fontSize: 13 }}>Sem dados ainda</p>
            : data.porEstado.map(({ uf, total }) => (
              <BarraH key={uf} label={uf} value={total} max={maxEstado} cor="var(--vinho)" />
            ))}
        </div>

        {/* Por fonte */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
            🔌 Licitações por fonte
          </h2>
          {data.porFonte.length === 0
            ? <p style={{ color: 'var(--cinza)', fontSize: 13 }}>Sem dados ainda</p>
            : data.porFonte.map(({ fonte, total }) => (
              <BarraH key={fonte} label={fonte} value={total} max={maxFonte} cor="#3b82f6" />
            ))}
        </div>
      </div>

      {/* Top órgãos */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
          🏛️ Top 10 órgãos contratantes
        </h2>
        {data.topOrgaos.length === 0
          ? <p style={{ color: 'var(--cinza)', fontSize: 13 }}>Sem dados ainda</p>
          : (
            <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {data.topOrgaos.map(({ orgao, total }, i) => (
                <div key={orgao} className="flex items-center gap-3 py-1.5">
                  <span style={{ fontSize: 10, width: 16, color: 'var(--cinza)', fontWeight: 700, flexShrink: 0 }}>#{i+1}</span>
                  <div style={{ flex: 1, fontSize: 11, color: 'var(--preto)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={orgao}>{orgao}</div>
                  <div style={{ height: 6, width: 80, background: 'var(--cinza-light)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ width: `${Math.round((total / maxOrgao) * 100)}%`, height: '100%', background: '#C9A65A', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--cinza)', width: 40, textAlign: 'right', flexShrink: 0 }}>{fmtNum(total)}</span>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Distribuição de valores + Leads segmento */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Faixas de valor */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
            💰 Distribuição por valor estimado
          </h2>
          {faixasValor.map(({ label, value, cor }) => (
            <BarraH key={label} label={label} value={value} max={maxValor} cor={cor} />
          ))}
          <p style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 8 }}>
            * Apenas licitações com valor informado
          </p>
        </div>

        {/* Leads por segmento */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
            🏷️ Leads por segmento (CNAE)
          </h2>
          {data.leadsSegmento.length === 0
            ? <p style={{ color: 'var(--cinza)', fontSize: 13 }}>Sem leads ainda</p>
            : data.leadsSegmento.map(({ segmento, total }) => (
              <BarraH key={segmento} label={segmento} value={total} max={maxSegmento}
                cor={coresSegmento[segmento] ?? '#9ca3af'} />
            ))}
        </div>
      </div>

      {/* Leads por UF */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
          📍 Leads por estado (top 15)
        </h2>
        {data.leadsUF.length === 0
          ? <p style={{ color: 'var(--cinza)', fontSize: 13 }}>Sem leads ainda</p>
          : (
            <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {data.leadsUF.map(({ uf, total }) => (
                <BarraH key={uf} label={uf} value={total} max={maxLeadsUF} cor="#8b5cf6" />
              ))}
            </div>
          )}
      </div>

      {/* Status leads */}
      <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
          📊 Pipeline de captação
        </h2>
        <div className="flex gap-3 flex-wrap">
          {([
            { key: 'pendente',      label: 'Pendentes',       cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)'  },
            { key: 'enviado',       label: 'E-mails enviados', cor: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { key: 'erro',          label: 'Com erro',         cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
            { key: 'invalido',      label: 'Inválidos',        cor: '#9ca3af', bg: 'rgba(156,163,175,0.1)'},
            { key: 'descadastrado', label: 'Descadastrados',   cor: '#6b7280', bg: 'rgba(107,114,128,0.1)'},
          ] as const).map(({ key, label, cor, bg }) => (
            <div key={key} className="rounded-xl px-4 py-3 flex flex-col"
              style={{ background: bg, border: `1px solid ${cor}30`, minWidth: 110 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: cor }}>
                {fmtNum(data.leadsStatus[key] ?? 0)}
              </span>
              <span style={{ fontSize: 11, color: cor, fontWeight: 600, marginTop: 2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
