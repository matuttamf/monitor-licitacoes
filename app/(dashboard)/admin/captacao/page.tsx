'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Lead } from '@/app/api/admin/leads/route'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type LeadDB = {
  id: string; cnpj: string; razao_social: string; nome_fantasia: string | null
  email: string | null; telefone: string | null; municipio: string | null; uf: string | null
  situacao: string | null; porte: string | null; cnae: string | null
  objeto: string | null; valor: number | null; data_contrato: string | null
  status: 'pendente' | 'enviado' | 'erro' | 'invalido' | 'descadastrado'
  fonte: 'pncp_contrato' | 'pncp_proposta' | 'busca_manual' | null
  enviado_em: string | null; erro_msg: string | null; created_at: string
}

type LeadsDBResult = { leads: LeadDB[]; total: number; page: number; pages: number }

type Stats = {
  leadsTotal: number; leadsPendentes: number; leadsEnviados: number
  leadsErro: number; leadsInvalido: number; leadsDescadastrado: number
  totalExpired: number; reconversaoEnviado: number
  leadsAbriram: number; leadsClicaram: number
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const UFS = ['todos','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const STATUS_COR: Record<string, { bg: string; color: string; label: string }> = {
  pendente:      { bg: 'rgba(201,166,90,0.12)',  color: '#92710a', label: 'Pendente'      },
  enviado:       { bg: 'rgba(16,185,129,0.10)',  color: '#065f46', label: 'Enviado'       },
  erro:          { bg: 'rgba(239,68,68,0.10)',   color: '#991b1b', label: 'Erro'          },
  invalido:      { bg: 'rgba(107,114,128,0.10)', color: '#374151', label: 'Inválido'      },
  descadastrado: { bg: 'rgba(107,114,128,0.10)', color: '#374151', label: 'Descadastrado' },
}

const CNAES_SUGERIDOS = [
  'construção', 'engenharia', 'tecnologia', 'informática', 'limpeza',
  'vigilância', 'transporte', 'saúde', 'consultoria', 'treinamento',
]

function csvEscape(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`
  return v
}
function exportarCSV(leads: Lead[]) {
  const cols: (keyof Lead)[] = ['email','razao_social','nome_fantasia','cnpj','telefone','municipio','uf','porte','cnae','objeto','valor']
  const blob = new Blob([[cols.join(','), ...leads.map(l => cols.map(c => csvEscape(String(l[c] ?? ''))).join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url)
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CaptacaoPage() {
  // Sistema
  const [captacaoAtiva, setCaptacaoAtiva] = useState<boolean | null>(null)
  const [toggling, setToggling]           = useState(false)
  const [stats, setStats]                 = useState<Stats | null>(null)

  // Tabela leads DB
  const [leadsDB, setLeadsDB]             = useState<LeadDB[]>([])
  const [totalDB, setTotalDB]             = useState(0)
  const [paginasDB, setPaginasDB]         = useState(1)
  const [paginaDB, setPaginaDB]           = useState(1)
  const [filtroStatus, setFiltroStatus]   = useState('todos')
  const [filtroUF, setFiltroUF]           = useState('todos')
  const [filtroCNAE, setFiltroCNAE]       = useState('')
  const [filtroQ, setFiltroQ]             = useState('')
  const [carregandoDB, setCarregandoDB]   = useState(false)
  const [selecionados, setSelecionados]   = useState<Set<string>>(new Set())
  const [acaoBulk, setAcaoBulk]          = useState('')
  const [salvandoBulk, setSalvandoBulk]  = useState(false)
  const [expandido, setExpandido]        = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ações cron
  const [disparando, setDisparando]       = useState<string | null>(null)
  const [resultadoCron, setResultadoCron] = useState<{ acao: string; ok: boolean; data: unknown } | null>(null)

  // Busca manual PNCP
  const [abaAtiva, setAbaAtiva]           = useState<'base' | 'busca'>('base')
  const [anos, setAnos]                   = useState(1)
  const [ufBusca, setUfBusca]             = useState('todos')
  const [valorMinimo, setValorMinimo]     = useState(0)
  const [maxPaginas, setMaxPaginas]       = useState(3)
  const [somenteEmail, setSomenteEmail]   = useState(true)
  const [somenteAtivas, setSomenteAtivas] = useState(true)
  const [buscando, setBuscando]           = useState(false)
  const [resultadoBusca, setResultadoBusca] = useState<{ total_contratos: number; total_cnpjs: number; total_leads: number; leads: Lead[] } | null>(null)
  const [erroBusca, setErroBusca]         = useState('')
  const [filtroEmailBusca, setFiltroEmailBusca] = useState('')
  const [importando, setImportando]           = useState(false)
  const [resultadoImport, setResultadoImport] = useState<{ importados: number } | null>(null)

  // Backfill progress
  const [backfillData, setBackfillData]       = useState<string | null>(null)

  // ─── Carregamento ─────────────────────────────────────────────────────────

  const carregarStats = useCallback(async () => {
    const [cfgRes, statsRes, bfRes] = await Promise.all([
      fetch('/api/admin/captacao-config'),
      fetch('/api/admin/stats'),
      fetch('/api/admin/captacao-config?chave=captacao_backfill_data'),
    ])
    if (cfgRes.ok)   setCaptacaoAtiva((await cfgRes.json()).captacao_ativa)
    if (bfRes.ok)    setBackfillData((await bfRes.json()).valor ?? null)
    if (statsRes.ok) {
      const s = await statsRes.json()
      setStats({
        leadsTotal:         s.leadsTotal         ?? 0,
        leadsPendentes:     s.leadsPendentes      ?? 0,
        leadsEnviados:      s.leadsEnviados       ?? 0,
        leadsErro:          s.leadsErro           ?? 0,
        leadsInvalido:      s.leadsInvalido       ?? 0,
        leadsDescadastrado: s.leadsDescadastrado  ?? 0,
        totalExpired:       s.totalExpired        ?? 0,
        reconversaoEnviado: s.reconversaoEnviado  ?? 0,
        leadsAbriram:       s.leadsAbriram        ?? 0,
        leadsClicaram:      s.leadsClicaram       ?? 0,
      })
    }
  }, [])

  const carregarLeadsDB = useCallback(async (pag = 1) => {
    setCarregandoDB(true)
    setSelecionados(new Set())
    const params = new URLSearchParams({
      page:   String(pag),
      status: filtroStatus,
      uf:     filtroUF,
      cnae:   filtroCNAE,
      q:      filtroQ,
    })
    const res = await fetch(`/api/admin/leads-db?${params}`)
    if (res.ok) {
      const d: LeadsDBResult = await res.json()
      setLeadsDB(d.leads)
      setTotalDB(d.total)
      setPaginasDB(d.pages)
      setPaginaDB(d.page)
    }
    setCarregandoDB(false)
  }, [filtroStatus, filtroUF, filtroCNAE, filtroQ])

  useEffect(() => { carregarStats() }, [carregarStats])
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => carregarLeadsDB(1), 400)
  }, [carregarLeadsDB])

  // ─── Ações ────────────────────────────────────────────────────────────────

  async function toggleSistema() {
    if (captacaoAtiva === null) return
    setToggling(true)
    const res = await fetch('/api/admin/captacao-config', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !captacaoAtiva }),
    })
    if (res.ok) setCaptacaoAtiva((await res.json()).captacao_ativa)
    setToggling(false)
  }

  async function acionarCron(acao: string) {
    setDisparando(acao); setResultadoCron(null)
    const res = await fetch('/api/admin/trigger', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao }),
    })
    setResultadoCron({ acao, ok: res.ok, data: await res.json() })
    setDisparando(null)
    carregarStats()
    if (abaAtiva === 'base') carregarLeadsDB(paginaDB)
  }

  async function aplicarBulk() {
    if (!selecionados.size || !acaoBulk) return
    setSalvandoBulk(true)
    await fetch('/api/admin/leads-db', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selecionados], status: acaoBulk }),
    })
    setSalvandoBulk(false)
    setSelecionados(new Set()); setAcaoBulk('')
    carregarLeadsDB(paginaDB); carregarStats()
  }

  async function alterarStatusLead(id: string, status: string) {
    await fetch('/api/admin/leads-db', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    carregarLeadsDB(paginaDB); carregarStats()
  }

  async function importarLeads() {
    if (!resultadoBusca?.leads.length) return
    setImportando(true); setResultadoImport(null)
    try {
      const res = await fetch('/api/admin/leads-importar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: resultadoBusca.leads }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro')
      setResultadoImport(data)
      carregarStats(); carregarLeadsDB(1)
    } catch (e: unknown) {
      setErroBusca(e instanceof Error ? e.message : 'Erro ao importar')
    } finally { setImportando(false) }
  }

  async function buscarLeadsPNCP() {
    setBuscando(true); setErroBusca(''); setResultadoBusca(null); setResultadoImport(null)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anos, uf: ufBusca, valorMinimo, maxPaginas, somenteEmail, somenteAtivas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro')
      setResultadoBusca(data)
    } catch (e: unknown) {
      setErroBusca(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally { setBuscando(false) }
  }

  const toggleSel = (id: string) => setSelecionados(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })
  const toggleTodos = () => setSelecionados(
    selecionados.size === leadsDB.length ? new Set() : new Set(leadsDB.map(l => l.id))
  )

  const ativo = captacaoAtiva === true
  const leadsFiltradosBusca = resultadoBusca?.leads.filter(l =>
    !filtroEmailBusca || l.email.includes(filtroEmailBusca.toLowerCase())
  ) ?? []

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Header + Toggle ── */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>Sistema de Captação</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>
            Coleta PNCP → Enriquecimento Receita Federal → Disparo e-mails → Reconversão de trials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: ativo ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: ativo ? '#10b981' : '#ef4444', border: `1px solid ${ativo ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ativo ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            {captacaoAtiva === null ? '…' : ativo ? 'Sistema ativo' : 'Sistema pausado'}
          </div>
          <button onClick={toggleSistema} disabled={toggling || captacaoAtiva === null}
            className="px-5 py-2 rounded-xl text-sm font-bold"
            style={{ background: ativo ? '#ef4444' : '#10b981', color: 'white', border: 'none', cursor: toggling ? 'not-allowed' : 'pointer' }}>
            {toggling ? '…' : ativo ? '⏸ Pausar' : '▶ Iniciar'}
          </button>
        </div>
      </div>

      {/* ── KPIs leads ── */}
      {stats && (
        <>
          <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            {([
              { label: 'Total leads',    value: stats.leadsTotal,         cor: '#6B0F1A' },
              { label: 'Pendentes',      value: stats.leadsPendentes,     cor: '#C9A65A' },
              { label: 'Enviados',       value: stats.leadsEnviados,      cor: '#10b981' },
              { label: 'Com erro',       value: stats.leadsErro,          cor: '#ef4444' },
              { label: 'Inválidos',      value: stats.leadsInvalido,      cor: '#6b7280' },
              { label: 'Descadastrados', value: stats.leadsDescadastrado, cor: '#6b7280' },
            ] as const).map(({ label, value, cor }) => (
              <button key={label} onClick={() => setFiltroStatus(label === 'Total leads' ? 'todos' : label.toLowerCase().replace('é', 'e').replace('á', 'a').replace('idos', 'ido'))}
                className="text-left rounded-2xl px-4 py-3 transition-all"
                style={{ background: 'white', border: `1px solid ${filtroStatus === (label === 'Total leads' ? 'todos' : label.toLowerCase()) ? cor : 'var(--cinza-light)'}`, cursor: 'pointer' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: cor, letterSpacing: '-0.02em' }}>{value.toLocaleString('pt-BR')}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cinza)', marginTop: 2 }}>{label}</div>
              </button>
            ))}
          </div>
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {([
              { label: 'Trials expirados',   value: stats.totalExpired,        cor: '#6B0F1A' },
              { label: 'Reconversão enviada', value: stats.reconversaoEnviado,  cor: '#10b981' },
              { label: 'Aguardando e-mail',   value: Math.max(0, stats.totalExpired - stats.reconversaoEnviado), cor: '#C9A65A' },
            ] as const).map(({ label, value, cor }) => (
              <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '12px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: cor }}>{value.toLocaleString('pt-BR')}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cinza)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Funil de conversão ── */}
      {stats && stats.leadsTotal > 0 && (() => {
        const etapas = [
          { label: 'Coletados',   value: stats.leadsTotal,     cor: '#6B0F1A', icon: '📥' },
          { label: 'E-mails env.', value: stats.leadsEnviados,  cor: '#C9A65A', icon: '✉️' },
          { label: 'Abriram',     value: stats.leadsAbriram,   cor: '#3b82f6', icon: '👁️' },
          { label: 'Clicaram',    value: stats.leadsClicaram,  cor: '#8b5cf6', icon: '🖱️' },
        ]
        const base = stats.leadsTotal || 1
        return (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>Funil de captação</h2>
            <div className="flex items-end gap-2 flex-wrap">
              {etapas.map((e, i) => {
                const pct = Math.round((e.value / base) * 100)
                const barH = Math.max(8, Math.round((e.value / base) * 80))
                return (
                  <div key={e.label} className="flex flex-col items-center" style={{ minWidth: 72 }}>
                    {i > 0 && (
                      <div style={{ position: 'absolute', marginLeft: -20, color: 'var(--cinza)', fontSize: 16 }}>→</div>
                    )}
                    <div style={{ fontSize: 18, fontWeight: 800, color: e.cor }}>{e.value.toLocaleString('pt-BR')}</div>
                    <div style={{ width: 56, height: barH, background: e.cor, borderRadius: 4, opacity: 0.85, margin: '4px 0', transition: 'height 0.3s' }} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cinza)', textAlign: 'center' }}>{e.icon} {e.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--cinza)' }}>{pct}%</div>
                  </div>
                )
              })}
              <div className="ml-auto pl-4" style={{ borderLeft: '1px solid var(--cinza-light)' }}>
                <div style={{ fontSize: 11, color: 'var(--cinza)', marginBottom: 4 }}>Taxa de abertura</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>
                  {stats.leadsEnviados > 0 ? Math.round((stats.leadsAbriram / stats.leadsEnviados) * 100) : 0}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--cinza)', marginTop: 8, marginBottom: 4 }}>Taxa de clique</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6' }}>
                  {stats.leadsEnviados > 0 ? Math.round((stats.leadsClicaram / stats.leadsEnviados) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Ações manuais ── */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>Acionar manualmente</h2>
        <div className="flex gap-3 flex-wrap items-start">
          {([
            { acao: 'coletar-leads',         label: '🏆 Coletar vencedores',    desc: 'Diário · contratos assinados PNCP' },
            { acao: 'coletar-participantes', label: '👥 Coletar participantes',  desc: 'Semanal · todos os proponentes PNCP' },
            { acao: 'disparar-leads',        label: '✉️ Disparar leads',        desc: '~5s · até 20 e-mails captação' },
            { acao: 'reconverter-trials',    label: '🔄 Reconverter trials',     desc: '~5s · até 15 e-mails reativação' },
          ] as const).map(({ acao, label, desc }) => (
            <div key={acao}>
              <button onClick={() => acionarCron(acao)} disabled={disparando !== null}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: disparando === acao ? 'var(--cinza-light)' : 'var(--vinho)', color: disparando === acao ? 'var(--cinza)' : 'white', border: 'none', cursor: disparando !== null ? 'not-allowed' : 'pointer', opacity: disparando !== null && disparando !== acao ? 0.5 : 1 }}>
                {disparando === acao ? '⏳ Executando…' : label}
              </button>
              <p style={{ fontSize: 10, color: 'var(--cinza)', marginTop: 3 }}>{desc}</p>
            </div>
          ))}
        </div>
        {/* Progresso do backfill */}
        {(() => {
          const inicio = new Date('2022-01-01').getTime()
          const hoje   = new Date().getTime()
          const atual  = backfillData ? new Date(backfillData).getTime() : inicio
          const pct    = Math.min(100, Math.round(((atual - inicio) / (hoje - inicio)) * 100))
          const emBackfill = backfillData && backfillData < new Date().toISOString().slice(0, 10)
          return (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--cinza-light)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--cinza)' }}>
                  {emBackfill ? `⏳ Backfill em progresso — próximo: ${backfillData}` : '✅ Backfill completo (modo contínuo)'}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--vinho)' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--cinza-light)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: emBackfill ? '#C9A65A' : '#10b981', borderRadius: 99, transition: 'width 0.5s' }} />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 10, color: 'var(--cinza)' }}>Jan 2022</span>
                <span style={{ fontSize: 10, color: 'var(--cinza)' }}>Hoje</span>
              </div>
            </div>
          )
        })()}
        {resultadoCron && (
          <div className="mt-3 px-4 py-3 rounded-xl text-xs font-mono break-all"
            style={{ background: resultadoCron.ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${resultadoCron.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: resultadoCron.ok ? '#065f46' : '#991b1b' }}>
            <strong>{resultadoCron.acao}</strong> → {JSON.stringify(resultadoCron.data)}
          </div>
        )}
      </div>

      {/* ── Abas ── */}
      <div className="flex gap-1 mb-4">
        {(['base', 'busca'] as const).map(aba => (
          <button key={aba} onClick={() => setAbaAtiva(aba)}
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: abaAtiva === aba ? 'var(--vinho)' : 'white', color: abaAtiva === aba ? 'white' : 'var(--cinza)', border: '1px solid var(--cinza-light)', cursor: 'pointer' }}>
            {aba === 'base' ? `📋 Base de leads (${totalDB.toLocaleString('pt-BR')})` : '🔍 Busca manual PNCP'}
          </button>
        ))}
      </div>

      {/* ── ABA: BASE DE LEADS ── */}
      {abaAtiva === 'base' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>

          {/* Filtros */}
          <div className="px-5 py-4 flex flex-wrap gap-3 items-end" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--cinza-light)' }}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>Status</label>
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}>
                <option value="todos">Todos</option>
                {['pendente','enviado','erro','invalido','descadastrado'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>UF</label>
              <select value={filtroUF} onChange={e => setFiltroUF(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}>
                {UFS.map(u => <option key={u} value={u}>{u === 'todos' ? 'Todos' : u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>CNAE / Setor</label>
              <div className="flex gap-1 flex-wrap items-center">
                <input value={filtroCNAE} onChange={e => setFiltroCNAE(e.target.value)}
                  placeholder="ex: construção"
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ border: '1px solid var(--cinza-light)', background: 'white', width: 130 }} />
                <div className="flex gap-1 flex-wrap">
                  {CNAES_SUGERIDOS.slice(0, 4).map(c => (
                    <button key={c} onClick={() => setFiltroCNAE(c)}
                      className="px-2 py-0.5 rounded text-[10px]"
                      style={{ background: filtroCNAE === c ? 'var(--vinho)' : 'var(--cinza-light)', color: filtroCNAE === c ? 'white' : 'var(--cinza)', border: 'none', cursor: 'pointer' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>Buscar</label>
              <input value={filtroQ} onChange={e => setFiltroQ(e.target.value)}
                placeholder="empresa ou e-mail…"
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', width: 180 }} />
            </div>
            {filtroQ || filtroStatus !== 'todos' || filtroUF !== 'todos' || filtroCNAE ? (
              <button onClick={() => { setFiltroQ(''); setFiltroStatus('todos'); setFiltroUF('todos'); setFiltroCNAE('') }}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', color: 'var(--cinza)', cursor: 'pointer' }}>
                ✕ Limpar
              </button>
            ) : null}
          </div>

          {/* Barra de ações em lote */}
          {selecionados.size > 0 && (
            <div className="px-5 py-3 flex items-center gap-3 flex-wrap"
              style={{ background: 'rgba(107,15,26,0.05)', borderBottom: '1px solid var(--cinza-light)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--vinho)' }}>
                {selecionados.size} selecionado{selecionados.size > 1 ? 's' : ''}
              </span>
              <select value={acaoBulk} onChange={e => setAcaoBulk(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white' }}>
                <option value="">Alterar status para…</option>
                {['pendente','enviado','invalido','descadastrado'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button onClick={aplicarBulk} disabled={!acaoBulk || salvandoBulk}
                className="px-4 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: !acaoBulk ? 'not-allowed' : 'pointer' }}>
                {salvandoBulk ? 'Salvando…' : 'Aplicar'}
              </button>
              <button onClick={() => setSelecionados(new Set())}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          )}

          {/* Tabela */}
          {carregandoDB ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--cinza)' }}>Carregando…</div>
          ) : leadsDB.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium" style={{ color: 'var(--preto)' }}>Nenhum lead encontrado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--cinza)' }}>
                {totalDB === 0 ? 'Execute "Coletar leads" ou aplique as migrations SQL no Supabase.' : 'Tente outros filtros.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                    <th className="px-3 py-2.5">
                      <input type="checkbox" checked={selecionados.size === leadsDB.length && leadsDB.length > 0}
                        onChange={toggleTodos} />
                    </th>
                    {['','Empresa','E-mail','Cidade/UF','Setor (CNAE)','Fonte','Status','Enviado em','Ações'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: 'var(--cinza)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadsDB.map((l, i) => {
                    const sc = STATUS_COR[l.status] ?? STATUS_COR.pendente
                    const aberto = expandido === l.id
                    const rowBg = selecionados.has(l.id) ? 'rgba(107,15,26,0.04)' : i % 2 === 0 ? 'white' : 'var(--surface-2)'
                    return (
                      <>
                      <tr key={l.id} style={{ borderBottom: aberto ? 'none' : '1px solid var(--cinza-light)', background: rowBg }}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selecionados.has(l.id)} onChange={() => toggleSel(l.id)} />
                        </td>
                        <td className="px-2 py-2 w-6">
                          <button onClick={() => setExpandido(aberto ? null : l.id)}
                            title={aberto ? 'Fechar detalhes' : 'Ver contrato de origem'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cinza)', fontSize: 12, padding: '2px 4px', borderRadius: 4, transition: 'transform 0.15s', transform: aberto ? 'rotate(90deg)' : 'none' }}>
                            ▶
                          </button>
                        </td>
                        <td className="px-3 py-2 max-w-[160px]">
                          <div className="font-semibold truncate" style={{ color: 'var(--preto)' }} title={l.razao_social}>
                            {l.nome_fantasia || l.razao_social}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: 'var(--cinza)' }}>
                            {l.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {l.email
                            ? <a href={`mailto:${l.email}`} style={{ color: 'var(--vinho)' }}>{l.email}</a>
                            : <span style={{ color: 'var(--cinza)' }}>—</span>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--preto)' }}>
                          {[l.municipio, l.uf].filter(Boolean).join('/') || '—'}
                        </td>
                        <td className="px-3 py-2 max-w-[160px]">
                          <span className="truncate block" title={l.cnae ?? ''} style={{ color: 'var(--cinza)' }}>
                            {l.cnae ? l.cnae.slice(0, 45) + (l.cnae.length > 45 ? '…' : '') : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {(() => {
                            const fonte = l.fonte
                            const map: Record<string, { label: string; bg: string; color: string }> = {
                              pncp_contrato:  { label: '🏆 Contrato',     bg: 'rgba(107,15,26,0.08)',   color: '#6B0F1A' },
                              pncp_proposta:  { label: '👥 Proponente',   bg: 'rgba(59,130,246,0.08)',  color: '#1e40af' },
                              busca_manual:   { label: '🔍 Manual',       bg: 'rgba(107,114,128,0.1)', color: '#374151' },
                            }
                            const f = map[fonte ?? ''] ?? { label: fonte ?? '—', bg: 'rgba(107,114,128,0.1)', color: '#374151' }
                            return (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ background: f.bg, color: f.color }}>{f.label}</span>
                            )
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                            style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                          {l.erro_msg && <div className="text-[10px] mt-0.5 text-red-600 max-w-[120px] truncate" title={l.erro_msg}>{l.erro_msg}</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--cinza)' }}>
                          {l.enviado_em ? new Date(l.enviado_em).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {l.status !== 'pendente' && (
                              <button onClick={() => alterarStatusLead(l.id, 'pendente')} title="Reenviar"
                                className="px-2 py-0.5 rounded text-[10px] font-semibold"
                                style={{ background: 'rgba(201,166,90,0.15)', color: '#92710a', border: 'none', cursor: 'pointer' }}>
                                ↺
                              </button>
                            )}
                            {l.status !== 'invalido' && (
                              <button onClick={() => alterarStatusLead(l.id, 'invalido')} title="Marcar inválido"
                                className="px-2 py-0.5 rounded text-[10px] font-semibold"
                                style={{ background: 'rgba(107,114,128,0.1)', color: '#374151', border: 'none', cursor: 'pointer' }}>
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {aberto && (
                        <tr key={`${l.id}-detail`} style={{ borderBottom: '1px solid var(--cinza-light)', background: rowBg }}>
                          <td colSpan={9} className="px-6 pb-3 pt-1">
                            <div className="rounded-xl p-4 text-xs" style={{ background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Contrato de origem</div>
                                  <div style={{ color: 'var(--preto)', lineHeight: 1.5 }}>{l.objeto || '—'}</div>
                                </div>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Valor do contrato</div>
                                  <div style={{ color: 'var(--vinho)', fontWeight: 700, fontSize: 14 }}>
                                    {l.valor ? `R$ ${l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Data do contrato</div>
                                  <div style={{ color: 'var(--preto)' }}>{l.data_contrato ? new Date(l.data_contrato).toLocaleDateString('pt-BR') : '—'}</div>
                                </div>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Porte</div>
                                  <div style={{ color: 'var(--preto)' }}>{l.porte ? l.porte.replace('EMPRESA DE ', '').replace('DEMAIS', 'Grande') : '—'}</div>
                                </div>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Situação na RF</div>
                                  <div style={{ color: l.situacao === 'ATIVA' ? '#059669' : '#6b7280', fontWeight: 600 }}>{l.situacao || '—'}</div>
                                </div>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Telefone</div>
                                  <div style={{ color: 'var(--preto)' }}>{l.telefone || '—'}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {paginasDB > 1 && (
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--cinza-light)' }}>
              <span className="text-xs" style={{ color: 'var(--cinza)' }}>
                {totalDB.toLocaleString('pt-BR')} leads · página {paginaDB} de {paginasDB}
              </span>
              <div className="flex gap-1">
                <button onClick={() => carregarLeadsDB(paginaDB - 1)} disabled={paginaDB <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ border: '1px solid var(--cinza-light)', background: 'white', cursor: paginaDB <= 1 ? 'not-allowed' : 'pointer', opacity: paginaDB <= 1 ? 0.4 : 1 }}>
                  ← Anterior
                </button>
                <button onClick={() => carregarLeadsDB(paginaDB + 1)} disabled={paginaDB >= paginasDB}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ border: '1px solid var(--cinza-light)', background: 'white', cursor: paginaDB >= paginasDB ? 'not-allowed' : 'pointer', opacity: paginaDB >= paginasDB ? 0.4 : 1 }}>
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ABA: BUSCA MANUAL PNCP ── */}
      {abaAtiva === 'busca' && (
        <>
          <div className="rounded-2xl p-5 mb-4" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Anos</label>
                <select value={anos} onChange={e => setAnos(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', background: 'white' }}>
                  {[1,2,3,5].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>UF</label>
                <select value={ufBusca} onChange={e => setUfBusca(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', background: 'white' }}>
                  {UFS.map(u => <option key={u} value={u}>{u === 'todos' ? 'Todos' : u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Valor mín.</label>
                <input type="number" value={valorMinimo} onChange={e => setValorMinimo(Number(e.target.value))}
                  min={0} step={10000} className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', background: 'white' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Páginas</label>
                <select value={maxPaginas} onChange={e => setMaxPaginas(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', background: 'white' }}>
                  {[1,2,3,5,10].map(p => <option key={p} value={p}>{p} ({p*50})</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={somenteEmail} onChange={e => setSomenteEmail(e.target.checked)} />
                  Só com e-mail
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={somenteAtivas} onChange={e => setSomenteAtivas(e.target.checked)} />
                  Só ativas
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={buscarLeadsPNCP} disabled={buscando}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: buscando ? 'var(--cinza)' : 'var(--vinho)', border: 'none', cursor: buscando ? 'not-allowed' : 'pointer' }}>
                {buscando ? '⏳ Buscando…' : '🔍 Buscar leads'}
              </button>
              {resultadoBusca && (
                <span className="text-sm" style={{ color: 'var(--cinza)' }}>
                  {resultadoBusca.total_contratos} contratos → {resultadoBusca.total_cnpjs} CNPJs →{' '}
                  <strong style={{ color: 'var(--vinho)' }}>{resultadoBusca.total_leads} leads</strong>
                </span>
              )}
            </div>
            {erroBusca && (
              <div className="mt-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}>
                ⚠ {erroBusca}
              </div>
            )}
          </div>

          {resultadoBusca && resultadoBusca.leads.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
              <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
                style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--cinza-light)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                    {leadsFiltradosBusca.length} leads
                  </span>
                  <input placeholder="Filtrar e-mail…" value={filtroEmailBusca}
                    onChange={e => setFiltroEmailBusca(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ border: '1px solid var(--cinza-light)', background: 'white', width: 180 }} />
                </div>
                <div className="flex items-center gap-2">
                  {resultadoImport ? (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#065f46', border: '1px solid rgba(16,185,129,0.2)' }}>
                      ✅ {resultadoImport.importados} importados
                    </span>
                  ) : (
                    <button onClick={importarLeads} disabled={importando}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: importando ? 'var(--cinza-light)' : '#10b981', color: importando ? 'var(--cinza)' : 'white', border: 'none', cursor: importando ? 'not-allowed' : 'pointer' }}>
                      {importando ? '⏳ Importando…' : `⬆ Importar para base (${leadsFiltradosBusca.length})`}
                    </button>
                  )}
                  <button onClick={() => exportarCSV(leadsFiltradosBusca)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    ⬇ CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                      {['Empresa','E-mail','Tel','Cidade/UF','Porte','Contrato'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: 'var(--cinza)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leadsFiltradosBusca.map((l, i) => (
                      <tr key={l.cnpj + i}
                        style={{ borderBottom: '1px solid var(--cinza-light)', background: i % 2 === 0 ? 'white' : 'var(--surface-2)' }}>
                        <td className="px-4 py-2.5 max-w-[180px]">
                          <div className="font-semibold truncate" style={{ color: 'var(--preto)' }}>{l.nome_fantasia || l.razao_social}</div>
                          <div className="truncate text-[10px]" style={{ color: 'var(--cinza)' }}>{l.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</div>
                        </td>
                        <td className="px-4 py-2.5"><a href={`mailto:${l.email}`} style={{ color: 'var(--vinho)' }}>{l.email || '—'}</a></td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--preto)' }}>{l.telefone || '—'}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--preto)' }}>{[l.municipio, l.uf].filter(Boolean).join('/') || '—'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--preto)' }}>{l.porte ? l.porte.replace('EMPRESA DE ', '').replace('DEMAIS', 'Grande') : '—'}</td>
                        <td className="px-4 py-2.5 max-w-[200px]">
                          <span className="truncate block text-[10px]" title={l.objeto} style={{ color: 'var(--cinza)' }}>{l.objeto ? l.objeto.slice(0, 60) + '…' : '—'}</span>
                          {l.valor ? <span style={{ color: 'var(--preto)', fontWeight: 600 }}>R$ {l.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 text-xs" style={{ color: 'var(--cinza)', borderTop: '1px solid var(--cinza-light)' }}>
                Dados públicos: PNCP + Receita Federal · Máx. 50 empresas por busca
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
