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
  // Se CRON_SECRET não configurado, bloqueia sempre (configuração inválida)
  if (!cronSecret) return false

  const auth      = request.headers.get('authorization')
  const xSecret   = request.headers.get('x-cron-secret')

  return auth === `Bearer ${cronSecret}` || xSecret === cronSecret
}
