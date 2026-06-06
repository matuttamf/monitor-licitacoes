import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encontrarMatchesDetalhado } from '@/lib/matching/gemini'
import { calcularScore, SCORE_MIN_EMAIL } from '@/lib/scoring'
import { estadoCompativelComRegioes } from '@/lib/regioes'

export const maxDuration = 300

// ─── Handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Buscar keywords ativas com regiao
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo, regiao, user_id')
    .eq('ativo', true)

  if (!keywords?.length) {
    return NextResponse.json({ ok: true, matches: 0, debug: 'sem keywords' })
  }

  // Pré-filtro textual nas licitações das últimas 48h
  const termos   = keywords.map(k => k.termo.toLowerCase())
  const filtroOr = termos.map(t => `objeto.ilike.%${t}%`).join(',')
  const hoje     = new Date().toISOString().substring(0, 10)

  const { data: candidatos } = await supabase
    .from('licitacoes')
    .select('id, objeto, data_abertura, estado, valor_estimado')
    .gte('coletado_em', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
    .or(filtroOr)
    .limit(200)

  if (!candidatos?.length) {
    return NextResponse.json({ ok: true, matches: 0, candidatos: 0 })
  }

  console.log(`Matching: ${candidatos.length} candidatos, ${keywords.length} keywords`)

  // Confirmar matches com Gemini
  const { resultados: matches, lotes, lotesComErro, erros } =
    await encontrarMatchesDetalhado(
      candidatos.map(c => ({ id: c.id, objeto: c.objeto })),
      keywords.map(k => ({ id: k.id, termo: k.termo })),
    )

  if (erros.length > 0) console.error('Primeiro erro Gemini:', erros[0])

  // Buscar min_valor_interesse por usuário (donos das keywords)
  const userIds = [...new Set(keywords.map(k => k.user_id).filter(Boolean))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, min_valor_interesse, max_valor_interesse')
    .in('id', userIds)
  const minValorMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p.min_valor_interesse ?? 0])
  )
  const maxValorMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p.max_valor_interesse ?? 0])
  )

  // Mapas auxiliares
  const kwMap      = Object.fromEntries(keywords.map(k => [k.id, k]))
  const licMap     = Object.fromEntries(candidatos.map(c => [c.id, c]))

  // Construir alertas com score
  const alertasParaSalvar: {
    licitacao_id: string
    keyword_id: string
    canais: string[]
    score: number
    score_keyword: number
    score_local: number
    score_valor: number
  }[] = []

  for (const m of matches) {
    const lic = licMap[m.licitacao_id]
    if (!lic) continue

    for (const kid of m.keyword_ids) {
      const kw = kwMap[kid]
      if (!kw) continue

      // Filtro de região (exclui totalmente se fora)
      if (!estadoCompativelComRegioes(lic.estado, kw.regiao)) continue

      const minValor = minValorMap[kw.user_id] ?? 0
      const maxValor = maxValorMap[kw.user_id] ?? 0

      const s = calcularScore({
        objeto:            lic.objeto,
        termo:             kw.termo,
        estadoLicitacao:   lic.estado,
        regiaoKeyword:     kw.regiao,
        valorLicitacao:    lic.valor_estimado,
        minValorInteresse: minValor,
        maxValorInteresse: maxValor,
      })

      // null = valor acima do máximo → descarta
      if (!s) continue

      // Só salva se score mínimo para e-mail — abaixo disso vai só pro painel (futuro)
      if (s.score >= SCORE_MIN_EMAIL) {
        alertasParaSalvar.push({
          licitacao_id:  m.licitacao_id,
          keyword_id:    kid,
          canais:        [],
          score:         s.score,
          score_keyword: s.score_keyword,
          score_local:   s.score_local,
          score_valor:   s.score_valor,
        })
      }
    }
  }

  console.log(`Gemini: ${lotes} lotes, ${lotesComErro} erros, ${matches.length} matches brutos, ${alertasParaSalvar.length} com score ≥ ${SCORE_MIN_EMAIL}`)

  if (alertasParaSalvar.length > 0) {
    // upsert: se já existe (licitacao+keyword), atualiza o score
    await supabase.from('alertas').upsert(
      alertasParaSalvar,
      { onConflict: 'licitacao_id,keyword_id', ignoreDuplicates: false }
    )

    // Disparar envio de alertas
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    fetch(`${appUrl}/api/cron/alertar`, {
      method:  'GET',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(console.error)
  }

  return NextResponse.json({
    ok: true,
    candidatos:       candidatos.length,
    matchesBrutos:    matches.length,
    alertasSalvos:    alertasParaSalvar.length,
    scoreMinEmail:    SCORE_MIN_EMAIL,
    gemini: { lotes, lotesComErro, primeiroErro: erros[0] ?? null },
  })
}
