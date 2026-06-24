import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { enviarConviteAfiliado } from '@/lib/emails/afiliado-convite'
import { gerarCodigoUnico, slugCodigo } from '@/lib/afiliados'
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

type VinculoBody = { campanha_id: string; codigo?: string; comissao_tipo?: string; comissao_valor?: number }

// GET /api/admin/afiliados — afiliados com vínculos e métricas agregadas
export async function GET() {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = adminClient()

  const { data: afiliados, error } = await admin
    .from('afiliados')
    .select('id, nome, email, status, criado_em, cnpj, chave_pix')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (afiliados ?? []).map(a => a.id)
  if (ids.length === 0) return NextResponse.json({ afiliados: [] })

  const [{ data: vinculos }, { data: pagamentos }] = await Promise.all([
    admin.from('afiliado_campanhas')
      .select('id, afiliado_id, campanha_id, codigo, comissao_tipo, comissao_valor, cliques, campanha:campanhas(nome, codigo)')
      .in('afiliado_id', ids),
    admin.from('afiliado_pagamentos')
      .select('afiliado_id, valor, status')
      .in('afiliado_id', ids),
  ])

  const linksPorAfiliado: Record<string, unknown[]> = {}
  const cliquesPorAfiliado: Record<string, number> = {}
  for (const v of vinculos ?? []) {
    const camp = (v.campanha as unknown) as { nome: string; codigo: string } | null
    ;(linksPorAfiliado[v.afiliado_id] ??= []).push({
      id: v.id, campanha_id: v.campanha_id, codigo: v.codigo,
      comissao_tipo: v.comissao_tipo, comissao_valor: v.comissao_valor, cliques: v.cliques,
      campanha_nome: camp?.nome ?? null, campanha_codigo: camp?.codigo ?? null,
    })
    cliquesPorAfiliado[v.afiliado_id] = (cliquesPorAfiliado[v.afiliado_id] ?? 0) + (v.cliques ?? 0)
  }

  const metr: Record<string, { conversoes: number; pendente: number; pago: number }> = {}
  for (const p of pagamentos ?? []) {
    const m = (metr[p.afiliado_id] ??= { conversoes: 0, pendente: 0, pago: 0 })
    m.conversoes++
    if (p.status === 'pendente') m.pendente += p.valor
    else if (p.status === 'pago') m.pago += p.valor
  }

  const resultado = (afiliados ?? []).map(a => {
    const m = metr[a.id] ?? { conversoes: 0, pendente: 0, pago: 0 }
    return {
      ...a,
      links:             linksPorAfiliado[a.id] ?? [],
      cliques:           cliquesPorAfiliado[a.id] ?? 0,
      conversoes:        m.conversoes,
      comissao_pendente: Math.round(m.pendente * 100) / 100,
      comissao_paga:     Math.round(m.pago * 100) / 100,
    }
  })

  return NextResponse.json({ afiliados: resultado })
}

// POST /api/admin/afiliados — criar afiliado com 1+ campanhas e enviar convite
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, email, cnpj, chave_pix, campanhas } = await request.json()
  const links: VinculoBody[] = Array.isArray(campanhas) ? campanhas : []

  if (!nome?.trim() || !email?.trim() || links.length === 0) {
    return NextResponse.json({ error: 'nome, email e ao menos uma campanha são obrigatórios' }, { status: 400 })
  }

  const admin = adminClient()
  const emailNorm = email.toLowerCase().trim()

  const { data: existente } = await admin.from('afiliados').select('id').eq('email', emailNorm).maybeSingle()
  if (existente) return NextResponse.json({ error: 'Já existe um afiliado com esse e-mail' }, { status: 409 })

  const token  = crypto.randomBytes(32).toString('hex')
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: afiliado, error } = await admin
    .from('afiliados')
    .insert({
      nome: nome.trim(), email: emailNorm, status: 'pendente',
      token_convite: token, token_expira_em: expira,
      cnpj: cnpj?.trim() || null, chave_pix: chave_pix?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cria os vínculos (código auto-gerado se não informado)
  for (const l of links) {
    if (!l.campanha_id) continue
    const base = l.codigo?.trim()
      ? slugCodigo(l.codigo)
      : `${await codigoBaseDaCampanha(admin, l.campanha_id)}-${nome}`
    const codigo = await gerarCodigoUnico(admin, base)
    const { error: errV } = await admin.from('afiliado_campanhas').insert({
      afiliado_id: afiliado.id,
      campanha_id: l.campanha_id,
      codigo,
      comissao_tipo: l.comissao_tipo ?? 'nenhum',
      comissao_valor: l.comissao_valor ?? 0,
    })
    if (errV) console.error('[admin/afiliados] erro ao criar vínculo:', errV.message)
  }

  const enviado = await enviarConviteAfiliado({ email: email.trim(), nome: nome.trim(), token })
  return NextResponse.json({ afiliado, email_enviado: enviado })
}

async function codigoBaseDaCampanha(admin: ReturnType<typeof adminClient>, campanhaId: string): Promise<string> {
  const { data } = await admin.from('campanhas').select('codigo').eq('id', campanhaId).maybeSingle()
  return data?.codigo ?? 'campanha'
}

// PATCH /api/admin/afiliados — status ou reenviar convite
export async function PATCH(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, acao } = await request.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const admin = adminClient()

  if (acao === 'reenviar') {
    const { data: check } = await admin.from('afiliados').select('user_id').eq('id', id).single()
    if (check?.user_id) return NextResponse.json({ error: 'Afiliado já ativou a conta' }, { status: 409 })

    const token  = crypto.randomBytes(32).toString('hex')
    const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: afiliado, error } = await admin
      .from('afiliados')
      .update({ token_convite: token, token_expira_em: expira })
      .eq('id', id).select('nome, email').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await enviarConviteAfiliado({ email: afiliado.email, nome: afiliado.nome, token })
    return NextResponse.json({ ok: true })
  }

  if (acao === 'bloquear' || acao === 'ativar') {
    const { error } = await admin.from('afiliados')
      .update({ status: acao === 'bloquear' ? 'bloqueado' : 'ativo' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'ação inválida' }, { status: 400 })
}

// DELETE /api/admin/afiliados?id=xxx — remover afiliado (cascade remove vínculos e pagamentos)
export async function DELETE(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const admin = adminClient()
  const { error } = await admin.from('afiliados').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
