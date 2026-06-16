import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLimites } from '@/lib/planos'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [{ data, error }, { data: profile }] = await Promise.all([
    supabase.from('keywords').select('*').eq('user_id', user.id).order('termo', { ascending: true }),
    supabase.from('profiles').select('plano, status, owner_id').eq('id', user.id).single(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let plano = profile?.plano ?? 'basic'
  if (profile?.owner_id) {
    const service = await createServiceClient()
    const { data: ownerProfile } = await service.from('profiles').select('plano').eq('id', profile.owner_id).single()
    plano = ownerProfile?.plano ?? 'basic'
  }

  const { maxKeywords } = getLimites(plano)
  return NextResponse.json({ keywords: data, maxKeywords, plano, status: profile?.status ?? 'trial' })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { termo, regiao } = await request.json()
  if (!termo?.trim()) {
    return NextResponse.json({ error: 'Termo obrigatório' }, { status: 400 })
  }

  // --- Verificar limite de keywords pelo plano ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, owner_id')
    .eq('id', user.id)
    .single()

  // Sub-usuário herda o plano do owner — usa service client para bypassa RLS
  let plano = profile?.plano ?? 'basic'
  if (profile?.owner_id) {
    const service = await createServiceClient()
    const { data: ownerProfile } = await service
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

  const termoNormalizado = termo.trim().toLowerCase()

  // Verificar duplicata
  const { count: duplicatas } = await supabase
    .from('keywords')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('termo', termoNormalizado)

  if ((duplicatas ?? 0) > 0) {
    return NextResponse.json({ error: 'Essa palavra-chave já está cadastrada.', codigo: 'DUPLICATA' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('keywords')
    .insert({ termo: termoNormalizado, user_id: user.id, regiao: regiao ?? ['brasil'] })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, ativo, regiao, termo } = await request.json()

  const updates: Record<string, unknown> = {}
  if (ativo  !== undefined) updates.ativo  = ativo
  if (regiao !== undefined) updates.regiao = regiao
  if (termo !== undefined) {
    const termoLimpo = termo.trim().toLowerCase()
    if (!termoLimpo) return NextResponse.json({ error: 'Termo não pode ser vazio' }, { status: 400 })

    const { count: duplicatas } = await supabase
      .from('keywords')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('termo', termoLimpo)
      .neq('id', id)

    if ((duplicatas ?? 0) > 0) {
      return NextResponse.json({ error: 'Essa palavra-chave já está cadastrada.', codigo: 'DUPLICATA' }, { status: 409 })
    }

    updates.termo = termoLimpo
  }

  const { error } = await supabase
    .from('keywords')
    .update(updates)
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
