import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { ESTADOS_POR_REGIAO } from '@/lib/regioes'

function expandirParaUFs(regioes: string[]): string[] | null {
  if (regioes.length === 0 || regioes.includes('brasil')) return null
  const ufs = new Set<string>()
  for (const r of regioes) {
    const estados = ESTADOS_POR_REGIAO[r]
    if (estados) estados.forEach(uf => ufs.add(uf))
    else ufs.add(r.toUpperCase())
  }
  return [...ufs]
}

const POR_PAGINA = 20

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const pagina = Math.max(1, Number(searchParams.get('pagina') ?? '1'))
  const from   = (pagina - 1) * POR_PAGINA
  const to     = from + POR_PAGINA - 1

  // Buscar IDs das keywords do usuário
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id')
    .eq('user_id', user.id)
    .eq('ativo', true)

  if (!keywords?.length) return NextResponse.json({ data: [], total: 0, pagina: 1, paginas: 1 })

  const keywordIds = keywords.map(k => k.id)

  // Buscar alertas para obter licitacao_ids e keywords associadas
  const { data: alertas } = await supabase
    .from('alertas')
    .select('licitacao_id, keywords(termo)')
    .in('keyword_id', keywordIds)

  if (!alertas?.length) return NextResponse.json({ data: [], total: 0, pagina: 1, paginas: 1 })

  // Agrupar keywords por licitacao_id
  const keywordsPorLicitacao = new Map<string, string[]>()
  for (const a of alertas) {
    const termo = (a.keywords as unknown as { termo: string } | null)?.termo
    if (!termo) continue
    const lista = keywordsPorLicitacao.get(a.licitacao_id) ?? []
    if (!lista.includes(termo)) lista.push(termo)
    keywordsPorLicitacao.set(a.licitacao_id, lista)
  }

  const licitacaoIds = [...keywordsPorLicitacao.keys()]

  // Buscar licitações com filtros opcionais + paginação
  let query = supabase
    .from('licitacoes')
    .select('id, fonte, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade, coletado_em', { count: 'exact' })
    .in('id', licitacaoIds)
    .order('valor_estimado', { ascending: false, nullsFirst: false })
    .order('coletado_em',    { ascending: false })
    .range(from, to)

  // Região — aceita ?regioes=sul,RJ  e legado ?estado=SP
  const regioes = searchParams.get('regioes')?.split(',').filter(Boolean) ?? []
  const estadoLeg = searchParams.get('estado') ?? ''
  if (estadoLeg && regioes.length === 0) regioes.push(estadoLeg)
  const ufs = expandirParaUFs(regioes)
  if (ufs) query = query.in('estado', ufs) as typeof query

  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }
  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }
  if (searchParams.get('valor_max')) {
    query = query.lte('valor_estimado', Number(searchParams.get('valor_max')))
  }
  if (searchParams.get('fonte')) {
    query = query.eq('fonte', searchParams.get('fonte')!)
  }

  const { data: licitacoes, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total   = count ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  // Volume total de TODAS as licitações do usuário (não só da página)
  // Faz query leve buscando só valor_estimado de todos os IDs
  let volumeTotal = 0
  if (licitacaoIds.length > 0) {
    let volQuery = supabase
      .from('licitacoes')
      .select('valor_estimado')
      .in('id', licitacaoIds)
      .not('valor_estimado', 'is', null)
    const ufsVol = expandirParaUFs(regioes)
    if (ufsVol) volQuery = volQuery.in('estado', ufsVol) as typeof volQuery
    if (searchParams.get('valor_min')) volQuery = volQuery.gte('valor_estimado', Number(searchParams.get('valor_min')))
    if (searchParams.get('valor_max')) volQuery = volQuery.lte('valor_estimado', Number(searchParams.get('valor_max')))

    const { data: volRows } = await volQuery
    volumeTotal = (volRows ?? []).reduce((acc, r) => acc + (r.valor_estimado || 0), 0)
  }

  const resultado = (licitacoes ?? []).map(l => ({
    ...l,
    alertas: (keywordsPorLicitacao.get(l.id) ?? []).map(termo => ({
      keywords: { termo }
    }))
  }))

  return NextResponse.json({ data: resultado, total, pagina, paginas, volumeTotal })
}
