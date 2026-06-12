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
  pro:          197.90,
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
      id, status, plano, trial_inicio, trial_fim, criado_em,
      nome, empresa, telefone, whatsapp,
      mp_subscription_id, assinatura_inicio, valor_mensalidade, acesso_ate,
      cnpj, cpf, tipo_pessoa, razao_social, nome_fantasia, ie,
      cep, logradouro, numero, complemento, bairro, cidade, estado_uf
    `)
    .is('owner_id', null)
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: authData } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries((authData?.users ?? []).map(u => [u.id, u.email ?? '']))

  const hoje = new Date()

  // Admin não é assinante — excluir das métricas financeiras
  const profilesSemAdmin = (profiles ?? []).filter(p => emailMap[p.id] !== ADMIN_EMAIL)

  const assinantes = profilesSemAdmin.map(p => {
    const preco = p.valor_mensalidade ?? PRECOS[p.plano ?? ''] ?? null
    const email = emailMap[p.id] ?? ''
    const trialExpirado = p.status === 'trial' && p.trial_fim && new Date(p.trial_fim) < hoje

    return {
      id:                  p.id,
      email,
      nome:                p.nome,
      empresa:             p.empresa,
      telefone:            p.telefone,
      whatsapp:            p.whatsapp,
      status:              trialExpirado ? 'expired' : p.status,
      plano:               p.plano ?? 'basic',
      valor_mensalidade:   preco,
      assinatura_inicio:   p.assinatura_inicio,
      trial_fim:           p.trial_fim,
      criado_em:           p.criado_em,
      mp_subscription_id:  p.mp_subscription_id,
      acesso_ate:          p.acesso_ate ?? null,
      // Dados NF
      cnpj:        p.cnpj,
      cpf:         p.cpf,
      tipo_pessoa: p.tipo_pessoa,
      razao_social:  p.razao_social,
      nome_fantasia: p.nome_fantasia,
      ie:          p.ie,
      cep:         p.cep,
      logradouro:  p.logradouro,
      numero:      p.numero,
      complemento: p.complemento,
      bairro:      p.bairro,
      cidade:      p.cidade,
      estado_uf:   p.estado_uf,
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
    a.assinatura_inicio && a.trial_fim && new Date(a.trial_fim) >= h30
  ).length

  // Conversão: (pagantes atuais) / (pagantes + trials que nunca converteram)
  const totalConvertidos = pagantes.length
  const totalTrials      = totalConvertidos + trialsNaoConvert.length

  const kpis = {
    mrr,
    arr:                  mrr * 12,
    totalPagantes:        pagantes.length,
    totalTrials:          trials.length,
    // trials que fizeram cadastro mas nunca assinaram (sem histórico de mp)
    totalTrialsNaoConvert: trialsNaoConvert.length,
    totalExpirados:       expirados.length,
    ticketMedio:          pagantes.length ? mrr / pagantes.length : 0,
    churnMensal,
    taxaConversao:        totalTrials ? Math.round((totalConvertidos / totalTrials) * 100) : 0,
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
  const { id, status, plano, valor_mensalidade, assinatura_inicio, acesso_ate } = body
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {}
  if (status             !== undefined) update.status             = status
  if (plano              !== undefined) update.plano              = plano
  if (valor_mensalidade  !== undefined) update.valor_mensalidade  = valor_mensalidade
  if (assinatura_inicio  !== undefined) update.assinatura_inicio  = assinatura_inicio
  if (acesso_ate         !== undefined) update.acesso_ate         = acesso_ate

  const { error } = await supabase.from('profiles').update(update).eq('id', id)
  if (error) {
    console.error('[admin/financeiro] PATCH erro:', error.message, { id })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.log('[admin/financeiro] PATCH:', { id, campos: Object.keys(update) })
  return NextResponse.json({ ok: true })
}
