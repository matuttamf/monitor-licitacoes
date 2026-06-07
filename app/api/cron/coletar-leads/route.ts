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

async function buscarContratosPNCP(dataInicial: string, dataFinal: string, paginas = 10): Promise<PncpContrato[]> {
  const todos: PncpContrato[] = []
  for (let p = 1; p <= paginas; p++) {
    try {
      const url = `${PNCP_BASE}/contratos/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${p}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) break
      const json = await res.json()
      const itens: PncpContrato[] = json.data ?? []
      if (!itens.length) break
      todos.push(...itens.filter(c => c.numeroCpfCnpjFornecedor))
      if (itens.length < 50) break
    } catch { break }
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

  // Período: últimos 2 dias (buffer para falhas do dia anterior)
  const hoje  = new Date()
  const inicio = new Date(hoje); inicio.setDate(inicio.getDate() - 2)
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const dataInicial = fmt(inicio)
  const dataFinal   = fmt(hoje)

  console.log(`[coletar-leads] período ${dataInicial} → ${dataFinal}`)

  // 1. Buscar contratos PNCP
  // Limite conservador: 5 páginas × 50 = 250 contratos → ~50 CNPJs únicos para enriquecer
  // BrasilAPI: ~3 req/s → 50 × 350ms = ~17s. Seguro dentro do maxDuration=300.
  const contratos = await buscarContratosPNCP(dataInicial, dataFinal, 5)
  console.log(`[coletar-leads] ${contratos.length} contratos encontrados`)

  // 2. Desduplicar CNPJs (apenas 14 dígitos = empresa, não CPF)
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const raw  = c.numeroCpfCnpjFornecedor!.replace(/\D/g, '')
    if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
  }
  const cnpjsNovos = [...cnpjMap.keys()]
  console.log(`[coletar-leads] ${cnpjsNovos.length} CNPJs únicos`)

  if (!cnpjsNovos.length) {
    return NextResponse.json({ ok: true, novos: 0, mensagem: 'Nenhum CNPJ novo encontrado' })
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

  console.log(`[coletar-leads] ${inseridos} leads inseridos`)
  return NextResponse.json({ ok: true, novos: inseridos, total_processados: paraEnriquecer.length })
}
