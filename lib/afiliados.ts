import type { SupabaseClient } from '@supabase/supabase-js'

// Normaliza um texto para uso como código de link.
export function slugCodigo(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

export type RefResolvido =
  | { tipo: 'afiliado'; vinculoId: string; afiliadoId: string; campanhaId: string; urlDestino: string | null }
  | { tipo: 'campanha'; campanhaId: string; urlDestino: string | null }

/**
 * Resolve um código de rastreio (/r/CODIGO ou ?ref=CODIGO) para uma atribuição.
 * Procura primeiro em afiliado_campanhas (rastreio por afiliado), depois em campanhas
 * (canais sem afiliado: meta, google, captacao-email…). Usa service_role (RLS fechada).
 * Retorna null se não encontrar ou a campanha estiver inativa.
 */
export async function resolverRef(admin: SupabaseClient, codigo: string): Promise<RefResolvido | null> {
  const cod = String(codigo).trim()
  if (!cod) return null

  const { data: vinculo } = await admin
    .from('afiliado_campanhas')
    .select('id, afiliado_id, campanha_id, campanha:campanhas(ativo, url_destino)')
    .eq('codigo', cod)
    .maybeSingle()

  if (vinculo) {
    const camp = (vinculo.campanha as unknown) as { ativo: boolean; url_destino: string | null } | null
    if (!camp?.ativo) return null
    return {
      tipo: 'afiliado',
      vinculoId: vinculo.id,
      afiliadoId: vinculo.afiliado_id,
      campanhaId: vinculo.campanha_id,
      urlDestino: camp.url_destino,
    }
  }

  const { data: campanha } = await admin
    .from('campanhas')
    .select('id, ativo, url_destino')
    .eq('codigo', cod)
    .maybeSingle()

  if (campanha?.ativo) {
    return { tipo: 'campanha', campanhaId: campanha.id, urlDestino: campanha.url_destino }
  }
  return null
}

/**
 * Gera um código único para um vínculo afiliado↔campanha a partir de uma base
 * (ex: "campanha-nomeafiliado"). Confere colisão tanto em afiliado_campanhas quanto
 * em campanhas (para não ambiguar o /r). Acrescenta sufixo numérico se necessário.
 */
export async function gerarCodigoUnico(admin: SupabaseClient, base: string): Promise<string> {
  const raiz = slugCodigo(base) || 'afiliado'
  for (let i = 0; i < 50; i++) {
    const cand = i === 0 ? raiz : `${raiz}-${i + 1}`
    const [{ data: emVinculo }, { data: emCampanha }] = await Promise.all([
      admin.from('afiliado_campanhas').select('id').eq('codigo', cand).maybeSingle(),
      admin.from('campanhas').select('id').eq('codigo', cand).maybeSingle(),
    ])
    if (!emVinculo && !emCampanha) return cand
  }
  // fallback improvável: sufixo por timestamp
  return `${raiz}-${Math.floor(Math.random() * 1e6)}`
}
