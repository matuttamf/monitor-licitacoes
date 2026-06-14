/**
 * GET  /api/admin/leads-db?status=pendente&page=1&q=empresa
 *      → lista paginada de leads da tabela `leads`
 * PATCH /api/admin/leads-db
 *      → { id, status } altera status de um lead
 *      → { ids, status } altera múltiplos leads de uma vez
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
const PAGE_SIZE   = 50

async function checarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL ? user : null
}

export async function GET(req: NextRequest) {
  const user = await checarAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const sp       = req.nextUrl.searchParams
  const status   = sp.get('status') ?? 'todos'
  const page     = Math.max(1, Number(sp.get('page') ?? 1))
  const q        = (sp.get('q') ?? '').trim().toLowerCase()
  const uf       = sp.get('uf') ?? 'todos'
  const cnae     = (sp.get('cnae') ?? '').trim()
  const fonte    = sp.get('fonte') ?? 'todos'
  const ORDER_COLS_ALLOWED = ['razao_social','email','municipio','cnae','fonte','status','enviado_em','created_at']
  const orderBy  = ORDER_COLS_ALLOWED.includes(sp.get('order_by') ?? '') ? sp.get('order_by')! : 'created_at'
  const orderDir = sp.get('order_dir') === 'asc'

  const service = createAdminClient()
  const from    = (page - 1) * PAGE_SIZE
  const to      = from + PAGE_SIZE - 1

  let query = service
    .from('leads')
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending: orderDir, nullsFirst: false })
    .range(from, to)

  if (status !== 'todos') query = query.eq('status', status)
  if (uf !== 'todos')     query = query.eq('uf', uf)
  if (cnae)               query = query.ilike('cnae', `%${cnae}%`)
  if (fonte === 'cnae') {
    query = query.eq('origem', 'cnae')
  } else if (fonte !== 'todos') {
    query = query.eq('fonte', fonte).neq('origem', 'cnae')
  } else {
    // "todos" — ainda assim mostra cada lead uma única vez; CNAE/RF não duplica com Contrato
    // (sem filtro extra: todos aparecem, origem='cnae' incluído)
  }
  if (q)                  query = query.or(`email.ilike.%${q}%,razao_social.ilike.%${q}%,nome_fantasia.ilike.%${q}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    leads:      data ?? [],
    total:      count ?? 0,
    page,
    page_size:  PAGE_SIZE,
    pages:      Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}

export async function PATCH(req: NextRequest) {
  const user = await checarAdmin()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json() as { id?: string; ids?: string[]; status: string }
  const service = createAdminClient()

  const ids = body.ids ?? (body.id ? [body.id] : [])
  if (!ids.length) return NextResponse.json({ error: 'Nenhum id informado' }, { status: 400 })

  const STATUS_VALIDOS = ['pendente', 'enviado', 'erro', 'invalido', 'descadastrado']
  if (!STATUS_VALIDOS.includes(body.status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const update: Record<string, unknown> = { status: body.status }
  if (body.status === 'enviado') update.enviado_em = new Date().toISOString()
  if (body.status !== 'erro')    update.erro_msg   = null

  const { error } = await service
    .from('leads')
    .update(update)
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, atualizados: ids.length })
}
