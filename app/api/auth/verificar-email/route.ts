import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/verificar-email
 * Verifica se um e-mail está cadastrado em auth.users via Supabase Admin REST API.
 * Retorna apenas { exists: boolean } — não expõe dados do usuário.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email.toLowerCase().trim())}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )

    if (!res.ok) {
      console.error('[verificar-email] admin API error:', res.status)
      return NextResponse.json({ exists: true }) // fail-open
    }

    const json = await res.json()
    const exists = Array.isArray(json.users) && json.users.length > 0

    return NextResponse.json({ exists })
  } catch (e) {
    console.error('[verificar-email]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
