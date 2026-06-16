import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300

const ADMIN_EMAIL     = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
const PNCP_BASE       = 'https://pncp.gov.br/api/consulta/v1'
const MINHARECEITA    = 'https://minhareceita.org'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PncpContrato {
  nomeRazaoSocialFornecedor?: string
  niFornecedor?:              string   // campo correto na API PNCP
  tipoPessoa?:                string   // 'PJ' | 'PF' | 'PE'
  objetoContrato?:            string
  valorInicial?:              number
  dataPublicacaoPncp?:        string
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
}

interface MinhaReceitaCnpj {
  cnpj:                          string
  razao_social:                  string
  nome_fantasia?:                string
  situacao_cadastral:            number   // 2 = ATIVA
  descricao_situacao_cadastral?: string
  email?:                        string
  ddd_telefone_1?:               string
  municipio?:                    string
  uf?:                           string
  porte?:                        string
  cnae_fiscal_descricao?:        string
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
  objeto:        string
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

async function buscarCnpj(cnpj: string): Promise<MinhaReceitaCnpj | null> {
  try {
    const res = await fetch(`${MINHARECEITA}/${cnpj}`, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Retorna { contratos, erro } — se erro !== null, a fase falhou e o processo deve parar
async function buscarContratosPNCP(
  dataInicial: string,
  dataFinal:   string,
  uf:          string,
  paginas:     number,
): Promise<{ contratos: PncpContrato[]; erro: string | null; debug: Record<string, unknown> }> {
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
        debug.pncp_error = txt.slice(0, 300)
        // Fase PNCP falhou — cancelar processo inteiro
        return { contratos: [], erro: `PNCP retornou status ${res.status}: ${txt.slice(0, 100)}`, debug }
      }

      const json = await res.json()
      if (p === 1) debug.pncp_keys = Object.keys(json ?? {}).join(',')

      const itens: PncpContrato[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.items)
            ? json.items
            : []

      if (p === 1) debug.pncp_itens_p1 = itens.length

      if (!itens.length) break

      // Filtrar apenas PJ com CNPJ presente
      contratos.push(...itens.filter(c => c.niFornecedor && c.tipoPessoa !== 'PF'))

      if (itens.length < 50) break
    } catch (err) {
      const msg = String(err).slice(0, 200)
      debug.pncp_exception = msg
      if (p === 1) {
        // Falha na primeira página — cancelar
        return { contratos: [], erro: `Erro ao conectar no PNCP: ${msg}`, debug }
      }
      // Falha em página intermediária — parar paginação mas usar o que já coletou
      break
    }
  }

  return { contratos, erro: null, debug }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const {
    anos          = 2,
    uf            = 'todos',
    somenteEmail  = true,
    somenteAtivas = true,
    maxPaginas    = 5,
    valorMinimo   = 0,
  } = body as {
    anos?: number; uf?: string; somenteEmail?: boolean
    somenteAtivas?: boolean; maxPaginas?: number; valorMinimo?: number
  }

  const hoje    = new Date()
  const inicio  = new Date(hoje)
  inicio.setFullYear(inicio.getFullYear() - anos)
  const dataInicial = inicio.toISOString().slice(0, 10).replace(/-/g, '')
  const dataFinal   = hoje.toISOString().slice(0, 10).replace(/-/g, '')

  // ── Fase 1: Buscar contratos PNCP ──────────────────────────────────────────
  const { contratos, erro: erroPNCP, debug: pncpDebug } = await buscarContratosPNCP(
    dataInicial, dataFinal, uf, maxPaginas
  )

  // Se a fase PNCP falhou, cancelar todo o processo
  if (erroPNCP) {
    console.error('[leads] Fase PNCP falhou — processo cancelado:', erroPNCP)
    return NextResponse.json(
      { error: `Fase 1 (PNCP) falhou — processo cancelado. ${erroPNCP}`, debug: pncpDebug },
      { status: 502 }
    )
  }

  console.log('[leads] PNCP debug:', pncpDebug)

  // ── Fase 2: Desduplicar CNPJs ───────────────────────────────────────────────
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const cnpj = limparCnpj(c.niFornecedor!)
    if (cnpj.length === 14 && !cnpjMap.has(cnpj)) {
      if (!valorMinimo || (c.valorInicial ?? 0) >= valorMinimo) {
        cnpjMap.set(cnpj, c)
      }
    }
  }

  if (cnpjMap.size === 0) {
    return NextResponse.json(
      { error: 'Fase 2 (dedup) resultou em 0 CNPJs — verifique os parâmetros de busca', debug: pncpDebug },
      { status: 422 }
    )
  }

  // ── Fase 3: Banco temporário — carregar CNPJs já existentes no banco ────────
  // Evita chamar a API de CNPJ para empresas que já estão na base de leads
  const { data: leadsExistentes } = await supabase
    .from('leads')
    .select('cnpj')
    .in('cnpj', [...cnpjMap.keys()])

  const cnpjsJaNoDb = new Set<string>((leadsExistentes ?? []).map((l: { cnpj: string }) => l.cnpj))

  const cnpjsNovos = [...cnpjMap.keys()].filter(c => !cnpjsJaNoDb.has(c))

  console.log(
    `[leads] contratos=${contratos.length} cnpjs_únicos=${cnpjMap.size} ` +
    `já_no_banco=${cnpjsJaNoDb.size} novos=${cnpjsNovos.length}`
  )

  // Limitar lote para não ultrapassar timeout
  const MAX_LOTE = 50
  const lote     = cnpjsNovos.slice(0, MAX_LOTE)

  // ── Fase 4: Enriquecer via minhareceita.org ────────────────────────────────
  const leads: Lead[] = []

  for (let i = 0; i < lote.length; i++) {
    const cnpj     = lote[i]
    const contrato = cnpjMap.get(cnpj)!

    const dados = await buscarCnpj(cnpj)
    if (!dados) { await sleep(300); continue }

    if (somenteAtivas && dados.situacao_cadastral !== 2) {
      await sleep(200); continue
    }
    if (somenteEmail && !dados.email?.trim()) {
      await sleep(200); continue
    }

    leads.push({
      cnpj:          dados.cnpj,
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? '',
      email:         dados.email?.toLowerCase().trim() ?? '',
      telefone:      dados.ddd_telefone_1 ?? '',
      municipio:     dados.municipio ?? contrato.unidadeOrgao?.municipioNome ?? '',
      uf:            dados.uf ?? contrato.unidadeOrgao?.ufSigla ?? '',
      situacao:      dados.situacao_cadastral ?? '',
      porte:         dados.porte ?? '',
      cnae:          dados.cnae_fiscal_descricao ?? '',
      objeto:        (contrato.objetoContrato ?? '').slice(0, 150),
      valor:         contrato.valorInicial ?? 0,
      data_contrato: contrato.dataPublicacaoPncp?.slice(0, 10) ?? '',
    })

    if (i % 3 === 0) await sleep(350)
  }

  return NextResponse.json({
    total_contratos:  contratos.length,
    total_cnpjs:      cnpjMap.size,
    ja_no_banco:      cnpjsJaNoDb.size,
    novos_verificados: lote.length,
    total_leads:      leads.length,
    leads,
    debug:            pncpDebug,
  })
}
