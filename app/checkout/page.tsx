'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const NOMES_MENSAL: Record<string, string> = {
  basic:        'Basic',
  profissional: 'Profissional',
  gestao:       'Gestão',
  pro:          'Gestão',  // retrocompatibilidade
  empresarial:  'Empresarial',
}

const PRECO_MENSAL: Record<string, number> = { basic: 49.90, profissional: 97.90, gestao: 197.90, pro: 197.90, empresarial: 497.00 }
const PRECO_ANUAL:  Record<string, number> = { basic: 499.00, profissional: 979.00, gestao: 1979.00, empresarial: 4970.00 }

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type CupomResult = {
  valido: boolean
  motivo?: string
  percentual: number
  meses: number
  precoOriginal: number
  precoFinal: number
}

function CheckoutConteudo() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const plano        = searchParams.get('plano') ?? ''
  const periodo      = searchParams.get('periodo') === 'anual' ? 'anual' : 'mensal'

  const [status, setStatus]   = useState<'form' | 'enviando' | 'erro' | 'nao-autenticado'>('form')
  const [erro, setErro]       = useState('')

  const [cupom, setCupom]         = useState('')
  const [cupomEstado, setCupomEstado] = useState<'idle' | 'validando' | 'ok' | 'erro'>('idle')
  const [cupomMsg, setCupomMsg]   = useState('')
  const [cupomResult, setCupomResult] = useState<CupomResult | null>(null)

  useEffect(() => {
    if (!plano || !NOMES_MENSAL[plano]) router.replace('/assinar')
  }, [plano, router])

  const nomePlano  = NOMES_MENSAL[plano] ?? plano
  const precoBase  = periodo === 'anual' ? (PRECO_ANUAL[plano] ?? 0) : (PRECO_MENSAL[plano] ?? 0)
  const sufixo     = periodo === 'anual' ? '/ano' : '/mês'

  async function aplicarCupom() {
    const codigo = cupom.trim()
    if (!codigo) return
    setCupomEstado('validando'); setCupomMsg('')
    try {
      const res = await fetch('/api/cupom/validar', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, plano, periodo }),
      })
      if (res.status === 401) { setStatus('nao-autenticado'); return }
      const data: CupomResult = await res.json()
      if (data.valido) {
        setCupomResult(data); setCupomEstado('ok')
        const dur = data.meses > 0 ? `por ${data.meses} ${data.meses === 1 ? 'mês' : 'meses'}` : 'enquanto a assinatura estiver ativa'
        setCupomMsg(`${data.percentual}% de desconto ${dur} aplicado!`)
      } else {
        setCupomResult(null); setCupomEstado('erro')
        setCupomMsg(data.motivo ?? 'Cupom inválido')
      }
    } catch {
      setCupomEstado('erro'); setCupomMsg('Não foi possível validar agora. Tente novamente.')
    }
  }

  function removerCupom() {
    setCupom(''); setCupomResult(null); setCupomEstado('idle'); setCupomMsg('')
  }

  async function continuar() {
    setStatus('enviando'); setErro('')
    try {
      const res = await fetch('/api/assinatura/criar', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano, periodo, cupom: cupomResult?.valido ? cupom.trim() : undefined }),
      })
      if (res.status === 401) { setStatus('nao-autenticado'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao iniciar checkout')
      if (data.cadastroIncompleto) {
        const next = `/checkout?plano=${plano}&periodo=${periodo}`
        router.replace(`/completar-cadastro?next=${encodeURIComponent(next)}`)
        return
      }
      window.location.href = data.url
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
      setStatus('erro')
    }
  }

  // ── Estados de borda ────────────────────────────────────────────────────────
  if (status === 'nao-autenticado') {
    return (
      <Casca>
        <div className="w-14 h-14 rounded-2xl bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-black text-sm mx-auto mb-6">ML</div>
        <h1 className="text-2xl font-black text-[#1A1A1C] mb-2 tracking-tight">Acesse sua conta</h1>
        <p className="text-sm text-[#9AA0A6] mb-1">Para assinar o plano</p>
        <p className="text-base font-bold text-[#6B0F1A] mb-8">{nomePlano}</p>
        <div className="flex flex-col gap-3">
          <Link href={`/login?redirect=${encodeURIComponent(`/checkout?plano=${plano}&periodo=${periodo}`)}`}
            className="block w-full py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold no-underline text-center">Entrar e assinar →</Link>
          <Link href={`/cadastro?plano=${plano}`}
            className="block w-full py-4 rounded-xl border-2 border-[#6B0F1A] text-[#6B0F1A] text-base font-bold no-underline text-center">Criar conta e assinar →</Link>
        </div>
      </Casca>
    )
  }

  if (status === 'erro') {
    return (
      <Casca>
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-[#1A1A1C] mb-3">Erro ao iniciar checkout</h1>
        <p className="text-sm text-[#9AA0A6] mb-8">{erro}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => setStatus('form')}
            className="w-full py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold border-none cursor-pointer">Voltar</button>
          <Link href="/assinar" className="block w-full py-4 rounded-xl border border-[#D5D2C8] text-[#4a4a4d] text-sm font-medium no-underline text-center">Ver planos</Link>
        </div>
      </Casca>
    )
  }

  // ── Formulário (resumo + cupom + continuar) ──────────────────────────────────
  const aplicado = cupomEstado === 'ok' && cupomResult
  const precoMostrar = aplicado ? cupomResult!.precoFinal : precoBase

  return (
    <Casca alinhar="left">
      <div className="w-12 h-12 rounded-2xl bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-black text-sm mb-6">ML</div>
      <h1 className="text-2xl font-black text-[#1A1A1C] mb-1 tracking-tight">Revise sua assinatura</h1>
      <p className="text-sm text-[#9AA0A6] mb-6">Confira o plano e aplique um cupom, se tiver.</p>

      {/* Resumo do plano */}
      <div className="rounded-2xl border border-[#E6E2D8] bg-[#FBF9F4] p-5 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-wide">Plano {periodo === 'anual' ? 'anual' : 'mensal'}</div>
            <div className="text-lg font-black text-[#1A1A1C]">{nomePlano}</div>
          </div>
          <div className="text-right">
            {aplicado && (
              <div className="text-sm text-[#9AA0A6] line-through">{brl(precoBase)}{sufixo}</div>
            )}
            <div className="text-xl font-black text-[#6B0F1A]">{brl(precoMostrar)}<span className="text-sm font-semibold text-[#9AA0A6]">{sufixo}</span></div>
          </div>
        </div>
        {aplicado && cupomResult!.meses > 0 && (
          <div className="mt-3 text-xs text-[#6B0F1A] bg-[#6B0F1A]/5 rounded-lg px-3 py-2">
            Desconto válido por {cupomResult!.meses} {cupomResult!.meses === 1 ? 'mês' : 'meses'}. Depois, {brl(precoBase)}{sufixo}.
          </div>
        )}
      </div>

      {/* Campo de cupom */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#4a4a4d] mb-2">Tem um cupom?</label>
        {aplicado ? (
          <div className="flex items-center justify-between rounded-xl border border-[#2E7D32]/30 bg-[#2E7D32]/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[#2E7D32] font-bold">✓</span>
              <span className="text-sm text-[#2E7D32] font-semibold">{cupom.trim().toUpperCase()} — {cupomMsg}</span>
            </div>
            <button onClick={removerCupom} className="text-xs text-[#9AA0A6] underline cursor-pointer bg-transparent border-none">remover</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                value={cupom}
                onChange={e => { setCupom(e.target.value); if (cupomEstado === 'erro') { setCupomEstado('idle'); setCupomMsg('') } }}
                onKeyDown={e => { if (e.key === 'Enter') aplicarCupom() }}
                placeholder="Digite o código"
                className="flex-1 h-12 px-4 rounded-xl border border-[#D5D2C8] text-[#1A1A1C] text-sm outline-none focus:border-[#6B0F1A] uppercase"
              />
              <button
                onClick={aplicarCupom}
                disabled={cupomEstado === 'validando' || !cupom.trim()}
                className="h-12 px-5 rounded-xl bg-[#1A1A1C] text-white text-sm font-bold border-none cursor-pointer disabled:opacity-50"
              >{cupomEstado === 'validando' ? '...' : 'Aplicar'}</button>
            </div>
            {cupomEstado === 'erro' && <p className="text-xs text-[#C0392B] mt-2">{cupomMsg}</p>}
          </>
        )}
      </div>

      {/* Continuar */}
      <button
        onClick={continuar}
        disabled={status === 'enviando'}
        className="w-full py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === 'enviando'
          ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
          : 'Continuar para pagamento →'}
      </button>

      <div className="mt-4 space-y-2">
        {periodo === 'anual' && (
          <p className="text-xs text-[#4a4a4d] text-center bg-[#FBF9F4] border border-[#E6E2D8] rounded-xl px-4 py-3 leading-relaxed">
            🔄 <strong>Renovação automática:</strong> este plano renova por mais 12 meses no aniversário da assinatura. Você receberá um aviso por e-mail 30 dias antes.{' '}
            <Link href="/perfil" className="text-[#6B0F1A] font-semibold no-underline">Cancele quando quiser</Link> pelo painel.
          </p>
        )}
        {periodo === 'mensal' && (
          <p className="text-xs text-[#4a4a4d] text-center bg-[#FBF9F4] border border-[#E6E2D8] rounded-xl px-4 py-3 leading-relaxed">
            🔄 <strong>Renovação automática mensal.</strong>{' '}
            <Link href="/perfil" className="text-[#6B0F1A] font-semibold no-underline">Cancele quando quiser</Link> pelo painel.
          </p>
        )}
        <p className="text-xs text-[#9AA0A6] text-center">
          Conforme o Código de Defesa do Consumidor, você tem <strong>7 dias</strong> para cancelar sem custo.
        </p>
      </div>
    </Casca>
  )
}

function Casca({ children, alinhar = 'center' }: { children: React.ReactNode; alinhar?: 'center' | 'left' }) {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
      <div className={`w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8] ${alinhar === 'center' ? 'text-center' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D5D2C8] border-t-[#6B0F1A] rounded-full animate-spin" />
      </div>
    }>
      <CheckoutConteudo />
    </Suspense>
  )
}
