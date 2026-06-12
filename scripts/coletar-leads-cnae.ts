/**
 * Script local: processa arquivos de Estabelecimentos/Empresas da RFB
 * já enviados ao Supabase Storage e insere leads filtrados por CNAE.
 *
 * Pré-requisito: rodar scripts/upload-rf-cnpj.ts antes.
 *
 * Uso:
 *   npx tsx scripts/coletar-leads-cnae.ts          # processa todos (0-9)
 *   npx tsx scripts/coletar-leads-cnae.ts 0 3      # processa índices 0 a 3
 */

import { createClient } from '@supabase/supabase-js'
import { createWriteStream, createReadStream, existsSync, unlinkSync, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createInflateRaw } from 'node:zlib'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createInterface } from 'node:readline'
import { config } from 'dotenv'
config({ path: '.env.local' })
config()

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET        = 'rf-cnpj'

const args     = process.argv.slice(2)
const idxStart = Number(args[0] ?? 0)
const idxEnd   = Number(args[1] ?? 9)

const COL = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, SITUACAO: 5, CNAE: 11, UF: 19, MUNICIPIO: 20, EMAIL: 27 }
const COL_EMP = { BASICO: 0, RAZAO: 1 }

// Domínios genéricos/descartáveis que a RFB não aceita como e-mails reais
const DOMINIOS_INVALIDOS = new Set([
  'naotem.com','naopossui.com','sempossui.com','semcadastro.com',
  'naoinformado.com','naoconsta.com','inexistente.com','nenhum.com',
  'naodisponivel.com','nodomain.com','domain.com','test.com','example.com',
  'email.com','mail.com','fake.com','null.com','none.com',
])

const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

function validarEmail(email: string | null): string | null {
  if (!email) return null
  const e = email.trim().toLowerCase()
  if (!RE_EMAIL.test(e)) return null
  if (e.length > 100) return null
  const [, dominio] = e.split('@')
  if (DOMINIOS_INVALIDOS.has(dominio)) return null
  // Rejeita strings com "nao", "sem", "null", "fake" no domínio
  if (/\b(nao|sem|null|fake|none|test|dummy|exemplo)\b/.test(dominio)) return null
  return e
}

const CNAE_SEED = new Set([
  '4789005','6209100','8121400','4322301','4330404',
  '4744001','4771701','4754701','8111700','5250801',
])

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function getTargetCnaes(): Promise<Set<string>> {
  const { data } = await supabase.from('leads').select('cnae_codigo').not('cnae_codigo', 'is', null).limit(5000)
  const rows = (data ?? []) as { cnae_codigo: string | null }[]
  if (!rows.length) return CNAE_SEED
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const code = String(r.cnae_codigo).replace(/\D/g, '').slice(0, 7)
    if (code.length >= 4) counts[code] = (counts[code] ?? 0) + 1
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 50).map(([c]) => c)
  return top.length ? new Set(top) : CNAE_SEED
}

async function downloadStorage(tipo: string, fileIdx: number, tmpPath: string): Promise<boolean> {
  const storageKey = `${tipo}${fileIdx}.zip`

  // Verifica se já existe localmente
  if (existsSync(tmpPath)) {
    const size = statSync(tmpPath).size
    if (size > 1024 * 1024) {
      console.log(`  Usando cache local (${(size / 1024 / 1024).toFixed(0)} MB)`)
      return true
    }
  }

  console.log(`  Baixando ${storageKey} do Storage...`)
  const { data, error } = await supabase.storage.from(BUCKET).download(storageKey)
  if (error || !data) {
    console.error(`  ✗ Não encontrado no Storage: ${storageKey}`)
    return false
  }

  const buf = Buffer.from(await data.arrayBuffer())
  const { writeFileSync } = await import('node:fs')
  writeFileSync(tmpPath, buf)
  console.log(`  ✓ ${(buf.length / 1024 / 1024).toFixed(0)} MB`)
  return true
}

async function processarEstabelecimentos(
  tmpPath: string,
  targetCnaes: Set<string>,
): Promise<Map<string, { cnpj: string; email: string|null; uf: string|null; municipio: string|null; cnae: string }>> {
  const leads = new Map<string, { cnpj: string; email: string|null; uf: string|null; municipio: string|null; cnae: string }>()

  await new Promise<void>((resolve, reject) => {
    const inflate = createInflateRaw()
    const fileStream = createReadStream(tmpPath)
    let headerBuffer = Buffer.alloc(0)
    let headerParsed = false

    const processDeflate = (deflateStream: NodeJS.ReadableStream) => {
      inflate.on('error', reject)
      deflateStream.pipe(inflate)

      let sep = '|'
      let primeiraLinha = true
      const rl = createInterface({ input: inflate, crlfDelay: Infinity })
      rl.on('line', (line) => {
        if (primeiraLinha) {
          primeiraLinha = false
          sep = (line.match(/;/g) ?? []).length > (line.match(/\|/g) ?? []).length ? ';' : '|'
        }
        const cols = line.split(sep)
        if (cols.length < 28) return
        if (cols[COL.MATFIL] !== '1') return
        if (cols[COL.SITUACAO] !== '02') return
        const cnae = cols[COL.CNAE].trim().replace(/\D/g, '')
        if (!targetCnaes.has(cnae)) return
        const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g, '')
        if (cnpj.length !== 14) return
        leads.set(cnpj.slice(0, 8), {
          cnpj,
          email: validarEmail(cols[COL.EMAIL] ?? null),
          uf: cols[COL.UF]?.trim() || null,
          municipio: cols[COL.MUNICIPIO]?.trim() || null,
          cnae,
        })
      })
      rl.on('close', resolve)
      rl.on('error', reject)
    }

    fileStream.on('data', (chunk: Buffer | string) => {
      if (headerParsed) return  // já processando via pipe
      headerBuffer = Buffer.concat([headerBuffer, chunk])
      if (headerBuffer.length >= 30) {
        const fnameLen = headerBuffer.readUInt16LE(26)
        const extraLen = headerBuffer.readUInt16LE(28)
        const deflateStart = 30 + fnameLen + extraLen
        if (headerBuffer.length >= deflateStart) {
          headerParsed = true
          fileStream.pause()
          fileStream.removeAllListeners('data')

          // Cria stream a partir do ponto de início do DEFLATE
          const { Readable } = require('node:stream')
          const combined = new Readable({ read() {} })
          combined.push(headerBuffer.slice(deflateStart))
          fileStream.on('data', (d: Buffer) => combined.push(d))
          fileStream.on('end', () => combined.push(null))
          fileStream.on('error', (e: Error) => combined.destroy(e))
          fileStream.resume()
          processDeflate(combined)
        }
      }
    })
    fileStream.on('error', reject)
  })

  return leads
}

async function enriquecerEmpresasRazaoSocial(
  tmpPath: string,
  leads: Map<string, { cnpj: string; email: string|null; uf: string|null; municipio: string|null; cnae: string }>,
): Promise<Map<string, string>> {
  const razoes = new Map<string, string>()
  let encontrados = 0

  await new Promise<void>((resolve, reject) => {
    const inflate = createInflateRaw()
    const fileStream = createReadStream(tmpPath)
    let headerBuffer = Buffer.alloc(0)
    let headerParsed = false

    const processDeflate = (deflateStream: NodeJS.ReadableStream) => {
      inflate.on('error', reject)
      deflateStream.pipe(inflate)

      let sepEmp = '|'
      let primeiraLinhaEmp = true
      const rl = createInterface({ input: inflate, crlfDelay: Infinity })
      rl.on('line', (line) => {
        if (primeiraLinhaEmp) {
          primeiraLinhaEmp = false
          sepEmp = (line.match(/;/g) ?? []).length > (line.match(/\|/g) ?? []).length ? ';' : '|'
        }
        if (encontrados >= leads.size) { rl.close(); return }
        const firstSep = line.indexOf(sepEmp)
        if (firstSep === -1) return
        const cnpjBasico = line.slice(0, firstSep).trim()
        if (leads.has(cnpjBasico)) {
          const cols = line.split(sepEmp)
          const razao = cols[COL_EMP.RAZAO]?.trim()
          if (razao) { razoes.set(cnpjBasico, razao); encontrados++ }
        }
      })
      rl.on('close', resolve)
      rl.on('error', reject)
    }

    fileStream.on('data', (chunk: Buffer | string) => {
      if (headerParsed) return
      headerBuffer = Buffer.concat([headerBuffer, chunk])
      if (headerBuffer.length >= 30) {
        const fnameLen = headerBuffer.readUInt16LE(26)
        const extraLen = headerBuffer.readUInt16LE(28)
        const deflateStart = 30 + fnameLen + extraLen
        if (headerBuffer.length >= deflateStart) {
          headerParsed = true
          fileStream.pause()
          fileStream.removeAllListeners('data')
          const { Readable } = require('node:stream')
          const combined = new Readable({ read() {} })
          combined.push(headerBuffer.slice(deflateStart))
          fileStream.on('data', (d: Buffer) => combined.push(d))
          fileStream.on('end', () => combined.push(null))
          fileStream.on('error', (e: Error) => combined.destroy(e))
          fileStream.resume()
          processDeflate(combined)
        }
      }
    })
    fileStream.on('error', reject)
  })

  return razoes
}

type LeadData = { cnpj: string; email: string|null; uf: string|null; municipio: string|null; cnae: string }

async function inserirLeads(
  leads: Map<string, LeadData>,
  razoes: Map<string, string>,
): Promise<{ inseridos: number; emailsNovos: number; emailsEnriquecidos: number }> {
  const rows = Array.from(leads.values()).map(l => ({
    cnpj: l.cnpj,
    razao_social: razoes.get(l.cnpj.slice(0, 8)) ?? l.cnpj,
    email: l.email,
    uf: l.uf,
    municipio: l.municipio,
    cnae_codigo: l.cnae,
    status: 'invalido' as const,
    situacao: null,
    origem: 'cnae' as const,
  }))

  // Insere novos leads (ignora duplicatas — não sobrescreve registros existentes)
  let inseridos = 0
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200)
    const { error } = await supabase.from('leads').upsert(batch, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += batch.length
    else console.error(`  Erro no batch ${i}: ${error.message}`)
  }

  // Enriquece e-mail de leads existentes que não têm e-mail
  // — usa RFB como fonte de verdade para e-mails válidos
  const comEmail = rows.filter(r => r.email)
  let emailsEnriquecidos = 0
  for (let i = 0; i < comEmail.length; i += 200) {
    const batch = comEmail.slice(i, i + 200)
    // UPDATE leads SET email = $email WHERE cnpj = $cnpj AND (email IS NULL OR email = '')
    for (const r of batch) {
      const { error } = await supabase
        .from('leads')
        .update({ email: r.email })
        .eq('cnpj', r.cnpj)
        .or('email.is.null,email.eq.')
      if (!error) emailsEnriquecidos++
    }
  }

  const emailsNovos = rows.filter(r => r.email).length
  return { inseridos, emailsNovos, emailsEnriquecidos }
}

async function processarArquivo(idx: number, targetCnaes: Set<string>) {
  const tmpEst = join(tmpdir(), `rf-estabelecimentos-${idx}.zip`)
  const tmpEmp = join(tmpdir(), `rf-empresas-${idx}.zip`)

  console.log(`\n=== Arquivo ${idx} ===`)

  // Download Estabelecimentos
  const okEst = await downloadStorage('Estabelecimentos', idx, tmpEst)
  if (!okEst) return

  console.log(`  Processando Estabelecimentos${idx} (filtrando por CNAE)...`)
  const t0 = Date.now()
  const leads = await processarEstabelecimentos(tmpEst, targetCnaes)
  console.log(`  Encontrados: ${leads.size} leads em ${((Date.now() - t0) / 1000).toFixed(1)}s`)

  // Download e enriquecimento Empresas
  let razoes = new Map<string, string>()
  const okEmp = await downloadStorage('Empresas', idx, tmpEmp)
  if (okEmp) {
    console.log(`  Enriquecendo razão social via Empresas${idx}...`)
    const t1 = Date.now()
    razoes = await enriquecerEmpresasRazaoSocial(tmpEmp, leads)
    console.log(`  Razões encontradas: ${razoes.size}/${leads.size} em ${((Date.now() - t1) / 1000).toFixed(1)}s`)
  }

  // Inserir no banco + enriquecimento de e-mail
  if (leads.size > 0) {
    const comEmail = Array.from(leads.values()).filter(l => l.email).length
    console.log(`  Leads com e-mail válido: ${comEmail}/${leads.size} (${((comEmail/leads.size)*100).toFixed(1)}%)`)
    console.log(`  Inserindo no Supabase + enriquecendo e-mails...`)
    const { inseridos, emailsNovos, emailsEnriquecidos } = await inserirLeads(leads, razoes)
    console.log(`  ✓ ${inseridos} inseridos | ${emailsNovos} e-mails novos | ${emailsEnriquecidos} e-mails enriquecidos em leads existentes`)
  }

  // Limpa arquivos temporários
  if (existsSync(tmpEst)) unlinkSync(tmpEst)
  if (existsSync(tmpEmp)) unlinkSync(tmpEmp)
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
  }

  console.log(`Coletando leads da RFB — índices ${idxStart} a ${idxEnd}`)
  console.log('Carregando CNAEs-alvo...')
  const targetCnaes = await getTargetCnaes()
  console.log(`CNAEs-alvo: ${targetCnaes.size}`)

  for (let i = idxStart; i <= idxEnd; i++) {
    await processarArquivo(i, targetCnaes)
  }

  console.log('\n✓ Concluído.')
}

main().catch(e => { console.error(e); process.exit(1) })
