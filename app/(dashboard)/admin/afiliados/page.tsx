'use client'

import React, { useEffect, useState } from 'react'

type Link = {
  id: string
  campanha_id: string
  codigo: string
  comissao_tipo: string
  comissao_valor: number
  cliques: number
  campanha_nome: string | null
  campanha_codigo: string | null
}

type Afiliado = {
  id: string
  nome: string
  email: string
  status: 'pendente' | 'ativo' | 'bloqueado'
  criado_em: string
  cnpj: string | null
  chave_pix: string | null
  links: Link[]
  cliques: number
  conversoes: number
  comissao_pendente: number
  comissao_paga: number
}

type Pagamento = {
  id: string
  mes_ref: string
  valor: number
  status: 'pendente' | 'pago'
  pago_em: string | null
  tipo_gatilho: string | null
  numero_nf?: string | null
}

type CampanhaOpcao = { id: string; nome: string; codigo: string }
type NovoVinculo = { campanha_id: string; comissao_tipo: string; comissao_valor: string }

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function comissaoTexto(tipo: string, valor: number) {
  return tipo === 'percentual' ? `${valor}%` : tipo === 'fixo' ? `${fmtMoeda(valor)} fixo` : 'sem comissão'
}

const statusCfg = {
  pendente:  { label: 'Pendente',  cor: '#b45309', bg: 'rgba(245,158,11,0.1)'  },
  ativo:     { label: 'Ativo',     cor: '#059669', bg: 'rgba(5,150,105,0.1)'   },
  bloqueado: { label: 'Bloqueado', cor: '#dc2626', bg: 'rgba(220,38,38,0.1)'   },
}

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''
const linkVinculo = (codigo: string) => `${ORIGIN}/r/${codigo}`
const VINCULO_VAZIO: NovoVinculo = { campanha_id: '', comissao_tipo: 'percentual', comissao_valor: '' }

export default function AdminAfiliados() {
  const [afiliados, setAfiliados]   = useState<Afiliado[]>([])
  const [campanhas, setCampanhas]   = useState<CampanhaOpcao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [abrirForm, setAbrirForm]   = useState(false)
  const [enviando, setEnviando]     = useState(false)
  const [feedback, setFeedback]     = useState('')
  const [form, setForm]             = useState<{ nome: string; email: string; cnpj: string; chave_pix: string; campanhas: NovoVinculo[] }>(
    { nome: '', email: '', cnpj: '', chave_pix: '', campanhas: [{ ...VINCULO_VAZIO }] }
  )

  // Drawer de campanhas (vínculos) por afiliado
  const [campAberto, setCampAberto]   = useState<string | null>(null)
  const [vinculos, setVinculos]       = useState<Record<string, Link[]>>({})
  const [novoVinc, setNovoVinc]       = useState<NovoVinculo>({ ...VINCULO_VAZIO })
  const [copiado, setCopiado]         = useState<string | null>(null)

  // Drawer de pagamentos
  const [pagAberto, setPagAberto]       = useState<string | null>(null)
  const [pagamentos, setPagamentos]     = useState<Record<string, Pagamento[]>>({})
  const [marcandoPago, setMarcandoPago] = useState<string | null>(null)
  const [nfModal, setNfModal]           = useState<{ id: string; afiliadoId: string; mesRef: string; valor: number } | null>(null)
  const [nfNumero, setNfNumero]         = useState('')

  async function carregar() {
    setCarregando(true)
    const [resAfil, resCamp] = await Promise.all([
      fetch('/api/admin/afiliados'),
      fetch('/api/admin/campanhas'),
    ])
    const dataAfil = await resAfil.json()
    const dataCamp = await resCamp.json()
    setAfiliados(dataAfil.afiliados ?? [])
    setCampanhas((dataCamp.campanhas ?? []).filter((c: { ativo: boolean }) => c.ativo))
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  // ── Criar afiliado ──────────────────────────────────────────────────────────
  async function criarAfiliado(e: React.FormEvent) {
    e.preventDefault()
    const links = form.campanhas.filter(c => c.campanha_id)
    if (links.length === 0) { setFeedback('Adicione ao menos uma campanha'); return }
    setEnviando(true); setFeedback('')
    const res = await fetch('/api/admin/afiliados', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome, email: form.email, cnpj: form.cnpj, chave_pix: form.chave_pix,
        campanhas: links.map(c => ({ campanha_id: c.campanha_id, comissao_tipo: c.comissao_tipo, comissao_valor: Number(c.comissao_valor) || 0 })),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setFeedback(data.error ?? 'Erro ao criar afiliado'); setEnviando(false); return }
    setFeedback('Convite enviado com sucesso!')
    setForm({ nome: '', email: '', cnpj: '', chave_pix: '', campanhas: [{ ...VINCULO_VAZIO }] })
    setAbrirForm(false); setEnviando(false)
    carregar()
  }

  function setCampanhaForm(i: number, patch: Partial<NovoVinculo>) {
    setForm(f => ({ ...f, campanhas: f.campanhas.map((c, j) => j === i ? { ...c, ...patch } : c) }))
  }

  // ── Ações de status ─────────────────────────────────────────────────────────
  async function acao(id: string, tipo: string) {
    await fetch('/api/admin/afiliados', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, acao: tipo }) })
    carregar()
  }
  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Remove o afiliado, seus links e pagamentos.`)) return
    await fetch(`/api/admin/afiliados?id=${id}`, { method: 'DELETE' })
    carregar()
  }

  // ── Drawer de campanhas (vínculos) ──────────────────────────────────────────
  async function abrirCampanhas(afiliadoId: string) {
    if (campAberto === afiliadoId) { setCampAberto(null); return }
    setCampAberto(afiliadoId); setPagAberto(null); setNovoVinc({ ...VINCULO_VAZIO })
    await recarregarVinculos(afiliadoId)
  }
  async function recarregarVinculos(afiliadoId: string) {
    const res = await fetch(`/api/admin/afiliados/campanhas?afiliado_id=${afiliadoId}`)
    const data = await res.json()
    const lista: Link[] = (data.vinculos ?? []).map((v: Record<string, unknown>) => ({
      id: v.id, campanha_id: v.campanha_id, codigo: v.codigo,
      comissao_tipo: v.comissao_tipo, comissao_valor: v.comissao_valor, cliques: v.cliques,
      campanha_nome: (v.campanha as { nome?: string } | null)?.nome ?? null,
      campanha_codigo: (v.campanha as { codigo?: string } | null)?.codigo ?? null,
    }))
    setVinculos(prev => ({ ...prev, [afiliadoId]: lista }))
  }
  async function addVinculo(afiliadoId: string) {
    if (!novoVinc.campanha_id) return
    const res = await fetch('/api/admin/afiliados/campanhas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afiliado_id: afiliadoId, campanha_id: novoVinc.campanha_id, comissao_tipo: novoVinc.comissao_tipo, comissao_valor: Number(novoVinc.comissao_valor) || 0 }),
    })
    const d = await res.json()
    if (!res.ok) { alert(d.error ?? 'Erro ao adicionar campanha'); return }
    setNovoVinc({ ...VINCULO_VAZIO })
    await recarregarVinculos(afiliadoId); carregar()
  }
  async function removerVinculo(afiliadoId: string, id: string) {
    if (!window.confirm('Remover esta campanha do afiliado? O link deixa de funcionar.')) return
    await fetch(`/api/admin/afiliados/campanhas?id=${id}`, { method: 'DELETE' })
    await recarregarVinculos(afiliadoId); carregar()
  }
  function copiar(codigo: string) {
    navigator.clipboard.writeText(linkVinculo(codigo))
    setCopiado(codigo); setTimeout(() => setCopiado(null), 1800)
  }

  // ── Drawer de pagamentos ────────────────────────────────────────────────────
  async function abrirPagamentos(afiliadoId: string) {
    if (pagAberto === afiliadoId) { setPagAberto(null); return }
    setPagAberto(afiliadoId); setCampAberto(null)
    const res = await fetch(`/api/admin/afiliados/pagamentos?afiliado_id=${afiliadoId}`)
    const data = await res.json()
    setPagamentos(prev => ({ ...prev, [afiliadoId]: data.pagamentos ?? [] }))
  }
  async function confirmarPagamento() {
    if (!nfModal) return
    const { id, afiliadoId } = nfModal
    const chave = `${afiliadoId}-${id}`
    setMarcandoPago(chave); setNfModal(null)
    const res = await fetch('/api/admin/afiliados/pagamentos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, numero_nf: nfNumero || null }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error ?? 'Erro ao marcar pagamento como pago')
      setMarcandoPago(null); setNfNumero(''); return
    }
    const [resPag, resAfil] = await Promise.all([
      fetch(`/api/admin/afiliados/pagamentos?afiliado_id=${afiliadoId}`),
      fetch('/api/admin/afiliados'),
    ])
    const dataPag  = await resPag.json()
    const dataAfil = await resAfil.json()
    setPagamentos(prev => ({ ...prev, [afiliadoId]: dataPag.pagamentos ?? [] }))
    setAfiliados(dataAfil.afiliados ?? [])
    setMarcandoPago(null); setNfNumero('')
  }

  const totalComissao = afiliados.filter(a => a.status === 'ativo').reduce((s, a) => s + a.comissao_pendente, 0)

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--cinza-light)', fontSize: 14, boxSizing: 'border-box', background: 'white' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--preto)', margin: 0 }}>Afiliados</h1>
          <p style={{ fontSize: 13, color: 'var(--cinza)', margin: '4px 0 0' }}>
            Parceiros ativos: {afiliados.filter(a => a.status === 'ativo').length} · Comissão pendente: {fmtMoeda(totalComissao)}
          </p>
        </div>
        <button onClick={() => setAbrirForm(v => !v)} style={{ background: 'var(--vinho)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          + Convidar afiliado
        </button>
      </div>

      {abrirForm && (
        <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--preto)' }}>Novo afiliado</h3>
          <form onSubmit={criarAfiliado} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>Nome</label>
              <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required placeholder="Nome do parceiro" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@parceiro.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>CNPJ <span style={{ fontWeight: 400, color: 'var(--cinza)' }}>(opcional)</span></label>
              <input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>Chave PIX <span style={{ fontWeight: 400, color: 'var(--cinza)' }}>(opcional)</span></label>
              <input value={form.chave_pix} onChange={e => setForm(f => ({ ...f, chave_pix: e.target.value }))} placeholder="CPF, CNPJ, e-mail ou chave aleatória" style={inputStyle} />
            </div>

            {/* Campanhas do afiliado */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 8 }}>Campanhas e comissão</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.campanhas.map((c, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 0.7fr auto', gap: 8, alignItems: 'center' }}>
                    <select value={c.campanha_id} onChange={e => setCampanhaForm(i, { campanha_id: e.target.value })} style={{ ...inputStyle, padding: '9px 12px', fontSize: 13 }}>
                      <option value="">Selecione a campanha</option>
                      {campanhas.map(cp => <option key={cp.id} value={cp.id}>{cp.nome} — /{cp.codigo}</option>)}
                    </select>
                    <select value={c.comissao_tipo} onChange={e => setCampanhaForm(i, { comissao_tipo: e.target.value })} style={{ ...inputStyle, padding: '9px 12px', fontSize: 13 }}>
                      <option value="percentual">% da assinatura</option>
                      <option value="fixo">Valor fixo</option>
                      <option value="nenhum">Sem comissão</option>
                    </select>
                    <input type="number" step="0.01" min="0" value={c.comissao_valor} onChange={e => setCampanhaForm(i, { comissao_valor: e.target.value })}
                      placeholder={c.comissao_tipo === 'percentual' ? '20' : '50.00'} disabled={c.comissao_tipo === 'nenhum'}
                      style={{ ...inputStyle, padding: '9px 12px', fontSize: 13, opacity: c.comissao_tipo === 'nenhum' ? 0.5 : 1 }} />
                    <button type="button" onClick={() => setForm(f => ({ ...f, campanhas: f.campanhas.filter((_, j) => j !== i) }))}
                      disabled={form.campanhas.length === 1}
                      style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: 'none', borderRadius: 8, padding: '9px 11px', fontSize: 13, cursor: form.campanhas.length === 1 ? 'not-allowed' : 'pointer', opacity: form.campanhas.length === 1 ? 0.4 : 1 }}>✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, campanhas: [...f.campanhas, { ...VINCULO_VAZIO }] }))}
                style={{ marginTop: 8, background: 'none', border: '1px dashed var(--cinza-light)', color: 'var(--vinho)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Adicionar campanha
              </button>
              <p style={{ fontSize: 11, color: 'var(--cinza)', margin: '8px 0 0' }}>Cada campanha gera um link único do afiliado, com a comissão definida aqui.</p>
            </div>

            {feedback && <p style={{ gridColumn: '1 / -1', fontSize: 13, color: feedback.includes('sucesso') ? '#059669' : '#dc2626', margin: 0 }}>{feedback}</p>}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button type="submit" disabled={enviando} style={{ background: 'var(--vinho)', color: 'white', border: 'none', borderRadius: 9, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1 }}>
                {enviando ? 'Enviando…' : 'Enviar convite'}
              </button>
              <button type="button" onClick={() => setAbrirForm(false)} style={{ background: 'none', border: '1px solid var(--cinza-light)', color: 'var(--cinza)', borderRadius: 9, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--cinza)', fontSize: 14 }}>Carregando…</div>
        ) : afiliados.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--cinza)', fontSize: 14 }}>Nenhum afiliado cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Parceiro', 'Campanhas', 'Cliques', 'Conversões', 'Comissão pendente', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--cinza)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {afiliados.map(a => {
                const cfg = statusCfg[a.status]
                return (
                  <React.Fragment key={a.id}>
                    <tr style={{ borderTop: '1px solid var(--cinza-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--preto)' }}>{a.nome}</div>
                        <div style={{ fontSize: 12, color: 'var(--cinza)' }}>{a.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--cinza)' }}>
                        {a.links.length === 0 ? '—' : (
                          <span style={{ fontWeight: 600, color: 'var(--preto)' }}>{a.links.length}</span>
                        )}
                        {a.links.length > 0 && <span> {a.links.length === 1 ? 'campanha' : 'campanhas'}</span>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--preto)' }}>{a.cliques.toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--preto)' }}>{a.conversoes}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: a.comissao_pendente > 0 ? '#b45309' : 'var(--cinza)' }}>{fmtMoeda(a.comissao_pendente)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button onClick={() => abrirCampanhas(a.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(107,15,26,0.3)', background: campAberto === a.id ? '#6B0F1A' : 'none', color: campAberto === a.id ? 'white' : '#6B0F1A', fontWeight: 600, cursor: 'pointer' }}>Campanhas</button>
                          <button onClick={() => abrirPagamentos(a.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--cinza-light)', background: pagAberto === a.id ? '#1A1A1C' : 'none', color: pagAberto === a.id ? 'white' : 'var(--cinza)', fontWeight: 600, cursor: 'pointer' }}>Pagamentos</button>
                          {a.status === 'pendente' && <button onClick={() => acao(a.id, 'reenviar')} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--cinza-light)', background: 'none', cursor: 'pointer', color: 'var(--cinza)' }}>Reenviar</button>}
                          {a.status !== 'bloqueado'
                            ? <button onClick={() => acao(a.id, 'bloquear')} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(220,38,38,0.3)', background: 'none', cursor: 'pointer', color: '#dc2626' }}>Bloquear</button>
                            : <button onClick={() => acao(a.id, 'ativar')} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(5,150,105,0.3)', background: 'none', cursor: 'pointer', color: '#059669' }}>Ativar</button>}
                          <button onClick={() => excluir(a.id, a.nome)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', cursor: 'pointer', color: '#dc2626' }}>Excluir</button>
                        </div>
                      </td>
                    </tr>

                    {/* Drawer de campanhas (vínculos) */}
                    {campAberto === a.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: '0 16px 16px', background: 'var(--surface-2)' }}>
                          <div style={{ borderRadius: 10, border: '1px solid var(--cinza-light)', background: 'white', padding: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--preto)', marginBottom: 12 }}>Campanhas de {a.nome}</div>
                            {!vinculos[a.id] ? (
                              <p style={{ fontSize: 13, color: 'var(--cinza)', margin: 0 }}>Carregando…</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {vinculos[a.id].map(v => (
                                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)' }}>{v.campanha_nome ?? '—'}</div>
                                      <div style={{ fontSize: 11, color: 'var(--cinza)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkVinculo(v.codigo)}</div>
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--cinza)' }}>{v.cliques} cliques</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#b45309' }}>{comissaoTexto(v.comissao_tipo, v.comissao_valor)}</span>
                                    <button onClick={() => copiar(v.codigo)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--cinza-light)', background: copiado === v.codigo ? 'rgba(5,150,105,0.1)' : 'white', color: copiado === v.codigo ? '#059669' : 'var(--cinza)', fontWeight: 600, cursor: 'pointer' }}>{copiado === v.codigo ? '✓ Copiado' : 'Copiar link'}</button>
                                    <button onClick={() => removerVinculo(a.id, v.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}>remover</button>
                                  </div>
                                ))}
                                {vinculos[a.id].length === 0 && <p style={{ fontSize: 13, color: 'var(--cinza)', margin: 0 }}>Nenhuma campanha vinculada ainda.</p>}

                                {/* Adicionar campanha */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 0.7fr auto', gap: 8, alignItems: 'center', marginTop: 4 }}>
                                  <select value={novoVinc.campanha_id} onChange={e => setNovoVinc(n => ({ ...n, campanha_id: e.target.value }))} style={{ ...inputStyle, padding: '9px 12px', fontSize: 13 }}>
                                    <option value="">Adicionar campanha…</option>
                                    {campanhas.filter(cp => !(vinculos[a.id] ?? []).some(v => v.campanha_id === cp.id)).map(cp => <option key={cp.id} value={cp.id}>{cp.nome} — /{cp.codigo}</option>)}
                                  </select>
                                  <select value={novoVinc.comissao_tipo} onChange={e => setNovoVinc(n => ({ ...n, comissao_tipo: e.target.value }))} style={{ ...inputStyle, padding: '9px 12px', fontSize: 13 }}>
                                    <option value="percentual">% da assinatura</option>
                                    <option value="fixo">Valor fixo</option>
                                    <option value="nenhum">Sem comissão</option>
                                  </select>
                                  <input type="number" step="0.01" min="0" value={novoVinc.comissao_valor} onChange={e => setNovoVinc(n => ({ ...n, comissao_valor: e.target.value }))} placeholder={novoVinc.comissao_tipo === 'percentual' ? '20' : '50.00'} disabled={novoVinc.comissao_tipo === 'nenhum'} style={{ ...inputStyle, padding: '9px 12px', fontSize: 13, opacity: novoVinc.comissao_tipo === 'nenhum' ? 0.5 : 1 }} />
                                  <button onClick={() => addVinculo(a.id)} disabled={!novoVinc.campanha_id} style={{ background: novoVinc.campanha_id ? 'var(--vinho)' : 'var(--cinza-light)', color: 'white', border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: novoVinc.campanha_id ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>+ Add</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Drawer de pagamentos */}
                    {pagAberto === a.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: '0 16px 16px', background: 'var(--surface-2)' }}>
                          <div style={{ borderRadius: 10, border: '1px solid var(--cinza-light)', overflow: 'hidden', background: 'white' }}>
                            {!pagamentos[a.id] ? (
                              <p style={{ padding: 16, fontSize: 13, color: 'var(--cinza)', margin: 0 }}>Carregando…</p>
                            ) : pagamentos[a.id].length === 0 ? (
                              <p style={{ padding: 16, fontSize: 13, color: 'var(--cinza)', margin: 0 }}>Nenhum pagamento registrado.</p>
                            ) : (
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                  <tr style={{ background: 'var(--surface-2)' }}>
                                    {['Mês', 'Plano', 'Valor', 'Status', 'Pago em', 'NF', ''].map(h => <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--cinza)' }}>{h}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  {pagamentos[a.id].map(p => {
                                    const chave = `${a.id}-${p.id}`
                                    return (
                                      <tr key={p.id} style={{ borderTop: '1px solid var(--cinza-light)' }}>
                                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.mes_ref}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--cinza)' }}>{p.tipo_gatilho ?? '—'}</td>
                                        <td style={{ padding: '10px 14px' }}>{fmtMoeda(p.valor)}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: p.status === 'pago' ? 'rgba(5,150,105,0.1)' : 'rgba(245,158,11,0.1)', color: p.status === 'pago' ? '#059669' : '#b45309' }}>{p.status === 'pago' ? 'Pago' : 'Pendente'}</span>
                                        </td>
                                        <td style={{ padding: '10px 14px', color: 'var(--cinza)' }}>{p.pago_em ? new Date(p.pago_em).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--cinza)', fontSize: 12 }}>{p.numero_nf ?? '—'}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                          {p.status === 'pendente' && (
                                            <button onClick={() => { setNfModal({ id: p.id, afiliadoId: a.id, mesRef: p.mes_ref, valor: p.valor }); setNfNumero('') }} disabled={marcandoPago === chave}
                                              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', background: '#059669', color: 'white', fontWeight: 700, cursor: marcandoPago === chave ? 'not-allowed' : 'pointer', opacity: marcandoPago === chave ? 0.7 : 1 }}>
                                              {marcandoPago === chave ? '…' : 'Marcar como pago'}
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal NF */}
      {nfModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--preto)' }}>Confirmar pagamento</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--cinza)' }}>{fmtMoeda(nfModal.valor)} · referência {nfModal.mesRef}</p>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>Número da NF <span style={{ fontWeight: 400, color: 'var(--cinza)' }}>(opcional)</span></label>
            <input autoFocus value={nfNumero} onChange={e => setNfNumero(e.target.value)} placeholder="Ex: 1234" style={{ ...inputStyle, marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirmarPagamento} style={{ flex: 1, background: '#059669', color: 'white', border: 'none', borderRadius: 9, padding: 11, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Confirmar</button>
              <button onClick={() => setNfModal(null)} style={{ flex: 1, background: 'none', border: '1px solid var(--cinza-light)', color: 'var(--cinza)', borderRadius: 9, padding: 11, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
