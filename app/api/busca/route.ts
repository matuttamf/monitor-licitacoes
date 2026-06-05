import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const termo = searchParams.get('q') ?? ''
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const estado    = searchParams.get('estado')
  const dataInicio = searchParams.get('data_inicio')
  const valorMin  = searchParams.get('valor_min')
  const valorMax  = searchParams.get('valor_max')

  const cols = 'id, fonte, numero_edital, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade'

  // 1. Busca literal no campo objeto (todos os usuários)
  let textoQuery = supabase
    .from('licitacoes')
    .select(cols)
    .order('coletado_em', { ascending: false })
    .limit(100)

  if (termo) textoQuery = textoQuery.ilike('objeto', `%${termo}%`) as any
  if (estado) textoQuery = textoQuery.eq('estado', estado) as any
  if (dataInicio) textoQuery = textoQuery.gte('data_abertura', dataInicio) as any
  if (valorMin) textoQuery = textoQuery.gte('valor_estimado', Number(valorMin)) as any
  if (valorMax) textoQuery = textoQuery.lte('valor_estimado', Number(valorMax)) as any

  const { data: textoResults, error } = await textoQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 2. Busca semântica: licitações que foram alertadas para keywords do usuário que batem com o termo
  let semanticIds: string[] = []
  if (termo && user) {
    // Encontrar keywords do usuário que contenham o termo buscado
    const { data: kws } = await supabase
      .from('keywords')
      .select('id')
      .eq('user_id', user.id)
      .ilike('termo', `%${termo}%`)

    if (kws?.length) {
      const kwIds = kws.map(k => k.id)
      const { data: alertas } = await supabase
        .from('alertas')
        .select('licitacao_id')
        .in('keyword_id', kwIds)
        .limit(100)

      if (alertas?.length) {
        semanticIds = alertas.map(a => a.licitacao_id)
      }
    }
  }

  // 3. Buscar as licitações semânticas que não vieram na busca literal
  const textoIds = new Set((textoResults ?? []).map(l => l.id))
  const novosIds = semanticIds.filter(id => !textoIds.has(id))

  let semanticResults: typeof textoResults = []
  if (novosIds.length > 0) {
    let semQ = supabase
      .from('licitacoes')
      .select(cols)
      .in('id', novosIds)
      .order('coletado_em', { ascending: false })

    if (estado) semQ = semQ.eq('estado', estado) as any
    if (dataInicio) semQ = semQ.gte('data_abertura', dataInicio) as any
    if (valorMin) semQ = semQ.gte('valor_estimado', Number(valorMin)) as any
    if (valorMax) semQ = semQ.lte('valor_estimado', Number(valorMax)) as any

    const { data: semData } = await semQ
    semanticResults = semData ?? []
  }

  // 4. Combinar: texto literal primeiro, depois semânticos (marcados)
  const combined = [
    ...(textoResults ?? []),
    ...semanticResults.map(l => ({ ...l, _semantico: true })),
  ]

  return NextResponse.json(combined)
}
