import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLimites, temMultiUsuario } from '@/lib/planos'
import { enviarEmailConvite } from '@/lib/emails/convite'

// GET — lista membros da equipe e convites pendentes
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, owner_id')
    .eq('id', user.id)
    .single()

  // Sub-usuários não gerenciam equipe
  if (profile?.owner_id) {
    return NextResponse.json({ error: 'Apenas o dono da conta pode gerenciar a equipe.' }, { status: 403 })
  }

  const plano = profile?.plano ?? 'basic'
  if (!temMultiUsuario(plano)) {
    return NextResponse.json({ error: 'Seu plano não inclui múltiplos usuários.' }, { status: 403 })
  }

  const service = createAdminClient()

  // Buscar sub-usuários
  const { data: subProfiles } = await service
    .from('profiles')
    .select('id, nome, empresa, criado_em, membro_ativo, cpf_membro, cnpj_membro, cargo_membro, declaracao_vinculo')
    .eq('owner_id', user.id)

  // Buscar emails dos sub-usuários via admin
  const { data: authUsers } = await service.auth.admin.listUsers()
  const subIds = (subProfiles ?? []).map(p => p.id)
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? [])
      .filter(u => subIds.includes(u.id))
      .map(u => [u.id, u.email ?? ''])
  )

  const membros = (subProfiles ?? []).map(p => ({
    id: p.id,
    email: emailMap[p.id] ?? '',
    nome: p.nome ?? '',
    empresa: p.empresa ?? '',
    criado_em: p.criado_em,
    ativo: p.membro_ativo !== false,
    cpf_membro: p.cpf_membro ?? null,
    cnpj_membro: p.cnpj_membro ?? null,
    cargo_membro: p.cargo_membro ?? null,
    declaracao_vinculo: p.declaracao_vinculo ?? false,
  }))

  // Buscar convites pendentes
  const { data: convites } = await service
    .from('invites')
    .select('id, email, criado_em, expira_em')
    .eq('owner_id', user.id)
    .eq('usado', false)
    .gt('expira_em', new Date().toISOString())
    .order('criado_em', { ascending: false })

  const { maxUsers } = getLimites(plano)

  return NextResponse.json({
    plano,
    maxUsers,
    totalAtual: membros.length + 1, // +1 pelo próprio owner
    membros,
    convitesPendentes: convites ?? [],
  })
}

// POST — enviar convite
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { email } = await request.json()
  if (!email?.trim()) return NextResponse.json({ error: 'E-mail obrigatório.' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, owner_id, nome, empresa')
    .eq('id', user.id)
    .single()

  if (profile?.owner_id) {
    return NextResponse.json({ error: 'Apenas o dono da conta pode convidar membros.' }, { status: 403 })
  }

  const plano = profile?.plano ?? 'basic'
  if (!temMultiUsuario(plano)) {
    return NextResponse.json({ error: 'Seu plano não inclui múltiplos usuários.' }, { status: 403 })
  }

  const service = createAdminClient()

  // Verificar limite de usuários
  const { count: subCount } = await service
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  const { maxUsers } = getLimites(plano)
  if ((subCount ?? 0) + 1 >= maxUsers) { // +1 pelo owner
    return NextResponse.json({
      error: `Limite de ${maxUsers} usuários atingido no plano ${plano}. Faça upgrade para adicionar mais membros.`
    }, { status: 403 })
  }

  // Verificar se e-mail já tem conta ou convite pendente
  const { data: authUsers } = await service.auth.admin.listUsers()
  const jaExiste = authUsers?.users.some(u => u.email?.toLowerCase() === email.trim().toLowerCase())
  if (jaExiste) {
    return NextResponse.json({ error: 'Este e-mail já possui uma conta no sistema.' }, { status: 409 })
  }

  const { data: conviteExistente } = await service
    .from('invites')
    .select('id')
    .eq('owner_id', user.id)
    .eq('email', email.trim().toLowerCase())
    .eq('usado', false)
    .gt('expira_em', new Date().toISOString())
    .single()

  if (conviteExistente) {
    return NextResponse.json({ error: 'Já existe um convite pendente para este e-mail.' }, { status: 409 })
  }

  // Criar convite
  const { data: convite, error: errConvite } = await service
    .from('invites')
    .insert({ owner_id: user.id, email: email.trim().toLowerCase() })
    .select('token')
    .single()

  if (errConvite || !convite) {
    return NextResponse.json({ error: 'Erro ao criar convite.' }, { status: 500 })
  }

  // Enviar e-mail
  const enviado = await enviarEmailConvite({
    emailConvidado: email.trim(),
    nomeOwner: profile?.nome ?? '',
    empresaOwner: profile?.empresa ?? '',
    token: convite.token,
  })

  if (!enviado) {
    return NextResponse.json({ error: 'Convite criado, mas falha ao enviar e-mail. Tente reenviar.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
