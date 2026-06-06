'use client'

import { useState } from 'react'
import LogoutButton from '@/app/(dashboard)/components/LogoutButton'

const PLANOS = [
  {
    id: 'basic',
    nome: 'Basic',
    preco: '49,90',
    destaque: false,
    descricao: 'Ideal para começar',
    itens: ['20 palavras-chave monitoradas', '1 usuário', 'Alertas por e-mail', 'Busca manual no painel', 'Suporte via WhatsApp'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: '97,90',
    destaque: false,
    descricao: 'Para quem fornece ativamente ao governo',
    itens: ['Palavras-chave ilimitadas', '1 usuário', 'Alertas por e-mail', 'Alertas por Telegram', 'Alertas por WhatsApp', 'Busca manual no painel', 'Suporte via WhatsApp'],
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: '197,90',
    destaque: true,
    descricao: 'Para equipes comerciais',
    itens: ['Palavras-chave ilimitadas', 'Até 5 usuários', 'Alertas por e-mail', 'Alertas por Telegram', 'Alertas por WhatsApp', 'Busca manual no painel', 'Suporte prioritário via WhatsApp'],
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    preco: '497',
    destaque: false,
    descricao: 'Para grandes operações',
    itens: ['Palavras-chave ilimitadas', 'Até 15 usuários', 'Alertas por e-mail', 'Alertas por Telegram', 'Alertas por WhatsApp', 'Busca manual no painel', 'Relatório semanal detalhado', 'Suporte dedicado'],
  },
]

export default function ExpiradoPage() {
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  async function handleAssinar(planoId: string) {
    setLoadingPlano(planoId)
    setErro('')
    try {
      const res = await fetch('/api/assinatura/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar assinatura')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar. Tente novamente.')
    } finally {
      setLoadingPlano(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans">

      {/* Banner */}
      <div className="bg-[#6B0F1A] px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <span className="text-lg">⏰</span>
          <span className="text-[15px] font-bold text-white">Seu período de teste encerrou</span>
          <span className="text-sm text-[rgba(255,255,255,0.7)]">— Escolha um plano para continuar monitorando licitações</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#1A1A1C] px-6 md:px-10 py-8 md:py-10 text-center">
        <div className="w-[52px] h-[52px] rounded-[14px] bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-black text-sm mx-auto mb-6">
          ML
        </div>
        <h1 className="text-3xl md:text-[38px] font-normal text-white mb-3.5 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
          Reative seu acesso
        </h1>
        <p className="text-base text-[rgba(255,255,255,0.5)] max-w-[480px] mx-auto leading-relaxed">
          Suas palavras-chave e configurações estão salvas. Assine agora e volte a receber alertas de licitações imediatamente.
        </p>
        <div className="flex justify-center gap-6 md:gap-7 mt-7 flex-wrap">
          {[['🔒', 'Pagamento seguro'], ['↩', 'Cancele quando quiser'], ['⚡', 'Ativação imediata']].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-1.5 text-[rgba(255,255,255,0.35)] text-sm">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANOS.map(p => (
          <div
            key={p.id}
            className={`rounded-[20px] p-7 relative flex flex-col ${
              p.destaque
                ? 'bg-[#6B0F1A] border-2 border-[#C9A65A] shadow-[0_20px_60px_rgba(107,15,26,0.3)] lg:-translate-y-2'
                : 'bg-white border border-[#D5D2C8] shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            }`}
          >
            {p.destaque && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A65A] text-[#1A1A1C] text-[11px] font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap">
                ⭐ MAIS POPULAR
              </div>
            )}

            <div className={`text-[11px] font-bold tracking-widest uppercase mb-1.5 text-center ${p.destaque ? 'text-[#C9A65A]' : 'text-[#9AA0A6]'}`}>{p.nome}</div>
            <div className={`text-sm mb-5 text-center ${p.destaque ? 'text-[rgba(255,255,255,0.6)]' : 'text-[#9AA0A6]'}`}>{p.descricao}</div>

            <div className="flex items-end justify-center gap-1 mb-7">
              <span className={`text-sm font-medium mb-1.5 ${p.destaque ? 'text-[rgba(255,255,255,0.5)]' : 'text-[#9AA0A6]'}`}>R$</span>
              <span className={`text-[44px] font-black leading-none ${p.destaque ? 'text-white' : 'text-[#1A1A1C]'}`}>
                {p.preco.split(',')[0]}
                {p.preco.includes(',') && (
                  <span className="text-2xl font-black">,{p.preco.split(',')[1]}</span>
                )}
              </span>
              <span className={`text-sm mb-1.5 ${p.destaque ? 'text-[rgba(255,255,255,0.4)]' : 'text-[#9AA0A6]'}`}>/mês</span>
            </div>

            <div className={`h-px mb-6 ${p.destaque ? 'bg-[rgba(201,166,90,0.2)]' : 'bg-[#F0EDE8]'}`} />

            <div className="flex-1 mb-7">
              {p.itens.map(item => (
                <div key={item} className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${p.destaque ? 'bg-[rgba(201,166,90,0.2)]' : 'bg-[rgba(107,15,26,0.08)]'}`}>
                    <span className={`text-[10px] font-bold ${p.destaque ? 'text-[#C9A65A]' : 'text-[#6B0F1A]'}`}>✓</span>
                  </div>
                  <span className={`text-sm ${p.destaque ? 'text-[rgba(255,255,255,0.85)]' : 'text-[#4a4a4d]'}`}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAssinar(p.id)}
              disabled={loadingPlano !== null}
              className={`w-full py-3.5 rounded-xl border-none text-[15px] font-bold transition-opacity ${
                p.destaque ? 'bg-[#C9A65A] text-[#1A1A1C]' : 'bg-[#6B0F1A] text-white'
              } ${loadingPlano !== null && loadingPlano !== p.id ? 'opacity-50 cursor-not-allowed' : loadingPlano === p.id ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {loadingPlano === p.id ? 'Aguarde...' : 'Assinar agora →'}
            </button>
          </div>
        ))}
      </div>

      {erro && (
        <div className="max-w-[600px] mx-auto -mt-6 mb-10 px-6">
          <div className="bg-[rgba(185,28,28,0.08)] border border-[rgba(185,28,28,0.2)] rounded-xl px-5 py-3.5 text-sm text-[#b91c1c] text-center">{erro}</div>
        </div>
      )}

      {/* Contato + Logout */}
      <div className="max-w-[400px] mx-auto px-6 pb-16 flex flex-col gap-3 items-center">
        <a
          href="https://wa.me/5531998317066?text=Olá! Quero reativar minha conta no Monitor de Licitações."
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-xl text-center text-sm font-semibold text-[#16a34a] bg-[rgba(37,211,102,0.08)] border border-[rgba(37,211,102,0.2)] no-underline"
        >
          💬 Falar no WhatsApp
        </a>
        <div className="w-full">
          <LogoutButton />
        </div>
      </div>

    </div>
  )
}
