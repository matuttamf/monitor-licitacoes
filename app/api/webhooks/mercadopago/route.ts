import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getLimites } from '@/lib/planos'
import { PLANOS, atualizarValorAssinatura } from '@/lib/mercadopago'
import { Resend } from 'resend'
import { emailConfirmacaoAssinatura } from '@/lib/emails/confirmacao-assinatura'
import { emailFornecedor } from '@/lib/emails/fornecedor'

const PRECOS_PLANO: Record<string, number> = {
  basic:        49.90,
  profissional: 97.90,
  gestao:       197.90,
  pro:          197.90,  // retrocompatibilidade
  empresarial:  497.00,
}

const PLANOS_MP: Record<string, number> = {
  basic:        49.90,
  profissional: 97.90,
  gestao:       197.90,
  pro:          197.90,  // retrocompatibilidade
  empresarial:  497.00,
}

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

// Verifica a assinatura HMAC-SHA256 enviada pelo MercadoPago
// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function verificarAssinatura(
  request: Request,
  dataId: string,
  rawSignature: string | null,
  requestId: string | null,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/mp] MP_WEBHOOK_SECRET não configurado — rejeitando requisição')
    return false
  }
  if (!rawSignature) return false

  // Formato: "ts=1704908010,v1=618c85345248..."
  const parts = Object.fromEntries(
    rawSignature.split(',').map(p => p.split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Template assinado pelo MercadoPago
  const template = `id:${dataId};request-id:${requestId ?? ''};ts:${ts};`
  const hash = createHmac('sha256', secret).update(template).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const rawSignature = request.headers.get('x-signature')
  const requestId    = request.headers.get('x-request-id')

  let body: { type?: string; data?: { id?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const { type, data } = body
  const dataId = data?.id ?? ''

  // Verificar assinatura antes de qualquer processamento
  if (!verificarAssinatura(request, dataId, rawSignature, requestId)) {
    console.error('[webhook/mp] Assinatura inválida — requisição rejeitada', { dataId, requestId })
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  // ── Pagamento avulso (proporcional de upgrade) ──────────────────────────────
  if (type === 'payment') {
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    })
    if (payRes.ok) {
      const payment = await payRes.json()
      if (payment.status === 'approved') {
        const parts = (payment.external_reference ?? '').split('|')
        // format: userId|upgrade|novoPlano|periodo|subscriptionId
        if (parts[1] === 'upgrade') {
          const userId         = parts[0]
          const novoPlano      = parts[2]
          const novoPeriodo: 'mensal' | 'anual' = parts[3] === 'anual' ? 'anual' : 'mensal'
          const subscriptionId = parts[4]
          const novoPreco = novoPeriodo === 'anual'
            ? PLANOS[novoPlano as keyof typeof PLANOS]?.preco_anual
            : PLANOS[novoPlano as keyof typeof PLANOS]?.preco

          if (novoPreco && subscriptionId) {
            const supabase = await createServiceClient()
            // Atualiza preço E external_reference no MP para que o cron leia o plano correto
            const novoExtRef = novoPeriodo === 'anual'
              ? `${userId}|${novoPlano}|periodo:anual`
              : `${userId}|${novoPlano}`
            await atualizarValorAssinatura(subscriptionId, novoPreco, novoExtRef)
            const limites = getLimites(novoPlano)
            await supabase.from('profiles').update({
              plano:             novoPlano,
              periodo:           novoPeriodo,
              mp_subscription_id: subscriptionId,
              max_keywords:      limites.maxKeywords,
              max_usuarios:      limites.maxUsers,
              valor_mensalidade: novoPreco,
            }).eq('id', userId)
            console.log(`[webhook/mp] Upgrade pago: user=${userId} plano=${novoPlano} periodo=${novoPeriodo}`)
          }
        }
      }
    }
    return NextResponse.json({ ok: true })
  }

  if (type === 'subscription_preapproval') {
    const subscriptionId = dataId

    const res = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    })

    if (!res.ok) {
      console.error('[webhook/mp] Erro ao buscar assinatura no MP:', res.status)
      return NextResponse.json({ ok: true }) // Retorna 200 para MP não retentar
    }

    const subscription = await res.json()
    const parts   = (subscription.external_reference || '').split('|')
    const userId  = parts[0]
    const planoId = parts[1]
    // ex: 'desc30' → 30, 'meses3' → 3, 'periodo:anual' → 'anual'
    const descontoPercentual = parts.find((p: string) => p.startsWith('desc'))       ? parseInt(parts.find((p: string) => p.startsWith('desc'))!.replace('desc',''))   : 0
    const descontoMeses      = parts.find((p: string) => p.startsWith('meses'))      ? parseInt(parts.find((p: string) => p.startsWith('meses'))!.replace('meses','')) : 0
    const periodo: 'mensal' | 'anual' = parts.includes('periodo:anual') ? 'anual' : 'mensal'

    if (!userId || !planoId) {
      console.warn('[webhook/mp] external_reference inválido:', subscription.external_reference)
      return NextResponse.json({ ok: true })
    }

    const supabase = await createServiceClient()

    if (subscription.status === 'authorized') {
      const limites = getLimites(planoId)
      // Usa o valor real cobrado (pode ser com desconto)
      const valorMensalidade = (subscription.auto_recurring?.transaction_amount as number | null) ?? PLANOS_MP[planoId] ?? null

      // Registra assinatura_inicio apenas na primeira ativação (não sobrescreve renovações)
      // Também verifica bloqueio administrativo — se bloqueado_admin=true, não reativa o acesso
      const { data: perfilAtual } = await supabase
        .from('profiles')
        .select('assinatura_inicio, bloqueado_admin, campanha_id')
        .eq('id', userId)
        .maybeSingle()

      if (perfilAtual?.bloqueado_admin) {
        console.warn(`[webhook/mp] Usuário ${userId} bloqueado administrativamente — pagamento registrado mas acesso NÃO reativado`)
        await supabase.from('profiles').update({
          mp_subscription_id: subscriptionId,
          valor_mensalidade:  valorMensalidade,
        }).eq('id', userId)
        return NextResponse.json({ ok: true })
      }

      const updateData: Record<string, unknown> = {
        status:             'active',
        plano:              planoId,
        periodo,
        mp_subscription_id: subscriptionId,
        max_keywords:       limites.maxKeywords,
        max_usuarios:       limites.maxUsers,
        valor_mensalidade:  valorMensalidade,
        acesso_ate:         null,
      }
      if (!perfilAtual?.assinatura_inicio) {
        updateData.assinatura_inicio = new Date().toISOString()
      }
      // Salva dados do desconto (apenas na primeira ativação, para não sobrescrever renovações)
      if (descontoPercentual > 0 && descontoMeses > 0 && !perfilAtual?.assinatura_inicio) {
        const descAte = new Date()
        descAte.setMonth(descAte.getMonth() + descontoMeses)
        updateData.voucher_desconto_percentual = descontoPercentual
        updateData.voucher_desconto_meses      = descontoMeses
        updateData.voucher_desconto_ate        = descAte.toISOString()
      }

      await supabase.from('profiles').update(updateData).eq('id', userId)

      console.log(`[webhook/mp] Assinatura ativada: user=${userId} plano=${planoId} keywords=${limites.maxKeywords}`)

      // Auto-registrar comissão de afiliado na primeira ativação (one-time)
      if (!perfilAtual?.assinatura_inicio && perfilAtual?.campanha_id) {
        try {
          const { data: afiliado } = await supabase
            .from('afiliados')
            .select('id, campanha:campanhas(comissao_tipo, comissao_valor)')
            .eq('campanha_id', perfilAtual.campanha_id)
            .eq('status', 'ativo')
            .maybeSingle()

          if (afiliado) {
            const camp = (afiliado.campanha as unknown) as { comissao_tipo: string; comissao_valor: number } | null
            if (camp && camp.comissao_tipo !== 'nenhum') {
              const valorComissao = camp.comissao_tipo === 'percentual'
                ? Math.round((valorMensalidade ?? 0) * camp.comissao_valor / 100 * 100) / 100
                : camp.comissao_valor
              if (valorComissao > 0) {
                const mesRef = new Date().toISOString().slice(0, 7)
                const { error: errC } = await supabase.from('afiliado_pagamentos').insert({
                  afiliado_id:   afiliado.id,
                  profile_id:    userId,
                  mes_ref:       mesRef,
                  valor:         valorComissao,
                  status:        'pendente',
                  tipo_gatilho:  `${planoId}_${periodo}`,
                })
                if (errC && errC.code !== '23505') {
                  console.error('[webhook/mp] Erro ao registrar comissão:', errC)
                } else if (!errC) {
                  console.log(`[webhook/mp] Comissão registrada: afiliado=${afiliado.id} valor=${valorComissao}`)
                }
              }
            }
          }
        } catch (e) {
          console.error('[webhook/mp] Erro ao processar comissão de afiliado:', e)
        }
      }

      // Enviar e-mail de confirmação (não bloqueante)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, nome')
          .eq('id', userId)
          .maybeSingle()

        if (profile?.email) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { subject, html, text } = emailConfirmacaoAssinatura({
            nome:  profile.nome ?? undefined,
            email: profile.email,
            plano: planoId,
            valor: valorMensalidade ?? PRECOS_PLANO[planoId] ?? 97,
          })
          await resend.emails.send({
            from: 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
            to:   profile.email,
            subject, html, text,
          })
          console.log(`[webhook/mp] E-mail confirmação enviado para ${profile.email}`)

          // E-mail guia de fornecedor — enviado junto, não bloqueia
          try {
            const nomePlanoDisplay: Record<string, string> = {
              basic: 'Basic', profissional: 'Profissional', gestao: 'Gestão', pro: 'Pro', empresarial: 'Empresarial',
            }
            const { subject: sF, html: hF, text: tF } = emailFornecedor({
              nome:  profile.nome ?? 'Prezado(a)',
              email: profile.email,
              plano: nomePlanoDisplay[planoId] ?? planoId,
            })
            await resend.emails.send({
              from:    'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
              to:      profile.email,
              subject: sF, html: hF, text: tF,
            })
            console.log(`[webhook/mp] E-mail fornecedor enviado para ${profile.email}`)
          } catch (ef) {
            console.error('[webhook/mp] Erro ao enviar e-mail fornecedor:', ef)
          }
        }
      } catch (e) {
        console.error('[webhook/mp] Erro ao enviar e-mail confirmação:', e)
      }

    } else if (subscription.status === 'paused') {
      // Pausa iniciada pelo nosso sistema via /api/assinatura/pausar — ignorar.
      // O mp_subscription_id já foi preservado e a data pausa_ate já está no banco.
      // Não limpar mp_subscription_id para que a reativação funcione.
      const { data: perfilPausa } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', userId)
        .maybeSingle()

      if (perfilPausa?.status === 'paused') {
        // Pausa já registrada pelo nosso sistema — nada a fazer
        console.log(`[webhook/mp] Pausa ignorada (já gerenciada pelo sistema): user=${userId}`)
      } else {
        // Pausa externa (pelo painel do MP) — tratar como cancelamento
        const proximaCobranca: string | null = subscription.next_payment_date
          ?? subscription.date_of_next_payment
          ?? null
        const updatePausaExt: Record<string, unknown> = { mp_subscription_id: null }
        if (proximaCobranca) {
          updatePausaExt.acesso_ate = new Date(proximaCobranca).toISOString()
        } else {
          updatePausaExt.status = 'expired'
        }
        await supabase.from('profiles').update(updatePausaExt).eq('id', userId)
        console.log(`[webhook/mp] Pausa externa MP: user=${userId}`)
      }

    } else if (subscription.status === 'cancelled') {
      // Mantém acesso ativo até o fim do período já pago.
      const proximaCobranca: string | null = subscription.next_payment_date
        ?? subscription.date_of_next_payment
        ?? null

      const updateCancelado: Record<string, unknown> = {
        mp_subscription_id: null,
      }

      if (proximaCobranca) {
        updateCancelado.acesso_ate = new Date(proximaCobranca).toISOString()
      } else {
        updateCancelado.status = 'expired'
      }

      await supabase.from('profiles').update(updateCancelado).eq('id', userId)

      console.log(
        `[webhook/mp] Cancelamento: user=${userId}` +
        (proximaCobranca ? ` acesso_ate=${proximaCobranca}` : ' expirado imediatamente')
      )
    }
  }

  return NextResponse.json({ ok: true })
}
