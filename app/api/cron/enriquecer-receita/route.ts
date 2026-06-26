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
import { mapearSegmento } from '@/lib/leads/segmento'

export const maxDuration = 300

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
    .select('*', { count: 'estimated', head: true })
    .eq('status', 'pendente')
    .is('email', null)
  await supabase.from('leads')
    .update({ status: 'invalido' })
    .eq('status', 'pendente')
    .is('email', null)

  // Auto-recuperação (batched): promove a 'pendente' empresas ATIVAS, com e-mail
  // e cadastro completo que ficaram presas em 'invalido'. Drena ~5k por execução
  // (resolve os milhões recuperáveis ao longo das execuções, sem UPDATE gigante).
  let promovidos = 0
  try {
    const { data: promoData } = await supabase.rpc('promover_leads_aptos', { p_limite: 5000 })
    promovidos = (promoData as number) ?? 0
  } catch (e) {
    console.error('[enriquecer-receita] erro ao promover leads aptos:', e)
  }

  // Processa: (a) leads sem verificação de Receita (situacao=null)
  //           (b) leads com razao_social nula ou igual ao CNPJ (placeholder de coleta)
  //               coletar-leads-cnae define situacao='ATIVA' antes de ter o nome,
  //               por isso precisa de grupo separado além do filtro situacao=null
  const [{ data: semSituacao }, { data: semNome }] = await Promise.all([
    supabase.from('leads').select('id, cnpj, email')
      .is('situacao', null)
      .in('status', ['invalido', 'pendente'])
      .limit(500),
    supabase.from('leads').select('id, cnpj, email')
      .or('razao_social.is.null,razao_social.match.^[0-9]{14}$')
      .in('status', ['invalido', 'pendente'])
      .limit(50),
  ])

  // Deduplica por id — um lead pode estar nos dois grupos
  const visto = new Set<string>()
  const semReceita = [...(semSituacao ?? []), ...(semNome ?? [])].filter(l => {
    if (visto.has(l.id)) return false
    visto.add(l.id)
    return true
  }).slice(0, 550)

  if (!semReceita?.length) {
    await registrarCronLog({ job: 'enriquecer-receita', status: 'ok', mensagem: `0 verificados, ${promovidos} promovidos (fila Receita vazia)`, detalhes: { promovidos } })
    return NextResponse.json({
      ok: true,
      verificados: 0,
      promovidos,
      limpeza_sem_email: limpezaCount ?? 0,
      motivo: 'todos os leads já foram verificados na Receita Federal',
    })
  }

  let verificados = 0, ativos = 0, inativas = 0

  const CONCORRENCIA = 15
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
        const situacaoDesc = dados.descricao_situacao_cadastral ?? 'INATIVA'
        // BAIXADA e INAPTA são irreversíveis — remove do banco
        if (['BAIXADA', 'INAPTA'].includes(situacaoDesc.toUpperCase())) {
          await supabase.from('leads').delete().eq('id', lead.id)
        } else {
          await supabase.from('leads').update({
            razao_social: dados.razao_social ?? lead.cnpj,
            situacao:     situacaoDesc,
            cnae:         dados.cnae_fiscal_descricao ?? null,
            cnae_codigo:  cnaeCode,
            porte:        dados.porte ?? null,
            status:       'invalido',
          }).eq('id', lead.id)
        }
        return
      }

      ativos++
      const cnaeDesc = dados.cnae_fiscal_descricao ?? null
      await supabase.from('leads').update({
        razao_social:  dados.razao_social,
        nome_fantasia: dados.nome_fantasia ?? null,
        email:         emailFinal,
        telefone:      dados.ddd_telefone_1 ?? null,
        municipio:     dados.municipio ?? null,
        uf:            dados.uf ?? null,
        situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
        porte:         dados.porte ?? null,
        cnae:          cnaeDesc,
        cnae_codigo:   cnaeCode,
        segmento:      mapearSegmento(cnaeDesc),
        status:        emailFinal ? 'pendente' : 'invalido',
      }).eq('id', lead.id)
    }))
    await sleep(200)
  }

  const resultado = { ok: true, verificados, ativos, inativas, promovidos }
  await registrarCronLog({ job: 'enriquecer-receita', status: 'ok', mensagem: `${verificados} verificados, ${ativos} ativos, ${promovidos} promovidos`, detalhes: resultado })
  await salvarResultadoCron(supabase, 'enriquecer-receita', resultado)
  return NextResponse.json(resultado)
}
