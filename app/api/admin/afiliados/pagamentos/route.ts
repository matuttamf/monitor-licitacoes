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
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pagamentos: data })
}

// POST /api/admin/afiliados/pagamentos — marcar uma comissão como paga (por id da linha)
// Body: { id, numero_nf?, observacao? }
// As linhas de comissão são criadas pelo webhook (1 por assinante). Aqui só marcamos pago.
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, numero_nf, observacao } = await request.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const update: Record<string, unknown> = {
    status:  'pago',
    pago_em: new Date().toISOString(),
  }
  if (numero_nf  !== undefined) update.numero_nf  = numero_nf || null
  if (observacao !== undefined) update.observacao = observacao || null

  const admin = adminClient()
  const { data, error } = await admin
    .from('afiliado_pagamentos')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, pagamento: data })
}
