'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setCarregando(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      setErro(
        error.message === 'User already registered'
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao criar conta. Tente novamente.'
      )
      setCarregando(false)
      return
    }

    setSucesso(true)
    setCarregando(false)
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--creme)' }}>
        <div className="w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl"
            style={{ background: 'rgba(107,15,26,0.08)', border: '1.5px solid rgba(107,15,26,0.15)' }}
          >
            ✉
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--preto)' }}>
            Verifique seu e-mail
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--cinza)' }}>
            Enviamos um link de confirmação para{' '}
            <strong style={{ color: 'var(--preto)' }}>{email}</strong>.
            Clique no link para ativar sua conta e acessar o monitor.
          </p>
          <div
            className="rounded-xl px-5 py-4 mb-6 text-left"
            style={{ background: 'rgba(201,166,90,0.08)', border: '1px solid rgba(201,166,90,0.2)' }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--dourado)' }}>
              Não recebeu o e-mail?
            </p>
            <p className="text-xs" style={{ color: 'var(--cinza)' }}>
              Verifique a caixa de spam. O e-mail pode levar até 2 minutos para chegar.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3 rounded-xl text-sm font-semibold text-center"
            style={{ background: 'var(--vinho)', color: 'white' }}
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--creme)' }}>

      {/* Painel esquerdo — identidade Matutta */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--preto)' }}
      >
        {/* Textura grain */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        {/* Glow vinho */}
        <div
          className="absolute opacity-20"
          style={{
            top: '20%', left: '-10%', width: '60%', height: '60%',
            background: 'radial-gradient(circle, var(--vinho) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Glow dourado */}
        <div
          className="absolute opacity-10"
          style={{
            bottom: '10%', right: '5%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, var(--dourado) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--vinho)', color: 'var(--dourado)', border: '1px solid rgba(201,166,90,0.3)' }}
          >
            ML
          </div>
          <span className="font-semibold tracking-wide" style={{ color: 'white' }}>Matutta</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <div
            className="text-xs font-medium tracking-widest uppercase mb-6"
            style={{ color: 'var(--dourado)' }}
          >
            Monitor de Licitações
          </div>
          <h1
            className="text-5xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-instrument)', color: 'white', fontWeight: 400 }}
          >
            7 dias grátis.<br />
            <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>Sem cartão.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: '1.7' }}>
            Configure suas palavras-chave e receba alertas<br />
            diários de licitações públicas que combinam<br />
            com o que você vende.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { num: '5.500+', label: 'Municípios' },
            { num: 'Diário', label: 'Atualização' },
            { num: 'R$49,90', label: 'por mês' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-bold text-lg" style={{ color: 'var(--dourado)' }}>{s.num}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Linha dourada bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, var(--vinho), var(--dourado), transparent)' }}
        />
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ background: 'var(--vinho)', color: 'var(--dourado)' }}
            >
              ML
            </div>
            <span className="font-semibold" style={{ color: 'var(--preto)' }}>Monitor de Licitações</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>
              Criar sua conta
            </h2>
            <p className="text-sm" style={{ color: 'var(--cinza)' }}>
              7 dias grátis · sem cartão de crédito
            </p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid rgba(154,160,166,0.3)', background: 'white', color: 'var(--preto)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(154,160,166,0.3)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid rgba(154,160,166,0.3)', background: 'white', color: 'var(--preto)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(154,160,166,0.3)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                required
                placeholder="Repita a senha"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid rgba(154,160,166,0.3)', background: 'white', color: 'var(--preto)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(154,160,166,0.3)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {erro && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(185,28,28,0.06)', color: '#b91c1c', border: '1px solid rgba(185,28,28,0.15)' }}
              >
                ⚠ {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2"
              style={{
                background: carregando ? 'var(--cinza)' : 'var(--vinho)',
                color: 'white',
                cursor: carregando ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              {carregando ? 'Criando conta...' : 'Criar conta grátis →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--cinza)' }}>
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--vinho)' }}>
              Entrar
            </Link>
          </p>

          {/* Linha dourada decorativa */}
          <div
            className="mt-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--dourado), transparent)', opacity: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}
