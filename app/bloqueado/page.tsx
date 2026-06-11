'use client'

import LogoutButton from '@/app/(dashboard)/components/LogoutButton'

export default function BloqueadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#FAF6F0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 420, width: '100%', background: 'white', borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #E8E0D5' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: '#1A1A1C' }}>Conta suspensa</h1>
        <p style={{ margin: '0 0 32px', fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
          O acesso à sua conta foi suspenso pelo administrador.<br />
          Entre em contato pelo suporte para mais informações.
        </p>
        <a
          href="https://wa.me/5531998317066?text=Olá! Minha conta no Monitor de Licitações foi suspensa."
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', background: '#25D366', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 12, marginBottom: 16 }}
        >
          Falar no WhatsApp
        </a>
        <div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
