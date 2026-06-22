import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { encontrarMatchesDetalhado } from '@/lib/matching/gemini'
import { calcularScore } from '@/lib/scoring'
import { estadoCompativelComRegioes } from '@/lib/regioes'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

// ─── Handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  try {
    return await runMatching()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('MATCHING CRASH:', msg, stack)
    return NextResponse.json({ ok: false, error: msg, stack }, { status: 500 })
  }
}

async function runMatching() {
  const supabase = await createServiceClient()

  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo, regiao, user_id')
    .eq('ativo', true)

  if (!keywords?.length) {
    return NextResponse.json({ ok: true, matches: 0, debug: 'sem keywords' })
  }

  const agora = new Date().toISOString()
  const hoje  = new Date().toISOString().substring(0, 10)

  // ── SCAN CONTÍNUO PAGINADO ────────────────────────────────────────────────
  // Todas as licitações abertas são varridas em ciclos contínuos usando cursor
  // de coletado_em. Quando o cursor chega ao fim, reinicia do início (novo ciclo).
  // Cada rodada do cron (a cada 10min) processa 1000 licitações.
  // Com ~12.000 licitações abertas → ciclo completo em ~2h → ~12 ciclos/dia.
  // Upsert com onConflict garante zero duplicatas.

  const { data: cfgCursor } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'matching_scan_cursor')
    .maybeSingle()
  const cursorAtual: string | null = cfgCursor?.valor ?? null

  let q = supabase
    .from('licitacoes')
    .select('id, objeto, data_abertura, estado, valor_estimado, coletado_em')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
    .order('coletado_em', { ascending: true })
    .limit(1000)
  if (cursorAtual) q = q.gt('coletado_em', cursorAtual) as typeof q

  const { data: batch, error: errBatch } = await q
  if (errBatch) console.error('Erro query scan:', errBatch)
  const candidatos = batch ?? []

  const cicloCompleto = candidatos.length < 1000

  const debugBase = {
    totalKeywords: keywords.length,
    candidatos:    candidatos.length,
    cursorAtual,
    cicloCompleto,
  }

  if (!candidatos.length) {
    // Fim de ciclo sem candidatos — reinicia cursor
    await supabase.from('configuracoes').delete().eq('chave', 'matching_scan_cursor')
    const resultado = { ok: true, matches: 0, ...debugBase }
    await registrarCronLog({ job: 'matching', status: 'ok', mensagem: `0 candidatos — ciclo reiniciado`, detalhes: resultado })
    return NextResponse.json(resultado)
  }

  console.log(`Matching: ${candidatos.length} candidatos, ${keywords.length} keywords, cursor=${cursorAtual?.substring(0, 10) ?? 'início'}`)

  // Confirmar matches com Gemini
  const { resultados: matches, lotes, lotesComErro, erros } =
    await encontrarMatchesDetalhado(
      candidatos.map(c => ({ id: c.id, objeto: c.objeto })),
      keywords.map(k => ({ id: k.id, termo: k.termo })),
    )

  if (erros.length > 0) console.error('Primeiro erro Gemini:', erros[0])

  // Buscar limites de valor por usuário
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

  const kwMap  = Object.fromEntries(keywords.map(k => [k.id, k]))
  const licMap = Object.fromEntries(candidatos.map(c => [c.id, c]))

  const alertasParaSalvar: {
    licitacao_id: string
    licitacao_id_str: string
    keyword_id: string
    profile_id: string
    user_id: string
    canais: string[]
    score: number
    score_keyword: number
    score_local: number
    score_valor: number
    valor_estimado: number | null
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
        licitacao_id:     m.licitacao_id,
        licitacao_id_str: m.licitacao_id,
        keyword_id:       kid,
        profile_id:       kw.user_id,
        user_id:          kw.user_id,
        canais:           [],
        score:            s.score,
        score_keyword:    s.score_keyword,
        score_local:      s.score_local,
        score_valor:      s.score_valor,
        valor_estimado:   lic.valor_estimado ?? null,
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
      { onConflict: 'licitacao_id,keyword_id', ignoreDuplicates: true }
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    fetch(`${appUrl}/api/cron/alertar`, {
      method:  'GET',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(console.error)
  }

  // ── Avançar cursor ou reiniciar ciclo ────────────────────────────────────
  if (cicloCompleto) {
    // Chegou ao fim — reinicia o ciclo do zero para o próximo scan
    await supabase.from('configuracoes').delete().eq('chave', 'matching_scan_cursor')
  } else if (candidatos.length > 0) {
    const ultimoColetadoEm = candidatos[candidatos.length - 1].coletado_em
    await supabase.from('configuracoes').upsert(
      { chave: 'matching_scan_cursor', valor: ultimoColetadoEm },
      { onConflict: 'chave' }
    )
  }

  const resultado = {
    ok: true,
    candidatos:       candidatos.length,
    totalKeywords:    keywords.length,
    matchesBrutos:    matches.length,
    alertasSalvos:    alertasParaSalvar.length,
    alertasPorUsuario,
    cicloCompleto,
    cursor:           cursorAtual?.substring(0, 10) ?? 'início',
    gemini: { lotes, lotesComErro, primeiroErro: erros[0] ?? null },
  }

  await registrarCronLog({
    job:      'matching',
    status:   'ok',
    mensagem: `${resultado.alertasSalvos} alertas salvos (${resultado.candidatos} candidatos${cicloCompleto ? ' — ciclo completo, reiniciando' : ''})`,
    detalhes: resultado,
  })

  return NextResponse.json(resultado)
}
