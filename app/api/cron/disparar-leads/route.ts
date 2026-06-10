/**
 * Cron: disparar-leads
 * Horário: Ter/Qua/Qui às 9h e 14h (horário de Brasília = UTC-3)
 *  → 9h BRT  = 12h UTC
 *  → 14h BRT = 17h UTC
 *
 * Fluxo:
 *  1. Busca até MAX_LOTE leads com status 'pendente'
 *  2. Envia e-mail de captação personalizado via Resend
 *  3. Atualiza status → 'enviado' (ou 'erro')
 *
 * Deduplicação: status 'enviado' garante não reenvio
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth } from '@/lib/cron-auth'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailCaptacao, type LicitacaoResumida } from '@/lib/emails/captacao'
import { trackResend } from '@/lib/uso-apis'

// ─── Palavras-chave por segmento para buscar licitações compatíveis ──────────
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
  outros:       [], // sem filtro específico — retorna recentes genéricos
}

async function buscarLicitacoesSegmento(
  supabase: SupabaseClient,
  segmento: string | null,
  uf: string | null,
): Promise<LicitacaoResumida[]> {
  try {
    const keywords = KEYWORDS_SEGMENTO[segmento ?? 'outros'] ?? []

    // Tenta primeiro na UF do lead (mais relevante), com filtro de segmento
    // Depois fallback: só segmento sem filtro de UF
    // Por fim: recentes sem filtro nenhum
    let query = supabase
      .from('licitacoes')
      .select('objeto, orgao, valor_estimado, estado, data_abertura, link')
      .not('objeto', 'is', null)
      .order('data_abertura', { ascending: false })
      .limit(3)

    if (keywords.length > 0) {
      // ilike com OR entre as keywords — pega a primeira que tiver resultado
      query = query.or(keywords.map(k => `objeto.ilike.%${k}%`).join(','))
    }

    if (uf) {
      query = query.eq('estado', uf)
    }

    const { data } = await query
    if (data && data.length >= 1) return data as LicitacaoResumida[]

    // Fallback sem filtro de UF
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

    // Último fallback: 3 licitações mais recentes sem filtro
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

export const maxDuration = 60

// Lote por execução — cron roda a cada hora nos dias úteis (8h-18h) = ~11 runs/dia × 5 dias = 55x/sem
// Com MAX_LOTE=50: até 2.750 e-mails/semana (~11.000/mês) → requer plano pago do Resend
// Monitore uso em /admin/saude antes de ativar o disparo
const MAX_LOTE = 50

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
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'sistema pausado' })
  }

  // Verificar se disparo de e-mails está habilitado (padrão: desabilitado)
  const { data: cfgDisparo } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_disparo_ativo')
    .maybeSingle()
  const disparoAtivo = cfgDisparo?.valor === true || cfgDisparo?.valor === 'true'
  if (!disparoAtivo) {
    return NextResponse.json({ ok: true, enviados: 0, motivo: 'disparo pausado pelo admin' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Buscar leads pendentes com e-mail
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, nome_fantasia, email, municipio, uf, cnae, segmento')
    .eq('status', 'pendente')
    .not('email', 'is', null)
    .neq('email', '')
    .order('created_at', { ascending: true })
    .limit(MAX_LOTE)

  if (error) {
    console.error('[disparar-leads] erro ao buscar leads:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!leads?.length) {
    console.log('[disparar-leads] nenhum lead pendente')
    return NextResponse.json({ ok: true, enviados: 0, mensagem: 'Nenhum lead pendente' })
  }

  console.log(`[disparar-leads] ${leads.length} leads para enviar`)

  let enviados = 0
  let erros = 0

  for (const lead of leads) {
    // Buscar licitações reais do setor para personalizar o e-mail
    const licitacoes = await buscarLicitacoesSegmento(supabase, lead.segmento, lead.uf)

    const { subject, html, text } = emailCaptacao({
      id:           lead.id,
      razaoSocial:  lead.razao_social,
      nomeFantasia: lead.nome_fantasia,
      municipio:    lead.municipio,
      uf:           lead.uf,
      cnae:         lead.cnae,
      licitacoes,
    })

    // Substituir token de descadastro pelo ID do lead (UUID não-guessável)
    const htmlFinal = html
      .replace(/\{\{UNSUB_TOKEN\}\}/g, lead.id)
      .replace(/\{\{EMAIL\}\}/g, encodeURIComponent(lead.email)) // compatibilidade legada
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

      await supabase
        .from('leads')
        .update({ status: 'enviado', enviado_em: new Date().toISOString(), erro_msg: null })
        .eq('id', lead.id)

      enviados++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      console.error(`[disparar-leads] erro ao enviar para ${lead.email}:`, msg)

      await supabase
        .from('leads')
        .update({ status: 'erro', erro_msg: msg.slice(0, 200) })
        .eq('id', lead.id)

      erros++
    }

    // Pequena pausa para não saturar a API do Resend
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`[disparar-leads] enviados=${enviados} erros=${erros}`)
  return NextResponse.json({ ok: true, enviados, erros })
}
