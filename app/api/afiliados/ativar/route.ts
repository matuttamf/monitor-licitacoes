import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — verifica token e retorna nome/email
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })

  const admin = adminClient()
  const { data: afiliado } = await admin
    .from('afiliados')
    .select('nome, email, status, token_expira_em, user_id')
    .eq('token_convite', token)
    .maybeSingle()

  if (!afiliado) return NextResponse.json({ error: 'Link inválido ou já utilizado.' }, { status: 404 })
  if (afiliado.user_id) return NextResponse.json({ error: 'Este convite já foi utilizado.' }, { status: 409 })
  if (afiliado.token_expira_em && new Date(afiliado.token_expira_em) < new Date()) {
    return NextResponse.json({ error: 'Este link expirou. Solicite um novo convite.' }, { status: 410 })
  }

  // Verifica se o e-mail já tem conta Supabase (para adaptar o formulário no frontend)
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const temConta = users.some(u => u.email === afiliado.email)

  return NextResponse.json({ nome: afiliado.nome, email: afiliado.email, temConta })
}

// POST — cria conta Supabase e ativa o afiliado
export async function POST(request: NextRequest) {
  const { token, senha } = await request.json()
  if (!token || !senha) return NextResponse.json({ error: 'Token e senha são obrigatórios' }, { status: 400 })
  if (senha.length < 8) return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 })

  const admin = adminClient()

  const { data: afiliado } = await admin
    .from('afiliados')
    .select('id, nome, email, status, token_expira_em, user_id, campanha_id')
    .eq('token_convite', token)
    .maybeSingle()

  if (!afiliado) return NextResponse.json({ error: 'Link inválido.' }, { status: 404 })
  if (afiliado.user_id) return NextResponse.json({ error: 'Convite já utilizado.' }, { status: 409 })
  if (afiliado.token_expira_em && new Date(afiliado.token_expira_em) < new Date()) {
    return NextResponse.json({ error: 'Link expirado.' }, { status: 410 })
  }

  // Cria usuário no Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email:          afiliado.email,
    password:       senha,
    email_confirm:  true,
    user_metadata:  { nome: afiliado.nome, tipo: 'afiliado' },
  })

  let userId: string

  if (authError) {
    const jaExiste = authError.message.includes('already been registered')
    if (!jaExiste) return NextResponse.json({ error: authError.message }, { status: 500 })

    // E-mail já tem conta — localiza o user_id existente e vincula ao afiliado
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existing = users.find(u => u.email === afiliado.email)
    if (!existing) return NextResponse.json({ error: 'Conta existente não encontrada.' }, { status: 500 })
    userId = existing.id
  } else {
    userId = authData.user.id
  }

  // Vincula user_id ao afiliado e ativa
  const { error: updateError } = await admin
    .from('afiliados')
    .update({
      user_id:         userId,
      status:          'ativo',
      token_convite:   null,
      token_expira_em: null,
    })
    .eq('id', afiliado.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Indica se era conta já existente (frontend não tenta login com senha nova)
  const contaExistente = !!authError
  return NextResponse.json({ ok: true, contaExistente })
}
