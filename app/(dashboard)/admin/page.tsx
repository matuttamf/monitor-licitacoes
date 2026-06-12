'use client'

import { useEffect, useState } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Usuario = {
  id: string
  email: string
  is_admin?: boolean
  status: 'trial' | 'active' | 'expired' | 'bloqueado'
  plano: string
  trial_inicio: string
  trial_fim: string
  criado_em: string
  trial_expirado: boolean
  nome?: string
  telefone?: string
  whatsapp?: string
  empresa?: string
  keyword_count: number
  alerta_count: number
  ultimo_alerta: string | null
  owner_id?: string | null
  bloqueado_admin?: boolean
}

type Keyword    = { id: string; termo: string; ativo: boolean; criado_em: string }
type Alerta     = {
  id: string; criado_em: string; canais: string[]
  licitacoes: { objeto: string; orgao: string; valor_estimado?: number; data_abertura?: string } | null
}
type SubUsuario = { id: string; nome: string | null; email: string }
type ContaDetalhe = { keywords: Keyword[]; alertas: Alerta[]; subUsuarios: SubUsuario[] }

type Stats = {
  totalUsuarios: number; totalAtivos: number; totalTrial: number; totalExpired: number
  totalMembros: number
  totalKeywords: number; totalAlertas: number; totalLicitacoes: number
  alertasHoje: number; alertas7d: number
  leadsPendentes: number; leadsEnviados: number; leadsTotal: number
  leadsInvalido: number; leadsErro: number; leadsDescadastrado: number
  leadsAbriram: number; leadsClicaram: number
}

type CronLog = { id: string; job: string; status: string; mensagem: string; detalhes: unknown; criado_em: string }
type CronData = { logs: CronLog[]; ultimasPorJob: Record<string, { status: string; mensagem: string; criado_em: string } | null> }

type PreviewFinanceiro = { kpis: { mrr: number; arr: number; totalPagantes: number; totalTrials: number; totalExpirados: number; ticketMedio: number; taxaConversao: number; churnMensal: number; novas7d: number; receita7d: number } } | null
type PreviewCampanhas  = { totais: { total: number; comAtribuicao: number }; campanhas: { metricas: { mrr: number; conversoes: number } }[] } | null

// ─── Config visual ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; cor: string; bg: string }> = {
  active:    { label: 'Ativo',      cor: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  trial:     { label: 'Trial',      cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)'  },
  expired:   { label: 'Expirado',   cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  bloqueado: { label: 'Bloqueado',  cor: '#6B0F1A', bg: 'rgba(107,15,26,0.1)'   },
}

const JOB_LABELS: Record<string, string> = {
  coletar:                'Coleta editais',
  matching:               'Matching IA',
  alertar:                'Alertas e-mail',
  'alertar-urgente':      'Alertas Telegram/WA',
  'emails-trial':         'E-mails trial',
  'expirar-trials':       'Expirar trials',
  'resumo-semanal':       'Resumo semanal',
  'enriquecer-receita':   'Enriquecer Receita Federal',
  'enriquecer-emails':    'Enriquecer e-mails (web)',
  'disparar-leads':       'Disparar leads',
  'coletar-leads':        'Coletar leads',
  'coletar-leads-cnae':   'Coletar leads CNAE',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt     = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
const fmtHora = (d: string | null) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'
const diasAte  = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
const moeda    = (v?: number) => v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminPage() {
  const [usuarios, setUsuarios]   = useState<Usuario[]>([])
  const [stats, setStats]         = useState<Stats | null>(null)
  const [cronData, setCronData]   = useState<CronData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]           = useState('')
  const [aba, setAba]             = useState<'usuarios' | 'cron'>('usuarios')

  // Filtros
  const [busca, setBusca]         = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'active' | 'trial' | 'expired'>('todos')

  // Edição
  const [editando, setEditando]   = useState<Usuario | null>(null)
  const [salvando, setSalvando]   = useState(false)

  // Trigger manual
  const [disparando, setDisparando] = useState<string | null>(null)
  const [resultadoTrigger, setResultadoTrigger] = useState<{ ok: boolean; status: number; data: unknown } | null>(null)

  // Filtro cron
  const [filtroJob, setFiltroJob] = useState<string>('todos')

  // Drawer conta
  const [contaAberta, setContaAberta]   = useState<Usuario | null>(null)
  const [contaDetalhe, setContaDetalhe] = useState<ContaDetalhe | null>(null)
  const [carregandoConta, setCarregandoConta] = useState(false)

  // Configurações
  const [cadastroBloqueado, setCadastroBloqueado] = useState(false)
  const [togglingCadastro, setTogglingCadastro]   = useState(false)
  const [cronsBloqueados, setCronsBloqueados]     = useState(false)
  const [togglingCrons, setTogglingCrons]         = useState(false)
  const [prevFinanceiro, setPrevFinanceiro] = useState<PreviewFinanceiro>(null)
  const [prevCampanhas,  setPrevCampanhas]  = useState<PreviewCampanhas>(null)

  async function carregar() {
    setCarregando(true)
    setErro('')
    const [resU, resS, resC, resCfg, resCrons, resF, resCamp] = await Promise.all([
      fetch('/api/admin/usuarios'),
      fetch('/api/admin/stats'),
      fetch('/api/admin/cron-logs'),
      fetch('/api/admin/captacao-config?chave=cadastro_bloqueado'),
      fetch('/api/admin/captacao-config?chave=crons_bloqueados'),
      fetch('/api/admin/financeiro'),
      fetch('/api/admin/campanhas'),
    ])
    if (!resU.ok) {
      const body = await resU.json().catch(() => ({}))
      setErro(`Erro ao carregar (${resU.status}): ${(body as { error?: string }).error ?? 'verifique se ADMIN_EMAIL está correto na Vercel'}`)
      setCarregando(false)
      return
    }
    const [u, s, c, cfg, cfgCrons] = await Promise.all([resU.json(), resS.json(), resC.json(), resCfg.json(), resCrons.json()])
    setUsuarios(u)
    setStats(s)
    setCronData(c)
    setCadastroBloqueado(cfg.valor === 'true' || cfg.valor === true)
    setCronsBloqueados(cfgCrons.valor === 'true' || cfgCrons.valor === true)
    if (resF.ok) setPrevFinanceiro(await resF.json())
    if (resCamp.ok) setPrevCampanhas(await resCamp.json())
    setCarregando(false)
  }

  async function toggleCadastro() {
    setTogglingCadastro(true)
    const novoValor = !cadastroBloqueado
    await fetch('/api/admin/captacao-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chave: 'cadastro_bloqueado', valor: String(novoValor) }),
    })
    setCadastroBloqueado(novoValor)
    setTogglingCadastro(false)
  }

  async function toggleCrons() {
    setTogglingCrons(true)
    const novoValor = !cronsBloqueados
    await fetch('/api/admin/captacao-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chave: 'crons_bloqueados', valor: String(novoValor) }),
    })
    setCronsBloqueados(novoValor)
    setTogglingCrons(false)
  }

  useEffect(() => { carregar() }, [])

  async function abrirConta(u: Usuario) {
    setContaAberta(u)
    setContaDetalhe(null)
    setCarregandoConta(true)
    const res = await fetch(`/api/admin/conta/${u.id}`)
    if (res.ok) setContaDetalhe(await res.json())
    setCarregandoConta(false)
  }

  async function alterarStatus(id: string, status: string) {
    await fetch('/api/admin/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    carregar()
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvando(true)
    await fetch('/api/admin/usuarios', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editando.id, nome: editando.nome, telefone: editando.telefone, whatsapp: editando.whatsapp, empresa: editando.empresa, plano: editando.plano, status: editando.status }),
    })
    setSalvando(false)
    setEditando(null)
    carregar()
  }

  async function dispararAcao(acao: string) {
    setDisparando(acao)
    setResultadoTrigger(null)

    // coletar-leads-cnae roda via GitHub Actions (sem limite de tempo, IP brasileiro)
    if (acao === 'coletar-leads-cnae') {
      const res = await fetch('/api/admin/trigger-github', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflow: 'coletar-leads-rfb.yml' }) })
      setResultadoTrigger({ ok: res.ok, status: res.status, data: await res.json() })
      setDisparando(null)
      return
    }

    const res = await fetch('/api/admin/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao }) })
    setResultadoTrigger({ ok: res.ok, status: res.status, data: await res.json() })
    setDisparando(null)
    carregar() // atualiza logs
  }

  // Separar owners e sub-usuários
  const owners    = usuarios.filter(u => !u.owner_id)
  const subUsers  = usuarios.filter(u => !!u.owner_id)

  // Mapa owner_id → nome para exibir no badge do sub-usuário
  const ownerNomeMap = Object.fromEntries(owners.map(o => [o.id, o.nome || o.email]))

  // Filtragem — aplicada apenas nos owners; sub-usuários aparecem junto do seu owner
  const ownersFiltrados = owners.filter(u => {
    const statusEfetivo = (u.trial_expirado && u.status === 'trial') ? 'expired' : u.status
    if (filtroStatus !== 'todos' && statusEfetivo !== filtroStatus) return false
    if (busca) {
      const q = busca.toLowerCase()
      return u.email.toLowerCase().includes(q) || (u.nome ?? '').toLowerCase().includes(q) || (u.empresa ?? '').toLowerCase().includes(q)
    }
    return true
  })

  // Lista final: cada owner seguido dos seus sub-usuários
  type RowItem = Usuario & { isSubUser: boolean; ownerNome?: string }
  const usuariosFiltrados: RowItem[] = ownersFiltrados.flatMap(owner => [
    { ...owner, isSubUser: false },
    ...subUsers
      .filter(s => s.owner_id === owner.id)
      .map(s => ({ ...s, isSubUser: true, ownerNome: ownerNomeMap[owner.id] })),
  ])

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>Painel Administrativo</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>Visão geral do sistema</p>
        </div>
        <button onClick={carregar} style={{ fontSize: '12px', color: 'var(--cinza)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--cinza-light)', background: 'white', cursor: 'pointer' }}>
          ↺ Atualizar
        </button>
      </div>

      {erro && <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{erro}</div>}

      {/* ── KPI Cards ── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Usuários',         value: stats.totalAtivos + stats.totalTrial + stats.totalExpired + stats.totalMembros,   sub: `owners + membros`,               cor: '#6B0F1A' },
            { label: 'Ativos',           value: stats.totalAtivos,     sub: 'assinantes pagos',               cor: '#10b981' },
            { label: 'Em trial',         value: stats.totalTrial,      sub: 'período grátis',                 cor: '#C9A65A' },
            { label: 'Membros equipe',   value: stats.totalMembros,    sub: 'sub-usuários ativos',            cor: '#8b5cf6' },
            { label: 'Keywords ativas',  value: stats.totalKeywords,   sub: 'monitoradas',                    cor: '#3b82f6' },
            { label: 'Alertas hoje',     value: stats.alertasHoje,     sub: `${stats.alertas7d} nos 7 dias`,  cor: '#8b5cf6' },
            { label: 'Total alertas',    value: stats.totalAlertas,    sub: 'desde o início',                 cor: '#6B0F1A' },
            { label: 'Licitações',       value: stats.totalLicitacoes, sub: 'no banco',                       cor: '#0ea5e9' },
          ].map(({ label, value, sub, cor }) => (
            <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: cor, letterSpacing: '-0.03em' }}>
                {value.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--preto)', marginTop: '2px' }}>{label}</div>
              <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '1px' }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Funil de Leads ── */}
      {stats && stats.leadsTotal > 0 && (() => {
        const leadsComEmail = stats.leadsPendentes + stats.leadsEnviados
        const taxaEmail     = stats.leadsTotal > 0 ? Math.round(leadsComEmail / stats.leadsTotal * 100) : 0
        const taxaAbertura  = stats.leadsEnviados > 0 ? Math.round(stats.leadsAbriram / stats.leadsEnviados * 100) : 0
        const taxaClique    = stats.leadsAbriram  > 0 ? Math.round(stats.leadsClicaram / stats.leadsAbriram  * 100) : 0
        const kpis = [
          { label: 'Total coletados',   value: stats.leadsTotal,          sub: 'base completa',            cor: '#6B0F1A' },
          { label: 'Sem e-mail',        value: stats.leadsInvalido,       sub: 'em enriquecimento',        cor: '#94a3b8' },
          { label: 'Com e-mail',        value: leadsComEmail,             sub: `${taxaEmail}% da base`,    cor: '#3b82f6' },
          { label: 'Aguardando envio',  value: stats.leadsPendentes,      sub: 'fila de disparo',          cor: '#C9A65A' },
          { label: 'Disparados',        value: stats.leadsEnviados,       sub: 'e-mails enviados',         cor: '#10b981' },
          { label: 'Abriram',           value: stats.leadsAbriram,        sub: `${taxaAbertura}% abertura`, cor: '#8b5cf6' },
          { label: 'Clicaram',          value: stats.leadsClicaram,       sub: `${taxaClique}% de clique`, cor: '#f59e0b' },
          { label: 'Descadastrados',    value: stats.leadsDescadastrado,  sub: 'opt-out',                  cor: '#ef4444' },
        ]
        return (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cinza)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Funil de captação
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {kpis.map(({ label, value, sub, cor }) => (
                <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: cor, letterSpacing: '-0.03em' }}>
                    {value.toLocaleString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--preto)', marginTop: '2px' }}>{label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '1px' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ── Módulos com prévias ── */}
      {(() => {
        // Dados pré-calculados para Saúde
        const jobs     = cronData ? Object.entries(cronData.ultimasPorJob) : []
        const jobsOk   = jobs.filter(([, v]) => v?.status === 'ok' || v?.status === 'sucesso').length
        const jobsErro = jobs.filter(([, v]) => v?.status === 'erro').length
        const jobsSem  = jobs.filter(([, v]) => !v).length

        // Últimas execuções por job, ordenadas pela mais recente
        const jogsRecentes = jobs
          .filter(([, v]) => !!v)
          .sort(([, a], [, b]) => new Date((b!).criado_em).getTime() - new Date((a!).criado_em).getTime())
          .slice(0, 3)
          .map(([nome, v]) => ({
            nome: JOB_LABELS[nome] ?? nome,
            status: v!.status,
            hora: fmtHora(v!.criado_em),
            erro: v!.status === 'erro',
          }))

        // Dados pré-calculados para Campanhas
        const campTotal    = prevCampanhas?.campanhas?.filter((c: unknown) => (c as { ativo: boolean }).ativo)?.length ?? 0
        const campUTM      = prevCampanhas?.totais?.comAtribuicao ?? 0
        const campConv     = prevCampanhas?.campanhas?.reduce((s: number, c: { metricas: { conversoes: number } }) => s + (c.metricas?.conversoes ?? 0), 0) ?? 0
        const campMRR      = prevCampanhas?.campanhas?.reduce((s: number, c: { metricas: { mrr: number } }) => s + (c.metricas?.mrr ?? 0), 0) ?? 0

        type CardDef = {
          href: string
          titulo: string
          cor: string
          bg: string
          border: string
          kpiVal: string
          kpiLabel: string
          chips: { label: string; val: string; cor: string }[]
          nota?: string
          notaCor?: string
          lista?: { nome: string; status: string; hora: string; erro: boolean }[]
          miniGrid?: { rows: { label: string; val: string; cor: string }[][]; footer?: string }
          vazio: boolean
          vazioMsg: string
        }

        // Ordem alfabética: Campanhas → Captação → Financeiro → Saúde
        const cards: CardDef[] = [
          {
            href: '/admin/campanhas',
            titulo: '📣 Campanhas',
            cor: '#8b5cf6', bg: 'rgba(139,92,246,0.05)', border: 'rgba(139,92,246,0.2)',
            kpiVal:   prevCampanhas ? String(campTotal) : '—',
            kpiLabel: 'campanhas ativas',
            chips: [
              { label: 'Com UTM',    val: prevCampanhas ? String(campUTM)  : '—', cor: '#8b5cf6' },
              { label: 'Conversões', val: prevCampanhas ? String(campConv) : '—', cor: '#10b981' },
              { label: 'MRR gerado', val: prevCampanhas ? campMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : '—', cor: '#10b981' },
            ],
            vazio:   !prevCampanhas,
            vazioMsg: carregando ? 'Carregando…' : 'Aguardando migração DB',
          },
          {
            href: '/admin/captacao',
            titulo: '🎯 Captação',
            cor: '#a07a20', bg: 'rgba(201,166,90,0.05)', border: 'rgba(201,166,90,0.2)',
            kpiVal:   stats ? stats.leadsTotal.toLocaleString('pt-BR') : '—',
            kpiLabel: 'leads coletados',
            chips: [
              { label: 'Pendentes', val: stats ? stats.leadsPendentes.toLocaleString('pt-BR') : '—', cor: '#C9A65A' },
              { label: 'Enviados',  val: stats ? stats.leadsEnviados.toLocaleString('pt-BR')  : '—', cor: '#10b981' },
              { label: 'Taxa',      val: stats && stats.leadsTotal > 0 ? `${Math.round(stats.leadsEnviados / stats.leadsTotal * 100)}%` : '—', cor: '#3b82f6' },
            ],
            nota:    cadastroBloqueado ? '⚠ Cadastro bloqueado' : undefined,
            notaCor: '#ef4444',
            vazio:   !stats,
            vazioMsg: carregando ? 'Carregando…' : 'Sem dados',
          },
          {
            href: '/admin/financeiro',
            titulo: '💰 Financeiro',
            cor: '#10b981', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)',
            kpiVal:   prevFinanceiro ? prevFinanceiro.kpis.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : '—',
            kpiLabel: 'MRR mensal',
            chips: prevFinanceiro ? [
              { label: 'Pagantes',     val: String(prevFinanceiro.kpis.totalPagantes),  cor: '#10b981' },
              { label: 'Em trial',     val: String(prevFinanceiro.kpis.totalTrials),    cor: '#C9A65A' },
              { label: 'Expirados',    val: String(prevFinanceiro.kpis.totalExpirados), cor: '#ef4444' },
              { label: 'ARR',          val: prevFinanceiro.kpis.arr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }), cor: '#3b82f6' },
              { label: 'Ticket médio', val: prevFinanceiro.kpis.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }), cor: '#8b5cf6' },
              { label: 'Conversão',    val: `${prevFinanceiro.kpis.taxaConversao}%`, cor: '#C9A65A' },
            ] : [],
            nota: prevFinanceiro
              ? (prevFinanceiro.kpis.churnMensal > 0
                  ? `⚠ Churn 30d: ${prevFinanceiro.kpis.churnMensal}`
                  : `📈 Novos 7d: ${prevFinanceiro.kpis.novas7d} · ${prevFinanceiro.kpis.receita7d.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}`)
              : undefined,
            notaCor: prevFinanceiro && prevFinanceiro.kpis.churnMensal > 0 ? '#ef4444' : '#3b82f6',
            vazio:   !prevFinanceiro,
            vazioMsg: carregando ? 'Carregando…' : 'Aguardando migração DB',
          },
          {
            href: '/admin/saude',
            titulo: '🏥 Saúde',
            cor: jobsErro > 0 ? '#ef4444' : '#f97316',
            bg:     'rgba(249,115,22,0.05)', border: 'rgba(249,115,22,0.2)',
            kpiVal:   cronData ? (jobsErro > 0 ? `${jobsErro} erro${jobsErro > 1 ? 's' : ''}` : `${jobsOk}/${jobs.length} OK`) : '—',
            kpiLabel: cronData ? (jobsErro > 0 ? 'jobs com falha' : 'jobs rodando bem') : '',
            chips: [
              { label: 'Monitorados',  val: cronData ? String(jobs.length) : '—', cor: '#f97316' },
              { label: 'Com erro',     val: cronData ? String(jobsErro)    : '—', cor: jobsErro > 0 ? '#ef4444' : 'var(--cinza)' },
              { label: 'Sem execução', val: cronData ? String(jobsSem)     : '—', cor: jobsSem  > 0 ? '#C9A65A' : 'var(--cinza)' },
            ],
            lista: jogsRecentes,
            vazio:   !cronData,
            vazioMsg: carregando ? 'Carregando…' : 'Sem dados',
          },
        ]

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {cards.map(card => (
              <a key={card.href} href={card.href} style={{
                textDecoration: 'none', display: 'flex', flexDirection: 'column',
                padding: '16px', borderRadius: '14px',
                background: card.bg, border: `1px solid ${card.border}`,
              }}>
                {/* Cabeçalho */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: card.cor, letterSpacing: '0.01em' }}>{card.titulo}</span>
                  <span style={{ fontSize: '10px', color: 'var(--cinza)', opacity: 0.6 }}>→</span>
                </div>

                {/* KPI principal */}
                <div style={{ fontSize: '24px', fontWeight: 900, color: card.cor, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {card.kpiVal}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '3px', marginBottom: '12px', minHeight: '14px' }}>
                  {card.kpiLabel}
                </div>

                {/* Chips normais ou mini-grid (Financeiro) */}
                {card.miniGrid ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {card.miniGrid.rows.map((row, ri) => (
                      <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '5px' }}>
                        {row.map(chip => (
                          <div key={chip.label} style={{
                            padding: '5px 4px', borderRadius: '7px', background: 'white',
                            textAlign: 'center', border: '1px solid var(--cinza-light)',
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: chip.cor, letterSpacing: '-0.02em' }}>{chip.val}</div>
                            <div style={{ fontSize: '8px', color: 'var(--cinza)', marginTop: '1px', lineHeight: 1.2 }}>{chip.label}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                    {card.miniGrid.footer && (
                      <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                        📈 {card.miniGrid.footer}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {card.chips.map(chip => (
                      <div key={chip.label} style={{
                        padding: '6px 4px', borderRadius: '8px', background: 'white',
                        textAlign: 'center', border: '1px solid var(--cinza-light)',
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: chip.cor, letterSpacing: '-0.02em' }}>{chip.val}</div>
                        <div style={{ fontSize: '9px', color: 'var(--cinza)', marginTop: '2px', lineHeight: 1.2 }}>{chip.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lista de execuções (Saúde) ou nota/alerta (demais) */}
                {card.lista ? (
                  <div style={{ marginTop: '10px' }}>
                    {card.lista.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '3px 0',
                        borderTop: i > 0 ? '1px solid var(--cinza-light)' : undefined,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                          <span style={{ fontSize: '8px', color: item.erro ? '#ef4444' : '#10b981', flexShrink: 0 }}>
                            {item.erro ? '✕' : '✓'}
                          </span>
                          <span style={{
                            fontSize: '10px', color: item.erro ? '#ef4444' : 'var(--preto)',
                            fontWeight: item.erro ? 600 : 400,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{item.nome}</span>
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--cinza)', flexShrink: 0, marginLeft: '4px' }}>{item.hora}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', fontSize: '10px', color: card.notaCor ?? 'transparent', minHeight: '14px', lineHeight: 1.3 }}>
                    {card.nota ?? ''}
                  </div>
                )}
              </a>
            ))}
          </div>
        )
      })()}

      {/* ── Configurações ── */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>Configurações</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCadastro}
            disabled={togglingCadastro}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', borderRadius: '12px', cursor: togglingCadastro ? 'not-allowed' : 'pointer',
              background: cadastroBloqueado ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
              border: `1px solid ${cadastroBloqueado ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
              opacity: togglingCadastro ? 0.6 : 1,
            }}
          >
            {/* pill toggle */}
            <div style={{
              width: 36, height: 20, borderRadius: 10, position: 'relative', transition: 'background .2s',
              background: cadastroBloqueado ? '#ef4444' : '#10b981',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: cadastroBloqueado ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: cadastroBloqueado ? '#ef4444' : '#10b981' }}>
                {cadastroBloqueado ? '🔒 Cadastro bloqueado' : '🟢 Cadastro aberto'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--cinza)', marginTop: 1 }}>
                {cadastroBloqueado ? 'Novos usuários não conseguem se registrar' : 'Qualquer pessoa pode criar conta'}
              </div>
            </div>
          </button>

          {/* Botão pausa do sistema */}
          <button
            onClick={toggleCrons}
            disabled={togglingCrons}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', borderRadius: '12px', cursor: togglingCrons ? 'not-allowed' : 'pointer',
              background: cronsBloqueados ? 'rgba(239,68,68,0.06)' : 'rgba(107,15,26,0.04)',
              border: `1px solid ${cronsBloqueados ? 'rgba(239,68,68,0.35)' : 'rgba(107,15,26,0.15)'}`,
              opacity: togglingCrons ? 0.6 : 1,
            }}
          >
            <div style={{
              width: 36, height: 20, borderRadius: 10, position: 'relative', transition: 'background .2s',
              background: cronsBloqueados ? '#ef4444' : '#10b981',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: cronsBloqueados ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: cronsBloqueados ? '#ef4444' : '#10b981' }}>
                {cronsBloqueados ? '🚨 Sistema pausado' : '⚙️ Sistema ativo'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--cinza)', marginTop: 1 }}>
                {cronsBloqueados ? 'Todos os crons retornam 503 (manutenção)' : 'Crons executando normalmente'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Trigger manual ── */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>Acionar manualmente</h2>
        {([
          { grupo: 'Licitações', itens: [
            { acao: 'coletar',         label: '🔍 Coletar',         desc: 'Busca novos editais' },
            { acao: 'coletar-abertos', label: '📂 Abertos (PNCP)',  desc: 'Todos com prazo futuro' },
            { acao: 'matching',        label: '🤖 Matching',        desc: 'Gera candidatos' },
            { acao: 'alertar',         label: '📧 Alertar',         desc: 'Envia alertas' },
            { acao: 'emails',          label: '📩 E-mails trial',   desc: 'Sequência trial' },
          ]},
          { grupo: 'Captação', itens: [
            { acao: 'coletar-leads',      label: '🎯 Coletar leads',     desc: 'Busca CNPJs/PNCP' },
            { acao: 'coletar-leads-cnae', label: '🏛️ Receita Federal',   desc: 'Coleta por CNAE (Storage)' },
            { acao: 'enriquecer-receita', label: '🔬 Enriquecer CNPJs',  desc: 'Razão social + situação' },
            { acao: 'enriquecer-emails',  label: '🔎 Buscar e-mails',    desc: 'Google/Bing/DDG (lote 60)' },
            { acao: 'disparar-leads',     label: '✉️ Disparar leads',    desc: 'Envia e-mails captação' },
            { acao: 'radar-alertas',      label: '📡 Radar',             desc: 'Atualiza cache contratos' },
          ]},
        ] as { grupo: string; itens: { acao: string; label: string; desc: string }[] }[]).map(({ grupo, itens }) => (
          <div key={grupo} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '6px' }}>{grupo}</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${itens.length}, 1fr)`, gap: '8px' }}>
              {itens.map(({ acao, label, desc }) => (
                <button key={acao} onClick={() => dispararAcao(acao)} disabled={disparando !== null}
                  style={{
                    padding: '10px 14px', borderRadius: '12px', textAlign: 'left', width: '100%',
                    background: disparando === acao ? 'rgba(107,15,26,0.08)' : 'var(--surface-2)',
                    border: `1px solid ${disparando === acao ? 'rgba(107,15,26,0.25)' : 'var(--cinza-light)'}`,
                    cursor: disparando ? 'not-allowed' : 'pointer',
                    opacity: disparando && disparando !== acao ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                  }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {disparando === acao ? '⏳ Executando…' : label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {resultadoTrigger && (
          <div className="mt-3 rounded-xl p-3" style={{ background: resultadoTrigger.ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${resultadoTrigger.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div className="text-xs font-semibold mb-1" style={{ color: resultadoTrigger.ok ? '#10b981' : '#ef4444' }}>
              {resultadoTrigger.ok ? '✓ Executado' : '⚠ Erro'} — HTTP {resultadoTrigger.status}
            </div>
            <pre className="text-xs overflow-auto" style={{ color: 'var(--cinza)', maxHeight: '100px', margin: 0 }}>
              {JSON.stringify(resultadoTrigger.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ── Abas ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {(['usuarios', 'cron'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)}
            style={{
              padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              background: aba === a ? 'var(--vinho)' : 'white',
              color: aba === a ? 'white' : 'var(--cinza)',
              border: aba === a ? 'none' : '1px solid var(--cinza-light)',
            } as React.CSSProperties}>
            {a === 'usuarios' ? `Usuários (${owners.length})` : 'Cron logs'}
          </button>
        ))}
      </div>

      {/* ══ ABA USUÁRIOS ══ */}
      {aba === 'usuarios' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por e-mail, nome ou empresa…"
              style={{ flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white' }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['todos', 'active', 'trial', 'expired'] as const).map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: filtroStatus === s ? (s === 'active' ? '#10b981' : s === 'trial' ? '#C9A65A' : s === 'expired' ? '#ef4444' : 'var(--vinho)') : 'white',
                    color: filtroStatus === s ? 'white' : 'var(--cinza)',
                    border: filtroStatus === s ? 'none' : '1px solid var(--cinza-light)',
                  } as React.CSSProperties}>
                  {s === 'todos' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'trial' ? 'Trial' : 'Expirados'}
                </button>
              ))}
            </div>
          </div>

          {carregando ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3].map(i => <div key={i} className="animate-pulse rounded-2xl" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '68px' }} />)}
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
              <p style={{ color: 'var(--cinza)' }}>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                    {['Usuário', 'Status / Plano', 'Keywords', 'Alertas', 'Último alerta', 'Cadastro', 'Ações'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(u => {
                    const expirado  = u.trial_expirado && u.status === 'trial'
                    const statusEfetivo = expirado ? 'expired' : u.status
                    const cfg = statusConfig[statusEfetivo]
                    return (
                      <tr key={u.id}
                        style={{
                          borderBottom: '1px solid var(--cinza-light)',
                          background: u.isSubUser ? 'rgba(107,15,26,0.02)' : undefined,
                        }}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {/* Indentação visual para sub-usuários */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            {u.isSubUser && (
                              <div style={{ paddingTop: '3px', color: 'var(--cinza-light)', fontSize: '14px', flexShrink: 0 }}>↳</div>
                            )}
                            <div>
                              <div className="font-medium" style={{ color: 'var(--preto)' }}>{u.nome || '—'}</div>
                              <div className="text-xs mt-0.5" style={{ color: 'var(--cinza)' }}>{u.email}</div>
                              {u.isSubUser && u.ownerNome && (
                                <div className="text-xs mt-0.5" style={{ color: '#C9A65A' }}>
                                  👥 Equipe de {u.ownerNome}
                                </div>
                              )}
                              {!u.isSubUser && u.empresa && (
                                <div className="text-xs" style={{ color: 'var(--cinza)' }}>{u.empresa}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_admin ? (
                            <span className="text-xs font-bold px-2 py-1 rounded-lg inline-block" style={{ background: 'rgba(107,15,26,0.12)', color: 'var(--vinho)', letterSpacing: '0.04em' }}>
                              🛡 Admin
                            </span>
                          ) : u.isSubUser ? (
                            <span className="text-xs font-medium px-2 py-1 rounded-lg inline-block" style={{ background: 'rgba(201,166,90,0.1)', color: '#92610a' }}>
                              👥 Membro equipe
                            </span>
                          ) : (
                            <>
                              <span className="text-xs font-medium px-2 py-1 rounded-lg inline-block mb-1" style={{ background: cfg.bg, color: cfg.cor }}>
                                {expirado ? 'Expirado' : cfg.label}
                                {u.status === 'trial' && !expirado && ` (${diasAte(u.trial_fim)}d)`}
                              </span>
                              {u.bloqueado_admin && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg inline-block mb-1 ml-1" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                                  🔒 Bloq. Admin
                                </span>
                              )}
                              <div className="text-xs" style={{ color: 'var(--cinza)' }}>{(['basic','profissional','gestao','pro','empresarial'].includes(u.plano) ? (u.plano === 'pro' ? 'gestao' : u.plano) : 'basic')}</div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span style={{ fontSize: '15px', fontWeight: 700, color: u.keyword_count > 0 ? 'var(--vinho)' : 'var(--cinza)' }}>
                            {u.keyword_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span style={{ fontSize: '15px', fontWeight: 700, color: u.alerta_count > 0 ? '#10b981' : 'var(--cinza)' }}>
                            {u.alerta_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>
                          {fmtHora(u.ultimo_alerta)}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>
                          {fmt(u.criado_em)}
                        </td>
                        <td className="px-4 py-3">
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={() => abrirConta(u)}
                              style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'none', cursor: 'pointer' }}>
                              Ver
                            </button>
                            {!u.is_admin && !u.isSubUser && (
                              <>
                                <button onClick={() => setEditando({ ...u })}
                                  style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
                                  Editar
                                </button>
                                {/* Bloqueio financeiro: altera status de pagamento */}
                                {statusEfetivo !== 'active' && (
                                  <button onClick={() => alterarStatus(u.id, 'active')}
                                    style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', cursor: 'pointer' }}>
                                    Ativar
                                  </button>
                                )}
                                {statusEfetivo !== 'expired' && statusEfetivo !== 'bloqueado' && (
                                  <button onClick={() => alterarStatus(u.id, 'expired')}
                                    style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                                    Expirar
                                  </button>
                                )}
                                {/* Bloqueio administrativo: independente de pagamento, sobrevive a webhooks MP */}
                                {!u.bloqueado_admin ? (
                                  <button onClick={async () => {
                                    await fetch('/api/admin/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, bloqueado_admin: true }) })
                                    carregar()
                                  }}
                                    title="Bloquear acesso independente do pagamento (não é sobrescrito pelo MercadoPago)"
                                    style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(107,15,26,0.1)', color: '#6B0F1A', border: '1.5px dashed rgba(107,15,26,0.3)', cursor: 'pointer' }}>
                                    🔒 Bloquear
                                  </button>
                                ) : (
                                  <button onClick={async () => {
                                    await fetch('/api/admin/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, bloqueado_admin: false }) })
                                    carregar()
                                  }}
                                    title="Remover bloqueio administrativo"
                                    style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}>
                                    🔓 Desbloquear
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ ABA CRON LOGS ══ */}
      {aba === 'cron' && cronData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Status por job */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {Object.entries(cronData.ultimasPorJob).map(([job, ultima]) => (
              <div key={job} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cinza)', marginBottom: '8px' }}>
                  {JOB_LABELS[job] ?? job}
                </div>
                {ultima ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ultima.status === 'ok' ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: ultima.status === 'ok' ? '#10b981' : '#ef4444' }}>
                        {ultima.status === 'ok' ? 'OK' : 'Erro'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{fmtHora(ultima.criado_em)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--cinza)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ultima.mensagem}</div>
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--cinza)' }}>Sem registros</div>
                )}
              </div>
            ))}
          </div>

          {/* Log completo */}
          <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cinza-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cinza)' }}>
                Execuções {filtroJob === 'todos' ? `(${cronData.logs.length})` : `· ${JOB_LABELS[filtroJob] ?? filtroJob}`}
              </span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['todos', ...Object.keys(JOB_LABELS)].map(job => (
                  <button key={job} onClick={() => setFiltroJob(job)}
                    style={{
                      padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      background: filtroJob === job ? 'var(--vinho)' : 'var(--surface-2)',
                      color: filtroJob === job ? 'white' : 'var(--cinza)',
                      border: filtroJob === job ? 'none' : '1px solid var(--cinza-light)',
                    } as React.CSSProperties}>
                    {job === 'todos' ? 'Todos' : JOB_LABELS[job]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {(() => {
                const logsFiltrados = cronData.logs.filter(l => filtroJob === 'todos' || l.job === filtroJob)
                return logsFiltrados.length === 0 ? (
                <p style={{ padding: '20px', color: 'var(--cinza)', fontSize: '14px' }}>Sem logs para este filtro.</p>
              ) : (
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--cinza-light)', position: 'sticky', top: 0, background: 'white' }}>
                      {['Data', 'Job', 'Status', 'Mensagem'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 16px', color: 'var(--cinza)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logsFiltrados.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                        <td style={{ padding: '8px 16px', color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{fmtHora(log.criado_em)}</td>
                        <td style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--preto)' }}>{JOB_LABELS[log.job] ?? log.job}</td>
                        <td style={{ padding: '8px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', fontWeight: 600, background: log.status === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: log.status === 'ok' ? '#10b981' : '#ef4444' }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 16px', color: 'var(--cinza)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.mensagem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )})()}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal edição ── */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--preto)' }}>Editar usuário</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--cinza)' }}>{editando.email}</p>
            <div className="space-y-4">
              {([
                { label: 'Nome',     key: 'nome',     placeholder: 'Nome completo'    },
                { label: 'Empresa',  key: 'empresa',  placeholder: 'Nome da empresa'  },
                { label: 'Telefone', key: 'telefone', placeholder: '(31) 99999-9999'  },
                { label: 'WhatsApp', key: 'whatsapp', placeholder: '(31) 99999-9999'  },
              ] as const).map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>{label}</label>
                  <input value={(editando as unknown as Record<string, string>)[key] ?? ''} onChange={e => setEditando({ ...editando, [key]: e.target.value })}
                    placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Plano</label>
                <select value={editando.plano ?? 'basic'} onChange={e => setEditando({ ...editando, plano: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}>
                  {[['basic','Basic'],['profissional','Profissional'],['gestao','Gestão'],['empresarial','Empresarial']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Status</label>
                <select value={editando.status} onChange={e => setEditando({ ...editando, status: e.target.value as 'trial' | 'active' | 'expired' })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}>
                  <option value="trial">Trial</option>
                  <option value="active">Ativo</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditando(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: '1.5px solid var(--cinza-light)', color: 'var(--cinza)', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={salvarEdicao} disabled={salvando} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: salvando ? '#9AA0A6' : 'var(--vinho)', cursor: salvando ? 'not-allowed' : 'pointer', border: 'none' }}>
                {salvando ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer conta ── */}
      {contaAberta && (
        <>
          <div onClick={() => setContaAberta(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '95vw', background: 'white', zIndex: 50, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>

            {/* Header drawer */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--cinza-light)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--preto)', margin: 0 }}>{contaAberta.nome || 'Sem nome'}</h2>
                  <p style={{ fontSize: '13px', color: 'var(--cinza)', margin: '2px 0 0' }}>{contaAberta.email}</p>
                  {contaAberta.empresa && <p style={{ fontSize: '12px', color: 'var(--cinza)', margin: '2px 0 0' }}>{contaAberta.empresa}</p>}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>{contaAberta.plano || 'basic'}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: statusConfig[contaAberta.trial_expirado ? 'expired' : contaAberta.status].bg, color: statusConfig[contaAberta.trial_expirado ? 'expired' : contaAberta.status].cor }}>
                      {contaAberta.trial_expirado ? 'Trial expirado' : statusConfig[contaAberta.status].label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setContaAberta(null)} style={{ padding: '6px 10px', borderRadius: '8px', background: 'var(--surface-2)', color: 'var(--cinza)', fontSize: '16px', fontWeight: 700, lineHeight: 1, border: 'none', cursor: 'pointer', flexShrink: 0 }}>✕</button>
              </div>

              {/* Uso resumido */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}>
                {[
                  { label: 'Keywords', value: contaAberta.keyword_count, cor: 'var(--vinho)' },
                  { label: 'Alertas',  value: contaAberta.alerta_count,  cor: '#10b981'      },
                  { label: 'Cadastro', value: fmt(contaAberta.criado_em), cor: 'var(--cinza)' },
                ].map(({ label, value, cor }) => (
                  <div key={label} style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: cor }}>{value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  </div>
                ))}
              </div>

              {(contaAberta.telefone || contaAberta.whatsapp) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {contaAberta.telefone && <a href={`tel:${contaAberta.telefone}`} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: 'var(--surface-2)', color: 'var(--cinza)', textDecoration: 'none' }}>📞 {contaAberta.telefone}</a>}
                  {contaAberta.whatsapp && <a href={`https://wa.me/55${contaAberta.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(37,211,102,0.1)', color: '#16a34a', textDecoration: 'none' }}>💬 WhatsApp</a>}
                </div>
              )}
            </div>

            {/* Conteúdo drawer */}
            <div style={{ padding: '24px', flex: 1 }}>
              {carregandoConta ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3].map(i => <div key={i} className="animate-pulse rounded-xl" style={{ background: 'var(--surface-2)', height: '56px' }} />)}
                </div>
              ) : contaDetalhe ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                  {/* Keywords */}
                  <section>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cinza)', marginBottom: '10px' }}>
                      Palavras-chave ({contaDetalhe.keywords.length})
                    </h3>
                    {contaDetalhe.keywords.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--cinza)' }}>Nenhuma palavra-chave cadastrada.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {contaDetalhe.keywords.map(kw => (
                          <span key={kw.id} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', fontWeight: 600, background: kw.ativo ? 'rgba(107,15,26,0.08)' : 'var(--surface-2)', color: kw.ativo ? 'var(--vinho)' : 'var(--cinza)', border: '1px solid', borderColor: kw.ativo ? 'rgba(107,15,26,0.15)' : 'var(--cinza-light)' }}>
                            {kw.ativo ? '' : '⏸ '}{kw.termo}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Sub-usuários */}
                  {contaDetalhe.subUsuarios.length > 0 && (
                    <section>
                      <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cinza)', marginBottom: '10px' }}>
                        Equipe ({contaDetalhe.subUsuarios.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {contaDetalhe.subUsuarios.map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', background: 'var(--surface-2)' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--vinho)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                              {(s.nome || s.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)' }}>{s.nome || '—'}</div>
                              <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{s.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Alertas recentes */}
                  <section>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cinza)', marginBottom: '10px' }}>
                      Alertas recentes ({contaDetalhe.alertas.length})
                    </h3>
                    {contaDetalhe.alertas.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--cinza)' }}>Nenhum alerta gerado ainda.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {contaDetalhe.alertas.map(a => {
                          const lic = a.licitacoes
                          return (
                            <div key={a.id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--preto)', margin: '0 0 4px', lineHeight: 1.4 }}>{lic?.objeto ?? '(sem título)'}</p>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {lic?.orgao && <span style={{ fontSize: '11px', color: 'var(--cinza)' }}>🏛 {lic.orgao}</span>}
                                {lic?.valor_estimado && <span style={{ fontSize: '11px', color: 'var(--cinza)' }}>💰 {moeda(lic.valor_estimado)}</span>}
                              </div>
                              <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.3)', marginTop: '4px' }}>
                                {fmtHora(a.criado_em)}{a.canais?.length > 0 ? ` · ${a.canais.join(', ')}` : ''}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>

                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#ef4444' }}>Erro ao carregar dados da conta.</p>
              )}
            </div>

            {/* Rodapé drawer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cinza-light)', flexShrink: 0 }}>
              <button onClick={() => { setContaAberta(null); setEditando({ ...contaAberta }) }} style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
                Editar dados desta conta
              </button>
            </div>
          </div>
        </>
      )}

      <p style={{ fontSize: '11px', color: 'var(--cinza)', textAlign: 'center', marginTop: '16px' }}>
        Acesso restrito ao administrador.
      </p>
    </div>
  )
}
