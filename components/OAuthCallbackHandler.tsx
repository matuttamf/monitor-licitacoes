'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Detecta ?code= na URL raiz (quando Supabase redireciona para Site URL em vez de /auth/callback)
// e processa o OAuth code exchange no lado do cliente.
export function OAuthCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) return

    async function handle() {
      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code!)
      if (error || !data.session) {
        router.replace('/login?erro=oauth_falhou')
        return
      }

      // Verificar se tem telefone no profile
      const userId = data.session.user.id
      const { data: profile } = await supabase
        .from('profiles')
        .select('telefone')
        .eq('id', userId)
        .single()

      if (!profile?.telefone) {
        router.replace('/dados-contato')
      } else {
        router.replace('/dashboard')
      }
    }

    handle()
  }, [code, router])

  return null
}
