/**
 * Cron: coletar-leads-transparencia
 * Horário: a cada 6h
 *
 * Estratégia: itera sobre TODOS os órgãos federais (SIAFI) para o período atual.
 * A API exige codigoOrgao obrigatório → não há outra forma de obter dados por data.
 *
 * Estado salvo em configuracoes:
 *   captacao_transparencia_backfill_data  → yyyy-MM-dd do início da janela atual
 *   captacao_transparencia_orgao_idx      → próximo índice no array de órgãos
 *   captacao_transparencia_orgaos_cache   → JSON array de codigoOrgao (atualizado semanalmente)
 *
 * Fluxo por execução:
 *  1. Carrega (ou recarrega) lista de órgãos SIAFI
 *  2. Pega os próximos ORGAOS_POR_RODADA órgãos
 *  3. Para cada órgão → GET /contratos?codigoOrgao=X&dataInicial=...&dataFinal=...
 *  4. Extrai CNPJs de fornecedores (apenas PJ, 14 dígitos)
 *  5. Ignora CNPJs já na base
 *  6. Enriquece via BrasilAPI (cap MAX_ENRIQUECER)
 *  7. Quando todos os órgãos do período forem processados → avança janela de data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'
import { salvarResultadoCron } from '@/lib/cron-log'

export const maxDuration = 300

const TRANSPARENCIA_BASE = 'https://api.portaldatransparencia.gov.br/api-de-dados'
const BRASIL_API         = 'https://brasilapi.com.br/api/cnpj/v1'

const BACKFILL_INICIO    = '2014-01-01'
const JANELA_DIAS        = 180   // janela de 6 meses por varredura completa de órgãos
const ORGAOS_POR_RODADA  = 50    // órgãos processados por execução (cada chamada ~1s)
const MAX_ENRIQUECER     = 20    // cap de enriquecimentos BrasilAPI por execução

// Cache dos órgãos válido por 7 dias (em ms)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)
// Portal Transparência exige dd/MM/yyyy
const fmtBr = (d: Date) => {
  const [y, m, day] = d.toISOString().slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

// ─── Segmentação por CNAE ─────────────────────────────────────────────────────
function mapearSegmento(cnae: string | null | undefined): string {
  if (!cnae) return 'outros'
  const c = cnae.toLowerCase()
  if (/constru|engenharia|obra|reform|pavimentaç/.test(c))                 return 'construção'
  if (/tecnolog|informátic|software|sistema|hardware|ti\b|dados/.test(c))  return 'tecnologia'
  if (/saúde|hospital|médic|farmac|laborat|clínic|enfermag/.test(c))       return 'saúde'
  if (/limpeza|conservaç|higienizaç|saneament|desinfeç/.test(c))           return 'limpeza'
  if (/vigilânc|segurança|monitoram|portaria|armado/.test(c))              return 'segurança'
  if (/transport|logístic|frete|mudança|veícul|frota/.test(c))             return 'transporte'
  if (/aliment|nutriç|refeição|catering|merenda|buffet/.test(c))           return 'alimentação'
  if (/consult|assessor|gestão|planejam|auditoria/.test(c))                return 'consultoria'
  if (/educaç|treinament|capacitaç|ensino|curso|escola/.test(c))           return 'educação'
  if (/manutençã|reparo|instalação|calibraç|assistência técn/.test(c))     return 'manutenção'
  return 'outros'
}

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface OrgaoSiafi { codigo: string; descricao?: string }

interface Contrato {
  fornecedor?: { cnpjFormatado?: string; nome?: string }
  objeto?:     string
  valorInicial?: number
  dataAssinatura?: string
  modalidadeCompra?: { descricao?: string }
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

// ─── Busca lista de órgãos SIAFI ──────────────────────────────────────────────
async function buscarOrgaosSiafi(apiKey: string): Promise<string[]> {
  const codigos: string[] = []
  for (let pagina = 1; pagina <= 50; pagina++) {   // até 5000 órgãos (100/página)
    try {
      // tamanhoPagina=100 garante máximo por página; sem ele a API usa default próprio (~15)
      const url = `${TRANSPARENCIA_BASE}/orgaos-siafi?pagina=${pagina}&tamanhoPagina=100`
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'chave-api-dados': apiKey },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) break
      const body = await res.text()
      let data: unknown
      try { data = JSON.parse(body) } catch { break }
      if (!Array.isArray(data)) break
      const lista = data as OrgaoSiafi[]
      if (!lista.length) break   // página vazia = fim real da lista
      for (const o of lista) {
        if (o.codigo) codigos.push(o.codigo)
      }
    } catch { break }
  }
  return codigos
}

// ─── Busca contratos de um órgão ──────────────────────────────────────────────
async function buscarContratosOrgao(
  codigoOrgao: string, dataInicio: string, dataFim: string, apiKey: string
): Promise<Contrato[]> {
  try {
    const url = `${TRANSPARENCIA_BASE}/contratos?codigoOrgao=${encodeURIComponent(codigoOrgao)}&dataInicial=${encodeURIComponent(dataInicio)}&dataFinal=${encodeURIComponent(dataFim)}&pagina=1&tamanhoPagina=100`
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'chave-api-dados': apiKey },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return []
    const body = await res.text()
    if (!body.trim().startsWith('[') && !body.trim().startsWith('{')) return []
    const data = JSON.parse(body)
    return Array.isArray(data) ? data as Contrato[] : []
  } catch { return [] }
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
      motivo: 'PORTAL_TRANSPARENCIA_API_KEY não configurada',
    })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar se captação está ativa
  const { data: cfgAtiva } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfgAtiva && (cfgAtiva.valor === false || cfgAtiva.valor === 'false')) {
    return NextResponse.json({ ok: true, novos: 0, motivo: 'sistema pausado' })
  }

  // ── 1. Carregar/atualizar cache de órgãos ────────────────────────────────
  const { data: cfgOrgaos } = await supabase
    .from('configuracoes').select('valor')
    .eq('chave', 'captacao_transparencia_orgaos_cache').maybeSingle()

  let orgaosCached: { codigos: string[]; ts: number } = { codigos: [], ts: 0 }
  try {
    if (cfgOrgaos?.valor) orgaosCached = JSON.parse(cfgOrgaos.valor as string)
  } catch { /* inicia vazio */ }

  const cacheExpirado = Date.now() - orgaosCached.ts > CACHE_TTL_MS
  const cacheInsuficiente = orgaosCached.codigos.length < 50  // sanidade: SIAFI tem >400 órgãos
  if (!orgaosCached.codigos.length || cacheExpirado || cacheInsuficiente) {
    const codigos = await buscarOrgaosSiafi(apiKey)
    if (!codigos.length) {
      return NextResponse.json({ ok: false, motivo: 'Falha ao buscar lista de órgãos SIAFI' })
    }
    orgaosCached = { codigos, ts: Date.now() }
    await supabase.from('configuracoes').upsert(
      { chave: 'captacao_transparencia_orgaos_cache', valor: JSON.stringify(orgaosCached) },
      { onConflict: 'chave' }
    )
  }

  const { codigos: todosOrgaos } = orgaosCached
  const totalOrgaos = todosOrgaos.length

  // ── 2. Carregar ponteiros de estado ──────────────────────────────────────
  const [{ data: cfgData }, { data: cfgIdx }] = await Promise.all([
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_transparencia_backfill_data').maybeSingle(),
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_transparencia_orgao_idx').maybeSingle(),
  ])

  const hoje     = new Date()
  const hojeIso  = fmtIso(hoje)
  let dataInicio: string = (cfgData?.valor as string) || BACKFILL_INICIO
  let orgaoIdx   = parseInt((cfgIdx?.valor as string) || '0', 10) || 0

  // Se a data já chegou em hoje, reinicia no começo do período contínuo (2 dias atrás)
  if (dataInicio >= hojeIso) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - 2)
    dataInicio = fmtIso(d)
    orgaoIdx   = 0
  }

  // Calcular data final da janela
  const inicioDate = new Date(dataInicio)
  const fimDate    = new Date(inicioDate)
  fimDate.setDate(fimDate.getDate() + JANELA_DIAS - 1)
  if (fimDate > hoje) fimDate.setTime(hoje.getTime())
  const dataFimIso = fmtIso(fimDate)

  const dataInicioFmt = fmtBr(inicioDate)
  const dataFimFmt    = fmtBr(fimDate)

  // Órgãos desta rodada
  const orgaosBatch = todosOrgaos.slice(orgaoIdx, orgaoIdx + ORGAOS_POR_RODADA)
  const novoIdx     = orgaoIdx + orgaosBatch.length
  const janelaConcluida = novoIdx >= totalOrgaos

  const modoLabel = `órgãos ${orgaoIdx}–${novoIdx - 1}/${totalOrgaos} | ${dataInicio} → ${dataFimIso}`
  console.log(`[coletar-leads-transparencia] ${modoLabel}`)

  // ── 3. Coletar contratos de cada órgão nesta rodada ──────────────────────
  const cnpjMap = new Map<string, Contrato>()
  const debugOrgaos: string[] = []

  for (const codigoOrgao of orgaosBatch) {
    const contratos = await buscarContratosOrgao(codigoOrgao, dataInicioFmt, dataFimFmt, apiKey)
    if (contratos.length) {
      debugOrgaos.push(`${codigoOrgao}:${contratos.length}`)
      for (const c of contratos) {
        const raw = (c.fornecedor?.cnpjFormatado ?? '').replace(/\D/g, '')
        if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
      }
    }
  }

  const cnpjsTotal = [...cnpjMap.keys()]

  // ── 4. Filtrar CNPJs já na base ───────────────────────────────────────────
  const { data: existentes } = await supabase
    .from('leads').select('cnpj').in('cnpj', cnpjsTotal.length ? cnpjsTotal : ['__noop__'])
  const setExistentes = new Set((existentes ?? []).map((r: { cnpj: string }) => r.cnpj))
  const paraEnriquecer = cnpjsTotal.filter(c => !setExistentes.has(c))

  // ── 5. Inserir TODOS os CNPJs novos imediatamente com dados do contrato ───
  // Garante que nenhum CNPJ seja perdido por falha/timeout de API posterior.
  let salvos = 0
  for (const cnpj of paraEnriquecer) {
    const contrato = cnpjMap.get(cnpj)!
    const { error } = await supabase.from('leads').upsert({
      cnpj,
      razao_social:  contrato.fornecedor?.nome ?? cnpj,
      modalidade:    contrato.modalidadeCompra?.descricao ?? null,
      objeto:        (contrato.objeto ?? '').slice(0, 200) || null,
      valor:         contrato.valorInicial ?? null,
      data_contrato: contrato.dataAssinatura?.slice(0, 10) ?? null,
      status:        'invalido',   // será atualizado após enriquecimento
      situacao:      null,         // null = aguardando check Receita Federal
      fonte:         'portal_transparencia',
    }, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) salvos++
  }

  // ── 6. Avançar ponteiros — agora que todos estão na base ─────────────────
  if (janelaConcluida) {
    const proxData = new Date(fimDate)
    proxData.setDate(proxData.getDate() + 1)
    await supabase.from('configuracoes').upsert(
      { chave: 'captacao_transparencia_backfill_data', valor: fmtIso(proxData) },
      { onConflict: 'chave' }
    )
    await supabase.from('configuracoes').upsert(
      { chave: 'captacao_transparencia_orgao_idx', valor: '0' },
      { onConflict: 'chave' }
    )
  } else {
    await supabase.from('configuracoes').upsert(
      { chave: 'captacao_transparencia_orgao_idx', valor: String(novoIdx) },
      { onConflict: 'chave' }
    )
  }

  // ── 7. Enriquecer via BrasilAPI (cap MAX_ENRIQUECER) — atualiza já inseridos
  // Se API retornar null: fica com dados parciais — enriquecer-emails fará retry.
  // Se inativa: salva situacao, mantém status='invalido'.
  let enriquecidos = 0
  for (const cnpj of paraEnriquecer.slice(0, MAX_ENRIQUECER)) {
    const dados = await enriquecerCnpj(cnpj)
    await sleep(500)
    if (!dados) continue   // parcial na base — retry pelo enriquecer-emails

    const emailRaw = dados.email?.trim()
    const cnae     = dados.cnae_fiscal_descricao ?? null
    const ativa    = dados.situacao_cadastral === '02'

    if (!ativa) {
      // Inativa — registra situacao para evitar busca de e-mail depois
      await supabase.from('leads').update({
        razao_social:  dados.razao_social,
        situacao:      dados.descricao_situacao_cadastral ?? 'INATIVA',
        cnae, porte: dados.descricao_porte ?? null,
        status: 'invalido',
      }).eq('cnpj', cnpj).is('situacao', null)
      continue
    }

    const contrato = cnpjMap.get(cnpj)!
    const { error } = await supabase.from('leads').update({
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailRaw ? emailRaw.toLowerCase() : null,
      telefone:      dados.ddd_telefone_1 ?? null,
      municipio:     dados.municipio ?? null,
      uf:            dados.uf ?? null,
      situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
      porte:         dados.descricao_porte ?? null,
      cnae, segmento: mapearSegmento(cnae),
      modalidade:    contrato.modalidadeCompra?.descricao ?? null,
      status:        emailRaw ? 'pendente' : 'invalido',
    }).eq('cnpj', cnpj)
    if (!error) enriquecidos++
  }

  const resultado = {
    ok: true,
    modo:                 modoLabel,
    salvos,
    enriquecidos,
    orgaos_com_contratos: debugOrgaos.length,
    cnpjs_novos:          paraEnriquecer.length,
    janela_concluida:     janelaConcluida,
  }
  await salvarResultadoCron(supabase, 'coletar-leads-transparencia', resultado)
  return NextResponse.json({ ...resultado, debug_orgaos: debugOrgaos.slice(0, 10) })
}
