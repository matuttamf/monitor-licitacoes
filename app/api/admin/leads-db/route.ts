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
  try {
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

    // Contagem separada sem ORDER BY — evita full sort em 9M+ linhas
    // eslint-disable-next-line prefer-const
    let countQ = service.from('leads').select('*', { count: 'estimated', head: true })
    if (status !== 'todos') countQ = countQ.eq('status', status)
    if (uf !== 'todos')     countQ = countQ.eq('uf', uf)
    if (cnae)               countQ = countQ.ilike('cnae', `%${cnae}%`)
    if (fonte === 'cnae')        { countQ = countQ.eq('origem', 'cnae') }
    else if (fonte !== 'todos')  { countQ = countQ.eq('fonte', fonte).neq('origem', 'cnae') }
    if (q)                  countQ = countQ.or(`email.ilike.%${q}%,razao_social.ilike.%${q}%,nome_fantasia.ilike.%${q}%`)
    const { count, error: countError } = await countQ
    if (countError) console.error('[leads-db] count error:', countError.message)

    // Query de dados com ORDER BY + paginação
    // eslint-disable-next-line prefer-const
    let dataQ = service.from('leads').select('*').order(orderBy, { ascending: orderDir }).range(from, to)
    if (status !== 'todos') dataQ = dataQ.eq('status', status)
    if (uf !== 'todos')     dataQ = dataQ.eq('uf', uf)
    if (cnae)               dataQ = dataQ.ilike('cnae', `%${cnae}%`)
    if (fonte === 'cnae')        { dataQ = dataQ.eq('origem', 'cnae') }
    else if (fonte !== 'todos')  { dataQ = dataQ.eq('fonte', fonte).neq('origem', 'cnae') }
    if (q)                  dataQ = dataQ.or(`email.ilike.%${q}%,razao_social.ilike.%${q}%,nome_fantasia.ilike.%${q}%`)
    const { data, error } = await dataQ
    if (error) {
      console.error('[leads-db] Supabase error:', error)
      return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
    }

    const total = count ?? 0
    return NextResponse.json({
      leads:      data ?? [],
      total,
      page,
      page_size:  PAGE_SIZE,
      pages:      Math.ceil(total / PAGE_SIZE),
    })
  } catch (e) {
    console.error('[leads-db] Unhandled error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
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
