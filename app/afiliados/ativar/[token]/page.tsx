'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AtivarAfiliado() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [etapa, setEtapa] = useState<'verificando' | 'definir_senha' | 'erro' | 'sucesso'>('verificando')
  const [dados, setDados] = useState<{ nome: string; email: string; temConta?: boolean } | null>(null)
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [contaExistente, setContaExistente] = useState(false)

  useEffect(() => {
    async function verificar() {
      const res = await fetch(`/api/afiliados/ativar?token=${token}`)
      const data = await res.json()
      if (!res.ok) { setEtapa('erro'); setErro(data.error ?? 'Link inválido ou expirado.'); return }
      setDados({ nome: data.nome, email: data.email, temConta: data.temConta })
      setEtapa('definir_senha')
    }
    verificar()
  }, [token])

  async function handleAtivacao(e: React.FormEvent) {
    e.preventDefault()
    if (!dados?.temConta) {
      if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
      if (senha !== confirmar) { setErro('As senhas não conferem.'); return }
    }
    setErro('')
    setCarregando(true)

    // Cria conta Supabase + ativa afiliado
    const res = await fetch('/api/afiliados/ativar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, senha }),
    })
    const data = await res.json()

    if (!res.ok) { setErro(data.error ?? 'Erro ao ativar conta.'); setCarregando(false); return }

    setContaExistente(!!data.contaExistente)
    setEtapa('sucesso')

    if (data.contaExistente) {
      // Usuário já tinha conta — só redireciona para login (senha não foi alterada)
      setTimeout(() => router.push('/login'), 2000)
    } else {
      // Nova conta criada — faz login automático com a senha definida
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email: dados!.email, password: senha })
      setTimeout(() => router.push('/afiliados/dashboard'), 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] px-4 font-sans">
      <div style={{
        background: 'white', borderRadius: 20, border: '1px solid #E8E4DC',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)', width: '100%', maxWidth: 440, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: '#6B0F1A', padding: '28px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,166,90,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#C9A65A', fontWeight: 700, fontSize: 12 }}>ML</span>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Monitor de Licitações</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Programa de Parceiros</div>
            </div>
          </div>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#6B0F1A,#C9A65A,#FAF6F0)' }} />

        <div style={{ padding: '36px 40px' }}>
          {etapa === 'verificando' && (
            <p style={{ color: '#9AA0A6', fontSize: 14, textAlign: 'center' }}>Verificando convite…</p>
          )}

          {etapa === 'erro' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ color: '#1A1A1C', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Link inválido</h2>
              <p style={{ color: '#9AA0A6', fontSize: 14 }}>{erro}</p>
            </div>
          )}

          {etapa === 'sucesso' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: '#1A1A1C', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Conta ativada!</h2>
              <p style={{ color: '#9AA0A6', fontSize: 14 }}>
                {contaExistente
                  ? 'Sua conta existente foi vinculada ao programa de parceiros. Redirecionando para o login…'
                  : 'Redirecionando para o seu painel…'}
              </p>
            </div>
          )}

          {etapa === 'definir_senha' && dados && (
            <>
              <div style={{ color: '#C9A65A', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Bem-vindo, {dados.nome}</div>
              <h2 style={{ color: '#1A1A1C', fontSize: 22, fontWeight: 400, fontFamily: 'Georgia, serif', marginBottom: 6 }}>Ative sua conta de parceiro</h2>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
                Defina uma senha para acessar seu painel e acompanhar indicações e comissões.
              </p>
              <p style={{ color: '#9AA0A6', fontSize: 13, marginBottom: 24, fontStyle: 'italic' }}>{dados.email}</p>

              <form onSubmit={handleAtivacao} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {dados.temConta ? (
                  <div style={{ background: '#FAF6F0', border: '1px solid #E8E4DC', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#4a4a4d', lineHeight: 1.5 }}>
                    Você já tem uma conta no Monitor de Licitações. Clique em confirmar para vincular seu acesso de parceiro à conta existente.
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1C', display: 'block', marginBottom: 6 }}>Senha</label>
                      <input
                        type="password" value={senha} onChange={e => setSenha(e.target.value)}
                        placeholder="Mínimo 8 caracteres" required minLength={8}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E4DC', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1C', display: 'block', marginBottom: 6 }}>Confirmar senha</label>
                      <input
                        type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
                        placeholder="Repita a senha" required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E4DC', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                      />
                    </div>
                  </>
                )}

                {erro && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{erro}</p>}

                <button type="submit" disabled={carregando} style={{
                  background: '#6B0F1A', color: 'white', border: 'none', borderRadius: 10,
                  padding: '13px', fontWeight: 700, fontSize: 15, cursor: carregando ? 'not-allowed' : 'pointer',
                  opacity: carregando ? 0.7 : 1, marginTop: 4,
                }}>
                  {carregando ? 'Ativando…' : dados.temConta ? 'Confirmar vinculação →' : 'Ativar minha conta →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
