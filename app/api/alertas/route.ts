import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

const POR_PAGINA = 20

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const pagina  = Math.max(1, Number(sp.get('pagina') ?? '1'))
  const busca   = sp.get('busca')?.trim() ?? ''
  const kwTermo = sp.get('keyword') ?? ''
  const canal   = sp.get('canal') ?? ''

  const from = (pagina - 1) * POR_PAGINA
  const to   = from + POR_PAGINA - 1

  let query = supabase
    .from('alertas')
    .select(`
      id, criado_em, enviado_em, canais,
      licitacoes(orgao, objeto, url, estado, cidade, valor_estimado, data_abertura),
      keywords(termo)
    `, { count: 'exact' })
    .order('enviado_em', { ascending: false })
    .range(from, to)

  // Filtro por palavra-chave (via join)
  if (kwTermo) {
    query = query.eq('keywords.termo', kwTermo)
  }

  // Filtro por canal
  if (canal) {
    query = query.contains('canais', [canal])
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtro de busca texto (client-side pós-fetch, campo vem do join)
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

  const total   = count ?? 0
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  return NextResponse.json({ data: resultado, total, pagina, paginas })
}
