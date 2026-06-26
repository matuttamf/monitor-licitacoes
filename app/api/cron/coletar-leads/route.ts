/**
 * Cron: coletar-leads  (coleta pura — sem enriquecimento)
 * Horário: a cada 10 minutos
 *
 * Responsabilidade ÚNICA: buscar contratos no PNCP e inserir CNPJs novos
 * no banco com status='invalido'. O enriquecimento Receita Federal fica em
 * coletar-leads/enriquecer (cron separado) para não acoplar I/O de APIs distintas.
 *
 * Fluxo por execução:
 *  1. Determinar janela (backfill 7 dias ou contínuo 2 dias)
 *  2. Buscar contratos PNCP → até 1.300 por janela
 *  3. Desduplicar CNPJs (apenas PJ)
 *  4. Verificar quais CNPJs JÁ existem no banco (1 única query)
 *  5. Inserir em lote os novos (upsert ignoreDuplicates)
 *  6. Avançar ponteiro backfill
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron, registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 120   // coleta pura é bem mais rápida

const PNCP_BASE       = 'https://pncp.gov.br/api/consulta/v1'
const BACKFILL_INICIO = '2021-01-01'
const JANELA_BACKFILL = 7    // dias por execução no modo backfill
const JANELA_CONTINUA = 6    // 6 dias anteriores + hoje no modo contínuo
const MAX_FALHAS_SKIP = 5    // timeouts consecutivos antes de pular o período

const fmt    = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)

interface PncpContrato {
  niFornecedor?:              string
  nomeRazaoSocialFornecedor?: string
  tipoPessoa?:                string
  objetoContrato?:            string
  valorInicial?:              number
  dataPublicacaoPncp?:        string
  tipoContrato?:              { nome?: string; descricao?: string }
  modalidadeContratacao?:     { nome?: string; descricao?: string }
  unidadeOrgao?:              { ufSigla?: string; municipioNome?: string }
}

async function buscarContratosPNCP(
  dataInicial: string, dataFinal: string, paginas = 26
): Promise<{ contratos: PncpContrato[]; debug: string[]; hadError: boolean }> {
  const todos: PncpContrato[] = []
  const debug: string[] = []
  let hadError = false

  for (let p = 1; p <= paginas; p++) {
    try {
      const url = `${PNCP_BASE}/contratos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${p}&tamanhoPagina=50`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(45000),
      })
      debug.push(`p${p}: HTTP ${res.status}`)
      if (res.status === 204) break
      if (!res.ok) {
        hadError = true
        debug.push(`erro: ${(await res.text().catch(() => '')).slice(0, 200)}`)
        break
      }
      const json = await res.json()
      const itens: PncpContrato[] = json.data ?? json ?? []
      debug.push(`p${p}: ${itens.length} itens`)
      if (!itens.length) break
      todos.push(...itens.filter(c => c.niFornecedor && c.tipoPessoa !== 'PF'))
      if (itens.length < 50) break
    } catch (e) {
      hadError = true
      debug.push(`p${p}: exception ${String(e).slice(0, 100)}`)
      break
    }
  }

  return { contratos: todos, debug, hadError }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function avancarPonteiro(supabase: any, dataFinalFmt: string) {
  const d = new Date(dataFinalFmt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
  d.setDate(d.getDate() + 1)
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_backfill_data', valor: d.toISOString().slice(0, 10) },
    { onConflict: 'chave' }
  )
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (await sistemaPausado()) return NextResponse.json({ ok: false, motivo: 'sistema pausado' }, { status: 503 })

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar captação ativa
  const { data: cfgAtiva } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfgAtiva?.valor === false || cfgAtiva?.valor === 'false') {
    return NextResponse.json({ ok: true, novos: 0, motivo: 'captacao_ativa=false' })
  }

  // ── Determinar janela ──────────────────────────────────────────────────────
  const hoje    = new Date()
  const hojeIso = fmtIso(hoje)

  const [{ data: cfgBf }, { data: cfgFalhas }] = await Promise.all([
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_backfill_data').maybeSingle(),
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_pncp_falhas_consecutivas').maybeSingle(),
  ])

  const ponteiro  = (cfgBf?.valor as string) || BACKFILL_INICIO
  const emBackfill = ponteiro < hojeIso
  let dataInicial: string, dataFinal: string, modoLabel: string

  if (emBackfill) {
    const ini = new Date(ponteiro)
    const fim = new Date(ini)
    fim.setDate(fim.getDate() + JANELA_BACKFILL - 1)
    if (fim > hoje) fim.setTime(hoje.getTime())
    dataInicial = fmt(ini)
    dataFinal   = fmt(fim)
    modoLabel   = `backfill (${ponteiro} → ${fmtIso(fim)})`
  } else {
    const ini = new Date(hoje)
    ini.setDate(ini.getDate() - JANELA_CONTINUA)
    dataInicial = fmt(ini)
    dataFinal   = fmt(hoje)
    modoLabel   = 'contínuo'
  }

  // ── 1. Buscar contratos PNCP ───────────────────────────────────────────────
  const { contratos, debug: debugPncp, hadError } = await buscarContratosPNCP(dataInicial, dataFinal)

  if (!contratos.length) {
    const falhasAtual = parseInt((cfgFalhas?.valor as string) || '0', 10)

    if (emBackfill && hadError) {
      const falhasNovo = falhasAtual + 1
      if (falhasNovo >= MAX_FALHAS_SKIP) {
        await avancarPonteiro(supabase, dataFinal)
        await supabase.from('configuracoes').upsert(
          { chave: 'captacao_pncp_falhas_consecutivas', valor: '0' }, { onConflict: 'chave' }
        )
        return NextResponse.json({ ok: true, novos: 0, modo: modoLabel, mensagem: `Período pulado após ${MAX_FALHAS_SKIP} falhas`, pncp_debug: debugPncp })
      }
      await supabase.from('configuracoes').upsert(
        { chave: 'captacao_pncp_falhas_consecutivas', valor: String(falhasNovo) }, { onConflict: 'chave' }
      )
      return NextResponse.json({ ok: false, novos: 0, modo: modoLabel, mensagem: `Erro PNCP — tentativa ${falhasNovo}/${MAX_FALHAS_SKIP}`, pncp_debug: debugPncp })
    }

    if (emBackfill && !hadError) await avancarPonteiro(supabase, dataFinal)
    await supabase.from('configuracoes').upsert(
      { chave: 'captacao_pncp_falhas_consecutivas', valor: '0' }, { onConflict: 'chave' }
    )
    return NextResponse.json({ ok: true, novos: 0, modo: modoLabel, mensagem: 'Nenhum contrato no período', pncp_debug: debugPncp })
  }

  // Sucesso no PNCP — zera contador de falhas
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_pncp_falhas_consecutivas', valor: '0' }, { onConflict: 'chave' }
  )

  // ── 2. Desduplicar CNPJs (14 dígitos = empresa) ────────────────────────────
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const raw = c.niFornecedor!.replace(/\D/g, '')
    if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
  }
  const todosNovos = [...cnpjMap.keys()]

  // ── 3. Uma única query para checar quais já existem no banco ──────────────
  const { data: existentes } = await supabase
    .from('leads')
    .select('cnpj')
    .in('cnpj', todosNovos)
  const cnpjsExistentes = new Set<string>((existentes ?? []).map((r: { cnpj: string }) => r.cnpj))
  const paraInserir = todosNovos.filter(c => !cnpjsExistentes.has(c))

  // ── 4. Inserir em lote os CNPJs novos ─────────────────────────────────────
  // status='invalido' + situacao=null → enriquecer-leads processará o backlog
  let inseridos = 0
  const lote = paraInserir.map(cnpj => {
    const c = cnpjMap.get(cnpj)!
    return {
      cnpj,
      razao_social:  c.nomeRazaoSocialFornecedor ?? null,
      municipio:     c.unidadeOrgao?.municipioNome ?? null,
      uf:            c.unidadeOrgao?.ufSigla ?? null,
      modalidade:    c.modalidadeContratacao?.nome ?? c.modalidadeContratacao?.descricao ?? c.tipoContrato?.nome ?? null,
      objeto:        (c.objetoContrato ?? '').slice(0, 200) || null,
      valor:         c.valorInicial ?? null,
      data_contrato: c.dataPublicacaoPncp?.slice(0, 10) ?? null,
      status:        'invalido' as const,
      situacao:      null,
      fonte:         'pncp_contrato',
    }
  })

  // Inserir em chunks de 200 para evitar limite de payload
  for (let i = 0; i < lote.length; i += 200) {
    const chunk = lote.slice(i, i + 200)
    const { error } = await supabase.from('leads').upsert(chunk, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += chunk.length
  }

  // ── 5. Avançar ponteiro (após inserção garantida) ─────────────────────────
  if (emBackfill) await avancarPonteiro(supabase, dataFinal)

  const resultado = {
    ok: true,
    modo: modoLabel,
    contratos_pncp:  contratos.length,
    cnpjs_unicos:    cnpjMap.size,
    ja_na_base:      cnpjsExistentes.size,
    inseridos,
    aguardando_enriquecimento: inseridos,
  }

  console.log(`[coletar-leads] ${modoLabel} → ${contratos.length} contratos, ${inseridos} novos inseridos`)
  await registrarCronLog({ job: 'coletar-leads', status: 'ok', mensagem: `${inseridos} inseridos`, detalhes: resultado })
  await salvarResultadoCron(supabase, 'coletar-leads', resultado)
  return NextResponse.json(resultado)
}
