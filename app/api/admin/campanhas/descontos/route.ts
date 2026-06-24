import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

const PLANOS_VALIDOS  = ['basic', 'profissional', 'gestao', 'empresarial']
const PERIODOS_VALIDOS = ['mensal', 'anual']

// GET ?campanha_id= — lista regras de desconto de uma campanha
export async function GET(request: Request) {
  if (!(await verificarAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const campanhaId = new URL(request.url).searchParams.get('campanha_id')
  if (!campanhaId) return NextResponse.json({ error: 'campanha_id obrigatório' }, { status: 400 })

  const { data, error } = await createAdminClient()
    .from('campanha_descontos')
    .select('*')
    .eq('campanha_id', campanhaId)
    .order('criado_em', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ regras: data ?? [] })
}

// POST — adiciona uma regra { campanha_id, plano, periodo, desconto_percentual, desconto_meses }
export async function POST(request: Request) {
  if (!(await verificarAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { campanha_id, plano, periodo, desconto_percentual, desconto_meses } = body

  if (!campanha_id) return NextResponse.json({ error: 'campanha_id obrigatório' }, { status: 400 })

  const planoN   = plano && PLANOS_VALIDOS.includes(plano) ? plano : null
  const periodoN = periodo && PERIODOS_VALIDOS.includes(periodo) ? periodo : null
  const pct      = Number(desconto_percentual)
  const meses    = Number(desconto_meses ?? 0)

  if (!Number.isInteger(pct) || pct < 1 || pct > 100) {
    return NextResponse.json({ error: 'Percentual deve ser inteiro entre 1 e 100' }, { status: 400 })
  }
  if (!Number.isInteger(meses) || meses < 0) {
    return NextResponse.json({ error: 'Meses deve ser inteiro ≥ 0 (0 = permanente)' }, { status: 400 })
  }

  const { data, error } = await createAdminClient()
    .from('campanha_descontos')
    .insert({ campanha_id, plano: planoN, periodo: periodoN, desconto_percentual: pct, desconto_meses: meses })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Já existe uma regra para esse plano + ciclo.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, regra: data })
}

// DELETE ?id= — remove uma regra
export async function DELETE(request: Request) {
  if (!(await verificarAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const { error } = await createAdminClient().from('campanha_descontos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
