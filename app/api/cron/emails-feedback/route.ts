/**
 * Cron: E-mails de Feedback — roda 1x/dia.
 *
 * Parte A — Pós-trial: 5 dias após a tentativa de reativação (reconversao_email_em),
 *   se o usuário NÃO reativou, pede feedback sobre o que faltou. Envio único.
 * Parte B — Experiência (32 dias): assinante ativo há 32 dias da confirmação do
 *   pagamento recebe um pedido de feedback sobre a experiência. Envio único.
 *
 * Marcadores feedback_trial_em / feedback_uso_em garantem um envio por usuário.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { enviarEmailFeedbackTrial, enviarEmailFeedbackExperiencia } from '@/lib/emails/feedback'

export const maxDuration = 120

const DIAS_FEEDBACK_TRIAL = 5
const DIAS_FEEDBACK_USO    = 32

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createAdminClient()
  const adminEmail = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
  const agora = Date.now()
  let trialEnviados = 0, usoEnviados = 0

  // ── Parte A — feedback pós-trial (5 dias após a tentativa de reativação) ────
  const corteTrial = new Date(agora - DIAS_FEEDBACK_TRIAL * 24 * 60 * 60 * 1000).toISOString()
  const { data: posTrial } = await supabase
    .from('profiles')
    .select('id, email, nome')
    .in('status', ['trial', 'expired'])          // não reativou (active sairia daqui)
    .not('reconversao_email_em', 'is', null)
    .lte('reconversao_email_em', corteTrial)
    .is('feedback_trial_em', null)
    .neq('email', adminEmail)
    .limit(50)

  for (const p of posTrial ?? []) {
    if (!p.email) continue
    try {
      await enviarEmailFeedbackTrial(p.email, p.nome ?? null)
      await supabase.from('profiles').update({ feedback_trial_em: new Date().toISOString() }).eq('id', p.id)
      trialEnviados++
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.error('[emails-feedback] erro pós-trial:', p.id, e)
    }
  }

  // ── Parte B — feedback de experiência (32 dias de uso pago) ─────────────────
  const corteUso = new Date(agora - DIAS_FEEDBACK_USO * 24 * 60 * 60 * 1000).toISOString()
  const { data: emUso } = await supabase
    .from('profiles')
    .select('id, email, nome')
    .eq('status', 'active')
    .is('owner_id', null)
    .not('pagamento_confirmado_em', 'is', null)
    .lte('pagamento_confirmado_em', corteUso)
    .is('feedback_uso_em', null)
    .neq('email', adminEmail)
    .limit(50)

  for (const p of emUso ?? []) {
    if (!p.email) continue
    try {
      await enviarEmailFeedbackExperiencia(p.email, p.nome ?? null)
      await supabase.from('profiles').update({ feedback_uso_em: new Date().toISOString() }).eq('id', p.id)
      usoEnviados++
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.error('[emails-feedback] erro experiência:', p.id, e)
    }
  }

  await registrarCronLog({
    job: 'emails-feedback',
    status: 'ok',
    mensagem: `${trialEnviados} feedback(s) pós-trial, ${usoEnviados} feedback(s) de experiência`,
    detalhes: { trialEnviados, usoEnviados },
  })

  return NextResponse.json({ ok: true, trialEnviados, usoEnviados })
}
