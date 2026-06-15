import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLimites } from '@/lib/planos'

function validarCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false
  const calc = (s: string, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(s[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 || r === 11 ? 0 : r
  }
  return calc(n, 9) === parseInt(n[9]) && calc(n, 10) === parseInt(n[10])
}

function validarCNPJ(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false
  const calc = (s: string, weights: number[]) =>
    weights.reduce((acc, w, i) => acc + parseInt(s[i]) * w, 0)
  const mod = (n: number) => { const r = n % 11; return r < 2 ? 0 : 11 - r }
  const d1 = mod(calc(n, [5,4,3,2,9,8,7,6,5,4,3,2]))
  const d2 = mod(calc(n, [6,5,4,3,2,9,8,7,6,5,4,3,2]))
  return parseInt(n[12]) === d1 && parseInt(n[13]) === d2
}

// GET — info pública do convite (para pré-preencher cadastro)
// Usa createAdminClient (sem cookies) pois o convidado ainda não está autenticado
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const service = createAdminClient()

  const { data: convite } = await service
    .from('invites')
    .select('email, owner_id, expira_em, usado')
    .eq('token', token)
    .single()

  if (!convite) return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  if (convite.usado) return NextResponse.json({ error: 'Este convite já foi utilizado.' }, { status: 410 })
  if (new Date(convite.expira_em) < new Date()) return NextResponse.json({ error: 'Este convite expirou.' }, { status: 410 })

  // Buscar nome e CNPJ base do owner para validação de vínculo
  const { data: ownerProfile } = await service
    .from('profiles')
    .select('nome, empresa, cnpj')
    .eq('id', convite.owner_id)
    .single()

  // Extrai base do CNPJ (8 primeiros dígitos) para validação do membro
  const cnpjOwnerBase = ownerProfile?.cnpj
    ? ownerProfile.cnpj.replace(/\D/g, '').slice(0, 8)
    : null

  return NextResponse.json({
    email: convite.email,
    owner: ownerProfile?.empresa || ownerProfile?.nome || 'sua equipe',
    cnpjOwnerBase,
  })
}

// POST — aceitar convite após cadastro
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { userId, cpf, cnpj, cargo, declaracao } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId obrigatório.' }, { status: 400 })

  // Validar CPF (obrigatório)
  if (!cpf) return NextResponse.json({ error: 'CPF obrigatório.' }, { status: 400 })
  if (!validarCPF(cpf)) return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 })

  // Validar declaração de vínculo (obrigatória)
  if (!declaracao) return NextResponse.json({ error: 'Declaração de vínculo obrigatória.' }, { status: 400 })

  const service = createAdminClient()

  const { data: convite } = await service
    .from('invites')
    .select('email, owner_id, expira_em, usado')
    .eq('token', token)
    .single()

  if (!convite) return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  if (convite.usado) return NextResponse.json({ error: 'Convite já utilizado.' }, { status: 410 })
  if (new Date(convite.expira_em) < new Date()) return NextResponse.json({ error: 'Convite expirado.' }, { status: 410 })

  // Confirmar que o userId pertence ao e-mail do convite
  const { data: authUser } = await service.auth.admin.getUserById(userId)
  if (!authUser?.user || authUser.user.email?.toLowerCase() !== convite.email.toLowerCase()) {
    return NextResponse.json({ error: 'E-mail não corresponde ao convite.' }, { status: 403 })
  }

  // Buscar plano e CNPJ do owner
  const { data: ownerProfile } = await service
    .from('profiles')
    .select('plano, cnpj')
    .eq('id', convite.owner_id)
    .single()

  const planoOwner = ownerProfile?.plano ?? 'basic'

  // Validar CNPJ do membro se fornecido (base deve coincidir com a do owner)
  let cnpjFormatado: string | null = null
  if (cnpj?.trim()) {
    if (!validarCNPJ(cnpj)) {
      return NextResponse.json({ error: 'CNPJ inválido.' }, { status: 400 })
    }
    const cnpjBase = cnpj.replace(/\D/g, '').slice(0, 8)
    const ownerBase = ownerProfile?.cnpj?.replace(/\D/g, '').slice(0, 8)
    if (ownerBase && cnpjBase !== ownerBase) {
      return NextResponse.json({
        error: 'O CNPJ informado não pertence à mesma empresa da conta contratante.',
      }, { status: 422 })
    }
    cnpjFormatado = cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const cpfFormatado = cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

  // Limite de palavras-chave por seat (anti-gaming)
  const { maxKeywordsPerSeat } = getLimites(planoOwner)

  // Confirmar e-mail do novo usuário e vincular ao owner
  await service.auth.admin.updateUserById(userId, { email_confirm: true })

  await service.from('profiles').update({
    owner_id:           convite.owner_id,
    status:             'active',
    plano:              planoOwner,
    max_keywords:       maxKeywordsPerSeat,
    cpf_membro:         cpfFormatado,
    cnpj_membro:        cnpjFormatado,
    cargo_membro:       cargo?.trim() || null,
    declaracao_vinculo: true,
  }).eq('id', userId)

  // Marcar convite como usado
  await service.from('invites').update({ usado: true }).eq('token', token)

  return NextResponse.json({ ok: true })
}
