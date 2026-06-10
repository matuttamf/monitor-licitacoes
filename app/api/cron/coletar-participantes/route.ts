/**
 * Cron: coletar-participantes
 * Horário: domingo às 7h (semanal)
 *
 * Fluxo profundo — coleta TODOS os participantes (proponentes) de processos
 * licitatórios, não apenas vencedores de contratos:
 *
 *  1. Busca processos publicados no PNCP no período (/contratacoes/publicacao)
 *  2. Para cada processo → busca itens
 *  3. Para cada item → busca propostas (proponentes)
 *  4. Extrai CNPJs dos proponentes (apenas empresas, 14 dígitos)
 *  5. Ignora CNPJs já presentes na base (ignoreDuplicates)
 *  6. Enriquece via BrasilAPI → filtra ativas + com e-mail
 *  7. Insere com fonte='pncp_proposta'
 *
 * Ponteiro de backfill: 'captacao_participantes_backfill_data' em configuracoes
 * Janela por execução: 3 dias (mais lento por causa dos 3 níveis de API)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

const PNCP_CONSULTA = 'https://pncp.gov.br/api/consulta/v1'  // busca por data
const PNCP_BASE     = 'https://pncp.gov.br/api/pncp/v1'       // recursos por orgão/CNPJ
const CNPJ_WS       = 'https://publica.cnpj.ws/cnpj'           // enriquecimento (sem rate limit)

// Quantos processos inspecionar por execução (cada um gera ~N chamadas de API)
const MAX_PROCESSOS = 8
// Janela de datas por execução durante o backfill
const JANELA_BACKFILL = 3
// Janela no modo contínuo (últimos N dias)
const JANELA_CONTINUA = 7
// Data de início do backfill
const BACKFILL_INICIO = '2000-01-01'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmt    = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)

interface Contratacao {
  // cnpjOrgao NÃO é campo direto — está em orgaoEntidade.cnpj
  orgaoEntidade?: { cnpj?: string }
  cnpjOrgao:      string  // normalizado em buscarProcessos
  anoCompra:      number
  sequencialCompra: number
}

interface ItemCompra {
  numeroItem: number
}

interface Proposta {
  niFornecedor?: string
  nomeFornecedor?: string
}

interface CnpjWs {
  cnpj:              string
  razao_social:      string
  nome_fantasia?:    string
  situacao_cadastral: { codigo: number; descricao: string }
  porte?:            { descricao?: string }
  atividade_principal?: Array<{ codigo: string; descricao: string }>
  email?:            string
  telefone_1?:       string
  municipio?:        string
  uf?:               string
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.json() as T
  } catch { return null }
}

// codigoModalidadeContratacao é obrigatório — iteramos pelas 4 principais
// 6=Pregão Eletrônico, 8=Dispensa, 9=Inexigibilidade, 4=Concorrência Eletrônica
const MODALIDADES = [6, 8, 9, 4]

// Converte YYYYMMDD → YYYY-MM-DD (formato exigido por /contratacoes/publicacao)
function toIso(d: string): string {
  return d.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
}

async function buscarProcessos(dataInicial: string, dataFinal: string): Promise<Contratacao[]> {
  const vistos = new Set<string>()
  const resultado: Contratacao[] = []
  const di = toIso(dataInicial)
  const df = toIso(dataFinal)

  for (const mod of MODALIDADES) {
    const url = `${PNCP_CONSULTA}/contratacoes/publicacao?dataInicial=${di}&dataFinal=${df}&codigoModalidadeContratacao=${mod}&pagina=1&tamanhoPagina=${MAX_PROCESSOS}`
    const json = await fetchJson<{ data?: Contratacao[] }>(url)
    const itens = json?.data ?? []

    for (const c of itens) {
      // cnpjOrgao fica em orgaoEntidade.cnpj conforme spec da API
      const cnpj = c.orgaoEntidade?.cnpj ?? c.cnpjOrgao
      if (!cnpj || !c.anoCompra || !c.sequencialCompra) continue
      const chave = `${cnpj}-${c.anoCompra}-${c.sequencialCompra}`
      if (vistos.has(chave)) continue
      vistos.add(chave)
      // normaliza cnpjOrgao para uso nas sub-chamadas
      resultado.push({ ...c, cnpjOrgao: cnpj })
    }
  }

  return resultado
}

async function buscarItens(cnpjOrgao: string, ano: number, seq: number): Promise<ItemCompra[]> {
  const url = `${PNCP_BASE}/orgaos/${cnpjOrgao}/compras/${ano}/${seq}/itens`
  const json = await fetchJson<{ data?: ItemCompra[] } | ItemCompra[]>(url)
  if (!json) return []
  if (Array.isArray(json)) return json
  return json.data ?? []
}

async function buscarPropostas(cnpjOrgao: string, ano: number, seq: number, item: number): Promise<Proposta[]> {
  const url = `${PNCP_BASE}/orgaos/${cnpjOrgao}/compras/${ano}/${seq}/itens/${item}/propostas`
  const json = await fetchJson<{ data?: Proposta[] } | Proposta[]>(url)
  if (!json) return []
  if (Array.isArray(json)) return json
  return json.data ?? []
}

async function enriquecerCnpj(cnpj: string): Promise<CnpjWs | null> {
  try {
    const res = await fetch(`${CNPJ_WS}/${cnpj}`, {
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
    .eq('chave', 'captacao_participantes_backfill_data')
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
    // /contratacoes/publicacao usa YYYYMMDD (sem traços), igual a /contratos
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(fimDate)
    modoLabel   = `backfill (${ponteiro} → ${fmtIso(fimDate)})`
  } else {
    const inicioDate = new Date(hoje)
    inicioDate.setDate(inicioDate.getDate() - JANELA_CONTINUA)
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(hoje)
    modoLabel   = `contínuo (últimos ${JANELA_CONTINUA} dias)`
  }

  console.log(`[coletar-participantes] modo=${modoLabel}`)

  // 1. Buscar processos licitatórios do período
  const processos = await buscarProcessos(dataInicial, dataFinal)
  console.log(`[coletar-participantes] ${processos.length} processos encontrados`)

  if (!processos.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFinal)
    return NextResponse.json({ ok: true, novos: 0, modo: modoLabel, processos: 0 })
  }

  // 2. Para cada processo → itens → propostas → CNPJs
  const cnpjSet = new Set<string>()

  for (const proc of processos) {
    await sleep(200)
    const itens = await buscarItens(proc.cnpjOrgao, proc.anoCompra, proc.sequencialCompra)

    // Processa até 3 itens por processo para controlar o tempo
    const itensSample = itens.slice(0, 3)
    for (const item of itensSample) {
      await sleep(200)
      const propostas = await buscarPropostas(proc.cnpjOrgao, proc.anoCompra, proc.sequencialCompra, item.numeroItem)
      for (const p of propostas) {
        const raw = (p.niFornecedor ?? '').replace(/\D/g, '')
        if (raw.length === 14) cnpjSet.add(raw)
      }
    }
  }

  console.log(`[coletar-participantes] ${cnpjSet.size} CNPJs de proponentes coletados`)

  if (!cnpjSet.size) {
    if (emBackfill) await avancarPonteiro(supabase, dataFinal)
    return NextResponse.json({ ok: true, novos: 0, modo: modoLabel, processos: processos.length })
  }

  // 3. Verificar quais já existem
  const cnpjsNovos = [...cnpjSet]
  const { data: existentes } = await supabase
    .from('leads')
    .select('cnpj')
    .in('cnpj', cnpjsNovos)
  const setExistentes = new Set((existentes ?? []).map((r: { cnpj: string }) => r.cnpj))
  const paraEnriquecer = cnpjsNovos.filter(c => !setExistentes.has(c))
  console.log(`[coletar-participantes] ${setExistentes.size} já na base, ${paraEnriquecer.length} novos`)

  if (!paraEnriquecer.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFinal)
    return NextResponse.json({ ok: true, novos: 0, motivo: 'todos já na base', modo: modoLabel })
  }

  // 4. Avançar ponteiro ANTES do enriquecimento (evita reprocessar se timeout)
  if (emBackfill) await avancarPonteiro(supabase, dataFinal)

  // 5. Enriquecer e inserir (cap 20 para caber nos 300s)
  let inseridos = 0
  for (const cnpj of paraEnriquecer.slice(0, 20)) {
    const dados = await enriquecerCnpj(cnpj)
    await sleep(300) // cnpj.ws sem rate limit agressivo
    if (!dados) continue
    if ((dados.situacao_cadastral?.codigo ?? dados.situacao_cadastral) !== 2) continue  // apenas ATIVAS

    const emailRaw = dados.email?.trim()
    const cnae = dados.atividade_principal?.[0]?.descricao ?? null
    const { error } = await supabase.from('leads').upsert({
      cnpj:          dados.cnpj,
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailRaw ? emailRaw.toLowerCase() : null,
      telefone:      dados.telefone_1 ?? null,
      municipio:     dados.municipio ?? null,
      uf:            dados.uf ?? null,
      situacao:      dados.situacao_cadastral.descricao ?? null,
      porte:         dados.porte?.descricao ?? null,
      cnae,
      status:        emailRaw ? 'pendente' : 'sem_email',
      fonte:         'pncp_proposta',
    }, { onConflict: 'cnpj', ignoreDuplicates: true })

    if (!error) inseridos++
  }

  console.log(`[coletar-participantes] ${inseridos} leads inseridos`)
  return NextResponse.json({
    ok: true,
    modo: modoLabel,
    novos: inseridos,
    processos: processos.length,
    proponentes_coletados: cnpjSet.size,
    cnpjs_novos: paraEnriquecer.length,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function avancarPonteiro(supabase: any, dataFinalFmt: string) {
  const d = new Date(dataFinalFmt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
  d.setDate(d.getDate() + 1)
  const proximo = d.toISOString().slice(0, 10)
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_participantes_backfill_data', valor: proximo },
    { onConflict: 'chave' }
  )
  console.log(`[coletar-participantes] ponteiro avançado para ${proximo}`)
}
