/**
 * Cron: coletar-leads
 * Horário: diário às 6h (segunda a sábado)
 *
 * Fluxo:
 *  1. Busca contratos do dia anterior no PNCP
 *  2. Extrai CNPJs fornecedores (apenas CNPJ, não CPF)
 *  3. Ignora CNPJs já presentes na tabela leads
 *  4. Enriquece via BrasilAPI (e-mail, porte, situação…)
 *  5. Filtra: apenas empresas ativas e com e-mail
 *  6. Insere novos leads com status 'pendente'
 *
 * Deduplicação garantida pelo UNIQUE(cnpj) — INSERT ON CONFLICT DO NOTHING
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

const PNCP_BASE  = 'https://pncp.gov.br/api/pncp/v1'
const BRASIL_API = 'https://brasilapi.com.br/api/cnpj/v1'

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

interface PncpContrato {
  numeroCpfCnpjFornecedor?: string
  objetoContrato?:           string
  valorInicial?:             number
  dataPublicacaoPncp?:       string
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
}

interface BrasilApiCnpj {
  cnpj:                        string
  razao_social:                string
  nome_fantasia?:              string
  situacao_cadastral:          string
  descricao_situacao_cadastral: string
  email?:                      string
  ddd_telefone_1?:             string
  municipio?:                  string
  uf?:                         string
  descricao_porte?:            string
  cnae_fiscal_descricao?:      string
}

async function buscarContratosPNCP(
  dataInicial: string, dataFinal: string, paginas = 10
): Promise<{ contratos: PncpContrato[]; debug: string[] }> {
  const todos: PncpContrato[] = []
  const debug: string[] = []
  for (let p = 1; p <= paginas; p++) {
    try {
      const url = `${PNCP_BASE}/contratos/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${p}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
      debug.push(`p${p}: HTTP ${res.status}`)
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        debug.push(`p${p} erro: ${txt.slice(0, 200)}`)
        break
      }
      const json = await res.json()
      const itens: PncpContrato[] = json.data ?? json ?? []
      debug.push(`p${p}: ${itens.length} itens, totalRegistros=${json.totalRegistros ?? '?'}`)
      if (!itens.length) break
      const comCnpj = itens.filter(c => c.numeroCpfCnpjFornecedor)
      todos.push(...comCnpj)
      debug.push(`p${p}: ${comCnpj.length} com CPF/CNPJ fornecedor`)
      if (itens.length < 50) break
    } catch (e) {
      debug.push(`p${p}: exception ${String(e)}`)
      break
    }
  }
  return { contratos: todos, debug }
}

async function enriquecerCnpj(cnpj: string): Promise<BrasilApiCnpj | null> {
  try {
    const res = await fetch(`${BRASIL_API}/${cnpj}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar se captação está ativa
  const { data: cfg } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_ativa')
    .maybeSingle()
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, novos: 0, motivo: 'sistema pausado' })
  }

  // ── Backfill progressivo ─────────────────────────────────────────────────
  // Chave 'captacao_backfill_data' guarda o próximo dia a processar (ISO 'YYYY-MM-DD').
  // Enquanto houver histórico pendente, processa 30 dias por execução.
  // Quando chegar hoje, volta ao modo contínuo (últimos 7 dias).
  const BACKFILL_INICIO = '2022-01-01'
  const JANELA_BACKFILL = 30 // dias por execução durante o backfill
  const JANELA_CONTINUA = 7  // dias no modo contínuo

  const fmt      = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const fmtIso   = (d: Date) => d.toISOString().slice(0, 10)
  const hoje     = new Date()
  const hojeIso  = fmtIso(hoje)

  // Ler ponteiro de backfill
  const { data: cfgBf } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_backfill_data')
    .maybeSingle()

  let ponteiro: string = (cfgBf?.valor as string) || BACKFILL_INICIO
  const emBackfill = ponteiro < hojeIso

  let dataInicial: string
  let dataFinal:   string
  let modoLabel:   string

  if (emBackfill) {
    // Modo backfill: janela de 30 dias a partir do ponteiro
    const inicioDate = new Date(ponteiro)
    const fimDate    = new Date(inicioDate)
    fimDate.setDate(fimDate.getDate() + JANELA_BACKFILL - 1)
    if (fimDate > hoje) fimDate.setTime(hoje.getTime())
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(fimDate)
    modoLabel   = `backfill (${ponteiro} → ${fimDate.toISOString().slice(0, 10)})`
  } else {
    // Modo contínuo: últimos 7 dias
    const inicioDate = new Date(hoje)
    inicioDate.setDate(inicioDate.getDate() - JANELA_CONTINUA)
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(hoje)
    modoLabel   = `contínuo (últimos ${JANELA_CONTINUA} dias)`
  }

  console.log(`[coletar-leads] modo=${modoLabel} período ${dataInicial} → ${dataFinal}`)

  // 1. Buscar contratos PNCP
  // 5 páginas × 50 = 250 contratos → ~50 CNPJs únicos para enriquecer
  const { contratos, debug: debugPncp } = await buscarContratosPNCP(dataInicial, dataFinal, 5)
  console.log(`[coletar-leads] PNCP debug:`, debugPncp)
  console.log(`[coletar-leads] ${contratos.length} contratos com fornecedor`)

  // 2. Desduplicar CNPJs (apenas 14 dígitos = empresa, não CPF)
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const raw  = c.numeroCpfCnpjFornecedor!.replace(/\D/g, '')
    if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
  }
  const cnpjsNovos = [...cnpjMap.keys()]
  console.log(`[coletar-leads] ${cnpjsNovos.length} CNPJs únicos (14 dígitos)`)

  if (!cnpjsNovos.length) {
    return NextResponse.json({
      ok: true, novos: 0,
      mensagem: 'Nenhum CNPJ de empresa encontrado no período',
      pncp_debug: debugPncp,
      total_contratos_pncp: contratos.length,
    })
  }

  // 3. Verificar quais já existem no banco
  const { data: existentes } = await supabase
    .from('leads')
    .select('cnpj')
    .in('cnpj', cnpjsNovos)
  const setExistentes = new Set((existentes ?? []).map((r: { cnpj: string }) => r.cnpj))
  const paraEnriquecer = cnpjsNovos.filter(c => !setExistentes.has(c))
  console.log(`[coletar-leads] ${setExistentes.size} já existem, ${paraEnriquecer.length} novos para enriquecer`)

  if (!paraEnriquecer.length) {
    return NextResponse.json({ ok: true, novos: 0, mensagem: 'Todos os CNPJs já estão na base' })
  }

  // 4. Enriquecer e inserir (em lotes de 30 para respeitar rate limit)
  const LOTE = 30
  let inseridos = 0

  for (let i = 0; i < paraEnriquecer.length; i += LOTE) {
    const lote = paraEnriquecer.slice(i, i + LOTE)
    const rows = []

    for (const cnpj of lote) {
      const dados = await enriquecerCnpj(cnpj)
      await sleep(350) // ~3 req/s

      if (!dados) continue
      if (dados.situacao_cadastral !== '02') continue // apenas ativas
      if (!dados.email?.trim()) continue              // apenas com e-mail

      const contrato = cnpjMap.get(cnpj)!
      rows.push({
        cnpj:         dados.cnpj,
        razao_social: dados.razao_social,
        nome_fantasia: dados.nome_fantasia ?? null,
        email:        dados.email.toLowerCase().trim(),
        telefone:     dados.ddd_telefone_1 ?? null,
        municipio:    dados.municipio ?? contrato.unidadeOrgao?.municipioNome ?? null,
        uf:           dados.uf ?? contrato.unidadeOrgao?.ufSigla ?? null,
        situacao:     dados.descricao_situacao_cadastral ?? null,
        porte:        dados.descricao_porte ?? null,
        cnae:         dados.cnae_fiscal_descricao ?? null,
        objeto:       (contrato.objetoContrato ?? '').slice(0, 200) || null,
        valor:        contrato.valorInicial ?? null,
        data_contrato: contrato.dataPublicacaoPncp?.slice(0, 10) ?? null,
        status:       'pendente',
        fonte:        'pncp_contrato',
      })
    }

    if (rows.length) {
      const { error } = await supabase
        .from('leads')
        .upsert(rows, { onConflict: 'cnpj', ignoreDuplicates: true })
      if (error) console.error('[coletar-leads] upsert error:', error.message)
      else inseridos += rows.length
    }
  }

  // Avançar ponteiro de backfill
  if (emBackfill) {
    const proximoDate = new Date(dataFinal.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
    proximoDate.setDate(proximoDate.getDate() + 1)
    const proximo = proximoDate.toISOString().slice(0, 10)
    await supabase.from('configuracoes').upsert(
      { chave: 'captacao_backfill_data', valor: proximo },
      { onConflict: 'chave' }
    )
    console.log(`[coletar-leads] backfill ponteiro avançado para ${proximo}`)
  }

  console.log(`[coletar-leads] ${inseridos} leads inseridos`)
  return NextResponse.json({
    ok: true,
    modo: modoLabel,
    novos: inseridos,
    total_processados: paraEnriquecer.length,
    total_contratos_pncp: contratos.length,
    total_cnpjs_unicos: cnpjsNovos.length,
    pncp_debug: debugPncp,
    backfill_proximo: emBackfill ? (() => {
      const d = new Date(dataFinal.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0, 10)
    })() : null,
  })
}
