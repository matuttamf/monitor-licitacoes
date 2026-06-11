/**
 * /api/cron/alertar-urgente
 *
 * Roda a cada 20 minutos durante o horário comercial (BRT 7-17h seg-sex, 7-15h sáb).
 * Envia 1 licitação por usuário por execução (a de maior score ainda não enviada).
 * Quando múltiplas keywords do mesmo usuário matchearam a mesma licitação, todas as
 * rows de alertas são marcadas como enviadas de uma vez — evita repetição no Telegram.
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'
import { enviarAlertaWhatsApp } from '@/lib/alerts/whatsapp'
import { registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 60

function dentroDoHorario(): boolean {
  const brt = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const dia  = brt.getUTCDay()
  const hora = brt.getUTCHours()
  if (dia >= 1 && dia <= 5) return hora >= 7 && hora <= 17
  if (dia === 6)            return hora >= 7 && hora <= 15
  return false
}

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!dentroDoHorario()) {
    return NextResponse.json({ ok: true, motivo: 'Fora do horário', enviados: 0 })
  }

  const supabase = await createServiceClient()
  const hoje     = new Date().toISOString().substring(0, 10)

  // Busca os top-50 alertas ainda não enviados via telegram/whatsapp
  // Limite alto para garantir que dedupliquemos por licitacao_id por usuário
  const { data: alertas, error } = await supabase
    .from('alertas')
    .select(`
      id, licitacao_id, canais, score,
      licitacoes!inner (orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
      keywords (termo, user_id)
    `)
    .not('canais', 'cs', '{"telegram"}')
    .not('canais', 'cs', '{"whatsapp"}')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, { referencedTable: 'licitacoes' })
    .order('score', { ascending: false })
    .limit(100)

  if (error) {
    console.error('alertar-urgente erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // filaVazia: quando não há novos alertas, recicla os já enviados há >24h e ainda abertos
  let filaVazia = false
  let alertasEfetivos = alertas ?? []

  if (!alertasEfetivos.length) {
    const h24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: reciclados } = await supabase
      .from('alertas')
      .select(`
        id, licitacao_id, canais, score,
        licitacoes!inner (orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
        keywords (termo, user_id)
      `)
      .or('canais.cs.{"telegram"},canais.cs.{"whatsapp"}')
      .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, { referencedTable: 'licitacoes' })
      .lt('enviado_em', h24)
      .order('score', { ascending: false })
      .limit(100)

    if (!reciclados?.length) {
      return NextResponse.json({ ok: true, enviados: 0, filaVazia: true })
    }
    alertasEfetivos = reciclados
    filaVazia = true
  }

  // Por usuário: escolhe a licitação de maior score (top 1) e coleta TODOS os IDs
  // de alertas da mesma licitação (keywords diferentes) para marcar todos como enviados.
  type EntradaUsuario = {
    topAlerta: typeof alertas[0]
    todasAsIds: string[]   // todos os IDs com mesmo licitacao_id deste usuário
  }
  const porUsuario = new Map<string, EntradaUsuario>()

  for (const a of alertasEfetivos) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue

    if (!porUsuario.has(uid)) {
      porUsuario.set(uid, { topAlerta: a, todasAsIds: [a.id] })
    } else {
      const entrada = porUsuario.get(uid)!
      if (a.licitacao_id === entrada.topAlerta.licitacao_id) {
        // Mesma licitação, keyword diferente — só adiciona o ID
        entrada.todasAsIds.push(a.id)
      }
      // Licitações diferentes são ignoradas nesta rodada (próximas rodadas cobrem)
    }
  }

  const userIds = [...porUsuario.keys()]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, telegram_chat_id, whatsapp, telegram_pausado_ate, whatsapp_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let enviados = 0
  const resultado: Record<string, unknown> = {}

  for (const [userId, { topAlerta, todasAsIds }] of porUsuario.entries()) {
    const perfil = profileMap[userId]
    if (!perfil || perfil.status === 'expired') continue

    const agora = new Date()
    const telegramPausado = perfil.telegram_pausado_ate && new Date(perfil.telegram_pausado_ate) > agora
    const whatsappPausado = perfil.whatsapp_pausado_ate && new Date(perfil.whatsapp_pausado_ate) > agora

    const temTelegram = !!perfil.telegram_chat_id && !telegramPausado
    const temWhatsApp = !!perfil.whatsapp         && !whatsappPausado

    if (!temTelegram && !temWhatsApp) continue

    const licitacoes = [{
      orgao:          (topAlerta.licitacoes as any).orgao,
      objeto:         (topAlerta.licitacoes as any).objeto,
      valor_estimado: (topAlerta.licitacoes as any).valor_estimado,
      data_abertura:  (topAlerta.licitacoes as any).data_abertura,
      url:            (topAlerta.licitacoes as any).url,
      estado:         (topAlerta.licitacoes as any).estado,
      cidade:         (topAlerta.licitacoes as any).cidade,
      keyword:        (topAlerta.keywords as any).termo,
    }]

    const [telegramOk, whatsappOk] = await Promise.all([
      temTelegram ? enviarAlertaTelegram(licitacoes, perfil.telegram_chat_id)  : Promise.resolve(false),
      temWhatsApp ? enviarAlertaWhatsApp(licitacoes, perfil.whatsapp)          : Promise.resolve(false),
    ])

    const canaisEnviados: string[] = []
    if (telegramOk)  canaisEnviados.push('telegram')
    if (whatsappOk)  canaisEnviados.push('whatsapp')

    if (canaisEnviados.length === 0) continue

    // Marca TODOS os alertas da mesma licitação (todas as keywords) como enviados —
    // evita reenvio em rodadas futuras por rows duplicadas da mesma licitação.
    const { data: atuais } = await supabase
      .from('alertas')
      .select('id, canais')
      .in('id', todasAsIds)

    await Promise.all(
      (atuais ?? []).map(atual => {
        const canaisNovos = [...new Set([...(atual.canais ?? []), ...canaisEnviados])]
        return supabase
          .from('alertas')
          .update({ canais: canaisNovos, enviado_em: new Date().toISOString() })
          .eq('id', atual.id)
      })
    )

    enviados++
    resultado[userId] = {
      licitacao_id: topAlerta.licitacao_id,
      ids_marcados: todasAsIds.length,
      canais:   canaisEnviados,
      telegram: telegramOk,
      whatsapp: whatsappOk,
    }
  }

  if (enviados > 0) {
    await registrarCronLog({
      job:      'alertar-urgente',
      status:   'ok',
      mensagem: `${enviados} alerta(s) via Telegram/WA para ${Object.keys(resultado).length} usuário(s)${filaVazia ? ' (reciclados)' : ''}`,
      detalhes: { ...resultado, filaVazia },
    })
  }

  return NextResponse.json({ ok: true, enviados, filaVazia, usuarios: Object.keys(resultado).length, detalhes: resultado })
}
