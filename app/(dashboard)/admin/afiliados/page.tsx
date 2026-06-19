'use client'

import React, { useEffect, useState } from 'react'

type Campanha = {
  id: string
  codigo: string
  cliques: number
  comissao_tipo: string
  comissao_valor: number
  ativo: boolean
}

type Afiliado = {
  id: string
  nome: string
  email: string
  status: 'pendente' | 'ativo' | 'bloqueado'
  criado_em: string
  campanha: Campanha | null
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
}

type CampanhaOpcao = { id: string; nome: string; codigo: string }

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const statusCfg = {
  pendente:  { label: 'Pendente',  cor: '#b45309', bg: 'rgba(245,158,11,0.1)'  },
  ativo:     { label: 'Ativo',     cor: '#059669', bg: 'rgba(5,150,105,0.1)'   },
  bloqueado: { label: 'Bloqueado', cor: '#dc2626', bg: 'rgba(220,38,38,0.1)'   },
}

export default function AdminAfiliados() {
  const [afiliados, setAfiliados]               = useState<Afiliado[]>([])
  const [campanhas, setCampanhas]               = useState<CampanhaOpcao[]>([])
  const [carregando, setCarregando]             = useState(true)
  const [abrirForm, setAbrirForm]               = useState(false)
  const [enviando, setEnviando]                 = useState(false)
  const [feedback, setFeedback]                 = useState('')
  const [form, setForm]                         = useState({ nome: '', email: '', campanha_id: '' })
  const [pagamentosAberto, setPagamentosAberto] = useState<string | null>(null)
  const [pagamentos, setPagamentos]             = useState<Record<string, Pagamento[]>>({})
  const [marcandoPago, setMarcandoPago]         = useState<string | null>(null)

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

  async function criarAfiliado(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setFeedback('')
    const res = await fetch('/api/admin/afiliados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setFeedback(data.error ?? 'Erro ao criar afiliado')
      setEnviando(false)
      return
    }
    setFeedback('Convite enviado com sucesso!')
    setForm({ nome: '', email: '', campanha_id: '' })
    setAbrirForm(false)
    setEnviando(false)
    carregar()
  }

  async function acao(id: string, tipo: string) {
    await fetch('/api/admin/afiliados', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao: tipo }),
    })
    carregar()
  }

  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação remove o afiliado e todos os pagamentos associados.`)) return
    await fetch(`/api/admin/afiliados?id=${id}`, { method: 'DELETE' })
    carregar()
  }

  async function abrirPagamentos(afiliadoId: string) {
    if (pagamentosAberto === afiliadoId) { setPagamentosAberto(null); return }
    setPagamentosAberto(afiliadoId)
    if (pagamentos[afiliadoId]) return
    const res = await fetch(`/api/admin/afiliados/pagamentos?afiliado_id=${afiliadoId}`)
    const data = await res.json()
    setPagamentos(prev => ({ ...prev, [afiliadoId]: data.pagamentos ?? [] }))
  }

  async function marcarComoPago(afiliadoId: string, mesRef: string, valor: number) {
    const chave = `${afiliadoId}-${mesRef}`
    setMarcandoPago(chave)
    await fetch('/api/admin/afiliados/pagamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afiliado_id: afiliadoId, mes_ref: mesRef, valor }),
    })
    const [resPag, resAfil] = await Promise.all([
      fetch(`/api/admin/afiliados/pagamentos?afiliado_id=${afiliadoId}`),
      fetch('/api/admin/afiliados'),
    ])
    const dataPag  = await resPag.json()
    const dataAfil = await resAfil.json()
    setPagamentos(prev => ({ ...prev, [afiliadoId]: dataPag.pagamentos ?? [] }))
    setAfiliados(dataAfil.afiliados ?? [])
    setMarcandoPago(null)
  }

  const totalComissao = afiliados
    .filter(a => a.status === 'ativo')
    .reduce((s, a) => s + a.comissao_pendente, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--preto)', margin: 0 }}>Afiliados</h1>
          <p style={{ fontSize: 13, color: 'var(--cinza)', margin: '4px 0 0' }}>
            Parceiros ativos: {afiliados.filter(a => a.status === 'ativo').length} · Comissão pendente: {fmtMoeda(totalComissao)}
          </p>
        </div>
        <button
          onClick={() => setAbrirForm(v => !v)}
          style={{ background: 'var(--vinho)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          + Convidar afiliado
        </button>
      </div>

      {abrirForm && (
        <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--preto)' }}>Novo afiliado</h3>
          <form onSubmit={criarAfiliado} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>Nome</label>
              <input
                value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                required placeholder="Nome do parceiro"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--cinza-light)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>E-mail</label>
              <input
                type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required placeholder="email@parceiro.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--cinza-light)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', display: 'block', marginBottom: 6 }}>Campanha vinculada</label>
              <select
                value={form.campanha_id} onChange={e => setForm(f => ({ ...f, campanha_id: e.target.value }))}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--cinza-light)', fontSize: 14, boxSizing: 'border-box', background: 'white' }}
              >
                <option value="">Selecione uma campanha</option>
                {campanhas.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} — /{c.codigo}</option>
                ))}
              </select>
            </div>

            {feedback && (
              <p style={{ gridColumn: '1 / -1', fontSize: 13, color: feedback.includes('sucesso') ? '#059669' : '#dc2626', margin: 0 }}>
                {feedback}
              </p>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button type="submit" disabled={enviando} style={{
                background: 'var(--vinho)', color: 'white', border: 'none', borderRadius: 9,
                padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1,
              }}>
                {enviando ? 'Enviando…' : 'Enviar convite'}
              </button>
              <button type="button" onClick={() => setAbrirForm(false)} style={{
                background: 'none', border: '1px solid var(--cinza-light)', color: 'var(--cinza)',
                borderRadius: 9, padding: '10px 20px', fontSize: 14, cursor: 'pointer',
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cinza)', fontSize: 14 }}>Carregando…</div>
        ) : afiliados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cinza)', fontSize: 14 }}>Nenhum afiliado cadastrado.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Parceiro', 'Campanha', 'Cliques', 'Conversões', 'Comissão pendente', 'Status', 'Ações'].map(h => (
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
                        {a.campanha ? (
                          <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 6 }}>
                            /{a.campanha.codigo}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--preto)' }}>
                        {a.cliques.toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--preto)' }}>
                        {a.conversoes}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: a.comissao_pendente > 0 ? '#b45309' : 'var(--cinza)' }}>
                        {fmtMoeda(a.comissao_pendente)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cfg.bg, color: cfg.cor }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button onClick={() => abrirPagamentos(a.id)} style={{
                            fontSize: 12, padding: '5px 10px', borderRadius: 7,
                            border: '1px solid rgba(107,15,26,0.3)',
                            background: pagamentosAberto === a.id ? '#6B0F1A' : 'none',
                            color: pagamentosAberto === a.id ? 'white' : '#6B0F1A',
                            fontWeight: 600, cursor: 'pointer',
                          }}>
                            Pagamentos
                          </button>
                          <button onClick={() => acao(a.id, 'reenviar')} style={{
                            fontSize: 12, padding: '5px 10px', borderRadius: 7,
                            border: '1px solid var(--cinza-light)', background: 'none',
                            cursor: 'pointer', color: 'var(--cinza)',
                          }}>
                            Reenviar
                          </button>
                          {a.status !== 'bloqueado' ? (
                            <button onClick={() => acao(a.id, 'bloquear')} style={{
                              fontSize: 12, padding: '5px 10px', borderRadius: 7,
                              border: '1px solid rgba(220,38,38,0.3)', background: 'none',
                              cursor: 'pointer', color: '#dc2626',
                            }}>
                              Bloquear
                            </button>
                          ) : (
                            <button onClick={() => acao(a.id, 'ativar')} style={{
                              fontSize: 12, padding: '5px 10px', borderRadius: 7,
                              border: '1px solid rgba(5,150,105,0.3)', background: 'none',
                              cursor: 'pointer', color: '#059669',
                            }}>
                              Ativar
                            </button>
                          )}
                          <button onClick={() => excluir(a.id, a.nome)} style={{
                            fontSize: 12, padding: '5px 10px', borderRadius: 7,
                            border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)',
                            cursor: 'pointer', color: '#dc2626',
                          }}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                    {pagamentosAberto === a.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: '0 16px 16px', background: 'var(--surface-2)' }}>
                          <div style={{ borderRadius: 10, border: '1px solid var(--cinza-light)', overflow: 'hidden', background: 'white' }}>
                            {!pagamentos[a.id] ? (
                              <p style={{ padding: '16px', fontSize: 13, color: 'var(--cinza)', margin: 0 }}>Carregando…</p>
                            ) : pagamentos[a.id].length === 0 ? (
                              <p style={{ padding: '16px', fontSize: 13, color: 'var(--cinza)', margin: 0 }}>Nenhum pagamento registrado.</p>
                            ) : (
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                  <tr style={{ background: 'var(--surface-2)' }}>
                                    {['Mês', 'Plano', 'Valor', 'Status', 'Pago em', ''].map(h => (
                                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--cinza)' }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {pagamentos[a.id].map(p => {
                                    const chave = `${a.id}-${p.mes_ref}`
                                    return (
                                      <tr key={p.mes_ref} style={{ borderTop: '1px solid var(--cinza-light)' }}>
                                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.mes_ref}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--cinza)' }}>{p.tipo_gatilho ?? '—'}</td>
                                        <td style={{ padding: '10px 14px' }}>{fmtMoeda(p.valor)}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: p.status === 'pago' ? 'rgba(5,150,105,0.1)' : 'rgba(245,158,11,0.1)', color: p.status === 'pago' ? '#059669' : '#b45309' }}>
                                            {p.status === 'pago' ? 'Pago' : 'Pendente'}
                                          </span>
                                        </td>
                                        <td style={{ padding: '10px 14px', color: 'var(--cinza)' }}>
                                          {p.pago_em ? new Date(p.pago_em).toLocaleDateString('pt-BR') : '—'}
                                        </td>
                                        <td style={{ padding: '10px 14px' }}>
                                          {p.status === 'pendente' && (
                                            <button
                                              onClick={() => marcarComoPago(a.id, p.mes_ref, p.valor)}
                                              disabled={marcandoPago === chave}
                                              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', background: '#059669', color: 'white', fontWeight: 700, cursor: marcandoPago === chave ? 'not-allowed' : 'pointer', opacity: marcandoPago === chave ? 0.7 : 1 }}
                                            >
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
        )}
      </div>
    </div>
  )
}
