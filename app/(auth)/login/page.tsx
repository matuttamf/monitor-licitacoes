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
    <div className="min-h-screen flex" style={{ background: 'var(--surface-2)' }}>
      {/* Painel esquerdo decorativo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* Gradiente decorativo */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.3) 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'var(--accent)' }}
            >
              ML
            </div>
            <span className="text-white font-semibold tracking-wide text-sm">Matutta</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1
            className="text-5xl font-normal leading-tight mb-6"
            style={{ fontFamily: 'var(--font-instrument)', color: 'white' }}
          >
            Monitore licitações<br />
            <span style={{ color: 'var(--accent-light)', fontStyle: 'italic' }}>antes da concorrência.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.6' }}>
            Alertas diários de editais públicos de prefeituras,<br />
            estados e governo federal — filtrados para o que<br />
            você realmente pode vender.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {[
            { num: '5.500+', label: 'Prefeituras monitoradas' },
            { num: 'Diário', label: 'Atualização automática' },
            { num: 'IA', label: 'Match semântico' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-white font-bold text-lg">{item.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito - formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'var(--accent)' }}
            >
              ML
            </div>
            <span className="font-semibold">Monitor de Licitações</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Acesso restrito à equipe Matutta
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-2)' }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-1)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-2)' }}
              >
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-1)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {erro && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <span>⚠</span> {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-2"
              style={{
                background: carregando ? 'var(--text-3)' : 'var(--accent)',
                cursor: carregando ? 'not-allowed' : 'pointer',
              }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
