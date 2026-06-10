import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { enviarAlertaEmailUsuario } from '@/lib/alerts/email'
import { registrarCronLog } from '@/lib/cron-log'
import { getLimites, HORARIOS_POR_QTD } from '@/lib/planos'

export const maxDuration = 300

/** Retorna hora e dia no fuso Brasília (UTC-3) */
function horasBrasilia(): { dia: number; hora: number } {
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
  return { dia: brasilia.getUTCDay(), hora: brasilia.getUTCHours() }
}

function dentroDoHorarioGlobal(): boolean {
  const { dia, hora } = horasBrasilia()
  if (dia >= 1 && dia <= 5) return hora >= 7 && hora <= 17
  if (dia === 6)            return hora >= 7 && hora <= 15
  return false
}

/** Verifica se a hora atual (BRT) está no schedule do usuário */
function horarioPermitidoParaUsuario(emailsPorDia: number, horaBRT: number): boolean {
  const horarios = HORARIOS_POR_QTD[emailsPorDia] ?? HORARIOS_POR_QTD[2]
  return horarios.includes(horaBRT)
}

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!dentroDoHorarioGlobal()) {
    await registrarCronLog({ job: 'alertar', status: 'ignorado', mensagem: 'Fora do horário permitido' })
    return NextResponse.json({ ok: true, motivo: 'Fora do horário permitido', enviados: 0 })
  }

  const { hora: horaBRT } = horasBrasilia()
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
    .order('score', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Erro ao buscar alertas:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 2. Reenvios:
  // - Se há novos pendentes: só reenviar os enviados há > 7 dias (evita duplicação no mesmo e-mail)
  // - Se fila VAZIA: reciclar TODOS os já enviados para licitações ainda abertas (ciclagem)
  const filaVazia = !novos?.length
  let reenviosQuery = supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .neq('canais', '{}')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, FILTRO_DATA)
    .order('score', { ascending: false })
    .limit(50)

  if (!filaVazia) {
    // modo normal: só reenviar os antigos (> 7 dias)
    reenviosQuery = reenviosQuery.lte('enviado_em', umaSemanAAtras)
  }
  // quando filaVazia: sem filtro de data → recicla todos os já enviados para licitações abertas

  const { data: reenvios } = await reenviosQuery

  const alertasPendentes = [
    ...(novos ?? []),
    ...(reenvios ?? []).map(a => ({ ...a, _reenvio: true })),
  ]

  if (!alertasPendentes.length) {
    return NextResponse.json({ ok: true, enviados: 0, pendentes: 0, filaVazia })
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
    .select('id, status, plano, telegram_chat_id, whatsapp, emails_por_dia, itens_por_email, trial_fim, email_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let totalEnviados = 0
  const resultadosPorUsuario: Record<string, unknown> = {}

  for (const [userId, alertas] of alertasPorUsuario.entries()) {
    const email  = emailMap[userId]
    const perfil = profileMap[userId]
    if (!email || perfil?.status === 'expired') continue
    // Canal e-mail pausado?
    if (perfil?.email_pausado_ate && new Date(perfil.email_pausado_ate) > new Date()) continue

    const plano   = perfil?.plano ?? 'basic'
    const limites = getLimites(plano)

    // Padrão por plano: 5 e-mails/dia com 10 itens cada = 50 licitações/dia para todos
    const emailsPorDia  = Math.min(perfil?.emails_por_dia  ?? 5,  limites.maxEmailsPorDia)
    const itensPorEmail = Math.min(perfil?.itens_por_email ?? 10, limites.maxItensPorEmail)

    // Verificar se este é um horário programado para o usuário
    if (!horarioPermitidoParaUsuario(emailsPorDia, horaBRT)) continue

    const planoEhTrial = perfil?.status === 'trial'
    const trialInfo = planoEhTrial && perfil?.trial_fim
      ? (() => {
          const fim = new Date(perfil.trial_fim)
          const dias = Math.max(0, Math.ceil((fim.getTime() - Date.now()) / 86400000))
          return { diasRestantes: dias, appUrl }
        })()
      : undefined

    // Separar novos de reenvios
    const novosAlertas    = alertas.filter(a => !(a as any)._reenvio)
    const reenviosAlertas = alertas.filter(a =>  (a as any)._reenvio)

    // Novos: cap por preferência do usuário
    const novosParaEnviar = novosAlertas.slice(0, itensPorEmail)
    const totalRestante   = novosAlertas.length - novosParaEnviar.length

    const alertasParaEnviar = [...novosParaEnviar, ...reenviosAlertas]
    if (!alertasParaEnviar.length) continue

    // Montar lista de licitações
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

    const canaisEnviados: string[] = []

    // E-mail: todos (com info de trial se aplicável)
    // Telegram/WA urgentes são gerenciados pelo /api/cron/alertar-urgente (a cada 5 min)
    const emailOk = await enviarAlertaEmailUsuario(email, licitacoesDoUsuario, totalRestante, trialInfo)
    if (emailOk) canaisEnviados.push('email')

    if (canaisEnviados.length > 0) {
      const ids = alertasParaEnviar.map(a => a.id)
      await supabase
        .from('alertas')
        .update({ canais: canaisEnviados, enviado_em: new Date().toISOString() })
        .in('id', ids)
      totalEnviados += alertasParaEnviar.length
    }

    resultadosPorUsuario[email] = {
      alertas:      alertasParaEnviar.length,
      canais:       canaisEnviados,
      emailsPorDia,
      itensPorEmail,
      horaBRT,
      ok: canaisEnviados.length > 0,
    }
  }

  const totalUsuarios = Object.keys(resultadosPorUsuario).length
  console.log(`Alertas: ${totalEnviados} enviados para ${totalUsuarios} usuários (BRT ${horaBRT}h)`)

  await registrarCronLog({
    job:      'alertar',
    status:   'ok',
    mensagem: `${totalEnviados} alertas para ${totalUsuarios} usuário(s) — BRT ${horaBRT}h`,
    detalhes: resultadosPorUsuario,
  })

  return NextResponse.json({ ok: true, enviados: totalEnviados, usuarios: totalUsuarios, horaBRT, detalhes: resultadosPorUsuario })
}
