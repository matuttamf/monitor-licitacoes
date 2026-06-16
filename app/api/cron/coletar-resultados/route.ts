/**
 * Cron: coletar-resultados
 * Schedule: a cada 1 min (backfill) → a cada 4h (modo contínuo)
 *
 * Coleta contratos homologados do PNCP via /contratos e salva em resultados_itens.
 * Cada contrato gera uma linha: objetoContrato = descricao_item, valorGlobal = valor_total.
 * Ponteiro de backfill: 'resultados_backfill_data' em configuracoes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron } from '@/lib/cron-log'

export const maxDuration = 300

const PNCP_CONSULTA  = 'https://pncp.gov.br/api/consulta/v1'
const TAMANHO_PAGINA = 500
const MAX_PAGINAS    = 2      // 2 páginas × 500 = 1000 contratos por execução
const JANELA_BACKFILL = 7    // dias por janela no backfill
const JANELA_CONTINUA = 30   // dias em modo contínuo
const BACKFILL_INICIO = '2023-01-01'

interface Contrato {
  orgaoEntidade?:            { cnpj?: string; razaoSocial?: string }
  anoContrato?:              number
  sequencialContrato?:       number
  niFornecedor?:             string
  nomeRazaoSocialFornecedor?: string
  objetoContrato?:           string
  valorInicial?:             number
  valorGlobal?:              number
  dataAssinatura?:           string
  unidadeOrgao?:             { ufNome?: string; municipioNome?: string }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmtIso  = (d: Date) => d.toISOString().slice(0, 10)
const fmtPncp = (s: string) => s.replace(/-/g, '')

async function buscarContratos(dataInicio: string, dataFim: string, pagina: number): Promise<{ data: Contrato[]; total: number }> {
  const url = `${PNCP_CONSULTA}/contratos?dataInicial=${fmtPncp(dataInicio)}&dataFinal=${fmtPncp(dataFim)}&tamanhoPagina=${TAMANHO_PAGINA}&pagina=${pagina}`
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
    if (!r.ok) return { data: [], total: 0 }
    const json = await r.json() as { data?: Contrato[]; totalRegistros?: number }
    return { data: json.data ?? [], total: json.totalRegistros ?? 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })

  const pausado = await sistemaPausado()
  if (pausado) return NextResponse.json({ ok: true, msg: 'sistema pausado' })

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: cfgRow } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'resultados_backfill_data')
    .single()

  const hoje       = new Date()
  const pointerStr = cfgRow?.valor ?? BACKFILL_INICIO
  const pointer    = new Date(pointerStr)
  const emBackfill = pointer < hoje

  let dataInicio: string
  let dataFim: string

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

  let inseridos = 0
  let erros     = 0
  let totalContratos = 0

  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    const { data: contratos, total } = await buscarContratos(dataInicio, dataFim, pagina)
    if (pagina === 1) totalContratos = total
    if (contratos.length === 0) break

    const rows = contratos
      .filter(c => c.orgaoEntidade?.cnpj && c.anoContrato && c.sequencialContrato)
      .map(c => {
        const desc = c.objetoContrato?.trim().substring(0, 500).toUpperCase() ?? ''
        const valor = c.valorGlobal ?? c.valorInicial ?? 0
        return {
          cnpj_orgao:     c.orgaoEntidade!.cnpj!.replace(/\D/g, ''),
          orgao:          c.orgaoEntidade?.razaoSocial ?? null,
          ano_compra:     c.anoContrato!,
          seq_compra:     c.sequencialContrato!,
          num_item:       1,
          descricao_item: desc || null,
          unidade_medida: null,
          cnpj_vencedor:  c.niFornecedor?.replace(/\D/g, '') ?? null,
          nome_vencedor:  c.nomeRazaoSocialFornecedor ?? null,
          valor_unitario: valor,
          quantidade:     1,
          valor_total:    valor,
          data_resultado: c.dataAssinatura?.slice(0, 10) ?? null,
          estado:         c.unidadeOrgao?.ufNome ?? null,
          municipio:      c.unidadeOrgao?.municipioNome ?? null,
        }
      })
      .filter(r => r.descricao_item && r.valor_unitario > 0)

    // Upsert em lotes de 200
    for (let i = 0; i < rows.length; i += 200) {
      const lote = rows.slice(i, i + 200)
      const { error } = await supabase
        .from('resultados_itens')
        .upsert(lote, { onConflict: 'cnpj_orgao,ano_compra,seq_compra,num_item', ignoreDuplicates: true })
      if (error) erros += lote.length
      else inseridos += lote.length
    }

    if (pagina < MAX_PAGINAS && contratos.length === TAMANHO_PAGINA) {
      await sleep(300)
    } else {
      break
    }
  }

  if (emBackfill) {
    const proximaData = new Date(dataFim)
    proximaData.setDate(proximaData.getDate() + 1)
    await supabase
      .from('configuracoes')
      .upsert({ chave: 'resultados_backfill_data', valor: fmtIso(proximaData) })
  }

  await salvarResultadoCron(supabase, 'coletar-resultados', {
    totalContratos,
    inseridos,
    erros,
    janela: `${dataInicio} → ${dataFim}`,
    modo:   emBackfill ? 'backfill' : 'continuo',
  })

  return NextResponse.json({
    ok: true,
    totalContratos,
    inseridos,
    erros,
    janela: `${dataInicio} → ${dataFim}`,
    modo:   emBackfill ? 'backfill' : 'continuo',
  })
}
