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
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
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

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  if (!dentroDoHorario()) {
    return NextResponse.json({ ok: true, motivo: 'Fora do horário', enviados: 0 })
  }

  const supabase = await createServiceClient()
  const hoje = new Date().toISOString().substring(0, 10)
  const h24  = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const SELECT_URGENTE = `
    id, licitacao_id, canais, score, enviado_em,
    licitacoes!inner (orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
    keywords (termo, user_id)
  `

  // Alertas novos (nunca enviados via telegram/whatsapp)
  const { data: pendentes, error } = await supabase
    .from('alertas')
    .select(SELECT_URGENTE)
    .not('canais', 'cs', '{"telegram"}')
    .not('canais', 'cs', '{"whatsapp"}')
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, { referencedTable: 'licitacoes' })
    .order('score', { ascending: false })
    .limit(2000)

  if (error) {
    console.error('alertar-urgente erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Alertas já enviados mas com licitação ainda aberta — usados como fila de reenvio
  // quando o usuário não recebe nada há mais de 24h (sem spam, sem silêncio)
  const { data: reciclados } = await supabase
    .from('alertas')
    .select(SELECT_URGENTE)
    .or('canais.cs.{"telegram"},canais.cs.{"whatsapp"}')
    .lt('enviado_em', h24)
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, { referencedTable: 'licitacoes' })
    .order('score', { ascending: false })
    .limit(2000)

  // Agrupar por usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendentesPorUsuario  = new Map<string, any[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recicladosPorUsuario = new Map<string, any[]>()

  for (const a of (pendentes ?? [])) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue
    if (!pendentesPorUsuario.has(uid)) pendentesPorUsuario.set(uid, [])
    pendentesPorUsuario.get(uid)!.push(a)
  }
  for (const a of (reciclados ?? [])) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue
    if (!recicladosPorUsuario.has(uid)) recicladosPorUsuario.set(uid, [])
    recicladosPorUsuario.get(uid)!.push(a)
  }

  type EntradaUsuario = { topAlerta: any; todasAsIds: string[]; reciclado: boolean }
  const porUsuario = new Map<string, EntradaUsuario>()

  // Para cada usuário: prefere novos; só recicla se não houve envio nas últimas 24h
  const todosUids = new Set([...pendentesPorUsuario.keys(), ...recicladosPorUsuario.keys()])
  for (const uid of todosUids) {
    const pend  = pendentesPorUsuario.get(uid)  ?? []
    const recic = recicladosPorUsuario.get(uid) ?? []
    const pool  = pend.length ? pend : recic
    if (!pool.length) continue
    const top = pool[0]
    const ids = pool.filter(a => a.licitacao_id === top.licitacao_id).map(a => a.id)
    porUsuario.set(uid, { topAlerta: top, todasAsIds: ids, reciclado: pend.length === 0 })
  }

  const userIds = [...porUsuario.keys()]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, telegram_chat_id, whatsapp, telegram_pausado_ate, whatsapp_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let enviados = 0
  const resultado: Record<string, unknown> = {}

  // Dispatch paralelo — 20 usuários simultâneos para suportar 10K+ usuários sem timeout
  const CONCORRENCIA = 20
  const entries = [...porUsuario.entries()]
  for (let i = 0; i < entries.length; i += CONCORRENCIA) {
    await Promise.all(entries.slice(i, i + CONCORRENCIA).map(async ([userId, { topAlerta, todasAsIds, reciclado }]) => {
      const perfil = profileMap[userId]
      if (!perfil || perfil.status === 'expired') return

      const agora = new Date()
      const telegramPausado = perfil.telegram_pausado_ate && new Date(perfil.telegram_pausado_ate) > agora
      const whatsappPausado = perfil.whatsapp_pausado_ate && new Date(perfil.whatsapp_pausado_ate) > agora

      const temTelegram = !!perfil.telegram_chat_id && !telegramPausado
      const temWhatsApp = !!perfil.whatsapp         && !whatsappPausado

      if (!temTelegram && !temWhatsApp) return

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

      if (canaisEnviados.length === 0) return

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
        canais:       canaisEnviados,
        telegram:     telegramOk,
        whatsapp:     whatsappOk,
        reciclado,
      }
    }))
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
