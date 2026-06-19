import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { enviarConviteAfiliado } from '@/lib/emails/afiliado-convite'
import crypto from 'crypto'

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

// GET /api/admin/afiliados — listar afiliados com métricas
export async function GET() {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = adminClient()

  const { data: afiliados, error } = await admin
    .from('afiliados')
    .select(`
      id, nome, email, status, criado_em,
      campanha:campanhas(id, codigo, cliques, comissao_tipo, comissao_valor, ativo)
    `)
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Métricas one-time via afiliado_pagamentos (uma comissão por assinante)
  const afiliadoIds = (afiliados ?? []).map(a => a.id)
  let pagamentosPorAfiliado: Record<string, { conversoes: number; pendente: number; pago: number }> = {}

  if (afiliadoIds.length > 0) {
    const { data: pagamentos } = await admin
      .from('afiliado_pagamentos')
      .select('afiliado_id, valor, status')
      .in('afiliado_id', afiliadoIds)

    for (const p of pagamentos ?? []) {
      if (!pagamentosPorAfiliado[p.afiliado_id]) {
        pagamentosPorAfiliado[p.afiliado_id] = { conversoes: 0, pendente: 0, pago: 0 }
      }
      pagamentosPorAfiliado[p.afiliado_id].conversoes++
      if (p.status === 'pendente') pagamentosPorAfiliado[p.afiliado_id].pendente += p.valor
      else if (p.status === 'pago')    pagamentosPorAfiliado[p.afiliado_id].pago    += p.valor
    }
  }

  const resultado = afiliados?.map(a => {
    const camp = (a.campanha as unknown) as { id: string; codigo: string; cliques: number; comissao_tipo: string; comissao_valor: number; ativo: boolean } | null
    const m = pagamentosPorAfiliado[a.id] ?? { conversoes: 0, pendente: 0, pago: 0 }

    return {
      ...a,
      campanha:          camp,
      cliques:           camp?.cliques ?? 0,
      conversoes:        m.conversoes,
      comissao_pendente: Math.round(m.pendente * 100) / 100,
      comissao_paga:     Math.round(m.pago     * 100) / 100,
    }
  })

  return NextResponse.json({ afiliados: resultado })
}

// POST /api/admin/afiliados — criar afiliado e enviar convite
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, email, campanha_id, cnpj, chave_pix } = await request.json()

  if (!nome?.trim() || !email?.trim() || !campanha_id) {
    return NextResponse.json({ error: 'nome, email e campanha_id são obrigatórios' }, { status: 400 })
  }

  const admin = adminClient()

  // Verifica se já existe afiliado com esse e-mail
  const { data: existente } = await admin
    .from('afiliados')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (existente) {
    return NextResponse.json({ error: 'Já existe um afiliado com esse e-mail' }, { status: 409 })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: afiliado, error } = await admin
    .from('afiliados')
    .insert({
      nome:            nome.trim(),
      email:           email.toLowerCase().trim(),
      campanha_id,
      status:          'pendente',
      token_convite:   token,
      token_expira_em: expira,
      cnpj:            cnpj?.trim() || null,
      chave_pix:       chave_pix?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const enviado = await enviarConviteAfiliado({ email: email.trim(), nome: nome.trim(), token })

  return NextResponse.json({ afiliado, email_enviado: enviado })
}

// PATCH /api/admin/afiliados — atualizar status ou reenviar convite
export async function PATCH(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, acao } = await request.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const admin = adminClient()

  if (acao === 'reenviar') {
    // Não reenviar convite para afiliado já ativado (user_id preenchido)
    const { data: check } = await admin
      .from('afiliados')
      .select('user_id')
      .eq('id', id)
      .single()
    if (check?.user_id) {
      return NextResponse.json({ error: 'Afiliado já ativou a conta' }, { status: 409 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: afiliado, error } = await admin
      .from('afiliados')
      .update({ token_convite: token, token_expira_em: expira })
      .eq('id', id)
      .select('nome, email')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await enviarConviteAfiliado({ email: afiliado.email, nome: afiliado.nome, token })
    return NextResponse.json({ ok: true })
  }

  if (acao === 'bloquear' || acao === 'ativar') {
    const { error } = await admin
      .from('afiliados')
      .update({ status: acao === 'bloquear' ? 'bloqueado' : 'ativo' })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'ação inválida' }, { status: 400 })
}

// DELETE /api/admin/afiliados?id=xxx — remover afiliado
export async function DELETE(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const admin = adminClient()

  // Remove pagamentos associados primeiro
  await admin.from('afiliado_pagamentos').delete().eq('afiliado_id', id)

  const { error } = await admin.from('afiliados').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
