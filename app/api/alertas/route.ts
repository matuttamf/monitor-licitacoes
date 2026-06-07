import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { ESTADOS_POR_REGIAO } from '@/lib/regioes'

const POR_PAGINA = 20

/** Expande regiões/UFs para lista plana de siglas; null = sem filtro */
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

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const pagina   = Math.max(1, Number(sp.get('pagina') ?? '1'))
  const busca    = sp.get('busca')?.trim() ?? ''
  const kwTermo  = sp.get('keyword') ?? ''
  const canal    = sp.get('canal') ?? ''
  const valorMin = sp.get('valor_min') ? Number(sp.get('valor_min')) : null
  const valorMax = sp.get('valor_max') ? Number(sp.get('valor_max')) : null

  // Regiões — aceita ?regioes=sul,RJ  e legado ?estado=SP
  const regioes = sp.get('regioes')?.split(',').filter(Boolean) ?? []
  const estadoLeg = sp.get('estado') ?? ''
  if (estadoLeg && regioes.length === 0) regioes.push(estadoLeg)

  const ufs = expandirParaUFs(regioes)

  // Usa !inner para filtrar no banco quando há filtro de localização ou valor
  // (alertas sempre têm licitação associada, então inner join é seguro)
  const licJoin = (ufs || valorMin !== null || valorMax !== null)
    ? 'licitacoes!inner'
    : 'licitacoes'
  // Usa !inner em keywords quando filtra por keyword (evita trazer alertas sem keyword)
  const kwJoin = kwTermo ? 'keywords!inner' : 'keywords'

  const from = (pagina - 1) * POR_PAGINA
  const to   = from + POR_PAGINA - 1

  let query = supabase
    .from('alertas')
    .select(
      `id, criado_em, enviado_em, canais,
       ${licJoin}(orgao, objeto, url, estado, cidade, valor_estimado, data_abertura),
       ${kwJoin}(termo)`,
      { count: 'exact' }
    )
    .order('enviado_em', { ascending: false, nullsFirst: false })
    .range(from, to)

  // Filtros no banco (nível de linha)
  if (ufs)           query = query.in('licitacoes.estado', ufs) as typeof query
  if (kwTermo)       query = query.eq('keywords.termo', kwTermo) as typeof query
  if (canal)         query = query.contains('canais', [canal]) as typeof query
  if (valorMin)      query = query.gte('licitacoes.valor_estimado', valorMin) as typeof query
  if (valorMax)      query = query.lte('licitacoes.valor_estimado', valorMax) as typeof query

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtro de texto livre — client-side (não tem suporte nativo em join)
  let resultado = data ?? []
  if (busca) {
    const termo = busca.toLowerCase()
    resultado = resultado.filter(a => {
      const lic = a.licitacoes as unknown as { orgao: string; objeto: string } | null
      const kw  = a.keywords  as unknown as { termo: string } | null
      return (
        lic?.orgao?.toLowerCase().includes(termo) ||
        lic?.objeto?.toLowerCase().includes(termo) ||
        kw?.termo?.toLowerCase().includes(termo)
      )
    })
  }

  // Desduplicar por licitação: agrupa keywords quando a mesma licitação
  // aparece várias vezes (uma linha por keyword que deu match)
  const licitacaoMap = new Map<string, typeof resultado[0] & { _termos: string[] }>()
  for (const a of resultado) {
    const lic = a.licitacoes as unknown as { orgao: string; objeto: string; url: string; estado: string; cidade: string; valor_estimado: number; data_abertura: string } | null
    const kw  = a.keywords  as unknown as { termo: string } | null
    const licKey = `${lic?.orgao ?? ''}::${lic?.objeto ?? ''}`.slice(0, 100)

    if (!licitacaoMap.has(licKey)) {
      licitacaoMap.set(licKey, { ...a, _termos: kw?.termo ? [kw.termo] : [] })
    } else {
      const existing = licitacaoMap.get(licKey)!
      if (kw?.termo && !existing._termos.includes(kw.termo)) {
        existing._termos.push(kw.termo)
      }
      // Mantém o mais recente enviado_em
      if (a.enviado_em && (!existing.enviado_em || a.enviado_em > existing.enviado_em)) {
        existing.enviado_em = a.enviado_em
      }
    }
  }

  // Constrói resultado final com keywords agregadas
  const dedup = [...licitacaoMap.values()].map(({ _termos, ...a }) => ({
    ...a,
    keywords: _termos,
  }))

  const total   = count ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  return NextResponse.json({ data: dedup, total, pagina, paginas })
}
