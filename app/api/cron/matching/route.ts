import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encontrarMatchesDetalhado } from '@/lib/matching/gemini'

export const maxDuration = 300

// Mapa região → estados brasileiros
const ESTADOS_POR_REGIAO: Record<string, string[]> = {
  norte:        ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  nordeste:     ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  sudeste:      ['ES', 'MG', 'RJ', 'SP'],
  sul:          ['PR', 'RS', 'SC'],
  centro_oeste: ['DF', 'GO', 'MS', 'MT'],
}

/** Retorna true se a licitação está na região da keyword */
function regiaoCompativel(
  estadoLicitacao: string | null | undefined,
  regiaoKeyword: string,
): boolean {
  if (!regiaoKeyword || regiaoKeyword === 'brasil') return true
  if (!estadoLicitacao) return true // sem estado definido → não filtra

  const uf = estadoLicitacao.toUpperCase().trim()

  // Keyword configurada como UF específica (ex: "SP", "MG")
  if (uf.length === 2 && !ESTADOS_POR_REGIAO[regiaoKeyword]) {
    return uf === regiaoKeyword.toUpperCase()
  }

  // Keyword configurada como grande região
  const estados = ESTADOS_POR_REGIAO[regiaoKeyword]
  return estados ? estados.includes(uf) : true
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Buscar palavras-chave ativas (incluindo regiao)
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo, regiao')
    .eq('ativo', true)

  if (!keywords?.length) {
    return NextResponse.json({ ok: true, matches: 0, debug: 'sem keywords' })
  }

  // Pré-filtro por texto nas licitações das últimas 48h
  const termos = keywords.map(k => k.termo.toLowerCase())
  const filtroOr = termos.map(t => `objeto.ilike.%${t}%`).join(',')

  const hoje = new Date().toISOString().substring(0, 10)

  const { data: candidatos } = await supabase
    .from('licitacoes')
    .select('id, objeto, data_abertura, estado')
    .gte('coletado_em', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
    .or(filtroOr)
    .limit(200)

  if (!candidatos?.length) {
    return NextResponse.json({ ok: true, matches: 0, candidatos: 0 })
  }

  console.log(`Matching: ${candidatos.length} candidatos, ${keywords.length} keywords`)

  // Confirmar matches com Gemini (passa apenas termo + id para o modelo)
  const { resultados: matches, lotes, lotesComErro, erros } = await encontrarMatchesDetalhado(
    candidatos,
    keywords.map(k => ({ id: k.id, termo: k.termo })),
  )

  console.log(`Gemini: ${lotes} lotes, ${lotesComErro} erros, ${matches.length} matches brutos`)

  if (erros.length > 0) console.error('Primeiro erro Gemini:', erros[0])

  // Construir mapa keyword_id → regiao
  const regiaoMap = Object.fromEntries(keywords.map(k => [k.id, k.regiao ?? 'brasil']))
  // Construir mapa licitacao_id → estado
  const estadoMap = Object.fromEntries(candidatos.map(c => [c.id, c.estado ?? null]))

  // Filtrar matches por região
  const alertasParaSalvar = matches.flatMap(m =>
    m.keyword_ids
      .filter(kid => regiaoCompativel(estadoMap[m.licitacao_id], regiaoMap[kid]))
      .map(kid => ({
        licitacao_id: m.licitacao_id,
        keyword_id: kid,
        canais: [] as string[],
      }))
  )

  const matchesFiltrados = alertasParaSalvar.length
  console.log(`Matching após filtro de região: ${matchesFiltrados} alertas`)

  if (alertasParaSalvar.length > 0) {
    await supabase.from('alertas').upsert(alertasParaSalvar, {
      onConflict: 'licitacao_id,keyword_id',
      ignoreDuplicates: true,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    fetch(`${appUrl}/api/cron/alertar`, {
      method: 'GET',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(console.error)
  }

  return NextResponse.json({
    ok: true,
    candidatos: candidatos.length,
    matches: matches.length,
    matchesFiltrados,
    gemini: { lotes, lotesComErro, primeiroErro: erros[0] ?? null },
  })
}
