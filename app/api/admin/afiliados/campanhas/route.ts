import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { gerarCodigoUnico, slugCodigo, sufixoAleatorio } from '@/lib/afiliados'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verificarAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}

const PLANO_OK = (t: unknown) => ['nenhum', 'percentual', 'fixo'].includes(String(t))

// GET ?afiliado_id= — vínculos (campanhas) de um afiliado
export async function GET(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const afiliadoId = request.nextUrl.searchParams.get('afiliado_id')
  if (!afiliadoId) return NextResponse.json({ error: 'afiliado_id obrigatório' }, { status: 400 })

  const admin = adminClient()
  const { data, error } = await admin
    .from('afiliado_campanhas')
    .select('id, campanha_id, codigo, comissao_tipo, comissao_valor, cliques, criado_em, campanha:campanhas(nome, codigo, ativo)')
    .eq('afiliado_id', afiliadoId)
    .order('criado_em', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vinculos: data ?? [] })
}

// POST — adiciona um vínculo (campanha) a um afiliado. Body:
// { afiliado_id, campanha_id, codigo?, comissao_tipo, comissao_valor }
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { afiliado_id, campanha_id, codigo, comissao_tipo, comissao_valor } = await request.json()
  if (!afiliado_id || !campanha_id) {
    return NextResponse.json({ error: 'afiliado_id e campanha_id são obrigatórios' }, { status: 400 })
  }
  if (comissao_tipo && !PLANO_OK(comissao_tipo)) {
    return NextResponse.json({ error: 'comissao_tipo inválido' }, { status: 400 })
  }

  const admin = adminClient()

  const [{ data: af }, { data: camp }] = await Promise.all([
    admin.from('afiliados').select('id').eq('id', afiliado_id).maybeSingle(),
    admin.from('campanhas').select('codigo').eq('id', campanha_id).maybeSingle(),
  ])
  if (!af || !camp) return NextResponse.json({ error: 'Afiliado ou campanha não encontrados' }, { status: 404 })

  // Código: informado (slug + garante unicidade) ou auto-gerado como campanha + sufixo
  // aleatório — NÃO inclui o nome do afiliado para não expô-lo na URL pública.
  const codigoFinal = codigo?.trim()
    ? await gerarCodigoUnico(admin, slugCodigo(codigo))
    : await gerarCodigoUnico(admin, `${camp.codigo}-${sufixoAleatorio()}`)

  const { data, error } = await admin.from('afiliado_campanhas').insert({
    afiliado_id, campanha_id, codigo: codigoFinal,
    comissao_tipo: comissao_tipo ?? 'nenhum',
    comissao_valor: comissao_valor ?? 0,
  }).select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Esse afiliado já tem essa campanha.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, vinculo: data })
}

// PATCH — edita um vínculo. Body: { id, codigo?, comissao_tipo?, comissao_valor? }
export async function PATCH(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, codigo, comissao_tipo, comissao_valor } = await request.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  if (comissao_tipo !== undefined && !PLANO_OK(comissao_tipo)) {
    return NextResponse.json({ error: 'comissao_tipo inválido' }, { status: 400 })
  }

  const admin = adminClient()
  const update: Record<string, unknown> = {}
  if (comissao_tipo  !== undefined) update.comissao_tipo  = comissao_tipo
  if (comissao_valor !== undefined) update.comissao_valor = comissao_valor

  // Troca de código: garante unicidade
  if (codigo !== undefined) {
    const novo = slugCodigo(String(codigo))
    if (!novo) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    const { data: atual } = await admin.from('afiliado_campanhas').select('codigo').eq('id', id).maybeSingle()
    if (atual?.codigo !== novo) update.codigo = await gerarCodigoUnico(admin, novo)
  }

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true })

  const { data, error } = await admin.from('afiliado_campanhas').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, vinculo: data })
}

// DELETE ?id= — remove um vínculo
export async function DELETE(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const admin = adminClient()
  const { error } = await admin.from('afiliado_campanhas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
