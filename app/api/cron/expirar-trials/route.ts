import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const agora = new Date().toISOString()

  // Marca como expired todos os trials com trial_fim no passado
  const { data, error } = await supabase
    .from('profiles')
    .update({ status: 'expired' })
    .eq('status', 'trial')
    .lt('trial_fim', agora)
    .select('id')

  if (error) {
    console.error('Erro ao expirar trials:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const expirados = data?.length ?? 0
  console.log(`${expirados} trial(s) expirado(s) automaticamente`)

  return NextResponse.json({ ok: true, expirados })
}
