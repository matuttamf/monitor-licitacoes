import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Vercel: aumentar timeout para 300s (máximo no plano Pro)
export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
const PNCP_BASE   = 'https://pncp.gov.br/api/consulta/v1'
const BRASIL_API  = 'https://brasilapi.com.br/api/cnpj/v1'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PncpContrato {
  nomeRazaoSocialFornecedor?: string
  numeroCpfCnpjFornecedor?:  string
  objetoContrato?:            string
  valorInicial?:              number
  dataPublicacaoPncp?:        string
  dataVigenciaInicio?:        string
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
  orgaoEntidade?: { razaoSocial?: string }
}

interface BrasilApiCnpj {
  cnpj:                   string
  razao_social:           string
  nome_fantasia?:         string
  situacao_cadastral:     string   // '02' = ativa
  descricao_situacao_cadastral: string
  email?:                 string
  ddd_telefone_1?:        string
  municipio?:             string
  uf?:                    string
  descricao_porte?:       string
  cnae_fiscal_descricao?: string
  data_inicio_atividade?: string
}

export interface Lead {
  cnpj:          string
  razao_social:  string
  nome_fantasia: string
  email:         string
  telefone:      string
  municipio:     string
  uf:            string
  situacao:      string
  porte:         string
  cnae:          string
  objeto:        string   // objeto do contrato que originou o lead
  valor:         number
  data_contrato: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function limparCnpj(s: string): string {
  return s.replace(/\D/g, '')
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function buscarCnpj(cnpj: string): Promise<BrasilApiCnpj | null> {
  try {
    const res = await fetch(`${BRASIL_API}/${cnpj}`, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function buscarContratosPNCP(
  dataInicial: string,
  dataFinal:   string,
  uf:          string,
  paginas:     number,
): Promise<{ contratos: PncpContrato[]; debug: Record<string, unknown> }> {
  const contratos: PncpContrato[] = []
  const debug: Record<string, unknown> = {}

  for (let p = 1; p <= paginas; p++) {
    try {
      let url = `${PNCP_BASE}/contratos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${p}&tamanhoPagina=50`
      if (uf && uf !== 'todos') url += `&uf=${uf}`

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(30000),
      })

      if (p === 1) debug.pncp_status = res.status

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        if (p === 1) debug.pncp_error = txt.slice(0, 300)
        break
      }

      const json = await res.json()
      if (p === 1) debug.pncp_keys = Object.keys(json ?? {}).join(',')

      // PNCP pode retornar array direto ou { data: [...] }
      const itens: PncpContrato[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.items)
            ? json.items
            : []

      if (p === 1) debug.pncp_itens_p1 = itens.length

      if (!itens.length) break
      contratos.push(...itens.filter(c => c.numeroCpfCnpjFornecedor))
      if (itens.length < 50) break
    } catch (err) {
      if (p === 1) debug.pncp_exception = String(err).slice(0, 200)
      break
    }
  }
  return { contratos, debug }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Autenticação — admin apenas
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const {
    anos          = 2,              // quantos anos atrás buscar
    uf            = 'todos',        // UF ou 'todos'
    somenteEmail  = true,           // filtrar só quem tem e-mail
    somenteAtivas = true,           // filtrar só empresas ativas
    maxPaginas    = 5,              // páginas da PNCP (50 contratos/página)
    valorMinimo   = 0,              // valor mínimo do contrato
  } = body as {
    anos?: number; uf?: string; somenteEmail?: boolean
    somenteAtivas?: boolean; maxPaginas?: number; valorMinimo?: number
  }

  // Período
  const hoje     = new Date()
  const inicio   = new Date(hoje)
  inicio.setFullYear(inicio.getFullYear() - anos)
  const dataInicial = inicio.toISOString().slice(0, 10).replace(/-/g, '')
  const dataFinal   = hoje.toISOString().slice(0, 10).replace(/-/g, '')

  // 1. Buscar contratos PNCP
  const { contratos, debug: pncpDebug } = await buscarContratosPNCP(dataInicial, dataFinal, uf, maxPaginas)
  console.log('[leads] PNCP debug:', pncpDebug)

  // 2. Desduplicar CNPJs (um e-mail único por empresa)
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const cnpj = limparCnpj(c.numeroCpfCnpjFornecedor!)
    if (cnpj.length === 14 && !cnpjMap.has(cnpj)) {
      if (!valorMinimo || (c.valorInicial ?? 0) >= valorMinimo) {
        cnpjMap.set(cnpj, c)
      }
    }
  }

  // 3. Enriquecer via BrasilAPI (com delay para respeitar rate limit)
  // Limitar a 50 CNPJs por requisição para não ultrapassar o timeout da função
  const MAX_CNPJS_POR_LOTE = 50
  const leads: Lead[] = []
  const cnpjs = [...cnpjMap.keys()].slice(0, MAX_CNPJS_POR_LOTE)

  console.log(`[leads] contratos=${contratos.length} cnpjs_únicos=${cnpjMap.size} lote=${cnpjs.length}`)

  for (let i = 0; i < cnpjs.length; i++) {
    const cnpj     = cnpjs[i]
    const contrato = cnpjMap.get(cnpj)!

    const dados = await buscarCnpj(cnpj)
    if (!dados) { await sleep(300); continue }

    // Filtros
    if (somenteAtivas && dados.situacao_cadastral !== '02') { await sleep(200); continue }
    if (somenteEmail  && !dados.email?.trim()) { await sleep(200); continue }

    leads.push({
      cnpj:          dados.cnpj,
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? '',
      email:         dados.email?.toLowerCase().trim() ?? '',
      telefone:      dados.ddd_telefone_1 ?? '',
      municipio:     dados.municipio ?? contrato.unidadeOrgao?.municipioNome ?? '',
      uf:            dados.uf ?? contrato.unidadeOrgao?.ufSigla ?? '',
      situacao:      dados.descricao_situacao_cadastral ?? '',
      porte:         dados.descricao_porte ?? '',
      cnae:          dados.cnae_fiscal_descricao ?? '',
      objeto:        (contrato.objetoContrato ?? '').slice(0, 150),
      valor:         contrato.valorInicial ?? 0,
      data_contrato: contrato.dataPublicacaoPncp?.slice(0, 10) ?? '',
    })

    // Respeitar rate limit da BrasilAPI (~3 req/s)
    if (i % 3 === 0) await sleep(350)
  }

  return NextResponse.json({
    total_contratos: contratos.length,
    total_cnpjs:     cnpjMap.size,
    total_leads:     leads.length,
    leads,
    debug:           pncpDebug,
  })
}
