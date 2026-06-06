import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmailUsuario } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'
import { enviarAlertaWhatsApp } from '@/lib/alerts/whatsapp'
import { registrarCronLog } from '@/lib/cron-log'
import { temWhatsApp } from '@/lib/planos'
import { MAX_POR_EMAIL, SCORE_MIN_URGENTE } from '@/lib/scoring'

export const maxDuration = 300

function dentroDoHorarioPermitido(): boolean {
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const dia  = brasilia.getUTCDay()
  const hora = brasilia.getUTCHours()
  if (dia >= 1 && dia <= 5) return hora >= 7 && hora < 17
  if (dia === 6)            return hora >= 7 && hora < 13
  return false
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

  const supabase  = await createServiceClient()
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const hoje      = new Date().toISOString().substring(0, 10)
  const umaSemanAAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const SELECT_ALERTAS = `
    id, licitacao_id, keyword_id, canais, criado_em, enviado_em, score,
    licitacoes!inner (id, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
    keywords (id, termo, user_id)
  `
  const FILTRO_DATA = { referencedTable: 'licitacoes' }

  // 1. Pendentes (nunca enviados)
  const { data: novos, error } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .eq('canais', '{}')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, FILTRO_DATA)
    .order('score', { ascending: false })   // mais relevantes primeiro
    .limit(500)

  // 2. Reenvios (enviados há > 7 dias, licitação ainda aberta)
  const { data: reenvios } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .neq('canais', '{}')
    .lte('enviado_em', umaSemanAAtras)
    .or(`data_abratura.is.null,data_abertura.gte.${hoje}`, FILTRO_DATA)
    .order('score', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Erro ao buscar alertas:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const alertasPendentes = [
    ...(novos ?? []),
    ...(reenvios ?? []).map(a => ({ ...a, _reenvio: true })),
  ]

  if (!alertasPendentes.length) {
    return NextResponse.json({ ok: true, enviados: 0, pendentes: 0 })
  }

  // Agrupar por usuário
  const alertasPorUsuario = new Map<string, typeof alertasPendentes>()
  for (const a of alertasPendentes) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue
    if (!alertasPorUsuario.has(uid)) alertasPorUsuario.set(uid, [])
    alertasPorUsuario.get(uid)!.push(a)
  }

  const userIds = [...alertasPorUsuario.keys()]
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? [])
      .filter(u => userIds.includes(u.id))
      .map(u => [u.id, u.email!])
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, plano, telegram_chat_id, whatsapp')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let totalEnviados = 0
  const resultadosPorUsuario: Record<string, unknown> = {}

  for (const [userId, alertas] of alertasPorUsuario.entries()) {
    const email  = emailMap[userId]
    const perfil = profileMap[userId]
    if (!email || perfil?.status === 'expired') continue

    const plano = perfil?.plano ?? 'basic'

    // Separar novos de reenvios
    const novosAlertas    = alertas.filter(a => !(a as any)._reenvio)
    const reenviosAlertas = alertas.filter(a =>  (a as any)._reenvio)

    // Novos: cap de MAX_POR_EMAIL, ordenados por score desc (já vêm ordenados da query)
    const novosParaEnviar = novosAlertas.slice(0, MAX_POR_EMAIL)
    const totalRestante   = novosAlertas.length - novosParaEnviar.length

    const alertasParaEnviar = [...novosParaEnviar, ...reenviosAlertas]
    if (!alertasParaEnviar.length) continue

    // Montar lista de licitações com score
    const licitacoesDoUsuario = alertasParaEnviar.map(a => ({
      id:             a.licitacao_id,
      orgao:          (a.licitacoes as any).orgao,
      objeto:         (a.licitacoes as any).objeto,
      valor_estimado: (a.licitacoes as any).valor_estimado,
      data_abertura:  (a.licitacoes as any).data_abertura,
      url:            (a.licitacoes as any).url,
      estado:         (a.licitacoes as any).estado,
      cidade:         (a.licitacoes as any).cidade,
      keyword:        (a.keywords as any).termo,
      reenvio:        !!(a as any)._reenvio,
      score:          (a as any).score ?? 0,
    }))

    // Urgentes (score ≥ 80) → WA + Telegram
    const urgentes = licitacoesDoUsuario.filter(l => l.score >= SCORE_MIN_URGENTE)

    const canaisEnviados: string[] = []

    // E-mail: todos (score já filtrado no matching ≥ SCORE_MIN_EMAIL)
    const emailOk = await enviarAlertaEmailUsuario(email, licitacoesDoUsuario, totalRestante)
    if (emailOk) canaisEnviados.push('email')

    // Telegram: apenas urgentes (score ≥ 80)
    if (perfil?.telegram_chat_id && urgentes.length > 0) {
      const telegramOk = await enviarAlertaTelegram(urgentes, perfil.telegram_chat_id)
      if (telegramOk) canaisEnviados.push('telegram')
    }

    // WhatsApp: apenas Profissional+ E score ≥ 80
    if (temWhatsApp(plano) && perfil?.whatsapp && urgentes.length > 0) {
      const wppOk = await enviarAlertaWhatsApp(urgentes, perfil.whatsapp)
      if (wppOk) canaisEnviados.push('whatsapp')
    }

    if (canaisEnviados.length > 0) {
      const ids = alertasParaEnviar.map(a => a.id)
      await supabase
        .from('alertas')
        .update({ canais: canaisEnviados, enviado_em: new Date().toISOString() })
        .in('id', ids)
      totalEnviados += alertasParaEnviar.length
    }

    resultadosPorUsuario[email] = {
      alertas:  alertasParaEnviar.length,
      urgentes: urgentes.length,
      canais:   canaisEnviados,
      ok:       canaisEnviados.length > 0,
    }
  }

  const totalUsuarios = Object.keys(resultadosPorUsuario).length
  console.log(`Alertas: ${totalEnviados} enviados para ${totalUsuarios} usuários`)

  await registrarCronLog({
    job:      'alertar',
    status:   'ok',
    mensagem: `${totalEnviados} alertas para ${totalUsuarios} usuário(s)`,
    detalhes: resultadosPorUsuario,
  })

  return NextResponse.json({ ok: true, enviados: totalEnviados, usuarios: totalUsuarios, detalhes: resultadosPorUsuario })
}
