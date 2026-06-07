import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function DescadastrarPage({ searchParams }: Props) {
  const { email: emailEncoded } = await searchParams
  const email = emailEncoded ? decodeURIComponent(emailEncoded).toLowerCase().trim() : null

  if (email) {
    // Marcar como descadastrado via service_role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    await supabase
      .from('leads')
      .update({ status: 'descadastrado' })
      .eq('email', email)
      .eq('status', 'enviado') // só atualiza se foi enviado (para não reativar pendentes)

    // Se não encontrar por status 'enviado', tentar qualquer status
    await supabase
      .from('leads')
      .update({ status: 'descadastrado' })
      .eq('email', email)
      .neq('status', 'descadastrado')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '48px 40px', maxWidth: 480, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ width: 64, height: 64, background: '#6B0F1A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A65A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
          Descadastro confirmado
        </h1>
        {email && (
          <p style={{ color: '#666', fontSize: 15, marginBottom: 8 }}>
            O e-mail <strong>{email}</strong> foi removido da nossa lista de captação.
          </p>
        )}
        <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>
          Você não receberá mais comunicações nossas.
          Se mudar de ideia, pode criar uma conta gratuita a qualquer momento.
        </p>
        <a
          href="/"
          style={{ display: 'inline-block', background: '#6B0F1A', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 600 }}
        >
          Conhecer o Monitor de Licitações
        </a>
      </div>
    </div>
  )
}
