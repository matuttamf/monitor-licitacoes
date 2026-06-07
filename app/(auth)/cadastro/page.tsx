'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type ConviteInfo = { email: string; owner: string } | null

function CadastroConteudo() {
  const searchParams  = useSearchParams()
  const conviteToken  = searchParams.get('convite')

  const [email, setEmail]                           = useState('')
  const [senha, setSenha]                           = useState('')
  const [confirmarSenha, setConfirmarSenha]         = useState('')
  const [erro, setErro]                             = useState('')
  const [sucesso, setSucesso]                       = useState(false)
  const [carregando, setCarregando]                 = useState(false)
  const [convite, setConvite]                       = useState<ConviteInfo>(null)
  const [conviteErro, setConviteErro]               = useState('')
  const [carregandoConvite, setCarregandoConvite]   = useState(!!conviteToken)

  useEffect(() => {
    if (!conviteToken) return
    fetch(`/api/convite/${conviteToken}`)
      .then(r => r.json())
      .then(d => { if (d.error) setConviteErro(d.error); else { setConvite(d); setEmail(d.email) } })
      .catch(() => setConviteErro('Não foi possível validar o convite.'))
      .finally(() => setCarregandoConvite(false))
  }, [conviteToken])

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 8)         { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
    setCarregando(true)

    if (!conviteToken) {
      const verificacao = await fetch('/api/auth/verificar-trial', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      }).then(r => r.json()).catch(() => ({ permitido: true }))

      if (!verificacao.permitido) {
        setErro(verificacao.mensagem ?? 'Não foi possível criar a conta.')
        setCarregando(false)
        return
      }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback?next=/onboarding` },
    })

    if (error) {
      const msg = error.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErro('Este e-mail já está cadastrado. Use "Entrar" para acessar sua conta.')
      } else if (msg.includes('rate limit') || msg.includes('over_email')) {
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

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErro('Este e-mail já está cadastrado. Use "Entrar" para acessar sua conta.')
      setCarregando(false)
      return
    }

    if (conviteToken && data.user) {
      const res = await fetch(`/api/convite/${conviteToken}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: data.user.id }),
      })
      if (!res.ok) {
        const d = await res.json()
        setErro(d.error ?? 'Erro ao aceitar convite.')
        setCarregando(false)
        return
      }
    }

    setSucesso(true)
    setCarregando(false)
  }

  /* ── Estado: convite inválido ── */
  if (conviteToken && !carregandoConvite && conviteErro) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-10 font-sans">
        <div className="max-w-[400px] w-full bg-white rounded-3xl px-10 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8]">
          <div className="text-[40px] mb-5">⚠️</div>
          <h2 className="text-[22px] font-bold text-[#1A1A1C] mb-3">Convite inválido</h2>
          <p className="text-sm text-[#9AA0A6] mb-7">{conviteErro}</p>
          <Link href="/login" className="block py-3.5 rounded-xl bg-[#6B0F1A] text-white text-sm font-bold text-center no-underline">
            Ir para o login →
          </Link>
        </div>
      </div>
    )
  }

  /* ── Estado: sucesso ── */
  if (sucesso) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-10 font-sans">
        <div className="max-w-[480px] w-full bg-white rounded-3xl px-10 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#D5D2C8]">
          <div className="w-16 h-16 rounded-full bg-[rgba(107,15,26,0.08)] flex items-center justify-center mx-auto mb-6 text-[28px]">
            {conviteToken ? '✅' : '✉'}
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1C] mb-3">
            {conviteToken ? 'Conta criada com sucesso!' : 'Verifique seu e-mail'}
          </h2>
          <p className="text-[15px] text-[#9AA0A6] leading-relaxed mb-2">
            {conviteToken
              ? <><span>Sua conta foi criada e vinculada à equipe de </span><strong className="text-[#1A1A1C]">{convite?.owner}</strong>. Você já pode fazer login.</>
              : <><span>Enviamos um link de confirmação para </span><strong className="text-[#1A1A1C]">{email}</strong></>
            }
          </p>
          {!conviteToken && (
            <>
              <p className="text-sm text-[#9AA0A6] mb-8">
                Clique no link para ativar sua conta. Você será direcionado para completar os dados da empresa.
              </p>
              <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#D5D2C8] mb-6 text-left">
                <p className="text-[13px] text-[#4a4a4d] m-0 leading-relaxed">
                  💡 <strong>Não encontrou o e-mail?</strong> Verifique a pasta de spam ou lixo eletrônico.
                </p>
              </div>
            </>
          )}
          <Link href="/login" className="block py-3.5 rounded-xl bg-[#6B0F1A] text-white text-sm font-bold text-center no-underline">
            Ir para o login →
          </Link>
        </div>
      </div>
    )
  }

  /* ── Formulário principal ── */
  return (
    <div className="min-h-screen flex font-sans">

      {/* Painel esquerdo — oculto em mobile */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-[#1A1A1C] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#6B0F1A] opacity-20 blur-[60px]" />
        <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A65A] opacity-[0.08] blur-[80px]" />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-[12px] border border-[rgba(201,166,90,0.3)]">ML</div>
            <span className="text-white font-semibold text-[15px]">Monitor de Licitações</span>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#C9A65A] mb-4">
            {convite ? `Convidado por ${convite.owner}` : 'Sete dias grátis · sem cartão de crédito'}
          </div>
          <h2 className="text-[38px] font-normal text-white leading-snug mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            O governo compra o que você vende.
            <br /><span className="text-[#C9A65A] italic">Saiba quando, antes de todos.</span>
          </h2>
          <p className="text-sm text-[rgba(255,255,255,0.4)] mb-7 leading-relaxed">
            {convite
              ? 'Você foi convidado para o Monitor de Licitações. Crie sua senha para entrar.'
              : 'Cadastre-se agora e amanhã já recebe as primeiras oportunidades cruzadas com o perfil da sua empresa.'
            }
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🔀', titulo: 'Cruzamento inteligente de dados', desc: 'Cruzamos automaticamente o que o governo publica em todos os portais com o perfil de produtos da sua empresa.' },
              { icon: '📬', titulo: 'Alertas todos os dias úteis', desc: 'Sua equipe recebe por e-mail, Telegram e WhatsApp as oportunidades filtradas — dentro do horário comercial.' },
              { icon: '🏛️', titulo: 'Cobertura nacional completa', desc: 'Prefeituras, estados, governo federal — mais de 5.500 municípios rastreados diariamente.' },
              { icon: '⚡', titulo: 'Pronto em dois minutos', desc: 'Cadastre-se, informe o que sua empresa vende e o monitoramento começa imediatamente.' },
            ].map(b => (
              <div key={b.titulo} className="flex gap-3.5 items-start">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(201,166,90,0.1)] border border-[rgba(201,166,90,0.15)] flex items-center justify-center text-base shrink-0">{b.icon}</div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">{b.titulo}</div>
                  <div className="text-[rgba(255,255,255,0.4)] text-[13px] leading-relaxed">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Depoimento */}
        <div className="relative p-5 bg-[rgba(201,166,90,0.06)] border border-[rgba(201,166,90,0.15)] rounded-2xl">
          <p className="text-[rgba(255,255,255,0.6)] text-[13px] italic leading-relaxed mb-2.5">
            &ldquo;O sistema cruzou nosso catálogo com os editais do estado e encontrou uma licitação de R$85.000 em notebooks que nunca teríamos visto. Fechamos o contrato em oito dias.&rdquo;
          </p>
          <span className="text-[#C9A65A] text-xs font-semibold">Distribuidora de TI — Belo Horizonte, MG</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6B0F1A] via-[#C9A65A] to-transparent" />
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#FAF6F0]">
        <div className="w-full max-w-[400px]">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden no-underline">
            <div className="w-9 h-9 rounded-[10px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-xs">ML</div>
            <span className="font-bold text-[15px] text-[#1A1A1C]">Monitor de Licitações</span>
          </Link>

          {convite && (
            <div className="bg-[rgba(107,15,26,0.06)] border border-[rgba(107,15,26,0.15)] rounded-2xl px-5 py-4 mb-6 flex gap-3 items-start">
              <span className="text-[22px] shrink-0">👋</span>
              <div>
                <div className="text-[13px] font-bold text-[#6B0F1A] mb-0.5">Você foi convidado!</div>
                <div className="text-[13px] text-[#4a4a4d] leading-relaxed">
                  <strong>{convite.owner}</strong> te convidou para acessar o Monitor de Licitações. Crie sua senha abaixo.
                </div>
              </div>
            </div>
          )}

          <div className="mb-7">
            <h1 className="text-[26px] font-extrabold text-[#1A1A1C] mb-1.5 tracking-tight">
              {convite ? 'Criar sua senha' : 'Comece a monitorar agora'}
            </h1>
            <p className="text-sm text-[#9AA0A6] leading-relaxed">
              {convite ? 'Defina uma senha para acessar sua conta.' : 'Sete dias grátis · sem cartão · cancele quando quiser'}
            </p>
          </div>

          {carregandoConvite ? (
            <div className="text-center py-10 text-[#9AA0A6]">Validando convite…</div>
          ) : (
            <form onSubmit={handleCadastro} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5">E-mail</label>
                <input
                  type="email" value={email}
                  onChange={e => !convite && setEmail(e.target.value)}
                  placeholder="seu@email.com" required readOnly={!!convite}
                  className={`w-full px-4 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)] ${convite ? 'bg-[#F5F2EE] cursor-default' : 'bg-white'}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5">Senha</label>
                <input
                  type="password" value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres" required
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] bg-white text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-[#4a4a4d] mb-1.5">Confirmar senha</label>
                <input
                  type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha" required
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#D5D2C8] bg-white text-sm text-[#1A1A1C] outline-none focus:border-[#6B0F1A] focus:ring-2 focus:ring-[rgba(107,15,26,0.1)]"
                />
              </div>

              {erro && (
                <div className="bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.2)] rounded-xl px-4 py-3 text-sm text-[#b91c1c]">
                  ⚠ {erro}
                </div>
              )}

              {!convite && (
                <div className="flex gap-4 flex-wrap">
                  {[['🔒', 'Dados seguros'], ['↩', 'Cancele sempre'], ['⚡', 'Ativação imediata']].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-1 text-xs text-[#9AA0A6]">
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit" disabled={carregando}
                className="w-full py-4 rounded-xl text-white text-base font-bold border-none mt-1"
                style={{ background: carregando ? '#9AA0A6' : '#6B0F1A', cursor: carregando ? 'not-allowed' : 'pointer' }}
              >
                {carregando ? 'Criando conta...' : convite ? 'Criar conta e entrar →' : 'Criar conta gratuita →'}
              </button>
            </form>
          )}

          <p className="text-center mt-5 text-[13px] text-[#9AA0A6]">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-[#6B0F1A] font-semibold no-underline">Entrar →</Link>
          </p>

          {!convite && (
            <div className="mt-8 p-4 bg-[rgba(107,15,26,0.04)] rounded-xl border border-[rgba(107,15,26,0.08)]">
              <p className="text-xs text-[#9AA0A6] m-0 text-center leading-relaxed">
                Ao criar sua conta, você concorda com nossos{' '}
                <Link href="/termos" className="text-[#6B0F1A] font-semibold no-underline">Termos de Uso</Link>
                {' '}e{' '}
                <Link href="/privacidade" className="text-[#6B0F1A] font-semibold no-underline">Política de Privacidade</Link>.
                {' '}Após os sete dias de teste, assine a partir de R$49,90/mês ou cancele sem nenhum custo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF6F0]" />}>
      <CadastroConteudo />
    </Suspense>
  )
}
