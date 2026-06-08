/**
 * GET /api/admin/inteligencia
 * Dados agregados para o painel de inteligência de mercado.
 * Acesso restrito ao admin.
 */
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const service = createAdminClient()

  // Janelas de tempo
  const hoje    = new Date()
  const d30     = new Date(hoje); d30.setDate(d30.getDate() - 30)
  const d7      = new Date(hoje); d7.setDate(d7.getDate() - 7)
  const d30Iso  = d30.toISOString()
  const d7Iso   = d7.toISOString()

  const [
    totalLic,
    totalLeads,
    porEstadoRes,
    porFonteRes,
    timelineRes,
    topOrgaosRes,
    porValorRes,
    leadsSegmentoRes,
    leadsUFRes,
    leadsStatusRes,
    lic7dRes,
    licHojeRes,
  ] = await Promise.all([
    // Totais
    service.from('licitacoes').select('id', { count: 'exact', head: true }),
    service.from('leads').select('id', { count: 'exact', head: true }),

    // Licitações por estado (top 20)
    service.from('licitacoes')
      .select('estado')
      .not('estado', 'is', null)
      .neq('estado', ''),

    // Licitações por fonte (top 15)
    service.from('licitacoes')
      .select('fonte'),

    // Timeline 30 dias — coletado_em por dia
    service.from('licitacoes')
      .select('coletado_em')
      .gte('coletado_em', d30Iso),

    // Top 10 órgãos
    service.from('licitacoes')
      .select('orgao')
      .not('orgao', 'is', null)
      .neq('orgao', ''),

    // Distribuição de valores
    service.from('licitacoes')
      .select('valor_estimado')
      .not('valor_estimado', 'is', null)
      .gt('valor_estimado', 0),

    // Leads por segmento
    service.from('leads')
      .select('segmento')
      .not('segmento', 'is', null),

    // Leads por UF (top 15)
    service.from('leads')
      .select('uf')
      .not('uf', 'is', null),

    // Leads por status
    service.from('leads')
      .select('status'),

    // Licitações últimos 7 dias
    service.from('licitacoes').select('id', { count: 'exact', head: true })
      .gte('coletado_em', d7Iso),

    // Licitações hoje
    service.from('licitacoes').select('id', { count: 'exact', head: true })
      .gte('coletado_em', new Date(hoje.toDateString()).toISOString()),
  ])

  // ── Agregar por estado ────────────────────────────────────────────────────
  const estadoMap = new Map<string, number>()
  for (const row of porEstadoRes.data ?? []) {
    const e = (row.estado ?? '').toUpperCase().trim()
    if (e) estadoMap.set(e, (estadoMap.get(e) ?? 0) + 1)
  }
  const porEstado = [...estadoMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([uf, total]) => ({ uf, total }))

  // ── Agregar por fonte ─────────────────────────────────────────────────────
  const fonteMap = new Map<string, number>()
  for (const row of porFonteRes.data ?? []) {
    const f = row.fonte ?? 'Desconhecida'
    fonteMap.set(f, (fonteMap.get(f) ?? 0) + 1)
  }
  const porFonte = [...fonteMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([fonte, total]) => ({ fonte, total }))

  // ── Timeline 30 dias ──────────────────────────────────────────────────────
  const timelineMap = new Map<string, number>()
  for (const row of timelineRes.data ?? []) {
    const dia = (row.coletado_em as string)?.slice(0, 10)
    if (dia) timelineMap.set(dia, (timelineMap.get(dia) ?? 0) + 1)
  }
  // Preencher dias sem dados com 0
  const timeline30d: { data: string; total: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    timeline30d.push({ data: key, total: timelineMap.get(key) ?? 0 })
  }

  // ── Top órgãos ────────────────────────────────────────────────────────────
  const orgaoMap = new Map<string, number>()
  for (const row of topOrgaosRes.data ?? []) {
    const o = (row.orgao as string)?.trim().slice(0, 60)
    if (o) orgaoMap.set(o, (orgaoMap.get(o) ?? 0) + 1)
  }
  const topOrgaos = [...orgaoMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([orgao, total]) => ({ orgao, total }))

  // ── Distribuição de valores ───────────────────────────────────────────────
  const faixas = { ate10k: 0, ate100k: 0, ate1m: 0, ate10m: 0, acima10m: 0 }
  for (const row of porValorRes.data ?? []) {
    const v = row.valor_estimado as number
    if (v <= 10_000)       faixas.ate10k++
    else if (v <= 100_000) faixas.ate100k++
    else if (v <= 1_000_000) faixas.ate1m++
    else if (v <= 10_000_000) faixas.ate10m++
    else faixas.acima10m++
  }

  // ── Leads por segmento ────────────────────────────────────────────────────
  const segMap = new Map<string, number>()
  for (const row of leadsSegmentoRes.data ?? []) {
    const s = row.segmento ?? 'outros'
    segMap.set(s, (segMap.get(s) ?? 0) + 1)
  }
  const leadsSegmento = [...segMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([segmento, total]) => ({ segmento, total }))

  // ── Leads por UF ─────────────────────────────────────────────────────────
  const leadsUFMap = new Map<string, number>()
  for (const row of leadsUFRes.data ?? []) {
    const u = (row.uf as string)?.toUpperCase().trim()
    if (u) leadsUFMap.set(u, (leadsUFMap.get(u) ?? 0) + 1)
  }
  const leadsUF = [...leadsUFMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([uf, total]) => ({ uf, total }))

  // ── Leads por status ──────────────────────────────────────────────────────
  const statusMap = new Map<string, number>()
  for (const row of leadsStatusRes.data ?? []) {
    const s = row.status ?? 'pendente'
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }

  return NextResponse.json({
    totais: {
      licitacoes:    totalLic.count ?? 0,
      leads:         totalLeads.count ?? 0,
      licitacoes7d:  lic7dRes.count ?? 0,
      licitacoesHoje: licHojeRes.count ?? 0,
    },
    porEstado,
    porFonte,
    timeline30d,
    topOrgaos,
    porValor: faixas,
    leadsSegmento,
    leadsUF,
    leadsStatus: Object.fromEntries(statusMap),
  })
}
