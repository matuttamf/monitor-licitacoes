import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('alertas')
    .select(`
      id, enviado_em, canais,
      licitacoes(orgao, objeto, url, estado, cidade),
      keywords(termo)
    `)
    .order('enviado_em', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
