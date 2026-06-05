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
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
    setCarregando(true)
    setErro('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) {
      const msg = error.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErro('Este e-mail já está cadastrado. Use "Entrar" para acessar sua conta.')
      } else if (msg.includes('rate limit') || msg.includes('email_send_rate_limit') || msg.includes('over_email')) {
        setErro('Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente novamente.')
      } else if (msg.includes('invalid') && msg.includes('email')) {
        setErro('E-mail inválido. Verifique e tente novamente.')
      } else if (msg.includes('Password')) {
        setErro('Senha inválida. Use pelo menos 8 caracteres.')
      } else {
        setErro(`Erro ao criar conta: ${msg}`)
      }
      setCarregando(false)
      return
    }
    // Supabase retorna sucesso silencioso para e-mails já cadastrados (proteção anti-enumeração).
    // Detectamos pela identidade vazia: user existe mas sem identities = conta duplicada.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErro('Este e-mail já está cadastrado. Use "Entrar" para acessar sua conta.')
      setCarregando(false)
      return
    }
    setSucesso(true)
    setCarregando(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1.5px solid #D5D2C8',
    background: 'white',
    fontSize: '14px',
    color: '#1A1A1C',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'system-ui, sans-serif',
  }

  if (sucesso) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: 'white', borderRadius: '24px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #D5D2C8' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(107,15,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>✉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1C', margin: '0 0 12px' }}>Verifique seu e-mail</h2>
          <p style={{ fontSize: '15px', color: '#9AA0A6', lineHeight: 1.7, margin: '0 0 8px' }}>
            Enviamos um link de confirmação para <strong style={{ color: '#1A1A1C' }}>{email}</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#9AA0A6', margin: '0 0 32px' }}>Clique no link para ativar sua conta e começar os 7 dias grátis.</p>
          <div style={{ background: '#FAF6F0', borderRadius: '14px', padding: '20px', border: '1px solid #D5D2C8', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#4a4a4d', margin: 0, lineHeight: 1.6 }}>
              💡 <strong>Não encontrou o e-mail?</strong> Verifique a pasta de spam ou lixo eletrônico.
            </p>
          </div>
          <Link href="/login" style={{ display: 'block', padding: '13px', borderRadius: '12px', background: '#6B0F1A', color: 'white', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            Ir para o login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* Painel esquerdo - benefícios */}
      <div style={{ width: '45%', background: '#1A1A1C', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, #6B0F1A 0%, transparent 70%)', opacity: 0.2, filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, #C9A65A 0%, transparent 70%)', opacity: 0.08, filter: 'blur(80px)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(201,166,90,0.3)' }}>ML</div>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Monitor de Licitações</span>
          </Link>
        </div>

        {/* Headline e benefícios */}
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A65A', marginBottom: '16px' }}>Sete dias grátis · sem cartão de crédito</div>
          <h2 style={{ fontSize: '38px', fontWeight: 400, color: 'white', lineHeight: 1.25, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
            O governo compra o que você vende.
            <br /><span style={{ color: '#C9A65A', fontStyle: 'italic' }}>Saiba quando, antes de todos.</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.6 }}>
            Cadastre-se agora e amanhã já recebe as primeiras oportunidades cruzadas com o perfil da sua empresa.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🔀', titulo: 'Cruzamento inteligente de dados', desc: 'Cruzamos automaticamente o que o governo publica em todos os portais com o perfil de produtos da sua empresa — e entregamos só as oportunidades que fazem sentido para o seu negócio.' },
              { icon: '📬', titulo: 'Alertas todos os dias úteis', desc: 'Sua equipe recebe por e-mail e Telegram as oportunidades filtradas — dentro do horário comercial, sem ruído, sem irrelevância.' },
              { icon: '🏛️', titulo: 'Cobertura nacional completa', desc: 'Prefeituras, estados, governo federal, autarquias e empresas públicas — mais de 5.500 municípios rastreados diariamente.' },
              { icon: '⚡', titulo: 'Pronto em dois minutos', desc: 'Cadastre-se, informe o que sua empresa vende e o monitoramento começa imediatamente.' },
            ].map(b => (
              <div key={b.titulo} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(201,166,90,0.1)', border: '1px solid rgba(201,166,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{b.titulo}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ position: 'relative', padding: '20px', background: 'rgba(201,166,90,0.06)', border: '1px solid rgba(201,166,90,0.15)', borderRadius: '14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 10px' }}>
            "O sistema cruzou nosso catálogo com os editais do estado e encontrou uma licitação de R$85.000 em notebooks que nunca teríamos visto. Fechamos o contrato em oito dias."
          </p>
          <span style={{ color: '#C9A65A', fontSize: '12px', fontWeight: 600 }}>Distribuidora de TI — Belo Horizonte, MG</span>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #6B0F1A, #C9A65A, transparent)' }} />
      </div>

      {/* Painel direito - formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: '#FAF6F0' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1C', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Comece a monitorar agora</h1>
            <p style={{ fontSize: '14px', color: '#9AA0A6', margin: 0, lineHeight: 1.5 }}>Sete dias grátis · sem cartão · cancele quando quiser</p>
          </div>

          <form onSubmit={handleCadastro}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a4a4d', marginBottom: '6px' }}>Confirmar senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6B0F1A'; e.target.style.boxShadow = '0 0 0 3px rgba(107,15,26,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D5D2C8'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {erro && (
              <div style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
                ⚠ {erro}
              </div>
            )}

            {/* Garantias antes do botão */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[['🔒', 'Dados seguros'], ['↩', 'Cancele sempre'], ['⚡', 'Ativação imediata']].map(([icon, text]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9AA0A6' }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={carregando}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', background: carregando ? '#9AA0A6' : '#6B0F1A', color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', cursor: carregando ? 'not-allowed' : 'pointer' }}
            >
              {carregando ? 'Criando conta...' : 'Criar conta gratuita →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#9AA0A6', marginTop: '20px' }}>
            Já tem uma conta?{' '}
            <Link href="/login" style={{ color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Entrar →</Link>
          </p>

          <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(107,15,26,0.04)', borderRadius: '12px', border: '1px solid rgba(107,15,26,0.08)' }}>
            <p style={{ fontSize: '12px', color: '#9AA0A6', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
              Ao criar sua conta, você concorda com nossos termos de uso. Após os sete dias de teste, assine a partir de R$49,90/mês ou cancele sem nenhum custo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
