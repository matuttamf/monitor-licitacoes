import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

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
    .order('coletado_em', { ascending: false })
    .range(from, to)

  if (searchParams.get('estado')) {
    query = query.eq('estado', searchParams.get('estado')!)
  }
  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }
  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }

  const { data: licitacoes, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total   = count ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  const resultado = (licitacoes ?? []).map(l => ({
    ...l,
    alertas: (keywordsPorLicitacao.get(l.id) ?? []).map(termo => ({
      keywords: { termo }
    }))
  }))

  return NextResponse.json({ data: resultado, total, pagina, paginas })
}
