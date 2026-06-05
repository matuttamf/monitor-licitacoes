import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmailUsuario } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'

export const maxDuration = 300

function dentroDoHorarioComercial(): boolean {
  const agora = new Date()
  const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const dia = brasilia.getUTCDay()
  const hora = brasilia.getUTCHours()
  return dia >= 1 && dia <= 5 && hora >= 7 && hora < 17
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!dentroDoHorarioComercial()) {
    return NextResponse.json({ ok: true, motivo: 'Fora do horário comercial', enviados: 0 })
  }

  const supabase = await createServiceClient()

  // Buscar alertas pendentes (canais vazio) criados nas últimas 48h
  // Inclui keyword (com user_id) e dados da licitação
  const hoje = new Date().toISOString().substring(0, 10)
  const umaSemanAAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const SELECT_ALERTAS = `
    id,
    licitacao_id,
    keyword_id,
    canais,
    criado_em,
    enviado_em,
    licitacoes!inner (id, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
    keywords (id, termo, user_id)
  `
  const FILTRO_DATA = { referencedTable: 'licitacoes' }

  // 1. Novos alertas ainda não enviados (últimas 48h)
  const { data: novos, error } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .eq('canais', '{}')
    .gte('criado_em', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, FILTRO_DATA)
    .order('criado_em', { ascending: true })
    .limit(150)

  // 2. Alertas já enviados há mais de 7 dias, mas licitação ainda aberta → reenvio
  const { data: reenvios } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .neq('canais', '{}')
    .lte('enviado_em', umaSemanAAtras)
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, FILTRO_DATA)
    .order('enviado_em', { ascending: true })
    .limit(50)

  const alertasPendentes = [
    ...(novos ?? []),
    ...(reenvios ?? []).map(a => ({ ...a, _reenvio: true })),
  ]

  if (error) {
    console.error('Erro ao buscar alertas:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!alertasPendentes?.length) {
    return NextResponse.json({ ok: true, enviados: 0, pendentes: 0 })
  }

  // Agrupar alertas por user_id (dono da keyword)
  const alertasPorUsuario = new Map<string, typeof alertasPendentes>()
  for (const alerta of alertasPendentes) {
    const userId = (alerta.keywords as any)?.user_id
    if (!userId) continue
    if (!alertasPorUsuario.has(userId)) alertasPorUsuario.set(userId, [])
    alertasPorUsuario.get(userId)!.push(alerta)
  }

  // Buscar emails de todos os usuários envolvidos
  const userIds = [...alertasPorUsuario.keys()]
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? [])
      .filter(u => userIds.includes(u.id))
      .map(u => [u.id, u.email!])
  )

  // Buscar status e telegram_chat_id dos usuários (só envia para trial/active)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, telegram_chat_id')
    .in('id', userIds)
  const statusMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.status]))
  const telegramMap = Object.fromEntries(
    (profiles ?? [])
      .filter(p => p.telegram_chat_id)
      .map(p => [p.id, p.telegram_chat_id as string])
  )

  let totalEnviados = 0
  const resultadosPorUsuario: Record<string, { email: string; alertas: number; ok: boolean }> = {}

  for (const [userId, alertas] of alertasPorUsuario.entries()) {
    const emailUsuario = emailMap[userId]
    const statusUsuario = statusMap[userId]

    // Pular usuários expirados ou sem email
    if (!emailUsuario || statusUsuario === 'expired') continue

    const licitacoesDoUsuario = alertas.map(a => ({
      id: a.licitacao_id,
      orgao: (a.licitacoes as any).orgao,
      objeto: (a.licitacoes as any).objeto,
      valor_estimado: (a.licitacoes as any).valor_estimado,
      data_abertura: (a.licitacoes as any).data_abertura,
      url: (a.licitacoes as any).url,
      estado: (a.licitacoes as any).estado,
      cidade: (a.licitacoes as any).cidade,
      keyword: (a.keywords as any).termo,
      reenvio: !!(a as any)._reenvio,
    }))

    const canaisEnviados: string[] = []

    // Enviar e-mail para este usuário
    const emailOk = await enviarAlertaEmailUsuario(emailUsuario, licitacoesDoUsuario)
    if (emailOk) canaisEnviados.push('email')

    // Telegram — envia se o usuário tiver configurado o chat_id
    const telegramChatId = telegramMap[userId]
    if (telegramChatId) {
      const telegramOk = await enviarAlertaTelegram(licitacoesDoUsuario, telegramChatId)
      if (telegramOk) canaisEnviados.push('telegram')
    }

    // Marcar alertas deste usuário como enviados
    if (canaisEnviados.length > 0) {
      const ids = alertas.map(a => a.id)
      await supabase
        .from('alertas')
        .update({ canais: canaisEnviados, enviado_em: new Date().toISOString() })
        .in('id', ids)
      totalEnviados += alertas.length
    }

    resultadosPorUsuario[emailUsuario] = {
      email: emailUsuario,
      alertas: alertas.length,
      ok: canaisEnviados.length > 0,
    }
  }

  console.log(`Alertas enviados para ${Object.keys(resultadosPorUsuario).length} usuários, ${totalEnviados} alertas no total`)

  return NextResponse.json({
    ok: true,
    enviados: totalEnviados,
    usuarios: Object.keys(resultadosPorUsuario).length,
    detalhes: resultadosPorUsuario,
  })
}
