import { createAdminClient } from '@/lib/supabase/server'
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

async function logWebhook(params: {
  tipo: string | undefined
  dataId: string
  status: 'ok' | 'erro' | 'ignorado' | 'assinatura_invalida'
  userId?: string
  plano?: string
  mensagem?: string
  payload?: unknown
}) {
  try {
    const supabase = createAdminClient()
    await supabase.from('webhook_logs').insert({
      fonte:     'mercadopago',
      tipo:      params.tipo,
      data_id:   params.dataId,
      status:    params.status,
      user_id:   params.userId,
      plano:     params.plano,
      mensagem:  params.mensagem,
      payload:   params.payload ?? null,
    })
  } catch (e) {
    console.error('[webhook/mp] Erro ao gravar log:', e)
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
    await logWebhook({ tipo: type, dataId, status: 'assinatura_invalida', mensagem: 'HMAC inválido' })
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  // ── Eventos de pagamento (upgrade proporcional + pagamento inicial/renovação de assinatura) ──
  if (type === 'payment') {
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    })
    if (payRes.ok) {
      const payment = await payRes.json()
      if (payment.status === 'approved') {
        const parts = (payment.external_reference ?? '').split('|')
        const userId  = parts[0]
        const planoId = parts[1]

        if (planoId === 'upgrade') {
          // ── Cobrança proporcional de upgrade ──────────────────────────────────
          const novoPlano      = parts[2]
          const novoPeriodo: 'mensal' | 'anual' = parts[3] === 'anual' ? 'anual' : 'mensal'
          const subscriptionId = parts[4]
          const novoPreco = novoPeriodo === 'anual'
            ? PLANOS[novoPlano as keyof typeof PLANOS]?.preco_anual
            : PLANOS[novoPlano as keyof typeof PLANOS]?.preco

          if (novoPreco && subscriptionId) {
            const supabase = createAdminClient()
            const novoExtRef = novoPeriodo === 'anual'
              ? `${userId}|${novoPlano}|periodo:anual`
              : `${userId}|${novoPlano}`
            await atualizarValorAssinatura(subscriptionId, novoPreco, novoExtRef)
            const limites = getLimites(novoPlano)
            await supabase.from('profiles').update({
              plano:              novoPlano,
              periodo:            novoPeriodo,
              mp_subscription_id: subscriptionId,
              max_keywords:       limites.maxKeywords,
              max_usuarios:       limites.maxUsers,
              valor_mensalidade:  novoPreco,
            }).eq('id', userId)
            await logWebhook({ tipo: type, dataId, status: 'ok', userId, plano: novoPlano, mensagem: `upgrade ${novoPeriodo}` })
            console.log(`[webhook/mp] Upgrade pago: user=${userId} plano=${novoPlano} periodo=${novoPeriodo}`)
          }

        } else if (userId && planoId && (planoId in PLANOS)) {
          // ── Pagamento inicial, renovação mensal/anual de assinatura ───────────
          // Complementa subscription_preapproval: garante ativação mesmo se aquele
          // evento chegar atrasado, falhar ou vier com status ainda pending.
          const periodo: 'mensal' | 'anual' = parts.includes('periodo:anual') ? 'anual' : 'mensal'
          const supabase = createAdminClient()

          const { data: perfil } = await supabase
            .from('profiles')
            .select('status, assinatura_inicio, bloqueado_admin')
            .eq('id', userId)
            .maybeSingle()

          if (!perfil || perfil.bloqueado_admin) {
            await logWebhook({ tipo: type, dataId, status: 'ignorado', userId, plano: planoId, mensagem: 'perfil não encontrado ou bloqueado' })
          } else {
            const limites = getLimites(planoId)
            const valorMensalidade: number = payment.transaction_amount ?? PRECOS_PLANO[planoId] ?? 0
            // preapproval_id é o campo direto no objeto payment do MP (não em metadata)
            const subscriptionId: string | null = (payment.preapproval_id as string | null) ?? null

            const updateData: Record<string, unknown> = {
              status:            'active',
              plano:             planoId,
              periodo,
              max_keywords:      limites.maxKeywords,
              max_usuarios:      limites.maxUsers,
              valor_mensalidade: valorMensalidade,
              acesso_ate:        null,
            }
            if (subscriptionId) updateData.mp_subscription_id = subscriptionId
            if (!perfil.assinatura_inicio) {
              updateData.assinatura_inicio = new Date().toISOString()
              updateData.pagamento_confirmado_em = new Date().toISOString()
            }

            await supabase.from('profiles').update(updateData).eq('id', userId)

            const tipo_acao = perfil.status === 'active' ? 'renovacao' : 'ativacao'
            await logWebhook({ tipo: type, dataId, status: 'ok', userId, plano: planoId, mensagem: `${tipo_acao} — payment approved` })
            console.log(`[webhook/mp] ${tipo_acao}: user=${userId} plano=${planoId} periodo=${periodo} sub=${subscriptionId}`)
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
      await logWebhook({ tipo: type, dataId, status: 'erro', mensagem: `MP retornou ${res.status}` })
      return NextResponse.json({ ok: true })
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

    const supabase = createAdminClient()

    if (subscription.status === 'authorized') {
      const limites = getLimites(planoId)
      // Usa o valor real cobrado (pode ser com desconto)
      const valorMensalidade = (subscription.auto_recurring?.transaction_amount as number | null) ?? PRECOS_PLANO[planoId] ?? null

      // Registra assinatura_inicio apenas na primeira ativação (não sobrescreve renovações)
      // Também verifica bloqueio administrativo — se bloqueado_admin=true, não reativa o acesso
      const { data: perfilAtual } = await supabase
        .from('profiles')
        .select('assinatura_inicio, bloqueado_admin, campanha_id, afiliado_id, indicado_por')
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
        updateData.pagamento_confirmado_em = new Date().toISOString()
      }
      // Salva dados do desconto (apenas na primeira ativação, para não sobrescrever renovações).
      // Anual com desconto: trata como 12 meses (1 ciclo), mesmo que descontoMeses não venha no external_reference.
      const mesesEfetivos = periodo === 'anual' && descontoPercentual > 0 ? 12 : descontoMeses
      if (descontoPercentual > 0 && mesesEfetivos > 0 && !perfilAtual?.assinatura_inicio) {
        const descAte = new Date()
        descAte.setMonth(descAte.getMonth() + mesesEfetivos)
        updateData.voucher_desconto_percentual = descontoPercentual
        updateData.voucher_desconto_meses      = mesesEfetivos
        updateData.voucher_desconto_ate        = descAte.toISOString()
      }

      await supabase.from('profiles').update(updateData).eq('id', userId)
      // Reativa keywords desativadas por expiração/bloqueio anterior
      await supabase.from('keywords').update({ ativo: true }).eq('user_id', userId).eq('ativo', false)
      await logWebhook({ tipo: type, dataId, status: 'ok', userId, plano: planoId, mensagem: `ativado ${periodo}` })
      console.log(`[webhook/mp] Assinatura ativada: user=${userId} plano=${planoId} keywords=${limites.maxKeywords}`)

      // Auto-registrar comissão de afiliado na primeira ativação (one-time).
      // Comissão vem do vínculo afiliado↔campanha (taxa individual por afiliado).
      if (!perfilAtual?.assinatura_inicio && perfilAtual?.afiliado_id && perfilAtual?.campanha_id) {
        try {
          const { data: vinculo } = await supabase
            .from('afiliado_campanhas')
            .select('comissao_tipo, comissao_valor, afiliado:afiliados(status)')
            .eq('afiliado_id', perfilAtual.afiliado_id)
            .eq('campanha_id', perfilAtual.campanha_id)
            .maybeSingle()

          const afStatus = ((vinculo?.afiliado as unknown) as { status: string } | null)?.status
          if (vinculo && afStatus === 'ativo' && vinculo.comissao_tipo !== 'nenhum') {
            const valorComissao = vinculo.comissao_tipo === 'percentual'
              ? Math.round((valorMensalidade ?? 0) * vinculo.comissao_valor / 100 * 100) / 100
              : vinculo.comissao_valor
            if (valorComissao > 0) {
              const mesRef = new Date().toISOString().slice(0, 7)
              const { error: errC } = await supabase.from('afiliado_pagamentos').insert({
                afiliado_id:  perfilAtual.afiliado_id,
                campanha_id:  perfilAtual.campanha_id,
                profile_id:   userId,
                mes_ref:      mesRef,
                valor:        valorComissao,
                status:       'pendente',
                tipo_gatilho: `${planoId}_${periodo}`,
              })
              if (errC && errC.code !== '23505') {
                console.error('[webhook/mp] Erro ao registrar comissão:', errC)
              } else if (!errC) {
                console.log(`[webhook/mp] Comissão registrada: afiliado=${perfilAtual.afiliado_id} valor=${valorComissao}`)
              }
            }
          }
        } catch (e) {
          console.error('[webhook/mp] Erro ao processar comissão de afiliado:', e)
        }
      }

      // Registrar indicação na primeira ativação: amigo pagou → status 'assinou'.
      // A recompensa só é liberada após 10 dias sem cancelamento (cron indicacoes-liberar).
      // Afiliado não gera recompensa de +30 dias (benefícios nunca acumulam).
      if (!perfilAtual?.assinatura_inicio && perfilAtual?.indicado_por && !perfilAtual?.afiliado_id) {
        try {
          const valorEcon = valorMensalidade ?? PRECOS_PLANO[planoId] ?? 0
          const { error: errInd } = await supabase.from('indicacoes').upsert({
            indicador_id:             perfilAtual.indicado_por,
            indicado_id:              userId,
            codigo:                   '',
            status:                   'assinou',
            assinatura_confirmada_em: new Date().toISOString(),
            valor_economia:           valorEcon,
          }, { onConflict: 'indicado_id' })
          if (errInd) console.error('[webhook/mp] Erro ao registrar indicação:', errInd)
          else console.log(`[webhook/mp] Indicação registrada: indicador=${perfilAtual.indicado_por} amigo=${userId}`)
        } catch (e) {
          console.error('[webhook/mp] Erro ao processar indicação:', e)
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
        .select('status, credito_pausa_ate')
        .eq('id', userId)
        .maybeSingle()

      const emCreditoPausa = perfilPausa?.credito_pausa_ate
        && new Date(perfilPausa.credito_pausa_ate) > new Date()

      if (perfilPausa?.status === 'paused' || emCreditoPausa) {
        // Pausa gerenciada pelo sistema: pausa manual (status=paused) OU pausa de
        // crédito de indicação (status=active + credito_pausa_ate no futuro).
        // Não tratar como cancelamento — o cron retoma a cobrança no fim da janela.
        await logWebhook({ tipo: type, dataId, status: 'ignorado', userId, mensagem: emCreditoPausa ? 'pausa de credito de indicacao' : 'pausa já gerenciada pelo sistema' })
        console.log(`[webhook/mp] Pausa ignorada (gerenciada pelo sistema): user=${userId}`)
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
        if (updatePausaExt.status === 'expired') {
          await supabase.from('keywords').update({ ativo: false }).eq('user_id', userId).eq('ativo', true)
        }
        await logWebhook({ tipo: type, dataId, status: 'ok', userId, mensagem: `pausa externa${proximaCobranca ? ` acesso_ate=${proximaCobranca}` : ' expirado'}` })
        console.log(`[webhook/mp] Pausa externa MP: user=${userId}`)
      }

    } else if (subscription.status === 'cancelled') {
      // Mantém acesso ativo até o fim do período já pago.
      const proximaCobranca: string | null = subscription.next_payment_date
        ?? subscription.date_of_next_payment
        ?? null

      const updateCancelado: Record<string, unknown> = {
        mp_subscription_id:         null,
        // Expira desconto imediatamente ao cancelar — impede reassinar com desconto ainda ativo
        voucher_desconto_percentual: null,
        voucher_desconto_meses:      null,
        voucher_desconto_ate:        null,
      }

      // Crédito de indicação: ao cancelar, o usuário mantém acesso apenas até
      // expirar o prêmio acumulado (hoje + dias de crédito). Consome os créditos.
      const { data: perfilCancel } = await supabase
        .from('profiles')
        .select('indica_creditos_dias')
        .eq('id', userId)
        .maybeSingle()
      const creditos = perfilCancel?.indica_creditos_dias ?? 0

      let acessoBase = proximaCobranca ? new Date(proximaCobranca) : new Date()
      if (creditos > 0) {
        const porPremio = new Date(Date.now() + creditos * 24 * 60 * 60 * 1000)
        if (porPremio > acessoBase) acessoBase = porPremio
        updateCancelado.indica_creditos_dias = 0 // consumidos ao virar acesso fixo
      }

      if (proximaCobranca || creditos > 0) {
        updateCancelado.acesso_ate = acessoBase.toISOString()
      } else {
        updateCancelado.status = 'expired'
      }

      // Se o cancelante é um amigo ainda na carência, a indicação não conta.
      await supabase
        .from('indicacoes')
        .update({ status: 'cancelada' })
        .eq('indicado_id', userId)
        .eq('status', 'assinou')

      await supabase.from('profiles').update(updateCancelado).eq('id', userId)
      // Cancelamento sem período restante: desativa keywords imediatamente.
      // Com acesso_ate definido, o cron expirar-trials desativa quando o período vencer.
      if (updateCancelado.status === 'expired') {
        await supabase.from('keywords').update({ ativo: false }).eq('user_id', userId).eq('ativo', true)
      }
      await logWebhook({ tipo: type, dataId, status: 'ok', userId, mensagem: `cancelado${proximaCobranca ? ` acesso_ate=${proximaCobranca}` : ' expirado imediatamente'}` })
      console.log(
        `[webhook/mp] Cancelamento: user=${userId}` +
        (proximaCobranca ? ` acesso_ate=${proximaCobranca}` : ' expirado imediatamente')
      )
    }
  }

  return NextResponse.json({ ok: true })
}
