import { createAdminClient } from '@/lib/supabase/server'

/**
 * Helper de autenticação para rotas de cron.
 *
 * Aceita duas formas de autenticação:
 *  1. `Authorization: Bearer <CRON_SECRET>` — usado pelo Vercel cron scheduler
 *  2. `X-Cron-Secret: <CRON_SECRET>` — usado pelo /api/admin/trigger (header
 *     customizado para evitar que o Vercel remova o Authorization em chamadas
 *     server-to-server internas)
 */
export function verificarCronAuth(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false

  const auth    = request.headers.get('authorization')
  const xSecret = request.headers.get('x-cron-secret')

  return auth === `Bearer ${cronSecret}` || xSecret === cronSecret
}

/**
 * Retorna true se o sistema estiver pausado para manutenção.
 * Cada cron deve chamar isso após verificarCronAuth e retornar 503 se pausado.
 */
export async function sistemaPausado(): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'crons_bloqueados')
      .maybeSingle()
    return data?.valor === true || data?.valor === 'true'
  } catch {
    return false
  }
}
