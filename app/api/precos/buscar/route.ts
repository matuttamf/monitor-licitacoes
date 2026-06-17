import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLimites } from '@/lib/planos'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface MLItem { price: number; currency_id: string }
interface MLResponse { results: MLItem[] }

async function getMLToken(): Promise<string | null> {
  const appId     = process.env.ML_APP_ID
  const appSecret = process.env.ML_APP_SECRET
  if (!appId || !appSecret) return null
  try {
    const res = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     appId,
        client_secret: appSecret,
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[ML token] HTTP', res.status, body.slice(0, 200))
      return null
    }
    const json = await res.json() as { access_token?: string }
    if (!json.access_token) console.error('[ML token] sem access_token na resposta:', JSON.stringify(json).slice(0, 200))
    return json.access_token ?? null
  } catch (e) {
    console.error('[ML token] exception:', e)
    return null
  }
}

async function buscarPrecoMercado(termo: string): Promise<{ media: number | null; minimo: number | null; total: number }> {
  try {
    const token = await getMLToken()
    if (!token) return { media: null, minimo: null, total: 0 }

    const q = encodeURIComponent(termo.slice(0, 80))
    const res = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?q=${q}&limit=20&condition=new`,
      {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return { media: null, minimo: null, total: 0 }
    const json: MLResponse = await res.json()
    const precos = (json.results ?? [])
      .filter(r => r.currency_id === 'BRL' && r.price > 0)
      .map(r => r.price)
    if (!precos.length) return { media: null, minimo: null, total: 0 }
    const media = Math.round(precos.reduce((a, b) => a + b, 0) / precos.length * 100) / 100
    const minimo = Math.min(...precos)
    return { media, minimo, total: precos.length }
  } catch {
    return { media: null, minimo: null, total: 0 }
  }
}

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

  const MAX_DIA = 10
  const planoComLimiteDiario = plano === 'basic' || plano === 'trial'
  if (planoComLimiteDiario) {
    const diaReset = profile.precos_buscas_dia_reset ?? hojeStr
    let buscasDia = profile.precos_buscas_dia ?? 0
    if (diaReset < hojeStr) buscasDia = 0
    if (buscasDia >= MAX_DIA) {
      return NextResponse.json({ error: 'limite_diario_atingido', buscasDia, maxDia: MAX_DIA, plano }, { status: 429 })
    }
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
    precoMercado,
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
    // Stats filtrados aos últimos 12 meses (só quando o usuário não filtrou datas)
    (!inicio && !fim)
      ? supabase.rpc('stats_precos', {
          p_termo:  termo.trim(),
          p_estado: estado || null,
          p_inicio: inicioDozeM,
          p_fim:    null,
        })
      : Promise.resolve({ data: null }),
    buscarPrecoMercado(termo.trim()),
  ])

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
  if (sErr) console.error('[stats_precos]', sErr.message)

  const geralRow  = statsGeral?.[0]  ?? null
  const dozeRow   = stats12m?.[0]    ?? null

  // Usa stats dos últimos 12 meses se tiver >= 5 resultados nesse período
  const MIN_RESULTADOS_12M = 5
  const usarDozeM = !inicio && !fim && dozeRow && Number(dozeRow.total) >= MIN_RESULTADOS_12M
  const stats     = usarDozeM ? dozeRow : geralRow
  const statsLabel = usarDozeM
    ? `Últimos 12 meses · ${dozeRow!.total} resultado${Number(dozeRow!.total) !== 1 ? 's' : ''}`
    : geralRow
      ? `Histórico completo · ${geralRow.total} resultado${Number(geralRow.total) !== 1 ? 's' : ''}`
      : null

  const updatePayload: Record<string, unknown> = {
    precos_buscas_mes: buscasUsadas + 1,
    precos_buscas_reset_em: primeiroDiaMes,
  }
  if (planoComLimiteDiario) {
    const diaReset = profile.precos_buscas_dia_reset ?? hojeStr
    const buscasDiaAtual = diaReset < hojeStr ? 0 : (profile.precos_buscas_dia ?? 0)
    updatePayload.precos_buscas_dia       = buscasDiaAtual + 1
    updatePayload.precos_buscas_dia_reset = hojeStr
  }
  await supabase.from('profiles').update(updatePayload).eq('id', user.id)

  return NextResponse.json({
    resultados:   resultados ?? [],
    stats,
    statsLabel,
    precoMercado,
    buscasUsadas: buscasUsadas + 1,
    maxBuscas,
    plano: profile.plano,
  })
}
