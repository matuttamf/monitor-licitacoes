import { createServiceClient } from '@/lib/supabase/server'
import { LicitacaoRaw } from './types'

const LOTE = 500

export async function salvarLicitacoes(licitacoes: LicitacaoRaw[]): Promise<number> {
  if (licitacoes.length === 0) return 0

  const supabase = await createServiceClient()

  const normalizadas = licitacoes.map(l => ({
    ...l,
    numero_edital: l.numero_edital ?? l.external_id ?? `${l.fonte}-${Date.now()}-${Math.random()}`,
    cidade: l.cidade ?? l.municipio ?? null,
    external_id: undefined,
    municipio: undefined,
    titulo: undefined,
  }))

  // Conta total antes do upsert para calcular novas inserções
  const { count: antes } = await supabase
    .from('licitacoes')
    .select('id', { count: 'exact', head: true })

  // Upsert em lotes de 500 para evitar limite de payload do Supabase
  let erros = 0
  let primeiroErro: string | null = null
  for (let i = 0; i < normalizadas.length; i += LOTE) {
    const lote = normalizadas.slice(i, i + LOTE)
    const { error } = await supabase
      .from('licitacoes')
      .upsert(lote, { onConflict: 'fonte,numero_edital', ignoreDuplicates: false })
    if (error) {
      console.error(`Erro ao salvar lote ${i}-${i + lote.length}:`, error.message, JSON.stringify(lote[0]))
      primeiroErro = error.message
      erros++
    }
  }

  if (erros === Math.ceil(normalizadas.length / LOTE)) {
    throw new Error(`Todos os lotes falharam: ${primeiroErro}`)
  }

  const { count: depois } = await supabase
    .from('licitacoes')
    .select('id', { count: 'exact', head: true })

  const novas = Math.max(0, (depois ?? 0) - (antes ?? 0))
  console.log(`salvarLicitacoes: ${normalizadas.length} processadas, ${novas} novas (${erros} lotes com erro)`)
  return novas
}
