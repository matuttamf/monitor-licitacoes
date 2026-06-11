/**
 * GET /api/admin/inteligencia
 * Dados agregados para o painel de inteligência de mercado.
 * Acesso restrito ao admin.
 * Usa RPCs para agregação no banco — evita truncamento PostgREST (max 1000 linhas).
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

  const hoje   = new Date()
  const d7Iso  = new Date(hoje.getTime() - 7  * 86400000).toISOString()
  const hojeDayIso = new Date(hoje.toDateString()).toISOString()

  const [
    totalLic,
    totalLeads,
    lic7dRes,
    licHojeRes,
    porEstadoRes,
    porFonteRes,
    timelineRes,
    topOrgaosRes,
    porValorRes,
    leadsSegmentoRes,
    leadsUFRes,
    leadsStatusCounts,
  ] = await Promise.all([
    service.from('licitacoes').select('id', { count: 'exact', head: true }),
    service.from('leads').select('id', { count: 'exact', head: true }),
    service.from('licitacoes').select('id', { count: 'exact', head: true }).gte('coletado_em', d7Iso),
    service.from('licitacoes').select('id', { count: 'exact', head: true }).gte('coletado_em', hojeDayIso),

    // Agregações via RPC — sem limite de 1000 linhas
    service.rpc('admin_lic_por_estado'),
    service.rpc('admin_lic_por_fonte'),
    service.rpc('admin_lic_timeline_30d'),
    service.rpc('admin_top_orgaos'),
    service.rpc('admin_lic_por_valor'),
    service.rpc('admin_leads_por_segmento'),
    service.rpc('admin_leads_por_uf'),

    // Leads por status — contagens separadas
    Promise.all([
      service.from('leads').select('id', { count: 'exact', head: true }).or('status.is.null,status.eq.pendente'),
      service.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'enviado'),
      service.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'erro'),
      service.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'invalido'),
      service.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'descadastrado'),
    ]),
  ])

  // ── Por estado ───────────────────────────────────────────────────────────
  const porEstado = (porEstadoRes.data ?? []).map((r: { uf: string; total: number }) => ({
    uf: r.uf,
    total: Number(r.total),
  }))

  // ── Por fonte ────────────────────────────────────────────────────────────
  const porFonte = (porFonteRes.data ?? []).map((r: { fonte: string; total: number }) => ({
    fonte: r.fonte,
    total: Number(r.total),
  }))

  // ── Timeline 30 dias (preenche dias sem dados com 0) ─────────────────────
  const tmMap = new Map<string, number>()
  for (const r of timelineRes.data ?? []) {
    tmMap.set((r as { data: string }).data, Number((r as { total: number }).total))
  }
  const timeline30d: { data: string; total: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    timeline30d.push({ data: key, total: tmMap.get(key) ?? 0 })
  }

  // ── Top órgãos ───────────────────────────────────────────────────────────
  const topOrgaos = (topOrgaosRes.data ?? []).map((r: { orgao: string; total: number }) => ({
    orgao: r.orgao,
    total: Number(r.total),
  }))

  // ── Distribuição de valores ──────────────────────────────────────────────
  const faixas = { ate10k: 0, ate100k: 0, ate1m: 0, ate10m: 0, acima10m: 0 }
  for (const r of porValorRes.data ?? []) {
    const row = r as { faixa: string; total: number }
    const k = row.faixa as keyof typeof faixas
    if (k in faixas) faixas[k] = Number(row.total)
  }

  // ── Leads por segmento ───────────────────────────────────────────────────
  const leadsSegmento = (leadsSegmentoRes.data ?? []).map((r: { segmento: string; total: number }) => ({
    segmento: r.segmento,
    total: Number(r.total),
  }))

  // ── Leads por UF ────────────────────────────────────────────────────────
  const leadsUF = (leadsUFRes.data ?? []).map((r: { uf: string; total: number }) => ({
    uf: r.uf,
    total: Number(r.total),
  }))

  // ── Leads por status ─────────────────────────────────────────────────────
  const [cPendente, cEnviado, cErro, cInvalido, cDescadastrado] = leadsStatusCounts
  const leadsStatus: Record<string, number> = {
    pendente:      cPendente.count      ?? 0,
    enviado:       cEnviado.count       ?? 0,
    erro:          cErro.count          ?? 0,
    invalido:      cInvalido.count      ?? 0,
    descadastrado: cDescadastrado.count ?? 0,
  }

  return NextResponse.json({
    totais: {
      licitacoes:     totalLic.count     ?? 0,
      leads:          totalLeads.count   ?? 0,
      licitacoes7d:   lic7dRes.count     ?? 0,
      licitacoesHoje: licHojeRes.count   ?? 0,
    },
    porEstado,
    porFonte,
    timeline30d,
    topOrgaos,
    porValor: faixas,
    leadsSegmento,
    leadsUF,
    leadsStatus,
  })
}
