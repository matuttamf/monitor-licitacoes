/**
 * Cron: disparar-leads
 * Horário: a cada hora, seg-sáb 8h-22h (horário de Brasília = UTC-3)
 *
 * Fluxo:
 *  0. Reset leads 'erro' há >4h → 'pendente' (retry automático)
 *  1. Enviar primeiro e-mail para leads 'pendente' (lote grande, paralelo)
 *  2. Enviar follow-up para leads 'enviado' que não abriram
 *
 * Sequência por lead:
 *  - D+0: primeiro e-mail (copy PAS por setor + contrato real como gancho)
 *  - D+4: follow-up 1 se abriu_em IS NULL e emails_enviados < 2
 *  - D+8 → D+17 → D+32 → D+62 → D+92 → D+152: follow-ups crescentes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { emailCaptacao, type LicitacaoResumida } from '@/lib/emails/captacao'
import { sendEmailSes } from '@/lib/ses'
import { trackSes } from '@/lib/uso-apis'

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

// Cache de licitações por chave segmento+uf — evita N queries ao banco
async function construirCacheLicitacoes(
  supabase: SupabaseClient,
  chaves: Set<string>,
): Promise<Map<string, LicitacaoResumida[]>> {
  const cache = new Map<string, LicitacaoResumida[]>()

  await Promise.all([...chaves].map(async chave => {
    const [segmento, uf] = chave.split('|')
    try {
      const keywords = KEYWORDS_SEGMENTO[segmento ?? 'outros'] ?? []
      let query = supabase
        .from('licitacoes')
        .select('objeto, orgao, valor_estimado, estado, data_abertura, link')
        .not('objeto', 'is', null)
        .order('data_abertura', { ascending: false })
        .limit(3)
      if (keywords.length > 0) query = query.or(keywords.map(k => `objeto.ilike.%${k}%`).join(','))
      if (uf) query = query.eq('estado', uf)
      const { data } = await query
      if (data?.length) { cache.set(chave, data as LicitacaoResumida[]); return }

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
        if (d2?.length) { cache.set(chave, d2 as LicitacaoResumida[]); return }
      }

      // Último fallback: 3 recentes sem filtro
      const { data: recentes } = await supabase
        .from('licitacoes')
        .select('objeto, orgao, valor_estimado, estado, data_abertura, link')
        .not('objeto', 'is', null)
        .order('data_abertura', { ascending: false })
        .limit(3)
      cache.set(chave, (recentes ?? []) as LicitacaoResumida[])
    } catch {
      cache.set(chave, [])
    }
  }))

  return cache
}

export const maxDuration = 300

// Sandbox SES: 200/dia → ~3/exec (60 exec/dia)
// Produção SES: 50k/dia → ~800/exec (60 exec/dia)
// Troque SES_PRODUCAO=true na Vercel ao receber Production Access
const EM_PRODUCAO       = process.env.SES_PRODUCAO === 'true'
const TETO_NOVOS        = EM_PRODUCAO ? 800  : 3   // teto absoluto por execução (ramp-up afina abaixo disso)
const MAX_LOTE_FOLLOWUP = EM_PRODUCAO ? 100  : 1
const CONCORRENCIA_SES  = EM_PRODUCAO ? 50   : 3
const MAX_EMAILS        = 8    // sunset após 8 e-mails sem abertura

// D+0 → D+4 → D+8 → D+17 → D+32 → D+62 → D+92 → D+152 (sunset)
const PROXIMOS_DIAS = [4, 4, 9, 15, 30, 30, 60]

// Fallback JS para quando a query DB não usa prioridade_disparo
function prioridadeLead(l: { fonte: string | null; origem: string | null }): number {
  if (l.origem === 'cnae')                 return 5
  if (l.fonte  === 'pncp_proposta')        return 1  // Licitações (participantes)
  if (l.fonte  === 'pncp_contrato')        return 2  // Contratos firmados
  if (l.fonte  === 'portal_transparencia') return 3
  if (l.fonte  === 'busca_manual')         return 4
  return 6
}

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

  const [cfgCaptacao, cfgDisparo, cfgLote] = await Promise.all([
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle(),
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_disparo_ativo').maybeSingle(),
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_lote_max').maybeSingle(),
  ])

  // Ramp-up: teto de novos por execução, ajustável no painel admin
  // (configuracoes.captacao_lote_max) SEM novo deploy. Protege a reputação no
  // início — comece pequeno (ex.: 50) e aumente conforme as métricas de bounce/
  // reclamação se mantiverem saudáveis. Ausente/0 → usa o teto absoluto.
  const loteMaxCfg = Number(cfgLote.data?.valor)
  const MAX_LOTE_NOVOS = Number.isFinite(loteMaxCfg) && loteMaxCfg > 0
    ? Math.min(TETO_NOVOS, loteMaxCfg)
    : TETO_NOVOS
  if (cfgCaptacao.data && (cfgCaptacao.data.valor === false || cfgCaptacao.data.valor === 'false')) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'sistema pausado' })
  }
  const disparoAtivo = cfgDisparo.data?.valor === true || cfgDisparo.data?.valor === 'true'
  if (!disparoAtivo) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'disparo pausado pelo admin' })
  }

  // ── Steps 0a/0b em paralelo ──────────────────────────────────────────────
  const h4ago = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  await Promise.all([
    supabase.from('leads')
      .update({ status: 'invalido', erro_msg: 'sem_engajamento' })
      .eq('status', 'enviado')
      .gte('emails_enviados', MAX_EMAILS)
      .is('abriu_em', null)
      .is('proximo_email_em', null),
    supabase.from('leads')
      .update({ status: 'pendente', erro_msg: null })
      .eq('status', 'erro')
      .lt('enviado_em', h4ago),
  ])

  // ── Buscar leads pendentes + followups em paralelo ────────────────────────
  const agora = new Date().toISOString()
  const [{ data: leadsPendentesRaw }, { data: leadsFollowup }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, cnpj, razao_social, nome_fantasia, email, municipio, uf, cnae, segmento, objeto, emails_enviados, fonte, origem, cnae_rank')
      .eq('status', 'pendente')
      .not('email', 'is', null)
      .neq('email', '')
      .not('segmento', 'is', null)
      .not('municipio', 'is', null)
      .not('uf', 'is', null)
      .order('prioridade_disparo', { ascending: true })
      .order('cnae_rank', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(MAX_LOTE_NOVOS),
    supabase
      .from('leads')
      .select('id, cnpj, razao_social, nome_fantasia, email, municipio, uf, cnae, segmento, objeto, emails_enviados')
      .eq('status', 'enviado')
      .lte('proximo_email_em', agora)
      .lt('emails_enviados', MAX_EMAILS)
      .is('abriu_em', null)
      .not('email', 'is', null)
      .neq('email', '')
      .order('proximo_email_em', { ascending: true })
      .limit(MAX_LOTE_FOLLOWUP),
  ])

  // Remove prefixo numérico de nomes MEI: "14.304.386 REGELIA RODRIGUES" → "REGELIA RODRIGUES"
  // Leads com razão social = CNPJ puro já são marcados como inválidos pela migration
  // 20260626_leads_cnpj_placeholder.sql e nunca chegam aqui.
  function limparNome(nome: string | null | undefined): string | null {
    if (!nome) return nome ?? null
    const limpo = nome.replace(/^\d{2}[\.\d\/\-]{0,14}\s+/, '').trim()
    return limpo || nome
  }

  // Query já ordenada pelo banco (prioridade_disparo → cnae_rank → created_at)
  // Sort JS é fallback de segurança para casos sem coluna prioridade_disparo
  const leadsPendentes = (leadsPendentesRaw ?? [])
    .sort((a, b) => {
      const pa = prioridadeLead(a), pb = prioridadeLead(b)
      if (pa !== pb) return pa - pb
      const ra = (a as { cnae_rank?: number | null }).cnae_rank ?? 999
      const rb = (b as { cnae_rank?: number | null }).cnae_rank ?? 999
      return ra - rb
    })

  const todos = [
    ...(leadsPendentes).map(l => ({ ...l, isFollowup: false })),
    ...(leadsFollowup ?? []).map(l => ({ ...l, isFollowup: true })),
  ]

  if (!todos.length) {
    return NextResponse.json({ ok: true, enviados: 0, followups: 0, mensagem: 'Nenhum lead pendente ou follow-up agendado' })
  }

  // ── Pré-carregar cache de licitações por segmento+uf (1 query por par único) ─
  const chaves = new Set(todos.map(l => `${l.segmento ?? 'outros'}|${l.uf ?? ''}`))
  const cacheLicitacoes = await construirCacheLicitacoes(supabase, chaves)

  // ── Preparar todos os e-mails ─────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

  interface LeadPreparado {
    id: string
    email: string
    isFollowup: boolean
    numeroEmail: number
    subject: string
    htmlFinal: string
    textFinal: string
  }

  // Leads cujo nome após limpeza ainda é só dígitos não têm nome utilizável — invalida antes de enviar
  const soDigitos = (s: string | null | undefined) => !!s && /^\d+$/.test(s.replace(/[\s.\-\/]/g, ''))
  const invalidos = todos.filter(lead => {
    const nome = limparNome(lead.razao_social)
    return soDigitos(nome)
  })
  if (invalidos.length > 0) {
    await supabase.from('leads')
      .update({ status: 'invalido', erro_msg: 'cnpj_como_razao_social' })
      .in('id', invalidos.map(l => l.id))
  }
  const todosValidos = todos.filter(lead => !invalidos.find(i => i.id === lead.id))

  const leadsPreparados: LeadPreparado[] = todosValidos.map(lead => {
    const chave = `${lead.segmento ?? 'outros'}|${lead.uf ?? ''}`
    const licitacoes = cacheLicitacoes.get(chave) ?? []
    const numeroEmail = (lead.emails_enviados ?? 0) + 1
    const { subject, html, text } = emailCaptacao({
      id:           lead.id,
      razaoSocial:  limparNome(lead.razao_social) ?? lead.razao_social,
      nomeFantasia: limparNome(lead.nome_fantasia) ?? undefined,
      municipio:    lead.municipio,
      uf:           lead.uf,
      cnae:         lead.cnae,
      licitacoes,
      objeto:       lead.objeto ?? undefined,
      numeroEmail,
    })
    return {
      id:          lead.id,
      email:       lead.email,
      isFollowup:  lead.isFollowup,
      numeroEmail,
      subject,
      htmlFinal:   html.replace(/\{\{UNSUB_TOKEN\}\}/g, lead.id).replace(/\{\{EMAIL\}\}/g, encodeURIComponent(lead.email)),
      textFinal:   text.replace(/\{\{UNSUB_TOKEN\}\}/g, lead.id).replace(/\{\{EMAIL\}\}/g, encodeURIComponent(lead.email)),
    }
  })

  // ── Enviar em paralelo com concorrência controlada ────────────────────────
  let enviados = 0
  let followups = 0
  let erros = 0

  for (let i = 0; i < leadsPreparados.length; i += CONCORRENCIA_SES) {
    const lote = leadsPreparados.slice(i, i + CONCORRENCIA_SES)
    const resultados = await Promise.allSettled(
      lote.map(async lead => {
        trackSes()
        await sendEmailSes({
          from:    process.env.EMAIL_CAPTACAO_FROM ?? 'Monitor de Licitações <comercial@monitordelicitacoes.com.br>',
          to:      lead.email,
          subject: lead.subject,
          html:    lead.htmlFinal,
          text:    lead.textFinal,
          headers: {
            'List-Unsubscribe':      `<${appUrl}/descadastrar?token=${lead.id}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        })
        return lead
      })
    )

    // Atualizar banco em paralelo para cada resultado do lote
    await Promise.all(resultados.map(async (resultado, idx) => {
      const lead = lote[idx]
      if (resultado.status === 'fulfilled') {
        const diasProximo = PROXIMOS_DIAS[lead.numeroEmail - 1] ?? null
        const proximoEmail = diasProximo
          ? new Date(Date.now() + diasProximo * 24 * 60 * 60 * 1000).toISOString()
          : null
        await supabase.from('leads').update({
          status:           'enviado',
          enviado_em:       new Date().toISOString(),
          erro_msg:         null,
          emails_enviados:  lead.numeroEmail,
          proximo_email_em: proximoEmail,
        }).eq('id', lead.id)
        if (lead.isFollowup) followups++
        else enviados++
      } else {
        const msg = resultado.reason instanceof Error ? resultado.reason.message : 'Erro desconhecido'
        console.error(`[disparar-leads] erro ${lead.email}:`, msg)
        await supabase.from('leads').update({ status: 'erro', erro_msg: msg.slice(0, 200) }).eq('id', lead.id)
        erros++
      }
    }))
  }

  console.log(`[disparar-leads] enviados=${enviados} followups=${followups} erros=${erros} total=${todos.length} loteMax=${MAX_LOTE_NOVOS} producao=${EM_PRODUCAO}`)
  const resultado = { ok: true, enviados, followups, erros, loteMax: MAX_LOTE_NOVOS }
  await registrarCronLog({ job: 'disparar-leads', status: 'ok', mensagem: `${enviados} novos + ${followups} follow-ups`, detalhes: resultado })
  return NextResponse.json(resultado)
}
