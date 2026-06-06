'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANOS = [
  {
    id: 'basic',
    nome: 'Basic',
    preco: '49,90',
    destaque: false,
    cor: '#8B1E2D',
    descricao: 'Ideal para começar',
    keywords: 'Até 10 palavras-chave',
    usuarios: '1 usuário',
    itens: ['10 palavras-chave monitoradas', '1 usuário', 'Alertas por e-mail', 'Alertas por Telegram', 'Busca manual no painel', 'Suporte via WhatsApp'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: '97,90',
    destaque: false,
    cor: '#6B0F1A',
    descricao: 'Para vendedores ativos',
    keywords: 'Palavras-chave ilimitadas',
    usuarios: '1 usuário',
    itens: ['Palavras-chave ilimitadas', '1 usuário', 'Alertas por e-mail', 'Alertas por Telegram', 'Alertas por WhatsApp', 'Busca manual no painel', 'Suporte via WhatsApp'],
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: '197,90',
    destaque: true,
    cor: '#6B0F1A',
    descricao: 'Para equipes comerciais',
    keywords: 'Palavras-chave ilimitadas',
    usuarios: 'Até 5 usuários',
    itens: ['Palavras-chave ilimitadas', 'Até 5 usuários', 'Alertas por e-mail', 'Alertas por Telegram', 'Alertas por WhatsApp', 'Busca manual no painel', 'Suporte prioritário via WhatsApp'],
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    preco: '497',
    destaque: false,
    cor: '#1A1A1C',
    descricao: 'Para grandes operações',
    keywords: 'Palavras-chave ilimitadas',
    usuarios: 'Até 15 usuários',
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
          window.location.href = `/cadastro?plano=${planoId}`
          return
        }
        throw new Error(data.error || 'Erro ao criar assinatura')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (e: any) {
      setErro(e.message || 'Erro ao processar. Tente novamente.')
    } finally {
      setLoadingPlano(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', background: 'rgba(250,246,240,0.95)', borderBottom: '1px solid rgba(201,166,90,0.15)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#6B0F1A', color: '#C9A65A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>ML</div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A1C' }}>Monitor de Licitações</span>
        </Link>
        <Link href="/login" style={{ fontSize: '14px', color: '#6B0F1A', fontWeight: 600, textDecoration: 'none' }}>Já tenho conta →</Link>
      </header>

      {/* Hero dos planos */}
      <div style={{ background: '#1A1A1C', padding: '60px 40px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '999px', background: 'rgba(201,166,90,0.1)', border: '1px solid rgba(201,166,90,0.2)', color: '#C9A65A', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '20px' }}>
          7 DIAS GRÁTIS · SEM CARTÃO DE CRÉDITO
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: 400, color: 'white', margin: '0 0 16px', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>
          Escolha seu plano
        </h1>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          Comece grátis por 7 dias. Depois, pague apenas se quiser continuar. Cancele quando quiser.
        </p>

        {/* Garantia */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '32px', flexWrap: 'wrap' }}>
          {[['🔒', 'Pagamento 100% seguro'], ['↩', 'Cancele a qualquer momento'], ['⚡', 'Ativação imediata']].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de planos */}
      <div style={{ maxWidth: '1100px', margin: '-40px auto 0', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
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
              disabled={loadingPlano === p.id}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: loadingPlano === p.id ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 700,
                background: p.destaque ? '#C9A65A' : '#6B0F1A',
                color: p.destaque ? '#1A1A1C' : 'white',
                opacity: loadingPlano === p.id ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loadingPlano === p.id ? 'Aguarde...' : 'Começar 7 dias grátis'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: p.destaque ? 'rgba(255,255,255,0.35)' : '#9AA0A6', marginTop: '10px', marginBottom: 0 }}>
              Sem cartão de crédito agora
            </p>
          </div>
        ))}
      </div>

      {erro && (
        <div style={{ maxWidth: '600px', margin: '-40px auto 40px', padding: '0 24px' }}>
          <div style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', color: '#b91c1c', textAlign: 'center' }}>{erro}</div>
        </div>
      )}

      {/* Prova social */}
      <div style={{ background: 'white', borderTop: '1px solid #D5D2C8', padding: '60px 40px' }}>
        <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA0A6', marginBottom: '40px' }}>Por que empresas escolhem o Monitor</p>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {[
            { texto: '"Antes perdíamos editais por falta de informação. Agora recebemos alertas toda manhã e chegamos na frente."', autor: 'Distribuidora de móveis, MG' },
            { texto: '"Configurei em 5 minutos e no segundo dia já tinha uma licitação de notebook do estado que não sabia que existia."', autor: 'Empresa de TI, SP' },
            { texto: '"R$ 197/mês é barato demais comparado com o que ganhamos nas licitações que encontramos pelo sistema."', autor: 'Fornecedor de limpeza, RJ' },
          ].map((t, i) => (
            <div key={i} style={{ background: '#FAF6F0', borderRadius: '16px', padding: '24px', border: '1px solid #D5D2C8' }}>
              <div style={{ fontSize: '28px', color: '#C9A65A', marginBottom: '12px' }}>❝</div>
              <p style={{ fontSize: '14px', color: '#4a4a4d', lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic' }}>{t.texto}</p>
              <p style={{ fontSize: '12px', color: '#9AA0A6', margin: 0, fontWeight: 600 }}>{t.autor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ rápido */}
      <div style={{ padding: '60px 40px', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 400, textAlign: 'center', marginBottom: '40px', fontFamily: 'Georgia, serif', color: '#1A1A1C' }}>Dúvidas frequentes</h2>
        {[
          ['Preciso de cartão de crédito para testar?', 'Não. Os 7 dias de teste são 100% gratuitos. Você só é cobrado se decidir continuar.'],
          ['Como funciona o cancelamento?', 'Você pode cancelar a qualquer momento diretamente pelo painel, sem multas ou burocracia.'],
          ['Posso mudar de plano depois?', 'Sim. Você pode fazer upgrade ou downgrade do seu plano quando quiser.'],
        ].map(([q, a]) => (
          <div key={q as string} style={{ borderBottom: '1px solid #D5D2C8', padding: '20px 0' }}>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: '#1A1A1C', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                {q} <span style={{ color: '#6B0F1A' }}>+</span>
              </summary>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#9AA0A6', lineHeight: 1.7 }}>{a}</p>
            </details>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: '#1A1A1C', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© 2025 Monitor de Licitações · Matutta</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Início</Link>
          <Link href="/login" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Entrar</Link>
        </div>
      </div>
    </div>
  )
}
