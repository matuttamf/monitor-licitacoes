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

// Processa até 800k linhas por execução — ~30-60s na edge function
const MAX_LINHAS   = 800_000
const MAX_LEADS    = 20_000
const COL = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, SITUACAO: 5, CNAE: 11, UF: 19, MUNICIPIO: 20, EMAIL: 27 }

const CNAE_SEED = new Set([
  '4789005','6209100','8121400','4322301','4330404',
  '4744001','4771701','4754701','8111700','5250801',
])

interface CnaeEstado {
  file_idx: number
  rows_processed: number
  ano: number
  mes: number
}

function getAnoMes() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

function getStorageUrl(fileIdx: number): string {
  const base = Deno.env.get('SUPABASE_URL') ?? ''
  return `${base}/storage/v1/object/public/rf-cnpj/Estabelecimentos${fileIdx}.zip`
}

// Stream ZIP do Storage, chama onLine por linha CSV
// onLine retorna false para parar; AbortController evita buffering excessivo
async function streamZipLinhas(url: string, onLine: (linha: string) => boolean): Promise<void> {
  const abort = new AbortController()
  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.any([abort.signal, AbortSignal.timeout(120000)]),
    })
  } catch { return }
  if (!res.ok || !res.body) return

  const concat = (a: Uint8Array, b: Uint8Array) => {
    const c = new Uint8Array(a.length + b.length); c.set(a); c.set(b, a.length); return c
  }
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const reader = res.body.getReader()
  let headerBuf = new Uint8Array(0)
  let headerParsed = false

  // Goroutine: lê ZIP e alimenta o TransformStream
  ;(async () => {
    try {
      while (!abort.signal.aborted) {
        const { done, value } = await reader.read()
        if (done) { await writer.close(); break }
        const chunk = value as Uint8Array
        if (!headerParsed) {
          headerBuf = concat(headerBuf, chunk)
          if (headerBuf.length >= 30) {
            const view = new DataView(headerBuf.buffer)
            const deflateStart = 30 + view.getUint16(26, true) + view.getUint16(28, true)
            if (headerBuf.length >= deflateStart) {
              headerParsed = true
              const rest = headerBuf.slice(deflateStart)
              if (rest.length > 0) await writer.write(rest)
              headerBuf = new Uint8Array(0)
            }
          }
        } else {
          await writer.write(chunk)
        }
      }
    } catch { /* abortado */ }
    try { await writer.abort() } catch { /* ok */ }
    try { reader.cancel() } catch { /* ok */ }
  })()

  const decompReader = readable.pipeThrough(new DecompressionStream('deflate-raw')).getReader()
  const decoder = new TextDecoder('latin1')
  let buf = ''
  let stop = false
  try {
    while (!stop) {
      const { done, value } = await decompReader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      let nl: number
      while ((nl = buf.indexOf('\n')) !== -1) {
        const linha = buf.slice(0, nl).trimEnd()
        buf = buf.slice(nl + 1)
        if (!onLine(linha)) { stop = true; break }
      }
    }
  } catch { /* stream interrompido */ }
  // Cancela tudo ao parar — libera memória imediatamente
  abort.abort()
  try { await decompReader.cancel() } catch { /* ok */ }
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

  // Novo mês → reinicia do zero
  if (estado.ano !== anoAtual || estado.mes !== mesAtual) {
    estado.file_idx = 0
    estado.rows_processed = 0
    estado.ano = anoAtual
    estado.mes = mesAtual
  }
  if (estado.file_idx > 9) {
    return new Response(JSON.stringify({ ok: true, motivo: 'todos os arquivos processados neste mês' }))
  }

  const targetCnaes = await getTargetCnaes(supabase)
  const url = getStorageUrl(estado.file_idx)
  console.log(`[coletar-leads-cnae] arquivo=${estado.file_idx} skip=${estado.rows_processed} cnae_alvo=${targetCnaes.size}`)

  // Verifica se o arquivo existe
  try {
    const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) })
    if (!head.ok) {
      const erro = `Arquivo não encontrado: Estabelecimentos${estado.file_idx}.zip (HTTP ${head.status})`
      await supabase.from('cron_logs').insert({ job: 'coletar-leads-cnae', status: 'erro', mensagem: erro })
      return new Response(JSON.stringify({ ok: false, erro }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  } catch (e) {
    const erro = `HEAD falhou: ${e}`
    await supabase.from('cron_logs').insert({ job: 'coletar-leads-cnae', status: 'erro', mensagem: erro })
    return new Response(JSON.stringify({ ok: false, erro }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  type Lead = { cnpj: string; razao_social: string; email: string|null; uf: string|null; municipio: string|null; cnae_codigo: string|null; status: 'invalido'; situacao: null; origem: 'cnae' }
  const leads: Lead[] = []
  let rowsLidas = 0
  let esgotado = false

  await streamZipLinhas(url, (line) => {
    rowsLidas++
    const row = estado.rows_processed + rowsLidas

    // Pula linhas já processadas em execuções anteriores
    if (row <= estado.rows_processed) return true

    if (rowsLidas > MAX_LINHAS) return false  // parar — continua na próxima execução

    const cols = line.split('|')
    if (cols.length < 28) return true
    if (cols[COL.MATFIL]  !== '1')  return true
    if (cols[COL.SITUACAO] !== '02') return true
    const cnae = cols[COL.CNAE].trim().replace(/\D/g,'')
    if (!targetCnaes.has(cnae)) return true
    const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g,'')
    if (cnpj.length !== 14) return true

    leads.push({
      cnpj,
      razao_social: cnpj,   // enriquecer-receita preencherá depois
      email:     cols[COL.EMAIL]?.trim()    || null,
      uf:        cols[COL.UF]?.trim()       || null,
      municipio: cols[COL.MUNICIPIO]?.trim() || null,
      cnae_codigo: cnae || null,
      status: 'invalido', situacao: null, origem: 'cnae',
    })

    if (leads.length >= MAX_LEADS) return false
    return true
  })

  // Determina se esgotou o arquivo
  esgotado = rowsLidas < MAX_LINHAS

  // Inserir leads
  let inseridos = 0
  for (let i = 0; i < leads.length; i += 100) {
    const { error } = await supabase.from('leads').upsert(leads.slice(i, i+100), { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += Math.min(100, leads.length - i)
  }

  // Atualizar estado
  let novoEstado: CnaeEstado
  if (esgotado) {
    // Arquivo concluído → avança para o próximo
    novoEstado = { file_idx: estado.file_idx + 1, rows_processed: 0, ano: anoAtual, mes: mesAtual }
    console.log(`[coletar-leads-cnae] arquivo ${estado.file_idx} concluído, avançando para ${estado.file_idx + 1}`)
  } else {
    // Arquivo parcial → continua no próximo cron
    novoEstado = { file_idx: estado.file_idx, rows_processed: estado.rows_processed + rowsLidas, ano: anoAtual, mes: mesAtual }
    console.log(`[coletar-leads-cnae] arquivo ${estado.file_idx} parcial, processadas ${novoEstado.rows_processed} linhas no total`)
  }

  await supabase.from('configuracoes').upsert({ chave: 'coletar_leads_cnae_estado', valor: novoEstado }, { onConflict: 'chave' })

  const resultado = {
    ok: true,
    inseridos,
    leads_encontrados: leads.length,
    linhas_varridas: rowsLidas,
    arquivo_concluido: esgotado,
    file_idx: estado.file_idx,
    proximo_estado: novoEstado,
  }
  await supabase.from('cron_logs').insert({ job: 'coletar-leads-cnae', status: 'ok', mensagem: `${inseridos} inseridos`, detalhes: resultado })
  return new Response(JSON.stringify(resultado), { headers: { 'Content-Type': 'application/json' } })
})
