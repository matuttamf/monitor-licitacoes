'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const NOMES: Record<string, string> = {
  basic:        'Basic — R$49,90/mês',
  profissional: 'Profissional — R$97,90/mês',
  gestao:       'Gestão — R$197,90/mês',
  pro:          'Gestão — R$197,90/mês',  // retrocompatibilidade
  empresarial:  'Empresarial — R$497/mês',
}

function CheckoutConteudo() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const plano        = searchParams.get('plano') ?? ''

  const [status, setStatus] = useState<'carregando' | 'erro' | 'nao-autenticado'>('carregando')
  const [erro, setErro]     = useState('')

  useEffect(() => {
    if (!plano || !NOMES[plano]) {
      router.replace('/assinar')
      return
    }

    async function iniciarCheckout() {
      try {
        const res = await fetch('/api/assinatura/criar', {
          method:      'POST',
          credentials: 'same-origin',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ plano }),
        })

        if (res.status === 401) {
          setStatus('nao-autenticado')
          return
        }

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Erro ao iniciar checkout')

        if (data.cadastroIncompleto) {
          router.replace(`/completar-cadastro?next=${encodeURIComponent(`/checkout?plano=${plano}`)}`)
          return
        }

        // Redireciona direto para o MercadoPago
        window.location.href = data.url
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
        setStatus('erro')
      }
    }

    iniciarCheckout()
  }, [plano, router])

  const nomePlano = NOMES[plano] ?? plano

  if (status === 'nao-autenticado') {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8]">
          <div className="w-14 h-14 rounded-2xl bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-black text-sm mx-auto mb-6">ML</div>
          <h1 className="text-2xl font-black text-[#1A1A1C] mb-2 tracking-tight">Acesse sua conta</h1>
          <p className="text-sm text-[#9AA0A6] mb-1">Para assinar o plano</p>
          <p className="text-base font-bold text-[#6B0F1A] mb-8">{nomePlano}</p>

          <div className="flex flex-col gap-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(`/checkout?plano=${plano}`)}`}
              className="block w-full py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold no-underline text-center"
            >
              Entrar e assinar →
            </Link>
            <Link
              href={`/cadastro?plano=${plano}`}
              className="block w-full py-4 rounded-xl border-2 border-[#6B0F1A] text-[#6B0F1A] text-base font-bold no-underline text-center"
            >
              Criar conta e assinar →
            </Link>
          </div>

          <p className="text-xs text-[#9AA0A6] mt-6">
            Prefere começar com 7 dias grátis?{' '}
            <Link href="/cadastro" className="text-[#6B0F1A] font-semibold no-underline">Clique aqui</Link>
          </p>
        </div>
      </div>
    )
  }

  if (status === 'erro') {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8]">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-[#1A1A1C] mb-3">Erro ao iniciar checkout</h1>
          <p className="text-sm text-[#9AA0A6] mb-8">{erro}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStatus('carregando'); setErro('') }}
              className="w-full py-4 rounded-xl bg-[#6B0F1A] text-white text-base font-bold border-none cursor-pointer"
            >
              Tentar novamente
            </button>
            <Link href="/assinar" className="block w-full py-4 rounded-xl border border-[#D5D2C8] text-[#4a4a4d] text-sm font-medium no-underline text-center">
              Ver planos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Carregando / redirecionando
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8]">
        <div className="w-14 h-14 rounded-2xl bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-black text-sm mx-auto mb-6">ML</div>
        <div className="flex justify-center mb-6">
          <div className="w-8 h-8 border-4 border-[#D5D2C8] border-t-[#6B0F1A] rounded-full animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1C] mb-2">Preparando seu checkout…</h1>
        <p className="text-sm text-[#9AA0A6]">Você será redirecionado para o pagamento em instantes.</p>
        <p className="text-xs text-[#9AA0A6] mt-2 font-medium">{nomePlano}</p>
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
