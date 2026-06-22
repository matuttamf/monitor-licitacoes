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

  // Reativa pausas expiradas (14 dias encerrados) — também reativa no MercadoPago
  const { data: pausasParaReativar, error: erroPausa } = await supabase
    .from('profiles')
    .select('id, mp_subscription_id')
    .eq('status', 'paused')
    .not('pausa_ate', 'is', null)
    .lt('pausa_ate', agora)

  if (erroPausa) console.error('Erro ao buscar pausas expiradas:', erroPausa.message)

  const MP_TOKEN = process.env.MP_AMBIENTE === 'production'
    ? process.env.MP_ACCESS_TOKEN_PROD!
    : process.env.MP_ACCESS_TOKEN_TEST!

  const pausasReativadasIds: string[] = []
  const pausasFalhadasIds: string[] = []
  for (const p of pausasParaReativar ?? []) {
    if (p.mp_subscription_id) {
      const res = await fetch(`https://api.mercadopago.com/preapproval/${p.mp_subscription_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MP_TOKEN}` },
        body: JSON.stringify({ status: 'authorized' }),
      })
      if (!res.ok) {
        const erroTexto = await res.text()
        console.error(`Erro ao reativar MP para profile ${p.id}:`, erroTexto)
        pausasFalhadasIds.push(p.id)
        continue
      }
    }
    await supabase.from('profiles').update({ status: 'active', pausa_ate: null }).eq('id', p.id)
    pausasReativadasIds.push(p.id)
  }

  const expirados = data?.length ?? 0
  const assinaturasExp = assinaturasExpiradas?.length ?? 0
  const pausasReativ = pausasReativadasIds.length
  console.log(`${expirados} trial(s), ${assinaturasExp} assinatura(s) cancelada(s) e ${pausasReativ} pausa(s) reativada(s)`)

  // Limpeza automática: remover cron_logs com mais de 90 dias
  await supabase
    .from('cron_logs')
    .delete()
    .lt('criado_em', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  await registrarCronLog({
    job: 'expirar-trials',
    status: pausasFalhadasIds.length > 0 ? 'aviso' : 'ok',
    mensagem: pausasFalhadasIds.length > 0
      ? `${expirados} trial(s) + ${assinaturasExp} cancelada(s) + ${pausasReativ} pausa(s) reativada(s) — ⚠️ ${pausasFalhadasIds.length} reativação(ões) MP falharam`
      : `${expirados} trial(s) + ${assinaturasExp} cancelada(s) + ${pausasReativ} pausa(s) reativada(s)`,
    detalhes: pausasFalhadasIds.length > 0 ? { pausas_falhadas: pausasFalhadasIds } : undefined,
  })
  return NextResponse.json({ ok: true, expirados, pausas_falhadas: pausasFalhadasIds })
}
