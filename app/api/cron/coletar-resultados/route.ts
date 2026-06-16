/**
 * Cron: coletar-resultados
 * Horário backfill: a cada 10 min (schedule: every 10 min até completar)
 * Horário contínuo: a cada 4h (schedule: 0 a cada 4h após backfill)
 *
 * Coleta resultados homologados (vencedores) de licitações via PNCP:
 *   1. /contratacoes/homologacao → lista contratos já com vencedor no período
 *   2. /orgaos/{cnpj}/compras/{ano}/{seq}/itens → itens do contrato
 *   3. /orgaos/{cnpj}/compras/{ano}/{seq}/itens/{num}/resultados → valor vencedor
 *
 * Ponteiro de backfill: 'resultados_backfill_data' em configuracoes
 * Janela por execução: 7 dias
 * Após backfill: busca últimos 30 dias (cobre publicações tardias)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron } from '@/lib/cron-log'

export const maxDuration = 300

const PNCP_CONSULTA = 'https://pncp.gov.br/api/consulta/v1'
const PNCP_BASE     = 'https://pncp.gov.br/api/pncp/v1'

const MAX_PROCESSOS    = 50
const TAMANHO_PAGINA   = 50    // API suporta até 500; 50 equilibra volume e latência
const JANELA_BACKFILL  = 7     // dias por execução durante backfill
const JANELA_CONTINUA  = 30    // dias para reprocessar em modo contínuo (cobre tardios)
const BACKFILL_INICIO  = '2023-01-01'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)
const fmtPncp = (s: string) => s.replace(/-/g, '')

interface Contratacao {
  orgaoEntidade?: { cnpj?: string; razaoSocial?: string }
  cnpjOrgao:      string
  anoCompra:      number
  sequencialCompra: number
  unidadeOrgao?: { ufNome?: string; municipioNome?: string }
}

interface ItemCompra {
  numeroItem:     number
  descricao?:     string
  unidadeMedida?: string
  quantidade?:    number
}

interface Resultado {
  niFornecedor?:   string
  nomeFornecedor?: string
  valorUnitario?:  number
  quantidade?:     number
  dataResultado?:  string
}

async function pncpGet(url: string, retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) })
      if (r.status === 404 || r.status === 204) return null
      if (r.status === 429) { await sleep(3000 * (i + 1)); continue }
      if (!r.ok) return null
      return r.json()
    } catch {
      if (i < retries - 1) await sleep(1500 * (i + 1))
    }
  }
  return null
}

// Usa endpoint de homologação — só retorna contratos que já têm vencedor definido
async function buscarProcessos(dataInicio: string, dataFim: string): Promise<Contratacao[]> {
  const ini = fmtPncp(dataInicio)
  const fim = fmtPncp(dataFim)
  const url = `${PNCP_CONSULTA}/contratacoes/homologacao?dataInicial=${ini}&dataFinal=${fim}&tamanhoPagina=${TAMANHO_PAGINA}&pagina=1`
  const data = await pncpGet(url) as { data?: Contratacao[] } | null
  if (!data?.data) return []
  return data.data.map(c => ({
    ...c,
    cnpjOrgao: c.orgaoEntidade?.cnpj ?? c.cnpjOrgao ?? '',
  })).filter(c => c.cnpjOrgao)
}

async function buscarItens(cnpj: string, ano: number, seq: number): Promise<ItemCompra[]> {
  const url = `${PNCP_BASE}/orgaos/${cnpj}/compras/${ano}/${seq}/itens?tamanhoPagina=50&pagina=1`
  const data = await pncpGet(url) as { data?: ItemCompra[] } | null
  return data?.data ?? []
}

async function buscarResultadosItem(cnpj: string, ano: number, seq: number, item: number): Promise<Resultado[]> {
  const url = `${PNCP_BASE}/orgaos/${cnpj}/compras/${ano}/${seq}/itens/${item}/resultados`
  const data = await pncpGet(url) as Resultado[] | { data?: Resultado[] } | null
  if (!data) return []
  return Array.isArray(data) ? data : (data as { data?: Resultado[] }).data ?? []
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })

  const pausado = await sistemaPausado()
  if (pausado) return NextResponse.json({ ok: true, msg: 'sistema pausado' })

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ler ponteiro de backfill
  const { data: cfgRow } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'resultados_backfill_data')
    .single()

  const hoje       = new Date()
  const pointerStr = cfgRow?.valor ?? BACKFILL_INICIO
  const pointer    = new Date(pointerStr)

  // Backfill: pointer ainda não alcançou hoje
  const emBackfill = pointer < hoje

  let dataInicio: string
  let dataFim: string

  if (emBackfill) {
    // Avança 7 dias a partir do ponteiro
    dataInicio = fmtIso(pointer)
    const fimJanela = new Date(pointer)
    fimJanela.setDate(fimJanela.getDate() + JANELA_BACKFILL - 1)
    dataFim = fmtIso(new Date(Math.min(fimJanela.getTime(), hoje.getTime())))
  } else {
    // Modo contínuo: reprocessa os últimos JANELA_CONTINUA dias
    const inicio = new Date(hoje)
    inicio.setDate(inicio.getDate() - JANELA_CONTINUA)
    dataInicio = fmtIso(inicio)
    dataFim    = fmtIso(hoje)
  }

  const processos = await buscarProcessos(dataInicio, dataFim)
  const selecionados = processos.slice(0, MAX_PROCESSOS)

  let inseridos = 0
  let erros     = 0

  for (const proc of selecionados) {
    const cnpj     = proc.cnpjOrgao.replace(/\D/g, '')
    const orgao    = proc.orgaoEntidade?.razaoSocial ?? null
    const estado   = proc.unidadeOrgao?.ufNome ?? null
    const municipio = proc.unidadeOrgao?.municipioNome ?? null

    const itens = await buscarItens(cnpj, proc.anoCompra, proc.sequencialCompra)
    await sleep(60)   // pausa leve entre contratos

    for (const item of itens) {
      const resultados = await buscarResultadosItem(cnpj, proc.anoCompra, proc.sequencialCompra, item.numeroItem)
      await sleep(40)  // pausa leve entre itens

      for (const res of resultados) {
        if (!res.valorUnitario || res.valorUnitario <= 0) continue
        const desc = item.descricao?.trim().toUpperCase()
        if (!desc) continue

        const row = {
          cnpj_orgao:     cnpj,
          orgao,
          ano_compra:     proc.anoCompra,
          seq_compra:     proc.sequencialCompra,
          num_item:       item.numeroItem,
          descricao_item: desc,
          unidade_medida: item.unidadeMedida ?? null,
          cnpj_vencedor:  res.niFornecedor?.replace(/\D/g, '') ?? null,
          nome_vencedor:  res.nomeFornecedor ?? null,
          valor_unitario: res.valorUnitario,
          quantidade:     res.quantidade ?? item.quantidade ?? null,
          valor_total:    res.valorUnitario * (res.quantidade ?? item.quantidade ?? 1),
          data_resultado: res.dataResultado?.slice(0, 10) ?? null,
          estado,
          municipio,
        }

        const { error } = await supabase
          .from('resultados_itens')
          .upsert(row, { onConflict: 'cnpj_orgao,ano_compra,seq_compra,num_item', ignoreDuplicates: true })

        if (error) erros++
        else inseridos++
      }
    }
  }

  // Avançar ponteiro apenas no backfill
  if (emBackfill) {
    const proximaData = new Date(dataFim)
    proximaData.setDate(proximaData.getDate() + 1)
    await supabase
      .from('configuracoes')
      .upsert({ chave: 'resultados_backfill_data', valor: fmtIso(proximaData) })
  }

  await salvarResultadoCron(supabase, 'coletar-resultados', {
    processos: selecionados.length,
    inseridos,
    erros,
    janela:  `${dataInicio} → ${dataFim}`,
    modo:    emBackfill ? 'backfill' : 'continuo',
  })

  return NextResponse.json({
    ok:        true,
    processos: selecionados.length,
    inseridos,
    erros,
    janela:    `${dataInicio}→${dataFim}`,
    modo:      emBackfill ? 'backfill' : 'continuo',
  })
}
