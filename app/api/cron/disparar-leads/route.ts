/**
 * Cron: disparar-leads
 * Horário: seg-sex às 8h, 9h, 12h, 14h, 16h (horário de Brasília = UTC-3)
 *
 * Fluxo:
 *  0. Reset leads 'erro' há >4h → 'pendente' (retry automático)
 *  1. Enviar primeiro e-mail para leads 'pendente'
 *  2. Enviar follow-up D+4 e D+8 para leads 'enviado' que não abriram
 *
 * Sequência por lead:
 *  - D+0: primeiro e-mail (copy PAS por setor + contrato real como gancho)
 *  - D+4: follow-up 1 se abriu_em IS NULL e emails_enviados < 2
 *  - D+8: follow-up 2 (último) se abriu_em IS NULL e emails_enviados < 3
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailCaptacao, type LicitacaoResumida } from '@/lib/emails/captacao'
import { trackResend } from '@/lib/uso-apis'

// ─── Palavras-chave por segmento ──────────────────────────────────────────────
const KEYWORDS_SEGMENTO: Record<string, string[]> = {
  construção:   ['constru', 'obra', 'reform', 'paviment', 'engenharia', 'instalação elétrica', 'hidráulica'],
  tecnologia:   ['software', 'tecnologia', 'sistema', 'informática', 'computador', 'licença', 'suporte técnico'],
  saúde:        ['saúde', 'hospital', 'médico', 'farmacêutico', 'laboratório', 'insumo', 'medicamento'],
  limpeza:      ['limpeza', 'conservação', 'higienização', 'zeladoria', 'saneamento'],
  segurança:    ['vigilância', 'segurança patrimonial', 'monitoramento', 'portaria'],
  transporte:   ['transporte', 'logística', 'frete', 'veículo', 'frota', 'ônibus', 'escolar'],
  alimentação:  ['alimentação', 'refeição', 'merenda', 'gêneros alimentícios', 'buffet', 'nutrição'],
  consultoria:  ['consultoria', 'assessoria', 'gestão', 'auditoria', 'planejamento'],
  educação:     ['treinamento', 'capacitação', 'curso', 'ensino', 'educação'],
  manutenção:   ['manutenção', 'reparo', 'assistência técnica', 'calibração'],
  jardinagem:   ['paisagismo', 'jardinagem', 'poda', 'arborização'],
  gráfica:      ['impressão', 'gráfica', 'material gráfico', 'banner', 'panfleto'],
  outros:       [],
}

async function buscarLicitacoesSegmento(
  supabase: SupabaseClient,
  segmento: string | null,
  uf: string | null,
): Promise<LicitacaoResumida[]> {
  try {
    const keywords = KEYWORDS_SEGMENTO[segmento ?? 'outros'] ?? []

    let query = supabase
      .from('licitacoes')
      .select('objeto, orgao, valor_estimado, estado, data_abertura, link')
      .not('objeto', 'is', null)
      .order('data_abertura', { ascending: false })
      .limit(3)

    if (keywords.length > 0) {
      query = query.or(keywords.map(k => `objeto.ilike.%${k}%`).join(','))
    }
    if (uf) query = query.eq('estado', uf)

    const { data } = await query
    if (data && data.length >= 1) return data as LicitacaoResumida[]

    // Fallback sem UF
    if (uf && keywords.length > 0) {
      let q2 = supabase
        .from('licitacoes')
        .select('objeto, orgao, valor_estimado, estado, data_abertura, link')
        .not('objeto', 'is', null)
        .order('data_abertura', { ascending: false })
        .limit(3)
      q2 = q2.or(keywords.map(k => `objeto.ilike.%${k}%`).join(','))
      const { data: d2 } = await q2
      if (d2 && d2.length >= 1) return d2 as LicitacaoResumida[]
    }

    // Último fallback: 3 recentes sem filtro
    const { data: recentes } = await supabase
      .from('licitacoes')
      .select('objeto, orgao, valor_estimado, estado, data_abertura, link')
      .not('objeto', 'is', null)
      .order('data_abertura', { ascending: false })
      .limit(3)

    return (recentes ?? []) as LicitacaoResumida[]
  } catch {
    return []
  }
}

// Pro/Empresarial: até 300s. Com ~1s por lead (DB + Resend + 200ms pausa):
//  75 novos + 25 followup = 100 leads → ~100s, bem dentro do limite.
export const maxDuration = 300

const MAX_LOTE_NOVOS    = 75
const MAX_LOTE_FOLLOWUP = 25

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar se captação e disparo estão ativos
  const [cfgCaptacao, cfgDisparo] = await Promise.all([
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle(),
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_disparo_ativo').maybeSingle(),
  ])
  if (cfgCaptacao.data && (cfgCaptacao.data.valor === false || cfgCaptacao.data.valor === 'false')) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'sistema pausado' })
  }
  const disparoAtivo = cfgDisparo.data?.valor === true || cfgDisparo.data?.valor === 'true'
  if (!disparoAtivo) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'disparo pausado pelo admin' })
  }

  // ── Step 0: Reset leads 'erro' há >4h para 'pendente' ────────────────────
  const h4ago = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('leads')
    .update({ status: 'pendente', erro_msg: null })
    .eq('status', 'erro')
    .lt('enviado_em', h4ago)

  // ── Step 1: Leads pendentes (primeiro e-mail) ─────────────────────────────
  const { data: leadsPendentes } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, nome_fantasia, email, municipio, uf, cnae, segmento, objeto, emails_enviados')
    .eq('status', 'pendente')
    .not('email', 'is', null)
    .neq('email', '')
    .order('created_at', { ascending: true })
    .limit(MAX_LOTE_NOVOS)

  // ── Step 2: Follow-up (D+4 e D+8 para quem não abriu) ────────────────────
  const agora = new Date().toISOString()
  const { data: leadsFollowup } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, nome_fantasia, email, municipio, uf, cnae, segmento, objeto, emails_enviados')
    .eq('status', 'enviado')
    .lte('proximo_email_em', agora)
    .lt('emails_enviados', 3)
    .is('abriu_em', null)
    .not('email', 'is', null)
    .neq('email', '')
    .order('proximo_email_em', { ascending: true })
    .limit(MAX_LOTE_FOLLOWUP)

  const todos = [
    ...(leadsPendentes ?? []).map(l => ({ ...l, isFollowup: false })),
    ...(leadsFollowup  ?? []).map(l => ({ ...l, isFollowup: true  })),
  ]

  if (!todos.length) {
    return NextResponse.json({ ok: true, enviados: 0, followups: 0, mensagem: 'Nenhum lead pendente ou follow-up agendado' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let enviados = 0
  let followups = 0
  let erros = 0

  for (const lead of todos) {
    const licitacoes = await buscarLicitacoesSegmento(supabase, lead.segmento, lead.uf)
    const numeroEmail = (lead.emails_enviados ?? 0) + 1

    const { subject, html, text } = emailCaptacao({
      id:           lead.id,
      razaoSocial:  lead.razao_social,
      nomeFantasia: lead.nome_fantasia,
      municipio:    lead.municipio,
      uf:           lead.uf,
      cnae:         lead.cnae,
      licitacoes,
      objeto:       lead.objeto ?? undefined,
      numeroEmail,
    })

    const htmlFinal = html
      .replace(/\{\{UNSUB_TOKEN\}\}/g, lead.id)
      .replace(/\{\{EMAIL\}\}/g, encodeURIComponent(lead.email))
    const textFinal = text
      .replace(/\{\{UNSUB_TOKEN\}\}/g, lead.id)
      .replace(/\{\{EMAIL\}\}/g, encodeURIComponent(lead.email))

    try {
      trackResend()
      const { error: sendError } = await resend.emails.send({
        from: 'Monitor de Licitações <comercial@monitordelicitacoes.com.br>',
        to:   lead.email,
        subject,
        html: htmlFinal,
        text: textFinal,
      })

      if (sendError) throw new Error(sendError.message)

      const novosEnviados = numeroEmail
      // Agenda próximo follow-up se ainda abaixo de 3 e-mails
      const proximoEmail = novosEnviados < 3
        ? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        : null

      await supabase
        .from('leads')
        .update({
          status:          'enviado',
          enviado_em:      new Date().toISOString(),
          erro_msg:        null,
          emails_enviados: novosEnviados,
          proximo_email_em: proximoEmail,
        })
        .eq('id', lead.id)

      if (lead.isFollowup) followups++
      else enviados++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      console.error(`[disparar-leads] erro ao enviar para ${lead.email}:`, msg)

      await supabase
        .from('leads')
        .update({ status: 'erro', erro_msg: msg.slice(0, 200) })
        .eq('id', lead.id)

      erros++
    }
  }

  console.log(`[disparar-leads] enviados=${enviados} followups=${followups} erros=${erros}`)
  return NextResponse.json({ ok: true, enviados, followups, erros })
}
