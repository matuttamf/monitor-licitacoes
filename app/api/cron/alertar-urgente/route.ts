/**
 * /api/cron/alertar-urgente
 *
 * Roda a cada 5 minutos durante o horário comercial (BRT 7-17h seg-sex, 7-15h sáb).
 * Envia UMA mensagem urgente (score ≥ 80) por usuário por execução via Telegram e WhatsApp.
 * O espaçamento natural de 5 min entre execuções é o intervalo entre mensagens.
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'
import { enviarAlertaWhatsApp } from '@/lib/alerts/whatsapp'
import { registrarCronLog } from '@/lib/cron-log'
import { temWhatsApp } from '@/lib/planos'
import { SCORE_MIN_URGENTE } from '@/lib/scoring'

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
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!dentroDoHorario()) {
    return NextResponse.json({ ok: true, motivo: 'Fora do horário', enviados: 0 })
  }

  const supabase = await createServiceClient()
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const hoje     = new Date().toISOString().substring(0, 10)

  // Busca alertas urgentes pendentes (ainda não enviados via telegram/whatsapp)
  // Ordena por score desc, pega os mais relevantes primeiro
  const { data: alertas, error } = await supabase
    .from('alertas')
    .select(`
      id, licitacao_id, canais, score,
      licitacoes!inner (orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
      keywords (termo, user_id)
    `)
    .gte('score', SCORE_MIN_URGENTE)
    .eq('canais', '{}')                                          // ainda não enviado
    .or(`data_abertura.is.null,data_abertura.gte.${hoje}`, { referencedTable: 'licitacoes' })
    .order('score', { ascending: false })
    .limit(200)

  if (error) {
    console.error('alertar-urgente erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!alertas?.length) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  // Agrupar por usuário — pegar apenas O PRIMEIRO (mais relevante) de cada um
  const porUsuario = new Map<string, typeof alertas[0]>()
  for (const a of alertas) {
    const uid = (a.keywords as any)?.user_id
    if (!uid || porUsuario.has(uid)) continue
    porUsuario.set(uid, a)
  }

  const userIds = [...porUsuario.keys()]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, plano, telegram_chat_id, whatsapp, telegram_pausado_ate, whatsapp_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let enviados = 0
  const resultado: Record<string, unknown> = {}

  for (const [userId, alerta] of porUsuario.entries()) {
    const perfil = profileMap[userId]
    if (!perfil || perfil.status === 'expired') continue

    const plano = perfil.plano ?? 'basic'
    const lic   = alerta.licitacoes as any

    const licitacao = {
      orgao:          lic.orgao,
      objeto:         lic.objeto,
      valor_estimado: lic.valor_estimado,
      data_abertura:  lic.data_abertura,
      url:            lic.url,
      estado:         lic.estado,
      cidade:         lic.cidade,
      keyword:        (alerta.keywords as any).termo,
    }

    const canaisEnviados: string[] = []

    const agora = new Date()

    // Telegram
    const telegramPausado = perfil.telegram_pausado_ate && new Date(perfil.telegram_pausado_ate) > agora
    if (perfil.telegram_chat_id && !telegramPausado) {
      const ok = await enviarAlertaTelegram([licitacao], perfil.telegram_chat_id)
      if (ok) canaisEnviados.push('telegram')
    }

    // WhatsApp (Profissional+)
    const whatsappPausado = perfil.whatsapp_pausado_ate && new Date(perfil.whatsapp_pausado_ate) > agora
    if (temWhatsApp(plano) && perfil.whatsapp && !whatsappPausado) {
      const ok = await enviarAlertaWhatsApp([licitacao], perfil.whatsapp)
      if (ok) canaisEnviados.push('whatsapp')
    }

    if (canaisEnviados.length > 0) {
      // Marca o canal enviado sem sobrescrever canais futuros (email ainda pode vir)
      // Usa array_cat para adicionar aos canais existentes
      const { data: atual } = await supabase
        .from('alertas')
        .select('canais')
        .eq('id', alerta.id)
        .single()

      const canaisAtuais: string[] = atual?.canais ?? []
      const canaisNovos  = [...new Set([...canaisAtuais, ...canaisEnviados])]

      await supabase
        .from('alertas')
        .update({ canais: canaisNovos, enviado_em: new Date().toISOString() })
        .eq('id', alerta.id)

      enviados++
      resultado[userId] = { canais: canaisEnviados, score: alerta.score }
    }
  }

  if (enviados > 0) {
    await registrarCronLog({
      job:      'alertar-urgente',
      status:   'ok',
      mensagem: `${enviados} urgente(s) via Telegram/WA`,
      detalhes: resultado,
    })
  }

  return NextResponse.json({ ok: true, enviados, detalhes: resultado })
}
