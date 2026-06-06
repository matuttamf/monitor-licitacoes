'use client'

import { useState } from 'react'
import Link from 'next/link'

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

export default function AssinarPage() {
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
        if (data.error === 'Não autorizado') {
          window.location.href = `/checkout?plano=${planoId}`
          return
        }
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

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-10 py-4 bg-[rgba(250,246,240,0.95)] border-b border-[rgba(201,166,90,0.15)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-[#6B0F1A] text-[#C9A65A] flex items-center justify-center font-bold text-[11px]">ML</div>
          <span className="font-bold text-[15px] text-[#1A1A1C] hidden sm:block">Monitor de Licitações</span>
        </Link>
        <Link href="/login" className="text-sm text-[#6B0F1A] font-semibold no-underline">Já tenho conta →</Link>
      </header>

      {/* Hero */}
      <div className="bg-[#1A1A1C] px-6 md:px-10 py-14 md:py-20 text-center">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[rgba(201,166,90,0.1)] border border-[rgba(201,166,90,0.2)] text-[#C9A65A] text-xs font-semibold tracking-wider mb-5">
          7 DIAS GRÁTIS · SEM CARTÃO DE CRÉDITO
        </div>
        <h1 className="text-3xl md:text-[42px] font-normal text-white mb-4 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
          Escolha seu plano
        </h1>
        <p className="text-base md:text-[17px] text-[rgba(255,255,255,0.5)] max-w-[500px] mx-auto">
          Comece grátis por 7 dias. Depois, pague apenas se quiser continuar. Cancele quando quiser.
        </p>
        <div className="flex justify-center gap-6 md:gap-8 mt-8 flex-wrap">
          {[['🔒', 'Pagamento 100% seguro'], ['↩', 'Cancele a qualquer momento'], ['⚡', 'Ativação imediata']].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-1.5 text-[rgba(255,255,255,0.4)] text-sm">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-[1300px] mx-auto -mt-10 px-4 md:px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

        {/* Card trial */}
        <div className="bg-white border-2 border-[#C9A65A] rounded-[20px] p-7 relative shadow-[0_4px_20px_rgba(201,166,90,0.12)] flex flex-col">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A65A] text-[#1A1A1C] text-[11px] font-black px-4 py-1 rounded-full tracking-wider whitespace-nowrap">
            🎁 GRÁTIS
          </div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-[#9AA0A6] mb-1.5 text-center">Período de Teste</div>
          <div className="text-sm text-[#9AA0A6] mb-5 text-center">Experimente sem compromisso</div>
          <div className="flex items-end justify-center gap-1 mb-1">
            <span className="text-[44px] font-black text-[#1A1A1C] leading-none">7 dias</span>
          </div>
          <div className="text-sm text-[#9AA0A6] mb-7 text-center">grátis · sem cartão de crédito</div>
          <div className="h-px bg-[#F0EDE8] mb-6" />
          <div className="flex-1 mb-7">
            {['20 palavras-chave monitoradas', '1 usuário', 'Alertas por e-mail', 'Busca manual no painel', 'Suporte via WhatsApp'].map(item => (
              <div key={item} className="flex items-center gap-2.5 mb-2.5">
                <div className="w-[18px] h-[18px] rounded-full bg-[rgba(201,166,90,0.12)] flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-[#C9A65A] font-bold">✓</span>
                </div>
                <span className="text-sm text-[#4a4a4d]">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/cadastro" className="block w-full py-3.5 rounded-xl text-center text-[15px] font-bold bg-[#C9A65A] text-[#1A1A1C] no-underline mt-auto">
            Começar grátis →
          </Link>
        </div>

        {/* Cards pagos */}
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
              disabled={loadingPlano === p.id}
              className={`w-full py-3.5 rounded-xl border-none text-[15px] font-bold cursor-pointer transition-opacity ${
                p.destaque ? 'bg-[#C9A65A] text-[#1A1A1C]' : 'bg-[#6B0F1A] text-white'
              } ${loadingPlano === p.id ? 'opacity-70 cursor-not-allowed' : 'opacity-100'}`}
            >
              {loadingPlano === p.id ? 'Aguarde...' : 'Assinar agora →'}
            </button>
          </div>
        ))}
      </div>

      {erro && (
        <div className="max-w-[600px] mx-auto -mt-10 mb-10 px-6">
          <div className="bg-[rgba(185,28,28,0.08)] border border-[rgba(185,28,28,0.2)] rounded-xl px-5 py-3.5 text-sm text-[#b91c1c] text-center">{erro}</div>
        </div>
      )}

      {/* Depoimentos */}
      <div className="bg-white border-t border-[#D5D2C8] px-6 md:px-10 py-16">
        <p className="text-center text-[11px] font-bold tracking-[0.08em] uppercase text-[#9AA0A6] mb-10">Por que empresas escolhem o Monitor</p>
        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { texto: '"Antes perdíamos editais por falta de informação. Agora recebemos alertas em tempo real e chegamos na frente."', autor: 'Distribuidora de móveis, MG' },
            { texto: '"Configurei em 5 minutos e no segundo dia já tinha uma licitação de notebook do estado que não sabia que existia."', autor: 'Empresa de TI, SP' },
            { texto: '"R$ 197/mês é barato demais comparado com o que ganhamos nas licitações que encontramos pelo sistema."', autor: 'Fornecedor de limpeza, RJ' },
          ].map((t, i) => (
            <div key={i} className="bg-[#FAF6F0] rounded-2xl p-6 border border-[#D5D2C8]">
              <div className="text-[28px] text-[#C9A65A] mb-3">❝</div>
              <p className="text-sm text-[#4a4a4d] leading-[1.7] mb-4 italic">{t.texto}</p>
              <p className="text-xs text-[#9AA0A6] font-bold m-0">{t.autor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-6 md:px-10 py-16 max-w-[700px] mx-auto">
        <h2 className="text-2xl md:text-[28px] font-normal text-center mb-10 text-[#1A1A1C]" style={{ fontFamily: 'Georgia, serif' }}>Dúvidas frequentes</h2>
        {[
          ['Preciso de cartão de crédito para testar?', 'Não. Os 7 dias de teste são 100% gratuitos. Você só é cobrado se decidir continuar.'],
          ['Como funciona o cancelamento?', 'Você pode cancelar a qualquer momento diretamente pelo painel, sem multas ou burocracia.'],
          ['Posso mudar de plano depois?', 'Sim. Você pode fazer upgrade ou downgrade do seu plano quando quiser.'],
        ].map(([q, a]) => (
          <details key={q as string} className="border-b border-[#D5D2C8]">
            <summary className="py-5 cursor-pointer font-semibold text-[15px] text-[#1A1A1C] list-none flex justify-between items-center">
              {q} <span className="text-[#6B0F1A] text-xl font-light shrink-0 ml-4">+</span>
            </summary>
            <p className="pb-5 m-0 text-sm text-[#9AA0A6] leading-[1.7]">{a}</p>
          </details>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1C] px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 flex-wrap">
        <span className="text-sm text-[rgba(255,255,255,0.3)]">© {new Date().getFullYear()} Monitor de Licitações · Matutta Soluções Digitais</span>
        <div className="flex gap-6">
          <Link href="/" className="text-sm text-[rgba(255,255,255,0.4)] no-underline">Início</Link>
          <Link href="/login" className="text-sm text-[rgba(255,255,255,0.4)] no-underline">Entrar</Link>
          <Link href="/privacidade" className="text-sm text-[rgba(255,255,255,0.4)] no-underline">Privacidade</Link>
          <Link href="/termos" className="text-sm text-[rgba(255,255,255,0.4)] no-underline">Termos</Link>
        </div>
      </footer>
    </div>
  )
}
