'use client'

import { useState } from 'react'

const planos = [
  {
    id: 'basic',
    nome: 'Basic',
    preco: '49,90',
    keywords: 'Até 10 palavras-chave',
    usuarios: '1 usuário',
    canais: 'E-mail + Telegram',
    extra: null,
    destaque: false,
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: '97',
    keywords: 'Palavras-chave ilimitadas',
    usuarios: '1 usuário',
    canais: 'E-mail + Telegram',
    extra: null,
    destaque: false,
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: '197',
    keywords: 'Palavras-chave ilimitadas',
    usuarios: '5 usuários',
    canais: 'E-mail + Telegram',
    extra: null,
    destaque: true,
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    preco: '497',
    keywords: 'Palavras-chave ilimitadas',
    usuarios: 'Usuários ilimitados',
    canais: 'Tudo + Relatório mensal',
    extra: 'Suporte prioritário',
    destaque: false,
  },
]

export default function AssinarPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function handleAssinar(planoId: string) {
    setLoading(planoId)
    setErro(null)
    try {
      const res = await fetch('/api/assinatura/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao criar checkout')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{ background: 'var(--creme)', fontFamily: 'var(--font-jakarta)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mx-auto mb-6"
            style={{ background: 'var(--vinho)', color: 'var(--dourado)' }}
          >
            ML
          </div>
          <h1
            className="text-3xl md:text-4xl mb-3"
            style={{ fontFamily: 'var(--font-instrument)', fontWeight: 400, color: 'var(--preto)' }}
          >
            Escolha seu plano
          </h1>
          <p className="text-base" style={{ color: 'var(--cinza)' }}>
            7 dias grátis em qualquer plano. Cancele quando quiser.
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div
            className="mb-8 px-5 py-4 rounded-xl text-sm text-center max-w-lg mx-auto"
            style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}
          >
            {erro}
          </div>
        )}

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {planos.map(plano => (
            <div
              key={plano.id}
              className="rounded-2xl p-7 flex flex-col relative overflow-hidden"
              style={{
                background: plano.destaque ? 'var(--preto)' : 'white',
                border: plano.destaque ? '2px solid rgba(201,166,90,0.3)' : '1.5px solid rgba(26,26,28,0.08)',
                boxShadow: plano.destaque ? '0 8px 32px rgba(107,15,26,0.25)' : '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              {plano.destaque && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--dourado), transparent)' }}
                />
              )}

              {plano.destaque && (
                <div className="mb-3">
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                    style={{ background: 'rgba(201,166,90,0.15)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.25)' }}
                  >
                    ★ Mais popular
                  </span>
                </div>
              )}

              <div className="mb-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: plano.destaque ? 'rgba(255,255,255,0.5)' : 'var(--cinza)' }}
                >
                  {plano.nome}
                </span>
              </div>

              <div className="mb-6">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: 'var(--font-instrument)', color: plano.destaque ? 'white' : 'var(--preto)' }}
                >
                  R${plano.preco}
                </span>
                <span
                  className="text-sm ml-1"
                  style={{ color: plano.destaque ? 'rgba(255,255,255,0.35)' : 'var(--cinza)' }}
                >
                  /mês
                </span>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {[plano.keywords, plano.usuarios, plano.canais, plano.extra]
                  .filter(Boolean)
                  .map(item => (
                    <li
                      key={item!}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: plano.destaque ? 'rgba(255,255,255,0.6)' : 'var(--cinza)' }}
                    >
                      <span style={{ color: 'var(--dourado)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      {item}
                    </li>
                  ))}
              </ul>

              <button
                onClick={() => handleAssinar(plano.id)}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl text-sm font-semibold text-center transition-all disabled:opacity-60"
                style={
                  plano.destaque
                    ? { background: 'var(--vinho)', color: 'white', border: '1px solid rgba(201,166,90,0.2)', cursor: loading ? 'wait' : 'pointer' }
                    : { background: 'transparent', color: 'var(--vinho)', border: '1.5px solid rgba(107,15,26,0.2)', cursor: loading ? 'wait' : 'pointer' }
                }
              >
                {loading === plano.id ? 'Aguarde...' : 'Assinar →'}
              </button>
            </div>
          ))}
        </div>

        {/* Nota */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--cinza)' }}>
          Sem cartão de crédito no período de teste · Cancele quando quiser · Pagamento via MercadoPago
        </p>
      </div>
    </div>
  )
}
