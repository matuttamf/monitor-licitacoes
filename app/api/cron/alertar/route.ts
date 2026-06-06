import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmailUsuario } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

function dentroDoHorarioPermitido(): boolean {
  const agora   = new Date()
  const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const dia  = brasilia.getUTCDay()  // 0=Dom 1=Seg … 5=Sex 6=Sáb
  const hora = brasilia.getUTCHours()

  // Segunda a sexta: horário comercial completo (07h–17h)
  if (dia >= 1 && dia <= 5) return hora >= 7 && hora < 17

  // Sábado: apenas manhã (07h–13h) — drenagem de fila excedente da semana
  if (dia === 6) return hora >= 7 && hora < 13

  return false // Domingo: nunca
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!dentroDoHorarioPermitido()) {
    await registrarCronLog({ job: 'alertar', status: 'ignorado', mensagem: 'Fora do horário permitido' })
    return NextResponse.json({ ok: true, motivo: 'Fora do horário permitido', enviados: 0 })
  }

  const supabase = await createServiceClient()

  // Configuração das queries de alertas
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

  // 1. Todos os alertas pendentes (canais vazio) para licitações ainda dentro do prazo
  //    Sem limite de janela de tempo: alertas que não foram enviados ficam na fila
  //    e saem no próximo envio. Ordenados do mais antigo para o mais novo (FIFO).
  const { data: novos, error } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .eq('canais', '{}')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, FILTRO_DATA)
    .order('criado_em', { ascending: true })
    .limit(300)

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

    const MAX_POR_EMAIL = 30

    // Novos alertas: limitados a MAX_POR_EMAIL (novas capturas que não foram enviadas)
    // Reenvios: não entram no limite — são lembretes de licitações já conhecidas
    const novosAlertas   = alertas.filter(a => !(a as any)._reenvio)
    const reenviosAlertas = alertas.filter(a => !!(a as any)._reenvio)

    const novosParaEnviar = novosAlertas.slice(0, MAX_POR_EMAIL)
    const totalRestante   = novosAlertas.length - novosParaEnviar.length

    // Reenvios sempre passam (independente do cap de novos)
    const alertasParaEnviar = [...novosParaEnviar, ...reenviosAlertas]

    const licitacoesDoUsuario = alertasParaEnviar.map(a => ({
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

    // Enviar e-mail para este usuário (com aviso de restantes se houver)
    const emailOk = await enviarAlertaEmailUsuario(emailUsuario, licitacoesDoUsuario, totalRestante)
    if (emailOk) canaisEnviados.push('email')

    // Telegram — envia se o usuário tiver configurado o chat_id
    const telegramChatId = telegramMap[userId]
    if (telegramChatId) {
      const telegramOk = await enviarAlertaTelegram(licitacoesDoUsuario, telegramChatId)
      if (telegramOk) canaisEnviados.push('telegram')
    }

    // Marcar apenas os alertas enviados neste lote como enviados
    if (canaisEnviados.length > 0) {
      const ids = alertasParaEnviar.map(a => a.id)
      await supabase
        .from('alertas')
        .update({ canais: canaisEnviados, enviado_em: new Date().toISOString() })
        .in('id', ids)
      totalEnviados += alertasParaEnviar.length
    }

    resultadosPorUsuario[emailUsuario] = {
      email: emailUsuario,
      alertas: alertasParaEnviar.length,
      ok: canaisEnviados.length > 0,
    }
  }

  const totalUsuarios = Object.keys(resultadosPorUsuario).length
  console.log(`Alertas enviados para ${totalUsuarios} usuários, ${totalEnviados} alertas no total`)

  await registrarCronLog({
    job:      'alertar',
    status:   'ok',
    mensagem: `${totalEnviados} alertas enviados para ${totalUsuarios} usuário(s)`,
    detalhes: resultadosPorUsuario,
  })

  return NextResponse.json({
    ok: true,
    enviados: totalEnviados,
    usuarios: totalUsuarios,
    detalhes: resultadosPorUsuario,
  })
}
