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

  const url   = new URL(request.url)
  const busca = url.searchParams.get('q')?.trim() ?? ''
  const uf    = url.searchParams.get('uf')?.trim() ?? ''

  // Corte de 24 meses
  const vinte4m = new Date()
  vinte4m.setMonth(vinte4m.getMonth() - 24)
  const inicioIso = vinte4m.toISOString().slice(0, 10)

  // Busca vencedores agrupados por CNPJ nos últimos 24 meses
  // Usa RPC para poder fazer GROUP BY + filtro por similaridade
  const { data, error } = await supabase.rpc('buscar_vencedores_licitacoes', {
    p_termo:  busca || null,
    p_uf:     uf    || null,
    p_inicio: inicioIso,
    p_limite: 50,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vencedores: data ?? [] })
}
