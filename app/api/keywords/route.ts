import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLimites } from '@/lib/planos'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { termo } = await request.json()
  if (!termo?.trim()) {
    return NextResponse.json({ error: 'Termo obrigatório' }, { status: 400 })
  }

  // --- Verificar limite de keywords pelo plano ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, owner_id')
    .eq('id', user.id)
    .single()

  // Sub-usuário herda o plano do owner
  let plano = profile?.plano ?? 'basic'
  if (profile?.owner_id) {
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', profile.owner_id)
      .single()
    plano = ownerProfile?.plano ?? 'basic'
  }

  const { maxKeywords } = getLimites(plano)
  if (maxKeywords < 99999) {
    const { count } = await supabase
      .from('keywords')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= maxKeywords) {
      return NextResponse.json({
        error: `Limite de ${maxKeywords} palavra(s)-chave atingido no plano ${plano}. Faça upgrade para adicionar mais.`,
        codigo: 'LIMITE_KEYWORDS',
      }, { status: 403 })
    }
  }
  // --- Fim verificação ---

  const { data, error } = await supabase
    .from('keywords')
    .insert({ termo: termo.trim().toLowerCase(), user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, ativo } = await request.json()

  const { error } = await supabase
    .from('keywords')
    .update({ ativo })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await request.json()

  const { error } = await supabase
    .from('keywords')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
