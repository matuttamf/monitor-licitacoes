import { createServiceClient } from '@/lib/supabase/server'
import { LicitacaoRaw } from './types'

export async function salvarLicitacoes(licitacoes: LicitacaoRaw[]): Promise<number> {
  if (licitacoes.length === 0) return 0

  const supabase = await createServiceClient()

  // upsert com ignorar conflitos (fonte + numero_edital são unique)
  const { data, error } = await supabase
    .from('licitacoes')
    .upsert(licitacoes, { onConflict: 'fonte,numero_edital', ignoreDuplicates: true })
    .select('id')

  if (error) {
    console.error('Erro ao salvar licitações:', error.message)
    return 0
  }

  return data?.length ?? 0
}
