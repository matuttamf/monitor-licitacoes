import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

// Limites de cada serviço
export const LIMITES = {
  google_cse:  { limite: 100,  periodo: 'dia',  label: 'Google CSE',       unidade: 'queries/dia' },
  resend:      { limite: 3000, periodo: 'mes',  label: 'Resend (e-mails)',  unidade: 'e-mails/mês' },
  gemini:      { limite: 1500, periodo: 'mes',  label: 'Gemini',            unidade: 'calls/mês'   },
  enrichment:  { limite: 2000, periodo: 'dia',  label: 'minhareceita.org',  unidade: 'calls/dia'   },
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hoje = new Date().toISOString().slice(0, 10)
  const mes  = new Date().toISOString().slice(0, 7)

  // ── 1. Uso de APIs ────────────────────────────────────────────────────────
  const { data: usoRows } = await admin
    .from('uso_apis')
    .select('servico, periodo, contador, atualizado_em')
    .in('periodo', [hoje, mes])

  const usoMap: Record<string, number> = {}
  for (const row of usoRows ?? []) {
    usoMap[`${row.servico}__${row.periodo}`] = row.contador
  }

  const uso = {
    google_cse:  usoMap[`google_cse__${hoje}`]  ?? 0,
    resend:      usoMap[`resend__${mes}`]        ?? 0,
    gemini:      usoMap[`gemini__${mes}`]        ?? 0,
    enrichment:  usoMap[`enrichment__${hoje}`]   ?? 0,
  }

  // ── 2. Contagens das tabelas principais ───────────────────────────────────
  const [
    { count: totalLeads },
    { count: leadsEmail },
    { count: leadsPendente },
    { count: totalLicitacoes },
    { count: totalAlertas },
    { count: alertasEnviados },
    { count: totalUsuarios },
    { count: usuariosAtivos },
  ] = await Promise.all([
    admin.from('leads').select('*', { count: 'exact', head: true }),
    admin.from('leads').select('*', { count: 'exact', head: true }).not('email', 'is', null),
    admin.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
    admin.from('licitacoes').select('*', { count: 'exact', head: true }),
    admin.from('alertas').select('*', { count: 'exact', head: true }),
    admin.from('alertas').select('*', { count: 'exact', head: true }).not('enviado_em', 'is', null),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    // "com acesso" = trial ativo + assinantes pagos + admin (exclui expired)
    admin.from('profiles').select('*', { count: 'exact', head: true }).neq('status', 'expired'),
  ])

  const tabelas = {
    leads:       { total: totalLeads ?? 0, com_email: leadsEmail ?? 0, pendente: leadsPendente ?? 0 },
    licitacoes:  { total: totalLicitacoes ?? 0 },
    alertas:     { total: totalAlertas ?? 0, enviados: alertasEnviados ?? 0 },
    usuarios:    { total: totalUsuarios ?? 0, ativos: usuariosAtivos ?? 0 },
  }

  // ── 3. Últimas execuções dos crons (últimas 24h) ──────────────────────────
  const { data: cronLogs } = await admin
    .from('cron_logs')
    .select('job, status, mensagem, detalhes, criado_em')
    .order('criado_em', { ascending: false })
    .limit(50)

  // Última execução de cada job
  const ultimosJobs: Record<string, { status: string; mensagem: string; criado_em: string; detalhes?: unknown }> = {}
  for (const log of cronLogs ?? []) {
    if (!ultimosJobs[log.job]) {
      ultimosJobs[log.job] = {
        status:    log.status,
        mensagem:  log.mensagem,
        criado_em: log.criado_em,
        detalhes:  log.detalhes,
      }
    }
  }

  // ── 4. Ponteiros de backfill ──────────────────────────────────────────────
  const { data: cfgRows } = await admin
    .from('configuracoes')
    .select('chave, valor')
    .in('chave', ['captacao_backfill_data', 'captacao_transparencia_backfill_data', 'captacao_ativa'])

  const cfg: Record<string, string> = {}
  for (const row of cfgRows ?? []) {
    cfg[row.chave] = String(row.valor).replace(/"/g, '')
  }

  const hoje_ = new Date()
  const backfill = {
    pncp: {
      proximo:  cfg['captacao_backfill_data'] ?? '2021-01-01',
      inicio:   '2021-01-01',
      fim:      hoje_.toISOString().slice(0, 10),
      pct: calcPct(cfg['captacao_backfill_data'] ?? '2021-01-01', '2021-01-01', hoje_),
    },
    transparencia: {
      proximo:  cfg['captacao_transparencia_backfill_data'] ?? '2014-01-01',
      inicio:   '2014-01-01',
      fim:      hoje_.toISOString().slice(0, 10),
      pct: calcPct(cfg['captacao_transparencia_backfill_data'] ?? '2014-01-01', '2014-01-01', hoje_),
    },
  }

  const captacaoAtiva = cfg['captacao_ativa'] !== 'false'

  return NextResponse.json({ ok: true, uso, limites: LIMITES, tabelas, ultimosJobs, backfill, captacaoAtiva, hoje, mes })
}

function calcPct(ponteiro: string, inicio: string, hoje: Date): number {
  const ini = new Date(inicio).getTime()
  const hj  = hoje.getTime()
  const pt  = new Date(ponteiro).getTime()
  if (hj <= ini) return 100
  return Math.min(100, Math.round(((pt - ini) / (hj - ini)) * 100))
}
