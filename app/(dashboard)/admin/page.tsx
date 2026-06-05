'use client'

import { useEffect, useState } from 'react'

type Usuario = {
  id: string
  email: string
  status: 'trial' | 'active' | 'expired'
  plano: string
  trial_inicio: string
  trial_fim: string
  criado_em: string
  trial_expirado: boolean
  nome?: string
  telefone?: string
  whatsapp?: string
  empresa?: string
}

type Keyword = { id: string; termo: string; ativo: boolean; criado_em: string }
type Alerta  = {
  id: string
  criado_em: string
  canais: string[]
  licitacoes: {
    objeto: string
    orgao: string
    valor_estimado?: number
    data_abertura?: string
    modalidade?: string
  } | null
}
type SubUsuario = { id: string; nome: string | null; email: string }

type ContaDetalhe = {
  keywords: Keyword[]
  alertas: Alerta[]
  subUsuarios: SubUsuario[]
}

const statusConfig = {
  active:  { label: 'Ativo',    cor: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  trial:   { label: 'Trial',    cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)' },
  expired: { label: 'Expirado', cor: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
}

type ResultadoTrigger = { ok: boolean; status: number; data: unknown }

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [disparando, setDisparando] = useState<string | null>(null)
  const [resultadoTrigger, setResultadoTrigger] = useState<ResultadoTrigger | null>(null)

  // Painel de conta
  const [contaAberta, setContaAberta] = useState<Usuario | null>(null)
  const [contaDetalhe, setContaDetalhe] = useState<ContaDetalhe | null>(null)
  const [carregandoConta, setCarregandoConta] = useState(false)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/admin/usuarios')
    if (!res.ok) { setErro('Acesso negado ou erro ao carregar.'); setCarregando(false); return }
    setUsuarios(await res.json())
    setCarregando(false)
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
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    carregar()
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvando(true)
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editando.id,
        nome: editando.nome,
        telefone: editando.telefone,
        whatsapp: editando.whatsapp,
        empresa: editando.empresa,
        plano: editando.plano,
        status: editando.status,
      }),
    })
    setSalvando(false)
    setEditando(null)
    carregar()
  }

  async function dispararAcao(acao: string) {
    setDisparando(acao)
    setResultadoTrigger(null)
    const res = await fetch('/api/admin/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao }),
    })
    const data = await res.json()
    setResultadoTrigger({ ok: res.ok, status: res.status, data })
    setDisparando(null)
  }

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
  const fmtHora = (d: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'
  const dias = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  const moeda = (v?: number) => v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Painel Administrativo</h1>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>Gerencie usuários e assinaturas</p>
        </div>
        <div className="flex gap-3 text-sm">
          {[
            { label: `${usuarios.filter(u => u.status === 'active').length} ativos`, cor: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: `${usuarios.filter(u => u.status === 'trial').length} em trial`, cor: '#C9A65A', bg: 'rgba(201,166,90,0.1)' },
            { label: `${usuarios.filter(u => u.status === 'expired' || u.trial_expirado).length} expirados`, cor: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map(b => (
            <span key={b.label} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: b.bg, color: b.cor }}>{b.label}</span>
          ))}
        </div>
      </div>

      {erro && <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{erro}</div>}

      {/* Painel de controle */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>Acionar manualmente</h2>
        <div className="flex gap-3 flex-wrap">
          {[
            { acao: 'coletar',  label: '🔍 Coletar licitações', desc: 'Busca novos editais em todas as fontes' },
            { acao: 'matching', label: '🤖 Processar matches',  desc: 'Analisa candidatos e gera alertas' },
            { acao: 'alertar',  label: '📧 Enviar alertas',     desc: 'Dispara e-mails e Telegram' },
            { acao: 'emails',   label: '📩 E-mails de trial',   desc: 'Envia sequência de trial' },
          ].map(({ acao, label, desc }) => (
            <button key={acao} onClick={() => dispararAcao(acao)} disabled={disparando !== null}
              className="flex-1 min-w-[160px] px-4 py-3 rounded-xl text-left transition-all"
              style={{ background: disparando === acao ? 'rgba(107,15,26,0.08)' : 'var(--surface-2)', border: '1px solid var(--cinza-light)', cursor: disparando ? 'not-allowed' : 'pointer', opacity: disparando && disparando !== acao ? 0.5 : 1 }}>
              <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--preto)' }}>
                {disparando === acao ? '⏳ Executando...' : label}
              </div>
              <div className="text-xs" style={{ color: 'var(--cinza)' }}>{desc}</div>
            </button>
          ))}
        </div>

        {resultadoTrigger && (
          <div className="mt-4 rounded-xl p-4" style={{
            background: resultadoTrigger.ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${resultadoTrigger.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: resultadoTrigger.ok ? '#10b981' : '#ef4444' }}>
              {resultadoTrigger.ok ? '✓ Executado com sucesso' : '⚠ Erro na execução'} — status {resultadoTrigger.status}
            </div>
            <pre className="text-xs overflow-auto" style={{ color: 'var(--cinza)', maxHeight: '120px' }}>
              {JSON.stringify(resultadoTrigger.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {carregando ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '72px' }} />)}</div>
      ) : usuarios.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p style={{ color: 'var(--cinza)' }}>Nenhum usuário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                {['Usuário', 'Plano / Status', 'Trial até', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const expirado = u.trial_expirado && u.status === 'trial'
                const cfg = statusConfig[expirado ? 'expired' : u.status]
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--cinza-light)' }}>
                    <td className="px-5 py-4">
                      <div className="font-medium" style={{ color: 'var(--preto)' }}>{u.nome || '—'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--cinza)' }}>{u.email}</div>
                      {u.empresa && <div className="text-xs" style={{ color: 'var(--cinza)' }}>{u.empresa}</div>}
                      {u.telefone && <div className="text-xs" style={{ color: 'var(--cinza)' }}>{u.telefone}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--cinza)' }}>{u.plano || 'basic'}</div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.cor }}>
                        {expirado ? 'Trial expirado' : cfg.label}
                        {u.status === 'trial' && !expirado && ` (${dias(u.trial_fim)}d)`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--cinza)' }}>{fmt(u.trial_fim)}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--cinza)' }}>{fmt(u.criado_em)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => abrirConta(u)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
                          Ver conta
                        </button>
                        <button onClick={() => setEditando({ ...u })}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>
                          Editar
                        </button>
                        {u.status !== 'active' && (
                          <button onClick={() => alterarStatus(u.id, 'active')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                            Ativar
                          </button>
                        )}
                        {u.status !== 'expired' && (
                          <button onClick={() => alterarStatus(u.id, 'expired')}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            Expirar
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

      {/* Modal de edição */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--preto)' }}>Editar usuário</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--cinza)' }}>{editando.email}</p>

            <div className="space-y-4">
              {[
                { label: 'Nome', key: 'nome', placeholder: 'Nome completo' },
                { label: 'Empresa', key: 'empresa', placeholder: 'Nome da empresa' },
                { label: 'Telefone', key: 'telefone', placeholder: '(31) 99999-9999' },
                { label: 'WhatsApp', key: 'whatsapp', placeholder: '(31) 99999-9999' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>{label}</label>
                  <input
                    value={(editando as unknown as Record<string, string>)[key] ?? ''}
                    onChange={e => setEditando({ ...editando, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)' }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Plano</label>
                <select
                  value={editando.plano ?? 'basic'}
                  onChange={e => setEditando({ ...editando, plano: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
                >
                  {['basic', 'profissional', 'pro', 'empresarial'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Status</label>
                <select
                  value={editando.status}
                  onChange={e => setEditando({ ...editando, status: e.target.value as 'trial' | 'active' | 'expired' })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Ativo</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditando(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1.5px solid var(--cinza-light)', color: 'var(--cinza)' }}>
                Cancelar
              </button>
              <button onClick={salvarEdicao} disabled={salvando}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: salvando ? '#9AA0A6' : 'var(--vinho)', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Painel lateral — Ver conta */}
      {contaAberta && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setContaAberta(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '95vw',
            background: 'white', zIndex: 50, overflowY: 'auto',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--cinza-light)', flexShrink: 0 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--preto)' }}>
                    {contaAberta.nome || 'Sem nome'}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--cinza)' }}>{contaAberta.email}</p>
                  {contaAberta.empresa && <p className="text-xs mt-0.5" style={{ color: 'var(--cinza)' }}>{contaAberta.empresa}</p>}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>
                      {contaAberta.plano || 'basic'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: statusConfig[contaAberta.trial_expirado ? 'expired' : contaAberta.status].bg, color: statusConfig[contaAberta.trial_expirado ? 'expired' : contaAberta.status].cor }}>
                      {contaAberta.trial_expirado ? 'Trial expirado' : statusConfig[contaAberta.status].label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setContaAberta(null)}
                  style={{ flexShrink: 0, padding: '8px', borderRadius: '8px', background: 'var(--surface-2)', color: 'var(--cinza)', fontWeight: 600, fontSize: '18px', lineHeight: 1, border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              {/* Contatos */}
              {(contaAberta.telefone || contaAberta.whatsapp) && (
                <div className="flex gap-3 mt-4">
                  {contaAberta.telefone && (
                    <a href={`tel:${contaAberta.telefone}`} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: 'var(--surface-2)', color: 'var(--cinza)', textDecoration: 'none' }}>
                      📞 {contaAberta.telefone}
                    </a>
                  )}
                  {contaAberta.whatsapp && (
                    <a href={`https://wa.me/55${contaAberta.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: 'rgba(37,211,102,0.1)', color: '#16a34a', textDecoration: 'none' }}>
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '24px', flex: 1 }}>
              {carregandoConta ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="rounded-xl animate-pulse" style={{ background: 'var(--surface-2)', height: '60px' }} />)}
                </div>
              ) : contaDetalhe ? (
                <div className="space-y-8">

                  {/* Palavras-chave */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>
                      Palavras-chave monitoradas ({contaDetalhe.keywords.length})
                    </h3>
                    {contaDetalhe.keywords.length === 0 ? (
                      <p className="text-sm" style={{ color: 'var(--cinza)' }}>Nenhuma palavra-chave cadastrada.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {contaDetalhe.keywords.map(kw => (
                          <span key={kw.id}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{
                              background: kw.ativo ? 'rgba(107,15,26,0.08)' : 'var(--surface-2)',
                              color: kw.ativo ? 'var(--vinho)' : 'var(--cinza)',
                              border: '1px solid',
                              borderColor: kw.ativo ? 'rgba(107,15,26,0.15)' : 'var(--cinza-light)',
                            }}>
                            {kw.ativo ? '' : '⏸ '}{kw.termo}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Sub-usuários */}
                  {contaDetalhe.subUsuarios.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>
                        Membros da equipe ({contaDetalhe.subUsuarios.length})
                      </h3>
                      <div className="space-y-2">
                        {contaDetalhe.subUsuarios.map(s => (
                          <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'var(--vinho)' }}>
                              {(s.nome || s.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: 'var(--preto)' }}>{s.nome || '—'}</div>
                              <div className="text-xs" style={{ color: 'var(--cinza)' }}>{s.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Alertas recentes */}
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>
                      Alertas recentes ({contaDetalhe.alertas.length})
                    </h3>
                    {contaDetalhe.alertas.length === 0 ? (
                      <p className="text-sm" style={{ color: 'var(--cinza)' }}>Nenhum alerta gerado ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {contaDetalhe.alertas.map(a => {
                          const lic = a.licitacoes
                          return (
                            <div key={a.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
                              <p className="text-sm font-medium leading-snug mb-1" style={{ color: 'var(--preto)' }}>
                                {lic?.objeto ?? '(sem título)'}
                              </p>
                              <div className="flex gap-3 flex-wrap mt-1">
                                {lic?.orgao && <span className="text-xs" style={{ color: 'var(--cinza)' }}>🏛 {lic.orgao}</span>}
                                {lic?.modalidade && <span className="text-xs" style={{ color: 'var(--cinza)' }}>📋 {lic.modalidade}</span>}
                                {lic?.valor_estimado && <span className="text-xs" style={{ color: 'var(--cinza)' }}>💰 {moeda(lic.valor_estimado)}</span>}
                                {lic?.data_abertura && <span className="text-xs" style={{ color: 'var(--cinza)' }}>📅 {fmt(lic.data_abertura)}</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>Enviado em {fmtHora(a.criado_em)}</span>
                                {a.canais?.length > 0 && (
                                  <span className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>· {a.canais.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>

                </div>
              ) : (
                <p className="text-sm" style={{ color: '#ef4444' }}>Erro ao carregar dados da conta.</p>
              )}
            </div>

            {/* Rodapé com ação rápida */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cinza-light)', flexShrink: 0 }}>
              <button
                onClick={() => { setContaAberta(null); setEditando({ ...contaAberta }) }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--vinho)', cursor: 'pointer', border: 'none' }}>
                Editar dados desta conta
              </button>
            </div>
          </div>
        </>
      )}

      <p className="text-xs mt-4 text-center" style={{ color: 'var(--cinza)' }}>
        Acesso restrito ao administrador.
      </p>
    </div>
  )
}
