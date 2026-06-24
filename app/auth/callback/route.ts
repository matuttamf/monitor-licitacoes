import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { enviarEmailBoasVindas } from '@/lib/emails/trial'
import { notificarAdminNovoCadastro } from '@/lib/alerts/whatsapp'
import { notificarAdminNovoCadastro as notificarAdminEmail } from '@/lib/emails/admin'
import { resolverRef } from '@/lib/afiliados'

export async function GET(request: NextRequest) {
  const qs         = new URL(request.url).searchParams
  const code       = qs.get('code')
  const token_hash = qs.get('token_hash')
  const type       = qs.get('type') as 'recovery' | 'signup' | 'email' | null
  const next       = qs.get('next') ?? '/dashboard'

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
        const userId    = otpData?.user?.id
        const meta      = otpData?.user?.user_metadata ?? {}
        const userName  = meta.nome ?? ''

        if (userEmail && userId) {
          enviarEmailBoasVindas(userEmail, userName).catch(err =>
            console.error('[callback] Erro ao enviar e-mail boas-vindas:', err)
          )
          notificarAdminNovoCadastro(userEmail, userName).catch(() => {})
          notificarAdminEmail(userEmail, userName).catch(() => {})

          const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          // Marcar lead como 'usuario' para sair da fila de captação
          ;(async () => {
            const { error } = await adminClient
              .from('leads')
              .update({ status: 'usuario' })
              .eq('email', userEmail)
              .not('status', 'in', '("descadastrado","invalido")')
            if (error) console.error('[callback] Erro ao marcar lead como usuario:', error.message)
          })()

          // Gravar atribuição de campanha/UTM no profile (primeira origem vence)
          ;(async () => {
            const ref        = meta.ref        as string | undefined
            const utmSource  = meta.utm_source as string | undefined
            const utmMedium  = meta.utm_medium as string | undefined
            const utmCampaign = meta.utm_campaign as string | undefined
            const utmContent = meta.utm_content as string | undefined

            if (!ref && !utmSource && !utmMedium && !utmCampaign && !utmContent) return

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const atribUpdate: Record<string, any> = {}
            if (utmSource)   atribUpdate.utm_source   = utmSource
            if (utmMedium)   atribUpdate.utm_medium   = utmMedium
            if (utmCampaign) atribUpdate.utm_campaign = utmCampaign
            if (utmContent)  atribUpdate.utm_content  = utmContent

            // Se veio ?ref=CODIGO: resolve para campanha (e afiliado, se for link de afiliado)
            if (ref) {
              const resolvido = await resolverRef(adminClient, ref)
              if (resolvido) {
                atribUpdate.campanha_id = resolvido.campanhaId
                if (resolvido.tipo === 'afiliado') atribUpdate.afiliado_id = resolvido.afiliadoId
              } else {
                atribUpdate.utm_source = atribUpdate.utm_source ?? ref // fallback: guarda como source
              }
            }

            if (Object.keys(atribUpdate).length) {
              const { error } = await adminClient
                .from('profiles')
                .update(atribUpdate)
                .eq('id', userId)
                .is('campanha_id', null)   // primeira origem vence — não sobrescreve
              if (error) console.error('[callback] Erro ao gravar atribuição:', error.message)
              else console.log('[callback] Atribuição gravada:', { userId, ref, utmSource })
            }
          })()
        }
      }
      // Após confirmação de e-mail → respeita ?next= ou vai para onboarding
      return NextResponse.redirect(new URL(next === '/dashboard' ? '/onboarding' : next, request.url))
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
