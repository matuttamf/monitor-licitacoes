import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encontrarMatchesDetalhado } from '@/lib/matching/gemini'

export const maxDuration = 300

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Buscar palavras-chave ativas
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo')
    .eq('ativo', true)

  if (!keywords?.length) {
    return NextResponse.json({ ok: true, matches: 0, debug: 'sem keywords' })
  }

  // Pré-filtro por texto nas licitações das últimas 48h
  const termos = keywords.map(k => k.termo.toLowerCase())
  const filtroOr = termos.map(t => `objeto.ilike.%${t}%`).join(',')

  const { data: candidatos } = await supabase
    .from('licitacoes')
    .select('id, objeto')
    .gte('coletado_em', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .or(filtroOr)
    .limit(200)

  if (!candidatos?.length) {
    return NextResponse.json({ ok: true, matches: 0, candidatos: 0 })
  }

  console.log(`Matching: ${candidatos.length} candidatos, ${keywords.length} keywords`)

  // Confirmar matches com Gemini
  const { resultados: matches, lotes, lotesComErro, erros } = await encontrarMatchesDetalhado(candidatos, keywords)

  console.log(`Gemini: ${lotes} lotes, ${lotesComErro} erros, ${matches.length} matches`)

  if (erros.length > 0) {
    console.error('Primeiro erro Gemini:', erros[0])
  }

  // Salvar alertas
  if (matches.length > 0) {
    const alertasParaSalvar = matches.flatMap(m =>
      m.keyword_ids.map(kid => ({
        licitacao_id: m.licitacao_id,
        keyword_id: kid,
        canais: [] as string[],
      }))
    )

    await supabase.from('alertas').upsert(alertasParaSalvar, {
      onConflict: 'licitacao_id,keyword_id',
      ignoreDuplicates: true,
    })

    // Disparar alertas por e-mail
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
    gemini: { lotes, lotesComErro, primeiroErro: erros[0] ?? null },
  })
}
