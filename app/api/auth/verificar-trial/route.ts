import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Normaliza e-mail para detectar reutilização de trial via alias/pontos
// Gmail: user.name+alias@gmail.com → username@gmail.com
// Outros: apenas remove +alias e normaliza lowercase
export function normalizarEmail(email: string): string {
  const lower = email.toLowerCase().trim()
  const [local, domain] = lower.split('@')
  if (!local || !domain) return lower

  // Remove +alias (universal)
  const semAlias = local.split('+')[0]

  // Remove pontos apenas no Gmail (em outros provedores pontos são significativos)
  const localNorm = domain === 'gmail.com'
    ? semAlias.replace(/\./g, '')
    : semAlias

  return `${localNorm}@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ permitido: true })

    const emailNorm = normalizarEmail(email)
    const supabase  = await createServiceClient()

    // Verificar se e-mail normalizado já usou trial ou tem conta ativa
    const { data } = await supabase
      .from('profiles')
      .select('id, status, email_normalizado')
      .eq('email_normalizado', emailNorm)
      .in('status', ['trial', 'active', 'expired'])
      .limit(1)

    if (data && data.length > 0) {
      return NextResponse.json({
        permitido: false,
        motivo: 'trial_usado',
        mensagem: 'Este e-mail já utilizou o período de teste gratuito. Escolha um plano para continuar.',
      })
    }

    return NextResponse.json({ permitido: true, emailNormalizado: emailNorm })
  } catch {
    // Em caso de erro, não bloqueamos o cadastro
    return NextResponse.json({ permitido: true })
  }
}
