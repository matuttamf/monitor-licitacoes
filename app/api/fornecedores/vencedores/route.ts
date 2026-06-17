import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { temFornecedores } from '@/lib/planos'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, status')
    .eq('id', user.id)
    .single()

  const plano  = profile?.plano  ?? 'basic'
  const status = profile?.status ?? 'trial'
  const isAdmin = user.email === ADMIN_EMAIL

  if (!isAdmin && !temFornecedores(plano)) {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }
  if (!isAdmin && status !== 'active') {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }

  const url       = new URL(request.url)
  const busca     = url.searchParams.get('q')?.trim()          ?? ''
  const regiao    = url.searchParams.get('regiao')?.trim()     ?? ''
  const anoInicio = url.searchParams.get('ano_inicio')?.trim() ?? ''
  const anoFim    = url.searchParams.get('ano_fim')?.trim()    ?? ''

  // Só passa UF (2 chars); macros como "Sudeste" não filtram no resultados_itens
  const uf = regiao.length === 2 ? regiao : null

  // Fallback: se não informou ano, usa últimos 24 meses
  const anoInicioNum = anoInicio ? parseInt(anoInicio, 10) : null
  const anoFimNum    = anoFim    ? parseInt(anoFim,    10) : null

  const { data, error } = await supabase.rpc('buscar_vencedores_licitacoes', {
    p_termo:      busca      || null,
    p_uf:         uf         || null,
    p_ano_inicio: anoInicioNum,
    p_ano_fim:    anoFimNum,
    p_limite:     50,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vencedores: data ?? [] })
}
