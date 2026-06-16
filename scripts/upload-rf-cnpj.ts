/**
 * Script local: baixa arquivos de Estabelecimentos da Receita Federal
 * e envia para o Supabase Storage (bucket "rf-cnpj").
 *
 * Pré-requisitos:
 *   npm install -D tsx @supabase/supabase-js dotenv
 *
 * Uso:
 *   npx tsx scripts/upload-rf-cnpj.ts          # baixa arquivo 0 do mês atual
 *   npx tsx scripts/upload-rf-cnpj.ts 0 9      # arquivos 0 a 9
 *   npx tsx scripts/upload-rf-cnpj.ts 0 9 2026 4  # mês específico
 */

import { createClient } from '@supabase/supabase-js'
import { createWriteStream, createReadStream, existsSync, unlinkSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { config } from 'dotenv'
config({ path: '.env.local' })
config() // fallback .env

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET        = 'rf-cnpj'

const args     = process.argv.slice(2)
const idxStart = Number(args[0] ?? 0)
const idxEnd   = Number(args[1] ?? 0)

const RF_NEXTCLOUD_BASE = 'https://arquivos.receitafederal.gov.br/index.php/s/YggdBLfdninEJX9'

function getAnoMes(): { ano: number; mes: number } {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

const { ano, mes } = getAnoMes()
const anoFinal = Number(args[2] ?? ano)
const mesFinal = Number(args[3] ?? mes)
const mesPad   = String(mesFinal).padStart(2, '0')

async function downloadComRetry(rfUrl: string, tmpPath: string, tentativas = 3): Promise<boolean> {
  for (let t = 1; t <= tentativas; t++) {
    try {
      // Verifica se já tem download parcial para usar Range
      let bytesJaBaixados = 0
      if (existsSync(tmpPath)) {
        const { statSync } = await import('node:fs')
        bytesJaBaixados = statSync(tmpPath).size
        if (bytesJaBaixados > 0) console.log(`  Retomando do byte ${bytesJaBaixados} (tentativa ${t}/${tentativas})`)
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
      }
      if (bytesJaBaixados > 0) headers['Range'] = `bytes=${bytesJaBaixados}-`

      const res = await fetch(rfUrl, { headers })

      if (!res.ok || !res.body) {
        console.error(`  ✗ HTTP ${res.status}`)
        if (t < tentativas) { await new Promise(r => setTimeout(r, 5000 * t)); continue }
        return false
      }

      if (t === 1) {
        const contentLength = res.headers.get('content-length')
        if (contentLength) console.log(`  Tamanho: ${(Number(contentLength) / 1024 / 1024).toFixed(1)} MB`)
      }

      // Append se retomando, write se novo
      const flags = bytesJaBaixados > 0 && res.status === 206 ? 'a' : 'w'
      const writer = createWriteStream(tmpPath, { flags })
      await pipeline(res.body as unknown as NodeJS.ReadableStream, writer)
      console.log(`  ✓ Download concluído`)
      return true
    } catch (e) {
      console.error(`  ✗ Tentativa ${t}/${tentativas} falhou: ${e instanceof Error ? e.message : e}`)
      if (t < tentativas) {
        const espera = 10000 * t
        console.log(`  Aguardando ${espera / 1000}s antes de tentar novamente…`)
        await new Promise(r => setTimeout(r, espera))
      }
    }
  }
  return false
}

async function uploadArquivo(tipo: 'Estabelecimentos' | 'Empresas', fileIdx: number) {
  const rfUrl   = `https://arquivos.receitafederal.gov.br/public.php/dav/files/YggdBLfdninEJX9/${anoFinal}-${mesPad}/${tipo}${fileIdx}.zip`
  const destKey = `${tipo}${fileIdx}.zip`
  const tmpPath = join(tmpdir(), `rf-${tipo.toLowerCase()}-${fileIdx}.zip`)

  console.log(`\n[${tipo}${fileIdx}] Baixando ${rfUrl}`)

  const ok = await downloadComRetry(rfUrl, tmpPath, 5)
  if (!ok) {
    if (existsSync(tmpPath)) unlinkSync(tmpPath)
    return false
  }

  // Upload para Supabase Storage
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  console.log(`  Enviando para Storage…`)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(destKey, createReadStream(tmpPath), {
      contentType: 'application/zip',
      upsert: true,
    })

  if (existsSync(tmpPath)) unlinkSync(tmpPath)

  if (error) {
    console.error(`  ✗ Erro no upload: ${error.message}`)
    return false
  }

  console.log(`  ✓ Upload concluído → ${BUCKET}/${destKey}`)
  return true
}

async function uploadMunicipios() {
  const urls = [
    `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/Municipios.zip`,
    `https://arquivos.receitafederal.gov.br/public.php/dav/files/YggdBLfdninEJX9/${anoFinal}-${mesPad}/Municipios.zip`,
  ]
  const tmpPath = join(tmpdir(), 'rf-municipios.zip')

  console.log(`\n[Municipios] Tentando baixar tabela IBGE…`)
  let baixado = false
  for (const url of urls) {
    console.log(`  Tentando: ${url}`)
    if (await downloadComRetry(url, tmpPath, 3)) { baixado = true; break }
    if (existsSync(tmpPath)) unlinkSync(tmpPath)
  }
  if (!baixado) { console.warn('  ✗ Municipios.zip indisponível — pulando'); return false }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload('Municipios.zip', createReadStream(tmpPath), { contentType: 'application/zip', upsert: true })

  if (existsSync(tmpPath)) unlinkSync(tmpPath)
  if (error) { console.error(`  ✗ Erro no upload: ${error.message}`); return false }
  console.log(`  ✓ Upload concluído → ${BUCKET}/Municipios.zip`)
  return true
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
  }

  // Garante que o bucket existe
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, { public: true })
  if (bucketErr && !bucketErr.message.includes('already exists')) {
    console.error('Erro ao criar bucket:', bucketErr.message)
    process.exit(1)
  }

  console.log(`Período: ${anoFinal}-${mesPad} | Arquivos: ${idxStart}–${idxEnd} (Estabelecimentos + Empresas)`)

  // Municipios.zip primeiro (pequeno, necessário para resolução de nomes)
  await uploadMunicipios()

  const total = (idxEnd - idxStart + 1) * 2
  let ok = 0
  for (let i = idxStart; i <= idxEnd; i++) {
    if (await uploadArquivo('Estabelecimentos', i)) ok++
    if (await uploadArquivo('Empresas', i)) ok++
  }

  console.log(`\nConcluído: ${ok}/${total} arquivo(s) enviados.`)
}

main().catch(e => { console.error(e); process.exit(1) })
