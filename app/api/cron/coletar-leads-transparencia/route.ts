/**
 * Cron: coletar-leads-transparencia
 * Horário: todo dia às 4h UTC (1h BRT)
 *
 * Complementa o PNCP coletando fornecedores do Portal da Transparência
 * (contratos federais — inclui empresas que nunca apareceram no PNCP).
 *
 * Requer: PORTAL_TRANSPARENCIA_API_KEY no ambiente
 * (cadastro grátis em portaldatransparencia.gov.br/api-de-dados/cadastrar-email)
 *
 * Fluxo:
 *  1. Busca contratos do período no Portal da Transparência
 *  2. Extrai CNPJs de fornecedores (apenas empresas — 14 dígitos)
 *  3. Ignora CNPJs já presentes na base
 *  4. Enriquece via BrasilAPI → filtra ativas + com e-mail
 *  5. Insere com fonte='portal_transparencia'
 *
 * Ponteiro de backfill: 'captacao_transparencia_backfill_data'
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

const TRANSPARENCIA_BASE = 'https://api.portaldatransparencia.gov.br/api-de-dados'
const BRASIL_API         = 'https://brasilapi.com.br/api/cnpj/v1'

// Portal Transparência tem dados a partir de 2014 (antes disso retorna 0)
const BACKFILL_INICIO  = '2014-01-01'
const JANELA_BACKFILL  = 30   // dias por execução durante backfill
const JANELA_CONTINUA  = 2    // dias no modo contínuo
const MAX_PAGINAS      = 3    // 3 × 500 = 1.500 contratos/execução
const MAX_ENRIQUECER   = 30   // cap de enriquecimentos por execução

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)
// Portal Transparência exige dd/MM/yyyy
const fmtBr  = (d: Date) => {
  const [y, m, day] = d.toISOString().slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

// ─── Segmentação por CNAE (mesmo mapeamento de coletar-leads) ─────────────────
function mapearSegmento(cnae: string | null | undefined): string {
  if (!cnae) return 'outros'
  const c = cnae.toLowerCase()
  if (/constru|engenharia|obra|reform|pavimentaç/.test(c))           return 'construção'
  if (/tecnolog|informátic|software|sistema|hardware|ti\b|dados/.test(c)) return 'tecnologia'
  if (/saúde|hospital|médic|farmac|laborat|clínic|enfermag/.test(c))  return 'saúde'
  if (/limpeza|conservaç|higienizaç|saneament|desinfeç/.test(c))      return 'limpeza'
  if (/vigilânc|segurança|monitoram|portaria|armado/.test(c))         return 'segurança'
  if (/transport|logístic|frete|mudança|veícul|frota/.test(c))        return 'transporte'
  if (/aliment|nutriç|refeição|catering|merenda|buffet/.test(c))      return 'alimentação'
  if (/consult|assessor|gestão|planejam|auditoria/.test(c))           return 'consultoria'
  if (/educaç|treinament|capacitaç|ensino|curso|escola/.test(c))      return 'educação'
  if (/manutençã|reparo|instalação|calibraç|assistência técn/.test(c)) return 'manutenção'
  if (/paisag|jardim|arborizaç|verde/.test(c))                        return 'jardinagem'
  if (/gráfic|impres|copiaç|editoraç/.test(c))                        return 'gráfica'
  return 'outros'
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Contrato {
  id?:                   string
  objeto?:               string
  valorInicial?:         number
  dataAssinatura?:       string
  fornecedor?: {
    cnpjFormatado?:      string
    nome?:               string
  }
  modalidadeCompra?: { descricao?: string }
  unidadeGestora?: {
    uf?:                 string
    municipio?:          string
    descricaoOrgao?:     string
  }
}

interface BrasilApiCnpj {
  cnpj:                         string
  razao_social:                 string
  nome_fantasia?:               string
  situacao_cadastral:           string
  descricao_situacao_cadastral: string
  email?:                       string
  ddd_telefone_1?:              string
  municipio?:                   string
  uf?:                          string
  descricao_porte?:             string
  cnae_fiscal_descricao?:       string
}

// ─── Busca contratos ──────────────────────────────────────────────────────────

async function buscarContratos(
  dataInicio: string, dataFim: string, apiKey: string
): Promise<Contrato[]> {
  const todos: Contrato[] = []
  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    try {
      const url = `${TRANSPARENCIA_BASE}/contratos?dataInicio=${dataInicio}&dataFim=${dataFim}&pagina=${pagina}&tamanhoPagina=500`
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'chave-api-dados': apiKey },
        signal: AbortSignal.timeout(20000),
      })
      if (!res.ok) {
        console.warn(`[coletar-leads-transparencia] p${pagina}: HTTP ${res.status}`)
        break
      }
      const data: Contrato[] = await res.json()
      if (!Array.isArray(data) || !data.length) break
      todos.push(...data)
      if (data.length < 500) break
    } catch (e) {
      console.warn(`[coletar-leads-transparencia] erro p${pagina}:`, String(e))
      break
    }
  }
  return todos
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

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const apiKey = process.env.PORTAL_TRANSPARENCIA_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      motivo: 'PORTAL_TRANSPARENCIA_API_KEY não configurada. Cadastre em portaldatransparencia.gov.br/api-de-dados/cadastrar-email',
    })
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

  // ── Backfill progressivo ──────────────────────────────────────────────────
  const hoje    = new Date()
  const hojeIso = fmtIso(hoje)

  const { data: cfgBf } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_transparencia_backfill_data')
    .maybeSingle()

  let ponteiro: string = (cfgBf?.valor as string) || BACKFILL_INICIO
  const emBackfill = ponteiro < hojeIso

  let dataInicio: string
  let dataFim:    string
  let modoLabel:  string

  if (emBackfill) {
    const inicioDate = new Date(ponteiro)
    const fimDate    = new Date(inicioDate)
    fimDate.setDate(fimDate.getDate() + JANELA_BACKFILL - 1)
    if (fimDate > hoje) fimDate.setTime(hoje.getTime())
    dataInicio = fmtBr(inicioDate)
    dataFim    = fmtBr(fimDate)
    modoLabel  = `backfill (${ponteiro} → ${fmtIso(fimDate)})`
  } else {
    const inicioDate = new Date(hoje)
    inicioDate.setDate(inicioDate.getDate() - JANELA_CONTINUA)
    dataInicio = fmtBr(inicioDate)
    dataFim    = fmtBr(hoje)
    modoLabel  = 'contínuo'
  }

  console.log(`[coletar-leads-transparencia] modo=${modoLabel}`)

  // ── 1. Buscar contratos ───────────────────────────────────────────────────
  const contratos = await buscarContratos(dataInicio, dataFim, apiKey)
  console.log(`[coletar-leads-transparencia] ${contratos.length} contratos`)

  if (!contratos.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFim)
    return NextResponse.json({ ok: true, novos: 0, modo: modoLabel, contratos: 0 })
  }

  // ── 2. Extrair CNPJs únicos de fornecedores ───────────────────────────────
  const cnpjMap = new Map<string, Contrato>()
  for (const c of contratos) {
    const raw = (c.fornecedor?.cnpjFormatado ?? '').replace(/\D/g, '')
    if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
  }
  const cnpjsTotal = [...cnpjMap.keys()]

  // ── 3. Filtrar quais já existem ───────────────────────────────────────────
  const { data: existentes } = await supabase
    .from('leads')
    .select('cnpj')
    .in('cnpj', cnpjsTotal)
  const setExistentes = new Set((existentes ?? []).map((r: { cnpj: string }) => r.cnpj))
  const paraEnriquecer = cnpjsTotal.filter(c => !setExistentes.has(c))

  console.log(`[coletar-leads-transparencia] ${setExistentes.size} existentes, ${paraEnriquecer.length} novos`)

  if (!paraEnriquecer.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFim)
    return NextResponse.json({ ok: true, novos: 0, motivo: 'todos já na base', modo: modoLabel })
  }

  // ── 4. Avançar ponteiro ANTES do enriquecimento (crash-safe) ────────────
  if (emBackfill) await avancarPonteiro(supabase, dataFim)

  // ── 5. Enriquecer e inserir ───────────────────────────────────────────────
  let inseridos = 0

  for (const cnpj of paraEnriquecer.slice(0, MAX_ENRIQUECER)) {
    const dados = await enriquecerCnpj(cnpj)
    await sleep(500) // ~2 req/s — BrasilAPI free tier

    if (!dados) continue
    if (dados.situacao_cadastral !== '02') continue // apenas ATIVAS

    const contrato = cnpjMap.get(cnpj)!
    const cnae     = dados.cnae_fiscal_descricao ?? null
    const emailRaw = dados.email?.trim()

    const { error } = await supabase.from('leads').upsert({
      cnpj:          dados.cnpj,
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailRaw ? emailRaw.toLowerCase() : null,
      telefone:      dados.ddd_telefone_1 ?? null,
      municipio:     dados.municipio ?? null,
      uf:            dados.uf ?? null,
      situacao:      dados.descricao_situacao_cadastral ?? null,
      porte:         dados.descricao_porte ?? null,
      cnae,
      segmento:      mapearSegmento(cnae),
      modalidade:    contrato.modalidadeCompra?.descricao ?? null,
      objeto:        (contrato.objeto ?? '').slice(0, 200) || null,
      valor:         contrato.valorInicial ?? null,
      data_contrato: contrato.dataAssinatura?.slice(0, 10) ?? null,
      status:        emailRaw ? 'pendente' : 'sem_email',
      fonte:         'portal_transparencia',
    }, { onConflict: 'cnpj', ignoreDuplicates: true })

    if (error) console.error('[coletar-leads-transparencia] upsert error:', error.message)
    else inseridos++
  }

  console.log(`[coletar-leads-transparencia] ${inseridos} leads inseridos`)
  return NextResponse.json({
    ok: true,
    modo:            modoLabel,
    novos:           inseridos,
    contratos:       contratos.length,
    cnpjs_unicos:    cnpjsTotal.length,
    para_enriquecer: paraEnriquecer.length,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function avancarPonteiro(supabase: any, dataFim: string) {
  const d = new Date(dataFim)
  d.setDate(d.getDate() + 1)
  const proximo = fmtIso(d)
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_transparencia_backfill_data', valor: proximo },
    { onConflict: 'chave' }
  )
  console.log(`[coletar-leads-transparencia] ponteiro avançado para ${proximo}`)
}
