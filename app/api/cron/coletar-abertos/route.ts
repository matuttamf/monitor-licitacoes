/**
 * Cron: coletar-abertos
 *
 * Varre o PNCP pelo endpoint /proposta (data de abertura futura)
 * em vez de /publicacao (data de publicação).
 *
 * Captura licitações publicadas há meses mas com prazo ainda aberto,
 * que o cron principal (coletar) nunca vê por usar janela de 90 dias
 * de publicação.
 *
 * Agenda: 1x/dia às 4h (antes do coletar das 5h).
 * Cada execução troca as licitações abertas nas próximas 180 dias.
 */
import { NextResponse } from 'next/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { coletarPNCPAbertos } from '@/lib/scrapers/pncp-abertos'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const inicio = Date.now()

    // Coleta com horizonte de 180 dias, até 100 páginas por modalidade (5.000/mod = 60.000 total)
    const licitacoes = await coletarPNCPAbertos(180, 100)

    const salvas = await salvarLicitacoes(licitacoes)
    const segundos = Math.round((Date.now() - inicio) / 1000)

    const resultado = {
      ok:        true,
      coletadas: licitacoes.length,
      salvas,
      segundos,
    }

    await registrarCronLog({
      job:      'coletar-abertos',
      status:   'ok',
      mensagem: `${salvas} novas salvas (${licitacoes.length} coletadas em ${segundos}s)`,
      detalhes: resultado,
    })

    return NextResponse.json(resultado)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('coletar-abertos crash:', msg)
    await registrarCronLog({ job: 'coletar-abertos', status: 'erro', mensagem: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
