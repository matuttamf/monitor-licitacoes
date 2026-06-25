/**
 * Cron: Liberação de Recompensas de Indicação — roda 1x/dia.
 *
 * Para cada indicação com status 'assinou' cuja carência de 10 dias já passou:
 *  - se o amigo cancelou/expirou na janela → marca 'cancelada' (não conta);
 *  - se o antifraude reprovar → marca 'fraude';
 *  - caso contrário → credita +30 dias ao indicador, marca 'liberada' e avisa.
 *
 * Ao acumular 10 indicações liberadas, o indicador vira candidato a afiliado e o
 * admin é alertado (uma vez). Recompensa NUNCA é liberada antes da carência.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import {
  indicacoesAtiva, checarFraude, COLUNAS_FRAUDE,
  CARENCIA_DIAS, RECOMPENSA_DIAS, LIMIAR_AFILIADO,
} from '@/lib/indicacoes'
import { enviarEmailIndicaRecompensa } from '@/lib/emails/indicacoes'
import { enviarWAIndicaRecompensa, notificarAdminCandidatoAfiliado } from '@/lib/alerts/whatsapp'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createAdminClient()

  // Campanha pausada → não libera recompensas (evita creditar enquanto desligada).
  if (!(await indicacoesAtiva(supabase))) {
    await registrarCronLog({ job: 'indicacoes-liberar', status: 'ok', mensagem: 'campanha pausada — nada liberado' })
    return NextResponse.json({ ok: true, liberadas: 0, motivo: 'campanha pausada' })
  }

  const corte = new Date(Date.now() - CARENCIA_DIAS * 24 * 60 * 60 * 1000).toISOString()

  const { data: pendentes } = await supabase
    .from('indicacoes')
    .select('id, indicador_id, indicado_id, valor_economia')
    .eq('status', 'assinou')
    .lte('assinatura_confirmada_em', corte)
    .limit(300)

  let liberadas = 0, canceladas = 0, fraudes = 0
  const indicadoresAfetados = new Set<string>()

  for (const ind of pendentes ?? []) {
    try {
      // O amigo ainda precisa estar ativo (não cancelou na carência).
      const { data: amigo } = await supabase
        .from('profiles')
        .select(`${COLUNAS_FRAUDE}, status`)
        .eq('id', ind.indicado_id)
        .maybeSingle()

      if (!amigo || (amigo as { status?: string }).status !== 'active') {
        await supabase.from('indicacoes').update({ status: 'cancelada' }).eq('id', ind.id)
        canceladas++
        continue
      }

      const { data: indicador } = await supabase
        .from('profiles')
        .select(COLUNAS_FRAUDE)
        .eq('id', ind.indicador_id)
        .maybeSingle()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fr = checarFraude(indicador as any, amigo as any)
      if (fr.fraude) {
        await supabase.from('indicacoes').update({ status: 'fraude', motivo_bloqueio: fr.motivo }).eq('id', ind.id)
        fraudes++
        continue
      }

      // Vira o status PRIMEIRO, com guarda de estado: só uma execução consegue
      // transicionar 'assinou' → 'liberada'. Evita crédito em dobro se o cron
      // sobrepuser. Só credita se esta chamada realmente fez a transição.
      const { data: transicao } = await supabase
        .from('indicacoes')
        .update({
          status: 'liberada',
          recompensa_liberada_em: new Date().toISOString(),
          recompensa_dias: RECOMPENSA_DIAS,
        })
        .eq('id', ind.id)
        .eq('status', 'assinou')
        .select('id')
      if (!transicao || transicao.length === 0) continue // já processada por outra execução

      // Crédito atômico ao indicador (+30 dias, + economia).
      const { error: errCred } = await supabase.rpc('creditar_indicacao', {
        p_indicador: ind.indicador_id,
        p_dias:      RECOMPENSA_DIAS,
        p_economia:  ind.valor_economia ?? 0,
      })
      if (errCred) {
        // Reverte a transição para nova tentativa no próximo ciclo (não perde a recompensa).
        console.error('[indicacoes-liberar] erro ao creditar — revertendo status:', errCred)
        await supabase.from('indicacoes').update({ status: 'assinou', recompensa_liberada_em: null }).eq('id', ind.id)
        continue
      }
      liberadas++
      indicadoresAfetados.add(ind.indicador_id)
    } catch (e) {
      console.error('[indicacoes-liberar] erro ao processar indicação:', ind.id, e)
    }
  }

  // ── Avisar indicadores + checar virada para candidato a afiliado ────────────
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  for (const indicadorId of indicadoresAfetados) {
    const { data: dono } = await supabase
      .from('profiles')
      .select('id, nome, email, whatsapp, indica_economia_total, afiliado_id, indica_afiliado_alertado')
      .eq('id', indicadorId)
      .maybeSingle()
    if (!dono) continue

    try {
      if (dono.email && dono.email !== ADMIN_EMAIL) {
        await enviarEmailIndicaRecompensa(dono.email, dono.nome ?? null, dono.indica_economia_total ?? 0)
      }
      if (dono.whatsapp) {
        await enviarWAIndicaRecompensa(dono.whatsapp, dono.nome ?? null, dono.indica_economia_total ?? 0)
      }
    } catch (e) {
      console.error('[indicacoes-liberar] erro ao avisar indicador:', indicadorId, e)
    }

    // Candidato a afiliado: 10+ liberadas, ainda não é afiliado, admin não avisado.
    if (!dono.afiliado_id && !dono.indica_afiliado_alertado) {
      const { count } = await supabase
        .from('indicacoes')
        .select('id', { count: 'exact', head: true })
        .eq('indicador_id', indicadorId)
        .eq('status', 'liberada')
      if ((count ?? 0) >= LIMIAR_AFILIADO) {
        await notificarAdminCandidatoAfiliado(dono.email ?? '—', dono.nome ?? null, count ?? 0).catch(() => {})
        await supabase.from('profiles').update({ indica_afiliado_alertado: true }).eq('id', indicadorId)
      }
    }
    await new Promise(r => setTimeout(r, 120))
  }

  await registrarCronLog({
    job: 'indicacoes-liberar',
    status: 'ok',
    mensagem: `${liberadas} liberada(s), ${canceladas} cancelada(s), ${fraudes} fraude(s)`,
    detalhes: { liberadas, canceladas, fraudes },
  })

  return NextResponse.json({ ok: true, liberadas, canceladas, fraudes })
}
