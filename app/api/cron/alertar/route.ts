import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmail } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'

const BATCH_SIZE = 20

/**
 * Verifica se o momento atual está dentro do horário comercial.
 * Horário comercial: segunda a sexta, das 07h às 17h (horário de Brasília, UTC-3).
 */
function dentroDoHorarioComercial(): boolean {
  const agora = new Date()

  // Brasília = UTC-3
  const horarioBrasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000)

  const diaDaSemana = horarioBrasilia.getUTCDay() // 0 = domingo, 6 = sábado
  const hora = horarioBrasilia.getUTCHours()

  const ehDiaUtil = diaDaSemana >= 1 && diaDaSemana <= 5
  const ehHoraUtil = hora >= 7 && hora < 17

  return ehDiaUtil && ehHoraUtil
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Só envia em horário comercial (seg–sex, 07h–17h, horário de Brasília)
  if (!dentroDoHorarioComercial()) {
    return NextResponse.json({ ok: true, motivo: 'Fora do horário comercial. Envio suspenso.', enviados: 0 })
  }

  const supabase = await createServiceClient()

  // Busca os alertas pendentes (sem canais enviados), ordenados do mais antigo para o mais novo
  const { data: alertasPendentes } = await supabase
    .from('alertas')
    .select(`
      id,
      licitacao_id,
      keyword_id,
      canais,
      licitacoes (id, orgao, objeto, valor_estimado, data_abertura, url),
      keywords (termo)
    `)
    .eq('canais', '{}')
    .gte('enviado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('enviado_em', { ascending: true })

  if (!alertasPendentes?.length) {
    return NextResponse.json({ ok: true, enviados: 0, pendentes: 0 })
  }

  // Processa apenas o primeiro lote de até 20 alertas
  const lote = alertasPendentes.slice(0, BATCH_SIZE)
  const pendentesRestantes = alertasPendentes.length - lote.length

  const licitacoesDoLote = lote.map(a => ({
    id: a.licitacao_id,
    orgao: (a.licitacoes as any).orgao,
    objeto: (a.licitacoes as any).objeto,
    valor_estimado: (a.licitacoes as any).valor_estimado,
    data_abertura: (a.licitacoes as any).data_abertura,
    url: (a.licitacoes as any).url,
    keyword: (a.keywords as any).termo,
  }))

  const canaisEnviados: string[] = []

  const emailOk = await enviarAlertaEmail(licitacoesDoLote)
  if (emailOk) canaisEnviados.push('email')

  const telegramOk = await enviarAlertaTelegram(licitacoesDoLote)
  if (telegramOk) canaisEnviados.push('telegram')

  // Marca o lote como enviado
  if (canaisEnviados.length > 0) {
    const ids = lote.map(a => a.id)
    await supabase
      .from('alertas')
      .update({ canais: canaisEnviados })
      .in('id', ids)
  }

  return NextResponse.json({
    ok: true,
    enviados: lote.length,
    pendentes: pendentesRestantes,
    canais: canaisEnviados,
    proximo_envio: pendentesRestantes > 0 ? 'Em até 3 horas (próximo ciclo do cron)' : null,
  })
}
