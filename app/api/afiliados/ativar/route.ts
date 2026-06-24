import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Busca um usuário do Auth por e-mail paginando (listUsers não filtra por e-mail).
// Evita o bug de só olhar os primeiros 1000 usuários.
async function findUserByEmail(admin: ReturnType<typeof adminClient>, email: string) {
  const alvo = email.toLowerCase().trim()
  for (let page = 1; page <= 50; page++) { // teto de segurança: 50 * 200 = 10k
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error || !data?.users?.length) return null
    const found = data.users.find(u => u.email?.toLowerCase() === alvo)
    if (found) return found
    if (data.users.length < 200) return null
  }
  return null
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
  const temConta = !!(await findUserByEmail(admin, afiliado.email))

  return NextResponse.json({ nome: afiliado.nome, email: afiliado.email, temConta })
}

// POST — ativa o afiliado.
//  • Se o e-mail JÁ tem conta: vincula sem exigir senha (registra o aceite) → o
//    afiliado faz login na conta existente para acessar o painel.
//  • Se NÃO tem conta: exige senha, cria a conta e vincula.
export async function POST(request: NextRequest) {
  const { token, senha } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })

  const admin = adminClient()

  const { data: afiliado } = await admin
    .from('afiliados')
    .select('id, nome, email, status, token_expira_em, user_id')
    .eq('token_convite', token)
    .maybeSingle()

  if (!afiliado) return NextResponse.json({ error: 'Link inválido.' }, { status: 404 })
  if (afiliado.user_id) return NextResponse.json({ error: 'Convite já utilizado.' }, { status: 409 })
  if (afiliado.token_expira_em && new Date(afiliado.token_expira_em) < new Date()) {
    return NextResponse.json({ error: 'Link expirado.' }, { status: 410 })
  }

  let userId: string
  let contaExistente: boolean

  const existente = await findUserByEmail(admin, afiliado.email)
  if (existente) {
    // Conta já existe → registra o aceite vinculando, sem mexer na senha.
    userId = existente.id
    contaExistente = true
  } else {
    // Conta nova → senha obrigatória.
    if (!senha || String(senha).length < 8) {
      return NextResponse.json({ error: 'Defina uma senha de pelo menos 8 caracteres.' }, { status: 400 })
    }
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email:         afiliado.email,
      password:      senha,
      email_confirm: true,
      user_metadata: { nome: afiliado.nome, tipo: 'afiliado' },
    })
    if (authError) {
      // Corrida: a conta passou a existir nesse meio-tempo — localiza e vincula.
      const e2 = await findUserByEmail(admin, afiliado.email)
      if (!e2) return NextResponse.json({ error: authError.message }, { status: 500 })
      userId = e2.id
      contaExistente = true
    } else {
      userId = authData.user.id
      contaExistente = false
    }
  }

  const { error: updateError } = await admin
    .from('afiliados')
    .update({ user_id: userId, status: 'ativo', token_convite: null, token_expira_em: null })
    .eq('id', afiliado.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ ok: true, contaExistente })
}
