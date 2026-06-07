import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/verificar-email
 * Verifica se um e-mail está cadastrado (via service role → auth.users).
 * Retorna apenas { exists: boolean } — não expõe dados do usuário.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // getUserByEmail é o método direto da admin API do Supabase
    const { data, error } = await supabase.auth.admin.getUserByEmail(
      email.toLowerCase().trim()
    )

    if (error || !data?.user) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
