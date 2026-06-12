import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = await createServiceClient()
  const agora = new Date().toISOString()

  // Expira trials vencidos
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

  // Expira assinaturas canceladas cujo período pago já terminou
  const { data: assinaturasExpiradas } = await supabase
    .from('profiles')
    .update({ status: 'expired', acesso_ate: null })
    .eq('status', 'active')
    .not('acesso_ate', 'is', null)
    .lt('acesso_ate', agora)
    .select('id')

  const expirados = data?.length ?? 0
  const assinaturasExp = assinaturasExpiradas?.length ?? 0
  console.log(`${expirados} trial(s) e ${assinaturasExp} assinatura(s) cancelada(s) expirada(s)`)

  // Limpeza automática: remover cron_logs com mais de 90 dias
  await supabase
    .from('cron_logs')
    .delete()
    .lt('criado_em', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  await registrarCronLog({
    job: 'expirar-trials',
    status: 'ok',
    mensagem: `${expirados} trial(s) + ${assinaturasExp} assinatura(s) cancelada(s) expirada(s)`,
  })
  return NextResponse.json({ ok: true, expirados })
}
