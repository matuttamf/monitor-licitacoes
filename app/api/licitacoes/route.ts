import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const supabase = await createClient()

  let query = supabase
    .from('licitacoes')
    .select(`
      id, fonte, numero_edital, orgao, objeto, valor_estimado,
      data_abertura, url, estado, cidade, coletado_em,
      alertas(keyword_id, keywords(termo))
    `)
    .not('alertas', 'is', null)
    .order('coletado_em', { ascending: false })
    .limit(50)

  if (searchParams.get('estado')) {
    query = query.eq('estado', searchParams.get('estado')!)
  }

  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }

  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
