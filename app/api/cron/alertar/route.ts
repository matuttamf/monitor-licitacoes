import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmail } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'

const BATCH_SIZE = 50       // Máximo de itens por e-mail
const MAX_EMAILS_DIA = 4    // Máximo de e-mails por dia

/**
 * Verifica se o momento atual está dentro do horário comercial.
 * Segunda a sexta, das 7h às 17h (horário de Brasília, UTC-3).
 */
function dentroDoHorarioComercial(): boolean {
  const agora = new Date()
  const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const dia = brasilia.getUTCDay()   // 0 = domingo, 6 = sábado
  const hora = brasilia.getUTCHours()
  return dia >= 1 && dia <= 5 && hora >= 7 && hora < 17
}

/**
 * Retorna o início do dia atual em horário de Brasília como string ISO UTC.
 */
function inicioDoDiaHoje(): string {
  const agora = new Date()
  const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  // Zera hora, minuto, segundo e milissegundo no horário de Brasília
  brasilia.setUTCHours(0, 0, 0, 0)
  // Converte de volta para UTC
  return new Date(brasilia.getTime() + 3 * 60 * 60 * 1000).toISOString()
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Só envia em horário comercial (segunda a sexta, 7h–17h, horário de Brasília)
  if (!dentroDoHorarioComercial()) {
    return NextResponse.json({
      ok: true,
      motivo: 'Fora do horário comercial. Envios suspensos.',
      enviados: 0,
    })
  }

  const supabase = await createServiceClient()

  // Verifica quantos lotes já foram enviados hoje
  const inicioHoje = inicioDoDiaHoje()
  const { count: enviadosHoje } = await supabase
    .from('alertas')
    .select('id', { count: 'exact', head: true })
    .contains('canais', ['email'])
    .gte('enviado_em', inicioHoje)

  const lotesEnviadosHoje = Math.ceil((enviadosHoje ?? 0) / BATCH_SIZE)

  if (lotesEnviadosHoje >= MAX_EMAILS_DIA) {
    return NextResponse.json({
      ok: true,
      motivo: `Limite diário de ${MAX_EMAILS_DIA} e-mails atingido.`,
      enviados: 0,
      lotesHoje: lotesEnviadosHoje,
    })
  }

  // Busca alertas pendentes, do mais antigo para o mais novo
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

  // Processa apenas o primeiro lote de até 50 alertas
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

  const lotesRestantesPermitidos = MAX_EMAILS_DIA - lotesEnviadosHoje - 1

  return NextResponse.json({
    ok: true,
    enviados: lote.length,
    pendentes: pendentesRestantes,
    canais: canaisEnviados,
    lotesEnviadosHoje: lotesEnviadosHoje + 1,
    lotesRestantesPermitidos,
    proximo_envio: pendentesRestantes > 0 && lotesRestantesPermitidos > 0
      ? 'No próximo ciclo do cron'
      : null,
  })
}
