/**
 * Rastreamento de uso de APIs com limites.
 * Todas as funções são fire-and-forget — nunca bloqueiam o fluxo principal.
 *
 * Serviços rastreados:
 *  google_cse   → 100 queries/dia   (compartilhado licitações + email enrichment)
 *  resend        → 3.000 emails/mês  (free tier)
 *  gemini        → 1.500 calls/dia    (Gemini 2.5 Flash free tier — reseta meia-noite UTC)
 *  enrichment    → 2.000 calls/dia   (minhareceita.org — reseta meia-noite UTC)
 */

import { createClient } from '@supabase/supabase-js'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const hoje = () => new Date().toISOString().slice(0, 10)
const mes  = () => new Date().toISOString().slice(0, 7)

type Servico = 'google_cse' | 'resend' | 'gemini' | 'enrichment'
type Periodo = 'dia' | 'mes'

export async function incrementarUso(servico: Servico, periodo: Periodo = 'dia'): Promise<void> {
  try {
    const p = periodo === 'dia' ? hoje() : mes()
    await getClient().rpc('incrementar_uso_api', { p_servico: servico, p_periodo: p })
  } catch {
    // Nunca bloquear o fluxo principal
  }
}

export async function lerUso(servico: string, periodo: string): Promise<number> {
  try {
    const { data } = await getClient()
      .from('uso_apis')
      .select('contador')
      .eq('servico', servico)
      .eq('periodo', periodo)
      .maybeSingle()
    return (data?.contador as number) ?? 0
  } catch { return 0 }
}

// Atalhos prontos para usar nas rotas
export const trackGoogleCSE   = () => incrementarUso('google_cse', 'dia')
export const trackResend      = () => incrementarUso('resend', 'mes')
export const trackGemini      = () => incrementarUso('gemini', 'dia')
export const trackEnrichment  = () => incrementarUso('enrichment', 'dia')
