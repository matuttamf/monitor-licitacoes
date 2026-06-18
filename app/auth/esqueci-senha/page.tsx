'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    // Sempre mostra sucesso — não revela se o e-mail está cadastrado
    setEnviado(true)
    setCarregando(false)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8]">

        <Link href="/" className="flex items-center gap-2.5 mb-8 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-xs">ML</div>
          <span className="font-bold text-[15px] text-[#1A1A1C]">Monitor de Licitações</span>
        </Link>

        {enviado ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-[#1A1A1C] mb-3">E-mail enviado!</h2>
            <p className="text-sm text-[#9AA0A6] mb-6 leading-relaxed">
              Enviamos um link de recuperação para <strong className="text-[#1A1A1C]">{email}</strong>. Verifique sua caixa de entrada e spam.
            </p>
            <Link href="/login" className="text-sm text-[#6B0F1A] font-semibold no-underline">
              ← Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#1A1A1C] mb-1.5">Recuperar senha</h2>
            <p className="text-sm text-[#9AA0A6] mb-8">
              Informe seu e-mail e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
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
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold border-none"
                style={{ background: carregando ? '#9AA0A6' : '#6B0F1A', cursor: carregando ? 'not-allowed' : 'pointer' }}
              >
                {carregando ? 'Enviando...' : 'Enviar link de recuperação →'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-[#9AA0A6]">
              Lembrou a senha?{' '}
              <Link href="/login" className="text-[#6B0F1A] font-semibold no-underline">Entrar →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
