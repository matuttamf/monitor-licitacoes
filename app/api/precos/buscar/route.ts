import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLimites } from '@/lib/planos'

export const dynamic = 'force-dynamic'
export const maxDuration = 300



export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('plano, precos_buscas_mes, precos_buscas_reset_em, precos_buscas_dia, precos_buscas_dia_reset')
    .eq('id', user.id)
    .single()

  if (pErr || !profile) return NextResponse.json({ error: 'perfil não encontrado' }, { status: 404 })

  const plano = profile.plano ?? 'basic'
  const limites = getLimites(plano)
  const maxBuscas = limites.maxPriceBuscas

  const hoje = new Date()
  const hojeStr = hoje.toISOString().slice(0, 10)
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10)

  const resetEm = profile.precos_buscas_reset_em ?? primeiroDiaMes
  let buscasUsadas = profile.precos_buscas_mes ?? 0
  if (resetEm < primeiroDiaMes) {
    buscasUsadas = 0
    await supabase
      .from('profiles')
      .update({ precos_buscas_mes: 0, precos_buscas_reset_em: primeiroDiaMes })
      .eq('id', user.id)
  }

  if (maxBuscas < 99999 && buscasUsadas >= maxBuscas) {
    return NextResponse.json({ error: 'limite_atingido', buscasUsadas, maxBuscas, plano }, { status: 429 })
  }


  const body = await req.json()
  const { termo, estado, inicio, fim, limite = 50, offset = 0 } = body

  if (!termo?.trim()) return NextResponse.json({ error: 'termo obrigatório' }, { status: 400 })

  // Corte para stats dos últimos 12 meses (só usa se usuário não especificou datas)
  const dozeM = new Date(hoje)
  dozeM.setFullYear(dozeM.getFullYear() - 1)
  const inicioDozeM = dozeM.toISOString().slice(0, 10)

  const [
    { data: resultados, error: rErr },
    { data: statsGeral, error: sErr },
    { data: stats12m },
  ] = await Promise.all([
    supabase.rpc('buscar_precos', {
      p_termo:  termo.trim(),
      p_estado: estado || null,
      p_inicio: inicio || null,
      p_fim:    fim || null,
      p_limite: Math.min(limite, 100),
      p_offset: offset,
    }),
    supabase.rpc('stats_precos', {
      p_termo:  termo.trim(),
      p_estado: estado || null,
      p_inicio: inicio || null,
      p_fim:    fim || null,
    }),
    (!inicio && !fim)
      ? supabase.rpc('stats_precos', {
          p_termo:  termo.trim(),
          p_estado: estado || null,
          p_inicio: inicioDozeM,
          p_fim:    null,
        })
      : Promise.resolve({ data: null }),
  ])

  // Só desconta da cota se a query principal teve sucesso
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
  if (sErr) console.error('[stats_precos]', sErr.message)

  const geralRow  = statsGeral?.[0]  ?? null
  const dozeRow   = stats12m?.[0]    ?? null

  // Usa stats dos últimos 12 meses se tiver >= 5 resultados nesse período
  const MIN_RESULTADOS_12M = 15
  const usarDozeM = !inicio && !fim && dozeRow && Number(dozeRow.total) >= MIN_RESULTADOS_12M
  const stats     = usarDozeM ? dozeRow : geralRow
  const statsLabel = usarDozeM
    ? `Últimos 12 meses · ${dozeRow!.total} resultado${Number(dozeRow!.total) !== 1 ? 's' : ''}`
    : geralRow
      ? `Histórico completo · ${geralRow.total} resultado${Number(geralRow.total) !== 1 ? 's' : ''}`
      : null

  // Incrementa cota apenas após query bem-sucedida
  await supabase.from('profiles').update({
    precos_buscas_mes: buscasUsadas + 1,
    precos_buscas_reset_em: primeiroDiaMes,
  }).eq('id', user.id)

  return NextResponse.json({
    resultados:   resultados ?? [],
    stats,
    statsLabel,
    buscasUsadas: buscasUsadas + 1,
    maxBuscas,
    plano: profile.plano,
  })
}
