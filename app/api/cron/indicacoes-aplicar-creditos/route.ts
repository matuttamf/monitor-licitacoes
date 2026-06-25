/**
 * Cron: Aplicação de Créditos de Indicação — roda 1x/dia.
 *
 * Entrega o prêmio de "+30 dias grátis" pausando a cobrança recorrente no
 * MercadoPago enquanto o crédito cobre o período. Modelo aprovado:
 * "acumular créditos + estender acesso".
 *
 * Parte A — abrir janela: assinante ativo com >= 30 dias de crédito cuja próxima
 *   cobrança MP está próxima → pausa a cobrança, estende acesso_ate em 30 dias,
 *   consome 30 créditos e marca credito_pausa_ate.
 * Parte B — expirar janela: chegando o fim da janela, se ainda há crédito,
 *   estende mais 30 dias (MP já pausado); senão, retoma a cobrança no MP.
 *
 * Créditos são sempre múltiplos de 30 (um por indicação), então cada janela
 * consome exatamente 30. status permanece 'active' o tempo todo (acesso normal);
 * o webhook reconhece credito_pausa_ate e não trata a pausa como cancelamento.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { indicacoesAtiva, RECOMPENSA_DIAS } from '@/lib/indicacoes'
import { alterarStatusAssinatura, buscarAssinatura } from '@/lib/mercadopago'

export const maxDuration = 300

const PROXIMIDADE_DIAS = 3 // aplica a pausa quando a cobrança está a até 3 dias

function emDias(dias: number): Date {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000)
}

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createAdminClient()
  if (!(await indicacoesAtiva(supabase))) {
    await registrarCronLog({ job: 'indicacoes-aplicar-creditos', status: 'ok', mensagem: 'campanha pausada' })
    return NextResponse.json({ ok: true, motivo: 'campanha pausada' })
  }

  const agora = new Date()
  let abertas = 0, estendidas = 0, retomadas = 0

  // ── Parte B — janelas que expiraram ────────────────────────────────────────
  const { data: expiradas } = await supabase
    .from('profiles')
    .select('id, mp_subscription_id, indica_creditos_dias, acesso_ate')
    .eq('status', 'active')
    .not('mp_subscription_id', 'is', null)
    .not('credito_pausa_ate', 'is', null)
    .lte('credito_pausa_ate', agora.toISOString())

  for (const p of expiradas ?? []) {
    try {
      if ((p.indica_creditos_dias ?? 0) >= RECOMPENSA_DIAS) {
        // Ainda há crédito → estende a janela (MP já está pausado).
        const novaJanela = emDias(RECOMPENSA_DIAS)
        await supabase.from('profiles').update({
          credito_pausa_ate:    novaJanela.toISOString(),
          acesso_ate:           novaJanela.toISOString(),
          indica_creditos_dias: (p.indica_creditos_dias ?? 0) - RECOMPENSA_DIAS,
        }).eq('id', p.id)
        estendidas++
      } else {
        // Sem mais crédito → retoma a cobrança no MP.
        const ok = await alterarStatusAssinatura(p.mp_subscription_id!, 'authorized')
        if (ok) {
          await supabase.from('profiles').update({ credito_pausa_ate: null }).eq('id', p.id)
          retomadas++
        } else {
          console.error('[indicacoes-aplicar-creditos] falha ao retomar MP:', p.id)
        }
      }
    } catch (e) {
      console.error('[indicacoes-aplicar-creditos] erro Parte B:', p.id, e)
    }
  }

  // ── Parte A — abrir janela para quem tem crédito e cobrança próxima ─────────
  const { data: comCredito } = await supabase
    .from('profiles')
    .select('id, mp_subscription_id, indica_creditos_dias, acesso_ate, credito_pausa_ate')
    .eq('status', 'active')
    .not('mp_subscription_id', 'is', null)
    .gte('indica_creditos_dias', RECOMPENSA_DIAS)
    .limit(300)

  for (const p of comCredito ?? []) {
    // Já em janela de crédito ativa? pula (será tratado na Parte B ao expirar).
    if (p.credito_pausa_ate && new Date(p.credito_pausa_ate) > agora) continue
    try {
      const sub = await buscarAssinatura(p.mp_subscription_id!)
      const prox = (sub?.next_payment_date ?? sub?.date_of_next_payment) as string | undefined
      if (!prox) continue
      const diasAteCobranca = (new Date(prox).getTime() - agora.getTime()) / 86400000
      if (diasAteCobranca > PROXIMIDADE_DIAS) continue // ainda longe — espera

      const ok = await alterarStatusAssinatura(p.mp_subscription_id!, 'paused')
      if (!ok) { console.error('[indicacoes-aplicar-creditos] falha ao pausar MP:', p.id); continue }

      const janela = emDias(RECOMPENSA_DIAS)
      const acessoAtual = p.acesso_ate ? new Date(p.acesso_ate) : agora
      const acessoNovo = janela > acessoAtual ? janela : acessoAtual
      await supabase.from('profiles').update({
        credito_pausa_ate:    janela.toISOString(),
        acesso_ate:           acessoNovo.toISOString(),
        indica_creditos_dias: (p.indica_creditos_dias ?? 0) - RECOMPENSA_DIAS,
      }).eq('id', p.id)
      abertas++
      await new Promise(r => setTimeout(r, 120))
    } catch (e) {
      console.error('[indicacoes-aplicar-creditos] erro Parte A:', p.id, e)
    }
  }

  await registrarCronLog({
    job: 'indicacoes-aplicar-creditos',
    status: 'ok',
    mensagem: `${abertas} janela(s) aberta(s), ${estendidas} estendida(s), ${retomadas} retomada(s)`,
    detalhes: { abertas, estendidas, retomadas },
  })

  return NextResponse.json({ ok: true, abertas, estendidas, retomadas })
}
