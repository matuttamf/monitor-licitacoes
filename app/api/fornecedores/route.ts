import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { temFornecedores } from '@/lib/planos'

export const dynamic = 'force-dynamic'

// GET — lista/busca fornecedores ativos. Requer Profissional+.
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, status')
    .eq('id', user.id)
    .single()

  const plano = profile?.plano ?? 'basic'
  const status = profile?.status ?? 'trial'

  // Admin pode sempre acessar; demais precisam de Profissional+
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
  const isAdmin = user.email === ADMIN_EMAIL
  if (!isAdmin && !temFornecedores(plano)) {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }
  if (!isAdmin && status !== 'active') {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const busca  = searchParams.get('q')?.trim() ?? ''
  const regiao = searchParams.get('regiao')?.trim() ?? ''
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit  = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('fornecedores')
    .select('id, razao_social, cnpj, descricao, regioes, email_contato, telefone_contato, website, criado_em', { count: 'exact' })
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (busca) {
    query = query.or(`razao_social.ilike.%${busca}%,descricao.ilike.%${busca}%`)
  }
  if (regiao) {
    query = query.contains('regioes', [regiao])
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ fornecedores: data ?? [], total: count ?? 0, page, limit })
}
