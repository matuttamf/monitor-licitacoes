import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function GET(req: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const searchParams = req.nextUrl.searchParams
  const mes = searchParams.get('mes') ? Number(searchParams.get('mes')) : null
  const ano = searchParams.get('ano') ? Number(searchParams.get('ano')) : null

  const supabase = createAdminClient()

  // Busca fixas (recorrente=true) + pontuais do mês/ano solicitado
  let query = supabase.from('despesas').select('*').order('criado_em', { ascending: false })

  if (mes && ano) {
    // Fixas sempre aparecem; pontuais só se do mês/ano
    query = supabase
      .from('despesas')
      .select('*')
      .or(`recorrente.eq.true,and(recorrente.eq.false,mes.eq.${mes},ano.eq.${ano})`)
      .order('criado_em', { ascending: false })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ── Despesas automáticas: taxas MP + comissões de afiliados ────────────────
  // Calculadas a partir dos assinantes ativos no mês solicitado.
  // Aparecem como entradas virtuais (auto=true) — não podem ser editadas/deletadas.
  const TAXA_MP = 0.0498

  // MRR do mês: soma de valor_mensalidade dos pagantes ativos (excluindo admin)
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const adminId = (authData?.users ?? []).find(u => u.email === ADMIN_EMAIL)?.id ?? null

  let pagantesQuery = supabase
    .from('profiles')
    .select('valor_mensalidade, plano, periodo, campanha_id')
    .eq('status', 'active')
    .is('owner_id', null)
  if (adminId) pagantesQuery = pagantesQuery.neq('id', adminId)
  const { data: pagantes } = await pagantesQuery

  const PRECOS: Record<string, number> = { basic: 49.90, profissional: 97.90, gestao: 197.90, pro: 197.90, empresarial: 497.00 }
  const mrrMes = (pagantes ?? []).reduce((s, p) => {
    const val = p.valor_mensalidade ?? PRECOS[p.plano ?? ''] ?? 0
    return s + (p.periodo === 'anual' ? Math.round(val / 12 * 100) / 100 : val)
  }, 0)

  const taxaMP    = Math.round(mrrMes * TAXA_MP * 100) / 100
  const comissoes = (pagantes ?? []).filter(p => p.campanha_id).length > 0
    ? await (async () => {
        const { data: ap } = await supabase.from('afiliado_pagamentos').select('valor').eq('status', 'pago')
        return (ap ?? []).reduce((s, a) => s + (a.valor ?? 0), 0)
      })()
    : 0

  const virtuais = [
    // Nota: Taxas MP já estão descontadas em mrrLiquido na API, não são despesa operacional
    ...(comissoes > 0 ? [{
      id: '__comissoes_afiliados__', descricao: 'Comissões de afiliados', valor: comissoes,
      categoria: 'comissao', recorrente: false, mes: mes ?? null, ano: ano ?? null,
      numero_nf: null, criado_em: null, auto: true,
    }] : []),
  ]

  return NextResponse.json({ despesas: [...virtuais, ...(data ?? [])] })
}

export async function POST(req: Request) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const { descricao, valor, categoria, recorrente, mes, ano, numero_nf } = body

  if (!descricao?.trim()) return NextResponse.json({ error: 'Descrição obrigatória' }, { status: 400 })
  if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('despesas').insert({
    descricao: descricao.trim(),
    valor: Number(valor),
    categoria: categoria || 'outro',
    recorrente: Boolean(recorrente),
    mes: recorrente ? null : (mes ? Number(mes) : null),
    ano: recorrente ? null : (ano ? Number(ano) : null),
    numero_nf: numero_nf?.trim() || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ despesa: data })
}

export async function PATCH(req: Request) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const { id, ...campos } = body
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {}
  if (campos.descricao !== undefined) update.descricao = campos.descricao
  if (campos.valor     !== undefined) update.valor     = Number(campos.valor)
  if (campos.categoria !== undefined) update.categoria = campos.categoria
  if (campos.recorrente !== undefined) {
    update.recorrente = Boolean(campos.recorrente)
    if (update.recorrente) { update.mes = null; update.ano = null }
  }
  if (campos.mes       !== undefined) update.mes       = campos.mes ? Number(campos.mes) : null
  if (campos.ano       !== undefined) update.ano       = campos.ano ? Number(campos.ano) : null
  if (campos.numero_nf !== undefined) update.numero_nf = campos.numero_nf?.trim() || null

  const { error } = await supabase.from('despesas').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('despesas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
