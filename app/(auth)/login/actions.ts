'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const redirectTo = formData.get('redirect') as string | null

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error) {
    const msg = error.message.includes('Email not confirmed')
      ? 'Confirme seu e-mail antes de entrar.'
      : error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')
        ? 'E-mail ou senha incorretos.'
        : 'Erro ao entrar: ' + error.message
    redirect(`/login?erro=${encodeURIComponent(msg)}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`)
  }

  redirect(redirectTo ?? '/dashboard')
}
