'use client'

import { useEffect, useState } from 'react'
import { getLimites, OPCOES_EMAILS_DIA, OPCOES_ITENS_EMAIL, HORARIOS_POR_QTD } from '@/lib/planos'

const REGIOES_OPCOES = [
  'Nacional',
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

type FornecedorPerfil = {
  ativo: boolean
  razao_social: string
  cnpj: string
  descricao: string
  regioes: string[]
  email_contato: string
  telefone_contato: string
  website: string
}

type Perfil = {
  nome: string
  email: string
  empresa: string
  cnpj: string
  telefone: string
  whatsapp: string
  telegram_chat_id: string
  min_valor_interesse: number
  max_valor_interesse: number
  emails_por_dia: number
  itens_por_email: number
  plano: string
  periodo: 'mensal' | 'anual'
  status: string
  trial_fim: string | null
  email_pausado_ate: string | null
  telegram_pausado_ate: string | null
  whatsapp_pausado_ate: string | null
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({ nome: '', email: '', empresa: '', cnpj: '', telefone: '', whatsapp: '', telegram_chat_id: '', min_valor_interesse: 0, max_valor_interesse: 0, emails_por_dia: 5, itens_por_email: 10, plano: 'basic', periodo: 'mensal', status: 'trial', trial_fim: null, email_pausado_ate: null, telegram_pausado_ate: null, whatsapp_pausado_ate: null })
  const [salvandoAlerta, setSalvandoAlerta] = useState(false)
  const [alertaMsg, setAlertaMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [pausandoCanal, setPausandoCanal] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [telegramMsg, setTelegramMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [salvandoTelegram, setSalvandoTelegram] = useState(false)

  const [fornecedor, setFornecedor] = useState<FornecedorPerfil>({
    ativo: false, razao_social: '', cnpj: '', descricao: '',
    regioes: [], email_contato: '', telefone_contato: '', website: '',
  })
  const [salvandoFornecedor, setSalvandoFornecedor] = useState(false)
  const [fornecedorMsg, setFornecedorMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [buscandoKws, setBuscandoKws] = useState(false)

  const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'monitorlic_bot'

  useEffect(() => {
    Promise.all([
      fetch('/api/fornecedor').then(r => r.json()).catch(() => null),
      fetch('/api/perfil').then(r => r.json()).catch(() => null),
    ]).then(([forn, prof]) => {
      const cnpjPerfil = prof?.cnpj ?? ''
      if (forn) setFornecedor({
        ativo:            forn.ativo ?? false,
        razao_social:     forn.razao_social ?? '',
        cnpj:             forn.cnpj || cnpjPerfil,
        descricao:        forn.descricao ?? '',
        regioes:          forn.regioes ?? [],
        email_contato:    forn.email_contato ?? '',
        telefone_contato: forn.telefone_contato ?? '',
        website:          forn.website ?? '',
      })
      else setFornecedor(prev => ({ ...prev, cnpj: cnpjPerfil }))
      if (prof) setPerfil({
        nome:                prof.nome ?? '',
        email:               prof.email ?? '',
        empresa:             prof.empresa ?? '',
        cnpj:                prof.cnpj ?? '',
        telefone:            prof.telefone ?? '',
        whatsapp:            prof.whatsapp ?? '',
        telegram_chat_id:    prof.telegram_chat_id ?? '',
        min_valor_interesse: prof.min_valor_interesse ?? 0,
        max_valor_interesse: prof.max_valor_interesse ?? 0,
        emails_por_dia:      prof.emails_por_dia  ?? 5,
        itens_por_email:     prof.itens_por_email ?? ((['basic','trial'].includes(prof.plano ?? 'trial')) ? 10 : 20),
        plano:               prof.plano ?? 'basic',
        periodo:             prof.periodo === 'anual' ? 'anual' : 'mensal',
        status:              prof.status ?? 'trial',
        trial_fim:           prof.trial_fim ?? null,
        email_pausado_ate:   prof.email_pausado_ate ?? null,
        telegram_pausado_ate: prof.telegram_pausado_ate ?? null,
        whatsapp_pausado_ate: prof.whatsapp_pausado_ate ?? null,
      })
    }).finally(() => setCarregando(false))

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

  async function salvarPreferenciasAlerta(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoAlerta(true)
    setAlertaMsg(null)
    const res = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails_por_dia: perfil.emails_por_dia, itens_por_email: perfil.itens_por_email }),
    })
    setSalvandoAlerta(false)
    if (res.ok) setAlertaMsg({ tipo: 'ok', texto: 'Preferências salvas!' })
    else {
      const d = await res.json().catch(() => ({}))
      setAlertaMsg({ tipo: 'erro', texto: d.error ?? 'Erro ao salvar.' })
    }
  }

  async function buscarPalavrasChave() {
    setBuscandoKws(true)
    const res = await fetch('/api/keywords')
    if (res.ok) {
      const kws: { termo: string }[] = await res.json()
      if (kws.length > 0) {
        const termos = kws.map(k => k.termo).join(', ')
        setFornecedor(prev => ({
          ...prev,
          descricao: prev.descricao ? `${prev.descricao}, ${termos}` : termos,
        }))
      }
    }
    setBuscandoKws(false)
  }

  async function salvarFornecedor(e: React.FormEvent) {
    e.preventDefault()
    const falta = camposFaltando()
    if (falta.length > 0) {
      setFornecedorMsg({ tipo: 'erro', texto: `Preencha os campos obrigatórios: ${falta.join(', ')}.` })
      return
    }
    setSalvandoFornecedor(true)
    setFornecedorMsg(null)
    const res = await fetch('/api/fornecedor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fornecedor),
    })
    setSalvandoFornecedor(false)
    if (res.ok) setFornecedorMsg({ tipo: 'ok', texto: fornecedor.ativo ? 'Perfil publicado no diretório!' : 'Perfil salvo (visibilidade desativada).' })
    else {
      const d = await res.json().catch(() => ({}))
      setFornecedorMsg({ tipo: 'erro', texto: d.error ?? 'Erro ao salvar.' })
    }
  }

  function toggleRegiao(r: string) {
    setFornecedor(prev => ({
      ...prev,
      regioes: prev.regioes.includes(r)
        ? prev.regioes.filter(x => x !== r)
        : [...prev.regioes, r],
    }))
  }

  function camposFaltando(): string[] {
    const falta: string[] = []
    if (!fornecedor.razao_social.trim()) falta.push('Razão Social')
    if (!fornecedor.cnpj.trim())         falta.push('CNPJ')
    if (!fornecedor.descricao.trim())    falta.push('Descrição')
    if (fornecedor.regioes.length === 0) falta.push('ao menos 1 região')
    if (!fornecedor.email_contato.trim()) falta.push('E-mail de contato')
    if (!fornecedor.telefone_contato.trim()) falta.push('Telefone')
    return falta
  }

  function handleToggleAtivo() {
    if (!fornecedor.ativo) {
      const falta = camposFaltando()
      if (falta.length > 0) {
        setFornecedorMsg({ tipo: 'erro', texto: `Preencha antes de publicar: ${falta.join(', ')}.` })
        return
      }
    }
    setFornecedorMsg(null)
    setFornecedor(prev => ({ ...prev, ativo: !prev.ativo }))
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

  const OPCOES_PAUSA = [
    { label: '1 hora',   ms: 1 * 60 * 60 * 1000 },
    { label: '4 horas',  ms: 4 * 60 * 60 * 1000 },
    { label: '8 horas',  ms: 8 * 60 * 60 * 1000 },
    { label: '12 horas', ms: 12 * 60 * 60 * 1000 },
    { label: '24 horas', ms: 24 * 60 * 60 * 1000 },
    { label: '2 dias',   ms: 2 * 24 * 60 * 60 * 1000 },
    { label: '7 dias',   ms: 7 * 24 * 60 * 60 * 1000 },
  ]

  async function pausarCanal(canal: 'email' | 'telegram' | 'whatsapp', ms: number | null) {
    setPausandoCanal(canal)
    const campo = `${canal}_pausado_ate`
    const valor = ms ? new Date(Date.now() + ms).toISOString() : null
    const res = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: valor }),
    })
    if (res.ok) setPerfil(prev => ({ ...prev, [campo]: valor }))
    setPausandoCanal(null)
  }

  function labelPausa(ate: string | null): string {
    if (!ate) return ''
    const fim = new Date(ate)
    if (fim <= new Date()) return ''
    const diff = fim.getTime() - Date.now()
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h >= 24) return `${Math.ceil(diff / 86400000)}d`
    if (h > 0)   return `${h}h${m > 0 ? `${m}m` : ''}`
    return `${m}m`
  }

  function formatTel(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length === 0)  return ''
    if (d.length <= 2)   return `(${d}`
    if (d.length <= 6)   return `(${d.slice(0,2)}) ${d.slice(2)}`
    if (d.length <= 10)  return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }

  const campos = [
    { key: 'nome',      label: 'Nome completo',   placeholder: 'Seu nome',              type: 'text', tel: false },
    { key: 'email',     label: 'E-mail',           placeholder: 'seu@email.com',         type: 'email',  readOnly: true, tel: false },
    { key: 'empresa',   label: 'Empresa',          placeholder: 'Nome da sua empresa',   type: 'text', tel: false },
    { key: 'telefone',  label: 'Telefone',         placeholder: '(31) 3333-3333',        type: 'tel',  tel: true },
    { key: 'whatsapp',  label: 'WhatsApp',         placeholder: '(31) 99999-9999',       type: 'tel',  tel: true },
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

  const diasRestantes = perfil.trial_fim
    ? Math.max(0, Math.ceil((new Date(perfil.trial_fim).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>Meu perfil</h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>Mantenha seus dados atualizados para receber alertas corretamente.</p>
      </div>

      {/* ── Banner trial → assinar ── */}
      {perfil.status === 'trial' && (
        <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #6B0F1A 0%, #9B1B2A 100%)', border: '1px solid rgba(201,166,90,0.3)' }}>
          <div>
            <div className="text-white font-bold text-base mb-0.5">
              {diasRestantes > 0 ? `⏳ Trial: ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}` : '⚠️ Trial expirando hoje'}
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Assine agora e mantenha o monitoramento sem interrupção.
            </div>
          </div>
          <a href="/assinar?from=painel"
            className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold no-underline whitespace-nowrap"
            style={{ background: '#C9A65A', color: '#1A1A1C' }}>
            Ver planos →
          </a>
        </div>
      )}

      {/* ── Card plano ativo → upgrade ── */}
      {perfil.status === 'active' && (
        <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>
              ★
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--preto)' }}>
                Plano {getLimites(perfil.plano).nome}
                {perfil.periodo === 'anual' && (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(201,166,90,0.12)', color: '#92400e' }}>ANUAL</span>
                )}
              </div>
              <div className="text-xs" style={{ color: 'var(--cinza)' }}>Assinatura ativa</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href="/assinar?from=painel"
              className="px-4 py-2 rounded-xl text-xs font-bold no-underline"
              style={{ background: 'var(--surface-2)', color: 'var(--vinho)', border: '1.5px solid var(--cinza-light)' }}>
              Fazer upgrade
            </a>
            <a href="/assinatura/cancelar"
              className="px-4 py-2 rounded-xl text-xs no-underline"
              style={{ background: 'transparent', color: 'var(--cinza)', border: '1px solid var(--cinza-light)' }}>
              Cancelar
            </a>
          </div>
        </div>
      )}

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
          {campos.map(({ key, label, placeholder, type, readOnly, tel }) => (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
                {label}
                {readOnly && <span className="ml-2 normal-case font-normal" style={{ color: 'var(--cinza)', opacity: 0.6 }}>(não editável)</span>}
              </label>
              <input
                type={type}
                value={(perfil as unknown as Record<string, string>)[key] ?? ''}
                onChange={e => {
                  if (readOnly) return
                  const val = tel ? formatTel(e.target.value) : e.target.value
                  setPerfil(prev => ({ ...prev, [key]: val }))
                }}
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

      {/* ── Cadastro como Fornecedor ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--vinho)' }}>🏭</div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--preto)' }}>Aparecer no Diretório de Fornecedores</div>
              <div className="text-xs" style={{ color: 'var(--cinza)' }}>Visível para outros usuários que buscam parceiros e fornecedores</div>
            </div>
          </div>
          {fornecedor.ativo && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              ● Publicado
            </span>
          )}
        </div>

        <form onSubmit={salvarFornecedor} className="px-8 py-6 space-y-5">
          {/* Toggle visibilidade */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--cinza-light)' }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--preto)' }}>
                {fornecedor.ativo ? 'Visível no diretório' : 'Oculto no diretório'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--cinza)' }}>
                {fornecedor.ativo ? 'Outros usuários podem encontrar sua empresa' : 'Salve seu perfil e ative quando quiser aparecer'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAtivo}
              className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
              style={{ background: fornecedor.ativo ? 'var(--vinho)' : 'var(--cinza-light)', border: 'none', cursor: 'pointer' }}
            >
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: fornecedor.ativo ? '22px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {/* Razão social */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Razão Social / Nome Comercial
            </label>
            <input type="text" value={fornecedor.razao_social}
              onChange={e => setFornecedor(prev => ({ ...prev, razao_social: e.target.value }))}
              placeholder="Ex: Empresa Exemplo Ltda"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }} />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              CNPJ <span style={{ color: 'var(--vinho)' }}>*</span>
            </label>
            <input type="text" value={fornecedor.cnpj}
              onChange={e => setFornecedor(prev => ({ ...prev, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }} />
          </div>

          {/* Descrição */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                O que sua empresa oferece
                <span className="ml-2 normal-case font-normal" style={{ opacity: 0.6 }}>({fornecedor.descricao.length}/500)</span>
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
              value={fornecedor.descricao}
              onChange={e => setFornecedor(prev => ({ ...prev, descricao: e.target.value.slice(0, 500) }))}
              placeholder="Descreva brevemente os produtos ou serviços que sua empresa oferece..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }} />
          </div>

          {/* Regiões */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--cinza)' }}>
              Regiões de atendimento
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIOES_OPCOES.map(r => {
                const sel = fornecedor.regioes.includes(r)
                return (
                  <button key={r} type="button" onClick={() => toggleRegiao(r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: sel ? 'var(--vinho)' : 'var(--surface-2)',
                      color: sel ? 'white' : 'var(--cinza)',
                      border: `1.5px solid ${sel ? 'var(--vinho)' : 'var(--cinza-light)'}`,
                      cursor: 'pointer',
                    }}>
                    {r}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>E-mail de contato</label>
              <input type="email" value={fornecedor.email_contato}
                onChange={e => setFornecedor(prev => ({ ...prev, email_contato: e.target.value }))}
                placeholder="contato@empresa.com.br"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>Telefone</label>
              <input type="tel" value={fornecedor.telefone_contato}
                onChange={e => setFornecedor(prev => ({ ...prev, telefone_contato: e.target.value }))}
                placeholder="(31) 99999-9999"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }} />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Website <span className="normal-case font-normal" style={{ opacity: 0.6 }}>(opcional)</span>
            </label>
            <input type="text" value={fornecedor.website}
              onChange={e => setFornecedor(prev => ({ ...prev, website: e.target.value }))}
              placeholder="www.minhaempresa.com.br"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)', outline: 'none' }} />
          </div>

          <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(107,15,26,0.04)', border: '1px solid rgba(107,15,26,0.1)', color: 'var(--cinza)' }}>
            ⚠️ As negociações entre as partes são de responsabilidade exclusiva delas. O Monitor de Licitações apenas disponibiliza este diretório para conexão.
          </div>

          {fornecedorMsg && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{
              background: fornecedorMsg.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${fornecedorMsg.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: fornecedorMsg.tipo === 'ok' ? '#10b981' : '#ef4444',
            }}>
              {fornecedorMsg.tipo === 'ok' ? '✓ ' : '⚠ '}{fornecedorMsg.texto}
            </div>
          )}

          <button type="submit" disabled={salvandoFornecedor}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: salvandoFornecedor ? '#9AA0A6' : 'var(--vinho)', cursor: salvandoFornecedor ? 'not-allowed' : 'pointer' }}>
            {salvandoFornecedor ? 'Salvando...' : 'Salvar perfil de fornecedor'}
          </button>
        </form>
      </div>

      {/* ── Seção Telegram ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
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

      {/* ── Preferências de alertas por e-mail ── */}
      {(() => {
        const limites = getLimites(perfil.plano)
        const opcoesDia = OPCOES_EMAILS_DIA.filter(n => n <= limites.maxEmailsPorDia)
        const opcoesItens = OPCOES_ITENS_EMAIL.filter(n => n <= limites.maxItensPorEmail)
        const horarios = HORARIOS_POR_QTD[perfil.emails_por_dia] ?? HORARIOS_POR_QTD[2]
        const horarioStr = horarios.map(h => `${h}h`).join(', ')

        return (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
            <div className="px-8 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
                style={{ background: 'var(--vinho)' }}>✉</div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--preto)' }}>Frequência de alertas por e-mail</div>
                <div className="text-xs" style={{ color: 'var(--cinza)' }}>Controle quantos e-mails você recebe por dia e quantas licitações por mensagem</div>
              </div>
            </div>

            <form onSubmit={salvarPreferenciasAlerta} className="px-8 py-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>
                  E-mails por dia
                  <span className="ml-2 normal-case font-normal" style={{ color: 'var(--cinza)', opacity: 0.7 }}>
                    (plano {limites.nome}: até {limites.maxEmailsPorDia})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {opcoesDia.map(n => {
                    const ativo = perfil.emails_por_dia === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPerfil(prev => ({ ...prev, emails_por_dia: n }))}
                        className="w-11 h-11 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: ativo ? 'var(--vinho)' : 'var(--surface-2)',
                          color: ativo ? 'white' : 'var(--cinza)',
                          border: `1.5px solid ${ativo ? 'var(--vinho)' : 'var(--cinza-light)'}`,
                        }}
                      >{n}</button>
                    )
                  })}
                </div>
                {horarios.length > 0 && (
                  <p className="text-xs mt-2.5" style={{ color: 'var(--cinza)' }}>
                    📅 Horários de envio (horário de Brasília): <strong>{horarioStr}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cinza)' }}>
                  Licitações por e-mail
                  <span className="ml-2 normal-case font-normal" style={{ color: 'var(--cinza)', opacity: 0.7 }}>
                    (plano {limites.nome}: até {limites.maxItensPorEmail})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {opcoesItens.map(n => {
                    const ativo = perfil.itens_por_email === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPerfil(prev => ({ ...prev, itens_por_email: n }))}
                        className="px-5 h-11 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: ativo ? 'var(--vinho)' : 'var(--surface-2)',
                          color: ativo ? 'white' : 'var(--cinza)',
                          border: `1.5px solid ${ativo ? 'var(--vinho)' : 'var(--cinza-light)'}`,
                        }}
                      >{n} itens</button>
                    )
                  })}
                </div>
              </div>

              {alertaMsg && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{
                  background: alertaMsg.tipo === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${alertaMsg.tipo === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: alertaMsg.tipo === 'ok' ? '#10b981' : '#ef4444',
                }}>
                  {alertaMsg.tipo === 'ok' ? '✓ ' : '⚠ '}{alertaMsg.texto}
                </div>
              )}

              <button type="submit" disabled={salvandoAlerta}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: salvandoAlerta ? '#9AA0A6' : 'var(--vinho)', cursor: salvandoAlerta ? 'not-allowed' : 'pointer' }}>
                {salvandoAlerta ? 'Salvando...' : 'Salvar preferências'}
              </button>
            </form>
          </div>
        )
      })()}

      {/* ── Pausar notificações ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <div className="px-8 py-5" style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(107,15,26,0.08)' }}>⏸</div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--preto)' }}>Pausar notificações</div>
              <div className="text-xs" style={{ color: 'var(--cinza)' }}>Silencia temporariamente um canal. Volta automaticamente no prazo.</div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 space-y-5">
          {([
            { canal: 'email',    label: 'E-mail',    icon: '📧', campo: 'email_pausado_ate'    },
            { canal: 'telegram', label: 'Telegram',  icon: '✈',  campo: 'telegram_pausado_ate' },
            { canal: 'whatsapp', label: 'WhatsApp',  icon: '💬', campo: 'whatsapp_pausado_ate'  },
          ] as const).map(({ canal, label, icon, campo }) => {
            const ate = perfil[campo]
            const pausado = !!ate && new Date(ate) > new Date()
            const tempo = labelPausa(ate)
            return (
              <div key={canal}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--preto)' }}>{label}</span>
                    {pausado ? (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                        ⏸ pausado por {tempo}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
                        ● ativo
                      </span>
                    )}
                  </div>
                  {pausado && (
                    <button
                      onClick={() => pausarCanal(canal, null)}
                      disabled={pausandoCanal === canal}
                      style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', cursor: 'pointer' }}
                    >
                      Reativar
                    </button>
                  )}
                </div>
                {!pausado && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {OPCOES_PAUSA.map(op => (
                      <button
                        key={op.ms}
                        onClick={() => pausarCanal(canal, op.ms)}
                        disabled={pausandoCanal === canal}
                        style={{
                          fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px',
                          background: 'var(--surface-2)', color: 'var(--cinza)',
                          border: '1px solid var(--cinza-light)', cursor: 'pointer',
                          opacity: pausandoCanal === canal ? 0.5 : 1,
                        }}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
