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

type AlertaDedup = {
  id: string
  criado_em: string
  enviado_em: string | null
  canais: string[]
  licitacoes: unknown
  keywords: string[]
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
  const ordenar  = sp.get('ordenar') ?? 'mais_recentes'

  const regioes = sp.get('regioes')?.split(',').filter(Boolean) ?? []
  const estadoLeg = sp.get('estado') ?? ''
  if (estadoLeg && regioes.length === 0) regioes.push(estadoLeg)

  const ufs = expandirParaUFs(regioes)

  const licJoin = (ufs || valorMin !== null || valorMax !== null)
    ? 'licitacoes!inner'
    : 'licitacoes'
  const kwJoin = kwTermo ? 'keywords!inner' : 'keywords'

  // Busca todos os alertas do usuário (sem paginação no banco) para que a
  // ordenação + dedup sejam aplicadas ao conjunto completo, não só à página atual.
  // Volume por usuário é pequeno — limitamos a 2000 como proteção.
  let query = supabase
    .from('alertas')
    .select(
      `id, criado_em, enviado_em, canais,
       ${licJoin}(orgao, objeto, url, estado, cidade, valor_estimado, data_abertura),
       ${kwJoin}(termo)`
    )
    .limit(2000)
    .order('enviado_em', { ascending: false, nullsFirst: false })

  if (ufs)      query = query.in('licitacoes.estado', ufs) as typeof query
  if (kwTermo)  query = query.eq('keywords.termo', kwTermo) as typeof query
  if (canal)    query = query.contains('canais', [canal]) as typeof query
  if (valorMin) query = query.gte('licitacoes.valor_estimado', valorMin) as typeof query
  if (valorMax) query = query.lte('licitacoes.valor_estimado', valorMax) as typeof query

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtro de texto livre
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

  // Deduplicar por licitação
  const licitacaoMap = new Map<string, AlertaDedup>()
  for (const a of resultado) {
    const lic = a.licitacoes as { orgao?: string; objeto?: string } | null
    const kw  = a.keywords  as { termo?: string } | null
    const licKey = `${lic?.orgao ?? ''}::${lic?.objeto ?? ''}`.slice(0, 100)
    const termo = kw?.termo ?? null

    if (!licitacaoMap.has(licKey)) {
      licitacaoMap.set(licKey, {
        id:         a.id,
        criado_em:  a.criado_em,
        enviado_em: a.enviado_em,
        canais:     [...(a.canais ?? [])],
        licitacoes: a.licitacoes,
        keywords:   termo ? [termo] : [],
      })
    } else {
      const existing = licitacaoMap.get(licKey)!
      if (termo && !existing.keywords.includes(termo)) existing.keywords.push(termo)
      if (a.enviado_em && (!existing.enviado_em || a.enviado_em > existing.enviado_em)) {
        existing.enviado_em = a.enviado_em
      }
    }
  }

  let dedup = [...licitacaoMap.values()]

  // Ordenação sobre o conjunto completo já deduplicado
  type Lic = { data_abertura?: string; valor_estimado?: number; orgao?: string }
  const getLic = (a: AlertaDedup) => a.licitacoes as Lic | null

  if (ordenar === 'mais_recentes') {
    dedup.sort((a, b) => {
      const ta = a.enviado_em ?? a.criado_em
      const tb = b.enviado_em ?? b.criado_em
      return tb.localeCompare(ta)
    })
  } else if (ordenar === 'data_proxima') {
    dedup.sort((a, b) => {
      const da = getLic(a)?.data_abertura ?? '9999'
      const db = getLic(b)?.data_abertura ?? '9999'
      return da.localeCompare(db)
    })
  } else if (ordenar === 'data_distante') {
    dedup.sort((a, b) => {
      const da = getLic(a)?.data_abertura ?? ''
      const db = getLic(b)?.data_abertura ?? ''
      return db.localeCompare(da)
    })
  } else if (ordenar === 'maior_valor') {
    dedup.sort((a, b) => (getLic(b)?.valor_estimado ?? 0) - (getLic(a)?.valor_estimado ?? 0))
  } else if (ordenar === 'menor_valor') {
    dedup.sort((a, b) => (getLic(a)?.valor_estimado ?? 0) - (getLic(b)?.valor_estimado ?? 0))
  } else if (ordenar === 'alfabetica') {
    dedup.sort((a, b) => (getLic(a)?.orgao ?? '').localeCompare(getLic(b)?.orgao ?? '', 'pt-BR'))
  }

  // Paginação em memória
  const total   = dedup.length
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const from    = (pagina - 1) * POR_PAGINA
  const pagData = dedup.slice(from, from + POR_PAGINA)

  return NextResponse.json({ data: pagData, total, pagina, paginas })
}
