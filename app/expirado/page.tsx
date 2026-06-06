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
    itens: ['10 palavras-chave monitoradas', '1 usuário', 'Alertas por e-mail', 'Busca manual no painel', 'Suporte via WhatsApp'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: '97,90',
    destaque: false,
    descricao: 'Para vendedores ativos',
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
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Banner de aviso */}
      <div style={{ background: '#6B0F1A', padding: '18px 32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '18px' }}>⏰</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
            Seu período de teste encerrou
          </span>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            — Escolha um plano para continuar monitorando licitações
          </span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: '#1A1A1C', padding: '52px 40px 72px', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', margin: '0 auto 24px' }}>
          ML
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: 400, color: 'white', margin: '0 0 14px', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>
          Reative seu acesso
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: '0 auto', maxWidth: '480px', lineHeight: 1.6 }}>
          Suas palavras-chave e configurações estão salvas. Assine agora e volte a receber alertas de licitações imediatamente.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '28px', flexWrap: 'wrap' }}>
          {[['🔒', 'Pagamento seguro'], ['↩', 'Cancele quando quiser'], ['⚡', 'Ativação imediata']].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de planos */}
      <div style={{ maxWidth: '1100px', margin: '-40px auto 0', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {PLANOS.map(p => (
          <div
            key={p.id}
            style={{
              background: p.destaque ? '#6B0F1A' : 'white',
              border: p.destaque ? '2px solid #C9A65A' : '1px solid #D5D2C8',
              borderRadius: '20px',
              padding: '32px 28px',
              position: 'relative',
              boxShadow: p.destaque ? '0 20px 60px rgba(107,15,26,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
              transform: p.destaque ? 'translateY(-8px)' : 'none',
            }}
          >
            {p.destaque && (
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#C9A65A', color: '#1A1A1C', fontSize: '11px', fontWeight: 800, padding: '5px 16px', borderRadius: '999px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                ⭐ MAIS POPULAR
              </div>
            )}

            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.destaque ? '#C9A65A' : '#9AA0A6', marginBottom: '6px' }}>{p.nome}</div>
            <div style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.6)' : '#9AA0A6', marginBottom: '20px' }}>{p.descricao}</div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.5)' : '#9AA0A6', fontWeight: 500 }}>R$</span>
              <span style={{ fontSize: '44px', fontWeight: 800, color: p.destaque ? 'white' : '#1A1A1C', lineHeight: 1 }}>{p.preco}</span>
            </div>
            <div style={{ fontSize: '13px', color: p.destaque ? 'rgba(255,255,255,0.4)' : '#9AA0A6', marginBottom: '28px' }}>/mês · cobrado mensalmente</div>

            <div style={{ height: '1px', background: p.destaque ? 'rgba(201,166,90,0.2)' : '#F0EDE8', marginBottom: '24px' }} />

            <div style={{ marginBottom: '28px' }}>
              {p.itens.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: p.destaque ? 'rgba(201,166,90,0.2)' : 'rgba(107,15,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', color: p.destaque ? '#C9A65A' : '#6B0F1A', fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: '14px', color: p.destaque ? 'rgba(255,255,255,0.85)' : '#4a4a4d' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAssinar(p.id)}
              disabled={loadingPlano !== null}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: loadingPlano !== null ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 700,
                background: p.destaque ? '#C9A65A' : '#6B0F1A',
                color: p.destaque ? '#1A1A1C' : 'white',
                opacity: loadingPlano !== null && loadingPlano !== p.id ? 0.5 : loadingPlano === p.id ? 0.8 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loadingPlano === p.id ? 'Aguarde...' : 'Assinar agora →'}
            </button>
          </div>
        ))}
      </div>

      {erro && (
        <div style={{ maxWidth: '600px', margin: '-20px auto 40px', padding: '0 24px' }}>
          <div style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', color: '#b91c1c', textAlign: 'center' }}>{erro}</div>
        </div>
      )}

      {/* Contato + Logout */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px 60px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <a
          href="https://wa.me/5531998317066?text=Olá! Quero reativar minha conta no Monitor de Licitações."
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#16a34a', background: 'rgba(37,211,102,0.08)', border: '1.5px solid rgba(37,211,102,0.2)', textDecoration: 'none' }}
        >
          💬 Falar no WhatsApp
        </a>
<div style={{ width: '100%' }}>
          <LogoutButton />
        </div>
      </div>

    </div>
  )
}
