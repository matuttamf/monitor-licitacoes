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

    const normalizado = email.toLowerCase().trim()
    const supabase = await createServiceClient()

    // listUsers é paginado — para SaaS pequeno, 1000 cobre todos os usuários
    // Busca em páginas até encontrar o e-mail ou esgotar os resultados
    let page = 1
    const perPage = 1000
    let found = false

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

      if (error || !data?.users?.length) break

      found = data.users.some(u => u.email?.toLowerCase() === normalizado)
      if (found) break

      // Se retornou menos que perPage, não há mais páginas
      if (data.users.length < perPage) break
      page++
    }

    return NextResponse.json({ exists: found })
  } catch (e) {
    console.error('[verificar-email]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
