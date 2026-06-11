/**
 * GET /api/radar
 * Retorna contratos vencendo em 30/60/90 dias, filtrados pelas keywords do usuário.
 * Requer plano Pro ou Empresarial.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { temRadar } from '@/lib/planos'

export const maxDuration = 15

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

  // Buscar keywords do usuário
  const { data: kws } = await supabase
    .from('keywords')
    .select('termo')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .limit(500)

  const termos = (kws ?? []).map(k => k.termo.toLowerCase())

  // Ler contratos do cache (populado pelo cron radar-alertas — diário)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite180 = new Date(hoje)
  limite180.setDate(limite180.getDate() + 180)

  const { data: rows, error } = await supabase
    .from('radar_contratos')
    .select('orgao, objeto, valor, data_vigencia_fim, url, estado, cidade, coletado_em')
    .gte('data_vigencia_fim', hoje.toISOString().substring(0, 10))
    .lte('data_vigencia_fim', limite180.toISOString().substring(0, 10))
    .order('data_vigencia_fim', { ascending: true })
    .limit(2000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Recalcular dias_restantes com base na data de hoje (cache pode ter 1-2 dias)
  function diasAte(dataFim: string): number {
    const fim = new Date(dataFim + 'T00:00:00')
    return Math.round((fim.getTime() - hoje.getTime()) / 86400000)
  }

  const contratos = (rows ?? []).map(c => ({
    orgao:           c.orgao,
    objeto:          c.objeto,
    valor:           c.valor,
    dataVigenciaFim: c.data_vigencia_fim,
    diasRestantes:   diasAte(c.data_vigencia_fim),
    url:             c.url,
    estado:          c.estado,
    cidade:          c.cidade,
  }))

  // Filtrar por keywords e anotar quais termos fizeram match
  function filtrar(lista: typeof contratos) {
    return lista
      .map(c => {
        const haystack = (c.objeto + ' ' + c.orgao).toLowerCase()
        const matched = termos.length === 0 ? [] : termos.filter(t => haystack.includes(t))
        return { ...c, keywords: matched }
      })
      .filter(c => termos.length === 0 || c.keywords.length > 0)
  }

  const coletadoEm = rows?.[0]?.coletado_em ?? null
  const em30    = filtrar(contratos.filter(c => c.diasRestantes <= 30))
  const em60    = filtrar(contratos.filter(c => c.diasRestantes >= 31 && c.diasRestantes <= 60))
  const em90    = filtrar(contratos.filter(c => c.diasRestantes >= 61 && c.diasRestantes <= 90))
  const em180   = filtrar(contratos.filter(c => c.diasRestantes >= 91))

  return NextResponse.json({
    em30dias:   em30,
    em60dias:   em60,
    em90dias:   em90,
    em180dias:  em180,
    coletadoEm,
    totalBruto: rows?.length ?? 0,
    termos,
  })
}
