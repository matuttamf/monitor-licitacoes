import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

// GET /api/admin/afiliados/pagamentos?afiliado_id=xxx — histórico de pagamentos
export async function GET(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const afiliado_id = request.nextUrl.searchParams.get('afiliado_id')
  if (!afiliado_id) return NextResponse.json({ error: 'afiliado_id obrigatório' }, { status: 400 })

  const admin = adminClient()
  const { data, error } = await admin
    .from('afiliado_pagamentos')
    .select('*')
    .eq('afiliado_id', afiliado_id)
    .order('mes_ref', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pagamentos: data })
}

// POST /api/admin/afiliados/pagamentos — registrar pagamento de comissão
// Body: { afiliado_id, mes_ref, valor, observacao? }
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { afiliado_id, mes_ref, valor, observacao } = await request.json()

  if (!afiliado_id || !mes_ref || valor == null) {
    return NextResponse.json({ error: 'afiliado_id, mes_ref e valor são obrigatórios' }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}$/.test(mes_ref)) {
    return NextResponse.json({ error: 'mes_ref deve estar no formato YYYY-MM' }, { status: 400 })
  }

  const admin = adminClient()

  // Upsert: se já existe registro para o mês, atualiza para pago
  const { data, error } = await admin
    .from('afiliado_pagamentos')
    .upsert({
      afiliado_id,
      mes_ref,
      valor,
      status:     'pago',
      pago_em:    new Date().toISOString(),
      observacao: observacao ?? null,
    }, { onConflict: 'afiliado_id,mes_ref' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, pagamento: data })
}

// PATCH /api/admin/afiliados/pagamentos — criar registro pendente para o mês
// Body: { afiliado_id, mes_ref, valor }
export async function PATCH(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { afiliado_id, mes_ref, valor } = await request.json()

  if (!afiliado_id || !mes_ref || valor == null) {
    return NextResponse.json({ error: 'afiliado_id, mes_ref e valor são obrigatórios' }, { status: 400 })
  }

  const admin = adminClient()

  const { data, error } = await admin
    .from('afiliado_pagamentos')
    .insert({ afiliado_id, mes_ref, valor, status: 'pendente' })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Já existe registro para esse mês' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, pagamento: data })
}
