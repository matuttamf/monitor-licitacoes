import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET — busca o perfil de fornecedor do usuário autenticado
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('fornecedores')
    .select('ativo, razao_social, cnpj, descricao, regioes, email_contato, telefone_contato, website')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json(data ?? null)
}

// POST — cria ou atualiza (upsert) o perfil de fornecedor
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const { ativo, razao_social, cnpj, descricao, regioes, email_contato, telefone_contato, website } = body

  if (descricao && descricao.length > 500) {
    return NextResponse.json({ error: 'Descrição deve ter no máximo 500 caracteres' }, { status: 400 })
  }

  const { error } = await supabase
    .from('fornecedores')
    .upsert({
      user_id:          user.id,
      ativo:            Boolean(ativo),
      razao_social:     razao_social ?? null,
      cnpj:             cnpj ?? null,
      descricao:        descricao ?? '',
      regioes:          Array.isArray(regioes) ? regioes : [],
      email_contato:    email_contato ?? null,
      telefone_contato: telefone_contato ?? null,
      website:          website ?? null,
      atualizado_em:    new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
