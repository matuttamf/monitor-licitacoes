import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Buscar IDs das keywords do usuário
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .eq('user_id', user.id)
    .eq('ativo', true)

  if (!keywords?.length) return NextResponse.json([])

  const keywordIds = keywords.map(k => k.id)

  // Buscar IDs de licitações que têm alertas com as keywords deste usuário
  let alertasQuery = supabase
    .from('alertas')
    .select('licitacao_id, keywords(termo)')
    .in('keyword_id', keywordIds)

  const { data: alertas } = await alertasQuery
  if (!alertas?.length) return NextResponse.json([])

  // Agrupar keywords por licitacao_id
  const keywordsPorLicitacao = new Map<string, string[]>()
  for (const a of alertas) {
    const termo = (a.keywords as any)?.termo
    if (!termo) continue
    const lista = keywordsPorLicitacao.get(a.licitacao_id) ?? []
    if (!lista.includes(termo)) lista.push(termo)
    keywordsPorLicitacao.set(a.licitacao_id, lista)
  }

  const licitacaoIds = [...keywordsPorLicitacao.keys()]

  // Buscar as licitações com filtros opcionais
  let query = supabase
    .from('licitacoes')
    .select('id, fonte, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade, coletado_em')
    .in('id', licitacaoIds)
    .order('coletado_em', { ascending: false })
    .limit(100)

  if (searchParams.get('estado')) {
    query = query.eq('estado', searchParams.get('estado')!)
  }
  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }
  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }

  const { data: licitacoes, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Montar resposta com keywords de cada licitação
  const resultado = (licitacoes ?? []).map(l => ({
    ...l,
    alertas: (keywordsPorLicitacao.get(l.id) ?? []).map(termo => ({
      keywords: { termo }
    }))
  }))

  return NextResponse.json(resultado)
}
