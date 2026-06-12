/**
 * Script: enriquecer-receita
 * Consulta minhareceita.org para todos os leads com status=invalido.
 * Atualiza: razao_social, situacao, cnae, cnae_codigo, porte, email, telefone, municipio, uf, status.
 * Usa fetch direto à REST API do Supabase (sem postgrest-js client).
 */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').replace(/\/$/, '')
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const MINHARECEITA = 'https://minhareceita.org'
const CONCORRENCIA = 5
const LOTE         = 500

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

async function buscarLeads(offset: number): Promise<{ id: string; cnpj: string; email: string | null }[]> {
  const url = `${REST}/leads?select=id,cnpj,email&status=eq.invalido&offset=${offset}&limit=${LOTE}`
  const res = await fetch(url, { headers: HEADERS_GET })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`Erro ao buscar leads (${res.status}):`, txt.slice(0, 300))
    return []
  }
  return res.json()
}

async function atualizarLead(id: string, dados: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${REST}/leads?id=eq.${id}`, {
    method:  'PATCH',
    headers: HEADERS_PATCH,
    body:    JSON.stringify(dados),
  })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`Erro ao atualizar lead ${id} (${res.status}):`, txt.slice(0, 200))
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

  let offset = 0
  let totalVerificados = 0, totalAtivos = 0, totalInativos = 0, totalSemDados = 0

  while (true) {
    const leads = await buscarLeads(offset)
    if (leads.length === 0) break

    console.log(`\nLote ${Math.floor(offset / LOTE) + 1}: ${leads.length} leads`)

    const grupos: typeof leads[] = []
    for (let i = 0; i < leads.length; i += CONCORRENCIA) {
      grupos.push(leads.slice(i, i + CONCORRENCIA))
    }

    for (const grupo of grupos) {
      await Promise.all(grupo.map(async lead => {
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
        await atualizarLead(lead.id, {
          razao_social:  dados.razao_social,
          nome_fantasia: dados.nome_fantasia ?? null,
          email:         emailFinal,
          telefone,
          municipio:     dados.municipio ?? null,
          uf:            dados.uf ?? null,
          situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
          porte:         dados.porte ?? null,
          cnae:          dados.cnae_fiscal_descricao ?? null,
          cnae_codigo:   cnaeCode,
          status:        emailFinal ? 'pendente' : 'invalido',
        })
      }))
      await sleep(200)
    }

    console.log(`  verificados=${totalVerificados} ativos=${totalAtivos} inativas=${totalInativos} sem_dados=${totalSemDados}`)
    offset += LOTE

    if (leads.length < LOTE) break
  }

  console.log(`\n✓ Concluído: ${totalVerificados} verificados, ${totalAtivos} ativos, ${totalInativos} inativas, ${totalSemDados} sem dados`)
}

main().catch(e => { console.error(e); process.exit(1) })
