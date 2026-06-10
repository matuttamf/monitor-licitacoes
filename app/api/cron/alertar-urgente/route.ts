/**
 * /api/cron/alertar-urgente
 *
 * Roda a cada 5 minutos durante o horário comercial (BRT 7-17h seg-sex, 7-15h sáb).
 * Envia TODOS os alertas pendentes por usuário (sem threshold de score), ordenados por
 * score desc — um batch via Telegram e outro via WhatsApp (se configurado), simultaneamente.
 * A mesma licitação vai para os dois canais ao mesmo tempo.
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

  // Busca O alerta de maior score ainda não enviado via telegram/whatsapp
  // Estratégia: 1 licitação por execução (cron a cada 10 min) — cadência controlada
  const { data: alertas, error } = await supabase
    .from('alertas')
    .select(`
      id, licitacao_id, canais, score,
      licitacoes!inner (orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
      keywords (termo, user_id)
    `)
    .not('canais', 'cs', '{"telegram"}')   // ainda não enviado via telegram
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, { referencedTable: 'licitacoes' })
    .order('score', { ascending: false })
    .limit(1)

  if (error) {
    console.error('alertar-urgente erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!alertas?.length) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  // Agrupar TODOS os alertas por usuário (não apenas o primeiro)
  const porUsuario = new Map<string, typeof alertas>()
  for (const a of alertas) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue
    if (!porUsuario.has(uid)) porUsuario.set(uid, [])
    porUsuario.get(uid)!.push(a)
  }

  const userIds = [...porUsuario.keys()]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, telegram_chat_id, whatsapp, telegram_pausado_ate, whatsapp_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let enviados = 0
  const resultado: Record<string, unknown> = {}

  for (const [userId, alertasDoUsuario] of porUsuario.entries()) {
    const perfil = profileMap[userId]
    if (!perfil || perfil.status === 'expired') continue

    const agora = new Date()
    const telegramPausado  = perfil.telegram_pausado_ate  && new Date(perfil.telegram_pausado_ate)  > agora
    const whatsappPausado  = perfil.whatsapp_pausado_ate  && new Date(perfil.whatsapp_pausado_ate)  > agora

    const temTelegram  = !!perfil.telegram_chat_id && !telegramPausado
    const temWhatsApp  = !!perfil.whatsapp         && !whatsappPausado

    if (!temTelegram && !temWhatsApp) continue

    // Montar lista de licitações para envio em batch
    const licitacoes = alertasDoUsuario.map(a => ({
      orgao:          (a.licitacoes as any).orgao,
      objeto:         (a.licitacoes as any).objeto,
      valor_estimado: (a.licitacoes as any).valor_estimado,
      data_abertura:  (a.licitacoes as any).data_abertura,
      url:            (a.licitacoes as any).url,
      estado:         (a.licitacoes as any).estado,
      cidade:         (a.licitacoes as any).cidade,
      keyword:        (a.keywords as any).termo,
    }))

    const canaisEnviados: string[] = []

    // Envia para Telegram e WhatsApp simultaneamente (mesmas licitações para os dois)
    const [telegramOk, whatsappOk] = await Promise.all([
      temTelegram
        ? enviarAlertaTelegram(licitacoes, perfil.telegram_chat_id)
        : Promise.resolve(false),
      temWhatsApp
        ? enviarAlertaWhatsApp(licitacoes, perfil.whatsapp)
        : Promise.resolve(false),
    ])

    if (telegramOk) canaisEnviados.push('telegram')
    if (whatsappOk) canaisEnviados.push('whatsapp')

    if (canaisEnviados.length > 0) {
      // Atualiza todos os alertas do usuário como enviados
      const ids = alertasDoUsuario.map(a => a.id)

      // Lê canais atuais e faz merge
      const { data: atuais } = await supabase
        .from('alertas')
        .select('id, canais')
        .in('id', ids)

      // Atualiza cada alerta adicionando os novos canais
      await Promise.all(
        (atuais ?? []).map(atual => {
          const canaisAtuais: string[] = atual.canais ?? []
          const canaisNovos = [...new Set([...canaisAtuais, ...canaisEnviados])]
          return supabase
            .from('alertas')
            .update({ canais: canaisNovos, enviado_em: new Date().toISOString() })
            .eq('id', atual.id)
        })
      )

      enviados += alertasDoUsuario.length
      resultado[userId] = {
        alertas:  alertasDoUsuario.length,
        canais:   canaisEnviados,
        telegram: telegramOk,
        whatsapp: whatsappOk,
      }
    }
  }

  if (enviados > 0) {
    await registrarCronLog({
      job:      'alertar-urgente',
      status:   'ok',
      mensagem: `${enviados} alerta(s) via Telegram/WA para ${Object.keys(resultado).length} usuário(s)`,
      detalhes: resultado,
    })
  }

  return NextResponse.json({ ok: true, enviados, usuarios: Object.keys(resultado).length, detalhes: resultado })
}
