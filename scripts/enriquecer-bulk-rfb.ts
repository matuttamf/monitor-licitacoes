/**
 * Script: enriquecer-bulk-rfb
 *
 * Enriquece TODA a base de leads (9.5M+) com dados dos arquivos RFB do Supabase Storage,
 * sem depender da API minhareceita.org. Estimativa: 2-3h vs ~22 dias pela API.
 *
 * PRÉ-REQUISITO: executar scripts/sql/fn-enriquecer-bulk-rfb.sql no Supabase SQL Editor.
 *
 * Uso:
 *   npx tsx scripts/enriquecer-bulk-rfb.ts          # todos os arquivos (0-9)
 *   npx tsx scripts/enriquecer-bulk-rfb.ts 0 4      # apenas arquivos 0-4
 *
 * Campos atualizados: razao_social, nome_fantasia, situacao, cnae_codigo, uf, porte, email (só se null)
 * Campos preservados: status, municipio, telefone, id, created_at, disparado_em
 */

import { createClient } from '@supabase/supabase-js'
import { createWriteStream, existsSync, unlinkSync, statSync } from 'node:fs'
import { pipeline as streamPipeline } from 'node:stream/promises'
import { createInflateRaw } from 'node:zlib'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { config } from 'dotenv'
config({ path: '.env.local' })
config()

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '')
  .trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const cliArgs  = process.argv.slice(2)
const IDX_START = Number(cliArgs[0] ?? 0)
const IDX_END   = Number(cliArgs[1] ?? 9)
const BATCH_SIZE = 1000

const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/rf-cnpj`
const RF_BASE      = 'https://arquivos.receitafederal.gov.br/public.php/dav/files/YggdBLfdninEJX9'

// Colunas dos arquivos Estabelecimentos
const COL = { BASICO: 0, ORDEM: 1, DV: 2, NOME_FANTASIA: 4, SITUACAO: 5, CNAE: 11, UF: 19, EMAIL: 27 }
// Colunas dos arquivos Empresas
const COL_EMP = { BASICO: 0, RAZAO: 1, PORTE: 5 }

const SITUACAO_MAP: Record<string, string> = {
  '01': 'NULA', '02': 'ATIVA', '03': 'SUSPENSA', '04': 'INAPTA', '08': 'BAIXADA',
}
const PORTE_MAP: Record<string, string> = {
  '00': 'NÃO INFORMADO', '01': 'MICRO EMPRESA', '03': 'EMPRESA DE PEQUENO PORTE', '05': 'DEMAIS',
}

// ── Validação de e-mail ───────────────────────────────────────────────────────
const RE_EMAIL = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/
const DOMINIOS_INVALIDOS = new Set([
  'gmail.com','hotmail.com','yahoo.com','outlook.com','bol.com.br','uol.com.br',
  'terra.com.br','ig.com.br','live.com','msn.com','icloud.com','me.com',
  'naoinformado.com','naoconsta.com','inexistente.com','nenhum.com',
  'naodisponivel.com','nodomain.com','domain.com','test.com','example.com',
  'email.com','mail.com','fake.com','null.com','none.com',
])
function validarEmail(raw: string | null): string | null {
  if (!raw) return null
  const e = raw.trim().toLowerCase()
  if (!RE_EMAIL.test(e) || e.length > 100) return null
  const [, dominio] = e.split('@')
  return DOMINIOS_INVALIDOS.has(dominio) ? null : e
}

// ── Parser CSV com suporte a aspas duplas ─────────────────────────────────────
function parseCSVLine(line: string, sep: string): string[] {
  const result: string[] = []
  let i = 0
  while (i <= line.length) {
    if (line[i] === '"') {
      i++
      let val = ''
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2 }
        else if (line[i] === '"') { i++; break }
        else { val += line[i++] }
      }
      result.push(val)
      if (line[i] === sep) i++
    } else {
      const end = line.indexOf(sep, i)
      if (end === -1) { result.push(line.slice(i)); break }
      result.push(line.slice(i, end))
      i = end + 1
    }
  }
  return result
}

// ── Processamento ZIP (stream) ────────────────────────────────────────────────
type OnLine = (cols: string[]) => void

async function processarZip(tmpPath: string, onLine: OnLine): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const inflate    = createInflateRaw()
    const fileStream = require('node:fs').createReadStream(tmpPath)
    let headerBuf    = Buffer.alloc(0)
    let headerParsed = false

    const startDeflate = (src: NodeJS.ReadableStream) => {
      inflate.on('error', reject)
      src.pipe(inflate)
      let sep = '|'
      let primeiraLinha = true
      const rl = createInterface({ input: inflate, crlfDelay: Infinity })
      rl.on('line', (line) => {
        if (primeiraLinha) {
          primeiraLinha = false
          const cp = (line.match(/\|/g) ?? []).length
          const cs = (line.match(/;/g)  ?? []).length
          sep = cs > cp ? ';' : '|'
          return  // pula header (detecta separador e descarta linha)
        }
        const cols = parseCSVLine(line, sep)
        if (cols.length >= 2) onLine(cols)
      })
      rl.on('close', resolve)
      rl.on('error', reject)
    }

    fileStream.on('data', (chunk: Buffer | string) => {
      if (headerParsed) return
      headerBuf = Buffer.concat([headerBuf, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)])
      if (headerBuf.length >= 30) {
        const deflateStart = 30 + headerBuf.readUInt16LE(26) + headerBuf.readUInt16LE(28)
        if (headerBuf.length >= deflateStart) {
          headerParsed = true
          fileStream.pause()
          fileStream.removeAllListeners('data')
          const combined = new Readable({ read() {} })
          combined.push(headerBuf.slice(deflateStart))
          fileStream.on('data', (d: Buffer | string) => combined.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
          fileStream.on('end', () => combined.push(null))
          fileStream.on('error', (e: Error) => combined.destroy(e))
          fileStream.resume()
          startDeflate(combined)
        }
      }
    })
    fileStream.on('error', reject)
  })
}

// ── Download com retry e retomada ─────────────────────────────────────────────
async function downloadComRetry(urls: string[], tmpPath: string, tentativas = 5): Promise<boolean> {
  for (const url of urls) {
    console.log(`  ↓ ${url.split('/').at(-1)}`)
    for (let t = 1; t <= tentativas; t++) {
      try {
        let bytesJaBaixados = 0
        if (existsSync(tmpPath)) {
          bytesJaBaixados = statSync(tmpPath).size
          if (bytesJaBaixados > 0) console.log(`  Retomando do byte ${bytesJaBaixados}`)
        }
        const headers: Record<string,string> = { 'User-Agent': 'MonitorLicitacoes/1.0' }
        if (bytesJaBaixados > 0) headers['Range'] = `bytes=${bytesJaBaixados}-`

        const res = await fetch(url, { headers, signal: AbortSignal.timeout(120_000) })
        if (!res.ok || !res.body) {
          if (res.status === 404 || res.status === 403) break
          if (res.status === 416) {
            unlinkSync(tmpPath)
            const res2 = await fetch(url, { headers: { 'User-Agent': 'MonitorLicitacoes/1.0' } })
            if (!res2.ok || !res2.body) break
            await streamPipeline(res2.body as unknown as NodeJS.ReadableStream, createWriteStream(tmpPath, { flags: 'w' }))
            console.log('  ✓ Concluído')
            return true
          }
          if (t < tentativas) { await new Promise(r => setTimeout(r, 10000 * t)); continue }
          break
        }
        const flags = bytesJaBaixados > 0 && res.status === 206 ? 'a' : 'w'
        await streamPipeline(res.body as unknown as NodeJS.ReadableStream, createWriteStream(tmpPath, { flags }))
        console.log('  ✓ Concluído')
        return true
      } catch (e) {
        console.error(`  Tentativa ${t} falhou: ${e instanceof Error ? e.message : e}`)
        if (t < tentativas) await new Promise(r => setTimeout(r, 10000 * t))
      }
    }
    if (existsSync(tmpPath)) unlinkSync(tmpPath)
  }
  return false
}

function getUrls(tipo: 'Estabelecimentos' | 'Empresas', idx: number): string[] {
  return [`${STORAGE_BASE}/${tipo}${idx}.zip`, `${RF_BASE}/${tipo}${idx}.zip`]
}

// ── Fase 1: todos os CNPJs da base em memória ─────────────────────────────────
async function carregarCnpjsBase(): Promise<{ cnpjsBase: Set<string>; basicosBase: Set<string> }> {
  console.log('\n── Fase 1: Carregando CNPJs da base ──')
  const cnpjsBase  = new Set<string>()
  const basicosBase = new Set<string>()
  let lastId = '00000000-0000-0000-0000-000000000000'
  while (true) {
    const { data, error } = await supabase
      .from('leads').select('id,cnpj')
      .gt('id', lastId).order('id', { ascending: true }).limit(1000)
    if (error) { console.error('Erro:', error.message); break }
    if (!data?.length) break
    for (const r of data) {
      cnpjsBase.add(r.cnpj as string)
      basicosBase.add((r.cnpj as string).slice(0, 8))
    }
    lastId = data[data.length - 1].id as string
    if (data.length < 1000) break
    if (cnpjsBase.size % 500_000 < 1000) console.log(`  ${cnpjsBase.size.toLocaleString('pt-BR')} carregados...`)
  }
  console.log(`  CNPJs: ${cnpjsBase.size.toLocaleString('pt-BR')} | Basicós únicos: ${basicosBase.size.toLocaleString('pt-BR')}`)
  return { cnpjsBase, basicosBase }
}

// ── Fase 2: mapa de razão social e porte (arquivos Empresas) ─────────────────
async function construirMapaEmpresas(
  basicosBase: Set<string>,
): Promise<Map<string, { razao_social: string; porte: string | null }>> {
  console.log('\n── Fase 2: Arquivos Empresas ──')
  const mapa = new Map<string, { razao_social: string; porte: string | null }>()

  for (let idx = IDX_START; idx <= IDX_END; idx++) {
    const tmpPath = join(tmpdir(), `rfb-emp-${idx}.zip`)
    console.log(`\n  [Empresas${idx}]`)
    if (!await downloadComRetry(getUrls('Empresas', idx), tmpPath)) { console.log('  Pulado.'); continue }

    let n = 0
    await processarZip(tmpPath, (cols) => {
      const basico = cols[COL_EMP.BASICO]?.trim()
      if (!basico || !basicosBase.has(basico)) return
      const razao = cols[COL_EMP.RAZAO]?.trim()
      if (!razao) return
      const porte = PORTE_MAP[cols[COL_EMP.PORTE]?.trim()] ?? null
      mapa.set(basico, { razao_social: razao, porte })
      n++
    })
    console.log(`  ${n.toLocaleString('pt-BR')} empresas`)
    if (existsSync(tmpPath)) unlinkSync(tmpPath)
  }
  console.log(`  Total mapa Empresas: ${mapa.size.toLocaleString('pt-BR')}`)
  return mapa
}

// ── Fase 3: processa Estabelecimentos e enriquece em bulk ────────────────────
type UpdateRecord = {
  cnpj: string
  razao_social?: string; nome_fantasia?: string; situacao?: string
  cnae_codigo?: string; uf?: string; porte?: string; email?: string
}

async function enviarBatch(batch: UpdateRecord[]): Promise<number> {
  if (!batch.length) return 0
  const { data, error } = await supabase.rpc('enriquecer_bulk_rfb', { batch })
  if (error) { console.error(`  Erro RPC (${batch.length} rows): ${error.message}`); return 0 }
  return (data as number) ?? 0
}

async function processarEstabelecimentos(
  cnpjsBase: Set<string>,
  basicosBase: Set<string>,
  mapaEmpresas: Map<string, { razao_social: string; porte: string | null }>,
): Promise<void> {
  console.log('\n── Fase 3: Estabelecimentos → enriquecimento bulk ──')

  let totalAtualizados = 0
  let totalBatches     = 0

  for (let idx = IDX_START; idx <= IDX_END; idx++) {
    const tmpPath = join(tmpdir(), `rfb-est-${idx}.zip`)
    console.log(`\n  [Estabelecimentos${idx}]`)
    if (!await downloadComRetry(getUrls('Estabelecimentos', idx), tmpPath)) { console.log('  Pulado.'); continue }

    const lote: UpdateRecord[] = []
    let encontrados = 0

    await processarZip(tmpPath, (cols) => {
      if (cols.length < 28) return

      const basico = cols[COL.BASICO]?.trim()
      if (!basico || !basicosBase.has(basico)) return

      const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g, '')
      if (cnpj.length !== 14 || !cnpjsBase.has(cnpj)) return

      const empresa      = mapaEmpresas.get(basico)
      const situacao     = SITUACAO_MAP[cols[COL.SITUACAO]?.trim()] ?? null
      const cnae         = cols[COL.CNAE]?.trim().replace(/\D/g, '') || null
      const uf           = cols[COL.UF]?.trim() || null
      const nomeFantasia = cols[COL.NOME_FANTASIA]?.trim() || null
      const email        = validarEmail(cols[COL.EMAIL] ?? null)

      const update: UpdateRecord = { cnpj }
      if (empresa?.razao_social) update.razao_social = empresa.razao_social
      if (empresa?.porte)        update.porte        = empresa.porte
      if (situacao)              update.situacao      = situacao
      if (cnae)                  update.cnae_codigo   = cnae
      if (uf)                    update.uf            = uf
      if (nomeFantasia)          update.nome_fantasia = nomeFantasia
      if (email)                 update.email         = email

      lote.push(update)
      encontrados++
    })

    // Flush de todos os lotes acumulados do arquivo
    for (let i = 0; i < lote.length; i += BATCH_SIZE) {
      const atualizados = await enviarBatch(lote.slice(i, i + BATCH_SIZE))
      totalAtualizados += atualizados
      totalBatches++
      if (totalBatches % 50 === 0) {
        console.log(`  batch ${totalBatches} | atualizados=${totalAtualizados.toLocaleString('pt-BR')}`)
      }
    }

    console.log(`  Encontrados: ${encontrados.toLocaleString('pt-BR')} | Acumulado: ${totalAtualizados.toLocaleString('pt-BR')}`)
    if (existsSync(tmpPath)) unlinkSync(tmpPath)
  }

  console.log(`\n✓ Total atualizado: ${totalAtualizados.toLocaleString('pt-BR')} leads em ${totalBatches} batches`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Enriquecer Bulk RFB ===')
  console.log(`Arquivos: ${IDX_START}-${IDX_END} | Batch: ${BATCH_SIZE} linhas por RPC`)

  const t0 = Date.now()

  const { cnpjsBase, basicosBase } = await carregarCnpjsBase()
  if (!cnpjsBase.size) { console.error('Nenhum CNPJ na base.'); process.exit(1) }

  const mapaEmpresas = await construirMapaEmpresas(basicosBase)

  await processarEstabelecimentos(cnpjsBase, basicosBase, mapaEmpresas)

  console.log(`\n✓ Concluído em ${((Date.now() - t0) / 60000).toFixed(1)} minutos`)
}

main().catch(e => { console.error(e); process.exit(1) })
