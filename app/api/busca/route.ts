import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { ESTADOS_POR_REGIAO } from '@/lib/regioes'

const POR_PAGINA = 20

/** Expande seleções (regiões + UFs) para lista plana de UFs */
function expandirParaUFs(regioes: string[]): string[] | null {
  if (regioes.length === 0 || regioes.includes('brasil')) return null  // sem filtro
  const ufs = new Set<string>()
  for (const r of regioes) {
    const estados = ESTADOS_POR_REGIAO[r]
    if (estados) estados.forEach(uf => ufs.add(uf))
    else ufs.add(r.toUpperCase())
  }
  return [...ufs]
}

export async function GET(request: NextRequest) {
  const sp         = request.nextUrl.searchParams
  const termo      = sp.get('q') ?? ''
  const regioes    = sp.get('regioes')?.split(',').filter(Boolean) ?? []
  // legado: ?estado=SP ainda funciona
  const estadoLeg  = sp.get('estado')
  if (estadoLeg && regioes.length === 0) regioes.push(estadoLeg)

  const dataInicio = sp.get('data_inicio')
  const valorMin   = sp.get('valor_min')
  const valorMax   = sp.get('valor_max')
  const pagina     = Math.max(1, Number(sp.get('pagina') ?? '1'))
  const ordenar    = sp.get('ordenar') ?? 'recente'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cols = 'id, fonte, numero_edital, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade'
  const hoje = new Date().toISOString().slice(0, 10)

  // Lista de UFs para filtro (null = sem filtro de localização)
  const ufs = expandirParaUFs(regioes)

  // 1. Busca literal no campo objeto
  let textoQuery = supabase
    .from('licitacoes')
    .select(cols, { count: 'exact' })
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)

  if (ordenar === 'valor')         textoQuery = textoQuery.order('valor_estimado', { ascending: false, nullsFirst: false }) as typeof textoQuery
  else if (ordenar === 'menor')    textoQuery = textoQuery.order('valor_estimado', { ascending: true,  nullsFirst: false }) as typeof textoQuery
  else if (ordenar === 'abertura') textoQuery = textoQuery.order('data_abertura',  { ascending: true,  nullsFirst: false }) as typeof textoQuery
  else /* recente (padrão) */      textoQuery = textoQuery.order('coletado_em', { ascending: false }) as typeof textoQuery

  if (termo)      textoQuery = textoQuery.ilike('objeto', `%${termo}%`) as typeof textoQuery
  if (ufs)        textoQuery = textoQuery.in('estado', ufs) as typeof textoQuery
  if (dataInicio) textoQuery = textoQuery.gte('data_abertura', dataInicio) as typeof textoQuery
  if (valorMin)   textoQuery = textoQuery.gte('valor_estimado', Number(valorMin)) as typeof textoQuery
  if (valorMax)   textoQuery = textoQuery.lte('valor_estimado', Number(valorMax)) as typeof textoQuery

  const from = (pagina - 1) * POR_PAGINA
  const to   = from + POR_PAGINA - 1
  textoQuery = textoQuery.range(from, to) as typeof textoQuery

  const { data: textoResults, count, error } = await textoQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 2. Busca semântica: licitações alertadas para keywords do usuário que batem com o termo
  let semanticIds: string[] = []
  if (termo) {
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
        .limit(200)

      if (alertas?.length) {
        semanticIds = alertas.map(a => a.licitacao_id)
      }
    }
  }

  // 3. Buscar licitações semânticas que não vieram na busca literal (apenas na primeira página)
  const textoIds = new Set((textoResults ?? []).map(l => l.id))
  let semanticResults: { id: string; fonte: string; numero_edital?: string; orgao: string; objeto: string; valor_estimado?: number; data_abertura?: string; url: string; estado?: string; cidade?: string }[] = []

  if (pagina === 1 && semanticIds.length > 0) {
    const novosIds = semanticIds.filter(id => !textoIds.has(id))
    if (novosIds.length > 0) {
      let semQ = supabase
        .from('licitacoes')
        .select(cols)
        .in('id', novosIds)
        .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
        .order('coletado_em', { ascending: false })
        .limit(POR_PAGINA)

      if (ufs)        semQ = semQ.in('estado', ufs) as typeof semQ
      if (dataInicio) semQ = semQ.gte('data_abertura', dataInicio) as typeof semQ
      if (valorMin)   semQ = semQ.gte('valor_estimado', Number(valorMin)) as typeof semQ
      if (valorMax)   semQ = semQ.lte('valor_estimado', Number(valorMax)) as typeof semQ

      const { data: semData } = await semQ
      semanticResults = semData ?? []
    }
  }

  // 4. Combinar: texto literal primeiro, depois semânticos (marcados)
  const combined = [
    ...(textoResults ?? []),
    ...semanticResults.map(l => ({ ...l, _semantico: true })),
  ]

  const total   = count ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  return NextResponse.json({ data: combined, total, pagina, paginas })
}
