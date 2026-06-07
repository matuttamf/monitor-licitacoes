/**
 * Página de descadastro de e-mails de captação.
 *
 * URL segura: /descadastrar?token={lead.id}  (UUID não-guessável)
 * - Marca o lead como 'descadastrado' com timestamp
 * - ignoreDuplicates=true garante que o mesmo CNPJ nunca será re-inserido
 *   com status diferente — registro fica bloqueado permanentemente
 */

import { createClient } from '@supabase/supabase-js'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function DescadastrarPage({ searchParams }: Props) {
  const { token } = await searchParams

  let email: string | null = null
  let sucesso = false
  let invalido = false

  if (token) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Buscar lead pelo ID (token = lead.id)
    const { data: lead } = await supabase
      .from('leads')
      .select('id, email, status')
      .eq('id', token)
      .maybeSingle()

    if (!lead) {
      invalido = true
    } else if (lead.status === 'descadastrado') {
      // Já estava descadastrado — mostrar confirmação sem alterar
      email = lead.email
      sucesso = true
    } else {
      email = lead.email
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'descadastrado',
          descadastrado_em: new Date().toISOString(),
        })
        .eq('id', token)
      sucesso = !error
    }
  } else {
    invalido = true
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

        {sucesso ? (
          <>
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
                O e-mail <strong>{email}</strong> foi removido da nossa lista.
              </p>
            )}
            <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>
              Você não receberá mais nenhum e-mail de captação nosso.<br />
              Se mudar de ideia, pode criar uma conta gratuita a qualquer momento.
            </p>
          </>
        ) : invalido ? (
          <>
            <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
              Link inválido ou expirado
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>
              Use o link de descadastro direto do e-mail que recebeu.
            </p>
          </>
        ) : null}

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
