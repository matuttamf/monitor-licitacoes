'use client'

import { useEffect, useState, useCallback } from 'react'

const REGIOES_UF = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]
const REGIOES_MACRO = ['Norte','Nordeste','Centro-Oeste','Sudeste','Sul','Nacional']
const REGIOES = [...REGIOES_MACRO, ...REGIOES_UF]

type Fornecedor = {
  id: string
  razao_social: string | null
  cnpj: string | null
  descricao: string
  regioes: string[]
  email_contato: string | null
  telefone_contato: string | null
  website: string | null
}

const FORM_VAZIO = {
  razao_social: '', cnpj: '', descricao: '',
  email_contato: '', telefone_contato: '', website: '',
  regioes: [] as string[],
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [busca, setBusca]       = useState('')
  const [regiao, setRegiao]     = useState('')
  const [carregando, setCarregando] = useState(true)
  const [bloqueado, setBloqueado]   = useState(false)

  // cadastro
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(FORM_VAZIO)
  const [enviando, setEnviando]   = useState(false)
  const [msg, setMsg]             = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [jaCadastrado, setJaCadastrado] = useState(false)
  const [buscandoKws, setBuscandoKws]   = useState(false)
  const [carregandoForm, setCarregandoForm] = useState(false)

  const carregar = useCallback(async (p: number, q: string, r: string) => {
    setCarregando(true)
    const params = new URLSearchParams({ page: String(p) })
    if (q) params.set('q', q)
    if (r) params.set('regiao', r)
    const res = await fetch(`/api/fornecedores?${params}`)
    if (res.status === 403) { setBloqueado(true); setCarregando(false); return }
    const data = await res.json()
    setFornecedores(data.fornecedores ?? [])
    setTotal(data.total ?? 0)
    setJaCadastrado(data.jaCadastrado ?? false)
    setCarregando(false)
  }, [])

  useEffect(() => { carregar(1, '', '') }, [carregar])

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    carregar(1, busca, regiao)
  }

  function mudarRegiao(r: string) {
    setRegiao(r)
    setPage(1)
    carregar(1, busca, r)
  }

  function toggleRegiao(r: string) {
    setForm(f => ({
      ...f,
      regioes: f.regioes.includes(r) ? f.regioes.filter(x => x !== r) : [...f.regioes, r],
    }))
  }

  async function abrirForm() {
    setShowForm(true)
    setMsg(null)
    setCarregandoForm(true)
    const res = await fetch('/api/fornecedor')
    if (res.ok) {
      const d = await res.json()
      if (d) setForm({
        razao_social:     d.razao_social     ?? '',
        cnpj:             d.cnpj             ?? '',
        descricao:        d.descricao        ?? '',
        email_contato:    d.email_contato    ?? '',
        telefone_contato: d.telefone_contato ?? '',
        website:          d.website          ?? '',
        regioes:          d.regioes          ?? [],
      })
    }
    setCarregandoForm(false)
  }

  async function buscarPalavrasChave() {
    setBuscandoKws(true)
    const res = await fetch('/api/keywords')
    if (res.ok) {
      const kws: { termo: string }[] = await res.json()
      if (kws.length > 0) {
        const termos = kws.map(k => k.termo).join(', ')
        setForm(f => ({ ...f, descricao: f.descricao ? `${f.descricao}, ${termos}` : termos }))
      }
    }
    setBuscandoKws(false)
  }

  async function enviarCadastro(e: React.FormEvent) {
    e.preventDefault()
    if (!form.razao_social.trim()) { setMsg({ tipo: 'erro', texto: 'Informe a razão social.' }); return }
    if (!form.cnpj.trim()) { setMsg({ tipo: 'erro', texto: 'Informe o CNPJ.' }); return }
    if (!form.email_contato.trim()) { setMsg({ tipo: 'erro', texto: 'Informe o e-mail de contato.' }); return }
    if (!form.telefone_contato.trim()) { setMsg({ tipo: 'erro', texto: 'Informe o telefone.' }); return }
    if (!form.descricao.trim()) { setMsg({ tipo: 'erro', texto: 'Descreva o que sua empresa fornece.' }); return }
    if (form.regioes.length === 0) { setMsg({ tipo: 'erro', texto: 'Selecione ao menos uma região de atuação.' }); return }
    setEnviando(true); setMsg(null)
    const res = await fetch('/api/fornecedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg({ tipo: 'ok', texto: jaCadastrado ? '✓ Cadastro atualizado com sucesso!' : 'Cadastro enviado! Sua empresa aparecerá no diretório após revisão.' })
      setJaCadastrado(true)
      if (!jaCadastrado) setTimeout(() => setShowForm(false), 3000)
    } else {
      setMsg({ tipo: 'erro', texto: data.error ?? 'Erro ao enviar.' })
    }
    setEnviando(false)
  }

  const totalPaginas = Math.ceil(total / 20)

  if (bloqueado) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, background: 'var(--vinho)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 24px',
        }}>🤝</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--preto)', marginBottom: 12 }}>
          Encontre parceiros antes que o edital abra
        </h2>
        <p style={{ fontSize: 14, color: 'var(--cinza)', lineHeight: 1.75, marginBottom: 8 }}>
          O Diretório reúne empresas que participam de licitações e estão abertas a parcerias — fornecedores, distribuidores, prestadores de serviço e consórcios.
        </p>
        <p style={{ fontSize: 14, color: 'var(--cinza)', lineHeight: 1.75, marginBottom: 28 }}>
          Quem tem parceiros certos ganha licitações que sozinho não ganharia. Apareça para quem está procurando exatamente o que você oferece.
        </p>
        <a href="/assinar?from=painel" style={{
          display: 'inline-block', background: 'var(--vinho)', color: 'white',
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
          padding: '13px 32px', borderRadius: 12,
        }}>
          Ativar Diretório de Parceiros →
        </a>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--cinza)' }}>Disponível nos planos Profissional, Gestão e Empresarial.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--preto)' }}>🤝 Diretório de Parceiros</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
              style={{ background: 'rgba(201,166,90,0.12)', color: '#92610a', border: '1px solid rgba(201,166,90,0.35)' }}>
              Novidade
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>
            Empresas abertas a parcerias, consórcios e negociações. <strong style={{ color: 'var(--preto)' }}>Quem tem os parceiros certos ganha licitações que sozinho não ganharia.</strong>
          </p>
        </div>
        {showForm && (
          <button
            onClick={() => { setShowForm(false); setMsg(null); setForm(FORM_VAZIO) }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            style={{ background: 'var(--cinza-light)', color: 'var(--cinza)', border: 'none', cursor: 'pointer' }}>
            ✕ Fechar
          </button>
        )}
      </div>

      {/* Banner CTA */}
      {!showForm && !jaCadastrado && (
        <div className="rounded-2xl p-5 flex items-start gap-5 flex-wrap"
          style={{ background: 'rgba(107,15,26,0.04)', border: '1.5px dashed rgba(107,15,26,0.2)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--vinho)' }}>
              🏭 Sua empresa aparece para quem está montando proposta agora
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--cinza)' }}>
              Outros usuários da plataforma buscam parceiros, fornecedores e prestadores de serviço para fechar consórcios e complementar propostas. Cadastrar é grátis e o contato vem direto.
            </p>
          </div>
          <button
            onClick={abrirForm}
            className="px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}>
            + Cadastrar minha empresa
          </button>
        </div>
      )}

      {/* Formulário de cadastro */}
      {showForm && (
        <form onSubmit={enviarCadastro} className="rounded-2xl p-6 space-y-4"
          style={{ background: 'white', border: '1.5px solid var(--cinza-light)' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-base font-bold" style={{ color: 'var(--preto)' }}>
              {jaCadastrado ? 'Editar cadastro no diretório' : 'Cadastrar minha empresa no diretório'}
            </h2>
            <a href="/perfil" className="text-xs font-semibold no-underline"
              style={{ color: 'var(--vinho)', opacity: 0.8 }}>
              Também editável em Perfil →
            </a>
          </div>
          {carregandoForm ? (
            <p className="text-xs" style={{ color: 'var(--cinza)' }}>Carregando dados…</p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--cinza)' }}>
              {jaCadastrado ? 'Atualize as informações da sua empresa no diretório.' : 'Após envio, seu cadastro será revisado e publicado em até 48h.'}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { field: 'razao_social',     label: 'Razão social',        placeholder: 'Nome da empresa',         required: true  },
              { field: 'cnpj',             label: 'CNPJ',                placeholder: '00.000.000/0000-00',      required: true  },
              { field: 'email_contato',    label: 'E-mail de contato',   placeholder: 'contato@empresa.com.br', required: true  },
              { field: 'telefone_contato', label: 'Telefone',            placeholder: '(11) 99999-9999',        required: true  },
              { field: 'website',          label: 'Site',                placeholder: 'www.empresa.com.br',     required: false },
            ] as const).map(({ field, label, placeholder, required }) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--cinza)' }}>
                  {label}{required && <span style={{ color: 'var(--vinho)' }}> *</span>}
                </label>
                <input
                  type={field === 'email_contato' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  required={required}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ border: '1.5px solid var(--cinza-light)', background: 'var(--fundo)', color: 'var(--preto)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--cinza)' }}>
                  O que sua empresa fornece? <span style={{ color: 'var(--vinho)' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={buscarPalavrasChave}
                  disabled={buscandoKws}
                  className="text-xs font-semibold px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(107,15,26,0.07)',
                    color: 'var(--vinho)',
                    border: '1px solid rgba(107,15,26,0.18)',
                    cursor: buscandoKws ? 'not-allowed' : 'pointer',
                    opacity: buscandoKws ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                  }}>
                  {buscandoKws ? '⏳ Buscando…' : '🔑 Usar minhas palavras-chave'}
                </button>
              </div>
              <textarea
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Fabricamos janelas de alumínio, vendemos cadeiras e mesas para escritório, prestamos serviços de limpeza..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                style={{ border: '1.5px solid var(--cinza-light)', background: 'var(--fundo)', color: 'var(--preto)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cinza)' }}>
              Regiões de atuação <span style={{ color: 'var(--vinho)' }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIOES.map(r => {
                const sel = form.regioes.includes(r)
                return (
                  <button
                    key={r} type="button" onClick={() => toggleRegiao(r)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: sel ? 'var(--vinho)' : 'var(--cinza-light)',
                      color: sel ? 'white' : 'var(--cinza)',
                      border: 'none', cursor: 'pointer',
                    }}>
                    {r}
                  </button>
                )
              })}
            </div>
          </div>

          {msg && (
            <div className="px-4 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: msg.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                color: msg.tipo === 'ok' ? '#065f46' : '#991b1b',
                border: `1px solid ${msg.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
              {msg.texto}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={enviando}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: enviando ? 'var(--cinza-light)' : 'var(--vinho)', color: enviando ? 'var(--cinza)' : 'white', border: 'none', cursor: enviando ? 'not-allowed' : 'pointer' }}>
              {enviando ? '⏳ Enviando…' : 'Enviar cadastro'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setMsg(null) }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--cinza-light)', color: 'var(--cinza)', border: 'none', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros de busca */}
      {!showForm && <form onSubmit={buscar} className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, CNPJ ou segmento…"
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl text-sm"
          style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }}
        />
        <select
          value={regiao}
          onChange={e => mudarRegiao(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm"
          style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }}>
          <option value="">Todas as regiões</option>
          <optgroup label="Macrorregião">
            {REGIOES_MACRO.map(r => <option key={r} value={r}>{r}</option>)}
          </optgroup>
          <optgroup label="Estado (UF)">
            {REGIOES_UF.map(r => <option key={r} value={r}>{r}</option>)}
          </optgroup>
        </select>
        <button type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--vinho)', border: 'none', cursor: 'pointer' }}>
          Buscar
        </button>
        {(busca || regiao) && (
          <button type="button"
            onClick={() => { setBusca(''); setRegiao(''); setPage(1); carregar(1, '', '') }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--cinza-light)', color: 'var(--cinza)', border: 'none', cursor: 'pointer' }}>
            Limpar
          </button>
        )}
      </form>}

      {/* Contador */}
      {!carregando && total > 0 && (
        <p className="text-xs" style={{ color: 'var(--cinza)' }}>
          {`${total} fornecedor${total !== 1 ? 'es' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 rounded-2xl animate-pulse"
              style={{ background: 'white', border: '1px solid var(--cinza-light)' }} />
          ))}
        </div>
      ) : fornecedores.length === 0 && (busca || regiao) ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-sm mb-4" style={{ color: 'var(--cinza)' }}>Nenhum fornecedor encontrado com esses filtros.</p>
          <button onClick={() => { setBusca(''); setRegiao(''); setPage(1); carregar(1, '', '') }}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--cinza-light)', color: 'var(--cinza)', border: 'none', cursor: 'pointer' }}>
            Limpar filtros
          </button>
        </div>
      ) : fornecedores.length > 0 ? (
        <div className="space-y-4">
          {fornecedores.map(f => (
            <div key={f.id} className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-base mb-0.5" style={{ color: 'var(--preto)' }}>
                    {f.razao_social ?? 'Empresa'}
                  </div>
                  {f.cnpj && (
                    <div className="text-xs mb-2" style={{ color: 'var(--cinza)' }}>CNPJ: {f.cnpj}</div>
                  )}
                  {f.descricao && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cinza)' }}>{f.descricao}</p>
                  )}
                </div>
                {f.regioes.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap shrink-0">
                    {f.regioes.map(r => (
                      <span key={r} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(107,15,26,0.07)', color: 'var(--vinho)' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {(f.email_contato || f.telefone_contato || f.website) && (
                <div className="flex gap-4 mt-4 flex-wrap"
                  style={{ borderTop: '1px solid var(--cinza-light)', paddingTop: '12px' }}>
                  {f.email_contato && (
                    <a href={`mailto:${f.email_contato}`} className="text-xs font-medium no-underline"
                      style={{ color: 'var(--vinho)' }}>
                      ✉ {f.email_contato}
                    </a>
                  )}
                  {f.telefone_contato && (
                    <a href={`tel:${f.telefone_contato}`} className="text-xs font-medium no-underline"
                      style={{ color: 'var(--vinho)' }}>
                      📞 {f.telefone_contato}
                    </a>
                  )}
                  {f.website && (
                    <a href={f.website.startsWith('http') ? f.website : `https://${f.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium no-underline"
                      style={{ color: 'var(--vinho)' }}>
                      🌐 {f.website}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => { const p = page - 1; setPage(p); carregar(p, busca, regiao) }}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'white', border: '1px solid var(--cinza-light)', color: page === 1 ? 'var(--cinza)' : 'var(--preto)', cursor: page === 1 ? 'default' : 'pointer' }}>
            ← Anterior
          </button>
          <span className="text-sm px-3" style={{ color: 'var(--cinza)' }}>{page} / {totalPaginas}</span>
          <button
            onClick={() => { const p = page + 1; setPage(p); carregar(p, busca, regiao) }}
            disabled={page === totalPaginas}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'white', border: '1px solid var(--cinza-light)', color: page === totalPaginas ? 'var(--cinza)' : 'var(--preto)', cursor: page === totalPaginas ? 'default' : 'pointer' }}>
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
