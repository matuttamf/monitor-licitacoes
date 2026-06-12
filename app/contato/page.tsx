'use client'

import { useState } from 'react'
import Link from 'next/link'

const ASSUNTOS = [
  'Suporte técnico',
  'Dúvida sobre planos',
  'Parceria comercial',
  'Cancelamento',
  'Sugestão de melhoria',
  'Outro',
]

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', assunto: ASSUNTOS[0], mensagem: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado]   = useState(false)
  const [erro, setErro]         = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      const res = await fetch('/api/contato', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setEnviado(true)
    } catch {
      setErro('Não foi possível enviar. Tente novamente ou envie um e-mail direto.')
    }
    setEnviando(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Logo / volta */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            ← Voltar ao início
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Fale Conosco</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>Responderemos em até 24 horas nos dias úteis.</p>
        </div>

        {enviado ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Mensagem enviada!</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Recebemos sua mensagem e retornaremos em breve.</p>
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: '12px', background: '#6B0F1A', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Ir para o painel
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px' }}>Nome</label>
                <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Seu nome"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px' }}>E-mail</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a', outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px' }}>Assunto</label>
              <select required value={form.assunto} onChange={e => setForm({ ...form, assunto: e.target.value })}
                style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a', background: 'white', outline: 'none' }}>
                {ASSUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px' }}>Mensagem</label>
              <textarea required rows={5} value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })}
                placeholder="Descreva sua dúvida, sugestão ou solicitação…"
                style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', color: '#0f172a', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {erro && (
              <p style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>{erro}</p>
            )}

            <button type="submit" disabled={enviando}
              style={{ padding: '13px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, color: 'white', background: enviando ? '#9ca3af' : '#6B0F1A', border: 'none', cursor: enviando ? 'not-allowed' : 'pointer' }}>
              {enviando ? 'Enviando…' : 'Enviar mensagem'}
            </button>

            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              Ou fale pelo WhatsApp:{' '}
              <a href="https://wa.me/5531998317066" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>
                Suporte
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
