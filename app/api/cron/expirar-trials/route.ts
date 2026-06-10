import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
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

  // Limpeza automática: remover cron_logs com mais de 90 dias
  await supabase
    .from('cron_logs')
    .delete()
    .lt('criado_em', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  return NextResponse.json({ ok: true, expirados })
}
