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

  // Ponteiro global do último matching incremental
  const { data: cfgUltimo } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'ultimo_matching_em')
    .maybeSingle()
  const ultimoMatching: string | null = cfgUltimo?.valor ?? null
  const agora = new Date().toISOString()

  // Usuários com keywords ativas
  const userIds = [...new Set(keywords.map(k => k.user_id).filter(Boolean))]

  // Identificar novos usuários (nunca tiveram matching inicial)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, matching_inicial_em, min_valor_interesse, max_valor_interesse')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const novosUserIds = new Set(
    userIds.filter(uid => !profileMap[uid]?.matching_inicial_em)
  )

  // ── Candidatos para novos usuários: todo o banco aberto ──────────────────
  const termosNovos = [...new Set(
    keywords.filter(k => novosUserIds.has(k.user_id)).map(k => k.termo.toLowerCase())
  )]

  // ── Candidatos incrementais: só licitações novas desde último matching ───
  const termosExistentes = [...new Set(
    keywords.filter(k => !novosUserIds.has(k.user_id)).map(k => k.termo.toLowerCase())
  )]

  const hoje = new Date().toISOString().substring(0, 10)

  const [resNovos, resIncrementais] = await Promise.all([
    // Novos usuários → todo o banco aberto
    termosNovos.length > 0
      ? supabase
          .from('licitacoes')
          .select('id, objeto, data_abertura, estado, valor_estimado, coletado_em')
          .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
          .or(termosNovos.map(t => `objeto.ilike.%${t}%`).join(','))
      : Promise.resolve({ data: [] }),

    // Usuários existentes → apenas licitações novas
    termosExistentes.length > 0
      ? (() => {
          let q = supabase
            .from('licitacoes')
            .select('id, objeto, data_abertura, estado, valor_estimado, coletado_em')
            .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
            .or(termosExistentes.map(t => `objeto.ilike.%${t}%`).join(','))
          if (ultimoMatching) q = q.gte('coletado_em', ultimoMatching) as typeof q
          return q
        })()
      : Promise.resolve({ data: [] }),
  ])

  // Mescla candidatos sem duplicatas
  const candidatosMap = new Map<string, NonNullable<typeof resNovos.data>[0]>()
  for (const l of [...(resNovos.data ?? []), ...(resIncrementais.data ?? [])]) {
    if (l && !candidatosMap.has(l.id)) candidatosMap.set(l.id, l)
  }
  const candidatos = [...candidatosMap.values()]

  if (!candidatos.length) {
    await supabase.from('configuracoes').upsert(
      { chave: 'ultimo_matching_em', valor: JSON.stringify(agora) },
      { onConflict: 'chave' }
    )
    return NextResponse.json({
      ok: true, matches: 0, candidatos: 0,
      novosUsuarios: novosUserIds.size, ultimoMatching,
    })
  }

  console.log(`Matching: ${candidatos.length} candidatos (${resNovos.data?.length ?? 0} novos + ${resIncrementais.data?.length ?? 0} incrementais), ${keywords.length} keywords`)

  // Confirmar matches com Gemini
  const { resultados: matches, lotes, lotesComErro, erros } =
    await encontrarMatchesDetalhado(
      candidatos.map(c => ({ id: c.id, objeto: c.objeto })),
      keywords.map(k => ({ id: k.id, termo: k.termo })),
    )

  if (erros.length > 0) console.error('Primeiro erro Gemini:', erros[0])

  const minValorMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p.min_valor_interesse ?? 0])
  )
  const maxValorMap = Object.fromEntries(
    (profiles ?? []).map(p => [p.id, p.max_valor_interesse ?? 0])
  )

  const kwMap  = Object.fromEntries(keywords.map(k => [k.id, k]))
  const licMap = Object.fromEntries(candidatos.map(c => [c.id, c]))

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

      const s = calcularScore({
        objeto:            lic.objeto,
        termo:             kw.termo,
        estadoLicitacao:   lic.estado,
        regiaoKeyword:     kw.regiao,
        valorLicitacao:    lic.valor_estimado,
        minValorInteresse: minValorMap[kw.user_id] ?? 0,
        maxValorInteresse: maxValorMap[kw.user_id] ?? 0,
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

  // Marcar novos usuários como inicializados
  if (novosUserIds.size > 0) {
    await supabase
      .from('profiles')
      .update({ matching_inicial_em: agora })
      .in('id', [...novosUserIds])
  }

  // Avançar ponteiro incremental
  await supabase.from('configuracoes').upsert(
    { chave: 'ultimo_matching_em', valor: JSON.stringify(agora) },
    { onConflict: 'chave' }
  )

  const resultado = {
    ok: true,
    candidatos:       candidatos.length,
    novosUsuarios:    novosUserIds.size,
    matchesBrutos:    matches.length,
    alertasSalvos:    alertasParaSalvar.length,
    alertasPorUsuario,
    gemini: { lotes, lotesComErro, primeiroErro: erros[0] ?? null },
  }

  await salvarResultadoCron(supabase, 'matching', resultado)

  return NextResponse.json(resultado)
}
