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

  // Duas filas independentes: uma por canal.
  // WA recebe alertas ainda não enviados ao WA; Telegram idem para Telegram.
  // Quando ambos estão ativos, cada canal avança sua própria fila — nunca o mesmo alerta nos dois.
  const [
    { data: pendentesWA,  error: errWA },
    { data: pendentesTG,  error: errTG },
    { data: recicladosWA },
    { data: recicladosTG },
  ] = await Promise.all([
    supabase.from('alertas').select(SELECT_URGENTE)
      .not('canais', 'cs', '{"whatsapp"}')
      .gte('licitacoes.data_abertura', hoje)
      .order('score', { ascending: false }).limit(2000),
    supabase.from('alertas').select(SELECT_URGENTE)
      .not('canais', 'cs', '{"telegram"}')
      .gte('licitacoes.data_abertura', hoje)
      .order('score', { ascending: false }).limit(2000),
    supabase.from('alertas').select(SELECT_URGENTE)
      .contains('canais', ['whatsapp']).lt('enviado_em', h24)
      .gte('licitacoes.data_abertura', hoje)
      .order('score', { ascending: false }).limit(2000),
    supabase.from('alertas').select(SELECT_URGENTE)
      .contains('canais', ['telegram']).lt('enviado_em', h24)
      .gte('licitacoes.data_abertura', hoje)
      .order('score', { ascending: false }).limit(2000),
  ])

  if (errWA) {
    console.error('alertar-urgente erro WA:', errWA.message)
    return NextResponse.json({ error: errWA.message }, { status: 500 })
  }
  if (errTG) {
    console.error('alertar-urgente erro TG:', errTG.message)
    return NextResponse.json({ error: errTG.message }, { status: 500 })
  }

  // Agrupar por usuário — fila WA e fila Telegram separadas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filaWA  = new Map<string, any[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filaTG  = new Map<string, any[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reciWA  = new Map<string, any[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reciTG  = new Map<string, any[]>()

  for (const a of (pendentesWA ?? [])) {
    const uid = (a.keywords as any)?.user_id; if (!uid) continue
    if (!filaWA.has(uid)) filaWA.set(uid, [])
    filaWA.get(uid)!.push(a)
  }
  for (const a of (pendentesTG ?? [])) {
    const uid = (a.keywords as any)?.user_id; if (!uid) continue
    if (!filaTG.has(uid)) filaTG.set(uid, [])
    filaTG.get(uid)!.push(a)
  }
  for (const a of (recicladosWA ?? [])) {
    const uid = (a.keywords as any)?.user_id; if (!uid) continue
    if (!reciWA.has(uid)) reciWA.set(uid, [])
    reciWA.get(uid)!.push(a)
  }
  for (const a of (recicladosTG ?? [])) {
    const uid = (a.keywords as any)?.user_id; if (!uid) continue
    if (!reciTG.has(uid)) reciTG.set(uid, [])
    reciTG.get(uid)!.push(a)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function topDaFila(pend: any[], recic: any[]): { topAlerta: any; todasAsIds: string[]; reciclado: boolean } | null {
    const pool = pend.length ? pend : recic
    if (!pool.length) return null
    const top = pool[0]
    const ids = pool.filter(a => a.licitacao_id === top.licitacao_id).map(a => a.id)
    return { topAlerta: top, todasAsIds: ids, reciclado: pend.length === 0 }
  }

  // Conjunto de todos os usuários com algo para enviar em qualquer canal
  const todosUids = new Set([...filaWA.keys(), ...filaTG.keys(), ...reciWA.keys(), ...reciTG.keys()])

  const userIds = [...todosUids]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, bloqueado_admin, telegram_chat_id, whatsapp, telegram_pausado_ate, whatsapp_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function montarLicitacao(alerta: any) {
    return {
      orgao:          (alerta.licitacoes as any).orgao,
      objeto:         (alerta.licitacoes as any).objeto,
      valor_estimado: (alerta.licitacoes as any).valor_estimado,
      data_abertura:  (alerta.licitacoes as any).data_abertura,
      url:            (alerta.licitacoes as any).url,
      estado:         (alerta.licitacoes as any).estado,
      cidade:         (alerta.licitacoes as any).cidade,
      keyword:        (alerta.keywords as any).termo,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function marcarEnviado(ids: string[], canais: string[]) {
    const { data: atuais } = await supabase.from('alertas').select('id, canais').in('id', ids)
    await Promise.all(
      (atuais ?? []).map(atual => {
        const canaisNovos = [...new Set([...(atual.canais ?? []), ...canais])]
        return supabase.from('alertas')
          .update({ canais: canaisNovos, enviado_em: new Date().toISOString() })
          .eq('id', atual.id)
      })
    )
  }

  let enviados = 0
  const resultado: Record<string, unknown> = {}

  // Dispatch paralelo — 20 usuários simultâneos
  const CONCORRENCIA = 20
  const entries = [...todosUids].map(uid => uid)
  for (let i = 0; i < entries.length; i += CONCORRENCIA) {
    await Promise.all(entries.slice(i, i + CONCORRENCIA).map(async (userId) => {
      const perfil = profileMap[userId]
      if (!perfil || perfil.status === 'expired' || perfil.status === 'bloqueado' || perfil.bloqueado_admin) return

      const agora = new Date()
      const telegramPausado = perfil.telegram_pausado_ate && new Date(perfil.telegram_pausado_ate) > agora
      const whatsappPausado = perfil.whatsapp_pausado_ate && new Date(perfil.whatsapp_pausado_ate) > agora

      const temTelegram = !!perfil.telegram_chat_id && !telegramPausado
      const temWhatsApp = !!perfil.whatsapp         && !whatsappPausado

      if (!temTelegram && !temWhatsApp) return

      // Fila independente por canal — cada canal avança seus próprios alertas pendentes.
      // WA e Telegram nunca recebem o mesmo alerta; cada um drena sua fila separada.
      const entradaWA = temWhatsApp ? topDaFila(filaWA.get(userId) ?? [], reciWA.get(userId) ?? []) : null
      const entradaTG = temTelegram ? topDaFila(filaTG.get(userId) ?? [], reciTG.get(userId) ?? []) : null

      if (!entradaWA && !entradaTG) return

      const [whatsappOk, telegramOk] = await Promise.all([
        entradaWA ? enviarAlertaWhatsApp([montarLicitacao(entradaWA.topAlerta)], perfil.whatsapp) : Promise.resolve(false),
        entradaTG ? enviarAlertaTelegram([montarLicitacao(entradaTG.topAlerta)], perfil.telegram_chat_id) : Promise.resolve(false),
      ])

      if (whatsappOk && entradaWA) await marcarEnviado(entradaWA.todasAsIds, ['whatsapp'])
      if (telegramOk && entradaTG) await marcarEnviado(entradaTG.todasAsIds, ['telegram'])

      const canaisEnviados: string[] = []
      if (whatsappOk) canaisEnviados.push('whatsapp')
      if (telegramOk) canaisEnviados.push('telegram')

      if (canaisEnviados.length === 0) return

      enviados++
      resultado[userId] = {
        wa_licitacao_id: entradaWA?.topAlerta.licitacao_id,
        tg_licitacao_id: entradaTG?.topAlerta.licitacao_id,
        canais: canaisEnviados,
        whatsapp: whatsappOk,
        telegram: telegramOk,
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
