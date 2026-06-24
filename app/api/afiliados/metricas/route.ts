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
    .select('id, nome, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!afiliado) return NextResponse.json({ error: 'Não é afiliado' }, { status: 403 })
  if (afiliado.status === 'bloqueado') return NextResponse.json({ error: 'Conta bloqueada' }, { status: 403 })

  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')

  const [{ data: vinculos }, { data: pags }] = await Promise.all([
    admin.from('afiliado_campanhas')
      .select('campanha_id, codigo, cliques, comissao_tipo, comissao_valor, campanha:campanhas(nome)')
      .eq('afiliado_id', afiliado.id)
      .order('criado_em', { ascending: true }),
    admin.from('afiliado_pagamentos')
      .select('valor, status, mes_ref, pago_em, tipo_gatilho, profile_id, campanha_id')
      .eq('afiliado_id', afiliado.id)
      .order('criado_em', { ascending: false }),
  ])

  const pagamentos = pags ?? []

  // Métricas por vínculo (link)
  const links = (vinculos ?? []).map(v => {
    const ps = pagamentos.filter(p => p.campanha_id === v.campanha_id)
    const camp = (v.campanha as unknown) as { nome: string } | null
    return {
      campanha_nome:     camp?.nome ?? '—',
      codigo:            v.codigo,
      link:              `${APP_URL}/r/${v.codigo}`,
      cliques:           v.cliques ?? 0,
      conversoes:        new Set(ps.map(p => p.profile_id).filter(Boolean)).size,
      comissao_pendente: Math.round(ps.filter(p => p.status === 'pendente').reduce((s, p) => s + p.valor, 0) * 100) / 100,
      comissao_tipo:     v.comissao_tipo,
      comissao_valor:    v.comissao_valor,
    }
  })

  // Totais agregados
  const cliques      = (vinculos ?? []).reduce((s, v) => s + (v.cliques ?? 0), 0)
  const conversoes   = new Set(pagamentos.map(p => p.profile_id).filter(Boolean)).size
  const totalPendente = pagamentos.filter(p => p.status === 'pendente').reduce((s, p) => s + p.valor, 0)
  const totalPago     = pagamentos.filter(p => p.status === 'pago').reduce((s, p) => s + p.valor, 0)

  return NextResponse.json({
    nome:              afiliado.nome,
    links,
    cliques,
    conversoes,
    comissao_pendente: Math.round(totalPendente * 100) / 100,
    total_pago:        Math.round(totalPago * 100) / 100,
    pagamentos:        pagamentos.slice(0, 50),
  })
}
