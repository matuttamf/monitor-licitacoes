import { createServiceClient } from '@/lib/supabase/server'
import { LicitacaoRaw } from './types'

export async function salvarLicitacoes(licitacoes: LicitacaoRaw[]): Promise<number> {
  if (licitacoes.length === 0) return 0

  const supabase = await createServiceClient()

  // Normaliza: garante que numero_edital exista (usa external_id como fallback)
  const normalizadas = licitacoes.map(l => ({
    ...l,
    numero_edital: l.numero_edital ?? l.external_id ?? `${l.fonte}-${Date.now()}-${Math.random()}`,
    // cidade aceita tanto cidade quanto municipio
    cidade: l.cidade ?? l.municipio ?? null,
    // limpa campos extras que não existem na tabela
    external_id: undefined,
    municipio: undefined,
    titulo: undefined,
  }))

  // upsert: atualiza url, valor, datas se já existir (fonte + numero_edital são unique)
  const { data, error } = await supabase
    .from('licitacoes')
    .upsert(normalizadas, { onConflict: 'fonte,numero_edital', ignoreDuplicates: false })
    .select('id')

  if (error) {
    console.error('Erro ao salvar licitações:', error.message)
    return 0
  }

  return data?.length ?? 0
}
