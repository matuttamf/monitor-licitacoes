/**
 * Script unificado: baixa arquivos da RFB, filtra por CNAE,
 * cruza razão social e enriquece e-mails, insere leads no Supabase.
 *
 * Chamado pelo GitHub Actions (workflow: coletar-leads-rfb.yml)
 * ou manualmente:
 *   npx tsx scripts/coletar-leads-rfb.ts          # índices 0-9, mês anterior
 *   npx tsx scripts/coletar-leads-rfb.ts 0 3
 *   npx tsx scripts/coletar-leads-rfb.ts 0 9 2026 5
 */

import { createClient } from '@supabase/supabase-js'
import { createWriteStream, existsSync, unlinkSync, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createInflateRaw } from 'node:zlib'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { config } from 'dotenv'
config({ path: '.env.local' })
config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const cliArgs  = process.argv.slice(2)
const IDX_START = Number(cliArgs[0] ?? 0)
const IDX_END   = Number(cliArgs[1] ?? 9)

function getAnoMes(): { ano: number; mes: number } {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}
const { ano: anoDefault, mes: mesDefault } = getAnoMes()
const ANO = Number(cliArgs[2] ?? anoDefault)
const MES = Number(cliArgs[3] ?? mesDefault)
const MES_PAD = String(MES).padStart(2, '0')

// URL pública do Nextcloud da Receita Federal
const RF_BASE = `https://arquivos.receitafederal.gov.br/public.php/dav/files/YggdBLfdninEJX9/${ANO}-${MES_PAD}`

const COL = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, SITUACAO: 5, CNAE: 11, UF: 19, MUNICIPIO: 20, EMAIL: 27 }
const COL_EMP = { BASICO: 0, RAZAO: 1 }

const CNAE_SEED = new Set([
  '4789005','6209100','8121400','4322301','4330404',
  '4744001','4771701','4754701','8111700','5250801',
])

// ── Validação de e-mail ───────────────────────────────────────────────────────
const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const DOMINIOS_INVALIDOS = new Set([
  'naotem.com','naopossui.com','sempossui.com','semcadastro.com',
  'naoinformado.com','naoconsta.com','inexistente.com','nenhum.com',
  'naodisponivel.com','nodomain.com','domain.com','test.com','example.com',
  'email.com','mail.com','fake.com','null.com','none.com',
])

function validarEmail(raw: string | null): string | null {
  if (!raw) return null
  const e = raw.trim().toLowerCase()
  if (!RE_EMAIL.test(e) || e.length > 100) return null
  const [, dominio] = e.split('@')
  if (DOMINIOS_INVALIDOS.has(dominio)) return null
  if (/\b(nao|sem|null|fake|none|test|dummy|exemplo)\b/.test(dominio)) return null
  return e
}

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function getTargetCnaes(): Promise<Set<string>> {
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

// ── Download com retry e Range ────────────────────────────────────────────────
async function downloadComRetry(url: string, tmpPath: string, tentativas = 5): Promise<boolean> {
  for (let t = 1; t <= tentativas; t++) {
    try {
      let bytesJaBaixados = 0
      if (existsSync(tmpPath)) {
        bytesJaBaixados = statSync(tmpPath).size
        if (bytesJaBaixados > 0) console.log(`  Retomando do byte ${bytesJaBaixados} (tentativa ${t})`)
      }
      const headers: Record<string,string> = { 'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)' }
      if (bytesJaBaixados > 0) headers['Range'] = `bytes=${bytesJaBaixados}-`

      const res = await fetch(url, { headers })
      if (!res.ok || !res.body) {
        console.error(`  HTTP ${res.status}`)
        if (t < tentativas) { await new Promise(r => setTimeout(r, 10000 * t)); continue }
        return false
      }
      if (t === 1) {
        const cl = res.headers.get('content-length')
        if (cl) console.log(`  Tamanho: ${(Number(cl) / 1024 / 1024).toFixed(0)} MB`)
      }
      const flags = bytesJaBaixados > 0 && res.status === 206 ? 'a' : 'w'
      const writer = createWriteStream(tmpPath, { flags })
      await pipeline(res.body as unknown as NodeJS.ReadableStream, writer)
      console.log(`  ✓ Download concluído`)
      return true
    } catch (e) {
      console.error(`  Tentativa ${t} falhou: ${e instanceof Error ? e.message : e}`)
      if (t < tentativas) await new Promise(r => setTimeout(r, 10000 * t))
    }
  }
  return false
}

// ── Processamento ZIP (stream local) ─────────────────────────────────────────
type OnLine = (cols: string[]) => void

async function processarZip(tmpPath: string, onLine: OnLine): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const inflate = createInflateRaw()
    const fileStream = require('node:fs').createReadStream(tmpPath)
    let headerBuf = Buffer.alloc(0)
    let headerParsed = false

    const startDeflate = (src: NodeJS.ReadableStream) => {
      inflate.on('error', reject)
      src.pipe(inflate)

      // Detecta separador (| ou ;) na primeira linha para compatibilidade
      // com todas as versões dos arquivos da RFB
      let sep = '|'
      let primeiraLinha = true

      const rl = createInterface({ input: inflate, crlfDelay: Infinity })
      rl.on('line', (line) => {
        if (primeiraLinha) {
          primeiraLinha = false
          // Conta ocorrências de cada separador candidato
          const contPipe  = (line.match(/\|/g) ?? []).length
          const contPonto = (line.match(/;/g)  ?? []).length
          sep = contPonto > contPipe ? ';' : '|'
          console.log(`  Separador detectado: "${sep}" (|=${contPipe} ;=${contPonto})`)
        }
        const cols = line.split(sep)
        if (cols.length >= 2) onLine(cols)
      })
      rl.on('close', resolve)
      rl.on('error', reject)
    }

    fileStream.on('data', (chunk: Buffer) => {
      if (headerParsed) return
      headerBuf = Buffer.concat([headerBuf, chunk])
      if (headerBuf.length >= 30) {
        const deflateStart = 30 + headerBuf.readUInt16LE(26) + headerBuf.readUInt16LE(28)
        if (headerBuf.length >= deflateStart) {
          headerParsed = true
          fileStream.pause()
          fileStream.removeAllListeners('data')
          const combined = new Readable({ read() {} })
          combined.push(headerBuf.slice(deflateStart))
          fileStream.on('data', (d: Buffer) => combined.push(d))
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

// ── Processamento por índice ──────────────────────────────────────────────────
type LeadRFB = { cnpj: string; email: string|null; uf: string|null; municipio: string|null; cnae: string }

async function coletarEstabelecimentos(tmpPath: string, targetCnaes: Set<string>): Promise<Map<string, LeadRFB>> {
  const leads = new Map<string, LeadRFB>()
  await processarZip(tmpPath, (cols) => {
    if (cols.length < 28) return
    if (cols[COL.MATFIL] !== '1') return
    if (cols[COL.SITUACAO] !== '02') return
    const cnae = cols[COL.CNAE].trim().replace(/\D/g,'')
    if (!targetCnaes.has(cnae)) return
    const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g,'')
    if (cnpj.length !== 14) return
    leads.set(cnpj.slice(0,8), {
      cnpj,
      email: validarEmail(cols[COL.EMAIL] ?? null),
      uf: cols[COL.UF]?.trim() || null,
      municipio: cols[COL.MUNICIPIO]?.trim() || null,
      cnae,
    })
  })
  return leads
}

async function enriquecerRazaoSocial(tmpPath: string, leads: Map<string, LeadRFB>): Promise<Map<string, string>> {
  const razoes = new Map<string, string>()
  await processarZip(tmpPath, (cols) => {
    const basico = cols[COL_EMP.BASICO]?.trim()
    if (!basico || !leads.has(basico)) return
    const razao = cols[COL_EMP.RAZAO]?.trim()
    if (razao) razoes.set(basico, razao)
  })
  return razoes
}

async function inserirLeads(leads: Map<string, LeadRFB>, razoes: Map<string, string>): Promise<{ inseridos: number; emailsEnriquecidos: number }> {
  const rows = Array.from(leads.values()).map(l => ({
    cnpj: l.cnpj,
    razao_social: razoes.get(l.cnpj.slice(0,8)) ?? l.cnpj,
    email: l.email,
    uf: l.uf,
    municipio: l.municipio,
    cnae_codigo: l.cnae,
    status: 'invalido' as const,
    situacao: null,
    origem: 'cnae' as const,
  }))

  // Insere novos leads sem sobrescrever existentes
  let inseridos = 0
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200)
    const { error } = await supabase.from('leads').upsert(batch, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += batch.length
    else console.error(`  Erro batch inserção ${i}: ${error.message}`)
  }

  // Enriquece e-mail de leads existentes que estão sem e-mail
  const comEmail = rows.filter(r => r.email)
  let emailsEnriquecidos = 0
  for (const r of comEmail) {
    const { error } = await supabase
      .from('leads')
      .update({ email: r.email })
      .eq('cnpj', r.cnpj)
      .or('email.is.null,email.eq.')
    if (!error) emailsEnriquecidos++
  }

  return { inseridos, emailsEnriquecidos }
}

// ── Pipeline por arquivo ──────────────────────────────────────────────────────
async function processarArquivo(idx: number, targetCnaes: Set<string>) {
  const tmpEst = join(tmpdir(), `rf-est-${idx}.zip`)
  const tmpEmp = join(tmpdir(), `rf-emp-${idx}.zip`)

  console.log(`\n╔═══ Arquivo ${idx}/${IDX_END} ════════════════════════════`)

  // 1. Download Estabelecimentos
  const urlEst = `${RF_BASE}/Estabelecimentos${idx}.zip`
  console.log(`  ↓ Estabelecimentos${idx}.zip`)
  if (!await downloadComRetry(urlEst, tmpEst)) { console.log('  ✗ Pulando.'); return }

  // 2. Filtra por CNAE
  console.log(`  ⚙ Filtrando por CNAE (${targetCnaes.size} códigos-alvo)...`)
  const t0 = Date.now()
  const leads = await coletarEstabelecimentos(tmpEst, targetCnaes)
  const emailsValidos = Array.from(leads.values()).filter(l => l.email).length
  console.log(`  → ${leads.size} leads | ${emailsValidos} com e-mail | ${((Date.now()-t0)/1000).toFixed(1)}s`)
  if (existsSync(tmpEst)) unlinkSync(tmpEst)

  if (!leads.size) { console.log('  Nenhum lead encontrado. Pulando Empresas.'); return }

  // 3. Download Empresas → razão social
  const urlEmp = `${RF_BASE}/Empresas${idx}.zip`
  console.log(`  ↓ Empresas${idx}.zip`)
  let razoes = new Map<string, string>()
  if (await downloadComRetry(urlEmp, tmpEmp)) {
    console.log(`  ⚙ Enriquecendo razão social...`)
    const t1 = Date.now()
    razoes = await enriquecerRazaoSocial(tmpEmp, leads)
    console.log(`  → ${razoes.size}/${leads.size} razões encontradas | ${((Date.now()-t1)/1000).toFixed(1)}s`)
    if (existsSync(tmpEmp)) unlinkSync(tmpEmp)
  }

  // 4. Inserção + enriquecimento de e-mail
  console.log(`  ⚙ Inserindo no Supabase...`)
  const { inseridos, emailsEnriquecidos } = await inserirLeads(leads, razoes)
  console.log(`  ✓ ${inseridos} inseridos | ${emailsEnriquecidos} e-mails enriquecidos em leads existentes`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log(`Monitor de Licitações — Coleta RFB`)
  console.log(`Período: ${ANO}-${MES_PAD} | Índices: ${IDX_START}–${IDX_END}`)
  console.log(`Fonte: ${RF_BASE}`)

  const targetCnaes = await getTargetCnaes()
  console.log(`CNAEs-alvo: ${targetCnaes.size}`)

  for (let i = IDX_START; i <= IDX_END; i++) {
    await processarArquivo(i, targetCnaes)
  }

  console.log('\n✓ Coleta concluída.')
}

main().catch(e => { console.error(e); process.exit(1) })
