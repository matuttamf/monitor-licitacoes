'use client'

import { useEffect, useState, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsoServico {
  limite: number
  periodo: string
  label: string
  unidade: string
}

interface SaudeData {
  uso: Record<string, number>
  limites: Record<string, UsoServico>
  tabelas: {
    leads:      { total: number; com_email: number; pendente: number }
    licitacoes: { total: number }
    alertas:    { total: number; enviados: number }
    usuarios:   { total: number; ativos: number }
  }
  ultimosJobs: Record<string, { status: string; mensagem: string; criado_em: string }>
  backfill: {
    pncp:          { proximo: string; inicio: string; fim: string; pct: number }
    transparencia: { proximo: string; inicio: string; fim: string; pct: number }
  }
  captacaoAtiva: boolean
  hoje: string
  mes: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(uso: number, limite: number) {
  return Math.min(100, Math.round((uso / limite) * 100))
}

function corPct(p: number): string {
  if (p >= 90) return '#ef4444'  // vermelho
  if (p >= 70) return '#f59e0b'  // amarelo
  return '#22c55e'               // verde
}

function corStatus(status: string): string {
  if (status === 'ok')      return '#22c55e'
  if (status === 'erro')    return '#ef4444'
  if (status === 'ignorado') return '#94a3b8'
  return '#94a3b8'
}

function tempoAtras(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1)   return 'agora'
  if (min < 60)  return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24)    return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function statusGlobal(uso: Record<string, number>, limites: Record<string, UsoServico>): 'ok' | 'atencao' | 'critico' {
  let maxPct = 0
  for (const [k, v] of Object.entries(uso)) {
    const lim = limites[k]?.limite ?? 0
    if (lim > 0) maxPct = Math.max(maxPct, pct(v, lim))
  }
  if (maxPct >= 90) return 'critico'
  if (maxPct >= 70) return 'atencao'
  return 'ok'
}

const CRON_LABELS: Record<string, string> = {
  coletar:          'Coletar licitações',
  'coletar-abertos':'Coletar abertos (PNCP)',
  matching:         'Matching Gemini',
  alertar:          'Enviar alertas',
  'emails-trial':   'E-mails trial',
  'expirar-trials': 'Expirar trials',
  'resumo-semanal': 'Resumo semanal',
  'alertar-urgente':'Alertas urgentes',
  'radar-alertas':  'Radar de contratos',
  'disparar-leads': 'Disparar leads',
  'coletar-leads':  'Coletar leads',
  'enriquecer-emails': 'Enriquecer e-mails',
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function BarraUso({ uso, limite, cor }: { uso: number; limite: number; cor: string }) {
  const p = pct(uso, limite)
  return (
    <div style={{ background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ width: `${p}%`, height: '100%', background: cor, borderRadius: 4, transition: 'width .3s' }} />
    </div>
  )
}

function CardUso({ servico, uso, info }: { servico: string; uso: number; info: UsoServico }) {
  const p   = pct(uso, info.limite)
  const cor = corPct(p)
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', minWidth: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{info.label}</span>
        <span style={{ fontSize: 12, color: cor, fontWeight: 700 }}>{p}%</span>
      </div>
      <div style={{ marginTop: 4, color: '#64748b', fontSize: 12 }}>{info.unidade}</div>
      <BarraUso uso={uso} limite={info.limite} cor={cor} />
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: '#1e293b', fontWeight: 600 }}>{uso.toLocaleString('pt-BR')}</span>
        <span style={{ color: '#94a3b8' }}>/ {info.limite.toLocaleString('pt-BR')}</span>
      </div>
      {p >= 90 && (
        <div style={{ marginTop: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#dc2626' }}>
          ⚠️ Limite crítico — verifique imediatamente
        </div>
      )}
      {p >= 70 && p < 90 && (
        <div style={{ marginTop: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#b45309' }}>
          ⚡ Atenção — {info.limite - uso} restantes
        </div>
      )}
    </div>
  )
}

function CardTabela({ label, valor, sub }: { label: string; valor: number; sub?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 130 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#1e293b' }}>{valor.toLocaleString('pt-BR')}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function CardCron({ job, info }: { job: string; info: { status: string; mensagem: string; criado_em: string } }) {
  const cor = corStatus(info.status)
  const icone = info.status === 'ok' ? '✅' : info.status === 'erro' ? '❌' : '⏭'
  return (
    <div style={{ background: '#fff', border: `1px solid ${info.status === 'erro' ? '#fecaca' : '#e2e8f0'}`, borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{icone} {CRON_LABELS[job] ?? job}</span>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{info.mensagem}</div>
        </div>
        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 11, color: cor, fontWeight: 600 }}>{info.status.toUpperCase()}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{tempoAtras(info.criado_em)}</div>
        </div>
      </div>
    </div>
  )
}

function BarraBackfill({ label, pct: p, proximo, fim }: { label: string; pct: number; proximo: string; fim: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{label}</span>
        <span style={{ color: '#64748b' }}>{proximo} → {fim} &nbsp;<strong style={{ color: '#3b82f6' }}>{p}%</strong></span>
      </div>
      <div style={{ background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: p >= 99 ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SaudePage() {
  const [data, setData] = useState<SaudeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ultimaAtt, setUltimaAtt] = useState<Date | null>(null)

  const carregar = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/saude')
      if (res.ok) {
        setData(await res.json())
        setUltimaAtt(new Date())
      }
    } finally {
      setLoading(false)
      if (manual) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    carregar()
    const iv = setInterval(() => carregar(false), 60_000) // atualiza a cada 1 min
    return () => clearInterval(iv)
  }, [carregar])

  if (loading) return (
    <div style={{ padding: 32, color: '#64748b' }}>Carregando métricas…</div>
  )
  if (!data) return (
    <div style={{ padding: 32, color: '#ef4444' }}>Erro ao carregar dados.</div>
  )

  const global = statusGlobal(data.uso, data.limites)
  const globalCor   = global === 'critico' ? '#ef4444' : global === 'atencao' ? '#f59e0b' : '#22c55e'
  const globalLabel = global === 'critico' ? '🔴 Estado Crítico'  : global === 'atencao' ? '🟡 Atenção Necessária' : '🟢 Sistema Saudável'

  return (
    <div className="max-w-7xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>🏥 Saúde do Sistema</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>
            {ultimaAtt ? `Atualizado ${tempoAtras(ultimaAtt.toISOString())} · atualiza automaticamente a cada 1 min` : 'Carregando…'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ background: globalCor + '22', color: globalCor, border: `1px solid ${globalCor}55`, borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>
            {globalLabel}
          </span>
          <button
            onClick={() => carregar(true)}
            disabled={refreshing}
            style={{ fontSize: '12px', color: 'var(--cinza)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--cinza-light)', background: 'white', cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.7 : 1 }}
          >
            {refreshing ? '⟳ Atualizando…' : '↻ Atualizar'}
          </button>
        </div>
      </div>

      {/* APIs externas */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          APIs Externas — Uso vs Limite
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {Object.entries(data.limites).map(([k, info]) => (
            <CardUso key={k} servico={k} uso={data.uso[k] ?? 0} info={info} />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8' }}>
          💡 Google CSE é compartilhado entre coleta de licitações e busca de e-mails. Gemini sem limite definido — monitorado para referência.
        </div>
      </section>

      {/* Banco de dados */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          Banco de Dados
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <CardTabela label="Leads totais"   valor={data.tabelas.leads.total}      sub={`${data.tabelas.leads.com_email} com e-mail`} />
          <CardTabela label="Leads pendentes" valor={data.tabelas.leads.pendente}  sub="aguardando disparo" />
          <CardTabela label="Licitações"      valor={data.tabelas.licitacoes.total} />
          <CardTabela label="Alertas gerados" valor={data.tabelas.alertas.total}   sub={`${data.tabelas.alertas.enviados} enviados`} />
          <CardTabela label="Usuários"        valor={data.tabelas.usuarios.total}  sub={`${data.tabelas.usuarios.ativos} com acesso`} />
        </div>
      </section>

      {/* Backfill */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          Progresso do Backfill
        </h2>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BarraBackfill label="🏆 PNCP"               pct={data.backfill.pncp.pct}          proximo={data.backfill.pncp.proximo}          fim={data.backfill.pncp.fim} />
          <BarraBackfill label="🏛 Portal Transparência" pct={data.backfill.transparencia.pct} proximo={data.backfill.transparencia.proximo} fim={data.backfill.transparencia.fim} />
        </div>
      </section>

      {/* Últimas execuções dos crons */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          Últimas Execuções dos Crons
        </h2>
        {Object.keys(data.ultimosJobs).length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>Nenhum log registrado ainda.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {Object.entries(data.ultimosJobs).map(([job, info]) => (
              <CardCron key={job} job={job} info={info} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
