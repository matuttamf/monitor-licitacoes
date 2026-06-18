'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegiaoSelector, RegiaoChips } from '@/components/RegiaoSelector'

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

const META_KEYWORDS = 5

const SUGESTOES_POR_SETOR = [
  {
    label: 'Serviços gerais',
    termos: ['material de limpeza', 'serviço de vigilância', 'manutenção predial', 'jardinagem', 'dedetização'],
  },
  {
    label: 'Construção & obras',
    termos: ['construção civil', 'reforma', 'pavimentação', 'instalação elétrica', 'pintura predial'],
  },
  {
    label: 'TI & tecnologia',
    termos: ['software', 'equipamentos de informática', 'suporte técnico', 'licença de software', 'impressoras'],
  },
  {
    label: 'Alimentação',
    termos: ['gêneros alimentícios', 'refeições coletivas', 'merenda escolar', 'coffee break', 'água mineral'],
  },
  {
    label: 'Saúde',
    termos: ['material hospitalar', 'equipamentos médicos', 'medicamentos', 'material laboratorial', 'oxigênio medicinal'],
  },
  {
    label: 'Móveis & suprimentos',
    termos: ['material de escritório', 'mobiliário', 'cadeiras', 'armários', 'material escolar'],
  },
]

export default function OnboardingPage() {
  const router = useRouter()

  const [passo, setPasso]             = useState<1 | 2 | 3>(1)
  const [verificando, setVerificando] = useState(true)
  const [termo, setTermo]             = useState('')
  const [regioes, setRegioes]         = useState<string[]>([])
  const [salvando, setSalvando]       = useState(false)
  const [erro, setErro]               = useState('')
  const [salvas, setSalvas]           = useState<string[]>([])
  const [setorAberto, setSetorAberto] = useState<string | null>('Serviços gerais')

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
    if (salvas.includes(termo.trim().toLowerCase())) {
      setErro('Essa palavra-chave já foi adicionada.'); return
    }
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
      setSalvas(prev => [...prev, termo.trim()])
      setTermo('')
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

  const progresso = Math.min(salvas.length / META_KEYWORDS, 1)

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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {[
              { n: 1, label: 'Boas-vindas' },
              { n: 2, label: 'Suas buscas'  },
              { n: 3, label: 'Pronto!'      },
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
              O Monitor vasculha diariamente os portais públicos e te avisa por e-mail, WhatsApp ou Telegram quando surgir uma oportunidade para o seu negócio.
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
              Configurar minhas buscas →
            </button>

            <p style={{ marginTop: '14px', fontSize: '12px', color: '#C5C1BC' }}>
              Leva menos de 2 minutos. Quanto mais palavras, mais editais você encontra.
            </p>
          </div>
        )}

        {/* ── Passo 2: Configurar keywords ─────────────────────── */}
        {passo === 2 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', border: '1px solid #E8E4DF' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              O que sua empresa vende?
            </h1>
            <p style={{ fontSize: '14px', color: '#555', margin: '0 0 12px', lineHeight: 1.6 }}>
              As <strong>palavras-chave</strong> são o coração do Monitor. O sistema cruza cada nova licitação publicada com suas palavras e só te avisa quando há correspondência — sem spam, sem ruído.
            </p>

            {/* Box explicativo */}
            <div style={{ background: '#FAF6F0', border: '1px solid #E8E4DC', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', fontSize: '13px', color: '#4a4a4d', lineHeight: 1.7 }}>
              <strong style={{ color: '#6B0F1A' }}>Como escolher:</strong> use o nome do produto ou serviço que você fornece ao governo. Seja específico — <em>&quot;uniforme escolar&quot;</em> funciona melhor que apenas <em>&quot;uniforme&quot;</em>. Se sua empresa tem um nicho único, adicione uma keyword por linha de produto.
              <br />
              <span style={{ color: '#9AA0A6', fontSize: '12px' }}>
                Dúvidas? <a href="https://wa.me/5531998317066" target="_blank" rel="noopener noreferrer" style={{ color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Fale com o suporte no WhatsApp</a>
              </span>
            </div>

            {/* Barra de progresso rumo a 5 keywords */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1C' }}>
                  {salvas.length === 0
                    ? 'Recomendamos ao menos 5 para cobrir mais oportunidades'
                    : salvas.length < META_KEYWORDS
                      ? `${salvas.length} adicionada${salvas.length > 1 ? 's' : ''} — mais ${META_KEYWORDS - salvas.length} para cobertura ideal`
                      : `${salvas.length} palavras-chave configuradas ✓`}
                </span>
                <span style={{ fontSize: '12px', color: salvas.length >= META_KEYWORDS ? '#22c55e' : '#9AA0A6', fontWeight: 600 }}>
                  {salvas.length}/{META_KEYWORDS}
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '99px', background: '#F0ECE8', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  background: salvas.length >= META_KEYWORDS ? '#22c55e' : '#6B0F1A',
                  width: `${Math.max(progresso * 100, salvas.length > 0 ? 8 : 0)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Chips das keywords salvas */}
            {salvas.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {salvas.map(s => (
                  <span key={s} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(107,15,26,0.07)', border: '1px solid rgba(107,15,26,0.15)',
                    borderRadius: '99px', padding: '5px 12px',
                    fontSize: '13px', color: '#6B0F1A', fontWeight: 600,
                  }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}

            {/* Sugestões por setor */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '8px' }}>
                Exemplos por setor — clique para usar
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {SUGESTOES_POR_SETOR.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSetorAberto(setorAberto === s.label ? null : s.label)}
                    style={{
                      padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      border: '1.5px solid',
                      borderColor: setorAberto === s.label ? '#6B0F1A' : '#D5D2C8',
                      background: setorAberto === s.label ? 'rgba(107,15,26,0.07)' : 'white',
                      color: setorAberto === s.label ? '#6B0F1A' : '#555',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {setorAberto && (() => {
                const setor = SUGESTOES_POR_SETOR.find(s => s.label === setorAberto)
                if (!setor) return null
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px 14px', background: '#FAF6F0', borderRadius: '10px', border: '1px solid #E8E4DC' }}>
                    {setor.termos.map(t => (
                      <button
                        key={t}
                        disabled={salvas.includes(t)}
                        onClick={() => setTermo(t)}
                        style={{
                          padding: '4px 11px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                          border: '1px solid',
                          borderColor: salvas.includes(t) ? '#22c55e' : 'rgba(107,15,26,0.25)',
                          background: salvas.includes(t) ? 'rgba(34,197,94,0.1)' : 'white',
                          color: salvas.includes(t) ? '#16a34a' : '#6B0F1A',
                          cursor: salvas.includes(t) ? 'default' : 'pointer',
                        }}
                      >
                        {salvas.includes(t) ? `✓ ${t}` : `+ ${t}`}
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Input nova keyword */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>
                {salvas.length === 0 ? 'Primeira palavra-chave' : 'Adicionar outra'}
              </label>
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); salvar() } }}
                placeholder={salvas.length === 0 ? 'Ex: material de limpeza' : 'Ex: equipamento de informática'}
                autoFocus
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Região */}
            {salvas.length === 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>
                  Região de interesse{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9AA0A6' }}>— padrão: Brasil inteiro</span>
                </label>
                <RegiaoSelector value={regioes} onChange={setRegioes} />
                {regioes.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <RegiaoChips regioes={regioes} onRemove={r => setRegioes(prev => prev.filter(x => x !== r))} />
                  </div>
                )}
              </div>
            )}

            {erro && (
              <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
                ⚠ {erro}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              {/* Botão adicionar */}
              <button
                onClick={salvar}
                disabled={salvando || !termo.trim()}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: salvando || !termo.trim() ? '#9AA0A6' : '#6B0F1A',
                  color: 'white', fontSize: '15px', fontWeight: 700, border: 'none',
                  cursor: salvando || !termo.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {salvando ? 'Salvando…' : salvas.length === 0 ? 'Adicionar →' : '+ Adicionar'}
              </button>
            </div>

            {/* Botão continuar — só aparece após ao menos 1 keyword */}
            {salvas.length > 0 && (
              <button
                onClick={() => {
                  setPasso(3)
                  fetch('/api/matching/trigger', { method: 'POST' }).catch(() => null)
                  fetch('/api/onboarding/concluir', { method: 'POST' }).catch(() => null)
                }}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px',
                  background: salvas.length >= META_KEYWORDS ? '#22c55e' : 'transparent',
                  color: salvas.length >= META_KEYWORDS ? 'white' : '#6B0F1A',
                  fontSize: '14px', fontWeight: 700,
                  border: salvas.length >= META_KEYWORDS ? 'none' : '1.5px solid #6B0F1A',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {salvas.length >= META_KEYWORDS
                  ? `Tudo configurado! Ir para o painel →`
                  : `Continuar com ${salvas.length} palavra${salvas.length > 1 ? 's' : ''}-chave`}
              </button>
            )}

            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#C5C1BC' }}>
              Você pode adicionar mais a qualquer momento em{' '}
              <Link href="/palavras-chave" style={{ color: '#9AA0A6', fontWeight: 600, textDecoration: 'none' }}>Palavras-chave</Link>.
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
              <strong style={{ color: '#6B0F1A' }}>{salvas.length} palavra{salvas.length > 1 ? 's' : ''}-chave</strong> configurada{salvas.length > 1 ? 's' : ''}.
            </p>
            <p style={{ fontSize: '14px', color: '#9AA0A6', lineHeight: 1.6, margin: '0 0 28px' }}>
              Toda vez que um edital compatível for publicado, você recebe um alerta. A primeira coleta roda amanhã às 5h.
            </p>

            <div style={{ background: '#FAF6F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B0F1A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Próximos passos
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '14px', color: '#555', lineHeight: 2 }}>
                <li>Configure seus canais de alerta em <Link href="/perfil" style={{ color: '#6B0F1A', fontWeight: 600 }}>Meu Perfil</Link></li>
                {salvas.length < 10 && (
                  <li>Adicione mais palavras em <Link href="/palavras-chave" style={{ color: '#6B0F1A', fontWeight: 600 }}>Palavras-chave</Link> para cobrir mais editais</li>
                )}
                <li>Explore editais já publicados em <Link href="/busca" style={{ color: '#6B0F1A', fontWeight: 600 }}>Busca</Link></li>
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
