import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

  // Helper: descobre para onde redirecionar após confirmar e-mail
  async function redirectAposConfirmacao() {
    // Se next foi passado explicitamente (ex: recovery), usa ele
    if (next !== '/dashboard') return new URL(next, request.url)

    // Verifica se o perfil já tem CNPJ (completar-cadastro já foi feito)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('cnpj')
        .eq('id', user.id)
        .single()
      if (!profile?.cnpj) return new URL('/completar-cadastro', request.url)
    }
    return new URL('/dashboard', request.url)
  }

  // Fluxo token_hash (links de e-mail: recovery, signup, etc.)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/update-password', request.url))
      }
      return NextResponse.redirect(await redirectAposConfirmacao())
    }
    return NextResponse.redirect(new URL('/login?erro=link_expirado', request.url))
  }

  // Fluxo code (OAuth, PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(await redirectAposConfirmacao())
    }
  }

  return NextResponse.redirect(new URL('/login?erro=link_invalido', request.url))
}
