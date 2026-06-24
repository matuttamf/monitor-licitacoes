'use client'

import { useEffect, useState } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Metricas = {
  registros: number
  conversoes: number
  taxaConversao: number
  mrr: number
  comissaoTotal: number
  conversoes30d: number
  churn30d: number
}

type Campanha = {
  id: string
  nome: string
  tipo: string
  codigo: string
  descricao: string | null
  url_destino: string | null
  comissao_tipo: 'nenhum' | 'percentual' | 'fixo'
  comissao_valor: number
  desconto_percentual: number
  desconto_meses: number
  permite_cupom: boolean
  ativo: boolean
  criado_em: string
  metricas: Metricas
}

type RegraDesconto = {
  id: string
  plano: string | null
  periodo: string | null
  desconto_percentual: number
  desconto_meses: number
}

const PLANOS_LABEL: Record<string, string> = {
  basic: 'Basic', profissional: 'Profissional', gestao: 'Gestão', empresarial: 'Empresarial',
}

type Totais = { total: number; comAtribuicao: number; semAtribuicao: number }

type MpConfig = {
  ambiente: string
  tokenProdDefinido: boolean
  tokenTestDefinido: boolean
  tokenProdMascarado: string
  tokenTestMascarado: string
  webhookSecretDefinido: boolean
  webhookUrl: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

const TIPO_ICONE: Record<string, string> = {
  influenciador: '🎤', meta: '📘', google: '🔍',
  email: '✉️',  organico: '🌱', parceiro: '🤝', outro: '📣',
}
const TIPO_CORES: Record<string, { bg: string; cor: string }> = {
  influenciador: { bg: 'rgba(139,92,246,0.1)',  cor: '#8b5cf6' },
  meta:          { bg: 'rgba(59,130,246,0.1)',  cor: '#3b82f6' },
  google:        { bg: 'rgba(234,179,8,0.1)',   cor: '#ca8a04' },
  email:         { bg: 'rgba(16,185,129,0.1)',  cor: '#10b981' },
  organico:      { bg: 'rgba(107,15,26,0.08)',  cor: '#6B0F1A' },
  parceiro:      { bg: 'rgba(249,115,22,0.1)',  cor: '#f97316' },
  outro:         { bg: 'rgba(100,116,139,0.1)', cor: '#64748b' },
}

const TIPOS = ['influenciador','meta','google','email','organico','parceiro','outro']

const APP_URL = typeof window !== 'undefined' ? window.location.origin : ''

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CampanhasPage() {
  const [campanhas, setCampanhas]   = useState<Campanha[]>([])
  const [organico, setOrganico]     = useState<Metricas | null>(null)
  const [totais, setTotais]         = useState<Totais | null>(null)
  const [mpConfig, setMpConfig]     = useState<MpConfig | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba]               = useState<'campanhas' | 'configuracoes'>('campanhas')
  const [criando, setCriando]       = useState(false)
  const [editando, setEditando]     = useState<Campanha | null>(null)
  const [salvando, setSalvando]     = useState(false)
  const [testando, setTestando]     = useState(false)
  const [testeRes, setTesteRes]     = useState<{ ok: boolean; mensagem?: string; erro?: string; detalhe?: string } | null>(null)
  const [linkCopiado, setLinkCopiado] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('ativo')
  const [busca, setBusca] = useState('')
  const [ordenar, setOrdenar] = useState<'recente' | 'antiga' | 'mrr' | 'conversao' | 'registros'>('recente')

  const [form, setForm] = useState({
    nome: '', tipo: 'influenciador', codigo: '', descricao: '',
    url_destino: '', comissao_tipo: 'nenhum', comissao_valor: '',
    desconto_percentual: '0', desconto_meses: '0', permite_cupom: false,
  })

  // Regras de desconto por plano/ciclo (cupom) — carregadas ao editar
  const [regras, setRegras]     = useState<RegraDesconto[]>([])
  const [novaRegra, setNovaRegra] = useState({ plano: '', periodo: '', desconto_percentual: '', desconto_meses: '0' })

  async function carregarRegras(campanhaId: string) {
    const r = await fetch(`/api/admin/campanhas/descontos?campanha_id=${campanhaId}`)
    if (r.ok) setRegras((await r.json()).regras ?? [])
  }
  async function addRegra() {
    if (!editando) return
    const res = await fetch('/api/admin/campanhas/descontos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campanha_id: editando.id,
        plano:   novaRegra.plano   || null,
        periodo: novaRegra.periodo || null,
        desconto_percentual: Number(novaRegra.desconto_percentual),
        desconto_meses:      Number(novaRegra.desconto_meses) || 0,
      }),
    })
    const d = await res.json()
    if (!res.ok) { alert(d.error); return }
    setNovaRegra({ plano: '', periodo: '', desconto_percentual: '', desconto_meses: '0' })
    carregarRegras(editando.id)
  }
  async function removerRegra(id: string) {
    await fetch(`/api/admin/campanhas/descontos?id=${id}`, { method: 'DELETE' })
    if (editando) carregarRegras(editando.id)
  }

  async function carregar() {
    setCarregando(true)
    const [resCamp, resMp] = await Promise.all([
      fetch('/api/admin/campanhas'),
      fetch('/api/admin/config/mercadopago'),
    ])
    if (resCamp.ok) {
      const d = await resCamp.json()
      setCampanhas(d.campanhas ?? [])
      setOrganico(d.organico ?? null)
      setTotais(d.totais ?? null)
    }
    if (resMp.ok) setMpConfig(await resMp.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  // Gera código sugerido a partir do nome
  function gerarCodigo(nome: string) {
    return nome.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30)
  }

  function gerarLink(campanha: Campanha) {
    const base = campanha.url_destino || APP_URL
    return `${base}${base.includes('?') ? '&' : '?'}ref=${campanha.codigo}`
  }

  async function copiarLink(campanha: Campanha) {
    await navigator.clipboard.writeText(gerarLink(campanha))
    setLinkCopiado(campanha.id)
    setTimeout(() => setLinkCopiado(null), 2000)
  }

  async function salvar() {
    setSalvando(true)
    const body = editando
      ? { id: editando.id, nome: form.nome, tipo: form.tipo, descricao: form.descricao || null,
          url_destino: form.url_destino || null, comissao_tipo: form.comissao_tipo,
          comissao_valor: form.comissao_valor ? Number(form.comissao_valor) : 0,
          desconto_percentual: Number(form.desconto_percentual) || 0,
          desconto_meses: Number(form.desconto_meses) || 0,
          permite_cupom: form.permite_cupom,
          ativo: editando.ativo }
      : { nome: form.nome, tipo: form.tipo, codigo: form.codigo, descricao: form.descricao || null,
          url_destino: form.url_destino || null, comissao_tipo: form.comissao_tipo,
          comissao_valor: form.comissao_valor ? Number(form.comissao_valor) : 0,
          desconto_percentual: Number(form.desconto_percentual) || 0,
          desconto_meses: Number(form.desconto_meses) || 0,
          permite_cupom: form.permite_cupom }

    const res = await fetch('/api/admin/campanhas', {
      method: editando ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    setSalvando(false)
    if (!res.ok) { alert(d.error); return }
    setCriando(false); setEditando(null); setRegras([])
    setForm({ nome: '', tipo: 'influenciador', codigo: '', descricao: '', url_destino: '', comissao_tipo: 'nenhum', comissao_valor: '', desconto_percentual: '0', desconto_meses: '0', permite_cupom: false })
    carregar()
  }

  async function excluirCampanha(c: Campanha) {
    if (!confirm(`Excluir campanha "${c.nome}"? O histórico de atribuição é preservado.`)) return
    await fetch(`/api/admin/campanhas?id=${c.id}`, { method: 'DELETE' })
    carregar()
  }

  async function toggleAtivo(c: Campanha) {
    await fetch('/api/admin/campanhas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, ativo: !c.ativo }),
    })
    carregar()
  }

  function exportarPDF(c: Campanha) {
    const comissaoLabel =
      c.comissao_tipo === 'percentual' ? `${c.comissao_valor}% do MRR` :
      c.comissao_tipo === 'fixo'       ? `R$ ${c.comissao_valor.toFixed(2).replace('.', ',')} por conversão` :
      'Sem comissão'
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório — ${c.nome}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,sans-serif;color:#0f172a;background:#fff;padding:48px 56px}
  h1{font-size:22px;font-weight:800;margin-bottom:4px}
  .sub{font-size:13px;color:#64748b;margin-bottom:32px}
  .section{margin-bottom:28px}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:8px}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px}
  .kpi-val{font-size:22px;font-weight:800;color:#6B0F1A;letter-spacing:-0.03em}
  .kpi-label{font-size:11px;color:#64748b;margin-top:3px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .row:last-child{border-bottom:none}
  .row strong{font-weight:600}
  .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#fef2f2;color:#6B0F1A;border:1px solid rgba(107,15,26,.15)}
  .comissao-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;font-size:13px}
  .comissao-box .val{font-size:20px;font-weight:800;color:#16a34a;margin-top:4px}
  footer{margin-top:40px;font-size:11px;color:#94a3b8;text-align:center}
  @media print{body{padding:32px 40px}}
</style></head><body>
<h1>📣 ${c.nome}</h1>
<div class="sub">
  Relatório gerado em ${new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'})} &nbsp;·&nbsp;
  Campanha desde ${new Date(c.criado_em).toLocaleDateString('pt-BR')} &nbsp;·&nbsp;
  Código: <strong>${c.codigo}</strong> &nbsp;·&nbsp; <span class="badge">${c.tipo.charAt(0).toUpperCase()+c.tipo.slice(1)}</span>
</div>

<div class="section">
  <div class="section-title">Métricas de Desempenho</div>
  <div class="grid">
    <div class="kpi"><div class="kpi-val">${c.metricas.registros}</div><div class="kpi-label">Cadastros via campanha</div></div>
    <div class="kpi"><div class="kpi-val">${c.metricas.conversoes}</div><div class="kpi-label">Conversões (ativos)</div></div>
    <div class="kpi"><div class="kpi-val">${c.metricas.taxaConversao}%</div><div class="kpi-label">Taxa de conversão</div></div>
  </div>
  <div class="grid">
    <div class="kpi"><div class="kpi-val">${moeda(c.metricas.mrr)}</div><div class="kpi-label">MRR gerado</div></div>
    <div class="kpi"><div class="kpi-val">${moeda(c.metricas.mrr * 12)}</div><div class="kpi-label">ARR estimado</div></div>
    <div class="kpi"><div class="kpi-val">${c.metricas.conversoes30d}</div><div class="kpi-label">Conversões últimos 30d</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Acordo de Comissão</div>
  <div class="comissao-box">
    <div>Modelo: <strong>${comissaoLabel}</strong></div>
    <div class="val">${moeda(c.metricas.comissaoTotal)} a pagar</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Detalhes</div>
  <div class="row"><span>Status</span><strong>${c.ativo ? 'Ativa' : 'Pausada'}</strong></div>
  ${c.descricao ? `<div class="row"><span>Descrição</span><strong>${c.descricao}</strong></div>` : ''}
  ${c.url_destino ? `<div class="row"><span>URL de destino</span><strong>${c.url_destino}</strong></div>` : ''}
  <div class="row"><span>Churn últimos 30d</span><strong>${c.metricas.churn30d}</strong></div>
</div>

<footer>Monitor de Licitações — monitordelicitacoes.com.br</footer>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>
</body></html>`
    const win = window.open('', '_blank', 'width=900,height=700')
    if (win) { win.document.write(html); win.document.close() }
  }

  async function testarMP() {
    setTestando(true); setTesteRes(null)
    const res = await fetch('/api/admin/config/mercadopago', { method: 'POST' })
    setTesteRes(await res.json())
    setTestando(false)
  }

  function abrirEdicao(c: Campanha) {
    setEditando(c)
    setForm({ nome: c.nome, tipo: c.tipo, codigo: c.codigo, descricao: c.descricao ?? '',
      url_destino: c.url_destino ?? '', comissao_tipo: c.comissao_tipo,
      comissao_valor: c.comissao_valor > 0 ? String(c.comissao_valor) : '',
      desconto_percentual: String(c.desconto_percentual ?? 0),
      desconto_meses: String(c.desconto_meses ?? 0),
      permite_cupom: !!c.permite_cupom })
    setRegras([])
    carregarRegras(c.id)
    setCriando(true)
  }

  const lista = campanhas
    .filter(c => {
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false
      if (filtroAtivo === 'ativo' && !c.ativo) return false
      if (filtroAtivo === 'inativo' && c.ativo) return false
      if (busca) {
        const q = busca.toLowerCase()
        return c.nome.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || (c.descricao ?? '').toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      switch (ordenar) {
        case 'antiga':    return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
        case 'mrr':       return b.metricas.mrr - a.metricas.mrr
        case 'conversao': return b.metricas.taxaConversao - a.metricas.taxaConversao
        case 'registros': return b.metricas.registros - a.metricas.registros
        default:          return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
      }
    })

  // KPIs globais das campanhas ativas
  const ativas = campanhas.filter(c => c.ativo)
  const totalRegistrosCamp = ativas.reduce((s, c) => s + c.metricas.registros, 0)
  const totalConversoesCamp = ativas.reduce((s, c) => s + c.metricas.conversoes, 0)
  const totalMrrCamp = ativas.reduce((s, c) => s + c.metricas.mrr, 0)
  const totalComissao = ativas.reduce((s, c) => s + c.metricas.comissaoTotal, 0)

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <a href="/admin" className="text-xs font-medium mb-1 block" style={{ color: 'var(--cinza)', textDecoration: 'none' }}>← Painel Admin</a>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>📣 Campanhas & Marketing</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>Rastreamento de origem, métricas de conversão, comissões e configurações</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {aba === 'campanhas' && (
            <button onClick={() => { setCriando(true); setEditando(null); setRegras([]); setForm({ nome: '', tipo: 'influenciador', codigo: '', descricao: '', url_destino: '', comissao_tipo: 'nenhum', comissao_valor: '', desconto_percentual: '0', desconto_meses: '0', permite_cupom: false }) }}
              style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}>
              + Nova campanha
            </button>
          )}
          <button onClick={carregar} style={{ fontSize: '12px', color: 'var(--cinza)', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--cinza-light)', background: 'white', cursor: 'pointer' }}>↺</button>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {([['campanhas','📣 Campanhas'], ['configuracoes','⚙ Configurações de Pagamento']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              background: aba === id ? 'var(--vinho)' : 'white', color: aba === id ? 'white' : 'var(--cinza)',
              border: aba === id ? 'none' : '1px solid var(--cinza-light)' } as React.CSSProperties}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ ABA CAMPANHAS ══ */}
      {aba === 'campanhas' && (
        <>
          {/* KPI Cards globais */}
          {!carregando && totais && (
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Cadastros via campanha', value: totalRegistrosCamp, sub: `de ${totais.total} total (${totais.semAtribuicao} orgânicos)`, cor: '#3b82f6' },
                { label: 'Conversões', value: totalConversoesCamp, sub: `${totalRegistrosCamp ? Math.round(totalConversoesCamp/totalRegistrosCamp*100) : 0}% taxa geral`, cor: '#10b981' },
                { label: 'MRR de campanhas', value: moeda(totalMrrCamp), sub: `${moeda(organico?.mrr ?? 0)} orgânico`, cor: '#8b5cf6', texto: true },
                { label: 'Comissão a pagar', value: moeda(totalComissao), sub: 'este mês', cor: '#f97316', texto: true },
              ].map(({ label, value, sub, cor, texto }) => (
                <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontSize: texto ? '18px' : '28px', fontWeight: 800, color: cor, letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--preto)', marginTop: '4px' }}>{label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '2px' }}>{sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Orgânico card */}
          {!carregando && organico && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(107,15,26,0.04)', border: '1px dashed rgba(107,15,26,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#6B0F1A' }}>🌱 Orgânico / Direto (sem atribuição)</span>
                {[
                  { label: 'Cadastros', val: organico.registros },
                  { label: 'Converteram', val: organico.conversoes },
                  { label: 'Taxa', val: `${organico.taxaConversao}%` },
                  { label: 'MRR', val: moeda(organico.mrr) },
                ].map(({ label, val }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#6B0F1A' }}>{val}</div>
                    <div style={{ fontSize: '10px', color: 'var(--cinza)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Busca */}
            <input
              type="text"
              placeholder="Buscar por nome ou código…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none', minWidth: '200px' }}
            />
            {/* Tipo */}
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
              <option value="todos">Todos os tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_ICONE[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
            {/* Status */}
            {(['todos','ativo','inativo'] as const).map(f => (
              <button key={f} onClick={() => setFiltroAtivo(f)}
                style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  background: filtroAtivo === f ? '#1A1A1C' : 'white',
                  color: filtroAtivo === f ? 'white' : 'var(--cinza)',
                  border: filtroAtivo === f ? 'none' : '1px solid var(--cinza-light)' }}>
                {f === 'todos' ? 'Todas' : f === 'ativo' ? 'Ativas' : 'Inativas'}
              </button>
            ))}
            {/* Ordenação */}
            <select value={ordenar} onChange={e => setOrdenar(e.target.value as typeof ordenar)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none', marginLeft: 'auto' }}>
              <option value="recente">↓ Mais recentes</option>
              <option value="antiga">↑ Mais antigas</option>
              <option value="mrr">↓ Maior MRR</option>
              <option value="conversao">↓ Maior conversão</option>
              <option value="registros">↓ Mais cadastros</option>
            </select>
          </div>

          {/* Cards de campanhas */}
          {carregando ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
              {[1,2,3].map(i => <div key={i} className="animate-pulse rounded-2xl" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '200px' }} />)}
            </div>
          ) : lista.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--cinza)', fontSize: '14px' }}>
              Nenhuma campanha. Clique em "+ Nova campanha" para começar.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
              {lista.map(c => {
                const tc = TIPO_CORES[c.tipo] ?? TIPO_CORES.outro
                const ic = TIPO_ICONE[c.tipo] ?? '📣'
                const link = gerarLink(c)
                const m = c.metricas
                return (
                  <div key={c.id} style={{ background: 'white', border: `1px solid ${c.ativo ? 'var(--cinza-light)' : '#e5e7eb'}`, borderRadius: '18px', padding: '20px', opacity: c.ativo ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Header do card */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{ic}</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--preto)', lineHeight: 1.2 }}>{c.nome}</div>
                          <div style={{ fontSize: '11px', color: 'var(--cinza)', marginTop: '2px' }}>
                            <span style={{ fontWeight: 600, color: tc.cor, padding: '1px 7px', borderRadius: '6px', background: tc.bg }}>{c.tipo}</span>
                            {' · '}<span style={{ fontFamily: 'monospace' }}>{c.codigo}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                        <button onClick={() => abrirEdicao(c)} style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                        <button onClick={() => toggleAtivo(c)} style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', background: c.ativo ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.1)', color: c.ativo ? '#ef4444' : '#10b981', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          {c.ativo ? 'Pausar' : 'Ativar'}
                        </button>
                        <button onClick={() => exportarPDF(c)} style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'none', cursor: 'pointer', fontWeight: 600 }}>PDF</button>
                        <button onClick={() => excluirCampanha(c)} style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', background: 'rgba(100,116,139,0.08)', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Excluir</button>
                      </div>
                    </div>

                    {/* Métricas */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {[
                        { label: 'Cadastros', val: m.registros, cor: '#3b82f6' },
                        { label: 'Converteram', val: m.conversoes, cor: '#10b981' },
                        { label: 'Taxa', val: `${m.taxaConversao}%`, cor: '#8b5cf6' },
                        { label: 'MRR', val: m.mrr > 0 ? moeda(m.mrr) : '—', cor: '#6B0F1A', small: true },
                      ].map(({ label, val, cor, small }) => (
                        <div key={label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: '10px', background: 'var(--surface-2)' }}>
                          <div style={{ fontSize: small ? '12px' : '16px', fontWeight: 800, color: cor, letterSpacing: '-0.02em' }}>{val}</div>
                          <div style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '2px' }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Comissão */}
                    {c.comissao_tipo !== 'nenhum' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
                        <span style={{ fontSize: '12px', color: '#f97316', fontWeight: 600 }}>
                          💸 Comissão: {c.comissao_tipo === 'percentual' ? `${c.comissao_valor}% por conversão` : `R$${c.comissao_valor} fixo/conversão`}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f97316' }}>{moeda(m.comissaoTotal)}</span>
                      </div>
                    )}

                    {/* Link de rastreamento */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input readOnly value={link}
                        style={{ flex: 1, fontSize: '11px', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--cinza-light)', background: 'var(--surface-2)', color: 'var(--cinza)', fontFamily: 'monospace', outline: 'none', minWidth: 0 }}
                        onClick={e => (e.target as HTMLInputElement).select()}
                      />
                      <button onClick={() => copiarLink(c)}
                        style={{ fontSize: '11px', padding: '7px 12px', borderRadius: '8px', fontWeight: 600, background: linkCopiado === c.id ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)', color: linkCopiado === c.id ? '#10b981' : 'var(--cinza)', border: '1px solid var(--cinza-light)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {linkCopiado === c.id ? '✓ Copiado' : '📋 Copiar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══ ABA CONFIGURAÇÕES MP ══ */}
      {aba === 'configuracoes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '900px' }}>

          {/* Status atual */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--cinza-light)', gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--preto)', margin: '0 0 16px' }}>Status da integração de pagamento</h2>
            {carregando || !mpConfig ? (
              <div style={{ color: 'var(--cinza)', fontSize: '13px' }}>Carregando…</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Ambiente', val: mpConfig.ambiente === 'production' ? '🟢 Produção' : '🟡 Teste (sandbox)', destaque: mpConfig.ambiente === 'production' },
                  { label: 'Token de produção', val: mpConfig.tokenProdDefinido ? `✓ ${mpConfig.tokenProdMascarado}` : '✕ Não configurado', ok: mpConfig.tokenProdDefinido },
                  { label: 'Token de teste', val: mpConfig.tokenTestDefinido ? `✓ ${mpConfig.tokenTestMascarado}` : '✕ Não configurado', ok: mpConfig.tokenTestDefinido },
                  { label: 'Webhook secret', val: mpConfig.webhookSecretDefinido ? '✓ Configurado' : '⚠ Não configurado (HMAC desativado)', ok: mpConfig.webhookSecretDefinido },
                ].map(({ label, val, ok, destaque }) => (
                  <div key={label} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: destaque ? '#10b981' : ok === true ? '#10b981' : ok === false ? '#ef4444' : 'var(--preto)' }}>{val}</div>
                  </div>
                ))}

                {/* Webhook URL */}
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--cinza-light)', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '6px' }}>URL do Webhook (cadastre no painel do MP)</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <code style={{ flex: 1, fontSize: '12px', padding: '8px 12px', borderRadius: '8px', background: '#1A1A1C', color: '#34d399', fontFamily: 'monospace' }}>
                      {mpConfig.webhookUrl}
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(mpConfig.webhookUrl) }}
                      style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Teste de conexão */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={testarMP} disabled={testando}
                style={{ padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: testando ? '#9AA0A6' : '#009ee3', color: 'white', border: 'none', cursor: testando ? 'not-allowed' : 'pointer' }}>
                {testando ? '⏳ Testando…' : '⚡ Testar conexão com MP'}
              </button>
              {testeRes && (
                <div style={{ fontSize: '13px', fontWeight: 600, color: testeRes.ok ? '#10b981' : '#ef4444', padding: '8px 14px', borderRadius: '10px', background: testeRes.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)' }}>
                  {testeRes.ok ? `✓ ${testeRes.mensagem}` : `✕ ${testeRes.erro}`}
                  {testeRes.detalhe && <div style={{ fontSize: '11px', fontWeight: 400, marginTop: '2px', opacity: 0.8 }}>{testeRes.detalhe}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Instruções ambiente */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--preto)', margin: '0 0 12px' }}>Como configurar as variáveis</h3>
            <ol style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Acesse o painel de hospedagem → configurações de variáveis de ambiente',
                'Adicione MP_AMBIENTE = production (ou test para sandbox)',
                'Adicione MP_ACCESS_TOKEN_PROD com o token de produção',
                'Adicione MP_ACCESS_TOKEN_TEST com o token de teste (sandbox)',
                'Adicione MP_WEBHOOK_SECRET com o secret configurado no painel de pagamento',
                'Faça um novo deploy para as variáveis entrarem em vigor',
              ].map((txt, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--cinza)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--preto)' }}>{i+1}.</strong> {txt}
                </li>
              ))}
            </ol>
          </div>

          {/* Instruções webhook MP */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--preto)', margin: '0 0 12px' }}>Configurar webhook de pagamento</h3>
            <ol style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'No painel do MP → Seu negócio → Configurações → Webhooks',
                'Clique em "Adicionar endpoint"',
                'Cole a URL do webhook acima',
                'Selecione o evento: Assinaturas → subscription_preapproval',
                'Copie o "Chave secreta" e adicione como MP_WEBHOOK_SECRET na Vercel',
                'Salve e teste o envio via "Simular notificação"',
              ].map((txt, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--cinza)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--preto)' }}>{i+1}.</strong> {txt}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ══ Modal criar/editar campanha ══ */}
      {criando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--preto)', margin: '0 0 4px' }}>
              {editando ? 'Editar campanha' : 'Nova campanha'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cinza)', margin: '0 0 24px' }}>
              {editando ? `Código: ${editando.codigo} (imutável)` : 'O código é único e não pode ser alterado depois.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>Nome da campanha *</label>
                  <input value={form.nome} onChange={e => {
                    const nome = e.target.value
                    setForm(f => ({ ...f, nome, ...(editando ? {} : { codigo: gerarCodigo(nome) }) }))
                  }}
                    placeholder="Ex: João Silva — Instagram Jun/26"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                    {TIPOS.map(t => <option key={t} value={t}>{TIPO_ICONE[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>
                    Código do link {editando ? '(imutável)' : '*'}
                  </label>
                  <input value={form.codigo} onChange={e => !editando && setForm(f => ({ ...f, codigo: e.target.value }))}
                    readOnly={!!editando} placeholder="ex: joao-silva"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: editando ? 'var(--cinza)' : 'var(--preto)', background: editando ? 'var(--surface-2)' : 'white', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                  {!editando && form.codigo && (
                    <div style={{ fontSize: '11px', color: 'var(--cinza)', marginTop: '3px' }}>Link: …?ref={form.codigo}</div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>URL de destino (opcional)</label>
                <input value={form.url_destino} onChange={e => setForm(f => ({ ...f, url_destino: e.target.value }))}
                  placeholder="Padrão: página principal do site"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>Tipo de comissão</label>
                  <select value={form.comissao_tipo} onChange={e => setForm(f => ({ ...f, comissao_tipo: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                    <option value="nenhum">Sem comissão</option>
                    <option value="percentual">% sobre mensalidade</option>
                    <option value="fixo">Valor fixo por conversão</option>
                  </select>
                </div>

                {form.comissao_tipo !== 'nenhum' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>
                      {form.comissao_tipo === 'percentual' ? 'Percentual (%)' : 'Valor fixo (R$)'}
                    </label>
                    <input type="number" step="0.01" min="0" value={form.comissao_valor}
                      onChange={e => setForm(f => ({ ...f, comissao_valor: e.target.value }))}
                      placeholder={form.comissao_tipo === 'percentual' ? 'Ex: 20' : 'Ex: 50.00'}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {/* Desconto por período (parcerias) */}
                <div style={{ borderTop: '1px solid var(--cinza-light)', paddingTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '8px' }}>
                    Desconto de parceria (opcional)
                  </label>
                  <p style={{ fontSize: '11px', color: 'var(--cinza)', marginBottom: '10px' }}>
                    Usuários vindos desta campanha recebem X% de desconto nos primeiros N meses. Após o período, o sistema reajusta automaticamente para o valor integral via MercadoPago.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '4px' }}>Desconto (%)</label>
                      <input type="number" min="0" max="100" step="1" value={form.desconto_percentual}
                        onChange={e => setForm(f => ({ ...f, desconto_percentual: e.target.value }))}
                        placeholder="Ex: 30"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--cinza)', marginBottom: '4px' }}>Meses com desconto</label>
                      <input type="number" min="0" step="1" value={form.desconto_meses}
                        onChange={e => setForm(f => ({ ...f, desconto_meses: e.target.value }))}
                        placeholder="Ex: 3"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none' }} />
                    </div>
                  </div>
                  {Number(form.desconto_percentual) > 0 && Number(form.desconto_meses) > 0 && (
                    <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '6px' }}>
                      ✓ {form.desconto_percentual}% off nos primeiros {form.desconto_meses} meses → após, preço integral
                    </p>
                  )}
                </div>
              </div>

              {/* ── Cupom digitável (regras por plano/ciclo) ───────────────────────── */}
              <div style={{ borderTop: '1px solid var(--cinza-light)', paddingTop: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.permite_cupom}
                    onChange={e => setForm(f => ({ ...f, permite_cupom: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--vinho)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--preto)' }}>Usar como cupom de desconto (digitável no checkout)</span>
                </label>
                <p style={{ fontSize: '11px', color: 'var(--cinza)', margin: '6px 0 0 24px' }}>
                  O cliente digita <strong>{form.codigo || 'o código'}</strong> no checkout e recebe o desconto da regra que casar com o plano/ciclo escolhido.
                </p>

                {form.permite_cupom && !editando && (
                  <p style={{ fontSize: '11px', color: '#f97316', fontWeight: 600, margin: '10px 0 0 24px' }}>
                    Crie a campanha primeiro; depois reabra em "Editar" para adicionar as regras de desconto.
                  </p>
                )}

                {form.permite_cupom && editando && (
                  <div style={{ marginTop: '12px', marginLeft: '24px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '8px' }}>Regras de desconto</div>

                    {/* Regras existentes */}
                    {regras.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                        {regras.map(r => (
                          <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderRadius: '9px', background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                            <span style={{ fontSize: '12px', color: 'var(--preto)' }}>
                              <strong style={{ color: 'var(--vinho)' }}>{r.desconto_percentual}%</strong>
                              {' · '}{r.plano ? PLANOS_LABEL[r.plano] ?? r.plano : 'Todos os planos'}
                              {' · '}{r.periodo === 'mensal' ? 'Mensal' : r.periodo === 'anual' ? 'Anual' : 'Todos os ciclos'}
                              {' · '}{r.desconto_meses > 0 ? `${r.desconto_meses} ${r.desconto_meses === 1 ? 'mês' : 'meses'}` : 'permanente'}
                            </span>
                            <button onClick={() => removerRegra(r.id)}
                              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600 }}>remover</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Nova regra */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr auto', gap: '6px', alignItems: 'end' }}>
                      <select value={novaRegra.plano} onChange={e => setNovaRegra(r => ({ ...r, plano: e.target.value }))}
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1.5px solid var(--cinza-light)', fontSize: '12px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                        <option value="">Todos os planos</option>
                        {Object.entries(PLANOS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select value={novaRegra.periodo} onChange={e => setNovaRegra(r => ({ ...r, periodo: e.target.value }))}
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1.5px solid var(--cinza-light)', fontSize: '12px', color: 'var(--preto)', background: 'white', outline: 'none' }}>
                        <option value="">Todos os ciclos</option>
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                      </select>
                      <input type="number" min="1" max="100" placeholder="%" value={novaRegra.desconto_percentual}
                        onChange={e => setNovaRegra(r => ({ ...r, desconto_percentual: e.target.value }))}
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1.5px solid var(--cinza-light)', fontSize: '12px', color: 'var(--preto)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                      <input type="number" min="0" placeholder="meses" value={novaRegra.desconto_meses}
                        onChange={e => setNovaRegra(r => ({ ...r, desconto_meses: e.target.value }))}
                        title="0 = permanente"
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1.5px solid var(--cinza-light)', fontSize: '12px', color: 'var(--preto)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                      <button onClick={addRegra} disabled={!novaRegra.desconto_percentual}
                        style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--cinza)', marginTop: '6px' }}>
                      Meses: <strong>0 = permanente</strong>. A regra mais específica (plano+ciclo) tem prioridade sobre a geral.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cinza)', marginBottom: '5px' }}>Descrição / notas (opcional)</label>
                <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Parceria com João Silva, 3 posts no feed de Jul/2026"
                  rows={2}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--cinza-light)', fontSize: '13px', color: 'var(--preto)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => { setCriando(false); setEditando(null) }}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: '1.5px solid var(--cinza-light)', color: 'var(--cinza)', background: 'white', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando || !form.nome || (!editando && !form.codigo)}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: salvando ? '#9AA0A6' : 'var(--vinho)', border: 'none', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Criar campanha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
