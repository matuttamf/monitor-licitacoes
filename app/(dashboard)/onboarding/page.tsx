'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegiaoSelector, RegiaoChips } from '@/components/RegiaoSelector'

// ─── Estilos reutilizáveis ─────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1.5px solid #D5D2C8', background: 'white',
  fontSize: '15px', color: '#1A1A1C', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
}

const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#6B0F1A'
  e.target.style.boxShadow   = '0 0 0 3px rgba(107,15,26,0.1)'
}
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#D5D2C8'
  e.target.style.boxShadow   = 'none'
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()

  const [passo, setPasso]       = useState<1 | 2 | 3>(1)
  const [verificando, setVerificando] = useState(true)
  const [termo, setTermo]       = useState('')
  const [regioes, setRegioes]   = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')

  // Se usuário já tem keywords, pular onboarding
  useEffect(() => {
    fetch('/api/keywords')
      .then(r => r.json())
      .then((data: unknown[]) => {
        if (Array.isArray(data) && data.length > 0) {
          router.replace('/dashboard')
        } else {
          setVerificando(false)
        }
      })
      .catch(() => setVerificando(false))
  }, [router])

  async function salvar() {
    setErro('')
    if (!termo.trim()) { setErro('Digite uma palavra-chave.'); return }
    setSalvando(true)
    try {
      const regiao = regioes.length === 0 ? ['brasil'] : regioes
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termo: termo.trim(), regiao }),
      })
      if (!res.ok) {
        const d = await res.json()
        setErro(d.error ?? 'Erro ao salvar. Tente novamente.')
        return
      }
      setPasso(3)
    } finally {
      setSalvando(false)
    }
  }

  if (verificando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6F0' }}>
        <div style={{ color: '#9AA0A6', fontSize: '14px' }}>Carregando…</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#FAF6F0',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>ML</div>
            <span style={{ color: '#1A1A1C', fontWeight: 600, fontSize: '15px' }}>Monitor de Licitações</span>
          </Link>

          {/* Indicador de progresso */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {[
              { n: 1, label: 'Boas-vindas' },
              { n: 2, label: 'Sua busca'   },
              { n: 3, label: 'Pronto!'     },
            ].map(({ n, label }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <div style={{ width: '32px', height: '2px', background: passo > i ? '#6B0F1A' : '#D5D2C8', transition: 'background 0.3s' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: passo > n ? '#4ade80' : passo === n ? '#6B0F1A' : '#D5D2C8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: 'white', fontWeight: 700,
                    transition: 'background 0.3s',
                  }}>
                    {passo > n ? '✓' : n}
                  </div>
                  <span style={{ fontSize: '12px', color: passo === n ? '#6B0F1A' : '#9AA0A6', fontWeight: passo === n ? 600 : 400 }}>
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Passo 1: Boas-vindas ──────────────────────────────── */}
        {passo === 1 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px 36px', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', border: '1px solid #E8E4DF', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Conta criada com sucesso!
            </h1>
            <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.7, margin: '0 0 24px' }}>
              O Monitor de Licitações vasculha diariamente os portais públicos e te avisa
              por e-mail, WhatsApp ou Telegram quando surgir uma oportunidade para o seu negócio.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
              {[
                { icon: '🔍', title: 'Palavra-chave', desc: 'Você define o que monitorar' },
                { icon: '📍', title: 'Região', desc: 'Filtra por estado ou região' },
                { icon: '🔔', title: 'Alerta', desc: 'Recebe na hora que sair' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: '#FAF6F0', borderRadius: '12px', padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1C', marginBottom: '4px' }}>{title}</div>
                  <div style={{ fontSize: '11px', color: '#9AA0A6', lineHeight: 1.4 }}>{desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPasso(2)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#6B0F1A', color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Configurar minha primeira busca →
            </button>

            <p style={{ marginTop: '14px', fontSize: '13px', color: '#9AA0A6' }}>
              Leva menos de 1 minuto.{' '}
              <Link href="/dashboard" style={{ color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>
                Pular por agora
              </Link>
            </p>
          </div>
        )}

        {/* ── Passo 2: Configurar keyword + região ─────────────── */}
        {passo === 2 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', border: '1px solid #E8E4DF' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              O que você quer monitorar?
            </h1>
            <p style={{ fontSize: '14px', color: '#9AA0A6', margin: '0 0 28px', lineHeight: 1.6 }}>
              Informe um produto, serviço ou segmento. Exemplos: <em>uniforme escolar</em>, <em>manutenção predial</em>, <em>equipamento hospitalar</em>.
            </p>

            {/* Palavra-chave */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>
                Palavra-chave
              </label>
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); salvar() } }}
                placeholder="Ex: material de limpeza"
                autoFocus
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Região */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>
                Região de interesse{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9AA0A6' }}>— padrão: Brasil inteiro</span>
              </label>

              <RegiaoSelector
                value={regioes}
                onChange={setRegioes}
              />

              {regioes.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <RegiaoChips regioes={regioes} onRemove={r => {
                    setRegioes(prev => prev.filter(x => x !== r))
                  }} />
                </div>
              )}
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
                ⚠ {erro}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setPasso(1)}
                style={{ padding: '14px 20px', borderRadius: '12px', background: 'transparent', color: '#6B0F1A', fontSize: '14px', fontWeight: 600, border: '1.5px solid #D5D2C8', cursor: 'pointer' }}
              >
                ← Voltar
              </button>
              <button
                onClick={salvar}
                disabled={salvando || !termo.trim()}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: salvando || !termo.trim() ? '#9AA0A6' : '#6B0F1A',
                  color: 'white', fontSize: '16px', fontWeight: 700, border: 'none',
                  cursor: salvando || !termo.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {salvando ? 'Salvando…' : 'Salvar e continuar →'}
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: '#9AA0A6' }}>
              Você pode adicionar mais palavras-chave depois em{' '}
              <Link href="/palavras-chave" style={{ color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Palavras-chave</Link>.
            </p>
          </div>
        )}

        {/* ── Passo 3: Sucesso ──────────────────────────────────── */}
        {passo === 3 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px 36px', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', border: '1px solid #E8E4DF', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Tudo pronto!
            </h1>
            <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.7, margin: '0 0 8px' }}>
              Monitoramento de <strong style={{ color: '#6B0F1A' }}>{termo}</strong> configurado.
            </p>
            <p style={{ fontSize: '14px', color: '#9AA0A6', lineHeight: 1.6, margin: '0 0 32px' }}>
              A partir de agora, toda vez que uma licitação relacionada for publicada você receberá um alerta automaticamente.
            </p>

            <div style={{ background: '#FAF6F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B0F1A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Próximos passos sugeridos
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '14px', color: '#555', lineHeight: 2 }}>
                <li>Configure seus canais de alerta em <Link href="/perfil" style={{ color: '#6B0F1A', fontWeight: 600 }}>Meu Perfil</Link></li>
                <li>Adicione mais palavras-chave em <Link href="/palavras-chave" style={{ color: '#6B0F1A', fontWeight: 600 }}>Palavras-chave</Link></li>
                <li>Explore licitações já publicadas em <Link href="/busca" style={{ color: '#6B0F1A', fontWeight: 600 }}>Busca</Link></li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#6B0F1A', color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Ir para o painel →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
