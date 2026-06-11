/**
 * GET /api/radar
 * Retorna contratos vencendo em 30/60/90 dias, filtrados pelas keywords do usuário.
 * Requer plano Pro ou Empresarial.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { temRadar } from '@/lib/planos'
import { coletarContratosVencendo } from '@/lib/radar/contratos-vencendo'

export const maxDuration = 60

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, owner_id')
    .eq('id', user.id)
    .single()

  // Sub-usuários herdam o plano do owner
  let planoEfetivo = profile?.plano ?? 'basic'
  if (profile?.owner_id) {
    const { data: owner } = await supabase
      .from('profiles')
      .select('plano')
      .eq('id', profile.owner_id)
      .single()
    if (owner?.plano) planoEfetivo = owner.plano
  }

  if (!temRadar(planoEfetivo)) {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }

  // Buscar keywords do usuário para filtrar contratos
  const { data: kws } = await supabase
    .from('keywords')
    .select('termo')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .limit(100)

  const termos = (kws ?? []).map(k => k.termo.toLowerCase())

  // Coletar contratos vencendo via PNCP
  const radar = await coletarContratosVencendo()

  // Filtrar por keywords se houver (busca textual simples)
  function filtrar<T extends { objeto: string; orgao: string }>(lista: T[]): T[] {
    if (termos.length === 0) return lista
    return lista.filter(c => {
      const haystack = (c.objeto + ' ' + c.orgao).toLowerCase()
      return termos.some(t => haystack.includes(t))
    })
  }

  return NextResponse.json({
    em30dias:   filtrar(radar.em30dias),
    em60dias:   filtrar(radar.em60dias),
    em90dias:   filtrar(radar.em90dias),
    coletadoEm: radar.coletadoEm,
    totalBruto: radar.em30dias.length + radar.em60dias.length + radar.em90dias.length,
    termos,
  })
}
