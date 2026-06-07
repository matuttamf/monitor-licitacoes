import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { motivo, detalhe } = await req.json() as { motivo: string; detalhe?: string }
  if (!motivo) return NextResponse.json({ error: 'Motivo obrigatório' }, { status: 400 })

  const service = await createServiceClient()

  let plano: string | null = null
  if (user) {
    const { data: profile } = await service.from('profiles').select('plano').eq('id', user.id).maybeSingle()
    plano = profile?.plano ?? null
  }

  await service.from('cancelamentos').insert({
    user_id: user?.id ?? null,
    email:   user?.email ?? null,
    plano,
    motivo,
    detalhe: detalhe?.slice(0, 500) ?? null,
  })

  return NextResponse.json({ ok: true })
}
