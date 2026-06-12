'use client'

import { useEffect, useState } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Assinante = {
  id: string
  email: string
  nome: string | null
  empresa: string | null
  telefone: string | null
  whatsapp: string | null
  status: 'active' | 'trial' | 'expired' | 'bloqueado'
  plano: string
  valor_mensalidade: number | null
  assinatura_inicio: string | null
  acesso_ate: string | null
  trial_fim: string | null
  criado_em: string
  mp_subscription_id: string | null
  // NF
  cnpj: string | null
  cpf: string | null
  tipo_pessoa: string | null
  razao_social: string | null
  nome_fantasia: string | null
  ie: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado_uf: string | null
}

type SyncResultado = {
  userId: string
  subscriptionId: string
  statusMP: string
  statusAntes: string
  statusDepois: string
  acessoAte: string | null
  valor: number | null
  erro?: string
}

type ReceitaPlano = { plano: string; count: number; receita: number }

type Kpis = {
  mrr: number
  arr: number
  totalPagantes: number
  totalTrials: number
  totalExpirados: number
  ticketMedio: number
  churnMensal: number
  taxaConversao: number
  novas7d: number
  receita7d: number
  receitaPorPlano: ReceitaPlano[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
const fmt   = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
const meses = (d: string | null) => {
  if (!d) return null
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / (30 * 24 * 3600 * 1000))
  return m === 0 ? 'Este mês' : m === 1 ? '1 mês' : `${m} meses`
}
const diasRestantes = (d: string | null) => {
  if (!d) return null
  const diff = new Date(d).getTime() - Date.now()
  const dias = Math.ceil(diff / (24 * 3600 * 1000))
  if (dias < 0) return 'Expirado'
  if (dias === 0) return 'Hoje'
  return `${dias}d restantes`
}

const PLANO_CORES: Record<string, { bg: string; cor: string }> = {
  basic:        { bg: 'rgba(107,15,26,0.08)',   cor: '#6B0F1A'  },
  profissional: { bg: 'rgba(59,130,246,0.1)',   cor: '#3b82f6'  },
  pro:          { bg: 'rgba(139,92,246,0.1)',   cor: '#8b5cf6'  },
  empresarial:  { bg: 'rgba(16,185,129,0.1)',   cor: '#10b981'  },
}

const STATUS_CORES: Record<string, { bg: string; cor: string; label: string }> = {
  active:    { bg: 'rgba(16,185,129,0.1)',  cor: '#10b981', label: 'Ativo'     },
  trial:     { bg: 'rgba(201,166,90,0.1)',  cor: '#C9A65A', label: 'Trial'     },
  expired:   { bg: 'rgba(239,68,68,0.08)', cor: '#ef4444', label: 'Expirado'  },
  bloqueado: { bg: 'rgba(107,15,26,0.1)',  cor: '#6B0F1A', label: 'Bloqueado' },
}

const MP_STATUS_LABEL: Record<string, { label: string; cor: string }> = {
  authorized:  { label: '✓ Autorizado',    cor: '#10b981' },
  paused:      { label: '⏸ Pausado',       cor: '#f97316' },
  cancelled:   { label: '✕ Cancelado',     cor: '#ef4444' },
  pending:     { label: '⏳ Pendente',      cor: '#C9A65A' },
  in_process:  { label: '⏳ Em processo',  cor: '#C9A65A' },
  expired:     { label: '✕ Expirado',      cor: '#ef4444' },
  erro_api:    { label: '⚠ Erro API',      cor: '#6B0F1A' },
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [kpis, setKpis]               = useState<Kpis | null>(null)
  const [assinantes, setAssinantes]   = useState<Assinante[]>([])
  const [carregando, setCarregando]   = useState(true)
  const [aba, setAba]                 = useState<'assinantes' | 'nf' | 'bloqueados'>('assinantes')
  const [busca, setBusca]             = useState('')
  const [filtroPlano, setFiltroPlano] = useState('todos')
  const [editando, setEditando]       = useState<Assinante | null>(null)
  const [salvando, setSalvando]       = useState(false)
  const [acaoId, setAcaoId]           = useState<string | null>(null)
  const [sincronizando, setSincronizando] = useState(false)
  const [syncId, setSyncId]           = useState<string | null>(null)
  const [syncResultado, setSyncResultado] = useState<SyncResultado[] | null>(null)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/admin/financeiro')
    if (res.ok) {
      const d = await res.json()
      setKpis(d.kpis)
      setAssinantes(d.assinantes)
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function alterarStatus(id: string, status: string) {
    setAcaoId(id)
    await fetch('/api/admin/financeiro', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setAcaoId(null)
    carregar()
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvando(true)
    await fetch('/api/admin/financeiro', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id:                editando.id,
        plano:             editando.plano,
        status:            editando.status,
        valor_mensalidade: editando.valor_mensalidade,
        assinatura_inicio: editando.assinatura_inicio,
      }),
    })
    setSalvando(false)
    setEditando(null)
    carregar()
  }

  function exportarPDF(tipo: 'mes' | 'ano') {
    if (!kpis) return
    const agora   = new Date()
    const ano     = agora.getFullYear()
    const mesTxt  = agora.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    const titulo  = tipo === 'mes'
      ? `Relatório Financeiro — ${mesTxt.charAt(0).toUpperCase() + mesTxt.slice(1)}`
      : `Resumo Financeiro Anual — ${ano}`

    const pagantesAtivos = assinantes.filter(a => a.status === 'active' && a.valor_mensalidade)

    // receita acumulada no ano: meses pagos × valor mensal
    let receitaAnoCalc = 0
    if (tipo === 'ano') {
      const inicioAno = new Date(ano, 0, 1)
      pagantesAtivos.forEach(a => {
        const inicio = a.assinatura_inicio ? new Date(a.assinatura_inicio) : inicioAno
        const from   = inicio > inicioAno ? inicio : inicioAno
        const mesesAtivos = Math.max(0, Math.round((agora.getTime() - from.getTime()) / (30.44 * 24 * 3600 * 1000)))
        receitaAnoCalc += (a.valor_mensalidade ?? 0) * mesesAtivos
      })
    }

    const rowsAssinantes = pagantesAtivos.map(a => {
      const pc = PLANO_CORES[a.plano] ?? PLANO_CORES.basic
      return `<tr>
        <td>${a.nome || a.email}</td>
        <td><span style="background:${pc.bg};color:${pc.cor};padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:capitalize">${a.plano}</span></td>
        <td style="font-family:monospace">${moeda(a.valor_mensalidade ?? 0)}/mês</td>
        <td>${a.assinatura_inicio ? new Date(a.assinatura_inicio).toLocaleDateString('pt-BR') : '—'}</td>
        ${tipo === 'ano' ? `<td style="font-family:monospace">
          ${(() => { const ini = a.assinatura_inicio ? new Date(a.assinatura_inicio) : new Date(ano, 0, 1); const from = ini > new Date(ano, 0, 1) ? ini : new Date(ano, 0, 1); const m = Math.max(0, Math.round((agora.getTime() - from.getTime()) / (30.44 * 24 * 3600 * 1000))); return `${m} mês${m !== 1 ? 'es' : ''} × ${moeda(a.valor_mensalidade ?? 0)} = ${moeda((a.valor_mensalidade ?? 0) * m)}` })()}
        </td>` : ''}
      </tr>`
    }).join('')

    const kpiCards = tipo === 'mes' ? `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val green">${moeda(kpis.mrr)}</div><div class="kpi-lbl">MRR</div><div class="kpi-sub">receita mensal recorrente</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.arr)}</div><div class="kpi-lbl">ARR projetado</div><div class="kpi-sub">MRR × 12</div></div>
        <div class="kpi"><div class="kpi-val">${kpis.totalPagantes}</div><div class="kpi-lbl">Assinantes ativos</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${kpis.totalTrials}</div><div class="kpi-lbl">Em trial</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.ticketMedio)}</div><div class="kpi-lbl">Ticket médio</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${kpis.taxaConversao}%</div><div class="kpi-lbl">Taxa conversão</div><div class="kpi-sub">trial → assinante</div></div>
      </div>
      <h3 style="margin:20px 0 10px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.06em">Receita por plano</h3>
      <table><thead><tr><th>Plano</th><th>Assinantes</th><th>Receita mensal</th></tr></thead><tbody>
        ${kpis.receitaPorPlano.filter(r => r.count > 0).map(r => `<tr><td style="text-transform:capitalize">${r.plano}</td><td>${r.count}</td><td style="font-family:monospace;font-weight:700">${moeda(r.receita)}</td></tr>`).join('')}
      </tbody></table>` : `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val green">${moeda(receitaAnoCalc)}</div><div class="kpi-lbl">Receita acumulada ${ano}</div><div class="kpi-sub">01/01/${ano} até hoje</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.arr)}</div><div class="kpi-lbl">ARR projetado</div><div class="kpi-sub">MRR atual × 12</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.mrr)}</div><div class="kpi-lbl">MRR atual</div><div class="kpi-sub">dezembro/${ano}</div></div>
        <div class="kpi"><div class="kpi-val">${kpis.totalPagantes}</div><div class="kpi-lbl">Assinantes ativos</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.ticketMedio)}</div><div class="kpi-lbl">Ticket médio</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${kpis.churnMensal}</div><div class="kpi-lbl">Churn (últimos 30d)</div><div class="kpi-sub"></div></div>
      </div>`

    const colHead = tipo === 'ano'
      ? '<th>Assinante</th><th>Plano</th><th>Valor/mês</th><th>Desde</th><th>Contribuição estimada</th>'
      : '<th>Assinante</th><th>Plano</th><th>Valor/mês</th><th>Assinante desde</th>'

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${titulo}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;color:#0f172a;padding:36px;font-size:13px}
  h1{font-size:20px;font-weight:800;margin-bottom:4px}
  .sub{font-size:12px;color:#64748b;margin-bottom:24px}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px}
  .kpi-val{font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.03em}
  .kpi-val.green{color:#10b981}
  .kpi-lbl{font-size:11px;font-weight:700;color:#0f172a;margin-top:4px}
  .kpi-sub{font-size:10px;color:#94a3b8;margin-top:2px}
  h3{font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin:20px 0 10px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{text-align:left;padding:8px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;background:#f8fafc;border-bottom:2px solid #e2e8f0}
  td{padding:8px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top}
  tr:last-child td{border-bottom:none}
  .aviso{background:#fefce8;border:1px solid #fef08a;border-radius:8px;padding:12px 16px;font-size:11px;color:#854d0e;margin-bottom:20px}
  footer{margin-top:40px;font-size:10px;color:#94a3b8;text-align:center;border-top:1px solid #f1f5f9;padding-top:16px}
  @media print{body{padding:20px}}
</style></head><body>
<h1>${titulo}</h1>
<div class="sub">Gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · Monitor de Licitações</div>
${tipo === 'ano' ? `<div class="aviso">⚠ Receita acumulada é uma estimativa baseada nos meses ativos desde 01/01/${ano}. Para valores exatos, consulte o extrato do MercadoPago.</div>` : ''}
${kpiCards}
<h3 style="margin:24px 0 10px">Assinantes ativos (${pagantesAtivos.length})</h3>
<table><thead><tr>${colHead}</tr></thead><tbody>${rowsAssinantes}</tbody></table>
<footer>Monitor de Licitações — monitordelicitacoes.com.br · Documento gerado para fins contábeis</footer>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
    w.addEventListener('afterprint', () => w.close())
  }

  async function sincronizarMP(userId?: string) {
    if (userId) setSyncId(userId)
    else setSincronizando(true)
    setSyncResultado(null)

    const res = await fetch('/api/admin/financeiro/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId ? { userId } : {}),
    })
    const d = await res.json()
    setSyncResultado(d.detalhes ?? [])
    setSincronizando(false)
    setSyncId(null)
    carregar()
  }

  const pagantes   = assinantes.filter(a => a.status === 'active')
  const trials     = assinantes.filter(a => a.status === 'trial')
  const bloqueados = assinantes.filter(a => a.status === 'bloqueado' || a.status === 'expired')

  function filtrar(lista: Assinante[]) {
    return lista.filter(a => {
      if (filtroPlano !== 'todos' && a.plano !== filtroPlano) return false
      if (busca) {
        const q = busca.toLowerCase()
        return (
          a.email.toLowerCase().includes(q) ||
          (a.nome ?? '').toLowerCase().includes(q) ||
          (a.empresa ?? '').toLowerCase().includes(q) ||
          (a.cnpj ?? '').includes(q) ||
          (a.cpf ?? '').includes(q)
        )
      }
      return true
    })
  }

  const abaLista = aba === 'assinantes'
    ? filtrar([...pagantes, ...trials])
    : aba === 'nf'
    ? filtrar(pagantes)
    : filtrar(bloqueados)

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <a href="/admin" className="text-xs font-medium mb-1 block" style={{ color: 'var(--cinza)', textDecoration: 'none' }}>
            ← Painel Admin
          </a>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>💰 Financeiro</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>Receita, assinaturas, pagamentos e dados fiscais</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {kpis && (<>
            <button onClick={() => exportarPDF('mes')}
              style={{ fontSize: '13px', fontWeight: 600, padding: '9px 16px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'none', cursor: 'pointer' }}>
              PDF Mês
            </button>
            <button onClick={() => exportarPDF('ano')}
              style={{ fontSize: '13px', fontWeight: 600, padding: '9px 16px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: 'none', cursor: 'pointer' }}>
              PDF Ano
            </button>
          </>)}
          <button
            onClick={() => sincronizarMP()}
            disabled={sincronizando}
            style={{
              fontSize: '13px', fontWeight: 600, padding: '9px 18px', borderRadius: '10px',
              background: sincronizando ? '#9AA0A6' : '#009ee3',
              color: 'white', border: 'none', cursor: sincronizando ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            {sincronizando ? '⏳ Sincronizando…' : '↺ Sync MercadoPago'}
          </button>
          <button onClick={carregar} style={{ fontSize: '12px', color: 'var(--cinza)', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--cinza-light)', background: 'white', cursor: 'pointer' }}>
            ↺ Atualizar
          </button>
        </div>
      </div>

      {/* Resultado do sync */}
      {syncResultado && syncResultado.length > 0 && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)' }}>
              Resultado da sincronização — {syncResultado.length} assinatura(s)
            </span>
            <button onClick={() => setSyncResultado(null)} style={{ fontSize: '12px', color: 'var(--cinza)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ fechar</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {syncResultado.map(r => {
              const mp = MP_STATUS_LABEL[r.statusMP] ?? { label: r.statusMP, cor: 'var(--cinza)' }
              const mudou = r.statusAntes !== r.statusDepois
              return (
                <div key={r.userId} style={{ fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', background: mudou ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)' }}>
                  <span style={{ fontWeight: 600, color: mp.cor }}>{mp.label}</span>
                  <span style={{ color: 'var(--cinza)', fontFamily: 'monospace', fontSize: '11px' }}>{r.userId.slice(0, 8)}…</span>
                  {mudou && <span style={{ color: '#10b981', fontWeight: 600 }}>{r.statusAntes} → {r.statusDepois}</span>}
                  {r.acessoAte && <span style={{ color: '#f97316' }}>acesso até {fmt(r.acessoAte)}</span>}
                  {r.valor && <span style={{ color: 'var(--preto)' }}>{moeda(r.valor)}/mês</span>}
                  {r.erro && <span style={{ color: '#ef4444' }}>{r.erro}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {carregando ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse rounded-2xl" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '88px' }} />)}
        </div>
      ) : kpis && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'MRR',          value: moeda(kpis.mrr),           sub: 'receita mensal recorrente', cor: '#10b981', destaque: true },
              { label: 'ARR',          value: moeda(kpis.arr),           sub: 'receita anual projetada',   cor: '#3b82f6' },
              { label: 'Ticket médio', value: moeda(kpis.ticketMedio),   sub: `${kpis.totalPagantes} pagantes`, cor: '#8b5cf6' },
              { label: 'Conversão',    value: `${kpis.taxaConversao}%`,  sub: 'trials → assinantes',       cor: '#C9A65A' },
            ].map(({ label, value, sub, cor, destaque }) => (
              <div key={label} style={{ background: destaque ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' : 'white', border: destaque ? 'none' : '1px solid var(--cinza-light)', borderRadius: '16px', padding: '18px 20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: destaque ? '#34d399' : cor, letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: destaque ? 'rgba(255,255,255,0.9)' : 'var(--preto)', marginTop: '4px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: destaque ? 'rgba(255,255,255,0.5)' : 'var(--cinza)', marginTop: '2px' }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Pagantes',  value: kpis.totalPagantes,  sub: 'assinaturas ativas',  cor: '#10b981' },
              { label: 'Em trial',  value: kpis.totalTrials,    sub: 'período gratuito',    cor: '#C9A65A' },
              { label: 'Expirados', value: kpis.totalExpirados, sub: 'sem renovação',       cor: '#ef4444' },
              { label: 'Churn/30d', value: kpis.churnMensal,    sub: 'encerramentos 30d',   cor: '#f97316' },
              { label: 'Novos 7d',  value: kpis.novas7d,        sub: moeda(kpis.receita7d), cor: '#3b82f6' },
            ].map(({ label, value, sub, cor }) => (
              <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: cor, letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--preto)', marginTop: '4px' }}>{label}</div>
                <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '1px' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Receita por plano */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>Receita por plano</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {kpis.receitaPorPlano.filter(r => r.count > 0).map(r => {
                const c = PLANO_CORES[r.plano] ?? PLANO_CORES.basic
                return (
                  <div key={r.plano} style={{ flex: 1, minWidth: '140px', padding: '12px 16px', borderRadius: '12px', background: c.bg, border: `1px solid ${c.cor}30` }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: c.cor }}>{moeda(r.receita)}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--preto)', marginTop: '2px', textTransform: 'capitalize' }}>{r.plano}</div>
                    <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{r.count} assinante{r.count !== 1 ? 's' : ''}</div>
                  </div>
                )
              })}
              {kpis.receitaPorPlano.every(r => r.count === 0) && (
                <p style={{ fontSize: '13px', color: 'var(--cinza)' }}>Sem assinantes pagantes ainda.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Abas + Filtros */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {([
            ['assinantes', `Assinantes (${pagantes.length + trials.length})`],
            ['nf',         `Dados NF (${pagantes.length})`],
            ['bloqueados', `Expirados/Bloqueados (${bloqueados.length})`],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setAba(id)}
              style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: aba === id ? 'var(--vinho)' : 'white', color: aba === id ? 'white' : 'var(--cinza)', border: aba === id ? 'none' : '1px solid var(--cinza-light)' } as React.CSSProperties}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome, e-mail, CNPJ…"
            style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white', width: '220px' }} />
          <select value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white' }}>
            <option value="todos">Todos os planos</option>
            {['basic','profissional','pro','empresarial'].map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ══ ABA ASSINANTES ══ */}
      {aba === 'assinantes' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          {carregando ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--cinza)' }}>Carregando…</div>
          ) : abaLista.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cinza)', fontSize: '14px' }}>Nenhum resultado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                  {['Assinante', 'Plano / Valor', 'Status', 'Assinante desde', 'Acesso até', 'MercadoPago', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {abaLista.map(a => {
                  const sc = STATUS_CORES[a.status] ?? STATUS_CORES.expired
                  const pc = PLANO_CORES[a.plano]   ?? PLANO_CORES.basic
                  const emGracePeriod = a.acesso_ate && a.status === 'active' && !a.mp_subscription_id
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--preto)', fontSize: '13px' }}>{a.nome || '—'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--cinza)' }}>{a.email}</div>
                        {a.empresa && <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.empresa}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', background: pc.bg, color: pc.cor, textTransform: 'capitalize' }}>
                          {a.plano}
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--preto)', marginTop: '4px' }}>
                          {a.valor_mensalidade ? moeda(a.valor_mensalidade) + '/mês' : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: sc.bg, color: sc.cor }}>
                          {sc.label}
                        </span>
                        {emGracePeriod && (
                          <div style={{ fontSize: '10px', color: '#f97316', marginTop: '3px', fontWeight: 600 }}>
                            Cancelado — em carência
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ fontSize: '13px', color: 'var(--preto)' }}>{fmt(a.assinatura_inicio)}</div>
                        {a.assinatura_inicio && <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{meses(a.assinatura_inicio)}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {a.acesso_ate ? (
                          <>
                            <div style={{ fontSize: '13px', color: '#f97316', fontWeight: 600 }}>{fmt(a.acesso_ate)}</div>
                            <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{diasRestantes(a.acesso_ate)}</div>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--cinza)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.mp_subscription_id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <a href={`https://www.mercadopago.com.br/subscriptions/${a.mp_subscription_id}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '11px', color: '#009ee3', textDecoration: 'none', fontWeight: 600 }}>
                              🔗 Ver no MP
                            </a>
                            <button onClick={() => sincronizarMP(a.id)} disabled={syncId === a.id}
                              style={{ fontSize: '10px', color: '#009ee3', background: 'none', border: '1px solid #009ee340', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer', fontWeight: 600 }}>
                              {syncId === a.id ? '…' : '↺ sync'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--cinza)' }}>Sem assinatura MP</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button onClick={() => setEditando({ ...a })}
                            style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
                            Editar
                          </button>
                          {a.status !== 'active' && (
                            <button onClick={() => alterarStatus(a.id, 'active')} disabled={acaoId === a.id}
                              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', cursor: 'pointer' }}>
                              Ativar
                            </button>
                          )}
                          {a.status === 'active' && (
                            <button onClick={() => alterarStatus(a.id, 'bloqueado')} disabled={acaoId === a.id}
                              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                              Bloquear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ ABA DADOS NF ══ */}
      {aba === 'nf' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cinza-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cinza)' }}>Dados para emissão de nota fiscal</span>
            <span style={{ fontSize: '11px', color: 'var(--cinza)' }}>Apenas assinantes ativos</span>
          </div>
          {carregando ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--cinza)' }}>Carregando…</div>
          ) : abaLista.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cinza)', fontSize: '14px' }}>Nenhum assinante ativo.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                  {['Assinante', 'Plano / Valor', 'CNPJ / CPF', 'Razão Social', 'Endereço'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {abaLista.map(a => {
                  const pc  = PLANO_CORES[a.plano] ?? PLANO_CORES.basic
                  const doc = a.tipo_pessoa === 'pf' ? a.cpf : a.cnpj
                  const docLabel = a.tipo_pessoa === 'pf' ? 'CPF' : 'CNPJ'
                  const endereco = [a.logradouro, a.numero, a.complemento, a.bairro, a.cidade, a.estado_uf, a.cep].filter(Boolean).join(', ')
                  return (
                    <tr key={a.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                      <td className="px-4 py-3">
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)' }}>{a.nome || '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.email}</div>
                        {a.empresa && <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.empresa}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', background: pc.bg, color: pc.cor, textTransform: 'capitalize' }}>{a.plano}</span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--preto)', marginTop: '4px' }}>{a.valor_mensalidade ? moeda(a.valor_mensalidade) : '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        {doc ? (
                          <>
                            <div style={{ fontSize: '11px', color: 'var(--cinza)', textTransform: 'uppercase' }}>{docLabel}</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)', fontFamily: 'monospace' }}>{doc}</div>
                            {a.ie && <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>IE: {a.ie}</div>}
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#ef4444' }}>⚠ Não informado</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ fontSize: '13px', color: 'var(--preto)' }}>{a.razao_social || a.nome_fantasia || '—'}</div>
                        {a.nome_fantasia && a.razao_social && <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.nome_fantasia}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ fontSize: '12px', color: 'var(--cinza)', maxWidth: '280px', lineHeight: '1.4' }}>
                          {endereco || <span style={{ color: '#ef4444' }}>⚠ Não informado</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ ABA EXPIRADOS/BLOQUEADOS ══ */}
      {aba === 'bloqueados' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          {carregando ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--cinza)' }}>Carregando…</div>
          ) : abaLista.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cinza)', fontSize: '14px' }}>Nenhum expirado ou bloqueado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                  {['Usuário', 'Plano', 'Status', 'Trial expirou', 'Assinante desde', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {abaLista.map(a => {
                  const sc = STATUS_CORES[a.status] ?? STATUS_CORES.expired
                  const pc = PLANO_CORES[a.plano]   ?? PLANO_CORES.basic
                  return (
                    <tr key={a.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                      <td className="px-4 py-3">
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)' }}>{a.nome || '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.email}</div>
                        {a.empresa && <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.empresa}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', background: pc.bg, color: pc.cor, textTransform: 'capitalize' }}>{a.plano}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: sc.bg, color: sc.cor }}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#ef4444' }}>{fmt(a.trial_fim)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--cinza)' }}>{fmt(a.assinatura_inicio)}</td>
                      <td className="px-4 py-3">
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => alterarStatus(a.id, 'active')} disabled={acaoId === a.id}
                            style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', cursor: 'pointer' }}>
                            Reativar
                          </button>
                          {a.status !== 'bloqueado' && (
                            <button onClick={() => alterarStatus(a.id, 'bloqueado')} disabled={acaoId === a.id}
                              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(107,15,26,0.1)', color: '#6B0F1A', border: 'none', cursor: 'pointer' }}>
                              Bloquear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal edição */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--preto)', margin: '0 0 4px' }}>Editar assinatura</h2>
            <p style={{ fontSize: '13px', color: 'var(--cinza)', margin: '0 0 24px' }}>{editando.email}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  label: 'Plano',
                  content: (
                    <select value={editando.plano} onChange={e => setEditando({ ...editando, plano: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                      {['basic','profissional','pro','empresarial'].map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  ),
                },
                {
                  label: 'Status',
                  content: (
                    <select value={editando.status} onChange={e => setEditando({ ...editando, status: e.target.value as Assinante['status'] })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                      <option value="trial">Trial</option>
                      <option value="active">Ativo</option>
                      <option value="expired">Expirado</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  ),
                },
                {
                  label: 'Valor mensalidade (R$)',
                  content: (
                    <input type="number" step="0.01" min="0"
                      value={editando.valor_mensalidade ?? ''}
                      onChange={e => setEditando({ ...editando, valor_mensalidade: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Ex: 97.90"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
                  ),
                },
                {
                  label: 'Data início assinatura',
                  content: (
                    <input type="date"
                      value={editando.assinatura_inicio ? editando.assinatura_inicio.substring(0, 10) : ''}
                      onChange={e => setEditando({ ...editando, assinatura_inicio: e.target.value ? e.target.value + 'T00:00:00Z' : null })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
                  ),
                },
                {
                  label: 'Acesso até (carência pós-cancelamento)',
                  content: (
                    <input type="date"
                      value={editando.acesso_ate ? editando.acesso_ate.substring(0, 10) : ''}
                      onChange={e => setEditando({ ...editando, acesso_ate: e.target.value ? e.target.value + 'T23:59:59Z' : null })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
                  ),
                },
              ].map(({ label, content }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '6px' }}>{label}</label>
                  {content}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setEditando(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: '1.5px solid var(--cinza-light)', color: 'var(--cinza)', background: 'white', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={salvarEdicao} disabled={salvando}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: salvando ? '#9AA0A6' : 'var(--vinho)', border: 'none', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                {salvando ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
