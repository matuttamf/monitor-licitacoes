/**
 * Script: enriquecer-receita
 * Consulta minhareceita.org para todos os leads com status=invalido.
 * Atualiza: razao_social, situacao, cnae, cnae_codigo, porte, email, telefone, municipio, uf, segmento, status.
 * Usa fetch direto à REST API do Supabase (sem postgrest-js client).
 */

import { mapearSegmento } from '../lib/leads/segmento'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '')
  .trim()
  .replace(/\/rest\/v1\/?$/, '')  // remove /rest/v1 se vier no final (Supabase v2 vs v3)
  .replace(/\/$/, '')
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const MINHARECEITA = 'https://minhareceita.org'
const CONCORRENCIA = 25
const LOTE         = 20000
const MAX_ROWS     = parseInt(process.env.MAX_ROWS ?? '0') || 0

console.log('SUPABASE_URL:', SUPABASE_URL || '*** UNDEFINED ***')
console.log('REST base:', `${SUPABASE_URL}/rest/v1`)
console.log('SERVICE_KEY:', SERVICE_KEY ? `${SERVICE_KEY.length} chars` : '*** UNDEFINED ***')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Variáveis de ambiente não configuradas.')
  process.exit(1)
}

const REST = `${SUPABASE_URL}/rest/v1`
const HEADERS_GET: Record<string, string> = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Accept':        'application/json',
}
const HEADERS_PATCH: Record<string, string> = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
  'Prefer':        'return=minimal',
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function fetchComRetry(url: string, opts: RequestInit, tentativas = 4): Promise<Response> {
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(url, opts)
      if (res.status === 500 || res.status === 503 || res.status === 504) {
        const txt = await res.text()
        console.warn(`  Retry ${i + 1}/${tentativas} (${res.status}): ${txt.slice(0, 150)}`)
        await sleep(3000 * (i + 1))
        continue
      }
      return res
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`  Retry ${i + 1}/${tentativas} (network): ${msg.slice(0, 150)}`)
      if (i < tentativas - 1) await sleep(5000 * (i + 1))
    }
  }
  throw new Error(`Falha após ${tentativas} tentativas: ${url}`)
}

// PostgREST não suporta regex (~) dentro de or() — usamos duas queries separadas.
// Query A: leads sem e-mail (status=invalido por falta de email).
// Query B: leads invalidos com e-mail e situação ATIVA (razão social não verificada).
// Usa cursor (id > lastId) em vez de OFFSET — evita full scan crescente em 9M+ linhas
async function buscarLeads(lastId: string, filtro: 'sem-email' | 'invalido-com-email' | 'pendente-sem-cidade'): Promise<{ id: string; cnpj: string; email: string | null }[]> {
  const base: Record<string, string> = { select: 'id,cnpj,email', 'id': `gt.${lastId}`, order: 'id.asc', limit: String(LOTE) }
  let extra: Record<string, string>
  if (filtro === 'sem-email') {
    extra = { 'email': 'is.null', 'status': 'in.(invalido,pendente)' }
  } else if (filtro === 'invalido-com-email') {
    extra = { 'status': 'eq.invalido', 'situacao': 'eq.ATIVA', 'email': 'not.is.null' }
  } else {
    extra = { 'status': 'eq.pendente', 'municipio': 'is.null' }
  }
  const qs = new URLSearchParams({ ...base, ...extra })
  const url = `${REST}/leads?${qs}`
  const res = await fetchComRetry(url, { headers: HEADERS_GET })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`Erro ao buscar leads (${res.status}):`, txt.slice(0, 300))
    return []
  }
  return res.json()
}

async function atualizarLead(id: string, dados: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetchComRetry(`${REST}/leads?id=eq.${id}`, {
      method:  'PATCH',
      headers: HEADERS_PATCH,
      body:    JSON.stringify(dados),
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error(`Erro ao atualizar lead ${id} (${res.status}):`, txt.slice(0, 200))
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`Falha ao atualizar lead ${id}:`, msg.slice(0, 200))
  }
}

async function consultarCNPJ(cnpj: string) {
  try {
    const res = await fetch(`${MINHARECEITA}/${cnpj}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function main() {
  console.log('=== Enriquecer Receita Federal ===')

  // Diagnóstico: testar múltiplas tabelas e JWT info
  const jwtPayload = SERVICE_KEY.split('.')[1]
  try {
    const decoded = JSON.parse(Buffer.from(jwtPayload, 'base64').toString())
    console.log('JWT role:', decoded.role, '| iss:', decoded.iss)
  } catch { console.log('JWT: falha ao decodificar payload') }

  for (const tabela of ['leads', 'profiles', 'licitacoes', 'keywords']) {
    const r = await fetch(`${REST}/${tabela}?select=id&limit=1`, { headers: HEADERS_GET })
    const body = r.ok ? 'OK' : (await r.text()).slice(0, 150)
    console.log(`  ${tabela}: ${r.status} ${body}`)
  }

  const teste = await fetch(`${REST}/leads?select=id&limit=1`, { headers: HEADERS_GET })
  if (!teste.ok) { process.exit(1) }

  let totalVerificados = 0, totalAtivos = 0, totalInativos = 0, totalSemDados = 0, totalComEmail = 0

  async function processarLote(lead: { id: string; cnpj: string; email: string | null }) {
    const dados = await consultarCNPJ(lead.cnpj)
    if (!dados) { totalSemDados++; return }

    totalVerificados++
    const emailDaReceita = dados.email?.trim()?.toLowerCase() || null
    const emailFinal     = emailDaReceita ?? lead.email ?? null
    const ativa          = dados.situacao_cadastral === 2
    const cnaeCode       = String(dados.cnae_fiscal ?? '').replace(/\D/g, '') || null
    const telefone       = dados.ddd_telefone_1?.trim() || dados.ddd_telefone_2?.trim() || null

    if (!ativa) {
      totalInativos++
      await atualizarLead(lead.id, {
        razao_social: dados.razao_social ?? lead.cnpj,
        situacao:     dados.descricao_situacao_cadastral ?? 'INATIVA',
        cnae:         dados.cnae_fiscal_descricao ?? null,
        cnae_codigo:  cnaeCode,
        porte:        dados.porte ?? null,
        telefone,
        municipio:    dados.municipio ?? null,
        uf:           dados.uf ?? null,
        status:       'invalido',
      })
      return
    }

    totalAtivos++
    if (emailFinal) totalComEmail++
    const cnaeDesc = dados.cnae_fiscal_descricao ?? null
    await atualizarLead(lead.id, {
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailFinal,
      telefone,
      municipio:     dados.municipio ?? null,
      uf:            dados.uf ?? null,
      situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
      porte:         dados.porte ?? null,
      cnae:          cnaeDesc,
      cnae_codigo:   cnaeCode,
      segmento:      mapearSegmento(cnaeDesc),
      status:        (emailFinal && dados.razao_social && /[a-zA-ZÀ-ÿ]/.test(dados.razao_social) && dados.municipio && cnaeCode) ? 'pendente' : 'invalido',
    })
  }

  async function rodarPasse(filtro: 'sem-email' | 'invalido-com-email' | 'pendente-sem-cidade') {
    console.log(`\n── Passe: ${filtro} ──`)
    let lastId = '00000000-0000-0000-0000-000000000000'
    let lote = 1
    while (true) {
      if (MAX_ROWS > 0 && totalVerificados >= MAX_ROWS) { console.log(`  Limite de ${MAX_ROWS} atingido.`); break }
      const leads = await buscarLeads(lastId, filtro)
      if (leads.length === 0) break
      console.log(`\nLote ${lote++}: ${leads.length} leads`)
      for (let i = 0; i < leads.length; i += CONCORRENCIA) {
        await Promise.all(leads.slice(i, i + CONCORRENCIA).map(processarLote))
      }
      console.log(`  verificados=${totalVerificados} ativos=${totalAtivos} com_email=${totalComEmail} inativas=${totalInativos} sem_dados=${totalSemDados}`)
      lastId = leads[leads.length - 1].id
    }
  }

  await rodarPasse('sem-email')
  await rodarPasse('invalido-com-email')
  await rodarPasse('pendente-sem-cidade')

  console.log(`\n✓ Concluído: ${totalVerificados} verificados, ${totalAtivos} ativos, ${totalComEmail} com e-mail, ${totalInativos} inativas, ${totalSemDados} sem dados`)
}

main().catch(e => { console.error(e); process.exit(1) })
