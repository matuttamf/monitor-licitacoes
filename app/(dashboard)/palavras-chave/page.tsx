'use client'

import { useEffect, useState } from 'react'
import { removerRegiao } from '@/lib/regioes'
import { getLimites } from '@/lib/planos'
import { RegiaoSelector, RegiaoChips } from '@/components/RegiaoSelector'

type Keyword = {
  id: string
  termo: string
  ativo: boolean
  regiao: string[]
  criado_em: string
}

export default function PalavrasChavePage() {
  const [keywords, setKeywords]         = useState<Keyword[]>([])
  const [maxKeywords, setMaxKeywords]   = useState<number>(99999)
  const [plano, setPlano]               = useState<string>('basic')
  const [statusConta, setStatusConta]   = useState<string>('trial')
  const [novoTermo, setNovoTermo]       = useState('')
  const [novasRegioes, setNovasRegioes] = useState<string[]>([])   // [] = brasil implícito
  const [carregando, setCarregando]     = useState(true)
  const [erro, setErro]                 = useState('')
  const [salvando, setSalvando]         = useState<string | null>(null)
  const [editando, setEditando]         = useState<string | null>(null)  // id da kw em edição
  const [termoEdit, setTermoEdit]       = useState('')
  const [regiaoEdit, setRegiaoEdit]     = useState<string[]>([])
  const [erroEdit, setErroEdit]         = useState('')

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/keywords')
    if (res.ok) {
      const data = await res.json()
      setMaxKeywords(data.maxKeywords ?? 99999)
      setPlano(data.plano ?? 'basic')
      setStatusConta(data.status ?? 'trial')
      setKeywords((data.keywords ?? []).map((k: Keyword & { regiao: string | string[] | null }) => {
        let regioes: string[]
        if (Array.isArray(k.regiao)) {
          regioes = (k.regiao as (string | null)[]).filter((r): r is string => typeof r === 'string' && r.length > 0)
        } else {
          regioes = [typeof k.regiao === 'string' ? k.regiao : 'brasil']
        }
        if (regioes.length === 0) regioes = ['brasil']
        return { ...k, regiao: regioes }
      }))
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    // [] significa brasil implícito — manda ['brasil'] para o backend
    const regiao = novasRegioes.length === 0 ? ['brasil'] : novasRegioes
    const res = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo: novoTermo, regiao }),
    })
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao adicionar')
      return
    }
    setNovoTermo('')
    setNovasRegioes([])
    carregar()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: !ativo }),
    })
    carregar()
  }

  function abrirEdicao(kw: Keyword) {
    setEditando(kw.id)
    setTermoEdit(kw.termo)
    setRegiaoEdit(kw.regiao)
    setErroEdit('')
  }

  async function salvarEdicao(id: string) {
    setErroEdit('')
    if (!termoEdit.trim()) { setErroEdit('Termo não pode ser vazio'); return }
    setSalvando(id)
    const payload = regiaoEdit.length === 0 ? ['brasil'] : regiaoEdit
    const res = await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, termo: termoEdit.trim(), regiao: payload }),
    })
    setSalvando(null)
    if (!res.ok) {
      const d = await res.json()
      setErroEdit(d.error ?? 'Erro ao salvar')
      return
    }
    setEditando(null)
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover esta palavra-chave?')) return
    await fetch('/api/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregar()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Palavras-chave</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>
          Configure os termos que deseja monitorar e as regiões de interesse de cada um.
        </p>
      </div>

      {/* Formulário de adição */}
      <form onSubmit={adicionar} className="rounded-2xl p-5 mb-5"
        style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--cinza)' }}>
          Nova palavra-chave
        </h2>

        <div className="flex flex-col gap-3">
          {/* Termo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Termo</label>
            <input
              value={novoTermo}
              onChange={e => setNovoTermo(e.target.value)}
              placeholder="Ex: notebook, retroescavadeira, uniforme…"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', outline: 'none', color: 'var(--preto)', background: 'white' }}
              onFocus={e => { e.target.style.borderColor = 'var(--vinho)' }}
              onBlur={e =>  { e.target.style.borderColor = 'var(--cinza-light)' }}
            />
          </div>

          {/* Regiões */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Regiões de interesse</label>
            <RegiaoSelector value={novasRegioes} onChange={setNovasRegioes} />
            {novasRegioes.length > 0 && !novasRegioes.includes('brasil') && (
              <RegiaoChips
                regioes={novasRegioes}
                onRemove={r => setNovasRegioes(removerRegiao(r, novasRegioes))}
              />
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold self-start"
            style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            + Adicionar
          </button>
        </div>

        {erro && (
          <div className="mt-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}>
            ⚠ {erro}
          </div>
        )}
      </form>

      {/* Banner upsell — aparece ao atingir o limite */}
      {maxKeywords < 99999 && keywords.length >= maxKeywords && (
        <div className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: '#fdf9f0', border: '1.5px solid #C9A65A' }}>
          <div>
            {statusConta === 'trial' ? (
              <>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#1a1a1a' }}>
                  Você usou todas as {maxKeywords} palavras-chave do período de teste
                </p>
                <p className="text-xs" style={{ color: '#78350f' }}>
                  Assine o plano <strong>Profissional</strong> e monitore palavras-chave ilimitadas.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#1a1a1a' }}>
                  Você atingiu o limite de {maxKeywords} palavras-chave do plano {getLimites(plano).nome}
                </p>
                <p className="text-xs" style={{ color: '#78350f' }}>
                  Faça upgrade para o plano <strong>Profissional</strong> e monitore sem limites.
                </p>
              </>
            )}
          </div>
          <a href="/assinar?from=painel"
            className="text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap"
            style={{ background: '#6B0F1A', color: 'white', textDecoration: 'none' }}>
            {statusConta === 'trial' ? 'Assinar agora →' : 'Ver planos →'}
          </a>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl animate-pulse"
              style={{ background: 'white', border: '1px solid var(--cinza-light)', height: '72px' }} />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p className="text-base font-medium mb-1" style={{ color: 'var(--preto)' }}>Nenhuma palavra-chave ainda</p>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>Adicione termos acima para começar a receber alertas.</p>
        </div>
      ) : (
        <div className="rounded-2xl" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
              {maxKeywords < 99999
                ? <>{keywords.length}<span style={{ color: keywords.length >= maxKeywords ? '#b91c1c' : 'var(--cinza)' }}>/{maxKeywords}</span> palavras-chave</>
                : <>{keywords.length} palavra{keywords.length !== 1 ? 's' : ''}-chave</>
              }
            </span>
            <span className="text-xs" style={{ color: 'var(--cinza)' }}>
              {keywords.filter(k => k.ativo).length} ativa{keywords.filter(k => k.ativo).length !== 1 ? 's' : ''}
            </span>
          </div>

          {keywords.map((kw, idx) => (
            <div key={kw.id} className="px-5 py-4"
              style={{
                borderBottom: idx < keywords.length - 1 ? '1px solid var(--cinza-light)' : undefined,
                opacity: kw.ativo ? 1 : 0.55,
              }}>

              {editando === kw.id ? (
                /* ── Modo edição ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>Palavra-chave</label>
                    <input
                      value={termoEdit}
                      onChange={e => setTermoEdit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && salvarEdicao(kw.id)}
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ border: '1.5px solid var(--vinho)', outline: 'none', color: 'var(--preto)', background: 'white' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cinza)' }}>Regiões</label>
                    <RegiaoSelector value={regiaoEdit} onChange={setRegiaoEdit} />
                    {regiaoEdit.length > 0 && !regiaoEdit.includes('brasil') && (
                      <RegiaoChips regioes={regiaoEdit} onRemove={r => setRegiaoEdit(removerRegiao(r, regiaoEdit))} />
                    )}
                  </div>
                  {erroEdit && (
                    <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {erroEdit}</p>
                  )}
                  <div className="flex gap-2">
                    <button type="button" disabled={salvando === kw.id}
                      onClick={() => salvarEdicao(kw.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                      style={{ background: 'var(--vinho)', border: 'none', cursor: salvando === kw.id ? 'not-allowed' : 'pointer', opacity: salvando === kw.id ? 0.6 : 1 }}>
                      {salvando === kw.id ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button type="button" onClick={() => setEditando(null)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--cinza-light)', color: 'var(--cinza)', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Modo visualização ── */
                <>
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className="text-sm font-semibold flex-1 min-w-0 pt-0.5"
                      style={{ color: 'var(--preto)', textDecoration: kw.ativo ? 'none' : 'line-through' }}>
                      {kw.termo}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => abrirEdicao(kw)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--cinza)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Editar
                      </button>
                      <button onClick={() => toggleAtivo(kw.id, kw.ativo)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--vinho)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {kw.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => remover(kw.id)}
                        className="text-xs font-medium"
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Remover
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--cinza)' }}>📍</span>
                    <RegiaoChips regioes={kw.regiao} onRemove={() => {}} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {maxKeywords < 99999 && keywords.length < maxKeywords && (
        <p className="text-xs text-center mt-4" style={{ color: 'var(--cinza)' }}>
          {statusConta === 'trial' ? 'Período de teste' : `Plano ${getLimites(plano).nome}`}: {keywords.length}/{maxKeywords} palavras-chave utilizadas
        </p>
      )}
    </div>
  )
}
