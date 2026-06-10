import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { encontrarMatchesDetalhado } from '@/lib/matching/gemini'
import { calcularScore } from '@/lib/scoring'
import { estadoCompativelComRegioes } from '@/lib/regioes'
import { salvarResultadoCron } from '@/lib/cron-log'

export const maxDuration = 300

// ─── Handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
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

  // Buscar timestamp do último matching bem-sucedido
  const { data: cfgUltimoMatching } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'ultimo_matching_em')
    .maybeSingle()

  // Se nunca rodou, busca dos últimos 90 dias. Caso contrário, só novas desde então.
  const ultimoMatching: string | null = cfgUltimoMatching?.valor ?? null
  const agora = new Date().toISOString()

  // Pré-filtro textual nas licitações abertas
  const termos   = [...new Set(keywords.map(k => k.termo.toLowerCase()))]
  const filtroOr = termos.map(t => `objeto.ilike.%${t}%`).join(',')
  const hoje     = new Date().toISOString().substring(0, 10)

  // Busca licitações ainda não abertas, coletadas desde o último matching
  let query = supabase
    .from('licitacoes')
    .select('id, objeto, data_abertura, estado, valor_estimado')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
    .or(filtroOr)

  if (ultimoMatching) {
    query = query.gte('coletado_em', ultimoMatching) as typeof query
  }

  const { data: candidatos } = await query

  if (!candidatos?.length) {
    // Atualiza o timestamp mesmo sem candidatos para não reprocessar
    await supabase.from('configuracoes').upsert(
      { chave: 'ultimo_matching_em', valor: JSON.stringify(agora) },
      { onConflict: 'chave' }
    )
    return NextResponse.json({ ok: true, matches: 0, candidatos: 0, ultimoMatching })
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
  const kwMap  = Object.fromEntries(keywords.map(k => [k.id, k]))
  const licMap = Object.fromEntries(candidatos.map(c => [c.id, c]))

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

      if (!s) continue

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

  console.log(`Gemini: ${lotes} lotes, ${lotesComErro} erros, ${matches.length} matches brutos, ${alertasParaSalvar.length} alertas`)

  // Contagem de alertas por usuário para diagnóstico
  const alertasPorUsuario: Record<string, number> = {}
  for (const a of alertasParaSalvar) {
    const kw = kwMap[a.keyword_id]
    if (kw?.user_id) alertasPorUsuario[kw.user_id] = (alertasPorUsuario[kw.user_id] ?? 0) + 1
  }

  if (alertasParaSalvar.length > 0) {
    await supabase.from('alertas').upsert(
      alertasParaSalvar,
      { onConflict: 'licitacao_id,keyword_id', ignoreDuplicates: false }
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    fetch(`${appUrl}/api/cron/alertar`, {
      method:  'GET',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(console.error)
  }

  // Avançar o ponteiro de matching para agora
  await supabase.from('configuracoes').upsert(
    { chave: 'ultimo_matching_em', valor: JSON.stringify(agora) },
    { onConflict: 'chave' }
  )

  const resultado = {
    ok: true,
    candidatos:       candidatos.length,
    matchesBrutos:    matches.length,
    alertasSalvos:    alertasParaSalvar.length,
    alertasPorUsuario,
    incremental:      !!ultimoMatching,
    ultimoMatching,
    gemini: { lotes, lotesComErro, primeiroErro: erros[0] ?? null },
  }

  await salvarResultadoCron(supabase, 'matching', resultado)

  return NextResponse.json(resultado)
}
