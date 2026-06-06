'use client'

import { useEffect, useState } from 'react'

type Perfil = {
  nome: string
  email: string
  empresa: string
  telefone: string
  whatsapp: string
  telegram_chat_id: string
  min_valor_interesse: number
  max_valor_interesse: number
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({ nome: '', email: '', empresa: '', telefone: '', whatsapp: '', telegram_chat_id: '', min_valor_interesse: 0, max_valor_interesse: 0 })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [telegramMsg, setTelegramMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [salvandoTelegram, setSalvandoTelegram] = useState(false)

  const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'monitorlic_bot'

  useEffect(() => {
    fetch('/api/perfil')
      .then(r => r.json())
      .then(d => {
        setPerfil({
          nome:                d.nome ?? '',
          email:               d.email ?? '',
          empresa:             d.empresa ?? '',
          telefone:            d.telefone ?? '',
          whatsapp:            d.whatsapp ?? '',
          telegram_chat_id:    d.telegram_chat_id ?? '',
          min_valor_interesse: d.min_valor_interesse ?? 0,
          max_valor_interesse: d.max_valor_interesse ?? 0,
        })
      })
      .finally(() => setCarregando(false))
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    const res = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: perfil.nome, empresa: perfil.empresa, telefone: perfil.telefone, whatsapp: perfil.whatsapp, min_valor_interesse: perfil.min_valor_interesse, max_valor_interesse: perfil.max_valor_interesse }),
    })
    setSalvando(false)
    if (res.ok) setMensagem({ tipo: 'ok', texto: 'Dados salvos com sucesso!' })
    else setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
  }

  async function salvarTelegram(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoTelegram(true)
    setTelegramMsg(null)
    const chatId = perfil.telegram_chat_id.trim()
    if (chatId && !/^\d+$/.test(chatId)) {
      setTelegramMsg({ tipo: 'erro', texto: 'ID inválido. Deve conter apenas números.' })
      setSalvandoTelegram(false)
      return
    }
    const res = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_chat_id: chatId || null }),
    })
    setSalvandoTelegram(false)
    if (res.ok) setTelegramMsg({ tipo: 'ok', texto: chatId ? 'Telegram conectado! Você receberá alertas por lá.' : 'Telegram desconectado.' })
    else setTelegramMsg({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
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

  const inputStyle = {
    border: '1.5px solid var(--cinza-light)',
    outline: 'none',
    color: 'var(--preto)',
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Meu perfil</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>Mantenha seus dados atualizados para receber alertas corretamente.</p>
      </div>

      {/* Dados gerais */}
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
                  ...inputStyle,
                  background: readOnly ? 'var(--surface-2)' : 'white',
                  cursor: readOnly ? 'default' : 'text',
                }}
                onFocus={e => { if (!readOnly) { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.08)' }}}
                onBlur={e => { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          ))}

          {/* Faixa de valor de interesse */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Faixa de valor de interesse
            </label>
            <div className="flex gap-3">
              {/* Mínimo */}
              <div className="flex-1">
                <span className="block text-xs mb-1" style={{ color: 'var(--cinza)' }}>Mínimo</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none" style={{ color: 'var(--cinza)' }}>R$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={perfil.min_valor_interesse || ''}
                    onChange={e => setPerfil(prev => ({ ...prev, min_valor_interesse: Number(e.target.value) || 0 }))}
                    placeholder="0 (sem mínimo)"
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm transition-all"
                    style={{ ...inputStyle, background: 'white' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.08)' }}
                    onBlur={e =>  { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              {/* Máximo */}
              <div className="flex-1">
                <span className="block text-xs mb-1" style={{ color: 'var(--cinza)' }}>Máximo</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none" style={{ color: 'var(--cinza)' }}>R$</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={perfil.max_valor_interesse || ''}
                    onChange={e => setPerfil(prev => ({ ...prev, max_valor_interesse: Number(e.target.value) || 0 }))}
                    placeholder="0 (sem limite)"
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm transition-all"
                    style={{ ...inputStyle, background: 'white' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.08)' }}
                    onBlur={e =>  { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--cinza)' }}>
              Licitações fora desta faixa serão ignoradas. Deixe em 0 para não aplicar o filtro correspondente.
            </p>
          </div>

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

      {/* Seção Telegram */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        {/* Cabeçalho */}
        <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
              style={{ background: '#229ED9' }}>
              ✈
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--preto)' }}>Alertas no Telegram</div>
              <div className="text-xs" style={{ color: 'var(--cinza)' }}>Receba as licitações direto no seu Telegram</div>
            </div>
          </div>
          {perfil.telegram_chat_id && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              ● Conectado
            </span>
          )}
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Instruções */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#F0F8FF', border: '1px solid rgba(34,158,217,0.2)' }}>
            <p className="text-sm font-semibold" style={{ color: '#0369a1' }}>Como conectar seu Telegram:</p>
            <ol className="space-y-2">
              {[
                <>Abra o Telegram e procure pelo bot <strong>@{BOT_USERNAME}</strong></>,
                <>Envie o comando <strong>/start</strong> para o bot</>,
                <>O bot responderá com um número — seu <strong>Chat ID</strong></>,
                <>Cole o número no campo abaixo e clique em salvar</>,
              ].map((passo, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#0369a1' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: '#229ED9', minWidth: '20px' }}>{i + 1}</span>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: '#229ED9', color: 'white', textDecoration: 'none' }}
            >
              ✈ Abrir @{BOT_USERNAME} no Telegram
            </a>
          </div>

          {/* Campo Chat ID */}
          <form onSubmit={salvarTelegram} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
                Seu Chat ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={perfil.telegram_chat_id}
                  onChange={e => setPerfil(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                  placeholder="Ex: 123456789"
                  className="flex-1 px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ ...inputStyle, background: 'white' }}
                  onFocus={e => { e.target.style.borderColor = '#229ED9'; e.target.style.boxShadow = '0 0 0 3px rgba(34,158,217,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="submit"
                  disabled={salvandoTelegram}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all flex-shrink-0"
                  style={{ background: salvandoTelegram ? '#9AA0A6' : '#229ED9', cursor: salvandoTelegram ? 'not-allowed' : 'pointer' }}
                >
                  {salvandoTelegram ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
              {perfil.telegram_chat_id && (
                <button
                  type="button"
                  onClick={() => { setPerfil(prev => ({ ...prev, telegram_chat_id: '' })); setTelegramMsg(null) }}
                  className="mt-2 text-xs"
                  style={{ color: 'var(--cinza)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Remover conexão
                </button>
              )}
            </div>

            {telegramMsg && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{
                background: telegramMsg.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${telegramMsg.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: telegramMsg.tipo === 'ok' ? '#10b981' : '#ef4444',
              }}>
                {telegramMsg.tipo === 'ok' ? '✓ ' : '⚠ '}{telegramMsg.texto}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
