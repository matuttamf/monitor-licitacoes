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

  // 1. Verifica quais já existem (para contar novas inserções)
  const chaves = normalizadas.map(l => `${l.fonte}__${l.numero_edital}`)
  const { count: existentes } = await supabase
    .from('licitacoes')
    .select('id', { count: 'exact', head: true })
    .in('numero_edital', normalizadas.map(l => l.numero_edital!))

  // 2. upsert: atualiza url, valor, datas se já existir (fonte + numero_edital são unique)
  const { error } = await supabase
    .from('licitacoes')
    .upsert(normalizadas, { onConflict: 'fonte,numero_edital', ignoreDuplicates: false })

  if (error) {
    console.error('Erro ao salvar licitações:', error.message)
    return 0
  }

  // novas = total upsertado − existentes (aproximação; ignoreDuplicates=false faz update em todos)
  const novas = Math.max(0, normalizadas.length - (existentes ?? 0))
  console.log(`salvarLicitacoes: ${normalizadas.length} processadas, ~${novas} novas, ~${existentes ?? 0} atualizadas`)
  return novas
}
