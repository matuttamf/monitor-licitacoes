import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

const PRECOS: Record<string, number> = {
  basic:        49.90,
  profissional: 97.90,
  gestao:       197.90,
  pro:          197.90,  // retrocompatibilidade
  empresarial:  497.00,
}

export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) {
    console.warn('[admin/financeiro] GET: acesso negado')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const supabase = createAdminClient()

  // Buscar todos os perfis owners (sem owner_id) com dados fiscais e financeiros
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id, status, plano, periodo, trial_inicio, trial_fim, criado_em,
      nome, empresa, telefone, whatsapp,
      mp_subscription_id, assinatura_inicio, valor_mensalidade, acesso_ate,
      campanha_id,
      cnpj, cpf, tipo_pessoa, razao_social, nome_fantasia, ie,
      cep, logradouro, numero, complemento, bairro, cidade, estado_uf,
      status_nf
    `)
    .is('owner_id', null)
    .order('criado_em', { ascending: false })

  // Campanhas com comissão para cruzar com os assinantes
  const { data: campanhas } = await supabase
    .from('campanhas')
    .select('id, nome, codigo, comissao_tipo, comissao_valor')
    .neq('comissao_tipo', 'nenhum')

  // Fallback NF: diretório de fornecedores tem cnpj/razao_social quando completar-cadastro não foi feito
  const { data: fornecedores } = await supabase
    .from('fornecedores')
    .select('user_id, cnpj, razao_social')

  const fornecedorMap: Record<string, { cnpj: string; razao_social: string }> = {}
  for (const f of fornecedores ?? []) {
    if (f.user_id) fornecedorMap[f.user_id] = { cnpj: f.cnpj, razao_social: f.razao_social }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: authData } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries((authData?.users ?? []).map(u => [u.id, u.email ?? '']))

  const hoje = new Date()

  // Admin não é assinante — excluir das métricas financeiras
  const profilesSemAdmin = (profiles ?? []).filter(p => emailMap[p.id] !== ADMIN_EMAIL)

  const campanhaMap = Object.fromEntries((campanhas ?? []).map(c => [c.id, c]))

  // Comissões one-time por assinante (afiliado_pagamentos)
  const { data: comissoesPorProfile } = await supabase
    .from('afiliado_pagamentos')
    .select('profile_id, valor, status')
  const comissaoByProfile: Record<string, { valor: number; status: string }> = {}
  for (const c of comissoesPorProfile ?? []) {
    if (c.profile_id) comissaoByProfile[c.profile_id] = { valor: c.valor, status: c.status }
  }

  const assinantes = profilesSemAdmin.map(p => {
    const periodoAssinante: 'mensal' | 'anual' = p.periodo === 'anual' ? 'anual' : 'mensal'
    const valorCobrado = p.valor_mensalidade ?? PRECOS[p.plano ?? ''] ?? null
    const valorMensalEquiv = valorCobrado
      ? periodoAssinante === 'anual' ? Math.round(valorCobrado / 12 * 100) / 100 : valorCobrado
      : null
    const email = emailMap[p.id] ?? ''
    const trialExpirado = p.status === 'trial' && p.trial_fim && new Date(p.trial_fim) < hoje
    const statusFinal = trialExpirado ? 'expired' : p.status

    // Comissão one-time registrada no afiliado_pagamentos
    let comissaoMensal = 0
    let campanhaNome: string | null = null
    if (p.campanha_id) {
      campanhaNome = campanhaMap[p.campanha_id]?.nome ?? null
      comissaoMensal = comissaoByProfile[p.id]?.valor ?? 0
    }

    return {
      id:                  p.id,
      email,
      nome:                p.nome,
      empresa:             p.empresa,
      telefone:            p.telefone,
      whatsapp:            p.whatsapp,
      status:              statusFinal,
      plano:               p.plano ?? 'basic',
      periodo:             periodoAssinante,
      valor_mensalidade:   valorMensalEquiv,   // sempre equivalente mensal (para MRR)
      valor_cobrado:       valorCobrado,        // valor real do ciclo (mensal ou anual)
      assinatura_inicio:   p.assinatura_inicio,
      trial_fim:           p.trial_fim,
      criado_em:           p.criado_em,
      mp_subscription_id:  p.mp_subscription_id,
      acesso_ate:          p.acesso_ate ?? null,
      campanha_nome:       campanhaNome,
      comissao_mensal:     comissaoMensal,
      // Dados NF (fallback: diretório de fornecedores quando completar-cadastro não foi feito)
      cnpj:        p.cnpj || fornecedorMap[p.id]?.cnpj || null,
      cpf:         p.cpf,
      tipo_pessoa: p.tipo_pessoa,
      razao_social:  p.razao_social || fornecedorMap[p.id]?.razao_social || null,
      nome_fantasia: p.nome_fantasia,
      ie:          p.ie,
      cep:         p.cep,
      logradouro:  p.logradouro,
      numero:      p.numero,
      complemento: p.complemento,
      bairro:      p.bairro,
      cidade:      p.cidade,
      estado_uf:   p.estado_uf,
      status_nf:   (p.status_nf ?? 'pendente') as 'pendente' | 'emitida' | 'enviada' | 'cancelada',
    }
  })

  const pagantes         = assinantes.filter(a => a.status === 'active')
  const trials           = assinantes.filter(a => a.status === 'trial')
  // "expirados" = trials que não converteram + assinaturas encerradas + bloqueados financeiros
  const expirados        = assinantes.filter(a => a.status === 'expired' || a.status === 'bloqueado')
  const trialsNaoConvert = expirados.filter(a => !a.mp_subscription_id && !a.assinatura_inicio)

  const mrr = pagantes.reduce((acc, a) => acc + (a.valor_mensalidade ?? 0), 0)

  // Churn: assinaturas pagas que encerraram nos últimos 30 dias
  const h30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const churnMensal = expirados.filter(a =>
    a.assinatura_inicio && a.acesso_ate && new Date(a.acesso_ate) >= h30
  ).length

  // Conversão: (pagantes atuais) / (pagantes + trials que nunca converteram)
  const totalConvertidos = pagantes.length
  const totalTrials      = totalConvertidos + trialsNaoConvert.length

  // Novas assinaturas nos últimos 7 dias
  const h7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const novas7d = pagantes.filter(a => a.assinatura_inicio && new Date(a.assinatura_inicio) >= h7)
  const receita7d = novas7d.reduce((s, a) => s + (a.valor_mensalidade ?? 0), 0)

  // Taxa MP para assinaturas via cartão de crédito à vista (Checkout — Planos de assinatura)
  const TAXA_MP = 0.0498
  const taxasMpMensal = Math.round(mrr * TAXA_MP * 100) / 100
  const comissaoMensal = pagantes.reduce((s, a) => s + (a.comissao_mensal ?? 0), 0)
  const mrrLiquido = Math.round((mrr - taxasMpMensal - comissaoMensal) * 100) / 100

  const kpis = {
    mrr,
    mrrLiquido,
    taxasMpMensal,
    comissaoMensal,
    arr:                  mrr * 12,
    totalPagantes:        pagantes.length,
    totalTrials:          trials.length,
    totalTrialsNaoConvert: trialsNaoConvert.length,
    totalExpirados:       expirados.length,
    ticketMedio:          pagantes.length ? mrr / pagantes.length : 0,
    churnMensal,
    taxaConversao:        totalTrials ? Math.round((totalConvertidos / totalTrials) * 100) : 0,
    novas7d:              novas7d.length,
    receita7d,
    receitaPorPlano: Object.entries(PRECOS).map(([plano, preco]) => ({
      plano,
      count:   pagantes.filter(a => a.plano === plano).length,
      receita: pagantes.filter(a => a.plano === plano).reduce((s, a) => s + (a.valor_mensalidade ?? preco), 0),
    })),
  }

  console.log(`[admin/financeiro] GET: ${assinantes.length} perfis, MRR=${kpis.mrr}`)
  return NextResponse.json({ kpis, assinantes })
}

export async function PATCH(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) {
    console.warn('[admin/financeiro] PATCH: acesso negado')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { id, status, plano, valor_mensalidade, assinatura_inicio, acesso_ate, mp_subscription_id } = body
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {}
  if (status              !== undefined) update.status              = status
  if (plano               !== undefined) update.plano               = plano
  if (valor_mensalidade   !== undefined) update.valor_mensalidade   = valor_mensalidade
  if (assinatura_inicio   !== undefined) update.assinatura_inicio   = assinatura_inicio
  if (acesso_ate          !== undefined) update.acesso_ate          = acesso_ate
  if (mp_subscription_id  !== undefined) update.mp_subscription_id  = mp_subscription_id
  if (body.status_nf      !== undefined) update.status_nf           = body.status_nf

  const { error } = await supabase.from('profiles').update(update).eq('id', id)
  if (error) {
    console.error('[admin/financeiro] PATCH erro:', error.message, { id })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.log('[admin/financeiro] PATCH:', { id, campos: Object.keys(update) })
  return NextResponse.json({ ok: true })
}
