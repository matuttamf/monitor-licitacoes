'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Detecta ?code= na URL raiz (Supabase redireciona para Site URL em vez de /auth/callback).
// O createBrowserClient já troca o code automaticamente; aqui só esperamos o SIGNED_IN
// e redirecionamos conforme o perfil do usuário.
export function OAuthCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) return

    const supabase = createClient()

    async function redirectByProfile(userId: string) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('telefone')
        .eq('id', userId)
        .single()

      router.replace(profile?.telefone ? '/dashboard' : '/dados-contato')
    }

    // Pode ser que o Supabase já trocou o code antes deste effect rodar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectByProfile(session.user.id)
        return
      }

      // Ainda não trocou — aguarda o evento SIGNED_IN
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          subscription.unsubscribe()
          redirectByProfile(session.user.id)
        }
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return null
}
