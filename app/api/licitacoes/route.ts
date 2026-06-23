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

  const pagina  = Math.max(1, Number(searchParams.get('pagina') ?? '1'))
  const ordenar = searchParams.get('ordenar') ?? 'valor'

  const regioes = searchParams.get('regioes')?.split(',').filter(Boolean) ?? []
  const estadoLeg = searchParams.get('estado') ?? ''
  if (estadoLeg && regioes.length === 0) regioes.push(estadoLeg)
  const ufs = expandirParaUFs(regioes)

  const valorMin = searchParams.get('valor_min') ? Number(searchParams.get('valor_min')) : null
  const valorMax = searchParams.get('valor_max') ? Number(searchParams.get('valor_max')) : null
  const fonte    = searchParams.get('fonte') ?? null

  // RPC faz o JOIN alertas→licitacoes no banco — evita .in() com centenas de IDs
  const { data, error } = await supabase.rpc('buscar_licitacoes_usuario', {
    p_user_id:    user.id,
    p_pagina:     pagina,
    p_por_pagina: POR_PAGINA,
    p_ordenar:    ordenar,
    p_ufs:        ufs ?? null,
    p_valor_min:  valorMin,
    p_valor_max:  valorMax,
    p_fonte:      fonte,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
