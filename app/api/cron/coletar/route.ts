import { NextResponse } from 'next/server'
import { coletarPNCP } from '@/lib/scrapers/pncp'
import { coletarComprasNet } from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario } from '@/lib/scrapers/querido-diario'
import { coletarGoogle } from '@/lib/scrapers/google'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'
import { encontrarMatchesDetalhado } from '@/lib/matching/gemini'
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

  // 0. Limpar licitações expiradas (mais de 1 dia após data de abertura)
  const supabaseClean = await createServiceClient()
  const ontemDate = new Date()
  ontemDate.setDate(ontemDate.getDate() - 1)
  const { count: removidas } = await supabaseClean
    .from('licitacoes')
    .delete({ count: 'exact' })
    .lt('data_abertura', ontemDate.toISOString().substring(0, 10))
    .not('data_abertura', 'is', null)
  console.log(`${removidas ?? 0} licitações expiradas removidas`)

  // 4a. Buscar keywords ativas antecipadamente para o Google
  const supabaseTemp = supabaseClean
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

  const supabase = supabaseTemp

  // 3. Buscar palavras-chave ativas
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo')
    .eq('ativo', true)

  if (!keywords?.length) {
    console.log('Nenhuma keyword ativa encontrada')
    return NextResponse.json({ ok: true, salvas, matches: 0, debug: 'sem keywords' })
  }

  console.log(`${keywords.length} keywords ativas`)

  // 4. Pré-filtro por texto — busca licitações das últimas 24h que contenham algum termo das keywords
  //    Muito mais eficiente: evita enviar centenas de licitações ao Gemini
  const termos = keywords.map(k => k.termo.toLowerCase())
  const filtroOr = termos.map(t => `objeto.ilike.%${t}%`).join(',')

  const { data: candidatos } = await supabase
    .from('licitacoes')
    .select('id, objeto')
    .gte('coletado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .or(filtroOr)
    .limit(200)

  console.log(`${candidatos?.length ?? 0} candidatos após pré-filtro de texto (de ${todasLicitacoes.length} coletadas)`)

  if (!candidatos?.length) {
    return NextResponse.json({ ok: true, salvas, matches: 0, debug: 'sem candidatos no pré-filtro' })
  }

  // 5. Disparar matching em endpoint separado (nova invocação Vercel — não bloqueia)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  fetch(`${appUrl}/api/cron/matching`, {
    method: 'GET',
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch(err => console.error('Erro ao disparar matching:', err))

  return NextResponse.json({
    ok: true,
    salvas,
    candidatos: candidatos.length,
    matches: 'disparado em /api/cron/matching',
  })
}
