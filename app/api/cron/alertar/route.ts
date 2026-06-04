import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmail } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Buscar alertas pendentes (sem canais enviados)
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
    .eq('canais', '{}') // ainda não enviado
    .gte('enviado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  if (!alertasPendentes?.length) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const licitacoesParaEnviar = alertasPendentes.map(a => ({
    id: a.licitacao_id,
    orgao: (a.licitacoes as any).orgao,
    objeto: (a.licitacoes as any).objeto,
    valor_estimado: (a.licitacoes as any).valor_estimado,
    data_abertura: (a.licitacoes as any).data_abertura,
    url: (a.licitacoes as any).url,
    keyword: (a.keywords as any).termo,
  }))

  const canaisEnviados: string[] = []

  const emailOk = await enviarAlertaEmail(licitacoesParaEnviar)
  if (emailOk) canaisEnviados.push('email')

  const telegramOk = await enviarAlertaTelegram(licitacoesParaEnviar)
  if (telegramOk) canaisEnviados.push('telegram')

  // Marcar como enviados
  if (canaisEnviados.length > 0) {
    const ids = alertasPendentes.map(a => a.id)
    await supabase
      .from('alertas')
      .update({ canais: canaisEnviados })
      .in('id', ids)
  }

  return NextResponse.json({ ok: true, enviados: alertasPendentes.length, canais: canaisEnviados })
}
