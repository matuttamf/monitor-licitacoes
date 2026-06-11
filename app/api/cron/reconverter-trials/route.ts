/**
 * Cron: reconverter-trials
 * Horário: Ter/Qua/Qui às 10h BRT (13h UTC)
 *
 * Busca usuários com trial expirado que ainda não receberam
 * o e-mail de reconversão e envia campanha persuasiva.
 *
 * Prioridade: trials expirados há 1-3 dias (janela quente).
 * Também pega expirados há até 30 dias (janela fria, segunda chance).
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailReconversao } from '@/lib/emails/reconversao'
import { trackResend } from '@/lib/uso-apis'

export const maxDuration = 60

const MAX_LOTE = 15

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
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

  // Primeiro: expirados há 1-3 dias (prioridade máxima — janela quente)
  const { data: prioritarios } = await supabase
    .from('profiles')
    .select('id, email, nome, trial_fim, reconversao_email_em')
    .in('status', ['trial', 'expired'])
    .lt('trial_fim', limite1dia.toISOString())
    .gte('trial_fim', limite30dias.toISOString())
    .is('reconversao_email_em', null)
    .neq('email', adminEmail)
    .order('trial_fim', { ascending: false })
    .limit(MAX_LOTE)

  const leads = prioritarios ?? []

  if (!leads.length) {
    return NextResponse.json({ ok: true, enviados: 0, mensagem: 'Nenhum trial expirado pendente' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let enviados = 0
  let erros = 0

  for (const perfil of leads) {
    if (!perfil.email) continue

    const trialFim = new Date(perfil.trial_fim)
    const diasExpirado = Math.max(1, Math.floor((agora.getTime() - trialFim.getTime()) / 86400000))

    const { subject, html, text } = emailReconversao({
      nome:         perfil.nome ?? undefined,
      email:        perfil.email,
      diasExpirado,
    })

    try {
      trackResend()
      const { error: sendError } = await resend.emails.send({
        from: 'Monitor de Licitações <comercial@monitordelicitacoes.com.br>',
        to:   perfil.email,
        subject,
        html,
        text,
      })
      if (sendError) throw new Error(sendError.message)

      await supabase
        .from('profiles')
        .update({ reconversao_email_em: new Date().toISOString() })
        .eq('id', perfil.id)

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
