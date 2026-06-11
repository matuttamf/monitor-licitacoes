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
import 'dotenv/config'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET        = 'rf-cnpj'

const args     = process.argv.slice(2)
const idxStart = Number(args[0] ?? 0)
const idxEnd   = Number(args[1] ?? 0)

function getAnoMes(): { ano: number; mes: number } {
  const d = new Date()
  d.setMonth(d.getMonth() - 2)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

const { ano, mes } = getAnoMes()
const anoFinal = Number(args[2] ?? ano)
const mesFinal = Number(args[3] ?? mes)
const mesPad   = String(mesFinal).padStart(2, '0')

async function uploadArquivo(fileIdx: number) {
  const rfUrl   = `https://dados.rfb.gov.br/CNPJ/dados_abertos_cnpj/${anoFinal}-${mesPad}/Estabelecimentos${fileIdx}.zip`
  const destKey = `${anoFinal}-${mesPad}/Estabelecimentos${fileIdx}.zip`
  const tmpPath = join(tmpdir(), `rf-estab-${fileIdx}.zip`)

  console.log(`\n[${fileIdx}] Baixando ${rfUrl}`)

  const res = await fetch(rfUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)' },
  })

  if (!res.ok || !res.body) {
    console.error(`  ✗ HTTP ${res.status} — arquivo não disponível`)
    return false
  }

  const contentLength = res.headers.get('content-length')
  if (contentLength) {
    const mb = (Number(contentLength) / 1024 / 1024).toFixed(1)
    console.log(`  Tamanho: ${mb} MB`)
  }

  // Salva em arquivo temporário
  const writer = createWriteStream(tmpPath)
  await pipeline(res.body as unknown as NodeJS.ReadableStream, writer)
  console.log(`  ✓ Download concluído → ${tmpPath}`)

  // Upload para Supabase Storage
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(destKey, createReadStream(tmpPath), {
      contentType: 'application/zip',
      upsert: true,
    })

  if (tmpPath && existsSync(tmpPath)) unlinkSync(tmpPath)

  if (error) {
    console.error(`  ✗ Erro no upload: ${error.message}`)
    return false
  }

  console.log(`  ✓ Upload concluído → ${BUCKET}/${destKey}`)
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

  console.log(`Período: ${anoFinal}-${mesPad} | Arquivos: ${idxStart}–${idxEnd}`)

  let ok = 0
  for (let i = idxStart; i <= idxEnd; i++) {
    const sucesso = await uploadArquivo(i)
    if (sucesso) ok++
  }

  console.log(`\nConcluído: ${ok}/${idxEnd - idxStart + 1} arquivo(s) enviados.`)
  console.log(`O cron coletar-leads-cnae já vai usar o Supabase Storage automaticamente.`)
}

main().catch(e => { console.error(e); process.exit(1) })
