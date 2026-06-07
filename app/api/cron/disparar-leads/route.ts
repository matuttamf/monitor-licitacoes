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
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailCaptacao } from '@/lib/emails/captacao'

export const maxDuration = 60

// Limite conservador para não estourar o free tier do Resend (3.000/mês)
// 2x/semana × 3 dias × ~20 leads = ~120 envios/semana → seguro
const MAX_LOTE = 20

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
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

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Buscar leads pendentes com e-mail
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, nome_fantasia, email, municipio, uf, cnae')
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
    const { subject, html, text } = emailCaptacao({
      id:           lead.id,
      razaoSocial:  lead.razao_social,
      nomeFantasia: lead.nome_fantasia,
      municipio:    lead.municipio,
      uf:           lead.uf,
      cnae:         lead.cnae,
    })

    // Substituir placeholder de descadastro pelo e-mail real
    const htmlFinal = html.replace('{{EMAIL}}', encodeURIComponent(lead.email))

    try {
      const { error: sendError } = await resend.emails.send({
        from: 'Monitor de Licitações <comercial@monitordelicitacoes.com.br>',
        to:   lead.email,
        subject,
        html: htmlFinal,
        text,
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
