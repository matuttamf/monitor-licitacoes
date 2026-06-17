import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { temFornecedores } from '@/lib/planos'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

// GET — lista/busca fornecedores ativos. Requer Profissional+.
export async function GET(request: Request) {
  const { supabase, user } = await getUser()
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
  const page      = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const limit     = 20
  const offset    = (page - 1) * limit

  let query = supabase
    .from('fornecedores')
    .select('id, razao_social, cnpj, descricao, regioes, email_contato, telefone_contato, website, criado_em', { count: 'exact' })
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (busca) {
    const cnpjLimpo = busca.replace(/\D/g, '')
    if (cnpjLimpo.length >= 8) {
      query = query.or(`razao_social.ilike.%${busca}%,descricao.ilike.%${busca}%,cnpj.ilike.%${cnpjLimpo}%`)
    } else {
      query = query.or(`razao_social.ilike.%${busca}%,descricao.ilike.%${busca}%`)
    }
  }
  if (regiao) {
    query = query.contains('regioes', [regiao])
  }
  // Ano de cadastro no diretório (criado_em)
  if (anoInicio) {
    query = query.gte('criado_em', `${anoInicio}-01-01`)
  }
  if (anoFim) {
    query = query.lte('criado_em', `${anoFim}-12-31`)
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // informa se o usuário já tem cadastro (para ocultar o formulário)
  const { data: meu } = await supabase
    .from('fornecedores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    fornecedores: data ?? [],
    total: count ?? 0,
    page,
    limit,
    jaCadastrado: !!meu,
  })
}

// POST — cadastra a empresa do usuário no diretório (ativo=false até revisão admin)
export async function POST(request: Request) {
  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { razao_social, cnpj, descricao, regioes, email_contato, telefone_contato, website } = body

  if (!descricao?.trim()) {
    return NextResponse.json({ error: 'Descreva o que sua empresa fornece.' }, { status: 400 })
  }
  if (!Array.isArray(regioes) || regioes.length === 0) {
    return NextResponse.json({ error: 'Selecione ao menos uma região de atuação.' }, { status: 400 })
  }

  // upsert — atualiza se já existe (UNIQUE user_id)
  const { error } = await supabase
    .from('fornecedores')
    .upsert({
      user_id:          user.id,
      ativo:            false,
      razao_social:     razao_social?.trim() || null,
      cnpj:             cnpj?.replace(/\D/g, '') || null,
      descricao:        descricao.trim(),
      regioes,
      email_contato:    email_contato?.trim().toLowerCase() || null,
      telefone_contato: telefone_contato?.trim() || null,
      website:          website?.trim() || null,
      atualizado_em:    new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
