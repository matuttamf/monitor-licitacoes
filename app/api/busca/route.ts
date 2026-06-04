import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const termo = searchParams.get('q') ?? ''
  const supabase = await createClient()

  let query = supabase
    .from('licitacoes')
    .select('id, fonte, numero_edital, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade')
    .order('coletado_em', { ascending: false })
    .limit(100)

  if (termo) {
    query = query.ilike('objeto', `%${termo}%`)
  }

  if (searchParams.get('estado')) {
    query = query.eq('estado', searchParams.get('estado')!)
  }

  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }

  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }

  if (searchParams.get('valor_max')) {
    query = query.lte('valor_estimado', Number(searchParams.get('valor_max')))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
