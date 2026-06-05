'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }
    router.push('/')
    router.refresh()
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
            top: '20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, var(--vinho) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Glow dourado */}
        <div
          className="absolute opacity-10"
          style={{
            bottom: '10%',
            right: '5%',
            width: '40%',
            height: '40%',
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
            Encontre editais<br />
            <span style={{ color: 'var(--dourado)', fontStyle: 'italic' }}>antes de todos.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: '1.7' }}>
            Alertas diários de licitações públicas de prefeituras,<br />
            estados e governo federal — filtrados por IA<br />
            para o que a Matutta realmente pode vender.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { num: '5.500+', label: 'Municípios' },
            { num: 'Diário', label: 'Atualização' },
            { num: 'Gemini', label: 'Match por IA' },
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
              Bem-vindo de volta
            </h2>
            <p className="text-sm" style={{ color: 'var(--cinza)' }}>
              Acesso restrito à equipe Matutta
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--vinho)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--cinza-light)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {erro && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--red)', border: '1px solid rgba(185,28,28,0.15)' }}
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
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Linha dourada decorativa */}
          <div
            className="mt-10 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--dourado), transparent)', opacity: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}
