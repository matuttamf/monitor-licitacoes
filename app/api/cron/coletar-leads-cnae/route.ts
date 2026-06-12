/**
 * Cron: coletar-leads-cnae
 * Horário: sábados às 6h (semanal)
 *
 * Coleta CNPJs da base de dados abertos da Receita Federal,
 * filtrados pelos CNAEs das empresas que já participam de licitações.
 * Esses leads são marcados com origem='cnae' e filtráveis separadamente.
 *
 * Fluxo:
 * 1. Lê top CNAEs dos leads com origem='participante' (campo cnae_codigo)
 * 2. Baixa arquivo Estabelecimentos da RF (stream ZIP → DEFLATE → CSV)
 * 3. Filtra: ATIVA + MATRIZ + CNAE na lista alvo
 * 4. Insere com origem='cnae', status='invalido' (enriquecer-receita preenche depois)
 * 5. Avança para próximo arquivo no estado (configuracoes)
 *
 * Estado em configuracoes.coletar_leads_cnae_estado (JSON):
 *   { file_idx: 0-9, rows_processed: N, ano: YYYY, mes: M }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron, registrarCronLog } from '@/lib/cron-log'
import { createInflateRaw } from 'node:zlib'

export const maxDuration = 300

const MAX_LEADS_POR_EXECUCAO = 2000
const MAX_LINHAS_VARRER      = 600_000

// CNAEs padrão caso ainda não existam leads com cnae_codigo preenchido.
// Representa setores mais comuns em licitações públicas.
const CNAE_SEED = new Set([
  '4789005', // equipamentos e artigos médicos/odontológicos
  '6209100', // suporte técnico em TI
  '8121400', // limpeza de prédios
  '4322301', // instalações hidráulicas
  '4330404', // esquadrias e divisórias
  '4744001', // material de construção
  '4771701', // farmácias
  '4754701', // móveis para escritório
  '8111700', // serviços de zeladoria
  '5250801', // transporte de valores e segurança
])

// Índices das colunas no CSV de Estabelecimentos (separador: |, sem header)
// CNPJ_BASICO|CNPJ_ORDEM|CNPJ_DV|MATFIL|NOME_FANTASIA|SITUACAO|...|CNAE_PRINC|...|UF|MUNICIPIO|...|EMAIL|...
const COL = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, SITUACAO: 5, CNAE: 11, UF: 19, MUNICIPIO: 20, EMAIL: 27 }

interface CnaeEstado {
  file_idx:       number
  rows_processed: number
  ano:            number
  mes:            number
}

function getRFUrl(fileIdx: number, ano: number, mes: number): string {
  // Tenta Supabase Storage primeiro (não bloqueado por geo-IP).
  // Arquivo deve ser enviado via scripts/upload-rf-cnpj.ts antes de rodar o cron.
  const storageBase = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/rf-cnpj/${ano}-${String(mes).padStart(2, '0')}`
    : null
  if (storageBase) return `${storageBase}/Estabelecimentos${fileIdx}.zip`
  return `https://dados.rfb.gov.br/CNPJ/dados_abertos_cnpj/${ano}-${String(mes).padStart(2, '0')}/Estabelecimentos${fileIdx}.zip`
}

function getAnoMes(): { ano: number; mes: number } {
  const d = new Date()
  d.setMonth(d.getMonth() - 2) // RF publica com ~2 meses de atraso
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTargetCnaes(supabase: any): Promise<Set<string>> {
  const { data } = await supabase
    .from('leads')
    .select('cnae_codigo')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .not('cnae_codigo' as any, 'is', null)
    .limit(5000)

  const rows = (data ?? []) as { cnae_codigo: string | null }[]
  if (!rows.length) return CNAE_SEED

  const counts: Record<string, number> = {}
  for (const r of rows) {
    const code = String(r.cnae_codigo).replace(/\D/g, '').slice(0, 7)
    if (code.length >= 4) counts[code] = (counts[code] ?? 0) + 1
  }

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([c]) => c)

  return top.length ? new Set(top) : CNAE_SEED
}

interface LeadRow {
  cnpj:         string
  razao_social: string
  email:        string | null
  uf:           string | null
  municipio:    string | null
  cnae_codigo:  string | null
  status:       'invalido'
  situacao:     null
  origem:       'cnae'
}

async function processarArquivoRF(
  url:         string,
  targetCnaes: Set<string>,
  skipRows:    number,
  maxLeads:    number,
): Promise<{ leads: LeadRow[]; rowsProcessed: number; esgotado: boolean; erro?: string }> {
  const leads: LeadRow[] = []
  let rowsProcessed = 0
  let esgotado      = false
  let shouldStop    = false
  const abortCtrl   = new AbortController()

  let res: Response
  try {
    res = await fetch(url, {
      signal:  AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(60000)]),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot)', Accept: '*/*' },
    })
  } catch (e) {
    const causa = (e as { cause?: unknown })?.cause
    const detalhe = causa ? ` (causa: ${causa})` : ''
    return { leads, rowsProcessed, esgotado, erro: `fetch falhou: ${e}${detalhe}` }
  }

  if (!res.ok) {
    return { leads, rowsProcessed, esgotado, erro: `HTTP ${res.status} da Receita Federal` }
  }
  if (!res.body) {
    return { leads, rowsProcessed, esgotado, erro: 'body vazio' }
  }

  // Infla o DEFLATE contido dentro do ZIP
  const inflate  = createInflateRaw()
  let lineBuffer = ''
  let rowsSkipped = 0

  inflate.on('data', (chunk: Buffer) => {
    if (shouldStop) return
    lineBuffer += chunk.toString('latin1')

    let nl: number
    while ((nl = lineBuffer.indexOf('\n')) !== -1) {
      const line = lineBuffer.slice(0, nl).trimEnd()
      lineBuffer  = lineBuffer.slice(nl + 1)

      rowsProcessed++
      if (rowsProcessed > MAX_LINHAS_VARRER) { shouldStop = true; break }

      if (rowsSkipped < skipRows) { rowsSkipped++; continue }

      const cols = line.split('|')
      if (cols.length < 28) continue
      if (cols[COL.MATFIL]  !== '1')  continue  // só MATRIZ
      if (cols[COL.SITUACAO] !== '02') continue  // só ATIVA

      const cnae = cols[COL.CNAE].trim().replace(/\D/g, '')
      if (!targetCnaes.has(cnae)) continue

      const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g, '')
      if (cnpj.length !== 14) continue

      leads.push({
        cnpj,
        razao_social: cnpj,                                  // Receita preencherá depois
        email:        cols[COL.EMAIL]?.trim()   || null,
        uf:           cols[COL.UF]?.trim()      || null,
        municipio:    cols[COL.MUNICIPIO]?.trim() || null,
        cnae_codigo:  cnae || null,
        status:       'invalido',
        situacao:     null,
        origem:       'cnae',
      })

      if (leads.length >= maxLeads) { shouldStop = true; break }
    }

    if (shouldStop) abortCtrl.abort()
  })

  inflate.on('end', () => { esgotado = true })

  // Lê o ZIP, pula o cabeçalho local (30 bytes + filename + extra) e alimenta o inflate
  const reader       = res.body.getReader()
  let headerBuffer   = Buffer.alloc(0)
  let headerParsed   = false
  let deflateStart   = -1

  try {
    while (!shouldStop) {
      const { done, value } = await reader.read()
      if (done) {
        inflate.end()
        // Aguarda o inflate terminar de processar o buffer restante
        await new Promise<void>((resolve, reject) => {
          if (esgotado) return resolve()
          inflate.once('end',   resolve)
          inflate.once('error', reject)
        }).catch(() => {/* ignorar erros de aborto */})
        break
      }

      const chunk = Buffer.from(value)

      if (!headerParsed) {
        headerBuffer = Buffer.concat([headerBuffer, chunk])
        if (headerBuffer.length >= 30) {
          const fnameLen  = headerBuffer.readUInt16LE(26)
          const extraLen  = headerBuffer.readUInt16LE(28)
          deflateStart    = 30 + fnameLen + extraLen

          if (headerBuffer.length >= deflateStart) {
            headerParsed = true
            const deflateData = headerBuffer.subarray(deflateStart)
            if (deflateData.length > 0) inflate.write(deflateData)
            headerBuffer = Buffer.alloc(0)
          }
        }
      } else {
        inflate.write(chunk)
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.toLowerCase().includes('abort') && !msg.includes('ERR_ABORTED')) {
      return { leads, rowsProcessed, esgotado, erro: `stream erro: ${msg}` }
    }
  } finally {
    reader.releaseLock()
  }

  return { leads, rowsProcessed, esgotado }
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  // Delega para a Supabase Edge Function que roda em São Paulo (IP brasileiro).
  // A Edge Function acessa dados.rfb.gov.br sem bloqueio de geo-IP.
  const edgeFnUrl = process.env.SUPABASE_EDGE_FN_CNAE_URL
    ?? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/coletar-leads-cnae`

  try {
    const edgeRes = await fetch(edgeFnUrl, {
      method:  'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      signal: AbortSignal.timeout(280_000),
    })

    const texto = await edgeRes.text()
    let resultado: Record<string, unknown>
    try { resultado = JSON.parse(texto) as Record<string, unknown> } catch { resultado = { ok: false, erro: texto.slice(0, 300) } }
    const supabase  = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    await salvarResultadoCron(supabase, 'coletar-leads-cnae', resultado)
    return NextResponse.json(resultado, { status: edgeRes.ok ? 200 : 500 })
  } catch (e) {
    const erro = `edge fn erro: ${e}`
    console.error('[coletar-leads-cnae]', erro)
    await registrarCronLog({ job: 'coletar-leads-cnae', status: 'erro', mensagem: erro })
    return NextResponse.json({ ok: false, erro }, { status: 500 })
  }

}
