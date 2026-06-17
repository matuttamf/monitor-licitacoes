import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLimites } from '@/lib/planos'

export const dynamic = 'force-dynamic'

interface MLItem { price: number; currency_id: string }
interface MLResponse { results: MLItem[] }

async function buscarPrecoMercado(termo: string): Promise<{ media: number | null; minimo: number | null; total: number }> {
  try {
    const q = encodeURIComponent(termo.slice(0, 80))
    const res = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?q=${q}&limit=20&condition=new`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }
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

  // ── Resetar contador mensal se virou mês ─────────────────────────────────
  const resetEm = profile.precos_buscas_reset_em ?? primeiroDiaMes
  let buscasUsadas = profile.precos_buscas_mes ?? 0
  if (resetEm < primeiroDiaMes) {
    buscasUsadas = 0
    await supabase
      .from('profiles')
      .update({ precos_buscas_mes: 0, precos_buscas_reset_em: primeiroDiaMes })
      .eq('id', user.id)
  }

  // ── Verificar limite mensal (ilimitado = 99999) ───────────────────────────
  if (maxBuscas < 99999 && buscasUsadas >= maxBuscas) {
    return NextResponse.json({
      error: 'limite_atingido',
      buscasUsadas,
      maxBuscas,
      plano,
    }, { status: 429 })
  }

  // ── Limite diário para basic e trial (10 buscas/dia) ─────────────────────
  const MAX_DIA = 10
  const planoComLimiteDiario = plano === 'basic' || plano === 'trial'
  if (planoComLimiteDiario) {
    const diaReset = profile.precos_buscas_dia_reset ?? hojeStr
    let buscasDia = profile.precos_buscas_dia ?? 0
    if (diaReset < hojeStr) buscasDia = 0  // novo dia, zera

    if (buscasDia >= MAX_DIA) {
      return NextResponse.json({
        error: 'limite_diario_atingido',
        buscasDia,
        maxDia: MAX_DIA,
        plano,
      }, { status: 429 })
    }
  }

  const body = await req.json()
  const { termo, estado, inicio, fim, limite = 50, offset = 0 } = body

  if (!termo?.trim()) return NextResponse.json({ error: 'termo obrigatório' }, { status: 400 })

  // Buscar resultados, stats e preço de mercado em paralelo
  const [{ data: resultados, error: rErr }, { data: stats }, precoMercado] = await Promise.all([
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
    buscarPrecoMercado(termo.trim()),
  ])

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

  // Incrementar contadores (mensal + diário se aplicável)
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
    stats:        stats?.[0] ?? null,
    precoMercado,
    buscasUsadas: buscasUsadas + 1,
    maxBuscas,
    plano: profile.plano,
  })
}
