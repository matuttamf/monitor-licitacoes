import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { id } = await params
  const service = createAdminClient()

  // Keywords do usuário
  const { data: keywords } = await service
    .from('keywords')
    .select('id, termo, ativo, regiao, criado_em')
    .eq('user_id', id)
    .order('criado_em', { ascending: false })

  // Alertas recentes do usuário via keywords (alertas não tem user_id direto)
  const { data: alertas } = await service
    .from('alertas')
    .select('id, criado_em, canais, licitacoes(objeto, orgao, valor_estimado, data_abertura), keywords!inner(user_id)')
    .eq('keywords.user_id', id)
    .order('criado_em', { ascending: false })
    .limit(20)

  // Sub-usuários da mesma conta (se este usuário for owner)
  const { data: subUsuarios } = await service
    .from('profiles')
    .select('id, nome, email:id')
    .eq('owner_id', id)

  // Buscar emails dos sub-usuários
  let subComEmail: { id: string; nome: string | null; email: string }[] = []
  if (subUsuarios && subUsuarios.length > 0) {
    const subIds = subUsuarios.map(s => s.id)
    const { data: emailRows } = await service.from('profiles').select('id, email').in('id', subIds)
    const emailMap = Object.fromEntries((emailRows ?? []).map(u => [u.id, u.email ?? '']))
    subComEmail = subUsuarios.map(s => ({
      id: s.id,
      nome: s.nome,
      email: emailMap[s.id] ?? '—',
    }))
  }

  return NextResponse.json({
    keywords: keywords ?? [],
    alertas: alertas ?? [],
    subUsuarios: subComEmail,
  })
}
