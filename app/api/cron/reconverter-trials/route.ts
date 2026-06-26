/**
 * Cron: reconverter-trials
 * Horário: seg-sex a cada hora 11-21 UTC (8-18h BRT) → "0 11-21 * * 1-5"
 *
 * Busca usuários com trial expirado que ainda não receberam
 * o e-mail de reconversão e envia campanha persuasiva.
 *
 * Prioridade: trials expirados há 1-3 dias (janela quente).
 * Também pega expirados há até 30 dias (janela fria, segunda chance).
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailReconversao } from '@/lib/emails/reconversao'
import { trackResend } from '@/lib/uso-apis'
import { enviarWAReconversao } from '@/lib/alerts/whatsapp'

export const maxDuration = 60

const MAX_LOTE = 15

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar se captação está ativa
  const { data: cfg } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_ativa')
    .maybeSingle()

  const captacaoAtiva = cfg ? cfg.valor !== false && cfg.valor !== 'false' : true
  if (!captacaoAtiva) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'sistema pausado' })
  }

  const agora = new Date()
  const limite30dias = new Date(agora); limite30dias.setDate(limite30dias.getDate() - 30)
  const limite1dia   = new Date(agora); limite1dia.setDate(limite1dia.getDate() - 1)

  // Buscar profiles com:
  // - status 'trial' e trial_fim < agora (expirado não marcado ainda), OU status 'expired'
  // - trial_fim nos últimos 30 dias
  // - sem reconversao_email_em
  // - não é admin
  const adminEmail = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

  // Perfis expirados — email está em auth.users, não em profiles
  const { data: prioritarios } = await supabase
    .from('profiles')
    .select('id, nome, whatsapp, trial_fim, reconversao_email_em')
    .in('status', ['trial', 'expired'])
    .lt('trial_fim', limite1dia.toISOString())
    .gte('trial_fim', limite30dias.toISOString())
    .is('reconversao_email_em', null)
    .order('trial_fim', { ascending: false })
    .limit(MAX_LOTE)

  const leads = prioritarios ?? []

  if (!leads.length) {
    return NextResponse.json({ ok: true, enviados: 0, mensagem: 'Nenhum trial expirado pendente' })
  }

  // Busca e-mails via auth.admin.listUsers (paginado)
  const uids = leads.map(l => l.id)
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    const users = pg?.users ?? []
    allAuthUsers.push(...users.filter(u => uids.includes(u.id)))
    if (users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email ?? '']))

  const resend = new Resend(process.env.RESEND_API_KEY)
  let enviados = 0
  let erros = 0

  for (const perfil of leads) {
    const email = emailMap[perfil.id]
    if (!email || email === adminEmail) continue

    const trialFim = new Date(perfil.trial_fim)
    const diasExpirado = Math.max(1, Math.floor((agora.getTime() - trialFim.getTime()) / 86400000))

    const { subject, html, text } = emailReconversao({
      nome:         perfil.nome ?? undefined,
      email,
      diasExpirado,
    })

    try {
      trackResend()
      const { error: sendError } = await resend.emails.send({
        from: 'Monitor de Licitações <comercial@monitordelicitacoes.com.br>',
        to:   email,
        subject,
        html,
        text,
      })
      if (sendError) throw new Error(sendError.message)

      await supabase
        .from('profiles')
        .update({ reconversao_email_em: new Date().toISOString() })
        .eq('id', perfil.id)

      if (perfil.whatsapp) await enviarWAReconversao(perfil.whatsapp, perfil.nome ?? null)

      enviados++
    } catch (e: unknown) {
      console.error(`[reconverter-trials] erro ${perfil.email}:`, e instanceof Error ? e.message : e)
      erros++
    }

    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`[reconverter-trials] enviados=${enviados} erros=${erros}`)
  const resultado = { ok: true, enviados, erros, total: leads.length }
  await registrarCronLog({ job: 'reconverter-trials', status: 'ok', mensagem: `${enviados} enviados`, detalhes: resultado })
  return NextResponse.json(resultado)
}
