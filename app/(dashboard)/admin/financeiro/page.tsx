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
  periodo: 'mensal' | 'anual'
  valor_mensalidade: number | null
  valor_cobrado: number | null
  assinatura_inicio: string | null
  acesso_ate: string | null
  trial_fim: string | null
  criado_em: string
  mp_subscription_id: string | null
  campanha_nome: string | null
  comissao_mensal: number
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
  status_nf: 'pendente' | 'emitida' | 'enviada' | 'cancelada'
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

type Despesa = {
  id: string
  descricao: string
  valor: number
  categoria: string
  recorrente: boolean
  mes: number | null
  ano: number | null
  numero_nf: string | null
  criado_em: string | null
  auto?: boolean  // entrada automática — não editável/deletável
}

const CATEGORIAS: Record<string, { label: string; cor: string; bg: string }> = {
  infraestrutura: { label: 'Infraestrutura', cor: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  marketing:      { label: 'Marketing',      cor: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  pessoal:        { label: 'Pessoal',        cor: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  servicos:       { label: 'Serviços',       cor: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  comissao:       { label: 'Comissão',       cor: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  imposto:        { label: 'Imposto',        cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  outro:          { label: 'Outro',          cor: '#64748b', bg: 'rgba(100,116,139,0.1)'},
}

type Kpis = {
  mrr: number
  mrrLiquido: number
  taxasMpMensal: number
  comissaoMensal: number
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

const MESES_NOMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function FinanceiroPage() {
  const [kpis, setKpis]               = useState<Kpis | null>(null)
  const [assinantes, setAssinantes]   = useState<Assinante[]>([])
  const [carregando, setCarregando]   = useState(true)
  const [aba, setAba]                 = useState<'assinantes' | 'nf' | 'bloqueados' | 'despesas'>('assinantes')
  const [busca, setBusca]             = useState('')
  const [filtroPlano, setFiltroPlano] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [ordem, setOrdem]             = useState<'novo' | 'antigo'>('novo')
  const [editando, setEditando]       = useState<Assinante | null>(null)
  const [salvando, setSalvando]       = useState(false)
  const [acaoId, setAcaoId]           = useState<string | null>(null)
  const [sincronizando, setSincronizando] = useState(false)
  const [syncId, setSyncId]           = useState<string | null>(null)
  const [syncResultado, setSyncResultado] = useState<SyncResultado[] | null>(null)

  // Despesas
  const agora = new Date()
  const [despesas, setDespesas]           = useState<Despesa[]>([])
  const [mesFiltro, setMesFiltro]         = useState(agora.getMonth() + 1)
  const [anoFiltro, setAnoFiltro]         = useState(agora.getFullYear())
  const [salvandoDesp, setSalvandoDesp]   = useState(false)
  const [editandoDesp, setEditandoDesp]   = useState<Despesa | null>(null)
  const [formDesp, setFormDesp] = useState({
    descricao: '', valor: '', categoria: 'outro', recorrente: false,
    mes: String(agora.getMonth() + 1), ano: String(agora.getFullYear()), numero_nf: '',
  })

  async function carregarDespesas(mes = mesFiltro, ano = anoFiltro) {
    const res = await fetch(`/api/admin/financeiro/despesas?mes=${mes}&ano=${ano}`)
    if (res.ok) { const d = await res.json(); setDespesas(d.despesas ?? []) }
  }

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

  useEffect(() => { carregar(); carregarDespesas() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarDespesa() {
    if (!formDesp.descricao.trim() || !formDesp.valor) return
    setSalvandoDesp(true)
    const base = {
      descricao: formDesp.descricao, valor: Number(formDesp.valor),
      categoria: formDesp.categoria, recorrente: formDesp.recorrente,
      mes: formDesp.recorrente ? null : Number(formDesp.mes),
      ano: formDesp.recorrente ? null : Number(formDesp.ano),
      numero_nf: formDesp.numero_nf.trim() || null,
    }
    const body = editandoDesp ? { id: editandoDesp.id, ...base } : base
    await fetch('/api/admin/financeiro/despesas', {
      method: editandoDesp ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSalvandoDesp(false)
    setEditandoDesp(null)
    setFormDesp({ descricao: '', valor: '', categoria: 'outro', recorrente: false,
      mes: String(mesFiltro), ano: String(anoFiltro), numero_nf: '' })
    carregarDespesas()
  }

  async function excluirDespesa(id: string) {
    if (!confirm('Excluir esta despesa?')) return
    await fetch(`/api/admin/financeiro/despesas?id=${id}`, { method: 'DELETE' })
    carregarDespesas()
  }

  function abrirEdicaoDespesa(d: Despesa) {
    setEditandoDesp(d)
    setFormDesp({
      descricao: d.descricao, valor: String(d.valor), categoria: d.categoria,
      recorrente: d.recorrente,
      mes: d.mes ? String(d.mes) : String(mesFiltro),
      ano: d.ano ? String(d.ano) : String(anoFiltro),
      numero_nf: d.numero_nf ?? '',
    })
  }

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
        id:                 editando.id,
        plano:              editando.plano,
        status:             editando.status,
        valor_mensalidade:  editando.valor_mensalidade,
        assinatura_inicio:  editando.assinatura_inicio,
        mp_subscription_id: editando.mp_subscription_id,
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

    const totalComissoesMes = pagantesAtivos.reduce((s, a) => s + (a.comissao_mensal ?? 0), 0)
    const mrrBruto = pagantesAtivos.reduce((s, a) => s + (a.valor_mensalidade ?? 0), 0)
    const mrrLiquidoCalc = mrrBruto - totalComissoesMes

    const rowsAssinantes = pagantesAtivos.map(a => {
      const pc = PLANO_CORES[a.plano] ?? PLANO_CORES.basic
      return `<tr>
        <td>${a.nome || a.email}</td>
        <td><span style="background:${pc.bg};color:${pc.cor};padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:capitalize">${a.plano}</span></td>
        <td style="font-family:monospace">${moeda(a.valor_mensalidade ?? 0)}/mês</td>
        <td style="font-family:monospace;color:${(a.comissao_mensal ?? 0) > 0 ? '#f59e0b' : '#94a3b8'}">${(a.comissao_mensal ?? 0) > 0 ? moeda(a.comissao_mensal) + '/mês' : '—'}</td>
        <td style="color:#64748b;font-size:11px">${a.campanha_nome || '—'}</td>
        <td>${a.assinatura_inicio ? new Date(a.assinatura_inicio).toLocaleDateString('pt-BR') : '—'}</td>
        ${tipo === 'ano' ? `<td style="font-family:monospace">
          ${(() => { const ini = a.assinatura_inicio ? new Date(a.assinatura_inicio) : new Date(ano, 0, 1); const from = ini > new Date(ano, 0, 1) ? ini : new Date(ano, 0, 1); const m = Math.max(0, Math.round((agora.getTime() - from.getTime()) / (30.44 * 24 * 3600 * 1000))); return `${m} mês${m !== 1 ? 'es' : ''} × ${moeda(a.valor_mensalidade ?? 0)} = ${moeda((a.valor_mensalidade ?? 0) * m)}` })()}
        </td>` : ''}
      </tr>`
    }).join('')

    const blocoComissoes = totalComissoesMes > 0 ? `
      <h3 style="margin:20px 0 10px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.06em">Custos com comissões</h3>
      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="kpi"><div class="kpi-val" style="color:#f59e0b">${moeda(totalComissoesMes)}</div><div class="kpi-lbl">Comissões/mês</div><div class="kpi-sub">${mrrBruto > 0 ? Math.round(totalComissoesMes/mrrBruto*100) : 0}% do MRR bruto</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#10b981">${moeda(mrrLiquidoCalc)}</div><div class="kpi-lbl">MRR líquido</div><div class="kpi-sub">após comissões</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#f59e0b">${moeda(totalComissoesMes * 12)}</div><div class="kpi-lbl">Comissões/ano (est.)</div><div class="kpi-sub">projeção anual</div></div>
      </div>` : ''

    const totalDespMes = despesas.reduce((s, d) => s + d.valor, 0)
    const resultadoLiq = mrrLiquidoCalc - totalDespMes

    const blocoDespesas = despesas.length > 0 ? `
      <h3 style="margin:20px 0 10px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.06em">Despesas operacionais (${MESES_NOMES[mesFiltro - 1]}/${anoFiltro})</h3>
      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="kpi"><div class="kpi-val" style="color:#ef4444">${moeda(totalDespMes)}</div><div class="kpi-lbl">Total despesas</div><div class="kpi-sub">${despesas.length} lançamento${despesas.length !== 1 ? 's' : ''}</div></div>
        <div class="kpi"><div class="kpi-val" style="color:${resultadoLiq >= 0 ? '#10b981' : '#ef4444'}">${moeda(resultadoLiq)}</div><div class="kpi-lbl">Resultado líquido</div><div class="kpi-sub">MRR líq. − despesas</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#f59e0b">${moeda(despesas.filter(d => d.recorrente).reduce((s, d) => s + d.valor, 0))}</div><div class="kpi-lbl">Custos fixos/mês</div><div class="kpi-sub">recorrentes</div></div>
      </div>
      <table><thead><tr><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>
        ${despesas.map(d => `<tr><td>${d.descricao}</td><td>${CATEGORIAS[d.categoria]?.label ?? d.categoria}</td><td>${d.recorrente ? '↺ Fixo' : '· Pontual'}</td><td style="font-family:monospace;font-weight:700;color:#ef4444">${moeda(d.valor)}</td></tr>`).join('')}
        <tr style="background:#f8fafc"><td colspan="3" style="font-weight:700;text-transform:uppercase;font-size:11px">Total</td><td style="font-family:monospace;font-weight:800;color:#ef4444">${moeda(totalDespMes)}</td></tr>
      </tbody></table>` : ''

    const kpiCards = tipo === 'mes' ? `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val green">${moeda(mrrBruto)}</div><div class="kpi-lbl">MRR Bruto</div><div class="kpi-sub">receita mensal recorrente</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(mrrLiquidoCalc)}</div><div class="kpi-lbl">MRR Líquido</div><div class="kpi-sub">após comissões</div></div>
        <div class="kpi"><div class="kpi-val">${kpis.totalPagantes}</div><div class="kpi-lbl">Assinantes ativos</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${kpis.totalTrials}</div><div class="kpi-lbl">Em trial</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.ticketMedio)}</div><div class="kpi-lbl">Ticket médio</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${kpis.taxaConversao}%</div><div class="kpi-lbl">Taxa conversão</div><div class="kpi-sub">trial → assinante</div></div>
      </div>
      ${blocoComissoes}
      <h3 style="margin:20px 0 10px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.06em">Receita por plano</h3>
      <table><thead><tr><th>Plano</th><th>Assinantes</th><th>Receita mensal</th></tr></thead><tbody>
        ${kpis.receitaPorPlano.filter(r => r.count > 0).map(r => `<tr><td style="text-transform:capitalize">${r.plano}</td><td>${r.count}</td><td style="font-family:monospace;font-weight:700">${moeda(r.receita)}</td></tr>`).join('')}
      </tbody></table>` : `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val green">${moeda(receitaAnoCalc)}</div><div class="kpi-lbl">Receita acumulada ${ano}</div><div class="kpi-sub">01/01/${ano} até hoje</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(kpis.arr)}</div><div class="kpi-lbl">ARR projetado</div><div class="kpi-sub">MRR atual × 12</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(mrrBruto)}</div><div class="kpi-lbl">MRR bruto</div><div class="kpi-sub">dezembro/${ano}</div></div>
        <div class="kpi"><div class="kpi-val">${moeda(mrrLiquidoCalc)}</div><div class="kpi-lbl">MRR líquido</div><div class="kpi-sub">após comissões</div></div>
        <div class="kpi"><div class="kpi-val">${kpis.totalPagantes}</div><div class="kpi-lbl">Assinantes ativos</div><div class="kpi-sub"></div></div>
        <div class="kpi"><div class="kpi-val">${kpis.churnMensal}</div><div class="kpi-lbl">Churn (últimos 30d)</div><div class="kpi-sub"></div></div>
      </div>
      ${blocoComissoes}`

    const colHead = tipo === 'ano'
      ? '<th>Assinante</th><th>Plano</th><th>Valor/mês</th><th>Comissão/mês</th><th>Parceiro</th><th>Desde</th><th>Contribuição estimada</th>'
      : '<th>Assinante</th><th>Plano</th><th>Valor/mês</th><th>Comissão/mês</th><th>Parceiro</th><th>Assinante desde</th>'

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
${blocoDespesas}
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

  const totalDespesasMes = despesas.reduce((s, d) => s + d.valor, 0)
  const resultadoLiquido = (kpis?.mrrLiquido ?? 0) - totalDespesasMes

  function filtrar(lista: Assinante[]) {
    let resultado = lista.filter(a => {
      if (filtroPlano !== 'todos' && a.plano !== filtroPlano) return false
      if (filtroStatus !== 'todos') {
        const emCarencia = a.acesso_ate && a.status === 'active' && !a.mp_subscription_id
        const semMP      = !a.mp_subscription_id && a.status === 'active'
        if (filtroStatus === 'active'   && (a.status !== 'active' || emCarencia)) return false
        if (filtroStatus === 'trial'    && a.status !== 'trial') return false
        if (filtroStatus === 'expired'  && a.status !== 'expired') return false
        if (filtroStatus === 'bloqueado' && a.status !== 'bloqueado') return false
        if (filtroStatus === 'carencia' && !emCarencia) return false
        if (filtroStatus === 'sem_mp'   && !semMP) return false
      }
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
    resultado = resultado.sort((a, b) => {
      const da = new Date(a.criado_em).getTime()
      const db = new Date(b.criado_em).getTime()
      return ordem === 'novo' ? db - da : da - db
    })
    return resultado
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '12px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse rounded-2xl" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '88px' }} />)}
        </div>
      ) : kpis && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'MRR Bruto',    value: moeda(kpis.mrr),           sub: 'receita mensal recorrente', cor: '#10b981', destaque: true },
              { label: 'MRR Líquido',  value: moeda(kpis.mrrLiquido),    sub: `após MP (${moeda(kpis.taxasMpMensal)}) + comissões (${moeda(kpis.comissaoMensal)})`, cor: '#3b82f6' },
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Pagantes',      value: kpis.totalPagantes,  sub: 'assinaturas ativas',  cor: '#10b981' },
              { label: 'Em trial',      value: kpis.totalTrials,    sub: 'período gratuito',    cor: '#C9A65A' },
              { label: 'Expirados',     value: kpis.totalExpirados, sub: 'sem renovação',       cor: '#ef4444' },
              { label: 'Churn/30d',     value: kpis.churnMensal,    sub: 'encerramentos 30d',   cor: '#f97316' },
              { label: 'Comissões/mês', value: moeda(kpis.comissaoMensal), sub: `${kpis.totalPagantes ? Math.round(kpis.comissaoMensal / kpis.mrr * 100) : 0}% do MRR bruto`, cor: '#f59e0b', texto: true },
            ].map(({ label, value, sub, cor, texto }) => (
              <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: cor, letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--preto)', marginTop: '4px' }}>{label}</div>
                <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '1px' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Receita por plano */}
          <div className="rounded-2xl p-5 mb-4" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
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

          {/* Novo lançamento — sempre visível abaixo de receita */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '14px' }}>
              {editandoDesp ? 'Editar despesa' : 'Novo lançamento'}
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '5px' }}>Descrição</label>
                <input value={formDesp.descricao} onChange={e => setFormDesp(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Ex: Vercel Pro, Resend, …"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
              </div>
              <div style={{ flex: '1 1 110px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '5px' }}>Valor (R$)</label>
                <input type="number" min="0" step="0.01" value={formDesp.valor} onChange={e => setFormDesp(p => ({ ...p, valor: e.target.value }))}
                  placeholder="0,00"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '5px' }}>Nº NF</label>
                <input value={formDesp.numero_nf} onChange={e => setFormDesp(p => ({ ...p, numero_nf: e.target.value }))}
                  placeholder="Ex: 000123"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
              </div>
              <div style={{ flex: '1 1 130px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '5px' }}>Categoria</label>
                <select value={formDesp.categoria} onChange={e => setFormDesp(p => ({ ...p, categoria: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                  {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              {!formDesp.recorrente && (<>
                <div style={{ flex: '0 0 90px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '5px' }}>Mês</label>
                  <select value={formDesp.mes} onChange={e => setFormDesp(p => ({ ...p, mes: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                    {MESES_NOMES.map((n, i) => <option key={i+1} value={String(i+1)}>{n}</option>)}
                  </select>
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '5px' }}>Ano</label>
                  <select value={formDesp.ano} onChange={e => setFormDesp(p => ({ ...p, ano: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                    {[2024, 2025, 2026, 2027].map(a => <option key={a} value={String(a)}>{a}</option>)}
                  </select>
                </div>
              </>)}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingBottom: '2px' }}>
                <input type="checkbox" id="recorrente-top" checked={formDesp.recorrente} onChange={e => setFormDesp(p => ({ ...p, recorrente: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--vinho)', cursor: 'pointer' }} />
                <label htmlFor="recorrente-top" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--preto)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Custo fixo (mensal)</label>
              </div>
              <div style={{ display: 'flex', gap: '7px', paddingBottom: '2px' }}>
                {editandoDesp && (
                  <button onClick={() => { setEditandoDesp(null); setFormDesp({ descricao: '', valor: '', categoria: 'outro', recorrente: false, mes: String(mesFiltro), ano: String(anoFiltro), numero_nf: '' }) }}
                    style={{ padding: '8px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, border: '1.5px solid var(--cinza-light)', color: 'var(--cinza)', background: 'white', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                )}
                <button onClick={salvarDespesa} disabled={salvandoDesp || !formDesp.descricao.trim() || !formDesp.valor}
                  style={{ padding: '8px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, color: 'white', background: salvandoDesp ? '#9AA0A6' : 'var(--vinho)', border: 'none', cursor: (salvandoDesp || !formDesp.descricao.trim() || !formDesp.valor) ? 'not-allowed' : 'pointer' }}>
                  {salvandoDesp ? 'Salvando…' : editandoDesp ? 'Atualizar' : '+ Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Abas + Filtros */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {([
            ['assinantes', `Assinantes (${pagantes.length + trials.length})`],
            ['nf',         `Dados NF (${pagantes.length})`],
            ['bloqueados', `Expirados/Bloqueados (${bloqueados.length})`],
            ['despesas',   `Despesas`],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setAba(id)}
              style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: aba === id ? 'var(--vinho)' : 'white', color: aba === id ? 'white' : 'var(--cinza)', border: aba === id ? 'none' : '1px solid var(--cinza-light)' } as React.CSSProperties}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome, e-mail, CNPJ…"
            style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white', width: '220px' }} />
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white' }}>
            <option value="todos">Todos os status</option>
            <option value="active">✓ Ativos</option>
            <option value="trial">⏳ Trial</option>
            <option value="carencia">↩ Em carência</option>
            <option value="sem_mp">⚠ Sem assinatura MP</option>
            <option value="expired">✕ Expirados</option>
            <option value="bloqueado">🔒 Bloqueados</option>
          </select>
          <select value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white' }}>
            <option value="todos">Todos os planos</option>
            {[['basic','Basic'],['profissional','Profissional'],['gestao','Gestão'],['empresarial','Empresarial']].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select value={ordem} onChange={e => setOrdem(e.target.value as 'novo' | 'antigo')}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', outline: 'none', color: 'var(--preto)', background: 'white' }}>
            <option value="novo">Mais recentes</option>
            <option value="antigo">Mais antigos</option>
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
            <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                  {['Assinante', 'Plano / Valor', 'Comissão', 'Status', 'Assinante desde', 'Acesso até', 'MercadoPago', 'Ações'].map(h => (
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', background: pc.bg, color: pc.cor, textTransform: 'capitalize' }}>
                            {a.plano}
                          </span>
                          {a.periodo === 'anual' && (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(201,166,90,0.12)', color: '#92400e' }}>
                              ANUAL
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--preto)', marginTop: '4px' }}>
                          {a.status === 'trial' ? <span style={{ color: 'var(--cinza)', fontWeight: 400, fontSize: '12px' }}>gratuito</span> : (a.valor_mensalidade ? moeda(a.valor_mensalidade) + '/mês' : '—')}
                        </div>
                        {a.periodo === 'anual' && a.valor_cobrado && (
                          <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>
                            {moeda(a.valor_cobrado)}/ano cobrado
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.comissao_mensal > 0 ? (
                          <>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>{moeda(a.comissao_mensal)}/mês</div>
                            <div style={{ fontSize: '11px', color: 'var(--cinza)' }}>{a.campanha_nome}</div>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--cinza)' }}>—</span>
                        )}
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
                            <a href={`https://www.mercadopago.com.br/subscription-plans/subscriptor-details?id=${a.mp_subscription_id}`}
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
            </div>
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
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                  {['Assinante', 'Plano / Valor', 'CNPJ / CPF', 'Razão Social', 'Endereço', 'NF'].map(h => (
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
                      <td className="px-4 py-3">
                        {(() => {
                          const NF_CORES: Record<string, { bg: string; cor: string }> = {
                            pendente:  { bg: '#fff7ed', cor: '#c2410c' },
                            emitida:   { bg: '#eff6ff', cor: '#1d4ed8' },
                            enviada:   { bg: '#f0fdf4', cor: '#15803d' },
                            cancelada: { bg: '#fef2f2', cor: '#b91c1c' },
                          }
                          const c = NF_CORES[a.status_nf] ?? NF_CORES.pendente
                          return (
                            <select
                              value={a.status_nf}
                              onChange={async e => {
                                const novo = e.target.value
                                await fetch('/api/admin/financeiro', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: a.id, status_nf: novo }),
                                })
                                setAssinantes(prev => prev.map(x => x.id === a.id ? { ...x, status_nf: novo as typeof a.status_nf } : x))
                              }}
                              style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: c.bg, color: c.cor, border: 'none', cursor: 'pointer', outline: 'none' }}
                            >
                              <option value="pendente">Pendente</option>
                              <option value="emitida">Emitida</option>
                              <option value="enviada">Enviada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                          )
                        })()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
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
            <div className="overflow-x-auto">
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
            </div>
          )}
        </div>
      )}

      {/* ══ ABA DESPESAS ══ */}
      {aba === 'despesas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Filtro de mês/ano + totais */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)' }}>Período</span>
              <select value={mesFiltro} onChange={e => { const m = Number(e.target.value); setMesFiltro(m); carregarDespesas(m, anoFiltro) }}
                style={{ padding: '7px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                {MESES_NOMES.map((n, i) => <option key={i+1} value={i+1}>{n}</option>)}
              </select>
              <select value={anoFiltro} onChange={e => { const a = Number(e.target.value); setAnoFiltro(a); carregarDespesas(mesFiltro, a) }}
                style={{ padding: '7px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: 'Total despesas',    value: moeda(totalDespesasMes),               cor: '#ef4444', sub: `${despesas.length} lançamento${despesas.length !== 1 ? 's' : ''}` },
                { label: 'MRR Líquido',       value: moeda(kpis?.mrrLiquido ?? 0),          cor: '#3b82f6', sub: 'após comissões' },
                { label: 'Resultado líquido', value: moeda(resultadoLiquido),               cor: resultadoLiquido >= 0 ? '#10b981' : '#ef4444', sub: 'MRR líq. − despesas' },
                { label: 'Fixas/mês',         value: moeda(despesas.filter(d => d.recorrente).reduce((s, d) => s + d.valor, 0)), cor: '#f59e0b', sub: 'custos recorrentes' },
              ].map(({ label, value, cor, sub }) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: cor, letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--preto)', marginTop: '3px' }}>{label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--cinza)' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de despesas */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cinza-light)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)' }}>
                Lançamentos — {MESES_NOMES[mesFiltro - 1]}/{anoFiltro}
              </span>
            </div>
            {despesas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cinza)', fontSize: '14px' }}>Nenhuma despesa lançada para este período.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                    {['Descrição', 'Categoria', 'Tipo', 'Mês/Ano', 'Nº NF', 'Valor', 'Ações'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {despesas.map(d => {
                    const cat = CATEGORIAS[d.categoria] ?? CATEGORIAS.outro
                    return (
                      <tr key={d.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                        <td className="px-4 py-3">
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--preto)' }}>{d.descricao}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '8px', background: cat.bg, color: cat.cor }}>{cat.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ fontSize: '12px', color: d.recorrente ? '#f59e0b' : 'var(--cinza)', fontWeight: 600 }}>
                            {d.recorrente ? '↺ Fixo' : '· Pontual'}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: '12px', color: 'var(--cinza)' }}>
                          {d.recorrente ? 'Todo mês' : `${d.mes ? MESES_NOMES[d.mes - 1] : '?'}/${d.ano ?? '?'}`}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: '12px', color: 'var(--cinza)', fontFamily: 'monospace' }}>
                          {d.numero_nf || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>{moeda(d.valor)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {d.auto ? (
                            <span style={{ fontSize: '11px', color: 'var(--cinza)', fontStyle: 'italic' }}>automático</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => abrirEdicaoDespesa(d)}
                                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
                                Editar
                              </button>
                              <button onClick={() => excluirDespesa(d.id)}
                                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '7px', fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                                Excluir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                    <td colSpan={5} className="px-4 py-3" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cinza)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</td>
                    <td className="px-4 py-3" style={{ fontSize: '15px', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>{moeda(totalDespesasMes)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
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
                      {[['basic','Basic'],['profissional','Profissional'],['gestao','Gestão'],['empresarial','Empresarial']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
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
                {
                  label: 'ID Assinatura MercadoPago',
                  content: (
                    <input type="text"
                      value={editando.mp_subscription_id ?? ''}
                      onChange={e => setEditando({ ...editando, mp_subscription_id: e.target.value.trim() || null })}
                      placeholder="Ex: 2c9380847f..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none', fontFamily: 'monospace' }} />
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
