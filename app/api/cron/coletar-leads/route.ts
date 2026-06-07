/**
 * Cron: coletar-leads
 * Horário: a cada 10 minutos, 24/7
 *
 * Fluxo:
 *  1. Busca contratos publicados no PNCP no período
 *  2. Extrai CNPJs de fornecedores (apenas empresas — 14 dígitos)
 *  3. Ignora CNPJs já presentes na tabela leads
 *  4. Enriquece via BrasilAPI
 *  5. Filtra: apenas empresas ATIVAS (situacao_cadastral = '02') com e-mail
 *  6. Classifica em segmento via CNAE
 *  7. Insere novos leads com fonte='pncp_contrato'
 *
 * Backfill progressivo:
 *  - Chave 'captacao_backfill_data' em configuracoes guarda próximo dia
 *  - Janela de 30 dias por execução → ~4h para cobrir 2022–hoje
 *  - Após backfill: modo contínuo (ontem + hoje)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

const PNCP_BASE  = 'https://pncp.gov.br/api/pncp/v1'
const BRASIL_API = 'https://brasilapi.com.br/api/cnpj/v1'

const BACKFILL_INICIO = '2000-01-01'
const JANELA_BACKFILL = 30  // dias por execução durante o backfill
const JANELA_CONTINUA = 2   // ontem + hoje no modo contínuo (evita redundância com 10min)

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmt    = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)

// ─── Segmentação por CNAE ─────────────────────────────────────────────────────
function mapearSegmento(cnae: string | null | undefined): string {
  if (!cnae) return 'outros'
  const c = cnae.toLowerCase()
  if (/constru|engenharia|obra|reform|pavimentaç/.test(c))          return 'construção'
  if (/tecnolog|informátic|software|sistema|hardware|ti\b|dados/.test(c)) return 'tecnologia'
  if (/saúde|hospital|médic|farmac|laborat|clínic|enfermag/.test(c)) return 'saúde'
  if (/limpeza|conservaç|higienizaç|saneament|desinfeç/.test(c))     return 'limpeza'
  if (/vigilânc|segurança|monitoram|portaria|armado/.test(c))        return 'segurança'
  if (/transport|logístic|frete|mudança|veícul|frota/.test(c))       return 'transporte'
  if (/aliment|nutriç|refeição|caterinг|merenda|buffet/.test(c))     return 'alimentação'
  if (/consult|assessor|gestão|planejam|auditoria/.test(c))          return 'consultoria'
  if (/educaç|treinament|capacitaç|ensino|curso|escola/.test(c))     return 'educação'
  if (/manutençã|reparo|instalação|calibraç|assistência técn/.test(c)) return 'manutenção'
  if (/paisag|jardim|arborizaç|verde/.test(c))                       return 'jardinagem'
  if (/gráfic|impres|copiaç|editoraç/.test(c))                       return 'gráfica'
  return 'outros'
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface PncpContrato {
  numeroCpfCnpjFornecedor?: string
  objetoContrato?:           string
  valorInicial?:             number
  dataPublicacaoPncp?:       string
  tipoContrato?:             { descricao?: string }
  modalidadeContratacao?:    { descricao?: string }
  unidadeOrgao?:             { ufSigla?: string; municipioNome?: string }
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

// ─── Busca PNCP ───────────────────────────────────────────────────────────────

async function buscarContratosPNCP(
  dataInicial: string, dataFinal: string, paginas = 5
): Promise<{ contratos: PncpContrato[]; debug: string[] }> {
  const todos: PncpContrato[] = []
  const debug: string[] = []
  for (let p = 1; p <= paginas; p++) {
    try {
      const url = `${PNCP_BASE}/contratos/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${p}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
      debug.push(`p${p}: HTTP ${res.status}`)
      if (!res.ok) {
        debug.push(`p${p} erro: ${(await res.text().catch(() => '')).slice(0, 200)}`)
        break
      }
      const json = await res.json()
      const itens: PncpContrato[] = json.data ?? json ?? []
      debug.push(`p${p}: ${itens.length} itens, total=${json.totalRegistros ?? '?'}`)
      if (!itens.length) break
      todos.push(...itens.filter(c => c.numeroCpfCnpjFornecedor))
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

// ─── Handler ──────────────────────────────────────────────────────────────────

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

  // ── Determinar período ────────────────────────────────────────────────────
  const hoje    = new Date()
  const hojeIso = fmtIso(hoje)

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
    const inicioDate = new Date(ponteiro)
    const fimDate    = new Date(inicioDate)
    fimDate.setDate(fimDate.getDate() + JANELA_BACKFILL - 1)
    if (fimDate > hoje) fimDate.setTime(hoje.getTime())
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(fimDate)
    modoLabel   = `backfill (${ponteiro} → ${fmtIso(fimDate)})`
  } else {
    const inicioDate = new Date(hoje)
    inicioDate.setDate(inicioDate.getDate() - JANELA_CONTINUA)
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(hoje)
    modoLabel   = `contínuo`
  }

  // ── 1. Buscar contratos PNCP ──────────────────────────────────────────────
  const { contratos, debug: debugPncp } = await buscarContratosPNCP(dataInicial, dataFinal, 5)

  if (!contratos.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFinal)
    return NextResponse.json({
      ok: true, novos: 0, modo: modoLabel,
      mensagem: 'Nenhum contrato encontrado no período', pncp_debug: debugPncp,
    })
  }

  // ── 2. Desduplicar CNPJs (apenas 14 dígitos = empresa) ───────────────────
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const raw = c.numeroCpfCnpjFornecedor!.replace(/\D/g, '')
    if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
  }
  const cnpjsNovos = [...cnpjMap.keys()]

  // ── 3. Filtrar quais já existem no banco ──────────────────────────────────
  const { data: existentes } = await supabase
    .from('leads')
    .select('cnpj')
    .in('cnpj', cnpjsNovos)
  const setExistentes = new Set((existentes ?? []).map((r: { cnpj: string }) => r.cnpj))
  const paraEnriquecer = cnpjsNovos.filter(c => !setExistentes.has(c))

  if (!paraEnriquecer.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFinal)
    return NextResponse.json({
      ok: true, novos: 0, modo: modoLabel,
      mensagem: 'Todos os CNPJs já estão na base',
      total_contratos_pncp: contratos.length,
    })
  }

  // ── 4. Avançar ponteiro ANTES do enriquecimento ──────────────────────────
  // Garante progresso mesmo que a função estoure o timeout durante o BrasilAPI.
  if (emBackfill) await avancarPonteiro(supabase, dataFinal)

  // ── 5. Enriquecer via BrasilAPI e inserir (até 20 por execução) ───────────
  const LOTE = 20  // reduzido para caber nos 300s de maxDuration
  let inseridos = 0

  for (let i = 0; i < Math.min(paraEnriquecer.length, LOTE); i++) {
    const cnpj  = paraEnriquecer[i]
    const dados = await enriquecerCnpj(cnpj)
    await sleep(500) // ~2 req/s — BrasilAPI free tier

    if (!dados) continue
    if (dados.situacao_cadastral !== '02') continue  // apenas ATIVAS

    const contrato = cnpjMap.get(cnpj)!
    const cnae     = dados.cnae_fiscal_descricao ?? null
    const modalidade = contrato.modalidadeContratacao?.descricao
                    ?? contrato.tipoContrato?.descricao
                    ?? null
    const emailRaw = dados.email?.trim()

    const row = {
      cnpj:          dados.cnpj,
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailRaw ? emailRaw.toLowerCase() : null,
      telefone:      dados.ddd_telefone_1 ?? null,
      municipio:     dados.municipio ?? contrato.unidadeOrgao?.municipioNome ?? null,
      uf:            dados.uf ?? contrato.unidadeOrgao?.ufSigla ?? null,
      situacao:      dados.descricao_situacao_cadastral ?? null,
      porte:         dados.descricao_porte ?? null,
      cnae,
      segmento:      mapearSegmento(cnae),
      modalidade,
      objeto:        (contrato.objetoContrato ?? '').slice(0, 200) || null,
      valor:         contrato.valorInicial ?? null,
      data_contrato: contrato.dataPublicacaoPncp?.slice(0, 10) ?? null,
      // Sem e-mail → sem_email (disparo ignora; pode ser enriquecido depois)
      status:        emailRaw ? 'pendente' : 'sem_email',
      fonte:         'pncp_contrato',
    }

    const { error } = await supabase
      .from('leads')
      .upsert(row, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (error) console.error('[coletar-leads] upsert error:', error.message)
    else inseridos++
  }

  console.log(`[coletar-leads] ${modoLabel} → ${inseridos} leads inseridos`)
  return NextResponse.json({
    ok: true,
    modo: modoLabel,
    novos: inseridos,
    total_contratos_pncp: contratos.length,
    total_cnpjs_unicos: cnpjsNovos.length,
    para_enriquecer: paraEnriquecer.length,
    pncp_debug: debugPncp,
    backfill_proximo: emBackfill ? (() => {
      const d = new Date(dataFinal.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0, 10)
    })() : null,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function avancarPonteiro(supabase: any, dataFinalFmt: string) {
  const d = new Date(dataFinalFmt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
  d.setDate(d.getDate() + 1)
  const proximo = d.toISOString().slice(0, 10)
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_backfill_data', valor: proximo },
    { onConflict: 'chave' }
  )
}
