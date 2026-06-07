/**
 * GET  → retorna estado atual { captacao_ativa: boolean }
 * POST → { ativo: boolean } → altera estado
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

async function checarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL ? user : null
}

export async function GET(req: NextRequest) {
  const user = await checarAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const chave = req.nextUrl.searchParams.get('chave')
  const service = await createServiceClient()

  // Consulta de chave arbitrária (ex: captacao_backfill_data)
  if (chave && chave !== 'captacao_ativa') {
    const { data } = await service
      .from('configuracoes')
      .select('valor')
      .eq('chave', chave)
      .maybeSingle()
    return NextResponse.json({ chave, valor: data?.valor ?? null })
  }

  const { data } = await service
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_ativa')
    .maybeSingle()

  // Default: ativo se não encontrar
  const ativo = data ? data.valor !== false && data.valor !== 'false' : true
  return NextResponse.json({ captacao_ativa: ativo })
}

export async function POST(req: NextRequest) {
  const user = await checarAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { ativo } = await req.json() as { ativo: boolean }
  const service = await createServiceClient()

  await service
    .from('configuracoes')
    .upsert({ chave: 'captacao_ativa', valor: ativo }, { onConflict: 'chave' })

  return NextResponse.json({ captacao_ativa: ativo })
}
