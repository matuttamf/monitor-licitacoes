/**
 * Cron: coletar-resultados-transparencia
 * Horário backfill: a cada 10 min (em paralelo com PNCP)
 * Horário contínuo: 0 a cada 4h
 *
 * Coleta contratos do Portal da Transparência Federal:
 *   GET api.portaldatransparencia.gov.br/api-de-dados/contratos
 *
 * Requer: TRANSPARENCIA_API_KEY (registro gratuito em portaldatransparencia.gov.br/api)
 *
 * Diferença do PNCP: retorna valor total do contrato, não por item.
 * Armazenamos com num_item=1 e id_externo=numero_contrato para deduplicar.
 *
 * Ponteiro: 'transparencia_backfill_data' em configuracoes
 * Janela: 14 dias por execução
 * Início: 2020-01-01 (Transparência tem dados anteriores ao PNCP)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron } from '@/lib/cron-log'

export const maxDuration = 300

const TRANS_BASE       = 'https://api.portaldatransparencia.gov.br/api-de-dados'
const MAX_CONTRATOS    = 200
const TAMANHO_PAGINA   = 200
const JANELA_BACKFILL  = 14    // dias por execução — mais largo pois API é mais rápida
const JANELA_CONTINUA  = 30
const BACKFILL_INICIO  = '2020-01-01'   // Transparência tem histórico mais longo

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmtIso   = (d: Date) => d.toISOString().slice(0, 10)
const fmtTrans = (s: string) => s.replace(/-/g, '') // YYYYMMDD

interface Contrato {
  id:              number
  numero?:         string
  objeto?:         string
  valorInicial?:   number
  valorGlobal?:    number
  fornecedor?:     { cnpjFormatado?: string; nome?: string }
  unidadeGestora?: {
    nome?: string
    orgaoVinculado?: { cnpj?: string; nome?: string; codigoUF?: string }
  }
  dataInicioVigencia?: string
  dataFimVigencia?:    string
  situacaoContrato?:   string
}

async function transGet(path: string): Promise<unknown> {
  const apiKey = process.env.TRANSPARENCIA_API_KEY
  if (!apiKey) return null

  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${TRANS_BASE}${path}`, {
        headers: { 'chave-api': apiKey, Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      })
      if (r.status === 404 || r.status === 204) return null
      if (r.status === 429) { await sleep(5000 * (i + 1)); continue }
      if (!r.ok) return null
      return r.json()
    } catch {
      if (i < 2) await sleep(2000 * (i + 1))
    }
  }
  return null
}

async function buscarContratos(dataInicio: string, dataFim: string): Promise<Contrato[]> {
  const ini = fmtTrans(dataInicio)
  const fim = fmtTrans(dataFim)
  const path = `/contratos?dataInicioCadastro=${ini}&dataFimCadastro=${fim}&pagina=1&tamanhoPagina=${TAMANHO_PAGINA}`
  const data = await transGet(path)
  if (!Array.isArray(data)) return []
  return data as Contrato[]
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })

  if (!process.env.TRANSPARENCIA_API_KEY) {
    return NextResponse.json({ ok: false, msg: 'TRANSPARENCIA_API_KEY não configurada' })
  }

  const pausado = await sistemaPausado()
  if (pausado) return NextResponse.json({ ok: true, msg: 'sistema pausado' })

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: cfgRow } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'transparencia_backfill_data')
    .single()

  const hoje       = new Date()
  const pointerStr = cfgRow?.valor ?? BACKFILL_INICIO
  const pointer    = new Date(pointerStr)
  const emBackfill = pointer < hoje

  let dataInicio: string
  let dataFim:    string

  if (emBackfill) {
    dataInicio = fmtIso(pointer)
    const fimJanela = new Date(pointer)
    fimJanela.setDate(fimJanela.getDate() + JANELA_BACKFILL - 1)
    dataFim = fmtIso(new Date(Math.min(fimJanela.getTime(), hoje.getTime())))
  } else {
    const inicio = new Date(hoje)
    inicio.setDate(inicio.getDate() - JANELA_CONTINUA)
    dataInicio = fmtIso(inicio)
    dataFim    = fmtIso(hoje)
  }

  const contratos = await buscarContratos(dataInicio, dataFim)
  const selecionados = contratos.slice(0, MAX_CONTRATOS)

  let inseridos = 0
  let erros     = 0

  for (const c of selecionados) {
    const valor = c.valorGlobal ?? c.valorInicial
    if (!valor || valor <= 0) continue

    const objeto = c.objeto?.trim().toUpperCase()
    if (!objeto) continue

    const cnpjOrgao = (c.unidadeGestora?.orgaoVinculado?.cnpj ?? '').replace(/\D/g, '')
    if (!cnpjOrgao) continue

    const idExterno = `trans_${c.id}`
    const anoContrato = c.dataInicioVigencia
      ? parseInt(c.dataInicioVigencia.slice(0, 4))
      : hoje.getFullYear()

    const row = {
      cnpj_orgao:     cnpjOrgao,
      orgao:          c.unidadeGestora?.orgaoVinculado?.nome ?? c.unidadeGestora?.nome ?? null,
      ano_compra:     anoContrato,
      seq_compra:     c.id,        // id único do contrato na Transparência
      num_item:       1,           // contrato = 1 item (valor total)
      descricao_item: objeto,
      unidade_medida: 'CONTRATO',
      cnpj_vencedor:  c.fornecedor?.cnpjFormatado?.replace(/\D/g, '') ?? null,
      nome_vencedor:  c.fornecedor?.nome ?? null,
      valor_unitario: valor,
      quantidade:     1,
      valor_total:    valor,
      data_resultado: c.dataInicioVigencia?.slice(0, 10) ?? null,
      estado:         c.unidadeGestora?.orgaoVinculado?.codigoUF ?? null,
      municipio:      null,
      fonte:          'transparencia',
      id_externo:     idExterno,
    }

    // Usa id_externo como chave de deduplicação (índice único parcial na migration)
    const { error } = await supabase
      .from('resultados_itens')
      .upsert(row, { onConflict: 'fonte,id_externo', ignoreDuplicates: true })

    if (error) erros++
    else inseridos++

    await sleep(20) // Transparência tem rate limit mais generoso
  }

  if (emBackfill) {
    const proximaData = new Date(dataFim)
    proximaData.setDate(proximaData.getDate() + 1)
    await supabase
      .from('configuracoes')
      .upsert({ chave: 'transparencia_backfill_data', valor: fmtIso(proximaData) })
  }

  await salvarResultadoCron(supabase, 'coletar-resultados-transparencia', {
    contratos: selecionados.length,
    inseridos,
    erros,
    janela:  `${dataInicio} → ${dataFim}`,
    modo:    emBackfill ? 'backfill' : 'continuo',
  })

  return NextResponse.json({
    ok:        true,
    contratos: selecionados.length,
    inseridos,
    erros,
    janela:    `${dataInicio}→${dataFim}`,
    modo:      emBackfill ? 'backfill' : 'continuo',
  })
}
