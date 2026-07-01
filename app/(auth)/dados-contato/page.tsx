'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

function DadosContatoConteudo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') ?? '/dashboard'

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) setNome(user.user_metadata.full_name)
      else if (user?.user_metadata?.name) setNome(user.user_metadata.name)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    const tel = telefone.replace(/\D/g, '')
    if (tel.length < 10) { setErro('Informe um telefone válido com DDD.'); return }

    setSalvando(true)
    try {
      const res = await fetch('/api/auth/salvar-telefone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone, nome }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao salvar. Tente novamente.'); return }
      router.push(nextUrl)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] bg-white text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)] transition-colors"
  const labelCls = "block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5"

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans flex items-center justify-center p-5 sm:p-10">
      <div className="w-full max-w-[420px]">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 no-underline">
            <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-xs">ML</div>
            <span className="text-[#1A1A1C] font-semibold text-[15px]">Monitor de Licitações</span>
          </Link>

          <div className="flex items-center justify-center gap-2 mb-5">
            {[
              { label: 'Conta criada', done: true },
              { label: 'Telefone', done: false, active: true },
              { label: 'Painel', done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-8 h-0.5 bg-[#D5D2C8]" />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${s.done ? 'bg-[#4ade80]' : s.active ? 'bg-[#6B0F1A]' : 'bg-[#D5D2C8]'}`}>
                    {s.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs ${s.active ? 'text-[#6B0F1A] font-semibold' : 'text-[#9AA0A6]'}`}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-extrabold text-[#1A1A1C] mb-1.5 tracking-tight">Só mais uma coisa</h1>
          <p className="text-sm text-[#9AA0A6]">Precisamos do seu telefone para enviar alertas de licitações via WhatsApp.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.07)] border border-[#E8E4DF]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className={labelCls}>Seu nome</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome e sobrenome"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>WhatsApp / Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(mascaraTelefone(e.target.value))}
                placeholder="(11) 91234-5678"
                required
                inputMode="numeric"
                className={inputCls}
              />
              <p className="text-xs text-[#9AA0A6] mt-1">Usado para alertas de licitações em tempo real.</p>
            </div>

            {erro && (
              <div className="bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.2)] rounded-xl px-4 py-3 text-sm text-[#b91c1c]">
                ⚠ {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={salvando}
              className={`w-full py-4 rounded-xl text-white text-base font-bold border-none mt-1 transition-colors ${salvando ? 'bg-[#9AA0A6] cursor-not-allowed' : 'bg-[#6B0F1A] cursor-pointer hover:bg-[#5a0c16]'}`}
            >
              {salvando ? 'Salvando...' : 'Acessar o painel →'}
            </button>
          </form>

          <p className="text-center text-xs text-[#9AA0A6] mt-4 leading-relaxed">
            🔒 Seu telefone é usado exclusivamente para alertas. Sem spam.
          </p>
        </div>

      </div>
    </div>
  )
}

export default function DadosContatoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D5D2C8] border-t-[#6B0F1A] rounded-full animate-spin" />
      </div>
    }>
      <DadosContatoConteudo />
    </Suspense>
  )
}
