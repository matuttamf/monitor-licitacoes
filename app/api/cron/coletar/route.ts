import { NextResponse } from 'next/server'
import { coletarPNCP } from '@/lib/scrapers/pncp'
import { coletarComprasNet } from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario } from '@/lib/scrapers/querido-diario'
import { coletarGoogle } from '@/lib/scrapers/google'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'
import { encontrarMatches } from '@/lib/matching/gemini'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 300 // 5 minutos (máximo Vercel)

export async function GET(request: Request) {
  // Verificar secret do cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  const dataInicio = ontem.toISOString().substring(0, 10)
  const dataFim = hoje.toISOString().substring(0, 10)

  console.log(`Iniciando coleta para ${dataInicio} a ${dataFim}`)

  // 4a. Buscar keywords ativas antecipadamente para o Google
  const supabaseTemp = await createServiceClient()
  const { data: keywordsTemp } = await supabaseTemp
    .from('keywords')
    .select('termo')
    .eq('ativo', true)
  const termosAtivos = keywordsTemp?.map(k => k.termo) ?? []

  // 1. Coletar de todas as fontes em paralelo
  const [pncp, comprasnet, queridoDiario, google] = await Promise.allSettled([
    coletarPNCP(dataInicio, dataFim),
    coletarComprasNet(dataInicio),
    coletarQueridoDiario(termosAtivos.slice(0, 5)),
    coletarGoogle(termosAtivos),
  ])

  const todasLicitacoes = [
    ...(pncp.status === 'fulfilled' ? pncp.value : []),
    ...(comprasnet.status === 'fulfilled' ? comprasnet.value : []),
    ...(queridoDiario.status === 'fulfilled' ? queridoDiario.value : []),
    ...(google.status === 'fulfilled' ? google.value : []),
  ]

  console.log(`Coletadas ${todasLicitacoes.length} licitações no total`)

  // 2. Salvar no banco (com deduplicação)
  const salvas = await salvarLicitacoes(todasLicitacoes)
  console.log(`${salvas} licitações novas salvas`)

  // 3. Buscar licitações de hoje para fazer matching
  const supabase = supabaseTemp
  const { data: licitacoesHoje } = await supabase
    .from('licitacoes')
    .select('id, objeto')
    .gte('coletado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // 4. Buscar palavras-chave ativas (com id para o matching)
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo')
    .eq('ativo', true)

  if (!licitacoesHoje?.length || !keywords?.length) {
    return NextResponse.json({ ok: true, salvas, matches: 0 })
  }

  // 5. Encontrar matches com Gemini
  const matches = await encontrarMatches(licitacoesHoje, keywords)

  // 6. Salvar alertas (evitar duplicatas)
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
  }

  console.log(`${matches.length} matches encontrados`)

  // 7. Disparar alertas (rota separada)
  if (matches.length > 0) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/alertar`, {
      method: 'GET',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true, salvas, matches: matches.length })
}
