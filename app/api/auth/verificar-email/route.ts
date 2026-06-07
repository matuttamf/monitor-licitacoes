import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/verificar-email
 * Verifica se um e-mail está cadastrado em auth.users via service role.
 * Retorna apenas { exists: boolean } — não expõe dados do usuário.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Consulta auth.users diretamente com service role
    const { data, error } = await supabase
      .schema('auth')
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (error) {
      console.error('[verificar-email]', error.message)
      return NextResponse.json({ exists: true }) // fail-open: não bloqueia o usuário legítimo
    }

    return NextResponse.json({ exists: !!data })
  } catch (e) {
    console.error('[verificar-email]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
