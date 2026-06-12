import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

// ─── GET — lista campanhas com métricas agregadas ──────────────────────────

export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = createAdminClient()

  const [{ data: campanhas }, { data: profiles }] = await Promise.all([
    supabase.from('campanhas').select('*').order('criado_em', { ascending: false }),
    supabase
      .from('profiles')
      .select('campanha_id, status, valor_mensalidade, utm_source, utm_medium, utm_campaign, utm_content, criado_em, assinatura_inicio')
      .is('owner_id', null),
  ])

  const hoje = new Date()
  const h30  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Perfis sem campanha (orgânico/direto)
  const semCampanha = (profiles ?? []).filter(p => !p.campanha_id)
  const organico = buildMetrica(null, 'Orgânico / Direto', semCampanha, hoje, h30)

  const lista = (campanhas ?? []).map(c => {
    const atribuidos = (profiles ?? []).filter(p => p.campanha_id === c.id)
    const metricas   = buildMetrica(c, c.nome, atribuidos, hoje, h30)
    return { ...c, metricas }
  })

  // Totais globais
  const total = (profiles ?? []).length
  const comAtrib = (profiles ?? []).filter(p => !!p.campanha_id).length

  return NextResponse.json({ campanhas: lista, organico, totais: { total, comAtribuicao: comAtrib, semAtribuicao: total - comAtrib } })
}

type ProfileRow = {
  campanha_id: string | null
  status: string
  valor_mensalidade: number | null
  criado_em: string
  assinatura_inicio: string | null
}

function buildMetrica(campanha: { comissao_tipo: string; comissao_valor: number } | null, _nome: string, profiles: ProfileRow[], hoje: Date, h30: Date) {
  const registros   = profiles.length
  const ativos      = profiles.filter(p => p.status === 'active')
  const conversoes  = ativos.length
  const mrr         = ativos.reduce((s, p) => s + (p.valor_mensalidade ?? 0), 0)
  const conversoes30d = profiles.filter(p => p.assinatura_inicio && new Date(p.assinatura_inicio) >= h30 && p.status === 'active').length
  const churn30d    = profiles.filter(p => p.status === 'expired' && new Date(p.criado_em) >= h30).length

  let comissaoTotal = 0
  if (campanha && campanha.comissao_tipo === 'percentual') {
    comissaoTotal = ativos.reduce((s, p) => s + ((p.valor_mensalidade ?? 0) * campanha.comissao_valor / 100), 0)
  } else if (campanha && campanha.comissao_tipo === 'fixo') {
    comissaoTotal = conversoes * campanha.comissao_valor
  }

  return {
    registros,
    conversoes,
    taxaConversao:  registros ? Math.round((conversoes / registros) * 100) : 0,
    mrr,
    comissaoTotal,
    conversoes30d,
    churn30d,
  }
}

// ─── POST — criar campanha ─────────────────────────────────────────────────

export async function POST(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await request.json()
  const { nome, tipo, codigo, descricao, url_destino, comissao_tipo, comissao_valor, desconto_percentual, desconto_meses } = body

  if (!nome || !codigo) return NextResponse.json({ error: 'nome e codigo são obrigatórios' }, { status: 400 })

  // Normaliza o código: lowercase, sem espaços, só alfanumérico e hífen
  const codigoNorm = codigo.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('campanhas')
    .insert({ nome, tipo: tipo ?? 'outro', codigo: codigoNorm, descricao, url_destino,
      comissao_tipo: comissao_tipo ?? 'nenhum', comissao_valor: comissao_valor ?? 0,
      desconto_percentual: desconto_percentual ?? 0, desconto_meses: desconto_meses ?? 0 })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Código já existe. Use outro código.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[admin/campanhas] Criada:', codigoNorm)
  return NextResponse.json({ ok: true, campanha: data })
}

// ─── PATCH — atualizar campanha ────────────────────────────────────────────

export async function PATCH(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await request.json()
  const { id, ...campos } = body
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  // Não deixa alterar o código (quebraria links existentes)
  delete campos.codigo
  delete campos.criado_em
  delete campos.id

  const supabase = createAdminClient()
  const { error } = await supabase.from('campanhas').update(campos).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// ─── DELETE — desativa campanha ────────────────────────────────────────────

export async function DELETE(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const supabase = createAdminClient()
  // Desativa em vez de deletar — preserva histórico de atribuição
  const { error } = await supabase.from('campanhas').update({ ativo: false }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
