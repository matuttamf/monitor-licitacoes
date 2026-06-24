/**
 * Script local: recalcula cnae_rank em todos os leads de origem='cnae'
 * Processa por CNAE individual para evitar timeout (cada UPDATE atinge só 1 CNAE)
 *
 * Uso: npx tsx scripts/atualizar-cnae-rank.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
// Só carrega dotenv se vars ainda não foram injetadas pelo dotenvx
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  config({ path: '.env.local' })
  config()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  console.log('Calculando frequência de CNAEs...')

  // 1. Contar leads por cnae_codigo (só origem=cnae)
  const { data: contagens, error: errCount } = await supabase
    .from('leads')
    .select('cnae_codigo')
    .eq('origem', 'cnae')
    .not('cnae_codigo', 'is', null)

  if (errCount) { console.error('Erro ao contar:', errCount.message); process.exit(1) }

  // Agregar em memória
  const freq: Record<string, number> = {}
  for (const row of contagens ?? []) {
    const c = row.cnae_codigo as string
    freq[c] = (freq[c] ?? 0) + 1
  }

  // Ordenar do mais frequente para o menos
  const ranking = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([cnae], idx) => ({ cnae, rank: idx + 1 }))

  console.log(`${ranking.length} CNAEs distintos encontrados.`)

  // 2. Atualizar rank por CNAE individualmente
  let ok = 0
  let erros = 0
  for (const { cnae, rank } of ranking) {
    const { error } = await supabase
      .from('leads')
      .update({ cnae_rank: rank })
      .eq('cnae_codigo', cnae)
      .eq('origem', 'cnae')

    if (error) {
      console.error(`  Erro CNAE ${cnae}:`, error.message)
      erros++
    } else {
      ok++
      if (ok % 50 === 0) console.log(`  ${ok}/${ranking.length} CNAEs atualizados...`)
    }
  }

  console.log(`\n✓ Concluído: ${ok} CNAEs atualizados, ${erros} erros.`)
}

main().catch(e => { console.error(e); process.exit(1) })
