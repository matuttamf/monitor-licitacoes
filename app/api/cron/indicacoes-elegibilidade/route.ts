/**
 * Cron: Elegibilidade de Indicações — roda 1x/dia.
 *
 * 1. Gera o código pessoal de 8 caracteres para usuários ativos com +10 dias de
 *    assinatura confirmada que ainda não têm código (ficam "aptos a indicar").
 * 2. Se a campanha estiver ATIVA, avisa por e-mail + WhatsApp todos os aptos que
 *    ainda não foram notificados (broadcast único por usuário).
 *
 * A campanha nasce pausada; ao liberá-la no painel admin, o broadcast alcança
 * todos os aptos já existentes na próxima execução.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { gerarCodigoIndica, indicacoesAtiva, APTO_APOS_DIAS } from '@/lib/indicacoes'
import { enviarEmailIndicaApto } from '@/lib/emails/indicacoes'
import { enviarWAIndicaApto } from '@/lib/alerts/whatsapp'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createAdminClient()
  // Corte baseado em data calendário BRT (meia-noite), não em milissegundos desde o cron.
  // Garante que quem pagou em qualquer horário do dia D seja processado no dia D+10,
  // independente de ter pago antes ou depois do horário de execução do cron.
  const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  hoje.setHours(0, 0, 0, 0) // meia-noite BRT
  hoje.setDate(hoje.getDate() - APTO_APOS_DIAS)
  const corte = hoje.toISOString()

  // ── 1. Gerar códigos para novos aptos ──────────────────────────────────────
  const { data: novosAptos } = await supabase
    .from('profiles')
    .select('id')
    .eq('status', 'active')
    .is('owner_id', null)              // somente titulares (não sub-usuários)
    .is('indica_codigo', null)
    .not('pagamento_confirmado_em', 'is', null)
    .lte('pagamento_confirmado_em', corte)   // +10 dias da CONFIRMAÇÃO do pagamento
    .limit(500)

  let gerados = 0
  for (const p of novosAptos ?? []) {
    try {
      const codigo = await gerarCodigoIndica(supabase)
      const { error } = await supabase
        .from('profiles')
        .update({ indica_codigo: codigo, indica_apto_em: new Date().toISOString() })
        .eq('id', p.id)
        .is('indica_codigo', null)     // guarda contra corrida
      if (!error) gerados++
    } catch (e) {
      console.error('[indicacoes-elegibilidade] erro ao gerar código:', p.id, e)
    }
  }

  // ── 2. Broadcast de aptidão (somente se a campanha estiver ativa) ───────────
  let notificados = 0
  const ativa = await indicacoesAtiva(supabase)
  if (ativa) {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    const { data: aptos } = await supabase
      .from('profiles')
      .select('id, nome, email, whatsapp, indica_codigo')
      .eq('status', 'active')
      .not('indica_codigo', 'is', null)
      .eq('indica_notificado_apto', false)
      .limit(400)

    for (const u of aptos ?? []) {
      if (!u.indica_codigo) continue
      if (ADMIN_EMAIL && u.email === ADMIN_EMAIL) {
        await supabase.from('profiles').update({ indica_notificado_apto: true }).eq('id', u.id)
        continue
      }
      try {
        if (u.email) await enviarEmailIndicaApto(u.email, u.nome ?? null, u.indica_codigo)
        if (u.whatsapp) await enviarWAIndicaApto(u.whatsapp, u.nome ?? null, u.indica_codigo)
        await supabase.from('profiles').update({ indica_notificado_apto: true }).eq('id', u.id)
        notificados++
        await new Promise(r => setTimeout(r, 150)) // throttle anti-rate-limit
      } catch (e) {
        console.error('[indicacoes-elegibilidade] erro ao notificar apto:', u.id, e)
      }
    }
  }

  await registrarCronLog({
    job: 'indicacoes-elegibilidade',
    status: 'ok',
    mensagem: `${gerados} código(s) gerado(s), ${notificados} aviso(s) de aptidão${ativa ? '' : ' (campanha pausada)'}`,
    detalhes: { gerados, notificados, ativa },
  })

  return NextResponse.json({ ok: true, gerados, notificados, campanhaAtiva: ativa })
}
