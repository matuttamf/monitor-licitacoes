import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: afiliado, error } = await admin
    .from('afiliados')
    .select(`
      id, nome, status,
      campanha:campanhas(id, codigo, cliques, comissao_tipo, comissao_valor)
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!afiliado) return NextResponse.json({ error: 'Não é afiliado' }, { status: 403 })
  if (afiliado.status === 'bloqueado') return NextResponse.json({ error: 'Conta bloqueada' }, { status: 403 })

  const camp = afiliado.campanha as { id: string; codigo: string; cliques: number; comissao_tipo: string; comissao_valor: number } | null

  let conversoes = 0
  let mrr = 0

  if (camp) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('status, valor_mensalidade, periodo')
      .eq('campanha_id', camp.id)

    for (const p of profiles ?? []) {
      if (p.status === 'active') {
        conversoes++
        const valorMensal = p.periodo === 'anual'
          ? (p.valor_mensalidade ?? 0) / 12
          : (p.valor_mensalidade ?? 0)
        mrr += valorMensal
      }
    }
  }

  const comissao_mensal = camp?.comissao_tipo === 'percentual'
    ? Math.round(mrr * (camp.comissao_valor / 100) * 100) / 100
    : camp?.comissao_tipo === 'fixo'
      ? conversoes * (camp.comissao_valor ?? 0)
      : 0

  const { data: pagamentos } = await admin
    .from('afiliado_pagamentos')
    .select('mes_ref, valor, status, pago_em')
    .eq('afiliado_id', afiliado.id)
    .order('mes_ref', { ascending: false })
    .limit(12)

  const totalPago = (pagamentos ?? [])
    .filter(p => p.status === 'pago')
    .reduce((s, p) => s + p.valor, 0)

  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')

  return NextResponse.json({
    nome:            afiliado.nome,
    codigo:          camp?.codigo ?? '',
    link:            camp ? `${APP_URL}/r/${camp.codigo}` : '',
    cliques:         camp?.cliques ?? 0,
    conversoes,
    mrr:             Math.round(mrr * 100) / 100,
    comissao_mensal,
    total_pago:      Math.round(totalPago * 100) / 100,
    comissao_tipo:   camp?.comissao_tipo ?? 'nenhum',
    comissao_valor:  camp?.comissao_valor ?? 0,
    pagamentos:      pagamentos ?? [],
  })
}
