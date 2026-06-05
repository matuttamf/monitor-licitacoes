'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* Painel esquerdo */}
      <div style={{ display: 'flex', width: '50%', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', background: '#1A1A1C', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, #6B0F1A 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '40%', height: '40%', background: 'radial-gradient(circle, #C9A65A 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.1 }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', border: '1px solid rgba(201,166,90,0.3)' }}>ML</div>
          <span style={{ color: 'white', fontWeight: 600 }}>Matutta</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#C9A65A', textTransform: 'uppercase', marginBottom: '20px' }}>Monitor de Licitações</div>
          <h1 style={{ fontSize: '46px', fontWeight: 400, color: 'white', lineHeight: 1.2, margin: '0 0 20px', fontFamily: 'Georgia, serif' }}>
            Encontre editais<br />
            <span style={{ color: '#C9A65A', fontStyle: 'italic' }}>antes de todos.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
            Alertas diários de licitações públicas filtrados por IA para o que a Matutta pode vender.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {[['5.500+', 'Municípios'], ['Diário', 'Atualização'], ['Gemini', 'Match por IA']].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#C9A65A' }}>{num}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #6B0F1A, #C9A65A, transparent)' }} />
      </div>

      {/* Painel direito — formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#FAF6F0' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Logo mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>ML</div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A1C' }}>Monitor de Licitações</span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1C', margin: '0 0 6px' }}>Bem-vindo de volta</h2>
          <p style={{ fontSize: '14px', color: '#9AA0A6', margin: '0 0 32px' }}>Acesso restrito à equipe Matutta</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #D5D2C8', background: 'white', fontSize: '14px', color: '#1A1A1C', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #D5D2C8', background: 'white', fontSize: '14px', color: '#1A1A1C', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {erro && (
              <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
                ⚠ {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', background: carregando ? '#9AA0A6' : '#6B0F1A', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: carregando ? 'not-allowed' : 'pointer', letterSpacing: '0.02em' }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '13px', color: '#9AA0A6' }}>Não tem conta? </span>
            <Link href="/cadastro" style={{ fontSize: '13px', color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Começar grátis →</Link>
          </div>

          <div style={{ margin: '32px 0 0', height: '1px', background: 'linear-gradient(90deg, transparent, #C9A65A, transparent)', opacity: 0.4 }} />
        </div>
      </div>
    </div>
  )
}
