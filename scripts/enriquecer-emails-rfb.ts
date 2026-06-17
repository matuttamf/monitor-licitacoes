/**
 * Script local: enriquece e-mails de TODOS os leads no banco usando arquivos
 * de Estabelecimentos da RFB que estão no Supabase Storage.
 *
 * Útil para leads coletados via outros caminhos (participantes, transparência)
 * que não têm e-mail preenchido.
 *
 * Uso:
 *   npx tsx scripts/enriquecer-emails-rfb.ts          # arquivos 0-9
 *   npx tsx scripts/enriquecer-emails-rfb.ts 0 3
 */

import { createClient } from '@supabase/supabase-js'
import { createReadStream, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createInflateRaw } from 'node:zlib'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { config } from 'dotenv'
config({ path: '.env.local' })
config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'rf-cnpj'

const args     = process.argv.slice(2)
// Modos: --prepare (só exporta cache), --from-cache (usa cache do Storage)
const MODE       = args.includes('--prepare') ? 'prepare' : 'normal'
const FROM_CACHE = args.includes('--from-cache')
const numArgs    = args.filter(a => !a.startsWith('--'))
const idxStart   = Number(numArgs[0] ?? 0)
const idxEnd     = Number(numArgs[1] ?? 9)

const CACHE_FILE   = 'cnpjs-sem-email.json'
const MAX_POR_RUN  = 200_000   // limite de CNPJs processados por execução
const UPDATE_CONC  = 20        // updates paralelos simultâneos

// Índices fixos usados como fallback se o cabeçalho não for encontrado
const COL_EST_FALLBACK = { BASICO: 0, ORDEM: 1, DV: 2, EMAIL: 27 }

function detectarColunas(headerCols: string[]): typeof COL_EST_FALLBACK {
  const norm = (s: string) => s.toUpperCase().replace(/[\s_\-]/g, '')
  const col: Record<string, number> = {}
  headerCols.forEach((name, idx) => { col[norm(name)] = idx })

  const find = (...candidates: string[]) => {
    for (const c of candidates) { const idx = col[norm(c)]; if (idx !== undefined) return idx }
    return undefined
  }

  return {
    BASICO: find('CNPJBASICO', 'NUBASICO', 'BASICO')          ?? COL_EST_FALLBACK.BASICO,
    ORDEM:  find('CNPJORDEM',  'NUORDEM',  'ORDEM')           ?? COL_EST_FALLBACK.ORDEM,
    DV:     find('CNPJDV',     'NUDV',     'DV')              ?? COL_EST_FALLBACK.DV,
    EMAIL:  find('CORREIOELETRONICO', 'EMAIL', 'NOEMAIL')     ?? COL_EST_FALLBACK.EMAIL,
  }
}

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

const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const DOMINIOS_INVALIDOS = new Set([
  'naotem.com','naopossui.com','sempossui.com','semcadastro.com',
  'naoinformado.com','naoconsta.com','inexistente.com','nenhum.com',
  'naodisponivel.com','nodomain.com','domain.com','test.com','example.com',
  'email.com','mail.com','fake.com','null.com','none.com',
])

function validarEmail(email: string | null): string | null {
  if (!email) return null
  const e = email.trim().toLowerCase()
  if (!RE_EMAIL.test(e)) return null
  if (e.length > 100) return null
  const [, dominio] = e.split('@')
  if (DOMINIOS_INVALIDOS.has(dominio)) return null
  if (/\b(nao|sem|null|fake|none|test|dummy|exemplo)\b/.test(dominio)) return null
  return e
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Carrega do banco (lento — só usado no modo --prepare)
async function carregarCnpjsSemEmailDoBanco(limite = MAX_POR_RUN): Promise<Set<string>> {
  const cnpjs = new Set<string>()
  let lastId = '00000000-0000-0000-0000-000000000000'
  let errosConsecutivos = 0
  while (cnpjs.size < limite) {
    const { data, error } = await supabase.rpc('get_cnpjs_sem_email_page', { last_id: lastId, page_size: 1000 })
    if (error) {
      errosConsecutivos++
      console.error(`Erro ao carregar (tentativa ${errosConsecutivos}): ${error.message}`)
      if (errosConsecutivos >= 5) break
      await new Promise(r => setTimeout(r, 5000 * errosConsecutivos))
      continue
    }
    errosConsecutivos = 0
    if (!data?.length) break
    for (const r of data) cnpjs.add((r.cnpj as string).slice(0, 8))
    lastId = data[data.length - 1].id as string
    if (data.length < 1000) break
    if (cnpjs.size % 50_000 < 1000) console.log(`  ${cnpjs.size.toLocaleString('pt-BR')} carregados...`)
  }
  if (cnpjs.size >= limite) console.log(`  Limite de ${limite.toLocaleString('pt-BR')} CNPJs atingido — próximo run continuará de onde parou.`)
  return cnpjs
}

// Salva lista de CNPJs básicos no Storage como JSON (etapa de preparação)
async function salvarCacheNoStorage(cnpjs: Set<string>): Promise<void> {
  const json = JSON.stringify([...cnpjs])
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(CACHE_FILE, new Blob([json], { type: 'application/json' }), { upsert: true })
  if (error) throw new Error(`Erro ao salvar cache: ${error.message}`)
  console.log(`Cache salvo: ${CACHE_FILE} (${(json.length / 1024 / 1024).toFixed(1)} MB, ${cnpjs.size.toLocaleString('pt-BR')} CNPJs)`)
}

// Baixa cache do Storage (rápido — usado nas fases de e-mail)
async function carregarCnpjsDoCache(): Promise<Set<string>> {
  console.log(`Baixando cache ${CACHE_FILE} do Storage...`)
  const { data, error } = await supabase.storage.from(BUCKET).download(CACHE_FILE)
  if (error || !data) throw new Error(`Cache não encontrado. Execute --prepare primeiro. ${error?.message ?? ''}`)
  const arr: string[] = JSON.parse(await data.text())
  console.log(`Cache carregado: ${arr.length.toLocaleString('pt-BR')} CNPJs básicos`)
  return new Set(arr)
}

async function downloadStorage(fileIdx: number, tmpPath: string): Promise<boolean> {
  if (existsSync(tmpPath)) {
    console.log(`  Usando cache local`)
    return true
  }
  console.log(`  Baixando Estabelecimentos${fileIdx}.zip do Storage...`)
  const { data, error } = await supabase.storage.from(BUCKET).download(`Estabelecimentos${fileIdx}.zip`)
  if (error || !data) { console.error(`  ✗ ${error?.message ?? 'não encontrado'}`); return false }
  writeFileSync(tmpPath, Buffer.from(await data.arrayBuffer()))
  return true
}

async function extrairEmailsDoArquivo(
  tmpPath: string,
  cnpjsAlvo: Set<string>,
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>() // cnpj_14 → email

  await new Promise<void>((resolve, reject) => {
    const inflate = createInflateRaw()
    const fileStream = createReadStream(tmpPath)
    let headerBuf = Buffer.alloc(0)
    let headerParsed = false

    const processDeflate = (src: NodeJS.ReadableStream) => {
      inflate.on('error', reject)
      src.pipe(inflate)
      let sep = '|'
      let primeiraLinha = true
      let COL_EST = COL_EST_FALLBACK
      const rl = createInterface({ input: inflate, crlfDelay: Infinity })
      rl.on('line', (line) => {
        if (primeiraLinha) {
          primeiraLinha = false
          sep = (line.match(/;/g) ?? []).length > (line.match(/\|/g) ?? []).length ? ';' : '|'
          const headerCols = parseCSVLine(line, sep)
          COL_EST = detectarColunas(headerCols)
          console.log(`  Separador: "${sep}" | Colunas: BASICO=${COL_EST.BASICO} ORDEM=${COL_EST.ORDEM} DV=${COL_EST.DV} EMAIL=${COL_EST.EMAIL}`)
          return // pula a linha de cabeçalho
        }
        const cols = parseCSVLine(line, sep)
        if (cols.length <= COL_EST.EMAIL) return
        const cnpjBasico = cols[COL_EST.BASICO]?.trim()
        if (!cnpjBasico || !cnpjsAlvo.has(cnpjBasico)) return
        const email = validarEmail(cols[COL_EST.EMAIL] ?? null)
        if (!email) return
        const cnpj = (cols[COL_EST.BASICO] + cols[COL_EST.ORDEM] + cols[COL_EST.DV]).replace(/\D/g, '')
        if (cnpj.length === 14) mapa.set(cnpj, email)
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
          processDeflate(combined)
        }
      }
    })
    fileStream.on('error', reject)
  })

  return mapa
}

async function atualizarEmails(emailMap: Map<string, string>): Promise<number> {
  let atualizados = 0
  const entries = Array.from(emailMap.entries())

  // Semáforo simples para limitar concorrência
  async function comConcorrencia<T>(itens: T[], conc: number, fn: (item: T) => Promise<void>) {
    let idx = 0
    async function worker() {
      while (idx < itens.length) {
        const i = idx++
        await fn(itens[i])
      }
    }
    await Promise.all(Array.from({ length: Math.min(conc, itens.length) }, worker))
  }

  await comConcorrencia(entries, UPDATE_CONC, async ([cnpj, email]) => {
    const { error } = await supabase
      .from('leads')
      .update({ email, status: 'pendente', email_tentativas: 0 })
      .eq('cnpj', cnpj)
      .or('email.is.null,email.eq.')
      .not('razao_social', 'is', null)
      .not('razao_social', 'match', '^\\d+$')
      .not('municipio', 'is', null)
      .or('cnae.not.is.null,cnae_codigo.not.is.null')
    if (!error) atualizados++
  })

  return atualizados
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
  }

  // ── Modo preparação: carrega do banco e salva cache no Storage ──────────────
  if (MODE === 'prepare') {
    console.log('Carregando CNPJs sem e-mail no banco...')
    const semEmail = await carregarCnpjsSemEmailDoBanco()
    console.log(`Total: ${semEmail.size.toLocaleString('pt-BR')} CNPJs sem e-mail`)
    if (!semEmail.size) { console.log('Nenhum lead sem e-mail. Nada a fazer.'); return }
    await salvarCacheNoStorage(semEmail)
    console.log('✓ Cache pronto. Execute as fases de e-mail com --from-cache.')
    return
  }

  // ── Modo normal: carrega lista do cache (rápido) ou do banco (fallback) ─────
  const semEmail = FROM_CACHE
    ? await carregarCnpjsDoCache()
    : await (async () => {
        console.log('Carregando CNPJs sem e-mail no banco...')
        return carregarCnpjsSemEmailDoBanco()
      })()

  console.log(`Total de leads sem e-mail: ${semEmail.size.toLocaleString('pt-BR')}`)
  if (!semEmail.size) { console.log('Nenhum lead sem e-mail. Nada a fazer.'); return }

  let totalAtualizados = 0

  for (let i = idxStart; i <= idxEnd; i++) {
    const tmpPath = join(tmpdir(), `rf-estabelecimentos-${i}.zip`)
    console.log(`\n=== Estabelecimentos${i} ===`)

    const ok = await downloadStorage(i, tmpPath)
    if (!ok) continue

    console.log(`  Extraindo e-mails para ${semEmail.size.toLocaleString('pt-BR')} CNPJs-alvo...`)
    const t0 = Date.now()
    const emailMap = await extrairEmailsDoArquivo(tmpPath, semEmail)
    console.log(`  Encontrados: ${emailMap.size} e-mails válidos em ${((Date.now()-t0)/1000).toFixed(1)}s`)

    if (emailMap.size > 0) {
      console.log(`  Atualizando banco...`)
      const atualizados = await atualizarEmails(emailMap)
      console.log(`  ✓ ${atualizados} leads atualizados com e-mail`)
      totalAtualizados += atualizados
      for (const cnpj of emailMap.keys()) semEmail.delete(cnpj.slice(0, 8))
    }

    if (!semEmail.size) { console.log('\nTodos os leads enriquecidos!'); break }
  }

  console.log(`\n✓ Concluído. Total de leads enriquecidos com e-mail: ${totalAtualizados}`)
}

main().catch(e => { console.error(e); process.exit(1) })
