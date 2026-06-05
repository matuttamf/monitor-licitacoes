'use client'

import { useEffect, useState } from 'react'

type Perfil = {
  nome: string
  email: string
  empresa: string
  telefone: string
  whatsapp: string
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({ nome: '', email: '', empresa: '', telefone: '', whatsapp: '' })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    fetch('/api/perfil')
      .then(r => r.json())
      .then(d => { setPerfil({ nome: d.nome ?? '', email: d.email ?? '', empresa: d.empresa ?? '', telefone: d.telefone ?? '', whatsapp: d.whatsapp ?? '' }) })
      .finally(() => setCarregando(false))
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    const res = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: perfil.nome, empresa: perfil.empresa, telefone: perfil.telefone, whatsapp: perfil.whatsapp }),
    })
    setSalvando(false)
    if (res.ok) setMensagem({ tipo: 'ok', texto: 'Dados salvos com sucesso!' })
    else setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
  }

  const campos = [
    { key: 'nome',      label: 'Nome completo',   placeholder: 'Seu nome',              type: 'text' },
    { key: 'email',     label: 'E-mail',           placeholder: 'seu@email.com',         type: 'email',  readOnly: true },
    { key: 'empresa',   label: 'Empresa',          placeholder: 'Nome da sua empresa',   type: 'text' },
    { key: 'telefone',  label: 'Telefone',         placeholder: '(31) 99999-9999',       type: 'tel' },
    { key: 'whatsapp',  label: 'WhatsApp',         placeholder: '(31) 99999-9999',       type: 'tel' },
  ]

  if (carregando) return (
    <div className="max-w-xl mx-auto space-y-4 mt-8">
      {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'white', border: '1px solid var(--cinza-light)' }} />)}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Meu perfil</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>Mantenha seus dados atualizados para receber alertas corretamente.</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        {/* Avatar */}
        <div className="px-8 py-6 flex items-center gap-4" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: 'var(--vinho)' }}>
            {perfil.nome ? perfil.nome.charAt(0).toUpperCase() : perfil.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-base" style={{ color: 'var(--preto)' }}>{perfil.nome || 'Sem nome'}</div>
            <div className="text-sm" style={{ color: 'var(--cinza)' }}>{perfil.email}</div>
            {perfil.empresa && <div className="text-xs mt-0.5" style={{ color: 'var(--cinza)' }}>{perfil.empresa}</div>}
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={salvar} className="px-8 py-6 space-y-5">
          {campos.map(({ key, label, placeholder, type, readOnly }) => (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
                {label}
                {readOnly && <span className="ml-2 normal-case font-normal" style={{ color: 'var(--cinza)', opacity: 0.6 }}>(não editável)</span>}
              </label>
              <input
                type={type}
                value={(perfil as unknown as Record<string, string>)[key] ?? ''}
                onChange={e => !readOnly && setPerfil(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                readOnly={readOnly}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  border: '1.5px solid var(--cinza-light)',
                  outline: 'none',
                  color: 'var(--preto)',
                  background: readOnly ? 'var(--surface-2)' : 'white',
                  cursor: readOnly ? 'default' : 'text',
                }}
                onFocus={e => { if (!readOnly) { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.08)' }}}
                onBlur={e => { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          ))}

          {mensagem && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{
              background: mensagem.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${mensagem.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: mensagem.tipo === 'ok' ? '#10b981' : '#ef4444',
            }}>
              {mensagem.tipo === 'ok' ? '✓ ' : '⚠ '}{mensagem.texto}
            </div>
          )}

          <button type="submit" disabled={salvando}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: salvando ? '#9AA0A6' : 'var(--vinho)', cursor: salvando ? 'not-allowed' : 'pointer' }}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
