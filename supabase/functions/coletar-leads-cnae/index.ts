/**
 * Supabase Edge Function: coletar-leads-cnae
 * Roda em São Paulo (sa-east-1) — IP brasileiro, acessa dados.rfb.gov.br sem bloqueio.
 *
 * Disparo: cron da Vercel faz GET /api/cron/coletar-leads-cnae,
 * que por sua vez chama esta Edge Function via fetch interno.
 *
 * Variáveis necessárias (Supabase Dashboard → Settings → Edge Functions → Secrets):
 *   SUPABASE_URL              (automática)
 *   SUPABASE_SERVICE_ROLE_KEY (automática)
 *   CRON_SECRET               (mesma que na Vercel)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const MAX_LEADS       = 2000
const MAX_LINHAS      = 500_000
const COL = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, SITUACAO: 5, CNAE: 11, UF: 19, MUNICIPIO: 20, EMAIL: 27 }

const CNAE_SEED = new Set([
  '4789005','6209100','8121400','4322301','4330404',
  '4744001','4771701','4754701','8111700','5250801',
])

interface CnaeEstado {
  file_idx: number; rows_processed: number; ano: number; mes: number
}

const RF_NEXTCLOUD_BASE = 'https://arquivos.receitafederal.gov.br/index.php/s/YggdBLfdninEJX9'

function getAnoMes() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

function getRFUrls(fileIdx: number, ano: number, mes: number): string[] {
  const mesStr = String(mes).padStart(2, '0')
  const base = Deno.env.get('SUPABASE_URL') ?? ''
  return [
    `${base}/storage/v1/object/public/rf-cnpj/${ano}-${mesStr}/Estabelecimentos${fileIdx}.zip`,
    `${RF_NEXTCLOUD_BASE}/download?path=%2F${ano}-${mesStr}&files=Estabelecimentos${fileIdx}.zip`,
  ]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTargetCnaes(supabase: any): Promise<Set<string>> {
  const { data } = await supabase.from('leads').select('cnae_codigo').not('cnae_codigo','is',null).limit(5000)
  const rows = (data ?? []) as { cnae_codigo: string | null }[]
  if (!rows.length) return CNAE_SEED
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const code = String(r.cnae_codigo).replace(/\D/g,'').slice(0,7)
    if (code.length >= 4) counts[code] = (counts[code] ?? 0) + 1
  }
  const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,50).map(([c]) => c)
  return top.length ? new Set(top) : CNAE_SEED
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Verificar captação ativa
  const { data: cfgAtiva } = await supabase.from('configuracoes').select('valor').eq('chave','captacao_ativa').maybeSingle()
  if (cfgAtiva && (cfgAtiva.valor === false || cfgAtiva.valor === 'false')) {
    return new Response(JSON.stringify({ ok: true, motivo: 'sistema pausado' }))
  }

  // Carregar estado
  const { data: cfgEstado } = await supabase.from('configuracoes').select('valor').eq('chave','coletar_leads_cnae_estado').maybeSingle()
  const { ano: anoAtual, mes: mesAtual } = getAnoMes()
  const estado: CnaeEstado = cfgEstado?.valor ?? { file_idx: 0, rows_processed: 0, ano: anoAtual, mes: mesAtual }

  if (estado.ano !== anoAtual || estado.mes !== mesAtual) {
    estado.file_idx = 0; estado.rows_processed = 0
    estado.ano = anoAtual; estado.mes = mesAtual
  }
  if (estado.file_idx > 9) {
    return new Response(JSON.stringify({ ok: true, motivo: 'todos os arquivos processados neste mês' }))
  }

  const targetCnaes = await getTargetCnaes(supabase)
  const urls = getRFUrls(estado.file_idx, estado.ano, estado.mes)
  console.log(`[coletar-leads-cnae] arquivo=${estado.file_idx} skip=${estado.rows_processed} cnae_alvo=${targetCnaes.size}`)

  // Tenta Supabase Storage primeiro, depois RF direto
  let res: Response | null = null
  let urlUsada = ''
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'MonitorLicitacoes/1.0' }, signal: AbortSignal.timeout(30000) })
      if (r.ok && r.body) { res = r; urlUsada = u; break }
      console.log(`[coletar-leads-cnae] ${u} → HTTP ${r.status}, tentando próximo`)
    } catch (e) { console.log(`[coletar-leads-cnae] ${u} falhou: ${e}, tentando próximo`) }
  }
  if (!res || !res.body) {
    const erro = `Todos os URLs falharam para arquivo ${estado.file_idx}`
    await supabase.from('cron_logs').insert({ job: 'coletar-leads-cnae', status: 'erro', mensagem: erro })
    return new Response(JSON.stringify({ ok: false, erro }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
  console.log(`[coletar-leads-cnae] usando ${urlUsada}`)

  // Descomprime o ZIP via DecompressionStream (Deno nativo)
  // O ZIP contém um único arquivo deflate — pula o header local (30 + fnameLen + extraLen bytes)
  const leads: { cnpj: string; razao_social: string; email: string|null; uf: string|null; municipio: string|null; cnae_codigo: string|null; status: 'invalido'; situacao: null; origem: 'cnae' }[] = []
  let rowsProcessed = 0
  let esgotado = false

  try {
    const reader = res.body.getReader()
    let headerBuf = new Uint8Array(0)
    let headerParsed = false
    let deflateStart = -1

    // Junta chunks até ter o header completo do ZIP (mínimo 30 bytes)
    const concat = (a: Uint8Array, b: Uint8Array) => { const c = new Uint8Array(a.length + b.length); c.set(a); c.set(b, a.length); return c }

    // Cria um TransformStream para receber os dados deflate
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const writer = writable.getWriter()

    // Lê o ZIP e alimenta o writer com apenas o bloco deflate
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) { await writer.close(); break }
          const chunk = value as Uint8Array
          if (!headerParsed) {
            headerBuf = concat(headerBuf, chunk)
            if (headerBuf.length >= 30) {
              const view = new DataView(headerBuf.buffer)
              const fnameLen  = view.getUint16(26, true)
              const extraLen  = view.getUint16(28, true)
              deflateStart    = 30 + fnameLen + extraLen
              if (headerBuf.length >= deflateStart) {
                headerParsed = true
                const deflateData = headerBuf.slice(deflateStart)
                if (deflateData.length > 0) await writer.write(deflateData)
                headerBuf = new Uint8Array(0)
              }
            }
          } else {
            await writer.write(chunk)
          }
        }
      } catch { await writer.abort() }
    })()

    // Descomprime e processa linha a linha
    const decomp    = new DecompressionStream('deflate-raw')
    const decompReader = readable.pipeThrough(decomp).getReader()
    const decoder   = new TextDecoder('latin1')
    let lineBuffer  = ''
    let rowsSkipped = 0
    let stop        = false

    while (!stop) {
      const { done, value } = await decompReader.read()
      if (done) { esgotado = true; break }
      lineBuffer += decoder.decode(value, { stream: true })

      let nl: number
      while ((nl = lineBuffer.indexOf('\n')) !== -1) {
        const line = lineBuffer.slice(0, nl).trimEnd()
        lineBuffer  = lineBuffer.slice(nl + 1)
        rowsProcessed++

        if (rowsProcessed > MAX_LINHAS) { stop = true; break }
        if (rowsSkipped < estado.rows_processed) { rowsSkipped++; continue }

        const cols = line.split('|')
        if (cols.length < 28) continue
        if (cols[COL.MATFIL]   !== '1')  continue
        if (cols[COL.SITUACAO]  !== '02') continue
        const cnae = cols[COL.CNAE].trim().replace(/\D/g,'')
        if (!targetCnaes.has(cnae)) continue
        const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g,'')
        if (cnpj.length !== 14) continue

        leads.push({
          cnpj,
          razao_social: cnpj,
          email:        cols[COL.EMAIL]?.trim()      || null,
          uf:           cols[COL.UF]?.trim()         || null,
          municipio:    cols[COL.MUNICIPIO]?.trim()  || null,
          cnae_codigo:  cnae || null,
          status:       'invalido',
          situacao:     null,
          origem:       'cnae',
        })

        if (leads.length >= MAX_LEADS) { stop = true; break }
      }
    }
  } catch (e) {
    const erro = `stream erro: ${e}`
    await supabase.from('cron_logs').insert({ job: 'coletar-leads-cnae', status: 'erro', mensagem: erro })
    return new Response(JSON.stringify({ ok: false, erro }), { status: 500 })
  }

  // Inserir leads
  let inseridos = 0
  for (let i = 0; i < leads.length; i += 100) {
    const { error } = await supabase.from('leads').upsert(leads.slice(i, i+100), { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += Math.min(100, leads.length - i)
  }

  // Atualizar estado
  const novoEstado: CnaeEstado = {
    ...estado,
    rows_processed: esgotado ? 0 : estado.rows_processed + rowsProcessed,
    file_idx:       esgotado ? estado.file_idx + 1 : estado.file_idx,
    ano: anoAtual, mes: mesAtual,
  }
  await supabase.from('configuracoes').upsert({ chave: 'coletar_leads_cnae_estado', valor: novoEstado }, { onConflict: 'chave' })

  const resultado = { ok: true, inseridos, leads_encontrados: leads.length, linhas_varridas: rowsProcessed, esgotado, file_idx: estado.file_idx }
  await supabase.from('cron_logs').insert({ job: 'coletar-leads-cnae', status: 'ok', mensagem: `${inseridos} inseridos (edge fn)`, detalhes: resultado })
  return new Response(JSON.stringify(resultado), { headers: { 'Content-Type': 'application/json' } })
})
