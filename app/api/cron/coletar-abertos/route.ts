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
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { coletarPNCPAbertos, coletarPNCPDesertas } from '@/lib/scrapers/pncp-abertos'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  try {
    const inicio = Date.now()

    // Coleta em paralelo: abertos (180d horizonte) + desertas/fracassadas (últimos 30d)
    const [abertas, desertas] = await Promise.allSettled([
      coletarPNCPAbertos(180, 100),
      coletarPNCPDesertas(50),
    ])

    const licitacoes = [
      ...(abertas.status  === 'fulfilled' ? abertas.value  : []),
      ...(desertas.status === 'fulfilled' ? desertas.value : []),
    ]

    const salvas = await salvarLicitacoes(licitacoes)
    const segundos = Math.round((Date.now() - inicio) / 1000)

    const resultado = {
      ok:           true,
      coletadas:    licitacoes.length,
      abertas:      abertas.status  === 'fulfilled' ? abertas.value.length  : 0,
      desertas:     desertas.status === 'fulfilled' ? desertas.value.length : 0,
      salvas,
      segundos,
    }

    await registrarCronLog({
      job:      'coletar-abertos',
      status:   'ok',
      mensagem: `${salvas} novas (${resultado.abertas} abertas + ${resultado.desertas} desertas/fraç em ${segundos}s)`,
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
