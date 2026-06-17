'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? ''

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErro('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
      } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        setErro('E-mail ou senha incorretos.')
      } else {
        setErro('Erro ao entrar: ' + error.message)
      }
      setCarregando(false)
      return
    }
    // Se há redirect explícito, respeita
    if (redirect && redirect.startsWith('/')) {
      window.location.href = redirect
      return
    }
    // Detecta tipo de conta para redirecionar corretamente
    try {
      const res = await fetch('/api/auth/tipo-conta')
      const { tipo } = await res.json()
      window.location.href = tipo === 'afiliado' ? '/afiliados/dashboard' : '/dashboard'
    } catch {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex font-sans">

      {/* Painel esquerdo — oculto em mobile */}
      <div className="hidden lg:flex w-[50%] flex-col justify-between p-12 bg-[#1A1A1C] relative overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#6B0F1A] opacity-25 blur-[60px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] rounded-full bg-[#C9A65A] opacity-10 blur-[80px]" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-[13px] border border-[rgba(201,166,90,0.3)]">ML</div>
          <span className="text-white font-semibold">Monitor de Licitações</span>
        </Link>

        {/* Headline */}
        <div className="relative">
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#C9A65A] uppercase mb-5">Monitor de Licitações</div>
          <h1 className="text-[46px] font-normal text-white leading-snug mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            Encontre editais<br />
            <span className="text-[#C9A65A] italic">antes de todos.</span>
          </h1>
          <p className="text-[rgba(255,255,255,0.45)] text-[15px] leading-relaxed">
            Editais, dispensas e contratos públicos e privados de todo o Brasil — monitorados em tempo real.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-6">
          {[['346 fontes', 'Monitoradas'], ['Público + Privado', 'Setores'], ['Automático', 'Cruzamento']].map(([num, label]) => (
            <div key={label}>
              <div className="font-bold text-lg text-[#C9A65A]">{num}</div>
              <div className="text-xs text-[rgba(255,255,255,0.35)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6B0F1A] via-[#C9A65A] to-transparent" />
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#FAF6F0]">
        <div className="w-full max-w-[380px]">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden no-underline">
            <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-xs">ML</div>
            <span className="font-bold text-[15px] text-[#1A1A1C]">Monitor de Licitações</span>
          </Link>

          <h2 className="text-2xl sm:text-[26px] font-bold text-[#1A1A1C] mb-1.5">Bem-vindo de volta</h2>
          <p className="text-sm text-[#9AA0A6] mb-8">Acesse sua conta para ver os alertas</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] bg-white text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d]">Senha</label>
                <Link href="/auth/esqueci-senha" className="text-xs text-[#6B0F1A] font-medium no-underline">
                  Esqueci minha senha
                </Link>
              </div>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] bg-white text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)]"
              />
            </div>

            {erro && (
              <div className="bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.2)] rounded-xl px-4 py-3 text-sm text-[#b91c1c]">
                ⚠ {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3.5 rounded-xl text-white text-sm font-bold border-none cursor-pointer transition-opacity"
              style={{ background: carregando ? '#9AA0A6' : '#6B0F1A', cursor: carregando ? 'not-allowed' : 'pointer' }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#9AA0A6]">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-[#6B0F1A] font-semibold no-underline">Começar grátis →</Link>
          </p>

          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-[#C9A65A] to-transparent opacity-40" />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF6F0]" />}>
      <LoginForm />
    </Suspense>
  )
}
