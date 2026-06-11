import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { enviarEmailBoasVindas } from '@/lib/emails/trial'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'signup' | 'email' | null
  const next = searchParams.get('next') ?? '/dashboard'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Fluxo token_hash (links de e-mail: recovery, signup, etc.)
  if (token_hash && type) {
    const { data: otpData, error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/update-password', request.url))
      }
      // Enviar e-mail de boas-vindas ao confirmar cadastro (não bloqueia o redirect)
      if (type === 'signup' || type === 'email') {
        const userEmail = otpData?.user?.email
        const userName  = otpData?.user?.user_metadata?.nome ?? ''
        if (userEmail) {
          enviarEmailBoasVindas(userEmail, userName).catch(err =>
            console.error('[callback] Erro ao enviar e-mail boas-vindas:', err)
          )
          // Marcar lead como 'usuario' para sair da fila de captação
          const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          ;(async () => {
            const { error } = await adminClient
              .from('leads')
              .update({ status: 'usuario' })
              .eq('email', userEmail)
              .not('status', 'in', '("descadastrado","invalido")')
            if (error) console.error('[callback] Erro ao marcar lead como usuario:', error.message)
          })()
        }
      }
      // Após confirmação de e-mail → onboarding direto
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return NextResponse.redirect(new URL('/login?erro=link_expirado', request.url))
  }

  // Fluxo code (OAuth, PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?erro=link_invalido', request.url))
}
