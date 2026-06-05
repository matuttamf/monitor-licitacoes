'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 8) { setErro('Mínimo 8 caracteres.'); return }
    setCarregando(true)
    setErro('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) {
      setErro('Erro ao atualizar senha: ' + error.message)
      setCarregando(false)
      return
    }
    setSucesso(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 2000)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: '1.5px solid #D5D2C8', background: 'white',
    fontSize: '14px', color: '#1A1A1C', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', padding: '48px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #D5D2C8' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>ML</div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A1C' }}>Monitor de Licitações</span>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1C', margin: '0 0 8px' }}>Criar nova senha</h2>
        <p style={{ fontSize: '14px', color: '#9AA0A6', margin: '0 0 28px' }}>Escolha uma senha segura para sua conta.</p>

        {sucesso ? (
          <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#16a34a', fontSize: '14px' }}>
            ✅ Senha atualizada! Redirecionando...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>Nova senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>Confirmar senha</label>
              <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="Repita a senha" required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }} />
            </div>
            {erro && (
              <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
                ⚠ {erro}
              </div>
            )}
            <button type="submit" disabled={carregando}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', background: carregando ? '#9AA0A6' : '#6B0F1A', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: carregando ? 'not-allowed' : 'pointer' }}>
              {carregando ? 'Salvando...' : 'Salvar nova senha →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
