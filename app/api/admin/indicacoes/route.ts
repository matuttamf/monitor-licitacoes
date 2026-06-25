import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { LIMIAR_AFILIADO } from '@/lib/indicacoes'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

// ─── GET — métricas globais + ranking + candidatos a afiliado ────────────────

export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = createAdminClient()

  const [{ data: config }, { data: indicacoes }, { data: topProfiles }] = await Promise.all([
    supabase.from('configuracoes').select('valor').eq('chave', 'indicacoes_ativa').maybeSingle(),
    supabase.from('indicacoes').select('status, valor_economia'),
    supabase
      .from('profiles')
      .select('id, nome, email, indica_codigo, indica_creditos_total, indica_economia_total, afiliado_id, indica_afiliado_alertado')
      .not('indica_codigo', 'is', null)
      .order('indica_creditos_total', { ascending: false })
      .limit(50),
  ])

  const ativa = config?.valor === true || config?.valor === 'true'
  const lista = indicacoes ?? []

  const metricas = {
    total:      lista.length,
    pendentes:  lista.filter(i => i.status === 'pendente').length,
    aguardando: lista.filter(i => i.status === 'assinou').length,
    liberadas:  lista.filter(i => i.status === 'liberada').length,
    canceladas: lista.filter(i => i.status === 'cancelada').length,
    fraudes:    lista.filter(i => i.status === 'fraude').length,
    diasConcedidos: lista.filter(i => i.status === 'liberada').length * 30,
  }

  // Ranking dos indicadores (por liberadas) — contagem por indicador
  const { data: porIndicador } = await supabase
    .from('indicacoes')
    .select('indicador_id')
    .eq('status', 'liberada')
  const contagem = new Map<string, number>()
  for (const r of porIndicador ?? []) contagem.set(r.indicador_id, (contagem.get(r.indicador_id) ?? 0) + 1)

  const ranking = (topProfiles ?? []).map(p => ({
    id: p.id,
    nome: p.nome,
    email: p.email,
    codigo: p.indica_codigo,
    liberadas: contagem.get(p.id) ?? 0,
    diasTotal: p.indica_creditos_total ?? 0,
    economia: p.indica_economia_total ?? 0,
    ehAfiliado: !!p.afiliado_id,
  })).sort((a, b) => b.liberadas - a.liberadas)

  // Candidatos a afiliado: 10+ liberadas e ainda não são afiliados
  const candidatos = ranking.filter(r => r.liberadas >= LIMIAR_AFILIADO && !r.ehAfiliado)

  return NextResponse.json({ ativa, metricas, ranking, candidatos, limiarAfiliado: LIMIAR_AFILIADO })
}

// ─── POST — ativar/pausar campanha ───────────────────────────────────────────

export async function POST(request: Request) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { ativa } = await request.json()
  const valor = ativa === true

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('configuracoes')
    .upsert({ chave: 'indicacoes_ativa', valor }, { onConflict: 'chave' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log(`[admin/indicacoes] Campanha ${valor ? 'ATIVADA' : 'pausada'} por ${admin.email}`)
  return NextResponse.json({ ok: true, ativa: valor })
}
