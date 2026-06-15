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
  fonte: 'pncp_contrato' | 'pncp_proposta' | 'portal_transparencia' | 'busca_manual' | 'cnae' | null
  origem: string | null
  enviado_em: string | null; erro_msg: string | null; created_at: string
}

type LeadsDBResult = { leads: LeadDB[]; total: number; page: number; pages: number }

type FonteItem = { fonte: string; total: number }

type Stats = {
  leadsTotal: number; leadsPendentes: number; leadsEnviados: number
  leadsErro: number; leadsInvalido: number; leadsDescadastrado: number
  totalExpired: number; reconversaoEnviado: number
  leadsAbriram: number; leadsClicaram: number
  fonteBreakdown: FonteItem[]
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
  'limpeza', 'segurança', 'ti', 'construção', 'saúde', 'transporte',
  'alimentação', 'resíduos', 'locação', 'engenharia', 'jardinagem',
  'uniformes', 'gráfica', 'combustível', 'treinamento', 'hotel',
  'publicidade', 'agropecuária', 'vigilância', 'monitoramento',
]

// Formata DDD + número → (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX
function fmtTelefone(raw: string | null): string {
  if (!raw) return '—'
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  return raw
}

// Capitaliza texto em CAIXA ALTA → Primeira Letra Maiúscula
function capitalizar(texto: string | null): string {
  if (!texto) return '—'
  return texto.toLowerCase().replace(/(^|\.\s+|;\s*)([a-záéíóúâêîôûãõàèìòùç])/g,
    (_m, sep, letra) => sep + letra.toUpperCase())
}

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
  const [captacaoAtiva, setCaptacaoAtiva]   = useState<boolean | null>(null)
  const [disparoAtivo, setDisparoAtivo]     = useState<boolean>(false)
  const [toggling, setToggling]             = useState(false)
  const [togglingDisparo, setTogglingDisparo] = useState(false)
  const [resetando, setResetando]           = useState(false)
  const [resetMsg, setResetMsg]             = useState<string | null>(null)
  const [stats, setStats]                   = useState<Stats | null>(null)

  // Tabela leads DB
  const [leadsDB, setLeadsDB]             = useState<LeadDB[]>([])
  const [totalDB, setTotalDB]             = useState(0)
  const [paginasDB, setPaginasDB]         = useState(1)
  const [paginaDB, setPaginaDB]           = useState(1)
  const [filtroStatus, setFiltroStatus]   = useState('todos')
  const [filtroUF, setFiltroUF]           = useState('todos')
  const [filtroFonte, setFiltroFonte]     = useState('todos')
  const [filtroCNAE, setFiltroCNAE]       = useState('')
  const [filtroQ, setFiltroQ]             = useState('')
  const [ordemCol, setOrdemCol]           = useState<string | null>(null)
  const [ordemDir, setOrdemDir]           = useState<'asc' | 'desc'>('asc')
  const ordemColRef = useRef<string | null>(null)
  const ordemDirRef = useRef<'asc' | 'desc'>('asc')
  ordemColRef.current = ordemCol   // sync: sempre o valor atual
  ordemDirRef.current = ordemDir
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

  // Inserção manual de lead
  const [showInsercaoManual, setShowInsercaoManual] = useState(false)
  const [inserindo, setInserindo]                   = useState(false)
  const [insercaoMsg, setInsercaoMsg]               = useState<{ tipo: 'ok' | 'erro' | 'dup'; texto: string } | null>(null)
  const [formManual, setFormManual]                 = useState({
    razao_social: '', cnpj: '', email: '', telefone: '', municipio: '', uf: '', segmento: '',
  })

  async function inserirLeadManual(e: React.FormEvent) {
    e.preventDefault()
    setInserindo(true)
    setInsercaoMsg(null)
    const res = await fetch('/api/admin/leads-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formManual),
    })
    const data = await res.json()
    if (res.status === 409) {
      setInsercaoMsg({ tipo: 'dup', texto: data.error })
    } else if (!res.ok) {
      setInsercaoMsg({ tipo: 'erro', texto: data.error ?? 'Erro ao inserir' })
    } else {
      setInsercaoMsg({ tipo: 'ok', texto: '✓ Lead inserido com sucesso — entrará na fila de disparo.' })
      setFormManual({ razao_social: '', cnpj: '', email: '', telefone: '', municipio: '', uf: '', segmento: '' })
      carregarStats()
      carregarLeadsDB(1)
    }
    setInserindo(false)
  }

  // Backfill progress
  const [backfillData, setBackfillData]                     = useState<string | null>(null)
  const [backfillTransparenciaData, setBackfillTransparenciaData] = useState<string | null>(null)

  // Últimos resultados dos crons (gravados por salvarResultadoCron)
  const [ultimosResultados, setUltimosResultados] = useState<Record<string, Record<string, unknown>>>({})

  const CRONS_MONITORADOS = [
    'coletar-leads',
    'coletar-participantes',
    'coletar-leads-transparencia',
    'enriquecer-emails',
  ] as const

  // ─── Carregamento ─────────────────────────────────────────────────────────

  const carregarStats = useCallback(async () => {
    const [cfgRes, statsRes, bfRes, bfTransRes, disparoRes, ...cronRes] = await Promise.all([
      fetch('/api/admin/captacao-config'),
      fetch('/api/admin/stats'),
      fetch('/api/admin/captacao-config?chave=captacao_backfill_data'),
      fetch('/api/admin/captacao-config?chave=captacao_transparencia_backfill_data'),
      fetch('/api/admin/captacao-config?chave=captacao_disparo_ativo'),
      ...CRONS_MONITORADOS.map(id =>
        fetch(`/api/admin/captacao-config?chave=ultimo_resultado_${id}`)
      ),
    ])
    if (cfgRes.ok)     setCaptacaoAtiva((await cfgRes.json()).captacao_ativa)
    if (bfRes.ok)      setBackfillData((await bfRes.json()).valor ?? null)
    if (bfTransRes.ok) setBackfillTransparenciaData((await bfTransRes.json()).valor ?? null)
    if (disparoRes.ok) {
      const d = await disparoRes.json()
      setDisparoAtivo(d.valor === true || d.valor === 'true')
    }
    const novosResultados: Record<string, Record<string, unknown>> = {}
    for (let i = 0; i < CRONS_MONITORADOS.length; i++) {
      if (cronRes[i].ok) {
        const d = await cronRes[i].json()
        if (d.valor) {
          try { novosResultados[CRONS_MONITORADOS[i]] = JSON.parse(d.valor) } catch { /* ignore */ }
        }
      }
    }
    setUltimosResultados(novosResultados)
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
        fonteBreakdown:     s.fonteBreakdown      ?? [],
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
      fonte:  filtroFonte,
      cnae:   filtroCNAE,
      q:      filtroQ,
    })
    if (ordemColRef.current) {
      params.set('order_by', ordemColRef.current)
      params.set('order_dir', ordemDirRef.current)
    }
    const res = await fetch(`/api/admin/leads-db?${params}`)
    if (res.ok) {
      const d: LeadsDBResult = await res.json()
      setLeadsDB(d.leads)
      setTotalDB(d.total)
      setPaginasDB(d.pages)
      setPaginaDB(d.page)
    }
    setCarregandoDB(false)
  }, [filtroStatus, filtroUF, filtroFonte, filtroCNAE, filtroQ])

  useEffect(() => { carregarStats() }, [carregarStats])
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => carregarLeadsDB(1), 400)
  }, [carregarLeadsDB])

  // ─── Ações ────────────────────────────────────────────────────────────────

  async function resetLeads(scope: 'enviados' | 'todos' | 'completo') {
    if (!confirm(scope === 'todos' || scope === 'completo'
      ? 'Resetar TODOS os leads (enviados + erro + inválidos) para pendente? Eles receberão os e-mails do início.'
      : 'Resetar todos os leads com status "enviado" para pendente? Eles receberão os e-mails novamente.'))
      return
    setResetando(true)
    setResetMsg(null)
    const res = await fetch('/api/admin/reset-leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope }),
    })
    const data = await res.json()
    setResetMsg(res.ok ? `✓ ${data.resetados} leads resetados para pendente` : `Erro: ${data.error}`)
    setResetando(false)
    carregarStats()
  }

  async function toggleDisparo() {
    setTogglingDisparo(true)
    const novoValor = !disparoAtivo
    const res = await fetch('/api/admin/captacao-config', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chave: 'captacao_disparo_ativo', valor: novoValor }),
    })
    if (res.ok) setDisparoAtivo(novoValor)
    setTogglingDisparo(false)
  }

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

  async function dispararGitHub(workflow: string, inputs?: Record<string, string>) {
    setDisparando(workflow); setResultadoCron(null)
    const res = await fetch('/api/admin/trigger-github', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, inputs }),
    })
    setResultadoCron({ acao: workflow, ok: res.ok, data: await res.json() })
    setDisparando(null)
  }

  const GITHUB_WORKFLOWS: Record<string, string> = {
    'coletar-leads-cnae': 'coletar-leads-rfb.yml',
    'enriquecer-receita': 'enriquecer-leads.yml',
  }

  async function acionar(acao: string) {
    const wf = GITHUB_WORKFLOWS[acao]
    if (wf) return dispararGitHub(wf, acao === 'enriquecer-receita' ? { run_bulk: 'true' } : undefined)
    return acionarCron(acao)
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
        <div className="flex items-center gap-3 flex-wrap justify-end">

          {/* Toggle disparo de e-mails */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: disparoAtivo ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.08)', border: `1px solid ${disparoAtivo ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.3)'}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: disparoAtivo ? '#065f46' : '#92400e' }}>
              {disparoAtivo ? '✉️ Disparo ativo' : '⏸ Disparo pausado'}
            </span>
            <button onClick={toggleDisparo} disabled={togglingDisparo}
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{ background: disparoAtivo ? '#f59e0b' : '#10b981', color: 'white', border: 'none', cursor: togglingDisparo ? 'not-allowed' : 'pointer' }}>
              {togglingDisparo ? '…' : disparoAtivo ? 'Pausar' : '▶ Liberar'}
            </button>
          </div>

          {/* Toggle sistema de coleta */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: ativo ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: ativo ? '#10b981' : '#ef4444', border: `1px solid ${ativo ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ativo ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            {captacaoAtiva === null ? '…' : ativo ? 'Coleta ativa' : 'Coleta pausada'}
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
        const FONTE_META: Record<string, { icon: string; label: string; cor: string }> = {
          cnae:                 { icon: '🏭', label: 'CNAE/RF',       cor: '#10b981' },
          pncp_contrato:        { icon: '🏆', label: 'Contrato',      cor: '#6B0F1A' },
          pncp_proposta:        { icon: '👥', label: 'Proponente',    cor: '#3b82f6' },
          portal_transparencia: { icon: '🏛️', label: 'Transparência', cor: '#8b5cf6' },
          busca_manual:         { icon: '🔍', label: 'Manual',        cor: '#6b7280' },
        }
        const base = stats.leadsTotal || 1
        const barMaxH = 80
        return (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>Funil de captação</h2>
            <div className="flex items-end gap-3 flex-wrap">

              {/* Total coletados */}
              {(() => {
                const pct = 100
                const barH = barMaxH
                return (
                  <div className="flex flex-col items-center" style={{ minWidth: 72 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#6B0F1A' }}>{stats.leadsTotal.toLocaleString('pt-BR')}</div>
                    <div style={{ width: 56, height: barH, background: '#6B0F1A', borderRadius: 4, opacity: 0.85, margin: '4px 0' }} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--cinza)', textAlign: 'center' }}>📥 Coletados</div>
                    <div style={{ fontSize: 10, color: 'var(--cinza)' }}>{pct}%</div>
                  </div>
                )
              })()}

              {/* Breakdown por fonte (ordem decrescente, já vem da API) */}
              {stats.fonteBreakdown.length > 0 && (
                <>
                  <div style={{ width: 1, height: 60, background: 'var(--cinza-light)', alignSelf: 'center' }} />
                  {stats.fonteBreakdown.map(f => {
                    const meta = FONTE_META[f.fonte] ?? { icon: '📦', label: f.fonte, cor: '#6b7280' }
                    const pct = Math.round((f.total / base) * 100)
                    const barH = Math.max(6, Math.round((f.total / base) * barMaxH))
                    return (
                      <div key={f.fonte} className="flex flex-col items-center" style={{ minWidth: 64 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: meta.cor }}>{f.total.toLocaleString('pt-BR')}</div>
                        <div style={{ width: 48, height: barH, background: meta.cor, borderRadius: 4, opacity: 0.8, margin: '4px 0' }} />
                        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--cinza)', textAlign: 'center' }}>{meta.icon} {meta.label}</div>
                        <div style={{ fontSize: 9, color: 'var(--cinza)' }}>{pct}%</div>
                      </div>
                    )
                  })}
                  <div style={{ width: 1, height: 60, background: 'var(--cinza-light)', alignSelf: 'center' }} />
                </>
              )}

              {/* Etapas do funil de e-mail */}
              {[
                { label: 'E-mails env.', value: stats.leadsEnviados, cor: '#C9A65A', icon: '✉️' },
                { label: 'Abriram',      value: stats.leadsAbriram,  cor: '#3b82f6', icon: '👁️' },
                { label: 'Clicaram',     value: stats.leadsClicaram, cor: '#8b5cf6', icon: '🖱️' },
              ].map(e => {
                const pct = Math.round((e.value / base) * 100)
                const barH = Math.max(6, Math.round((e.value / base) * barMaxH))
                return (
                  <div key={e.label} className="flex flex-col items-center" style={{ minWidth: 72 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: e.cor }}>{e.value.toLocaleString('pt-BR')}</div>
                    <div style={{ width: 56, height: barH, background: e.cor, borderRadius: 4, opacity: 0.85, margin: '4px 0' }} />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
          {([
            { acao: 'coletar-leads',      label: '🎯 Coletar leads',    desc: 'Busca CNPJs/PNCP' },
            { acao: 'coletar-leads-cnae', label: '🏛️ Receita Federal',  desc: 'Coleta por CNAE (Storage)' },
            { acao: 'enriquecer-receita', label: '🔬 Enriquecer CNPJs', desc: 'Razão social + situação' },
            { acao: 'enriquecer-emails',  label: '🔎 Buscar e-mails',   desc: 'Google/Bing/DDG (lote 60)' },
            { acao: 'disparar-leads',     label: '✉️ Disparar leads',   desc: 'Envia e-mails captação' },
            { acao: 'radar-alertas',      label: '📡 Radar',            desc: 'Atualiza cache contratos' },
          ] as { acao: string; label: string; desc: string }[]).map(({ acao, label, desc }) => {
            const wf = GITHUB_WORKFLOWS[acao]
            const ativo = disparando === acao || disparando === wf
            return (
              <button key={acao} onClick={() => acionar(acao)} disabled={disparando !== null}
                style={{
                  padding: '10px 14px', borderRadius: '12px', textAlign: 'left', width: '100%',
                  background: ativo ? 'rgba(107,15,26,0.08)' : 'var(--surface-2)',
                  border: `1px solid ${ativo ? 'rgba(107,15,26,0.25)' : 'var(--cinza-light)'}`,
                  cursor: disparando ? 'not-allowed' : 'pointer',
                  opacity: disparando && !ativo ? 0.45 : 1,
                  transition: 'opacity 0.15s',
                }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ativo ? '⏳ Executando…' : label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
              </button>
            )
          })}
        </div>

        {/* Reset — linha separada abaixo dos crons, estilo discreto */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--cinza-light)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cinza)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Reset leads</span>
          {([
            { scope: 'enviados' as const, label: '↺ Enviados → pendente', title: 'Volta leads "enviado" para pendente',       bg: 'transparent', color: '#92400e', border: '#f59e0b' },
            { scope: 'todos'    as const, label: '↺ Incl. erros',         title: 'Inclui erro + inválido → pendente',        bg: 'transparent', color: '#991b1b', border: '#ef4444' },
            { scope: 'completo' as const, label: '↺ Zerar contadores',    title: 'Zera tudo — descadastrados vão p/ inválido', bg: 'transparent', color: '#5b21b6', border: '#8b5cf6' },
          ]).map(({ scope, label, title, bg, color, border }) => (
            <div key={scope}>
              <button
                onClick={() => resetLeads(scope)}
                disabled={resetando}
                title={title}
                style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: resetando ? 'var(--cinza-light)' : bg,
                  color: resetando ? 'var(--cinza)' : color,
                  border: `1px solid ${resetando ? 'var(--cinza-light)' : border}`,
                  cursor: resetando ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                {resetando ? '…' : label}
              </button>
            </div>
          ))}
          {resetMsg && (
            <span style={{ fontSize: 11, fontWeight: 600, color: resetMsg.startsWith('✓') ? '#10b981' : '#ef4444' }}>
              {resetMsg}
            </span>
          )}
        </div>
      </div>
      {/* ── Inserção manual de lead ── */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>Inserir lead manualmente</h2>
          <button
            onClick={() => { setShowInsercaoManual(v => !v); setInsercaoMsg(null) }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--cinza-light)', color: 'var(--cinza)', border: 'none', cursor: 'pointer' }}>
            {showInsercaoManual ? '▲ Recolher' : '▼ Expandir'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--cinza)', marginBottom: showInsercaoManual ? 16 : 0 }}>
          Adicione empresas que não constam na base — serão incluídas na fila de disparo.
        </p>
        {showInsercaoManual && (
          <form onSubmit={inserirLeadManual}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
              {([
                { field: 'razao_social', label: 'Razão social *',  placeholder: 'Nome da empresa',        required: true  },
                { field: 'cnpj',         label: 'CNPJ',            placeholder: '00.000.000/0000-00',      required: false },
                { field: 'email',        label: 'E-mail *',        placeholder: 'contato@empresa.com.br', required: true  },
                { field: 'telefone',     label: 'Telefone',        placeholder: '(11) 99999-9999',        required: false },
                { field: 'municipio',    label: 'Município',       placeholder: 'São Paulo',              required: false },
                { field: 'uf',           label: 'UF',              placeholder: 'SP',                     required: false },
                { field: 'segmento',     label: 'Segmento',        placeholder: 'construção, TI…',        required: false },
              ] as const).map(({ field, label, placeholder, required }) => (
                <div key={field}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--cinza)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={formManual[field]}
                    onChange={e => setFormManual(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    required={required}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', borderRadius: 8, fontSize: 12,
                      border: '1px solid var(--cinza-light)', outline: 'none',
                      background: 'var(--fundo)', color: 'var(--preto)',
                    }}
                  />
                </div>
              ))}
            </div>

            {insercaoMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 12, fontWeight: 600,
                background: insercaoMsg.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : insercaoMsg.tipo === 'dup' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.08)',
                color: insercaoMsg.tipo === 'ok' ? '#065f46' : insercaoMsg.tipo === 'dup' ? '#92400e' : '#991b1b',
                border: `1px solid ${insercaoMsg.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : insercaoMsg.tipo === 'dup' ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {insercaoMsg.tipo === 'dup' ? '⚠️ ' : ''}{insercaoMsg.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={inserindo}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: inserindo ? 'var(--cinza-light)' : 'var(--vinho)', color: inserindo ? 'var(--cinza)' : 'white', border: 'none', cursor: inserindo ? 'not-allowed' : 'pointer' }}>
              {inserindo ? '⏳ Inserindo…' : '+ Inserir lead'}
            </button>
          </form>
        )}
      </div>

        {/* Progresso dos backfills */}
        {(() => {
          const inicio = new Date('2000-01-01').getTime()
          const hoje   = new Date().getTime()
          const hojeIso = new Date().toISOString().slice(0, 10)

          const barras = [
            { label: '🏆 PNCP contratos/proponentes', data: backfillData,              cor: '#C9A65A', corOk: '#10b981', inicio: new Date('2021-01-01').getTime(), labelInicio: 'Jan 2021' },
            { label: '🏛️ Portal Transparência',       data: backfillTransparenciaData, cor: '#3b82f6', corOk: '#10b981', inicio: new Date('2014-01-01').getTime(), labelInicio: 'Jan 2014' },
          ]

          return (
            <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--cinza-light)' }}>
              {barras.map(({ label, data, cor, corOk, inicio: inicioBar, labelInicio }) => {
                const atual  = data ? new Date(data).getTime() : inicioBar
                const pct    = Math.min(100, Math.max(0, Math.round(((atual - inicioBar) / (hoje - inicioBar)) * 100)))
                const emBf   = data && data < hojeIso
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--cinza)' }}>
                        {label} — {emBf ? `próximo: ${data}` : '✅ modo contínuo'}
                      </span>
                      <span className="text-xs font-bold" style={{ color: emBf ? cor : corOk }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--cinza-light)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: emBf ? cor : corOk, borderRadius: 99, transition: 'width 0.5s' }} />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span style={{ fontSize: 9, color: 'var(--cinza)' }}>{labelInicio}</span>
                      <span style={{ fontSize: 9, color: 'var(--cinza)' }}>Hoje</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
        {/* Últimas execuções automáticas dos crons */}
        {Object.keys(ultimosResultados).length > 0 && (
          <div className="mt-4 pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--cinza-light)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>Última execução automática</h3>
            {CRONS_MONITORADOS.map(id => {
              const r = ultimosResultados[id]
              if (!r) return null
              const ts  = r.ts as string | undefined
              const ok  = r.ok !== false
              const ago = ts ? (() => {
                const d = Math.round((Date.now() - new Date(ts).getTime()) / 60000)
                if (d < 60) return `${d}min atrás`
                if (d < 1440) return `${Math.round(d/60)}h atrás`
                return `${Math.round(d/1440)}d atrás`
              })() : '—'

              // Monta resumo legível sem ts/ok/modo
              // Objetos aninhados (ex: receita: {verificados,ativos,inativas}) são expandidos
              const { ok: _ok, ts: _ts, modo, ...rest } = r
              const resumo = Object.entries(rest)
                .flatMap(([k, v]) => {
                  if (v === null || v === undefined) return []
                  if (typeof v === 'object' && !Array.isArray(v)) {
                    // expande sub-objeto como "k.subk: val"
                    return Object.entries(v as Record<string, unknown>)
                      .filter(([, sv]) => sv !== null && sv !== undefined && typeof sv !== 'object')
                      .map(([sk, sv]) => `${k}.${sk}: ${sv}`)
                  }
                  return [`${k}: ${v}`]
                })
                .join(' · ')

              return (
                <div key={id} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: ok ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.07)', border: `1px solid ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.2)'}` }}>
                  <span style={{ color: ok ? '#059669' : '#dc2626', fontWeight: 700, minWidth: 14 }}>{ok ? '✓' : '✗'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold" style={{ color: 'var(--escuro)' }}>{id}</span>
                    {modo != null && <span style={{ color: 'var(--cinza)', marginLeft: 6 }}>{String(modo).slice(0, 60)}</span>}
                    {resumo && <div style={{ color: ok ? '#065f46' : '#991b1b', marginTop: 1 }}>{resumo}</div>}
                  </div>
                  <span style={{ color: 'var(--cinza)', whiteSpace: 'nowrap', flexShrink: 0 }}>{ago}</span>
                </div>
              )
            })}
          </div>
        )}

        {resultadoCron && (
          <div className="mt-3 px-4 py-3 rounded-xl text-xs"
            style={{ background: resultadoCron.ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${resultadoCron.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: resultadoCron.ok ? '#065f46' : '#991b1b' }}>
            <div className="font-bold mb-1.5">{resultadoCron.ok ? '✓' : '✗'} {resultadoCron.acao}</div>
            {resultadoCron.data && typeof resultadoCron.data === 'object' ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(resultadoCron.data as Record<string, unknown>)
                  .filter(([k]) => k !== 'ok')
                  .map(([k, v]) => (
                    <span key={k}><span className="opacity-60">{k}:</span> <strong>{String(v)}</strong></span>
                  ))}
              </div>
            ) : (
              <span className="font-mono">{String(resultadoCron.data)}</span>
            )}
          </div>
        )}

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
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>Fonte</label>
              <select value={filtroFonte} onChange={e => setFiltroFonte(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}>
                <option value="todos">Todos</option>
                <option value="pncp_contrato">🏆 Contrato</option>
                <option value="pncp_proposta">👥 Proponente</option>
                <option value="portal_transparencia">🏛️ Transparência</option>
                <option value="busca_manual">🔍 Manual</option>
                <option value="cnae">🏭 CNAE / RF</option>
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
                  {CNAES_SUGERIDOS.map(c => (
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
            {filtroQ || filtroStatus !== 'todos' || filtroUF !== 'todos' || filtroFonte !== 'todos' || filtroCNAE ? (
              <button onClick={() => { setFiltroQ(''); setFiltroStatus('todos'); setFiltroUF('todos'); setFiltroFonte('todos'); setFiltroCNAE('') }}
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
                    {([
                      { label: '',           col: null              },
                      { label: 'Empresa',    col: 'razao_social'    },
                      { label: 'E-mail',     col: 'email'           },
                      { label: 'Cidade/UF',  col: 'municipio'       },
                      { label: 'Setor (CNAE)', col: 'cnae'          },
                      { label: 'Fonte',      col: 'fonte'           },
                      { label: 'Status',     col: 'status'          },
                      { label: 'Enviado em', col: 'enviado_em'      },
                      { label: 'Ações',      col: null              },
                    ] as { label: string; col: string | null }[]).map(({ label, col }) => {
                      const ativa = col && ordemCol === col
                      return (
                        <th key={label || '_check'}
                          className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: 'var(--cinza)' }}>
                          {col ? (
                            <button
                              onClick={() => {
                                if (ordemCol === col) {
                                  const novaDir = ordemDir === 'asc' ? 'desc' : 'asc'
                                  ordemDirRef.current = novaDir
                                  setOrdemDir(novaDir)
                                } else {
                                  ordemColRef.current = col
                                  ordemDirRef.current = 'asc'
                                  setOrdemCol(col)
                                  setOrdemDir('asc')
                                }
                                carregarLeadsDB(1)
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                                color: ativa ? 'var(--vinho)' : 'var(--cinza)',
                                fontWeight: 700, fontSize: 'inherit', letterSpacing: 'inherit',
                                textTransform: 'inherit', padding: 0,
                              }}>
                              {label}
                              <span style={{ fontSize: 10, lineHeight: 1, opacity: ativa ? 1 : 0.35 }}>
                                {ativa ? (ordemDir === 'asc' ? '▲' : '▼') : '⇅'}
                              </span>
                            </button>
                          ) : label}
                        </th>
                      )
                    })}
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
                          <div className="font-semibold truncate" style={{ color: 'var(--preto)' }} title={l.razao_social ?? l.nome_fantasia ?? ''}>
                            {l.razao_social || l.nome_fantasia}
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
                            const fonte = l.origem === 'cnae' ? 'cnae' : l.fonte
                            const map: Record<string, { label: string; bg: string; color: string }> = {
                              pncp_contrato:        { label: '🏆 Contrato',       bg: 'rgba(107,15,26,0.08)',  color: '#6B0F1A' },
                              pncp_proposta:        { label: '👥 Proponente',     bg: 'rgba(59,130,246,0.08)', color: '#1e40af' },
                              portal_transparencia: { label: '🏛️ Transparência', bg: 'rgba(139,92,246,0.08)', color: '#5b21b6' },
                              busca_manual:         { label: '🔍 Manual',         bg: 'rgba(107,114,128,0.1)', color: '#374151' },
                              cnae:                 { label: '🏭 CNAE/RF',        bg: 'rgba(16,185,129,0.08)', color: '#065f46' },
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
                                <div style={{ gridColumn: 'span 2' }}>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>Contrato de origem</div>
                                  <div style={{ color: 'var(--preto)', lineHeight: 1.6 }}>{capitalizar(l.objeto)}</div>
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
                                  <div style={{ color: 'var(--preto)' }}>
                                    {l.telefone
                                      ? <a href={`tel:+55${l.telefone.replace(/\D/g,'')}`} style={{ color: 'var(--vinho)', textDecoration: 'none' }}>{fmtTelefone(l.telefone)}</a>
                                      : '—'}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)', fontSize: 10 }}>E-mail</div>
                                  <div style={{ color: 'var(--preto)' }}>
                                    {l.email
                                      ? <a href={`mailto:${l.email}`} style={{ color: 'var(--vinho)', textDecoration: 'none' }}>{l.email}</a>
                                      : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>não encontrado</span>}
                                  </div>
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
