// Rate limiter in-memory por instância de função (Vercel serverless).
// Suficiente como primeira camada de defesa — não substitui Redis em escala extrema.

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Limpa entradas expiradas periodicamente para não vazar memória
function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

/**
 * Retorna true se a requisição está dentro do limite.
 * @param key     Identificador único (ex: `ip:${ip}:criar` ou `user:${userId}:pausar`)
 * @param limit   Número máximo de requisições na janela
 * @param windowMs Janela de tempo em milissegundos
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}

/** Extrai o IP real da requisição (considera proxy Vercel). */
export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

// Limpeza a cada 100 chamadas para evitar acúmulo
let callCount = 0
export function rateLimitGuard(key: string, limit: number, windowMs: number): boolean {
  if (++callCount % 100 === 0) cleanup()
  return checkRateLimit(key, limit, windowMs)
}
