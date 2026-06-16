import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLimites } from '@/lib/planos'

export const dynamic = 'force-dynamic'

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

  // Buscar resultados e stats em paralelo
  const [{ data: resultados, error: rErr }, { data: stats, error: sErr }] = await Promise.all([
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
    resultados: resultados ?? [],
    stats: stats?.[0] ?? null,
    buscasUsadas: buscasUsadas + 1,
    maxBuscas,
    plano: profile.plano,
  })
}
