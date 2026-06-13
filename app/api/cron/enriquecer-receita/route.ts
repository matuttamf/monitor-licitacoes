/**
 * Cron: enriquecer-receita
 * Horário: a cada 5 minutos
 *
 * Processa leads com situacao=null (ainda não verificados na Receita Federal).
 * Para cada CNPJ, consulta minhareceita.org e atualiza:
 *   - Empresa inativa → status='invalido', situacao=<descrição>
 *   - Empresa ativa com e-mail → status='pendente'
 *   - Empresa ativa sem e-mail → status='invalido', aguarda enriquecer-emails
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron, registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 60

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

const MINHARECEITA = 'https://minhareceita.org'

async function enriquecerReceita(cnpj: string) {
  try {
    const res = await fetch(`${MINHARECEITA}/${cnpj}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: cfg } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, verificados: 0, motivo: 'sistema pausado' })
  }

  // Cleanup: leads marcados como pendente mas sem email — mover para invalido
  // (enriquecer-emails os pegará depois via situacao='ATIVA' + email=null)
  const { count: limpezaCount } = await supabase.from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendente')
    .is('email', null)
  await supabase.from('leads')
    .update({ status: 'invalido' })
    .eq('status', 'pendente')
    .is('email', null)

  // Processa: (a) leads sem verificação de Receita (situacao=null)
  //           (b) leads CNAE com razao_social = cnpj (placeholder da Edge Function)
  //               detectado via regex ^\d{14}$ — só dígitos, 14 chars
  const [{ data: semSituacao }, { data: placeholderCnae }] = await Promise.all([
    supabase.from('leads').select('id, cnpj, email')
      .is('situacao', null)
      .in('status', ['invalido', 'pendente'])
      .limit(100),
    supabase.from('leads').select('id, cnpj, email')
      .eq('origem', 'cnae')
      .filter('razao_social', 'match', '^[0-9]{14}$')
      .in('status', ['invalido', 'pendente'])
      .limit(20),
  ])

  // Deduplica por id — um lead pode estar nos dois grupos
  const visto = new Set<string>()
  const semReceita = [...(semSituacao ?? []), ...(placeholderCnae ?? [])].filter(l => {
    if (visto.has(l.id)) return false
    visto.add(l.id)
    return true
  }).slice(0, 120)

  if (!semReceita?.length) {
    return NextResponse.json({
      ok: true,
      verificados: 0,
      limpeza_sem_email: limpezaCount ?? 0,
      motivo: 'todos os leads já foram verificados na Receita Federal',
    })
  }

  let verificados = 0, ativos = 0, inativas = 0

  const CONCORRENCIA = 5
  const lotes = []
  for (let i = 0; i < semReceita.length; i += CONCORRENCIA) {
    lotes.push(semReceita.slice(i, i + CONCORRENCIA))
  }

  for (const lote of lotes) {
    await Promise.all(lote.map(async lead => {
      const dados = await enriquecerReceita(lead.cnpj)
      if (!dados) return

      verificados++
      const emailDaReceita = dados.email?.trim()?.toLowerCase() || null
      // Preserva email já existente (ex: capturado do CSV da RF pelo coletar-leads-cnae)
      const emailFinal = emailDaReceita ?? (lead as { email?: string | null }).email ?? null
      const ativa = dados.situacao_cadastral === 2

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cnaeCode = String((dados as any).cnae_fiscal ?? '').replace(/\D/g, '') || null

      if (!ativa) {
        inativas++
        await supabase.from('leads').update({
          razao_social: dados.razao_social ?? lead.cnpj,
          situacao:     dados.descricao_situacao_cadastral ?? 'INATIVA',
          cnae:         dados.cnae_fiscal_descricao ?? null,
          cnae_codigo:  cnaeCode,
          porte:        dados.porte ?? null,
          status:       'invalido',
        }).eq('id', lead.id)
        return
      }

      ativos++
      await supabase.from('leads').update({
        razao_social:  dados.razao_social,
        nome_fantasia: dados.nome_fantasia ?? null,
        email:         emailFinal,
        telefone:      dados.ddd_telefone_1 ?? null,
        municipio:     dados.municipio ?? null,
        uf:            dados.uf ?? null,
        situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
        porte:         dados.porte ?? null,
        cnae:          dados.cnae_fiscal_descricao ?? null,
        cnae_codigo:   cnaeCode,
        status:        emailFinal ? 'pendente' : 'invalido',
      }).eq('id', lead.id)
    }))
    await sleep(200)
  }

  const resultado = { ok: true, verificados, ativos, inativas }
  await registrarCronLog({ job: 'enriquecer-receita', status: 'ok', mensagem: `${verificados} verificados, ${ativos} ativos`, detalhes: resultado })
  await salvarResultadoCron(supabase, 'enriquecer-receita', resultado)
  return NextResponse.json(resultado)
}
