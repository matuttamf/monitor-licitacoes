import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { atualizarValorAssinatura } from '@/lib/mercadopago'

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

  // Busca assinantes com desconto expirado e assinatura ainda ativa
  const { data: pendentes, error } = await supabase
    .from('profiles')
    .select('id, plano, periodo, mp_subscription_id, voucher_desconto_percentual')
    .eq('status', 'active')
    .not('voucher_desconto_ate', 'is', null)
    .lt('voucher_desconto_ate', agora)
    .not('mp_subscription_id', 'is', null)

  if (error) {
    console.error('[reverter-descontos] Erro ao buscar pendentes:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const revertidos: string[] = []
  const falhas: string[] = []

  for (const p of pendentes ?? []) {
    try {
      // Busca preço integral do plano
      const { data: planoData } = await supabase
        .from('planos')
        .select('preco, preco_anual')
        .eq('id', p.plano)
        .maybeSingle()

      if (!planoData) { falhas.push(p.id); continue }

      const precoIntegral = p.periodo === 'anual' ? planoData.preco_anual : planoData.preco

      const ok = await atualizarValorAssinatura(p.mp_subscription_id, precoIntegral)
      if (!ok) { falhas.push(p.id); continue }

      // Limpa campos de desconto
      await supabase
        .from('profiles')
        .update({
          voucher_desconto_percentual: null,
          voucher_desconto_meses:      null,
          voucher_desconto_ate:        null,
        })
        .eq('id', p.id)

      revertidos.push(p.id)
      console.log(`[reverter-descontos] ${p.id}: desconto revertido → R$${precoIntegral}`)
    } catch (err) {
      console.error(`[reverter-descontos] Erro profile ${p.id}:`, err)
      falhas.push(p.id)
    }
  }

  await registrarCronLog({
    job: 'reverter-descontos',
    status: falhas.length > 0 ? 'aviso' : 'ok',
    mensagem: `${revertidos.length} revertido(s)${falhas.length > 0 ? `, ${falhas.length} falha(s)` : ''}`,
    detalhes: falhas.length > 0 ? { falhas } : undefined,
  })

  return NextResponse.json({ ok: true, revertidos: revertidos.length, falhas: falhas.length })
}
